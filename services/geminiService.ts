import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodAnalysisResult, InventoryItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the food image with advanced metrics.
 */
export const analyzeFoodImage = async (file: File, userAllergies: string[] = []): Promise<FoodAnalysisResult> => {
  try {
    const imagePart = await fileToGenerativePart(file);

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING },
        ripeness: { type: Type.STRING, enum: ["Unripe", "Ripe", "Overripe", "Unknown"] },
        freshness: { type: Type.INTEGER },
        shelf_life_days: { type: Type.INTEGER },
        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        nutrient_degradation: {
          type: Type.OBJECT,
          properties: {
            vitamin_c_loss_percent: { type: Type.INTEGER },
            antioxidant_loss_percent: { type: Type.INTEGER },
          }
        },
        carbon_footprint_saved_kg: { type: Type.NUMBER, description: "Estimated carbon saved by using this food now instead of wasting it." },
        ethical_expiry: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, enum: ["Safe but not tasty", "Consume soon", "Unsafe", "Good"] },
            reason: { type: Type.STRING }
          }
        },
        dehydration_risk: {
          type: Type.OBJECT,
          properties: {
            risk_level: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            advice: { type: Type.STRING }
          }
        },
        allergy_risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List potential allergens if freshness level causes issues (e.g. histamines)." },
        share_suggestion: { type: Type.BOOLEAN, description: "True if item is edible but shelf life is short, suggesting sharing." }
      },
      required: ["item", "ripeness", "freshness", "shelf_life_days", "tips", "ethical_expiry"]
    };

    const allergyContext = userAllergies.length > 0 ? `Flag risks for these allergies: ${userAllergies.join(', ')}.` : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          {
            text: `Analyze this food image. Provide freshness (0-100), ripeness, and shelf life. 
            Estimate nutrient loss based on visual freshness. 
            Calculate ethical expiry status. 
            Check for dehydration signs. 
            ${allergyContext}
            If not food, return 'Unknown'.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image.");
  }
};

/**
 * Analyzes a grocery receipt to extract inventory items.
 */
export const analyzeReceipt = async (file: File): Promise<InventoryItem[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const imagePart = await fileToGenerativePart(file);
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          expiryDate: { type: Type.STRING, description: "Estimated expiry date in YYYY-MM-DD format based on item type." },
          category: { type: Type.STRING, enum: ["Fruit", "Vegetable", "Dairy", "Meat", "Grain", "Other"] }
        },
        required: ["name", "quantity", "category"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: `Extract food items from this receipt. Today is ${today}. Estimate expiry dates starting from today.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const items = JSON.parse(text);
    return items.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      addedDate: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("Failed to parse receipt.");
  }
};

/**
 * Processes voice/text commands for inventory management.
 */
export const processCommand = async (input: string | Blob, currentInventory: InventoryItem[]): Promise<{ text: string; inventoryUpdate?: { action: 'add' | 'remove', items: Partial<InventoryItem>[] } }> => {
   try {
    let parts: any[] = [];
    if (typeof input === 'string') {
        parts.push({ text: input });
    } else {
        const audioBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(input);
        });
        parts.push({ inlineData: { mimeType: "audio/wav", data: audioBase64 } });
    }

    const today = new Date().toISOString().split('T')[0];

    // System instruction to handle inventory commands
    const systemPrompt = `
      You are a smart fridge assistant. Today is ${today}.
      If the user wants to add or remove items from inventory, output JSON with "action" ('add' or 'remove') and "items" list.
      "items" should have name, quantity, and estimated expiryDate (YYYY-MM-DD) for adds.
      Calculate expiry dates based on typical shelf life relative to today (${today}).
      If it's a general question, just return "response_text".
      Current inventory: ${JSON.stringify(currentInventory.map(i => i.name))}
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            response_text: { type: Type.STRING },
            inventory_action: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, enum: ["add", "remove"] },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.STRING },
                                expiryDate: { type: Type.STRING },
                                category: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        },
        required: ["response_text"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const result = JSON.parse(response.text || "{}");
    return {
        text: result.response_text,
        inventoryUpdate: result.inventory_action
    };

   } catch (error) {
       console.error("Command processing error", error);
       return { text: "Sorry, I had trouble understanding that command." };
   }
};

export const getSmartRecommendations = async (inventory: InventoryItem[]): Promise<string[]> => {
    // Quick separate call for purchase planner
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                text: `Based on this fridge inventory: ${JSON.stringify(inventory)}, suggest 3 items to buy next. Consider nutritional balance and common pairings.`
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch {
        return ["Fresh greens", "Seasonal fruits", "Proteins"];
    }
}
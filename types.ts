export interface NutrientLoss {
  vitamin_c_loss_percent: number;
  antioxidant_loss_percent: number;
}

export interface EthicalExpiry {
  label: 'Safe but not tasty' | 'Consume soon' | 'Unsafe' | 'Good';
  reason: string;
}

export interface DehydrationRisk {
  risk_level: 'High' | 'Low' | 'Medium';
  advice: string;
}

export interface FoodAnalysisResult {
  item: string;
  ripeness: 'Unripe' | 'Ripe' | 'Overripe' | 'Unknown';
  freshness: number; // 0-100
  shelf_life_days: number;
  tips: string[];
  nutrient_degradation?: NutrientLoss;
  carbon_footprint_saved_kg?: number;
  ethical_expiry?: EthicalExpiry;
  dehydration_risk?: DehydrationRisk;
  allergy_risks?: string[];
  share_suggestion?: boolean;
  error?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  addedDate: string;
  expiryDate?: string;
  category?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  result: FoodAnalysisResult;
  imageThumbnail: string; // Base64 (compressed or small)
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ScanMode = 'food' | 'receipt';

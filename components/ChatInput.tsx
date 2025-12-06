import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, MessageSquare, Send, Keyboard } from 'lucide-react';
import { processCommand } from '../services/geminiService';
import { InventoryItem } from '../types';

interface ChatInputProps {
  onResponse: (text: string) => void;
  inventory: InventoryItem[];
  onInventoryUpdate: (action: 'add' | 'remove', items: Partial<InventoryItem>[]) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onResponse, inventory, onInventoryUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        handleInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInput = async (input: string | Blob) => {
    setIsProcessing(true);
    try {
      const result = await processCommand(input, inventory);
      onResponse(result.text);
      if (result.inventoryUpdate) {
        onInventoryUpdate(result.inventoryUpdate.action, result.inventoryUpdate.items);
      }
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
      setInputText("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputText.trim()) handleInput(inputText);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
           <MessageSquare className="w-4 h-4 text-slate-400" />
           AI Assistant & Inventory Voice Control
        </h3>
        {isRecording && <span className="text-xs text-red-500 animate-pulse font-medium">● Recording...</span>}
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Try "Add 2 apples to fridge", "Is this good for cake?", or "Remove milk".
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
         <div className="relative flex-grow">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or speak..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <Keyboard className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
         </div>

         {!isRecording ? (
           <button
             type="button"
             onClick={startRecording}
             disabled={isProcessing}
             className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-3 rounded-lg transition-colors"
           >
             <Mic className="w-5 h-5" />
           </button>
         ) : (
           <button
             type="button"
             onClick={stopRecording}
             className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg animate-pulse"
           >
             <Square className="w-5 h-5 fill-current" />
           </button>
         )}

         <button
            type="submit"
            disabled={!inputText || isProcessing}
            className="bg-slate-900 dark:bg-green-600 hover:bg-slate-800 dark:hover:bg-green-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
         >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
         </button>
      </form>
    </div>
  );
};

export default ChatInput;

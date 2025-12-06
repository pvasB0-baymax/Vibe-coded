import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { Trash2, Plus, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { getSmartRecommendations } from '../services/geminiService';

interface InventoryDashboardProps {
  inventory: InventoryItem[];
  onRemoveItem: (id: string) => void;
  onAddItem: (item: InventoryItem) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ inventory, onRemoveItem, onAddItem }) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (inventory.length > 0) {
        setLoadingRecs(true);
        getSmartRecommendations(inventory).then(setRecommendations).finally(() => setLoadingRecs(false));
    }
  }, [inventory.length]); // Simple dependency

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return 'text-slate-500';
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days < 0) return 'text-red-500 font-bold';
    if (days < 3) return 'text-orange-500 font-bold';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Fridge Inventory
        </h2>
        
        {inventory.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                Your fridge is empty. Scan a receipt or use voice to add items.
            </p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-sm">Item</th>
                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-sm">Qty</th>
                            <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400 text-sm">Expiry</th>
                            <th className="pb-3 text-right font-semibold text-slate-600 dark:text-slate-400 text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {inventory.map(item => (
                            <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-3 text-slate-800 dark:text-slate-200 font-medium capitalize">{item.name}</td>
                                <td className="py-3 text-slate-600 dark:text-slate-400 text-sm">{item.quantity}</td>
                                <td className={`py-3 text-sm ${getExpiryStatus(item.expiryDate)}`}>
                                    {item.expiryDate || 'N/A'}
                                </td>
                                <td className="py-3 text-right">
                                    <button 
                                      onClick={() => onRemoveItem(item.id)}
                                      className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Smart Planner */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
         <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Smart Purchase Planner
         </h3>
         {loadingRecs ? (
             <div className="flex gap-2 text-indigo-400 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 delay-150"></div>
             </div>
         ) : (
             <div className="space-y-2">
                 <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">Based on your stock & season, you should buy:</p>
                 <div className="flex flex-wrap gap-2">
                    {recommendations.map((rec, i) => (
                        <span key={i} className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                            + {rec}
                        </span>
                    ))}
                 </div>
             </div>
         )}
      </div>
      
      {/* Family Sync Mock */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800">
         <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white dark:border-slate-800"></div>
                 <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white dark:border-slate-800"></div>
             </div>
             <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Family Mode Active</span>
         </div>
         <span className="text-xs text-green-500 font-bold uppercase tracking-wide">Synced</span>
      </div>
    </div>
  );
};

export default InventoryDashboard;

import React from 'react';
import { AnalysisHistoryItem } from '../types';
import { Calendar } from 'lucide-react';

interface HistoryListProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Scan History</h2>
      {history.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center">No history yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                 {/* Only showing thumbnail if we had one, otherwise placeholder */}
                 <img src={item.imageThumbnail || "data:image/svg+xml;base64,..."} className="w-full h-full object-cover" alt={item.result.item} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white capitalize">{item.result.item}</h3>
                    <span className={`text-xs font-bold ${item.result.freshness > 50 ? 'text-green-500' : 'text-red-500'}`}>{item.result.freshness}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;

import React from 'react';
import { FoodAnalysisResult } from '../types';
import { Clock, ThumbsUp, AlertTriangle, CheckCircle, Info, Leaf, Droplets, Heart, Share2, QrCode } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultCardProps {
  result: FoodAnalysisResult | null;
  isLoading: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 min-h-[400px]">
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Info className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">No Analysis Yet</h3>
        <p className="max-w-xs mt-2 text-sm">Upload an image to see freshness, nutrient loss, and eco-impact.</p>
      </div>
    );
  }

  const getFreshnessColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 50) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const freshnessColor = getFreshnessColor(result.freshness);
  
  const chartData = [
    { name: 'Freshness', value: result.freshness },
    { name: 'Decay', value: 100 - result.freshness },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{result.item}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                ${result.ripeness === 'Ripe' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                  result.ripeness === 'Overripe' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                  result.ripeness === 'Unripe' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {result.ripeness}
              </span>
              {result.ethical_expiry && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border
                    ${result.ethical_expiry.label === 'Good' ? 'border-green-200 text-green-700 dark:text-green-400' : 
                      result.ethical_expiry.label.includes('Unsafe') ? 'border-red-200 text-red-700 dark:text-red-400' : 'border-yellow-200 text-yellow-700 dark:text-yellow-400'}`}>
                    {result.ethical_expiry.label}
                  </span>
              )}
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold" style={{ color: freshnessColor }}>
                {result.freshness}<span className="text-lg text-slate-400 font-medium">/100</span>
             </div>
             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Freshness Score</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
          {/* Chart Section */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{result.freshness}%</span>
                    <p className="text-[10px] text-slate-400 uppercase">Quality</p>
                </div>
             </div>
             <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={freshnessColor} />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center space-y-3">
             <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="bg-blue-200 dark:bg-blue-800 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Shelf Life</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{result.shelf_life_days} Days</p>
                </div>
             </div>
             
             {result.nutrient_degradation && (
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <div className="bg-purple-200 dark:bg-purple-800 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">Nutrient Retention</p>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            Vitamin C: -{result.nutrient_degradation.vitamin_c_loss_percent}% loss
                        </p>
                    </div>
                </div>
             )}
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Carbon Footprint */}
             <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Eco Save</span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{result.carbon_footprint_saved_kg || 0.1} kg</p>
                <p className="text-[10px] text-slate-400">CO2 avoided</p>
             </div>

             {/* Dehydration */}
             <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Moisture</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.dehydration_risk?.risk_level || "Normal"}</p>
                <p className="text-[10px] text-slate-400 truncate">{result.dehydration_risk?.advice || "Keep sealed"}</p>
             </div>

             {/* Allergy Warning */}
             {result.allergy_risks && result.allergy_risks.length > 0 && (
                 <div className="col-span-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Allergy Risk</span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300">{result.allergy_risks.join(', ')}</p>
                 </div>
             )}
        </div>

        {/* Tips Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> Storage Tips
          </h3>
          <ul className="space-y-3">
            {result.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Community Share */}
        {result.share_suggestion && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30 flex items-center justify-between">
                <div>
                    <h4 className="text-yellow-800 dark:text-yellow-200 font-bold text-sm flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share with Community
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Item is edible but expiring soon. Donate?
                    </p>
                </div>
                <button className="bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 text-yellow-800 dark:text-yellow-100 p-2 rounded-lg">
                    <QrCode className="w-6 h-6" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;

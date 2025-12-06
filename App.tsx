import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import ChatInput from './components/ChatInput';
import InventoryDashboard from './components/InventoryDashboard';
import HistoryList from './components/HistoryList';
import CameraCapture from './components/CameraCapture';
import { FoodAnalysisResult, AnalysisStatus, InventoryItem, AnalysisHistoryItem, ScanMode } from './types';
import { analyzeFoodImage, analyzeReceipt } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<'analyze' | 'inventory' | 'history'>('analyze');
  const [darkMode, setDarkMode] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('food');
  const [showCamera, setShowCamera] = useState(false);
  
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);

  // Persistence
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('food_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => {
      const saved = localStorage.getItem('food_history');
      return saved ? JSON.parse(saved) : [];
  });

  // Effects
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('food_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('food_history', JSON.stringify(history));
  }, [history]);

  // Handlers
  const handleFileSelected = async (file: File) => {
    setCurrentFile(file);
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);
    setVoiceResponse(null);

    try {
      if (scanMode === 'food') {
          const data = await analyzeFoodImage(file, ["Peanuts", "Shellfish"]); // Mock user allergies
          setResult(data);
          
          // Save to history (compressed thumbnail logic omitted for brevity, using full file is bad practice but okay for demo constraints)
          const reader = new FileReader();
          reader.onload = () => {
              const base64 = reader.result as string;
              const newHistoryItem: AnalysisHistoryItem = {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString(),
                  result: data,
                  imageThumbnail: base64 // In prod, resize this
              };
              setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10
          };
          reader.readAsDataURL(file);

          setStatus(AnalysisStatus.SUCCESS);
      } else {
          // Receipt Mode
          const items = await analyzeReceipt(file);
          if (items.length > 0) {
              setInventory(prev => [...prev, ...items]);
              setVoiceResponse(`Added ${items.length} items to inventory from receipt.`);
              setCurrentView('inventory');
          } else {
              setErrorMsg("Could not detect items on receipt.");
          }
          setStatus(AnalysisStatus.IDLE); // Reset
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleInventoryUpdate = (action: 'add' | 'remove', items: Partial<InventoryItem>[]) => {
      if (action === 'add') {
          const newItems = items.map(i => ({
              id: crypto.randomUUID(),
              name: i.name || 'Unknown',
              quantity: i.quantity || '1',
              addedDate: new Date().toISOString(),
              expiryDate: i.expiryDate,
              category: i.category
          }));
          setInventory(prev => [...prev, ...newItems]);
      } else {
          // Simple removal by name matching for voice commands
          const namesToRemove = items.map(i => i.name?.toLowerCase());
          setInventory(prev => prev.filter(i => !namesToRemove.includes(i.name.toLowerCase())));
      }
      setCurrentView('inventory');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onCameraClick={() => setShowCamera(true)}
      />

      {showCamera && (
          <CameraCapture 
            onCapture={handleFileSelected} 
            onClose={() => setShowCamera(false)} 
          />
      )}

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'analyze' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                        {scanMode === 'food' ? '1. Upload Food Image' : '1. Scan Receipt'}
                    </h3>
                    <ImageUploader 
                        onImageSelected={handleFileSelected} 
                        isLoading={status === AnalysisStatus.ANALYZING} 
                        onCameraClick={() => setShowCamera(true)}
                        mode={scanMode}
                        setMode={setScanMode}
                    />
                    {errorMsg && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
                        </div>
                    )}
                </div>

                <ChatInput 
                    onResponse={setVoiceResponse} 
                    inventory={inventory}
                    onInventoryUpdate={handleInventoryUpdate}
                />
                
                {voiceResponse && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-fade-in">
                    <h4 className="text-indigo-900 dark:text-indigo-200 font-semibold mb-2 text-sm uppercase tracking-wide">Assistant Says:</h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{voiceResponse}</p>
                </div>
                )}
            </div>

            <div className="lg:col-span-7 h-full min-h-[500px] animate-fade-in delay-75">
                <ResultCard 
                result={result} 
                isLoading={status === AnalysisStatus.ANALYZING} 
                />
            </div>
            </div>
        )}

        {currentView === 'inventory' && (
            <div className="animate-fade-in">
                <InventoryDashboard 
                   inventory={inventory} 
                   onRemoveItem={(id) => setInventory(prev => prev.filter(i => i.id !== id))}
                   onAddItem={(item) => setInventory(prev => [...prev, item])}
                />
            </div>
        )}

        {currentView === 'history' && (
            <div className="animate-fade-in">
                <HistoryList 
                   history={history} 
                   onSelect={(item) => {
                       setResult(item.result);
                       setCurrentView('analyze');
                   }}
                />
            </div>
        )}

      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Food Freshness AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
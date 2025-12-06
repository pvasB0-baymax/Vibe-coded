import React from 'react';
import { Leaf, Moon, Sun, ShoppingBag, History as HistoryIcon, Camera, Search } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentView: 'analyze' | 'inventory' | 'history';
  setCurrentView: (view: 'analyze' | 'inventory' | 'history') => void;
  onCameraClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, currentView, setCurrentView, onCameraClick }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('analyze')}>
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-green-500 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent hidden sm:block">
            Food Freshness AI
          </h1>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
           {/* Direct Camera Button */}
           <button 
            onClick={onCameraClick}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors shadow-sm active:scale-95"
            title="Open Camera"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button 
            onClick={() => setCurrentView('analyze')}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 transition-colors ${currentView === 'analyze' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </button>
          
          <button 
             onClick={() => setCurrentView('inventory')}
             className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 transition-colors ${currentView === 'inventory' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Fridge</span>
          </button>

          <button 
             onClick={() => setCurrentView('history')}
             className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 transition-colors ${currentView === 'history' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
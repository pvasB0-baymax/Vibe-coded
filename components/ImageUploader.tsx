import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Camera, Receipt } from 'lucide-react';
import { ScanMode } from '../types';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  onCameraClick: () => void;
  mode: ScanMode;
  setMode: (mode: ScanMode) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading, onCameraClick, mode, setMode }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode('food')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'food' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          Food Analysis
        </button>
        <button
          onClick={() => setMode('receipt')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${mode === 'receipt' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Receipt className="w-4 h-4" />
          Receipt Scan
        </button>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out
          ${isDragging ? 'border-green-500 bg-green-50 dark:bg-green-900/10 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'}
          ${preview ? 'h-96 border-none bg-slate-900' : 'h-64'}
          flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-sm`}
      >
        {!preview && (
           <input
             type="file"
             accept="image/*"
             onChange={onInputChange}
             disabled={isLoading}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
           />
        )}

        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain z-10" 
            />
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {isLoading && (
               <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                 <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                 <p className="font-medium animate-pulse">
                    {mode === 'food' ? 'Analyzing freshness & nutrients...' : 'Extracting inventory items...'}
                 </p>
               </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Click or Drag to Upload</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto mb-6">
              {mode === 'food' ? 'Analyze fruit, veg, or meals.' : 'Scan a grocery receipt.'}
            </p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onCameraClick(); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 hover:shadow-lg transition-all z-30 relative font-medium active:scale-95"
            >
              <Camera className="w-5 h-5" />
              Use Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
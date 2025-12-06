import React, { useRef, useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      let stream;
      try {
        // Try back camera first (ideal for food scanning)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (e) {
        // Fallback to any available camera (e.g., laptops)
        console.warn("Environment camera not found, falling back to default video input.");
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions or try a different device.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            stopCamera();
            onClose();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/10">
        <button 
          onClick={() => { stopCamera(); onClose(); }}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
          aria-label="Close Camera"
        >
          <X className="w-6 h-6" />
        </button>

        {error ? (
          <div className="h-64 flex flex-col items-center justify-center text-red-400 p-8 text-center gap-3">
            <p className="font-bold text-lg">Camera Unavailable</p>
            <p className="text-sm opacity-80">{error}</p>
            <button 
              onClick={onClose} 
              className="mt-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-[60vh] object-cover bg-neutral-900"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center">
               <div className="flex items-center gap-8">
                   <button 
                      onClick={() => { stopCamera(); startCamera(); }}
                      className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
                      title="Restart Camera"
                   >
                     <RefreshCw className="w-6 h-6" />
                   </button>
                   
                   <button 
                     onClick={capturePhoto}
                     className="group relative w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center bg-transparent transition-all hover:bg-white/10 active:scale-95"
                     aria-label="Capture Photo"
                   >
                     <div className="w-16 h-16 bg-white rounded-full shadow-lg group-hover:scale-95 transition-transform"></div>
                   </button>
                   
                   {/* Empty spacer to balance the layout centered on the capture button */}
                   <div className="w-12 h-12 opacity-0"></div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
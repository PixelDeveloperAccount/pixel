import React from 'react';
import Canvas from '../components/Canvas';
import ColorPalette from '../components/ColorPalette';
import StickerField from '../components/StickerField';
import { useCanvas } from '../context/CanvasContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const HomePage: React.FC = () => {
  // NEW: Get the canvas status and retry function from our context
  const { canvasStatus, loadCanvas } = useCanvas();

  // NEW: This function decides what to show based on the current status
  const renderContent = () => {
    switch (canvasStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white" style={{ backgroundColor: '#333333' }}>
            <img 
              src="/loading/binance-loading-img.gif" 
              alt="Loading..." 
              className="w-32 h-32"
            />
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white" style={{ backgroundColor: '#333333' }}>
            <AlertTriangle className="h-12 w-12 mb-4 text-red-400" />
            <p className="text-xl mb-4">Something went wrong!</p>
            <p className="text-sm text-gray-400 mb-6">Failed to connect, please try again.</p>
            <button
              onClick={loadCanvas} // The retry button calls the loadCanvas function
              className="flex items-center space-x-2 bg-white text-black px-5 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>RETRY</span>
            </button>
          </div>
        );
      case 'success':
        // Only show the main app UI if the connection is successful
        return (
          <>
            <Canvas />
            <ColorPalette />
            <StickerField />
          </>
        );
      default:
        // Fallback case, should not be reached
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default HomePage;
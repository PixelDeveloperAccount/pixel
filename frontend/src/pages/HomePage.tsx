import React from 'react';
import Canvas from '../components/Canvas';
import ColorPalette from '../components/ColorPalette';
import Sidebar from '../components/Sidebar';
import { useCanvas } from '../context/CanvasContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { OrbitProgress } from "react-loading-indicators";

const HomePage: React.FC = () => {
  // NEW: Get the canvas status and retry function from our context
  const { canvasStatus, loadCanvas } = useCanvas();

  // NEW: This function decides what to show based on the current status
  const renderContent = () => {
    switch (canvasStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white" style={{ backgroundColor: '#333333' }}>
            <OrbitProgress dense color="#ffffff" size="medium" text="" textColor="" />
            <p className="text-2xl font-['Jersey_15']">LOADING</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white" style={{ backgroundColor: '#333333' }}>
            <AlertTriangle className="h-12 w-12 mb-4 text-red-400" />
            <p className="text-xl mb-4">CONNECTION FAILURE</p>
            <p className="text-sm text-gray-400 mb-6">The backend might be offline or unreachable.</p>
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
            <Sidebar />
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
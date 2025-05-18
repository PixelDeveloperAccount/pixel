import React from 'react';
import { Timer, MousePointer, Coins } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to PIXEL</h2>
        
        <div className="space-y-4 text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Controls</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Click to place a pixel</li>
              <li>Right-click + drag to pan the canvas</li>
              <li>Scroll to zoom in/out</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Token System</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-indigo-600" />
              <span>PIXEL tokens determine your pixel placement abilities</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>1-999 tokens: 5 pixels, 5 min cooldown</li>
              <li>1,000-4,999 tokens: 10 pixels, 3 min cooldown</li>
              <li>5,000-9,999 tokens: 15 pixels, 2 min cooldown</li>
              <li>10,000+ tokens: 20 pixels, 1 min cooldown</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Cooldown System</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <span>After using all pixels, a cooldown period begins</span>
            </div>
            <p>Your cooldown duration decreases as you hold more PIXEL tokens!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Let's Start!
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
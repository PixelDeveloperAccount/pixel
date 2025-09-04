import React from 'react';
import { Timer, MousePointer, Coins } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans']">Welcome to PIXEL</h2>
        
        <div className="space-y-4 text-gray-600 font-['Pixelify_Sans'] text-lg">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">Controls</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Click to place a pixel</li>
              <li>Right-click + drag to pan the canvas</li>
              <li>Scroll to zoom in/out</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">Token System</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-6 h-6 text-indigo-600" />
              <span>PIXEL tokens determine your pixel placement abilities</span>
            </div>
            <ul className="list-disc list-inside space-y-2">
              <li>0 Tokens: 1 minute cooldown, 5 Pixels</li>
              <li>1 - 50,000 Tokens: 30 second cooldown, 30 Pixels</li>
              <li>50,001 - 300,000 Tokens: 25 second cooldown, 45 Pixels</li>
              <li>300,001 - 1,000,000 Tokens: 15 second cooldown, 70 Pixels</li>
              <li>1,000,000+ Tokens: No cooldown, Infinite Pixels</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">Cooldown System</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-6 h-6 text-orange-600" />
              <span>No cooldown between individual pixel placements</span>
            </div>
            <p>Cooldown only starts when you run out of pixels. Higher token holders get faster cooldowns and more pixels!</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-['Pixelify_Sans'] text-lg"
        >
          Let's Start!
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
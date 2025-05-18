import React from 'react';

interface PixelConfirmationProps {
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const PixelConfirmation: React.FC<PixelConfirmationProps> = ({ 
  x, 
  y, 
  mouseX, 
  mouseY, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div 
      className="fixed bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-2 z-50 animate-fade-in"
      style={{
        top: `${mouseY}px`,
        left: `${mouseX}px`,
        transform: 'translate(10px, 10px)'
      }}
    >
      <p className="text-gray-900 mb-2">Place pixel at ({x}, {y})?</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition-colors"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default PixelConfirmation
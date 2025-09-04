import React, { useState, useEffect } from 'react';
import { Check, X, Timer } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { useWallet } from '../context/WalletContext';

const colors = [
  '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8', '#00a368',
  '#00cc78', '#7eed56', '#009eaa', '#00ccc0', '#2450a4', '#3690ea',
  '#51e9f4', '#6a5cff', '#94b3ff', '#811e9f', '#b44ac0', '#e4abff',
  '#de107f', '#ff99aa', '#6d482f', '#9c6926', '#ffb470', '#000000',
  '#515252', '#898d90', '#d4d7d9', '#ffffff'
];

const ColorPalette: React.FC = () => {
  const { 
    selectedColor, 
    setSelectedColor, 
    isPlacingPixel, 
    setIsPlacingPixel,
    selectedPosition,
    setSelectedPosition,
    placePixel
  } = useCanvas();

  const { 
    decrementPixels, 
    startCooldown, 
    pixelsRemaining,
    isOnCooldown,
    cooldownTimeLeft,
    connected,
    tokenBalance
  } = useWallet();

  // Clear any previously selected color whenever the palette visibility or cooldown overlay changes
  useEffect(() => {
    if (isPlacingPixel || isOnCooldown || !isPlacingPixel) {
      setSelectedColor('');
    }
  }, [isPlacingPixel, isOnCooldown, setSelectedColor]);


  if (!isPlacingPixel) return null;

  const handleConfirm = () => {
    if (selectedPosition && !isOnCooldown) {
      placePixel(selectedPosition.x, selectedPosition.y, selectedColor);
      decrementPixels();
      if (pixelsRemaining <= 1) {
        startCooldown();
      }
    }
  };

  const handleCancel = () => {
    setIsPlacingPixel(false);
    setSelectedPosition(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex-1 flex justify-center relative">
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                disabled={isOnCooldown}
                className={`w-8 h-8 rounded-md transition-all ${
                  selectedColor === color 
                    ? 'ring-2 ring-indigo-600 scale-110' 
                    : 'hover:scale-105'
                } ${color === '#ffffff' ? 'ring-1 ring-gray-200' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => !isOnCooldown && setSelectedColor(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          {isOnCooldown && (!connected || tokenBalance < 5000) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex items-center space-x-2 text-gray-900 font-['Pixelify_Sans'] text-lg">
                <img 
                  src="https://unpkg.com/pixelarticons@1.8.1/svg/clock.svg" 
                  alt="Place" 
                  className="h-6 w-6" 
                />
                <span>{cooldownTimeLeft}s</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {(!isOnCooldown || (connected && tokenBalance >= 5000)) && (
            <button
              onClick={handleConfirm}
              disabled={!selectedPosition || !selectedColor}
              className={`p-3 rounded-full transition-colors ${
                selectedPosition && selectedColor
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <img 
                src="https://unpkg.com/pixelarticons@1.8.1/svg/check.svg" 
                alt="Place" 
                className="h-7 w-7" 
              />
            </button>
          )}
          <button
            onClick={handleCancel}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full transition-colors"
          >
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/close.svg" 
              alt="Place" 
              className="h-7 w-7" 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
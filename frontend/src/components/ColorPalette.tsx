import React, { useEffect } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useWallet } from '../context/WalletContext';
import { useSound } from '../context/SoundContext';

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
    placePixel,
    isEyedropperMode,
    setIsEyedropperMode
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
  const { isMuted } = useSound();

  // Clear any previously selected color whenever the palette visibility or cooldown overlay changes
  useEffect(() => {
    if (isPlacingPixel || isOnCooldown || !isPlacingPixel) {
      setSelectedColor('');
    }
  }, [isPlacingPixel, isOnCooldown, setSelectedColor]);

  // Clear eyedropper mode when placing pixels or on cooldown
  useEffect(() => {
    if (isPlacingPixel || isOnCooldown) {
      setIsEyedropperMode(false);
    }
  }, [isPlacingPixel, isOnCooldown, setIsEyedropperMode]);


  if (!isPlacingPixel) return null;

  const playPixelPaintSound = () => {
    if (isMuted) return; // Don't play sound if muted
    // Sound for confirming/painting a pixel
    const audio = new Audio('/sounds/pixel-confirm1.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Ignore errors if audio fails to play
  };

  const handleConfirm = () => {
    if (selectedPosition && !isOnCooldown) {
      playPixelPaintSound(); // Play paint sound when confirming
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
          <div className="flex items-center gap-2">
            {/* Color Picker Tool */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isOnCooldown) {
                    setIsEyedropperMode(!isEyedropperMode);
                    // Clear selected color when activating eyedropper mode
                    if (!isEyedropperMode) {
                      setSelectedColor('');
                    }
                  }
                }}
                disabled={isOnCooldown}
                className={`w-8 h-8 rounded-md border-2 border-gray-300 cursor-pointer transition-all flex items-center justify-center ${
                  isEyedropperMode
                    ? 'ring-2 ring-indigo-600 scale-110 bg-indigo-50' 
                    : 'hover:scale-105 bg-white'
                } ${isOnCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Color picker tool - click to sample colors from canvas"
                title="Color picker tool - click to sample colors from canvas"
              >
                <img 
                  src="https://unpkg.com/pixelarticons@1.8.1/svg/drop.svg" 
                  alt="Color picker" 
                  className={`h-4 w-4 ${isEyedropperMode ? 'opacity-100' : 'opacity-60'}`}
                />
              </button>
              {isEyedropperMode && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full"></div>
              )}
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Predefined Colors */}
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
                  onClick={() => {
                    if (!isOnCooldown) {
                      setSelectedColor(color);
                      // Clear eyedropper mode when selecting a predefined color
                      setIsEyedropperMode(false);
                    }
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
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
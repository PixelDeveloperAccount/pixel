import React, { createContext, useContext, useState, useEffect } from 'react';

interface Pixel {
  x: number;
  y: number;
  color: string;
}

interface CanvasContextType {
  pixels: Pixel[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  placePixel: (x: number, y: number, color: string) => void;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasSize: number;
  isPlacingPixel: boolean;
  setIsPlacingPixel: (value: boolean) => void;
  selectedPosition: { x: number, y: number } | null;
  setSelectedPosition: (pos: { x: number, y: number } | null) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPlacingPixel, setIsPlacingPixel] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
  const canvasSize = 1000;
  
  useEffect(() => {
    setPosition({
      x: window.innerWidth / 2 - (canvasSize / 2) * scale,
      y: window.innerHeight / 2 - (canvasSize / 2) * scale
    });
  }, []);
  
  const placePixel = (x: number, y: number, color: string) => {
    const existingPixelIndex = pixels.findIndex(
      (pixel) => pixel.x === x && pixel.y === y
    );
    
    if (existingPixelIndex !== -1) {
      const updatedPixels = [...pixels];
      updatedPixels[existingPixelIndex] = { ...updatedPixels[existingPixelIndex], color };
      setPixels(updatedPixels);
    } else {
      setPixels([...pixels, { x, y, color }]);
    }
    
    setIsPlacingPixel(false);
    setSelectedPosition(null);
  };
  
  return (
    <CanvasContext.Provider value={{
      pixels,
      selectedColor,
      setSelectedColor,
      placePixel,
      scale,
      setScale,
      position,
      setPosition,
      canvasSize,
      isPlacingPixel,
      setIsPlacingPixel,
      selectedPosition,
      setSelectedPosition
    }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
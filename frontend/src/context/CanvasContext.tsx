import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

interface CanvasContextType {
  pixels: Pixel[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  placePixel: (x: number, y: number, color: string) => Promise<void>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasSize: number;
  isPlacingPixel: boolean;
  setIsPlacingPixel: (value: boolean) => void;
  selectedPosition: { x: number, y: number } | null;
  setSelectedPosition: (pos: { x: number, y: number } | null) => void;
  totalPixelsPlaced: number;
  startTime: Date;
  favoriteColor: string | null;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const BACKEND_URL = "http://localhost:3001";

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPlacingPixel, setIsPlacingPixel] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [favoriteColor, setFavoriteColor] = useState<string | null>(null);
  const canvasSize = 1000;
  
  // fetch the initial canvas state from the backend
  useEffect(() => {
    async function fetchInitialCanvas() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/canvas`);
        const data = await response.json();
        setPixels(data.pixels || []);
      } catch (error) {
        console.error("Failed to fetch canvas state:", error);
      }
    }
    fetchInitialCanvas();
  }, []);

  // handle WebSocket connection
  useEffect(() => {
    const socket: Socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('✅ Connected to backend via WebSocket');
    });

    socket.on('new_pixel', (newPixel: Pixel) => {
      setPixels(prevPixels => {
        const existingPixelIndex = prevPixels.findIndex(
          (p) => p.x === newPixel.x && p.y === newPixel.y
        );
        if (existingPixelIndex !== -1) {
          const updatedPixels = [...prevPixels];
          updatedPixels[existingPixelIndex] = newPixel;
          return updatedPixels;
        } else {
          return [...prevPixels, newPixel];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    setPosition({
      x: window.innerWidth / 2 - (canvasSize / 2) * scale,
      y: window.innerHeight / 2 - (canvasSize / 2) * scale
    });
  }, []);
  
  const placePixel = async (x: number, y: number, color: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/place-pixel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to place pixel');
      }
      
    } catch (error) {
      console.error("Error placing pixel:", error);
    }

  const colorCounts = pixels.reduce((acc, pixel) => {
      acc[pixel.color] = (acc[pixel.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedColor = Object.entries(colorCounts).reduce((a, b) => 
      (a[1] > b[1] ? a : b))[0];
    
    setFavoriteColor(mostUsedColor);
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
      setSelectedPosition,
      totalPixelsPlaced: pixels.length,
      startTime,
      favoriteColor
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
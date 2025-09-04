import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from "socket.io-client";
import { useWallet } from './WalletContext';
import toast from 'react-hot-toast';

interface Pixel {
  x: number;
  y: number;
  color: string;
  walletAddress?: string | null;
  timestamp?: number | null;
}

// NEW: Define the possible statuses for our canvas data
type CanvasStatus = 'loading' | 'success' | 'error';

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
  // NEW: Expose the canvas status and a retry function to the rest of the app
  canvasStatus: CanvasStatus;
  loadCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress } = useWallet();
  const [pixels, setPixels] = useState<Pixel[]>([]);
  // NEW: State to track the loading/error status of the canvas
  const [canvasStatus, setCanvasStatus] = useState<CanvasStatus>('loading');
  
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPlacingPixel, setIsPlacingPixel] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [favoriteColor, setFavoriteColor] = useState<string | null>(null);
  const canvasSize = 1000;
  
  // NEW: Extracted the fetching logic into a useCallback so we can call it manually to retry
  const loadCanvas = useCallback(async () => {
    setCanvasStatus('loading'); // Set status to loading before the request
    try {
      const response = await fetch(`${BACKEND_URL}/api/canvas`);
      if (!response.ok) {
        // If the server responds with an error (e.g., 500, 503), throw an error
        throw new Error(`Failed to fetch canvas: ${response.statusText}`);
      }
      const data = await response.json();
      setPixels(data.pixels || []);
      setCanvasStatus('success'); // Set status to success after data is fetched
    } catch (error) {
      console.error("Failed to fetch canvas state:", error);
      setCanvasStatus('error'); // Set status to error if the fetch fails
    }
  }, []);

  // useEffect to fetch the initial canvas state when the component mounts
  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  // useEffect to handle WebSocket connection
  useEffect(() => {
    // Only connect WebSocket if the initial canvas load was successful
    if (canvasStatus !== 'success') return;

    const socket: Socket = io(BACKEND_URL);
    socket.on('connect', () => {
      console.log('✅ Connected to backend via WebSocket');
    });
    socket.on('new_pixel', (newPixel: Pixel) => {
      setPixels(prevPixels => {
        const existingPixelIndex = prevPixels.findIndex(p => p.x === newPixel.x && p.y === newPixel.y);
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
  }, [canvasStatus]); // This effect now depends on the canvasStatus
  
  useEffect(() => {
    setPosition({
      x: window.innerWidth / 2 - (canvasSize / 2) * scale,
      y: window.innerHeight / 2 - (canvasSize / 2) * scale
    });
  }, []);
  
  const placePixel = async (x: number, y: number, color: string) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/place-pixel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          color,
          walletAddress,
        }),
      });

      if (response.ok) {
        const newPixel = { x, y, color, walletAddress, timestamp: Date.now() };
        setPixels(prev => [...prev, newPixel]);
        toast.success('Pixel placed successfully!');
      } else {
        toast.error('Failed to place pixel');
      }
    } catch (error) {
      console.error('Error placing pixel:', error);
      toast.error('Error placing pixel');
    }

    const colorCounts = pixels.reduce((acc, pixel) => {
      acc[pixel.color] = (acc[pixel.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedColor = Object.entries(colorCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
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
      favoriteColor,
      canvasStatus,
      loadCanvas
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
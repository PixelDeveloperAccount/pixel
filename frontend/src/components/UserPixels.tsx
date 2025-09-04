import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { useCanvas } from '../context/CanvasContext';

interface UserPixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

const UserPixels: React.FC = () => {
  const { walletAddress, connected } = useWallet();
  const { pixels, startTime } = useCanvas();
  const [userPixels, setUserPixels] = useState<UserPixel[]>([]);
  const [newPixelsCount, setNewPixelsCount] = useState(0);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPixelCountRef = useRef<number>(0);

  // Initial fetch when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      fetchUserPixels();
    } else {
      setUserPixels([]);
    }
  }, [connected, walletAddress]);

  // Auto-refresh functionality
  useEffect(() => {
    if (connected && walletAddress) {
      // Set up auto-refresh interval (every 10 seconds)
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchUserPixels();
      }, 10000); // 10 seconds

      return () => {
        if (autoRefreshIntervalRef.current) {
          clearInterval(autoRefreshIntervalRef.current);
        }
      };
    } else {
      // Clear interval if not connected
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    }
  }, [connected, walletAddress]);

  // Real-time updates when new pixels are placed by the user
  useEffect(() => {
    if (connected && walletAddress) {
      const currentUserPixels = pixels.filter(pixel => pixel.walletAddress === walletAddress);
      const currentPixelCount = currentUserPixels.length;
      
      // If the user has placed new pixels, refresh the log immediately
      if (currentPixelCount > lastPixelCountRef.current) {
        const newPixels = currentPixelCount - lastPixelCountRef.current;
        setNewPixelsCount(newPixels);
        fetchUserPixels();
        lastPixelCountRef.current = currentPixelCount;
        
        // Clear new pixels indicator after 3 seconds
        setTimeout(() => setNewPixelsCount(0), 3000);
      }
    }
  }, [pixels, connected, walletAddress]);

  const fetchUserPixels = async () => {
    if (!walletAddress) return;
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/pixels-by-wallet/${walletAddress}`);
      if (response.ok) {
              const data = await response.json();
      // Sort pixels by timestamp (newest first)
      const sortedPixels = (data.pixels || []).sort((a: UserPixel, b: UserPixel) => b.timestamp - a.timestamp);
      setUserPixels(sortedPixels);
      lastPixelCountRef.current = data.pixels?.length || 0;
      }
    } catch (error) {
      console.error('Error fetching user pixels:', error);
    }
  };


  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Pixels</h3>
        <p className="text-gray-600">Connect your wallet to see your placed pixels</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Pixels</h3>
      </div>
      
      
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          Wallet: {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
        </div>
        {newPixelsCount > 0 && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{newPixelsCount} new pixel{newPixelsCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      {/* Session Start Info */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="flex items-center space-x-2 text-gray-700">
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/clock.svg"
            alt="Session Start"
            className="h-4 w-4"
          />
          <span className="text-sm">Session start:</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{formatTimeSince(startTime)}</span>
      </div>
      
      {/* Total Pixels Info */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <div className="flex items-center space-x-2 text-gray-700">
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg"
            alt="Total Pixels"
            className="h-4 w-4"
          />
          <span className="text-sm">Total pixels:</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{userPixels.length}</span>
      </div>
    </div>
  );
};

export default UserPixels;

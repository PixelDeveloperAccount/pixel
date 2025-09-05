import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { useCanvas } from '../context/CanvasContext';

interface UserColor {
  color: string;
  count: number;
}

const UserColors: React.FC = () => {
  const { walletAddress, connected } = useWallet();
  const { pixels } = useCanvas();
  const [userColors, setUserColors] = useState<UserColor[]>([]);
  const [loading, setLoading] = useState(false);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPixelCountRef = useRef<number>(0);

  // Initial fetch when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      fetchUserColors();
    } else {
      setUserColors([]);
    }
  }, [connected, walletAddress]);

  // Auto-refresh functionality
  useEffect(() => {
    if (connected && walletAddress) {
      // Set up auto-refresh interval (every 10 seconds)
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchUserColors();
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
      
      // If the user has placed new pixels, refresh the colors immediately
      if (currentPixelCount > lastPixelCountRef.current) {
        fetchUserColors();
        lastPixelCountRef.current = currentPixelCount;
      }
    }
  }, [pixels, connected, walletAddress]);

  const fetchUserColors = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/pixels-by-wallet/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        
        // Count colors used by the user
        const colorCounts: Record<string, number> = {};
        data.pixels?.forEach((pixel: any) => {
          colorCounts[pixel.color] = (colorCounts[pixel.color] || 0) + 1;
        });
        
        // Convert to array and sort by count (most used first)
        const colorsArray = Object.entries(colorCounts).map(([color, count]) => ({
          color,
          count
        })).sort((a, b) => b.count - a.count);
        
        setUserColors(colorsArray);
        lastPixelCountRef.current = data.pixels?.length || 0;
      }
    } catch (error) {
      console.error('Error fetching user colors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  // Render shimmer while loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Colors</h3>
          <span className="text-sm text-gray-400">Loading…</span>
        </div>
        <div className="flex justify-between items-center">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="relative w-10 h-10 rounded border-2 border-gray-200 shadow-sm shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  // Only show if user has more than 3 colors
  if (userColors.length <= 3) {
    return null;
  }

  // Get top 5 colors
  const topColors = userColors.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Your Colors</h3>
        <span className="text-sm text-gray-500">{userColors.length} colors used</span>
      </div>
      
      <div className="flex justify-between items-center">
        {topColors.map((colorData, index) => (
          <div 
            key={index} 
            className="relative w-10 h-10 rounded border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            style={{ backgroundColor: colorData.color }}
            title={`${colorData.color.toUpperCase()} - ${colorData.count} pixel${colorData.count > 1 ? 's' : ''}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {colorData.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserColors;

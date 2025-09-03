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
      const response = await fetch(`http://localhost:3001/api/pixels-by-wallet/${walletAddress}`);
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

  // Only show if user has more than 3 colors
  if (userColors.length <= 3) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Your Colors</h3>
        <span className="text-sm text-gray-500">{userColors.length} colors used</span>
      </div>
      
      <div className="space-y-2">
        {userColors.map((colorData, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: colorData.color }}
              />
              <span className="text-sm text-gray-700 font-medium">
                {colorData.color.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {colorData.count} pixel{colorData.count > 1 ? 's' : ''}
              </span>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Most used: <span className="font-medium">{userColors[0]?.color.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default UserColors;

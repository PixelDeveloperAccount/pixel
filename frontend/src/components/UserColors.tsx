import React, { useState, useEffect } from 'react';
import { useBSCWallet } from '../context/BSCWalletContext';
import { useCanvas } from '../context/CanvasContext';

const UserColors: React.FC = () => {
  const { walletAddress, connected } = useBSCWallet();
  const { pixels } = useCanvas();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Get user colors directly from canvas context (real-time)
  const userColors = React.useMemo(() => {
    if (!connected || !walletAddress) return [];
    
    const userPixels = pixels.filter(pixel => pixel.walletAddress === walletAddress);
    
    // Count colors used by the user
    const colorCounts: Record<string, number> = {};
    userPixels.forEach((pixel) => {
      colorCounts[pixel.color] = (colorCounts[pixel.color] || 0) + 1;
    });
    
    // Convert to array and sort by count (most used first)
    return Object.entries(colorCounts).map(([color, count]) => ({
      color,
      count
    })).sort((a, b) => b.count - a.count);
  }, [pixels, connected, walletAddress]);

  // Set hasLoadedOnce when user connects
  useEffect(() => {
    if (connected && walletAddress && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    } else if (!connected) {
      setHasLoadedOnce(false);
    }
  }, [connected, walletAddress, hasLoadedOnce]);

  if (!connected) {
    return null;
  }

  // Render shimmer only during the first load for the current wallet
  if (!hasLoadedOnce) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Your colors</h3>
          <span className="text-sm text-gray-400">Loading…</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            {[...Array(5)].map((_, idx) => (
              <div key={`s1-${idx}`} className="relative w-10 h-10 rounded border-2 border-gray-200 shadow-sm shimmer"></div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            {[...Array(5)].map((_, idx) => (
              <div key={`s2-${idx}`} className="relative w-10 h-10 rounded border-2 border-gray-200 shadow-sm shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only show if user has more than 3 colors
  if (userColors.length <= 3) {
    return null;
  }

  // Get top 10 colors, displayed as two rows of 5
  const topTenColors = userColors.slice(0, 10);
  const firstRow = topTenColors.slice(0, 5);
  const secondRow = topTenColors.slice(5, 10);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Your colors</h3>
        <span className="text-sm text-gray-500">{userColors.length} colors used</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          {firstRow.map((colorData, index) => (
            <div
              key={`row1-${index}`}
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
        {secondRow.length > 0 && (
          <div className="flex justify-between items-center">
            {secondRow.map((colorData, index) => (
              <div
                key={`row2-${index}`}
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
        )}
      </div>
    </div>
  );
};

export default UserColors;

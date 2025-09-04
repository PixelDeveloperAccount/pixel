import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useWallet } from '../context/WalletContext';
import HelpModal from './HelpModal';
import LeaderboardModal from './LeaderboardModal';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    pixels, 
    scale, 
    setScale,
    position,
    setPosition,
    canvasSize,
    isPlacingPixel,
    setIsPlacingPixel,
    selectedPosition,
    setSelectedPosition
  } = useCanvas();
  const { connected } = useWallet();
  
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ x: number, y: number } | null>(null);
  const [clickedPixel, setClickedPixel] = useState<{ x: number, y: number, color: string, walletAddress?: string | null } | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const animationRef = useRef<number>();

  // Sound effects
  const playPixelClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio fails to play
  };

  const boundPosition = (newPosition: { x: number, y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return newPosition;

    const maxPanX = canvas.width;
    const maxPanY = canvas.height;
    const minPanX = -canvasSize * scale;
    const minPanY = -canvasSize * scale;

    return {
      x: Math.min(maxPanX, Math.max(minPanX, newPosition.x)),
      y: Math.min(maxPanY, Math.max(minPanY, newPosition.y))
    };
  };

  const animate = () => {
    if (!targetPosition) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const targetScreenX = centerX - targetPosition.x * scale;
    const targetScreenY = centerY - targetPosition.y * scale;
    
    const dx = targetScreenX - position.x;
    const dy = targetScreenY - position.y;
    
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      setPosition({ x: targetScreenX, y: targetScreenY });
      setTargetPosition(null);
      return;
    }
    
    const newX = position.x + dx * 0.1;
    const newY = position.y + dy * 0.1;
    
    setPosition({ x: newX, y: newY });
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (targetPosition) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition, position]);

  // Close the pixel info modal whenever the color palette (placement mode) opens
  useEffect(() => {
    if (isPlacingPixel) {
      setClickedPixel(null);
    }
  }, [isPlacingPixel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill the entire canvas with the specified background color
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw white border around the grid area
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      position.x - 1,
      position.y - 1,
      canvasSize * scale + 2,
      canvasSize * scale + 2
    );

    // Draw grid background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(position.x, position.y, canvasSize * scale, canvasSize * scale);
    
    // Draw grid lines (grey)
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    const gridSize = scale;

    for (let i = 0; i <= canvasSize; i++) {
      const x = position.x + i * gridSize;
      const y = position.y + i * gridSize;

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(x, position.y);
      ctx.lineTo(x, position.y + canvasSize * scale);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(position.x, y);
      ctx.lineTo(position.x + canvasSize * scale, y);
      ctx.stroke();
    }

    // Draw pixels
    pixels.forEach(pixel => {
      const pixelX = position.x + pixel.x * scale;
      const pixelY = position.y + pixel.y * scale;

      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixelX, pixelY, scale, scale);

      // Draw pixel border
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(pixelX, pixelY, scale, scale);
    });

    // Draw hover position indicator (always visible when hovering)
    if (hoverPosition) {
      const hoverX = position.x + hoverPosition.x * scale;
      const hoverY = position.y + hoverPosition.y * scale;

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverX - 1, hoverY - 1, scale + 2, scale + 2);
    }

    // Draw selected position indicator (solid black)
    if (selectedPosition) {
      const selectedX = position.x + selectedPosition.x * scale;
      const selectedY = position.y + selectedPosition.y * scale;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(selectedX - 1, selectedY - 1, scale + 2, scale + 2);
    }
  }, [pixels, position, scale, selectedPosition, hoverPosition, isPlacingPixel, canvasSize, canvasReady]);

  // Force initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Mark canvas as ready
    setCanvasReady(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setIsDragging(true);
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridX = Math.floor((x - position.x) / scale);
      const gridY = Math.floor((y - position.y) / scale);
      
      if (
        gridX >= 0 && 
        gridX < canvasSize && 
        gridY >= 0 && 
        gridY < canvasSize
      ) {
        // Check if there's a pixel at this position
        const pixel = pixels.find(p => p.x === gridX && p.y === gridY);
        if (!isPlacingPixel) {
          if (pixel) {
            setClickedPixel(pixel);
            playPixelClickSound();
          } else {
            // Show modal for empty cells too
            setClickedPixel({ x: gridX, y: gridY, color: '#ffffff', walletAddress: null });
          }
        }
        
        setTargetPosition({ x: gridX, y: gridY });
        // Always set selected position on click to show solid highlight
        setSelectedPosition({ x: gridX, y: gridY });
        if (isPlacingPixel) {
          playPixelClickSound();
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - startDragPosition.x;
      const dy = e.clientY - startDragPosition.y;
      
      const newPosition = boundPosition({
        x: position.x + dx,
        y: position.y + dy
      });
      
      setPosition(newPosition);
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    } else {
      // Track hover position for cursor display
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridX = Math.floor((x - position.x) / scale);
      const gridY = Math.floor((y - position.y) / scale);
      
      if (
        gridX >= 0 && 
        gridX < canvasSize && 
        gridY >= 0 && 
        gridY < canvasSize
      ) {
        setHoverPosition({ x: gridX, y: gridY });
      } else {
        setHoverPosition(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverPosition(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(50, scale * delta));
    
    if (newScale !== scale) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const worldX = (centerX - position.x) / scale;
      const worldY = (centerY - position.y) / scale;
      
      const newScreenX = centerX - worldX * newScale;
      const newScreenY = centerY - worldY * newScale;
      
      const boundedPosition = boundPosition({
        x: newScreenX,
        y: newScreenY
      });
      
      setPosition(boundedPosition);
      setScale(newScale);
    }
  };

  const handlePlacePixel = () => {
    if (clickedPixel) {
      setTargetPosition({ x: clickedPixel.x, y: clickedPixel.y });
      setIsPlacingPixel(true);
      setSelectedPosition({ x: clickedPixel.x, y: clickedPixel.y });
      setClickedPixel(null); // Hide the popup when entering placement mode
      playPixelClickSound();
    }
  };

  const handleResetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const targetScale = 0.8;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const newX = centerX - (canvasSize / 2) * targetScale;
    const newY = centerY - (canvasSize / 2) * targetScale;
    const boundedPosition = boundPosition({ x: newX, y: newY });
    setPosition(boundedPosition);
    setScale(targetScale);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#333333' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
        <div className="text-base text-gray-900">
          {Math.round(scale * 10) / 10}x
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        <button
          onClick={handleResetView}
          className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors text-gray-900 shadow-lg"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <img 
            src="https://unpkg.com/pixelarticons@1.8.1/svg/zoom-out.svg" 
            alt="Reset zoom" 
            className="h-7 w-7" 
          />
        </button>
        <button
          onClick={() => setShowLeaderboard(true)}
          className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors text-gray-900 shadow-lg"
        >
          <img 
            src="https://unpkg.com/pixelarticons@1.8.1/svg/trophy.svg" 
            alt="Leaderboard" 
            className="h-7 w-7" 
          />
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors text-gray-900 shadow-lg"
        >
          <img 
            src="https://unpkg.com/pixelarticons@1.8.1/svg/info-box.svg" 
            alt="Help" 
            className="h-7 w-7" 
          />
        </button>
      </div>

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <canvas
        ref={canvasRef}
        className={`cursor-${isPlacingPixel ? 'crosshair' : 'default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {clickedPixel && !isPlacingPixel && (
        <div 
          className="fixed bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-6 z-50 text-base min-w-[400px] relative"
          style={{
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto'
          }}
        >
          <button 
            onClick={() => setClickedPixel(null)}
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close"
            title="Close"
          >
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/x.svg" 
              alt="Close" 
              className="h-5 w-5"
            />
          </button>
          <div className="space-y-3">
            {/* Pixel Info */}
            <div className="flex items-center space-x-3">
              {clickedPixel.walletAddress ? (
                <div 
                  className="w-10 h-10 rounded border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: clickedPixel.color }}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded border-2 border-dashed border-gray-300 bg-gray-50"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 text-2xl">
                  Pixel: {clickedPixel.x}, {clickedPixel.y}
                </p>
                {!clickedPixel.walletAddress && (
                  <p className="text-base text-gray-500">
                    Not painted yet
                  </p>
                )}
              </div>
            </div>
            
            {/* Wallet Info */}
            {clickedPixel.walletAddress && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-base text-gray-700">
                  <span className="font-medium">Painted by:</span>
                </p>
                <p className="text-base text-gray-600 font-mono">
                  {clickedPixel.walletAddress.slice(0, 8)}...{clickedPixel.walletAddress.slice(-8)}
                </p>
              </div>
            )}
            
            {/* Place Button */}
            {connected && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handlePlacePixel}
                  className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Place Pixel Here
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isPlacingPixel && (
        <button
          onClick={() => { setIsPlacingPixel(true); setClickedPixel(null); }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 text-lg rounded-lg shadow-lg hover:bg-indigo-700 transition-colors font-['Pixelify_Sans']"
        >
          <img 
          src="https://unpkg.com/pixelarticons@1.8.1/svg/add-box.svg" 
          alt="Place" 
          className="h-7 w-7 filter brightness-0 invert" 
        />
          <span>Place Pixel</span>
        </button>
      )}
    </div>
  );
};

export default Canvas;
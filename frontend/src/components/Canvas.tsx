import React, { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../context/CanvasContext';
import { useWallet } from '../context/WalletContext';
import { MousePointer, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    pixels, 
    selectedColor, 
    scale, 
    setScale,
    position,
    setPosition,
    canvasSize,
    placePixel,
    isPlacingPixel,
    setIsPlacingPixel,
    selectedPosition,
    setSelectedPosition
  } = useCanvas();
  const { connected } = useWallet();
  
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // Draw the white grid area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      position.x,
      position.y,
      canvasSize * scale,
      canvasSize * scale
    );

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    const startX = Math.floor(-position.x / scale);
    const startY = Math.floor(-position.y / scale);
    const endX = Math.ceil((canvas.width - position.x) / scale);
    const endY = Math.ceil((canvas.height - position.y) / scale);

    for (let x = startX; x <= endX; x++) {
      const screenX = position.x + x * scale;
      if (screenX >= position.x && screenX <= position.x + canvasSize * scale) {
        ctx.beginPath();
        ctx.moveTo(screenX, position.y);
        ctx.lineTo(screenX, position.y + canvasSize * scale);
        ctx.stroke();
      }
    }
    
    for (let y = startY; y <= endY; y++) {
      const screenY = position.y + y * scale;
      if (screenY >= position.y && screenY <= position.y + canvasSize * scale) {
        ctx.beginPath();
        ctx.moveTo(position.x, screenY);
        ctx.lineTo(position.x + canvasSize * scale, screenY);
        ctx.stroke();
      }
    }

    // Draw placed pixels
    pixels.forEach(({ x, y, color }) => {
      const screenX = position.x + x * scale;
      const screenY = position.y + y * scale;
      
      if (
        screenX + scale >= position.x && 
        screenX <= position.x + canvasSize * scale && 
        screenY + scale >= position.y && 
        screenY <= position.y + canvasSize * scale
      ) {
        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, scale, scale);
      }
    });
    
    if (hoveredPixel && isPlacingPixel) {
      const screenX = position.x + hoveredPixel.x * scale;
      const screenY = position.y + hoveredPixel.y * scale;
      
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, scale, scale);
    }

    if (selectedPosition) {
      const screenX = position.x + selectedPosition.x * scale;
      const screenY = position.y + selectedPosition.y * scale;
      
      ctx.fillStyle = selectedColor;
      ctx.fillRect(screenX, screenY, scale, scale);
      
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, scale, scale);
    }
  }, [pixels, scale, position, hoveredPixel, selectedPosition, selectedColor, isPlacingPixel, canvasSize]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth;
        canvasRef.current.height = containerRef.current.offsetHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setIsDragging(true);
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0 && isPlacingPixel && hoveredPixel) {
      setSelectedPosition(hoveredPixel);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridX = Math.floor((x - position.x) / scale);
      const gridY = Math.floor((y - position.y) / scale);
      
      if (
        gridX >= 0 && 
        gridX < canvasSize && 
        gridY >= 0 && 
        gridY < canvasSize &&
        x >= position.x &&
        x <= position.x + canvasSize * scale &&
        y >= position.y &&
        y <= position.y + canvasSize * scale
      ) {
        setHoveredPixel({ x: gridX, y: gridY });
      } else {
        setHoveredPixel(null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(50, scale * delta));
    
    if (newScale !== scale) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = (mouseX - position.x) / scale;
      const worldY = (mouseY - position.y) / scale;
      
      const newScreenX = mouseX - worldX * newScale;
      const newScreenY = mouseY - worldY * newScale;
      
      const boundedPosition = boundPosition({
        x: newScreenX,
        y: newScreenY
      });
      
      setPosition(boundedPosition);
      setScale(newScale);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#333333' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
        {hoveredPixel && isPlacingPixel && (
          <div className="text-base text-gray-900 font-['Jersey_15']">
            ({hoveredPixel.x}, {hoveredPixel.y})
          </div>
        )}
        <div className="text-base text-gray-900 font-['Jersey_15']">
          {Math.round(scale * 10) / 10}x
        </div>
      </div>

      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors text-gray-900"
      >
        <HelpCircle className="h-7 w-7" />
      </button>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <canvas
        ref={canvasRef}
        className={`cursor-${isPlacingPixel ? 'crosshair' : 'default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {!isPlacingPixel && (
        <button
          onClick={() => setIsPlacingPixel(true)}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 text-lg rounded-lg shadow-lg hover:bg-indigo-700 transition-colors font-['Jersey_15']"
        >
          <MousePointer className="w-5 h-5" />
          <span>Place Pixel</span>
        </button>
      )}
    </div>
  );
};

export default Canvas;
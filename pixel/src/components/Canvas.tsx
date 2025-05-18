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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startX = Math.floor(-position.x / scale);
    const startY = Math.floor(-position.y / scale);
    const endX = Math.ceil((canvas.width - position.x) / scale);
    const endY = Math.ceil((canvas.height - position.y) / scale);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    for (let x = startX; x <= endX; x++) {
      const screenX = position.x + x * scale;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }
    
    for (let y = startY; y <= endY; y++) {
      const screenY = position.y + y * scale;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }

    pixels.forEach(({ x, y, color }) => {
      const screenX = position.x + x * scale;
      const screenY = position.y + y * scale;
      
      if (
        screenX + scale >= 0 && 
        screenX <= canvas.width && 
        screenY + scale >= 0 && 
        screenY <= canvas.height
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
  }, [pixels, scale, position, hoveredPixel, selectedPosition, selectedColor, isPlacingPixel]);

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
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
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
        gridY < canvasSize
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
    const newScale = Math.max(1, Math.min(50, scale * delta));
    
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
      
      setPosition({
        x: newScreenX,
        y: newScreenY
      });
      setScale(newScale);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/10 text-gray-900 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm z-10">
        {hoveredPixel && isPlacingPixel && (
          <div className="text-sm">
            ({hoveredPixel.x}, {hoveredPixel.y})
          </div>
        )}
        <div className="text-sm">
          {Math.round(scale * 10) / 10}x
        </div>
      </div>

      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-gray-900/10 hover:bg-gray-900/20 transition-colors backdrop-blur-sm text-gray-900"
      >
        <HelpCircle className="h-6 w-6" />
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
      
      {!isPlacingPixel && connected && (
        <button
          onClick={() => setIsPlacingPixel(true)}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <MousePointer className="w-4 h-4" />
          <span>Place Pixel</span>
        </button>
      )}
    </div>
  );
};

export default Canvas;
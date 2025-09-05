import React from 'react';
import { useCanvas } from '../context/CanvasContext';

// Array of your local sticker images
const stickerImages = [
  { src: '/stickers/sticker1.png', alt: 'Sticker 1' },
  { src: '/stickers/sticker2.png', alt: 'Sticker 2' },
  { src: '/stickers/sticker3.png', alt: 'Sticker 3' },
  { src: '/stickers/sticker4.png', alt: 'Sticker 4' },
  { src: '/stickers/sticker5.png', alt: 'Sticker 5' },
  { src: '/stickers/sticker6.png', alt: 'Sticker 6' },
  { src: '/stickers/sticker7.png', alt: 'Sticker 7' },
  { src: '/stickers/sticker8.png', alt: 'Sticker 8' },
  { src: '/stickers/sticker9.png', alt: 'Sticker 9' },
];

// Generate random positions and rotations for stickers in world coordinates
const generateStickerData = () => {
  // Canvas dimensions
  const canvasSize = 1000;
  const minDistanceFromEdge = 300; // Increased buffer from canvas edge
  const minDistanceFromCenter = 400; // Increased distance from canvas center
  const minDistanceBetweenStickers = 120; // Spacing between stickers
  const maxStickersPerSide = 8; // Number of stickers per side
  
  // Calculate world coordinates for gray areas around the canvas
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  const placedStickers: Array<{x: number, y: number, size: number}> = [];
  const allStickers: Array<{src: string, alt: string, position: {x: number, y: number}, rotation: number, size: number, zIndex: number}> = [];
  
  // Generate stickers for each side
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < maxStickersPerSide; i++) {
      const imageIndex = Math.floor(Math.random() * stickerImages.length);
      const image = stickerImages[imageIndex];
      
      let x, y, size;
      let attempts = 0;
      const maxAttempts = 100;
      let distanceFromCenter;
      let validPosition = false;
      
      do {
        size = Math.random() * 80 + 120; // Base size between 120px and 200px
        
        // Generate positions in world coordinates (around the canvas)
        switch (side) {
          case 0: // Top
            x = Math.random() * canvasSize;
            y = -Math.random() * minDistanceFromEdge - 200; // Further from canvas
            break;
          case 1: // Right
            x = canvasSize + Math.random() * minDistanceFromEdge + 200; // Further from canvas
            y = Math.random() * canvasSize;
            break;
          case 2: // Bottom
            x = Math.random() * canvasSize;
            y = canvasSize + Math.random() * minDistanceFromEdge + 200; // Further from canvas
            break;
          case 3: // Left
            x = -Math.random() * minDistanceFromEdge - 200; // Further from canvas
            y = Math.random() * canvasSize;
            break;
          default:
            x = Math.random() * canvasSize;
            y = Math.random() * canvasSize;
        }
        
        // Check if position is too close to center (canvas area)
        distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distanceFromCenter >= minDistanceFromCenter) {
          // Check collision with other stickers
          validPosition = true;
          for (const placed of placedStickers) {
            const distance = Math.sqrt(
              Math.pow(x - placed.x, 2) + Math.pow(y - placed.y, 2)
            );
            if (distance < minDistanceBetweenStickers + (size + placed.size) / 2) {
              validPosition = false;
              break;
            }
          }
        }
        
        attempts++;
      } while ((distanceFromCenter < minDistanceFromCenter || !validPosition) && attempts < maxAttempts);
      
      // Add this sticker to placed stickers for collision detection
      if (validPosition) {
        placedStickers.push({ x, y, size });
        
        allStickers.push({
          ...image,
          position: {
            x: x,
            y: y,
          },
          rotation: Math.random() * 360 - 180, // Random rotation between -180 and 180 degrees
          size: size,
          zIndex: -1, // Very low z-index to stay behind all UI elements
        });
      }
    }
  }
  
  return allStickers;
};

const StickerField: React.FC = () => {
  const { scale, position, canvasSize } = useCanvas();
  const [stickerData, setStickerData] = React.useState(generateStickerData());

  // Regenerate positions on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setStickerData(generateStickerData());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {stickerData.map((sticker, index) => {
        // Transform world coordinates to screen coordinates using canvas transformation
        const screenX = sticker.position.x * scale + position.x;
        const screenY = sticker.position.y * scale + position.y;
        const screenSize = sticker.size * scale;
        
        return (
          <div
            key={`${sticker.alt}-${index}`}
            className="absolute pointer-events-none select-none"
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              transform: `rotate(${sticker.rotation}deg)`,
              width: `${screenSize}px`,
              height: `${screenSize}px`,
              zIndex: sticker.zIndex,
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
            }}
          >
            <img
              src={sticker.src}
              alt={sticker.alt}
              className="w-full h-full object-contain"
            />
          </div>
        );
      })}
    </div>
  );
};

export default StickerField;

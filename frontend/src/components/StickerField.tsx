import React from 'react';
import Sticker from './Sticker';

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
  // Canvas dimensions (assuming 1000x1000 canvas)
  const canvasSize = 1000;
  const minDistanceFromEdge = 50;
  const minDistanceFromCenter = 200; // Distance from canvas center
  const minDistanceBetweenStickers = 80;
  
  // Calculate world coordinates for gray areas around the canvas
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  const placedStickers: Array<{x: number, y: number, size: number}> = [];
  
  return stickerImages.map((image, index) => {
    let x, y, size;
    let attempts = 0;
    const maxAttempts = 200;
    let distanceFromCenter;
    let validPosition = false;
    
    do {
      // Generate positions in world coordinates (around the canvas)
      // Place stickers in the gray areas around the canvas
      const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      
      switch (side) {
        case 0: // Top
          x = Math.random() * canvasSize;
          y = Math.random() * minDistanceFromEdge;
          break;
        case 1: // Right
          x = canvasSize + Math.random() * minDistanceFromEdge;
          y = Math.random() * canvasSize;
          break;
        case 2: // Bottom
          x = Math.random() * canvasSize;
          y = canvasSize + Math.random() * minDistanceFromEdge;
          break;
        case 3: // Left
          x = Math.random() * minDistanceFromEdge;
          y = Math.random() * canvasSize;
          break;
        default:
          x = Math.random() * canvasSize;
          y = Math.random() * canvasSize;
      }
      
      size = Math.random() * 100 + 100; // Bigger: Random size between 100px and 200px
      
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
    }
    
    return {
      ...image,
      position: {
        x: x,
        y: y,
      },
      rotation: Math.random() * 360 - 180, // Random rotation between -180 and 180 degrees
      size: size,
      zIndex: Math.floor(Math.random() * 3) + 1, // Lower z-index to stay behind canvas
    };
  });
};

const StickerField: React.FC = () => {
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
      {stickerData.map((sticker, index) => (
        <div
          key={`${sticker.alt}-${index}`}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${sticker.position.x}px`,
            top: `${sticker.position.y}px`,
            transform: `rotate(${sticker.rotation}deg)`,
            width: `${sticker.size}px`,
            height: `${sticker.size}px`,
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
      ))}
    </div>
  );
};

export default StickerField;

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

// Generate random positions and rotations for stickers with collision detection
const generateStickerData = () => {
  const minDistanceFromEdge = 100;
  const minDistanceFromCenter = 450; // Larger buffer from center to avoid canvas area
  const minDistanceBetweenStickers = 120; // Minimum distance between stickers
  
  // Calculate viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  const placedStickers: Array<{x: number, y: number, size: number}> = [];
  
  return stickerImages.map((image, index) => {
    let top, left, size;
    let attempts = 0;
    const maxAttempts = 200;
    let distanceFromCenter;
    let validPosition = false;
    
    do {
      top = Math.random() * (viewportHeight - minDistanceFromEdge * 2) + minDistanceFromEdge;
      left = Math.random() * (viewportWidth - minDistanceFromEdge * 2) + minDistanceFromEdge;
      size = Math.random() * 100 + 100; // Bigger: Random size between 100px and 200px
      
      // Check if position is too close to center (canvas area)
      distanceFromCenter = Math.sqrt(
        Math.pow(left - centerX, 2) + Math.pow(top - centerY, 2)
      );
      
      if (distanceFromCenter >= minDistanceFromCenter) {
        // Check collision with other stickers
        validPosition = true;
        for (const placed of placedStickers) {
          const distance = Math.sqrt(
            Math.pow(left - placed.x, 2) + Math.pow(top - placed.y, 2)
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
      placedStickers.push({ x: left, y: top, size });
    }
    
    return {
      ...image,
      position: {
        top: `${top}px`,
        left: `${left}px`,
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
        <Sticker
          key={`${sticker.alt}-${index}`}
          src={sticker.src}
          alt={sticker.alt}
          position={sticker.position}
          rotation={sticker.rotation}
          size={sticker.size}
          zIndex={sticker.zIndex}
        />
      ))}
    </div>
  );
};

export default StickerField;

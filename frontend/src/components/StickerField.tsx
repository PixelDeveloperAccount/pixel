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

// Generate random positions and rotations for stickers
const generateStickerData = () => {
  return stickerImages.map((image, index) => {
    // Avoid placing stickers too close to edges and center
    const minDistanceFromEdge = 80;
    const minDistanceFromCenter = 400; // Much larger buffer from center to avoid canvas area
    
    // Calculate viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    let top, left;
    let attempts = 0;
    const maxAttempts = 100;
    let distanceFromCenter;
    
    do {
      top = Math.random() * (viewportHeight - minDistanceFromEdge * 2) + minDistanceFromEdge;
      left = Math.random() * (viewportWidth - minDistanceFromEdge * 2) + minDistanceFromEdge;
      
      // Check if position is too close to center (canvas area)
      distanceFromCenter = Math.sqrt(
        Math.pow(left - centerX, 2) + Math.pow(top - centerY, 2)
      );
      
      attempts++;
    } while (distanceFromCenter < minDistanceFromCenter && attempts < maxAttempts);
    
    return {
      ...image,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      rotation: Math.random() * 360 - 180, // Random rotation between -180 and 180 degrees
      size: Math.random() * 80 + 80, // Much bigger: Random size between 80px and 160px
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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

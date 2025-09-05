import React from 'react';

interface StickerProps {
  src: string;
  alt: string;
  position: {
    top: string;
    left: string;
  };
  rotation: number;
  size: number;
  zIndex?: number;
}

const Sticker: React.FC<StickerProps> = ({ 
  src, 
  alt, 
  position, 
  rotation, 
  size, 
  zIndex = 1 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className="absolute pointer-events-none select-none"
      style={{
        top: position.top,
        left: position.left,
        transform: `rotate(${rotation}deg)`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex,
        filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
      }}
    />
  );
};

export default Sticker;

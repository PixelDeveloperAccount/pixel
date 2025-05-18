import React from 'react';
import Canvas from '../components/Canvas';
import ColorPalette from '../components/ColorPalette';

const HomePage: React.FC = () => {
  return (
    <div className="h-full">
      <Canvas />
      <ColorPalette />
    </div>
  );
};

export default HomePage;
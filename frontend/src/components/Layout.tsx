import React from 'react';
import Sidebar from './Sidebar';
import { useCanvas } from '../context/CanvasContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { canvasStatus } = useCanvas();
  
  return (
    <div className="h-screen bg-gray-900 text-white">
      <Sidebar disabled={canvasStatus === 'loading'} />
      <main className="h-full">
        {children}
      </main>
    </div>
  );
};
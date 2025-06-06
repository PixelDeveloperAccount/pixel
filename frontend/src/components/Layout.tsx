import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="h-full">
        {children}
      </main>
    </div>
  );
};
import React from 'react';
import { Activity, Users } from 'lucide-react';

const StatusBar: React.FC = () => {
  const onlineUsers = 42;
  const pixelsPlaced = 1337;
  
  return (
    <footer className="backdrop-blur-md bg-gray-900/80 border-t border-gray-700 py-3 px-4 text-base text-gray-400">
      <div className="container mx-auto flex justify-between items-center font-['Pixelify_Sans']">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span>Connected</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-1" />
            <span>{onlineUsers} online</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <Activity className="h-5 w-5 mr-1" />
          <span>{pixelsPlaced} pixels placed today</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
import React, { useState, useEffect } from 'react';
import { Coins, MousePointer, Timer } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const UserInfo: React.FC = () => {
  const { 
    connected, 
    tokenBalance,
    pixelsRemaining,
    pixelQuota,
    isOnCooldown,
    cooldownTime
  } = useWallet();

  const [timeLeft, setTimeLeft] = useState(cooldownTime);

  useEffect(() => {
    if (isOnCooldown) {
      setTimeLeft(cooldownTime);
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOnCooldown, cooldownTime]);
  
  if (!connected) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-500 text-lg text-center font-['Pixelify_Sans']">Connect wallet to see your info</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="text-xl font-semibold text-gray-900 font-['Pixelify_Sans']">Your Info</h3>
      
      <div className="space-y-3 font-['Pixelify_Sans'] text-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-900">
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/wallet.svg" 
              alt="Menu" 
              className="h-6 w-6" 
            />
            <span>PIXEL Balance:</span>
          </div>
          <span className="font-medium text-gray-900">{tokenBalance.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-900">
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg" 
              alt="Menu" 
              className="h-6 w-6" 
            />
            <span>Available Pixels:</span>
          </div>
          <span className="font-medium text-gray-900">{pixelsRemaining} / {pixelQuota}</span>
        </div>
        
        {isOnCooldown && (
          <div className="flex items-center justify-center space-x-2 text-orange-600 mt-2">
            <Timer className="h-5 w-5" />
            <span className="font-medium">{timeLeft}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
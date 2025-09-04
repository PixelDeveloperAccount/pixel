import React, { useState, useEffect } from 'react';
import { Coins, MousePointer, Timer } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import ConnectButton from './ConnectButton';

const UserInfo: React.FC = () => {
  const { 
    connected, 
    tokenBalance,
    pixelsRemaining,
    pixelQuota,
    isOnCooldown,
    cooldownTimeLeft
  } = useWallet();
  
  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-xl font-semibold text-gray-900 font-['Pixelify_Sans'] mb-4">Your Info</h3>
        <p className="text-gray-500 text-center font-['Pixelify_Sans'] mb-4">Connect wallet to see your info</p>
        <ConnectButton />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
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
            <span className="font-medium">{cooldownTimeLeft}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
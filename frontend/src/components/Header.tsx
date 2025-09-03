import React from 'react';
import { Palette, MousePointer, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import ConnectButton from './ConnectButton';

const Header: React.FC = () => {
  const { connected, tokenBalance, pixelQuota } = useWallet();

  return (
    <header className="backdrop-blur-md bg-gray-900/80 shadow-md py-3 px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="text-purple-400 h-7 w-7" />
          <h1 className="text-2xl font-bold font-['Pixelify_Sans']">PixelChain</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-4 text-base text-gray-300 font-['Pixelify_Sans']">
            <div className="flex items-center space-x-1">
              <MousePointer className="h-5 w-5" />
              <span>Pixels: {pixelQuota} available</span>
            </div>
            {connected && (
              <div className="flex items-center space-x-1">
                <Wallet className="h-5 w-5" />
                <span>Tokens: {tokenBalance.toLocaleString()}</span>
              </div>
            )}
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
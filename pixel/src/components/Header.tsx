import React from 'react';
import { Palette, MousePointer, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import ConnectButton from './ConnectButton';

const Header: React.FC = () => {
  const { connected } = useWallet();

  return (
    <header className="backdrop-blur-md bg-gray-900/80 shadow-md py-3 px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="text-purple-400 h-6 w-6" />
          <h1 className="text-xl font-bold">PixelChain</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {connected ? (
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <MousePointer className="h-4 w-4" />
                <span>Pixels: 5 available</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wallet className="h-4 w-4" />
                <span>Balance: 100 SOL</span>
              </div>
            </div>
          ) : null}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
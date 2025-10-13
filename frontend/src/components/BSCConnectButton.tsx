import React from 'react';
import { Wallet } from 'lucide-react';
import { useBSCWallet } from '../context/BSCWalletContext';

const BSCConnectButton: React.FC = () => {
  const { connected, walletAddress, connectWallet, disconnectWallet } = useBSCWallet();

  if (connected && walletAddress) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-2">
        <div className="w-full bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 font-['Pixelify_Sans']">
                Connected
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs text-green-600 hover:text-green-800 font-['Pixelify_Sans'] underline"
            >
              Disconnect
            </button>
          </div>
          <div className="mt-1 text-xs text-green-700 font-['Pixelify_Sans'] break-all">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <button
        onClick={connectWallet}
        className="w-full font-['Pixelify_Sans'] flex items-center justify-center space-x-2 px-5 py-3 rounded-lg transition-all text-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Wallet className="h-5 w-5" />
        <span>Connect MetaMask</span>
      </button>
    </div>
  );
};

export default BSCConnectButton;

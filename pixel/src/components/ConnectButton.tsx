import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const ConnectButton: React.FC = () => {
  const { connected, connectWallet, disconnectWallet, walletAddress } = useWallet();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <button
      onClick={connected ? disconnectWallet : connectWallet}
      className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
        connected 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      }`}
    >
      <Wallet className="h-4 w-4" />
      <span>
        {connected 
          ? shortenAddress(walletAddress || '') 
          : 'Connect Wallet'}
      </span>
    </button>
  );
};

export default ConnectButton
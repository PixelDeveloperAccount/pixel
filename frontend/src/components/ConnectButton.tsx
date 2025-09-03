import React from 'react';
import { Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const ConnectButton: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <WalletMultiButton 
        className="w-full  font-['Pixelify_Sans'] flex items-center justify-center space-x-2 px-5 py-3 rounded-lg transition-all text-lg"
        startIcon={<Wallet className="h-5 w-5" />}
      />
    </div>
  );
};

export default ConnectButton;
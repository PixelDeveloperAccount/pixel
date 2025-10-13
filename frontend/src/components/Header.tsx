import React from 'react';
import { Palette, MousePointer, Wallet } from 'lucide-react';
import { useBSCWallet } from '../context/BSCWalletContext';
import { useLanguage } from '../context/LanguageContext';
import BSCConnectButton from './BSCConnectButton';

const Header: React.FC = () => {
  const { connected, tokenBalance, pixelQuota } = useBSCWallet();
  const { t } = useLanguage();

  return (
    <header className="backdrop-blur-md bg-gray-900/80 shadow-md py-3 px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="text-purple-400 h-7 w-7" />
          <h1 className="text-2xl font-bold font-['Pixelify_Sans']">{t('app.pixelchain')}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-4 text-base text-gray-300 font-['Pixelify_Sans']">
            <div className="flex items-center space-x-1">
              <MousePointer className="h-5 w-5" />
              <span>{t('wallet.pixels_available', { count: pixelQuota })}</span>
            </div>
            {connected && (
              <div className="flex items-center space-x-1">
                <Wallet className="h-5 w-5" />
                <span>{t('wallet.bnb', { count: tokenBalance.toFixed(4) })}</span>
              </div>
            )}
          </div>
          <BSCConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
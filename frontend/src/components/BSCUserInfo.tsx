import React, { useState, useEffect } from 'react';
import { Coins, MousePointer, Timer } from 'lucide-react';
import { useBSCWallet } from '../context/BSCWalletContext';
import { useLanguage } from '../context/LanguageContext';
import BSCConnectButton from './BSCConnectButton';

const BSCUserInfo: React.FC = () => {
  const { 
    connected, 
    balance,
    tokenBalance,
    pixelsRemaining,
    pixelQuota,
    isOnCooldown,
    cooldownTimeLeft
  } = useBSCWallet();
  const { t } = useLanguage();
  const [showInfoShimmer, setShowInfoShimmer] = useState(false);

  // Show a brief shimmer on first load after connecting
  useEffect(() => {
    if (connected) {
      setShowInfoShimmer(true);
      const timer = setTimeout(() => setShowInfoShimmer(false), 800);
      return () => clearTimeout(timer);
    } else {
      setShowInfoShimmer(false);
    }
  }, [connected]);
  
  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-xl font-semibold text-gray-900 font-['Pixelify_Sans'] mb-4">{t('user.your_info')}</h3>
        
        <div className="space-y-3 font-['Pixelify_Sans'] text-base mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-900">
              <img 
                src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg" 
                alt="Pixels" 
                className="h-6 w-6" 
              />
              <span>{t('wallet.available_pixels')}</span>
            </div>
            <span className="font-medium text-gray-900">
              {pixelsRemaining} / {pixelQuota === Infinity ? '∞' : pixelQuota}
            </span>
          </div>
          
          {isOnCooldown && (
            <div className="flex items-center justify-center space-x-2 text-orange-600 mt-2">
              <Timer className="h-5 w-5" />
              <span className="font-medium">{cooldownTimeLeft}{t('time.seconds')}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-center font-['Pixelify_Sans'] mb-4">{t('wallet.connect_wallet')}</p>
        <BSCConnectButton />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
      <h3 className="text-xl font-semibold text-gray-900 font-['Pixelify_Sans']">{t('user.your_info')}</h3>
      
      <div className="space-y-3 font-['Pixelify_Sans'] text-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-900">
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/wallet.svg" 
              alt="Wallet" 
              className="h-6 w-6" 
            />
            <span>{t('wallet.bnb_balance')}</span>
          </div>
          {showInfoShimmer ? (
            <span className="inline-block w-16 h-5 rounded shimmer" aria-hidden="true"></span>
          ) : (
            <span className="font-medium text-gray-900">{balance.toFixed(4)}</span>
          )}
        </div>

        {tokenBalance > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-900">
              <img 
                src="https://unpkg.com/pixelarticons@1.8.1/svg/coins.svg" 
                alt="Token" 
                className="h-6 w-6" 
              />
              <span>{t('wallet.token_balance')}</span>
            </div>
            {showInfoShimmer ? (
              <span className="inline-block w-16 h-5 rounded shimmer" aria-hidden="true"></span>
            ) : (
              <span className="font-medium text-gray-900">{tokenBalance.toLocaleString()}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-900">
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg" 
              alt="Pixels" 
              className="h-6 w-6" 
            />
            <span>{t('wallet.available_pixels')}</span>
          </div>
          {showInfoShimmer ? (
            <span className="inline-block w-24 h-5 rounded shimmer" aria-hidden="true"></span>
          ) : (
            <span className="font-medium text-gray-900">
              {pixelsRemaining} / {pixelQuota === Infinity ? '∞' : pixelQuota}
            </span>
          )}
        </div>
        
        {isOnCooldown && (
          <div className="flex items-center justify-center space-x-2 text-orange-600 mt-2">
            <Timer className="h-5 w-5" />
            <span className="font-medium">{cooldownTimeLeft}{t('time.seconds')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BSCUserInfo;

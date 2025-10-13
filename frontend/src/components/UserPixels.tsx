import React, { useState, useEffect } from 'react';
import { useBSCWallet } from '../context/BSCWalletContext';
import { useCanvas } from '../context/CanvasContext';
import { useLanguage } from '../context/LanguageContext';
import BSCConnectButton from './BSCConnectButton';

const UserPixels: React.FC = () => {
  const { t } = useLanguage();
  const { walletAddress, connected } = useBSCWallet();
  const { pixels, startTime } = useCanvas();
  const [showTotalsShimmer, setShowTotalsShimmer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get user pixels directly from canvas context (real-time)
  const userPixels = React.useMemo(() => {
    if (!connected || !walletAddress) return [];
    
    return pixels
      .filter(pixel => pixel.walletAddress === walletAddress)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [pixels, connected, walletAddress]);

  // Show shimmer briefly when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      setShowTotalsShimmer(true);
      const t = setTimeout(() => setShowTotalsShimmer(false), 800);
      return () => clearTimeout(t);
    } else {
      setShowTotalsShimmer(false);
    }
  }, [connected, walletAddress]);

  // Update current time every second for live session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${t('time.days')} ${hours % 24}${t('time.hours')}`;
    if (hours > 0) return `${hours}${t('time.hours')} ${minutes % 60}${t('time.minutes_short')}`;
    if (minutes > 0) return `${minutes}${t('time.minutes_short')} ${seconds % 60}${t('time.seconds_short')}`;
    return `${seconds}${t('time.seconds_short')}`;
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('user.your_pixels')}</h3>
        <p className="text-gray-600">{t('user.connect_wallet_pixels')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('user.your_pixels')}</h3>
      </div>
      
      
      {/* Session Start Info */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="flex items-center space-x-2 text-gray-700">
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/clock.svg"
            alt="Session Start"
            className="h-4 w-4"
          />
          <span className="text-sm">{t('user.session_start')}</span>
        </div>
        {showTotalsShimmer ? (
          <span className="inline-block w-16 h-4 rounded shimmer" aria-hidden="true"></span>
        ) : (
          <span className="text-sm font-medium text-gray-900">{formatTimeSince(startTime)}</span>
        )}
      </div>
      
      {/* Total Pixels Info */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded mb-3">
        <div className="flex items-center space-x-2 text-gray-700">
          <img
            src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg"
            alt="Total Pixels"
            className="h-4 w-4"
          />
          <span className="text-sm">{t('user.total_pixels')}</span>
        </div>
        {showTotalsShimmer ? (
          <span className="inline-block w-10 h-4 rounded shimmer" aria-hidden="true"></span>
        ) : (
          <span className="text-sm font-medium text-gray-900">{userPixels.length}</span>
        )}
      </div>
      
      {/* Connect Button */}
      <BSCConnectButton />
    </div>
  );
};

export default UserPixels;

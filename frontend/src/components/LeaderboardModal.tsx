import React, { useState } from 'react';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useLanguage } from '../context/LanguageContext';

interface LeaderboardModalProps {
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pixels');
  const [activeTimeframe, setActiveTimeframe] = useState('alltime');
  const { 
    leaderboards, 
    loadingMap, 
    hasLoadedOnceMap, 
    secondsSinceUpdate,
    refreshLeaderboardWithTimeframe
  } = useLeaderboard();

  const tabs = [
    { 
      id: 'pixels', 
      name: t('leaderboard.pixels'), 
      icon: () => <img src="https://unpkg.com/pixelarticons@1.8.1/svg/checkbox-on.svg" alt="Pixels" className="h-5 w-5" />, 
      description: t('leaderboard.total_pixels_per_user') 
    },
    { 
      id: 'colours', 
      name: t('leaderboard.colors'), 
      icon: () => <img src="https://unpkg.com/pixelarticons@1.8.1/svg/paint-bucket.svg" alt="Colours" className="h-5 w-5" />, 
      description: t('leaderboard.most_used_colors') 
    },
    { 
      id: 'territory', 
      name: t('leaderboard.territory'), 
      icon: () => <img src="https://unpkg.com/pixelarticons@1.8.1/svg/map.svg" alt="Territory" className="h-5 w-5" />, 
      description: t('leaderboard.most_pixels_linked') 
    },
    { 
      id: 'timeplayed', 
      name: t('leaderboard.time_played'), 
      icon: () => <img src="https://unpkg.com/pixelarticons@1.8.1/svg/clock.svg" alt="Time Played" className="h-5 w-5" />, 
      description: t('leaderboard.longest_time_spent') 
    }
  ];

  const timeframes = [
    { id: 'alltime', name: t('leaderboard.alltime') },
    { id: 'today', name: t('leaderboard.today') },
    { id: 'week', name: t('leaderboard.weekly') },
    { id: 'month', name: t('leaderboard.monthly') }
  ];


  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'timeplayed':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        if (hours > 0) {
          return `${hours}${t('time.hours')} ${minutes}${t('time.minutes_short')}`;
        }
        return `${minutes}${t('time.minutes_short')}`;
      case 'territory':
        return `${value.toLocaleString()} ${t('leaderboard.pixels')}`;
      case 'colours':
        return `${value.toLocaleString()} ${t('leaderboard.pixels')}`;
      default:
        return value.toLocaleString();
    }
  };

  const getValueLabel = (type: string) => {
    switch (type) {
      case 'timeplayed':
        return t('leaderboard.time_played_label');
      case 'territory':
        return t('leaderboard.territory_size');
      case 'colours':
        return t('leaderboard.times_used');
      default:
        return t('leaderboard.pixels_painted');
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="text-2xl">
          🥇
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="text-2xl">
          🥈
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="text-2xl">
          🥉
        </span>
      );
    } else {
      return (
        <span className="text-lg font-bold text-gray-400">
          {rank}
        </span>
      );
    }
  };

  const formatTimeSinceUpdate = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} ${t('leaderboard.seconds_ago')}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes} ${minutes !== 1 ? t('leaderboard.minutes_ago') : t('leaderboard.minute_ago')}`;
    }
    
    return `${minutes} ${minutes !== 1 ? t('leaderboard.minutes_ago') : t('leaderboard.minute_ago')} ${remainingSeconds} ${remainingSeconds !== 1 ? t('leaderboard.seconds_ago_plural') : t('leaderboard.second_ago')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 font-['Pixelify_Sans'] flex items-center space-x-3">
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/chart.svg" 
              alt="Leaderboard" 
              className="h-8 w-8"
            />
            <span>{t('leaderboard.title')}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close"
            title="Close"
          >
            <img 
              src="https://unpkg.com/pixelarticons@1.8.1/svg/close.svg" 
              alt="Close" 
              className="h-5 w-5"
            />
          </button>
        </div>

        {/* Main Category Navigation - Big Bar */}
        <div className="flex w-full mb-4 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors font-['Pixelify_Sans'] ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <tab.icon />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Navigation - Small Tabs */}
        <div className="flex gap-1 mb-6">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              onClick={() => setActiveTimeframe(timeframe.id)}
              className={`px-3 py-1 text-sm rounded transition-colors font-['Pixelify_Sans'] ${
                activeTimeframe === timeframe.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeframe.name}
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        <div className="overflow-y-auto max-h-[400px]">
          <div className="space-y-2">
            {(!hasLoadedOnceMap[activeTab] && loadingMap[activeTab]) && (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 text-center">
                      <div className="h-6 w-6 rounded shimmer mx-auto"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded shimmer ${activeTab === 'colours' ? '' : 'rounded-full'}`}></div>
                      <div className="w-28 h-4 rounded shimmer"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-5 rounded shimmer ml-auto"></div>
                    <div className="w-20 h-3 rounded shimmer mt-1 ml-auto"></div>
                  </div>
                </div>
              ))
            )}
            {leaderboards[activeTab]?.[activeTimeframe]?.map((entry) => (
              <div
                key={entry.walletAddress}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 text-center">
                    {getRankDisplay(entry.rank)}
                  </div>
                  <div className="flex items-center space-x-3">
                    {activeTab === 'colours' ? (
                      <div 
                        className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: entry.walletAddress }}
                        title={`Color: ${entry.walletAddress}`}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {entry.walletAddress.slice(2, 4).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 font-['Pixelify_Sans'] text-sm">
                        {activeTab === 'colours' ? `Color #${entry.walletAddress}` : formatWalletAddress(entry.walletAddress)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 font-['Pixelify_Sans']">
                    {formatValue(entry.value, activeTab)}
                  </p>
                  <p className="text-xs text-gray-500">{getValueLabel(activeTab)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center font-['Pixelify_Sans']">
{t('leaderboard.updates_every_10_minutes')} • {t('leaderboard.last_updated')} {formatTimeSinceUpdate(secondsSinceUpdate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;

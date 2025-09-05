import React, { useState, useEffect } from 'react';
import { Palette, Clock, Map } from 'lucide-react';

interface LeaderboardEntry {
  walletAddress: string;
  value: number;
  rank: number;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('pixels');
  const [activeTimeframe, setActiveTimeframe] = useState('today');
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({
    pixels: [],
    colours: [],
    territory: [],
    timeplayed: []
  });
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({
    pixels: true,
    colours: true,
    territory: true,
    timeplayed: true
  });
  const [hasLoadedOnceMap, setHasLoadedOnceMap] = useState<Record<string, boolean>>({
    pixels: false,
    colours: false,
    territory: false,
    timeplayed: false
  });

  const tabs = [
    { id: 'pixels', name: 'Pixels', icon: Palette, description: 'Total pixels per user' },
    { id: 'colours', name: 'Colours', icon: Palette, description: 'Overall most used colours on canvas' },
    { id: 'territory', name: 'Territory', icon: Map, description: 'Most pixels linked together per user' },
    { id: 'timeplayed', name: 'Time Played', icon: Clock, description: 'Longest time spent on canvas' }
  ];

  const timeframes = [
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'Week' },
    { id: 'month', name: 'Month' },
    { id: 'alltime', name: 'All time' }
  ];

  // Fetch leaderboard data from backend
  useEffect(() => {
    const fetchLeaderboard = async (type: string) => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        setLoadingMap(prev => ({ ...prev, [type]: true }));
        const response = await fetch(`${backendUrl}/api/leaderboard/${type}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboards(prev => ({
            ...prev,
            [type]: data.leaderboard || []
          }));
          setHasLoadedOnceMap(prev => ({ ...prev, [type]: true }));
        }
      } catch (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
        // Fallback to empty array if fetch fails
        setLeaderboards(prev => ({
          ...prev,
          [type]: []
        }));
      }
      finally {
        setLoadingMap(prev => ({ ...prev, [type]: false }));
      }
    };

    // Fetch all leaderboard types
    const types = ['pixels', 'colours', 'territory', 'timeplayed'];
    types.forEach(type => fetchLeaderboard(type));
  }, []);

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'timeplayed':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      case 'territory':
        return `${value.toLocaleString()} pixels`;
      case 'colours':
        return `${value} colours`;
      default:
        return value.toLocaleString();
    }
  };

  const getValueLabel = (type: string) => {
    switch (type) {
      case 'timeplayed':
        return 'Time played';
      case 'territory':
        return 'Territory size';
      case 'colours':
        return 'Colours used';
      default:
        return 'Pixels painted';
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <img 
          src="https://unpkg.com/pixelarticons@1.8.1/svg/medal.svg" 
          alt="Gold Medal" 
          className="h-6 w-6 mx-auto"
          style={{ filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.2)' }}
        />
      );
    } else if (rank === 2) {
      return (
        <img 
          src="https://unpkg.com/pixelarticons@1.8.1/svg/medal.svg" 
          alt="Silver Medal" 
          className="h-6 w-6 mx-auto"
          style={{ filter: 'grayscale(0.3) brightness(1.1)' }}
        />
      );
    } else if (rank === 3) {
      return (
        <img 
          src="https://unpkg.com/pixelarticons@1.8.1/svg/medal.svg" 
          alt="Bronze Medal" 
          className="h-6 w-6 mx-auto"
          style={{ filter: 'hue-rotate(25deg) saturate(1.2) brightness(0.9)' }}
        />
      );
    } else {
      return (
        <span className="text-lg font-bold text-gray-400">
          {rank}
        </span>
      );
    }
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
            <span>Leaderboard</span>
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
              <tab.icon className="h-5 w-5" />
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
                      <div className="w-8 h-8 rounded-full shimmer"></div>
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
            {leaderboards[activeTab]?.map((entry) => (
              <div
                key={entry.walletAddress}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 text-center">
                    {getRankDisplay(entry.rank)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {entry.walletAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 font-['Pixelify_Sans'] text-sm">
                        {formatWalletAddress(entry.walletAddress)}
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
            Leaderboards update every 5 minutes • Your position: Not ranked yet
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;

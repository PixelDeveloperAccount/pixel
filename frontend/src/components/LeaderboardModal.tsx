import React, { useState, useEffect } from 'react';
import { X, Trophy, Palette, Clock, Map, User, Users, Globe, BarChart3 } from 'lucide-react';

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
    const response = await fetch(`${backendUrl}/api/leaderboard/${type}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboards(prev => ({
            ...prev,
            [type]: data.leaderboard || []
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
        // Fallback to empty array if fetch fails
        setLeaderboards(prev => ({
          ...prev,
          [type]: []
        }));
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 font-['Pixelify_Sans'] flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            <span>Leaderboard</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
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
            {leaderboards[activeTab]?.map((entry) => (
              <div
                key={entry.walletAddress}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-bold text-gray-400 w-8 text-center">
                    {entry.rank}
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

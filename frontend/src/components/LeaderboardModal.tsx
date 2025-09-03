import React, { useState, useEffect } from 'react';
import { X, Trophy, Palette, Clock, Map } from 'lucide-react';

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
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({
    pixels: [],
    colors: [],
    session: [],
    territory: []
  });

  const tabs = [
    { id: 'pixels', name: 'Pixel Masters', icon: Palette, description: 'Most pixels placed' },
    { id: 'colors', name: 'Color Artists', icon: Palette, description: 'Most diverse color usage' },
    { id: 'session', name: 'Session Kings', icon: Clock, description: 'Longest active sessions' },
    { id: 'territory', name: 'Land Lords', icon: Map, description: 'Largest territories claimed' }
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
    const types = ['pixels', 'colors', 'session', 'territory'];
    types.forEach(type => fetchLeaderboard(type));
  }, []);

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'session':
        return `${Math.floor(value / 60)}m ${value % 60}s`;
      case 'territory':
        return `${value} pixels`;
      case 'colors':
        return `${value} colors`;
      default:
        return value.toString();
    }
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
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span>Leaderboards</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-['Pixelify_Sans'] ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Description */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-['Pixelify_Sans'] text-lg">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Leaderboard Content */}
        <div className="overflow-y-auto max-h-[400px]">
          <div className="space-y-3">
            {leaderboards[activeTab]?.map((entry) => (
              <div
                key={entry.walletAddress}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400 w-12 text-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {entry.walletAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 font-['Pixelify_Sans']">
                        {entry.walletAddress}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rank #{entry.rank}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 font-['Pixelify_Sans']">
                    {formatValue(entry.value, activeTab)}
                  </p>
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

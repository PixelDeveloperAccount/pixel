import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  walletAddress: string;
  value: number;
  rank: number;
}

interface LeaderboardData {
  pixels: Record<string, LeaderboardEntry[]>;
  colours: Record<string, LeaderboardEntry[]>;
  territory: Record<string, LeaderboardEntry[]>;
  timeplayed: Record<string, LeaderboardEntry[]>;
  [key: string]: Record<string, LeaderboardEntry[]>;
}

interface LeaderboardContextType {
  leaderboards: LeaderboardData;
  loadingMap: Record<string, boolean>;
  hasLoadedOnceMap: Record<string, boolean>;
  lastUpdateTime: Date | null;
  secondsSinceUpdate: number;
  refreshLeaderboards: () => void;
  refreshLeaderboardWithTimeframe: (timeframe: string) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    pixels: {},
    colours: {},
    territory: {},
    timeplayed: {}
  });
  
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({
    pixels: false,
    colours: false,
    territory: false,
    timeplayed: false
  });
  
  const [hasLoadedOnceMap, setHasLoadedOnceMap] = useState<Record<string, boolean>>({
    pixels: false,
    colours: false,
    territory: false,
    timeplayed: false
  });
  
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch individual leaderboard type (now fetches all timeframes)
  const fetchLeaderboard = useCallback(async (type: string) => {
    try {
      setLoadingMap(prev => ({ ...prev, [type]: true }));
      const response = await fetch(`${BACKEND_URL}/api/leaderboard/${type}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Frontend received ${type} leaderboard data:`, {
          hasLeaderboardsByTimeframe: !!data.leaderboardsByTimeframe,
          timeframes: data.leaderboardsByTimeframe ? Object.keys(data.leaderboardsByTimeframe) : [],
          requestedTimeframe: data.requestedTimeframe,
          currentLeaderboardLength: data.currentLeaderboard?.length || 0
        });
        
        setLeaderboards(prev => ({
          ...prev,
          [type]: data.leaderboardsByTimeframe || {}
        }));
        setHasLoadedOnceMap(prev => ({ ...prev, [type]: true }));
        setLastUpdateTime(new Date());
        setSecondsSinceUpdate(0);
      }
    } catch (error) {
      console.error(`Error fetching ${type} leaderboard:`, error);
      // Fallback to empty object if fetch fails
      setLeaderboards(prev => ({
        ...prev,
        [type]: {}
      }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  // Fetch all leaderboard types
  const fetchAllLeaderboards = useCallback(() => {
    const types = ['pixels', 'colours', 'territory', 'timeplayed'];
    types.forEach(type => fetchLeaderboard(type));
  }, [fetchLeaderboard]);

  // Manual refresh function
  const refreshLeaderboards = useCallback(() => {
    fetchAllLeaderboards();
  }, [fetchAllLeaderboards]);

  // Refresh with specific timeframe (now just refreshes all data)
  const refreshLeaderboardWithTimeframe = useCallback((timeframe: string) => {
    // No need to make API calls - just refresh all data which includes all timeframes
    fetchAllLeaderboards();
  }, [fetchAllLeaderboards]);

  // Initial fetch and setup background refresh
  useEffect(() => {
    // Initial fetch
    fetchAllLeaderboards();
    
    // Set up background refresh every 10 minutes
    const interval = setInterval(fetchAllLeaderboards, 10 * 60 * 1000); // 10 minutes
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchAllLeaderboards]);

  // Set up timer that ticks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);
    setTimerInterval(timer);
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [refreshInterval, timerInterval]);

  return (
    <LeaderboardContext.Provider value={{
      leaderboards,
      loadingMap,
      hasLoadedOnceMap,
      lastUpdateTime,
      secondsSinceUpdate,
      refreshLeaderboards,
      refreshLeaderboardWithTimeframe
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

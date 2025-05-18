import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  connected: boolean;
  walletAddress: string | null;
  balance: number;
  tokenBalance: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  pixelQuota: number;
  pixelsRemaining: number;
  cooldownTime: number;
  isOnCooldown: boolean;
  decrementPixels: () => void;
  startCooldown: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pixelsRemaining, setPixelsRemaining] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const calculateQuota = (balance: number) => {
    return Math.floor(5 + (balance / 10));
  };

  const calculateCooldown = (balance: number) => {
    return Math.max(15, 60 - Math.floor(balance / 10) * 5);
  };

  const connectWallet = () => {
    const randomBalance = Math.floor(Math.random() * 1000) / 10;
    const randomTokens = Math.floor(Math.random() * 1000000);
    const randomAddress = `solana${Math.random().toString(36).substring(2, 15)}`;
    
    setTimeout(() => {
      setConnected(true);
      setWalletAddress(randomAddress);
      setBalance(randomBalance);
      setTokenBalance(randomTokens);
      setPixelsRemaining(calculateQuota(randomBalance));
      setCooldownTime(calculateCooldown(randomBalance));
    }, 500);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setTokenBalance(0);
    setPixelsRemaining(0);
    setIsOnCooldown(false);
  };

  const decrementPixels = () => {
    setPixelsRemaining(prev => Math.max(0, prev - 1));
  };

  const startCooldown = () => {
    if (!isOnCooldown && connected) {
      setIsOnCooldown(true);
      
      let timeLeft = cooldownTime;
      const interval = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(interval);
          setIsOnCooldown(false);
          setPixelsRemaining(calculateQuota(balance));
        }
      }, 1000);
    }
  };

  return (
    <WalletContext.Provider value={{
      connected,
      walletAddress,
      balance,
      tokenBalance,
      connectWallet,
      disconnectWallet,
      pixelQuota: calculateQuota(balance),
      pixelsRemaining,
      cooldownTime,
      isOnCooldown,
      decrementPixels,
      startCooldown
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
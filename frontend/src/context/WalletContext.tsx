import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  useWallet as useSolanaWallet,
  useConnection,
} from '@solana/wallet-adapter-react';

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
  const { publicKey, connected, connect, disconnect } = useSolanaWallet();
  const { connection } = useConnection();

  const walletAddress = publicKey?.toBase58() || null;

  const [balance, setBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0); // not used yet
  const [pixelsRemaining, setPixelsRemaining] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const calculateQuota = (balance: number) => {
    return Math.floor(5 + (balance / 10));
  };

  const calculateCooldown = (balance: number) => {
    return Math.max(15, 60 - Math.floor(balance / 10) * 5);
  };

  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then(lamports => {
        const sol = lamports / 1e9;
        setBalance(sol);
        setPixelsRemaining(calculateQuota(sol));
        setCooldownTime(calculateCooldown(sol));
      });
    }
  }, [connected, publicKey, connection]);

  const connectWallet = () => {
    connect().catch(console.error);
  };

  const disconnectWallet = () => {
    disconnect();
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
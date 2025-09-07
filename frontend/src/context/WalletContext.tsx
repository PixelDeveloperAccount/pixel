import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  useWallet as useSolanaWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

// Replace with your actual token mint
const TOKEN_MINT = '6TdvRoTarRaDWDKisxC23zZhvhERNvFP8d7pG8CvBAGS';

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
  cooldownTimeLeft: number;
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
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pixelsRemaining, setPixelsRemaining] = useState(1);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(5);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const cooldownIntervalRef = useRef<number>();

  // Load cooldown state from localStorage on mount
  useEffect(() => {
    const savedCooldownData = localStorage.getItem('pixel-cooldown');
    if (savedCooldownData && walletAddress) {
      try {
        const { startTime, duration, wallet } = JSON.parse(savedCooldownData);
        // Only restore if it's for the same wallet
        if (wallet === walletAddress) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, duration - elapsed);
          
          if (remaining > 0) {
            // Still on cooldown
            setIsOnCooldown(true);
            setPixelsRemaining(0);
            setCooldownTimeLeft(remaining);
            
            // Start the countdown from where it left off
            let timeLeft = remaining;
            cooldownIntervalRef.current = window.setInterval(() => {
              timeLeft -= 1;
              setCooldownTimeLeft(timeLeft);
              if (timeLeft <= 0) {
                clearCooldown();
                localStorage.removeItem('pixel-cooldown');
                // Use current tokenBalance
                const quota = connected ? calculateQuota(tokenBalance) : 1;
                setPixelsRemaining(quota === Infinity ? Infinity : quota);
              }
            }, 1000);
          } else {
            // Cooldown has expired, clean up
            localStorage.removeItem('pixel-cooldown');
            // Use current tokenBalance
            const quota = connected ? calculateQuota(tokenBalance) : 1;
            setPixelsRemaining(quota === Infinity ? Infinity : quota);
          }
        }
      } catch (error) {
        console.error('Error parsing saved cooldown data:', error);
        localStorage.removeItem('pixel-cooldown');
      }
    }
  }, [walletAddress, connected, tokenBalance, balance]);

  const calculateQuota = (tokens: number) => {
    if (!connected) return 1;
    if (tokens >= 1000000) return Infinity; // Infinite pixels for 1M+ tokens
    if (tokens >= 300001) return 70; // 70 pixels for 300k+ tokens
    if (tokens >= 50001) return 45; // 45 pixels for 50k+ tokens
    if (tokens >= 1) return 30; // 30 pixels for 1+ tokens
    return 5; // 5 pixels for 0 tokens
  };

  const calculateCooldown = (tokens: number) => {
    if (!connected) return 60; // 1 minute for disconnected users
    if (tokens >= 1000000) return 0; // No cooldown for 1M+ tokens
    if (tokens >= 300001) return 15; // 15 seconds for 300k+ tokens
    if (tokens >= 50001) return 25; // 25 seconds for 50k+ tokens
    if (tokens >= 1) return 30; // 30 seconds for 1+ tokens
    return 60; // 1 minute for 0 tokens
  };

  const clearCooldown = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = undefined;
    }
    setIsOnCooldown(false);
    setCooldownTimeLeft(0);
    localStorage.removeItem('pixel-cooldown');
  };

  // Toast notifications for wallet connection/disconnection
  useEffect(() => {
    if (connected && walletAddress) {
      toast.success(`Wallet connected!`, {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontFamily: 'Pixelify Sans, sans-serif',
        },
      });
    }
  }, [connected, walletAddress]);

  useEffect(() => {
    if (connected && publicKey) {
      // Fetch SOL balance
      connection.getBalance(publicKey).then(lamports => {
        const sol = lamports / 1e9;
        setBalance(sol);
      });

      // Fetch token balance from backend
      (async () => {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/api/owns-token/${walletAddress}?mint=${TOKEN_MINT}`);
          const data = await response.json();
          const tokens = data.tokenBalance || 0;
          setTokenBalance(tokens);
          const quota = calculateQuota(tokens);
          setPixelsRemaining(quota === Infinity ? Infinity : quota);
          setCooldownTime(calculateCooldown(tokens));
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setTokenBalance(0);
          setPixelsRemaining(calculateQuota(0));
          setCooldownTime(calculateCooldown(0));
        }
      })();
    }
  }, [connected, publicKey, connection]);

  const connectWallet = () => {
    connect().catch(console.error);
  };

  const disconnectWallet = () => {
    const wasConnected = connected;
    disconnect();
    setPixelsRemaining(1);
    setCooldownTime(60);
    clearCooldown();
    localStorage.removeItem('pixel-cooldown');
    
    if (wasConnected) {
      toast.success('Wallet disconnected!', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontFamily: 'Pixelify Sans, sans-serif',
        },
      });
    }
  };

  const decrementPixels = () => {
    setPixelsRemaining(prev => {
      // If user has infinite pixels, don't decrement
      if (prev === Infinity) {
        return prev;
      }
      const newValue = Math.max(0, prev - 1);
      // Only start cooldown if all pixels are used
      if (newValue === 0) {
        startCooldown();
      }
      return newValue;
    });
  };

  const startCooldown = () => {
    if (!isOnCooldown && walletAddress) {
      setIsOnCooldown(true);
      setCooldownTimeLeft(cooldownTime);
      
      // Save cooldown data to localStorage
      const cooldownData = {
        startTime: Date.now(),
        duration: cooldownTime,
        wallet: walletAddress
      };
      localStorage.setItem('pixel-cooldown', JSON.stringify(cooldownData));
      
      let timeLeft = cooldownTime;
      cooldownIntervalRef.current = window.setInterval(() => {
        timeLeft -= 1;
        setCooldownTimeLeft(timeLeft);
        if (timeLeft <= 0) {
          clearCooldown();
          localStorage.removeItem('pixel-cooldown');
          const quota = connected ? calculateQuota(tokenBalance) : 1;
          setPixelsRemaining(quota === Infinity ? Infinity : quota);
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
      pixelQuota: calculateQuota(tokenBalance),
      pixelsRemaining,
      cooldownTime,
      cooldownTimeLeft,
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
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// BSC Mainnet configuration
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

interface BSCWalletContextType {
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

const BSCWalletContext = createContext<BSCWalletContextType | undefined>(undefined);

export const BSCWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
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
    if (savedCooldownData) {
      try {
        const { endTime, pixelsRemaining: savedPixels } = JSON.parse(savedCooldownData);
        const now = Date.now();
        if (endTime > now) {
          const timeLeft = Math.ceil((endTime - now) / 1000);
          setCooldownTimeLeft(timeLeft);
          setIsOnCooldown(true);
          setPixelsRemaining(savedPixels);
          startCooldownTimer(timeLeft);
        } else {
          localStorage.removeItem('pixel-cooldown');
        }
      } catch (error) {
        console.error('Error parsing cooldown data:', error);
        localStorage.removeItem('pixel-cooldown');
      }
    }
  }, []);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setConnected(true);
          await fetchBalances(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed!', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontFamily: 'Pixelify Sans, sans-serif',
        },
      });
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setConnected(true);
        await fetchBalances(accounts[0]);
        
        toast.success('Wallet connected successfully!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('User rejected the connection request', {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
      } else {
        toast.error('Failed to connect wallet', {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
      }
    }
  };

  const disconnectWallet = () => {
    const wasConnected = connected;
    setConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setTokenBalance(0);
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

  const fetchBalances = async (address: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      
      // Fetch BNB balance
      const bnbBalance = await provider.getBalance(address);
      const bnbFormatted = parseFloat(ethers.formatEther(bnbBalance));
      setBalance(bnbFormatted);

      // Fetch token balance from backend
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/owns-token/${address}`);
        const data = await response.json();
        const tokens = data.tokenBalance || 0;
        setTokenBalance(tokens);
        
        const quota = calculateQuota(tokens);
        setPixelsRemaining(quota === Infinity ? Infinity : quota);
        setCooldownTime(calculateCooldown(tokens));
      } catch (error) {
        console.error('Error fetching token balance from backend:', error);
        // Fallback to BNB balance
        const quota = calculateQuota(bnbFormatted);
        setPixelsRemaining(quota === Infinity ? Infinity : quota);
        setCooldownTime(calculateCooldown(bnbFormatted));
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const calculateQuota = (balance: number): number => {
    if (balance >= 1000) return Infinity;
    if (balance >= 100) return 10;
    if (balance >= 10) return 5;
    if (balance >= 1) return 3;
    return 1;
  };

  const calculateCooldown = (balance: number): number => {
    if (balance >= 1000) return 1;
    if (balance >= 100) return 3;
    if (balance >= 10) return 5;
    if (balance >= 1) return 10;
    return 60;
  };

  const pixelQuota = calculateQuota(tokenBalance);

  const startCooldownTimer = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    
    cooldownIntervalRef.current = window.setInterval(() => {
      setCooldownTimeLeft(prev => {
        if (prev <= 1) {
          setIsOnCooldown(false);
          setPixelsRemaining(pixelQuota === Infinity ? Infinity : pixelQuota);
          clearInterval(cooldownIntervalRef.current);
          localStorage.removeItem('pixel-cooldown');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCooldown = () => {
    if (pixelsRemaining <= 0) {
      setIsOnCooldown(true);
      setCooldownTimeLeft(cooldownTime);
      startCooldownTimer();
      
      // Save cooldown state to localStorage
      const endTime = Date.now() + (cooldownTime * 1000);
      localStorage.setItem('pixel-cooldown', JSON.stringify({
        endTime,
        pixelsRemaining: 0
      }));
    }
  };

  const clearCooldown = () => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
  };

  const decrementPixels = () => {
    if (pixelsRemaining > 0) {
      setPixelsRemaining(prev => prev - 1);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          fetchBalances(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [walletAddress]);

  // Listen for chain changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleChainChanged = (chainId: string) => {
        // BSC Mainnet chain ID is 0x38 (56 in decimal)
        if (chainId !== '0x38') {
          toast.error('Please switch to BSC Mainnet', {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
              fontFamily: 'Pixelify Sans, sans-serif',
            },
          });
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <BSCWalletContext.Provider
      value={{
        connected,
        walletAddress,
        balance,
        tokenBalance,
        connectWallet,
        disconnectWallet,
        pixelQuota,
        pixelsRemaining,
        cooldownTime,
        cooldownTimeLeft,
        isOnCooldown,
        decrementPixels,
        startCooldown,
      }}
    >
      {children}
    </BSCWalletContext.Provider>
  );
};

export const useBSCWallet = () => {
  const context = useContext(BSCWalletContext);
  if (context === undefined) {
    throw new Error('useBSCWallet must be used within a BSCWalletProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

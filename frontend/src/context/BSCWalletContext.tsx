import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useLanguage } from './LanguageContext';
import toast from 'react-hot-toast';

// BSC Mainnet configuration
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

interface BSCWalletContextType {
  connected: boolean;
  walletAddress: string | null;
  balance: number;
  tokenBalance: number;
  connectWallet: (walletType?: string, onError?: () => void) => Promise<void>;
  disconnectWallet: () => void;
  pixelQuota: number;
  pixelsRemaining: number;
  cooldownTime: number;
  cooldownTimeLeft: number;
  isOnCooldown: boolean;
  decrementPixels: () => void;
  startCooldown: () => void;
  hasWallet: boolean;
}

const BSCWalletContext = createContext<BSCWalletContextType | undefined>(undefined);

export const BSCWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pixelsRemaining, setPixelsRemaining] = useState(5);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);
  const cooldownIntervalRef = useRef<number>();
  // Store pre-connection state to restore on disconnect
  const preConnectionStateRef = useRef<{ pixelsRemaining: number; isOnCooldown: boolean; cooldownTimeLeft: number } | null>(null);

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
          startCooldownTimer();
        } else {
          localStorage.removeItem('pixel-cooldown');
        }
      } catch (error) {
        console.error('Error parsing cooldown data:', error);
        localStorage.removeItem('pixel-cooldown');
      }
    }
  }, []);

  // Check wallet availability on mount (but don't auto-connect)
  useEffect(() => {
    checkWalletAvailability();
  }, []);

  const checkWalletAvailability = () => {
    let hasBSCWallet = false;
    
    try {
      // Check for MetaMask - prioritize providers array to avoid Phantom hijacking
      if (window.ethereum && window.ethereum.providers) {
        // Check providers array for MetaMask first
        for (const provider of window.ethereum.providers) {
          if (provider.isMetaMask && !provider.isPhantom) {
            hasBSCWallet = true;
            break;
          }
        }
      }
      if (!hasBSCWallet && window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
        hasBSCWallet = true;
      }
      
      // Check for Trust Wallet
      if (!hasBSCWallet && window.ethereum && window.ethereum.isTrust) {
        hasBSCWallet = true;
      } else if (!hasBSCWallet && window.ethereum && window.ethereum.providers) {
        for (const provider of window.ethereum.providers) {
          if (provider.isTrust) {
            hasBSCWallet = true;
            break;
          }
        }
      }
      
      // Check for Coinbase Wallet
      if (!hasBSCWallet && window.ethereum && window.ethereum.isCoinbaseWallet) {
        hasBSCWallet = true;
      } else if (!hasBSCWallet && window.ethereum && window.ethereum.providers) {
        for (const provider of window.ethereum.providers) {
          if (provider.isCoinbaseWallet) {
            hasBSCWallet = true;
            break;
          }
        }
      }
      
      // Check for Binance Wallet
      if (!hasBSCWallet && window.BinanceChain) {
        hasBSCWallet = true;
      }
    } catch (error) {
      console.log('No BSC wallet detected');
      hasBSCWallet = false;
    }
    
    setHasWallet(hasBSCWallet);
  };

  const connectWallet = async (walletType?: string, onError?: () => void) => {
    let provider = null;

    try {
      console.log(`🔍 Attempting to connect to: ${walletType}`);
      console.log('window.ethereum exists:', !!window.ethereum);
      console.log('window.ethereum.providers:', window.ethereum?.providers);
      console.log('Number of providers:', window.ethereum?.providers?.length);
      
      // Handle different wallet types with explicit provider isolation
      if (walletType === 'metamask') {
        // Strategy: Find MetaMask with preference scoring
        if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
          console.log(`Searching ${window.ethereum.providers.length} providers for MetaMask...`);
          
          let bestMatch = null;
          let bestScore = 0;
          
          for (let i = 0; i < window.ethereum.providers.length; i++) {
            const p = window.ethereum.providers[i];
            const flags = {
              isMetaMask: p.isMetaMask || false,
              isTrust: p.isTrust || false,
              isCoinbaseWallet: p.isCoinbaseWallet || false,
              isPhantom: p.isPhantom || false
            };
            console.log(`Provider ${i} flags:`, flags);
            
            // Score system: positive points for correct wallet, negative for wrong ones
            let score = 0;
            if (flags.isMetaMask) score += 10;
            if (flags.isTrust) score -= 20;  // Trust Wallet hijacking
            if (flags.isPhantom) score -= 20; // Phantom hijacking
            if (flags.isCoinbaseWallet) score -= 5;
            
            console.log(`Provider ${i} score:`, score);
            
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestMatch = p;
              console.log(`New best match at index ${i} with score ${score}`);
            }
          }
          
          if (bestMatch) {
            provider = bestMatch;
            console.log('✅ Found best MetaMask provider with score:', bestScore);
          }
        } 
        
        // Fallback: Check window.ethereum directly
        if (!provider && window.ethereum) {
          const flags = {
            isMetaMask: window.ethereum.isMetaMask || false,
            isTrust: window.ethereum.isTrust || false,
            isPhantom: window.ethereum.isPhantom || false
          };
          console.log('window.ethereum flags:', flags);
          
          // If it claims to be MetaMask, use it (even if other flags are present)
          if (flags.isMetaMask) {
            provider = window.ethereum;
            console.log('✅ Using window.ethereum as MetaMask (direct access)');
          }
        }
      } else if (walletType === 'trust') {
        // Strategy: Find Trust Wallet with scoring
        if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
          console.log(`Searching ${window.ethereum.providers.length} providers for Trust Wallet...`);
          
          let bestMatch = null;
          let bestScore = 0;
          
          for (let i = 0; i < window.ethereum.providers.length; i++) {
            const p = window.ethereum.providers[i];
            const flags = {
              isMetaMask: p.isMetaMask || false,
              isTrust: p.isTrust || false,
              isCoinbaseWallet: p.isCoinbaseWallet || false
            };
            console.log(`Provider ${i} flags:`, flags);
            
            let score = 0;
            if (flags.isTrust) score += 10;
            if (flags.isMetaMask) score -= 5;
            if (flags.isCoinbaseWallet) score -= 5;
            
            console.log(`Provider ${i} score:`, score);
            
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestMatch = p;
            }
          }
          
          if (bestMatch) {
            provider = bestMatch;
            console.log('✅ Found best Trust Wallet provider with score:', bestScore);
          }
        }
        
        // Fallback: Check window.ethereum directly
        if (!provider && window.ethereum && window.ethereum.isTrust) {
          provider = window.ethereum;
          console.log('✅ Using window.ethereum as Trust Wallet');
        }
      } else if (walletType === 'coinbase') {
        // Strategy: Find Coinbase Wallet with scoring
        if (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
          console.log(`Searching ${window.ethereum.providers.length} providers for Coinbase Wallet...`);
          
          let bestMatch = null;
          let bestScore = 0;
          
          for (let i = 0; i < window.ethereum.providers.length; i++) {
            const p = window.ethereum.providers[i];
            const flags = {
              isMetaMask: p.isMetaMask || false,
              isTrust: p.isTrust || false,
              isCoinbaseWallet: p.isCoinbaseWallet || false
            };
            console.log(`Provider ${i} flags:`, flags);
            
            let score = 0;
            if (flags.isCoinbaseWallet) score += 10;
            if (flags.isMetaMask) score -= 5;
            if (flags.isTrust) score -= 5;
            
            console.log(`Provider ${i} score:`, score);
            
            if (score > bestScore && score > 0) {
              bestScore = score;
              bestMatch = p;
            }
          }
          
          if (bestMatch) {
            provider = bestMatch;
            console.log('✅ Found best Coinbase Wallet provider with score:', bestScore);
          }
        }
        
        // Fallback: Check window.ethereum directly
        if (!provider && window.ethereum && window.ethereum.isCoinbaseWallet) {
          provider = window.ethereum;
          console.log('✅ Using window.ethereum as Coinbase Wallet');
        }
      } else if (walletType === 'binance') {
        // Binance Wallet uses a separate global object (best isolation)
        if (window.BinanceChain) {
          provider = window.BinanceChain;
          console.log('✅ Found Binance Wallet');
        }
      } else {
        // Default: try to use the first available BSC-compatible provider
        if (window.ethereum) {
          if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
            // Multiple wallets installed, find a BSC-compatible one
            for (const p of window.ethereum.providers) {
              if (p.isMetaMask || p.isTrust || p.isCoinbaseWallet) {
                provider = p;
                break;
              }
            }
          } else if (window.ethereum.isMetaMask || window.ethereum.isTrust || window.ethereum.isCoinbaseWallet) {
            provider = window.ethereum;
          }
        }
      }

      if (!provider) {
        // Detailed logging for debugging
        console.error(`❌ Failed to find provider for ${walletType}`);
        console.error('window.ethereum:', window.ethereum);
        console.error('window.ethereum.providers:', window.ethereum?.providers);
        console.error('window.BinanceChain:', window.BinanceChain);
        
        // Call the error callback to reset loading state in UI
        if (onError) {
          onError();
        }
        
        const walletName = walletType 
          ? walletType.charAt(0).toUpperCase() + walletType.slice(1) 
          : 'Wallet';
        
        toast.error(`${walletName} not found. Please ensure it is installed and unlocked.`, {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
        return;
      }

      console.log(`✅ Found provider for ${walletType}. Requesting accounts...`);
      
      // Request account access from the SPECIFIC provider we found
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        // Validate that we're actually connected to the right wallet
        console.log(`🔐 Connected account: ${accounts[0]}`);
        
        // Double-check provider identity after connection (type-safe access)
        const providerAny = provider as any;
        const providerCheck = {
          isMetaMask: providerAny.isMetaMask || false,
          isTrust: providerAny.isTrust || false,
          isCoinbaseWallet: providerAny.isCoinbaseWallet || false,
        };
        console.log('Provider identity after connection:', providerCheck);
        
        // Verify we got the correct wallet
        if (walletType === 'metamask' && !providerCheck.isMetaMask) {
          console.error('❌ Expected MetaMask but got different wallet');
          if (onError) onError();
          toast.error('Failed to connect to MetaMask. Please try again.', {
            duration: 3000,
            style: { background: '#EF4444', color: '#fff', fontFamily: 'Pixelify Sans, sans-serif' }
          });
          return;
        }
        if (walletType === 'trust' && !providerCheck.isTrust) {
          console.error('❌ Expected Trust Wallet but got different wallet');
          if (onError) onError();
          toast.error('Failed to connect to Trust Wallet. Please try again.', {
            duration: 3000,
            style: { background: '#EF4444', color: '#fff', fontFamily: 'Pixelify Sans, sans-serif' }
          });
          return;
        }
        if (walletType === 'coinbase' && !providerCheck.isCoinbaseWallet) {
          console.error('❌ Expected Coinbase Wallet but got different wallet');
          if (onError) onError();
          toast.error('Failed to connect to Coinbase Wallet. Please try again.', {
            duration: 3000,
            style: { background: '#EF4444', color: '#fff', fontFamily: 'Pixelify Sans, sans-serif' }
          });
          return;
        }
        
        // Save pre-connection state before upgrading to new tier
        preConnectionStateRef.current = {
          pixelsRemaining,
          isOnCooldown,
          cooldownTimeLeft
        };
        
        setWalletAddress(accounts[0]);
        setConnected(true);
        
        await fetchBalances(accounts[0]);
        
        toast.success(t('network.wallet_connected'), {
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
      
      // Call the error callback to reset loading state in UI
      if (onError) {
        onError();
      }
      
      if (error.code === 4001) {
        toast.error(t('network.connection_rejected'), {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
      } else if (error.code === -32002) {
        toast.error('Connection request already pending. Please check your wallet.', {
          duration: 3000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontFamily: 'Pixelify Sans, sans-serif',
          },
        });
      } else {
        toast.error('Wallet connection failed. Please try again.', {
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
    
    // Restore pre-connection state if it exists
    if (preConnectionStateRef.current) {
      setPixelsRemaining(preConnectionStateRef.current.pixelsRemaining);
      setIsOnCooldown(preConnectionStateRef.current.isOnCooldown);
      if (preConnectionStateRef.current.isOnCooldown) {
        setCooldownTimeLeft(preConnectionStateRef.current.cooldownTimeLeft);
        startCooldownTimer();
      }
      // Clear the saved state after restoring
      preConnectionStateRef.current = null;
    } else {
      // No pre-connection state - this means they connected before placing any pixels
      // or this is a page reload. Reset to base tier defaults.
      setPixelsRemaining(5);
    }
    
    setCooldownTime(60);
    
    if (wasConnected) {
      toast.success(t('network.wallet_disconnected'), {
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
    if (balance >= 1000000) return Infinity;
    if (balance >= 300001) return 70;
    if (balance >= 50001) return 45;
    if (balance >= 1) return 30;
    return 5;
  };

  const calculateCooldown = (balance: number): number => {
    if (balance >= 1000000) return 0;
    if (balance >= 300001) return 15;
    if (balance >= 50001) return 25;
    if (balance >= 1) return 30;
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
          toast.error(t('network.switch_bsc'), {
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
        hasWallet,
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
      isMetaMask?: boolean;
      isTrust?: boolean;
      isCoinbaseWallet?: boolean;
      isPhantom?: boolean;
      providers?: Array<{
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        on: (event: string, callback: (...args: any[]) => void) => void;
        removeListener: (event: string, callback: (...args: any[]) => void) => void;
        isMetaMask?: boolean;
        isTrust?: boolean;
        isCoinbaseWallet?: boolean;
        isPhantom?: boolean;
      }>;
    };
    BinanceChain?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

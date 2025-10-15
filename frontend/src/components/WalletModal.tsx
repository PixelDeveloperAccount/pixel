import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBSCWallet } from '../context/BSCWalletContext';

interface Wallet {
  name: string;
  icon: string;
  connector: () => void;
  isInstalled: boolean;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { connectWallet, hasWallet, connected } = useBSCWallet();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isCheckingWallets, setIsCheckingWallets] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check which wallets are installed with better detection
      const checkWalletInstalled = async (walletType: string): Promise<boolean> => {
        try {
          if (walletType === 'metamask') {
            if (window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
              // Test if MetaMask actually responds
              await window.ethereum.request({ method: 'eth_chainId' });
              return true;
            }
            if (window.ethereum && window.ethereum.providers) {
              for (const provider of window.ethereum.providers) {
                if (provider.isMetaMask && !provider.isPhantom) {
                  try {
                    await provider.request({ method: 'eth_chainId' });
                    return true;
                  } catch (e) {
                    // Provider exists but not working
                  }
                }
              }
            }
            return false;
          } else if (walletType === 'trust') {
            if (window.ethereum && window.ethereum.isTrust) {
              try {
                await window.ethereum.request({ method: 'eth_chainId' });
                return true;
              } catch (e) {
                return false;
              }
            }
            if (window.ethereum && window.ethereum.providers) {
              for (const provider of window.ethereum.providers) {
                if (provider.isTrust) {
                  try {
                    await provider.request({ method: 'eth_chainId' });
                    return true;
                  } catch (e) {
                    // Provider exists but not working
                  }
                }
              }
            }
            return false;
          } else if (walletType === 'coinbase') {
            if (window.ethereum && window.ethereum.isCoinbaseWallet) {
              try {
                await window.ethereum.request({ method: 'eth_chainId' });
                return true;
              } catch (e) {
                return false;
              }
            }
            if (window.ethereum && window.ethereum.providers) {
              for (const provider of window.ethereum.providers) {
                if (provider.isCoinbaseWallet) {
                  try {
                    await provider.request({ method: 'eth_chainId' });
                    return true;
                  } catch (e) {
                    // Provider exists but not working
                  }
                }
              }
            }
            return false;
          } else if (walletType === 'binance') {
            if (window.BinanceChain) {
              try {
                await window.BinanceChain.request({ method: 'eth_chainId' });
                return true;
              } catch (e) {
                return false;
              }
            }
            return false;
          }
          return false;
        } catch (error) {
          return false;
        }
      };

      const checkAllWallets = async () => {
        setIsCheckingWallets(true);
        try {
          const walletChecks = await Promise.all([
            checkWalletInstalled('metamask'),
            checkWalletInstalled('trust'),
            checkWalletInstalled('binance'),
            checkWalletInstalled('coinbase')
          ]);

          const availableWallets: Wallet[] = [
            {
              name: 'MetaMask',
              icon: '/wallet-icons/MetaMaskIcon.png',
              connector: () => connectWallet('metamask'),
              isInstalled: walletChecks[0]
            },
            {
              name: 'Trust Wallet',
              icon: '/wallet-icons/TrustWalletIcon.png',
              connector: () => connectWallet('trust'),
              isInstalled: walletChecks[1]
            },
            {
              name: 'Binance Wallet',
              icon: '/wallet-icons/BinanceIcon.png',
              connector: () => connectWallet('binance'),
              isInstalled: walletChecks[2]
            },
            {
              name: 'Coinbase Wallet',
              icon: '/wallet-icons/CoinbaseIcon.png',
              connector: () => connectWallet('coinbase'),
              isInstalled: walletChecks[3]
            },
            {
              name: 'WalletConnect',
              icon: '/wallet-icons/WalletconnectIcon.png',
              connector: () => connectWallet('walletconnect'),
              isInstalled: true // WalletConnect can always be used
            }
          ];

          setWallets(availableWallets);
        } finally {
          setIsCheckingWallets(false);
        }
      };

      checkAllWallets();
    }
  }, [isOpen, connectWallet]);

  // Close modal and reset connecting state when wallet connects successfully
  useEffect(() => {
    if (connected && connectingWallet) {
      setConnectingWallet(null);
      // Add a small delay to show the success state before closing
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [connected, connectingWallet, onClose]);

  // Reset connecting state if modal closes while connecting
  useEffect(() => {
    if (!isOpen && connectingWallet) {
      setConnectingWallet(null);
    }
  }, [isOpen, connectingWallet]);

  if (!isOpen) return null;

  // If no wallets are available, show a message
  if (!hasWallet) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
        <div className="bg-white rounded-t-xl p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">
              {t('wallet.connect')}
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
          
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
              No Wallet Detected
            </h3>
            <p className="text-gray-600 mb-6 font-['Pixelify_Sans']">
              Please install a BSC-compatible wallet to continue.
            </p>
            
            <div className="space-y-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-['Pixelify_Sans']"
              >
                Install MetaMask
              </a>
              <a
                href="https://trustwallet.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-['Pixelify_Sans']"
              >
                Install Trust Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">
            {t('wallet.connect')}
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

        <div className="space-y-3">
          {isCheckingWallets ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 font-['Pixelify_Sans']">Checking for wallets...</span>
              </div>
            </div>
          ) : (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={async () => {
                  setConnectingWallet(wallet.name);
                  
                  // Set a timeout to reset connecting state if it takes too long
                  const timeoutId = setTimeout(() => {
                    if (connectingWallet === wallet.name) {
                      setConnectingWallet(null);
                    }
                  }, 30000); // 30 second timeout
                  
                  const handleError = () => {
                    clearTimeout(timeoutId);
                    setConnectingWallet(null);
                  };
                  
                  try {
                    // Map wallet names to the correct wallet types
                    const walletTypeMap: Record<string, string> = {
                      'MetaMask': 'metamask',
                      'Trust Wallet': 'trust',
                      'Binance Wallet': 'binance',
                      'Coinbase Wallet': 'coinbase',
                      'WalletConnect': 'walletconnect'
                    };
                    
                    await connectWallet(walletTypeMap[wallet.name] || wallet.name.toLowerCase().replace(' ', ''), handleError);
                    clearTimeout(timeoutId);
                    // Connection success is handled by useEffect
                  } catch (error) {
                    handleError();
                  }
                }}
                disabled={!wallet.isInstalled || connectingWallet !== null}
                className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all relative min-h-[80px] ${
                  wallet.isInstalled && connectingWallet !== wallet.name
                    ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                } ${connectingWallet === wallet.name ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                {/* Blur overlay for connecting wallet */}
                {connectingWallet === wallet.name && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <img 
                      src="/loading/binance-loading-img-black.gif" 
                      alt="Connecting..." 
                      className="h-12 w-12"
                    />
                  </div>
                )}
                
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden ${connectingWallet === wallet.name ? 'blur-sm' : ''}`}>
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback icon if the image fails to load
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMkM0LjY4NjI5IDIgMiA0LjY4NjI5IDIgOEMyIDExLjMxMzcgNC42ODYyOSAxNCA4IDE0QzExLjMxMzcgMTQgMTQgMTEuMzEzNyAxNCA4QzE0IDQuNjg2MjkgMTEuMzEzNyAyIDggMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                <div className={`flex-1 text-left ${connectingWallet === wallet.name ? 'blur-sm' : ''}`}>
                  <div className="font-medium text-gray-900 font-['Pixelify_Sans']">
                    {wallet.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {wallet.isInstalled ? t('wallet.installed') : t('wallet.not_installed')}
                  </div>
                </div>
                <div className="w-5 h-5 flex items-center justify-center">
                  {wallet.isInstalled && !connectingWallet && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {connectingWallet === wallet.name && (
                    <img 
                      src="/loading/binance-loading-img-black.gif" 
                      alt="Loading..." 
                      className="h-5 w-5"
                    />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-['Pixelify_Sans']">
            {t('wallet.dont_have_wallet')}
          </p>
          <p className="text-sm text-gray-600 font-['Pixelify_Sans']">
            {t('wallet.install_wallets').split('MetaMask or TrustWallet').map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {index === 0 && (
                  <>
                    <a 
                      href="https://metamask.io/en-GB" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                      MetaMask
                    </a>
                    {' '}or{' '}
                    <a 
                      href="https://trustwallet.com/?utm_source=cryptwerk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                      TrustWallet
                    </a>
                  </>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;

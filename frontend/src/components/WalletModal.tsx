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
  const { connectWallet, connected } = useBSCWallet();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isCheckingWallets, setIsCheckingWallets] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check which wallets are installed with passive detection (no requests)
      const checkWalletInstalled = (walletType: string): boolean => {
        try {
          if (walletType === 'metamask') {
            // Check providers array first to avoid Phantom hijacking
            if (window.ethereum && window.ethereum.providers) {
              for (const provider of window.ethereum.providers) {
                if (provider.isMetaMask && !provider.isPhantom) {
                  return true;
                }
              }
            }
            if (window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
              return true;
            }
            return false;
          } else if (walletType === 'coinbase') {
            if (window.ethereum && window.ethereum.isCoinbaseWallet) {
              return true;
            }
            if (window.ethereum && window.ethereum.providers) {
              for (const provider of window.ethereum.providers) {
                if (provider.isCoinbaseWallet) {
                  return true;
                }
              }
            }
            return false;
          } else if (walletType === 'binance') {
            if (window.BinanceChain) {
              return true;
            }
            return false;
          }
          return false;
        } catch (error) {
          return false;
        }
      };

      const checkAllWallets = () => {
        setIsCheckingWallets(true);
        try {
          const availableWallets: Wallet[] = [
            {
              name: 'MetaMask',
              icon: '/wallet-icons/MetaMaskIcon.png',
              connector: () => connectWallet('metamask'),
              isInstalled: checkWalletInstalled('metamask')
            },
            {
              name: 'Binance Wallet',
              icon: '/wallet-icons/BinanceIcon.png',
              connector: () => connectWallet('binance'),
              isInstalled: checkWalletInstalled('binance')
            },
            {
              name: 'Coinbase Wallet',
              icon: '/wallet-icons/CoinbaseIcon.png',
              connector: () => connectWallet('coinbase'),
              isInstalled: checkWalletInstalled('coinbase')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl shadow-2xl w-72 max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 font-['Pixelify_Sans']">
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

        <div className="overflow-y-auto p-4">
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
                      'Coinbase Wallet': 'coinbase'
                    };
                    
                    await connectWallet(walletTypeMap[wallet.name] || wallet.name.toLowerCase().replace(' ', ''), handleError);
                    clearTimeout(timeoutId);
                    // Connection success is handled by useEffect
                  } catch (error) {
                    handleError();
                  }
                }}
                disabled={!wallet.isInstalled || connectingWallet !== null}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all relative ${
                  wallet.isInstalled && connectingWallet !== wallet.name
                    ? connectingWallet ? 'border-gray-200 bg-gray-50 opacity-30 cursor-not-allowed' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                } ${connectingWallet === wallet.name ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                {/* Blur overlay for connecting wallet */}
                {connectingWallet === wallet.name && (
                  <>
                    {/* Blur layer for background content */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg z-10 border-2 border-gray-800"></div>
                    {/* GIF layer above the blur */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <img 
                        src="/loading/binance-loading-img-black.gif" 
                        alt="Connecting..." 
                        className="h-10 w-10 opacity-100"
                      />
                    </div>
                  </>
                )}
                
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${connectingWallet === wallet.name ? 'blur-sm' : ''}`}>
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
                  <div className="font-medium text-gray-900 font-['Pixelify_Sans'] whitespace-nowrap overflow-hidden text-ellipsis">
                    {wallet.name}
                  </div>
                  <div className="text-sm text-gray-500 font-['Pixelify_Sans']">
                    {wallet.isInstalled ? t('wallet.installed') : t('wallet.not_installed')}
                  </div>
                </div>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
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
        </div>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600 font-['Pixelify_Sans'] mb-1">
            {t('wallet.dont_have_wallet')}
          </p>
          <p className="text-xs text-gray-600 font-['Pixelify_Sans']">
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

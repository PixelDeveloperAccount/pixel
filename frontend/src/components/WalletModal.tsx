import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBSCWallet } from '../context/BSCWalletContext';

interface Wallet {
  name: string;
  icon: string;
  connector: () => Promise<void>;
  isInstalled: boolean;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { connectWallet, hasWallet } = useBSCWallet();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Check which wallets are installed with better detection
      const checkWalletInstalled = (walletType: string) => {
        if (walletType === 'metamask') {
          if (window.ethereum && window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
            return true;
          }
          if (window.ethereum && window.ethereum.providers) {
            return window.ethereum.providers.some((p: any) => p.isMetaMask && !p.isPhantom);
          }
          return false;
        } else if (walletType === 'trust') {
          if (window.ethereum && window.ethereum.isTrust) {
            return true;
          }
          if (window.ethereum && window.ethereum.providers) {
            return window.ethereum.providers.some((p: any) => p.isTrust);
          }
          return false;
        } else if (walletType === 'coinbase') {
          if (window.ethereum && window.ethereum.isCoinbaseWallet) {
            return true;
          }
          if (window.ethereum && window.ethereum.providers) {
            return window.ethereum.providers.some((p: any) => p.isCoinbaseWallet);
          }
          return false;
        } else if (walletType === 'binance') {
          return typeof window.BinanceChain !== 'undefined';
        }
        return false;
      };

      const availableWallets: Wallet[] = [
        {
          name: 'MetaMask',
          icon: '/wallet-icons/MetaMaskIcon.png',
          connector: () => connectWallet('metamask'),
          isInstalled: checkWalletInstalled('metamask')
        },
        {
          name: 'Trust Wallet',
          icon: '/wallet-icons/TrustWalletIcon.png',
          connector: () => connectWallet('trust'),
          isInstalled: checkWalletInstalled('trust')
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
        },
        {
          name: 'WalletConnect',
          icon: '/wallet-icons/WalletconnectIcon.png',
          connector: () => connectWallet('walletconnect'),
          isInstalled: true // WalletConnect can always be used
        }
      ];

      setWallets(availableWallets);
    }
  }, [isOpen, connectWallet]);

  if (!isOpen) return null;

  // If no wallets are available, show a message
  if (!hasWallet) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">
              {t('wallet.connect')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">
            {t('wallet.connect')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => {
                wallet.connector();
                onClose();
              }}
              disabled={!wallet.isInstalled}
              className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                wallet.isInstalled
                  ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
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
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 font-['Pixelify_Sans']">
                  {wallet.name}
                </div>
                <div className="text-sm text-gray-500">
                  {wallet.isInstalled ? t('wallet.installed') : t('wallet.not_installed')}
                </div>
              </div>
              {wallet.isInstalled && (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-['Pixelify_Sans']">
            {t('wallet.install_prompt')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;

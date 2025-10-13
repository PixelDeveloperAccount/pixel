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
  const { connectWallet } = useBSCWallet();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Check which wallets are installed
      const availableWallets: Wallet[] = [
        {
          name: 'MetaMask',
          icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
          connector: () => connectWallet('metamask'),
          isInstalled: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
        },
        {
          name: 'Trust Wallet',
          icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
          connector: () => connectWallet('trust'),
          isInstalled: typeof window.ethereum !== 'undefined' && window.ethereum.isTrust
        },
        {
          name: 'Binance Wallet',
          icon: 'https://www.binance.com/favicon.ico',
          connector: () => connectWallet('binance'),
          isInstalled: typeof window.BinanceChain !== 'undefined'
        },
        {
          name: 'Coinbase Wallet',
          icon: 'https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/3f6a6d69d2d6e4b0e8b8b8b8b8b8b8b8/coinbase-wallet-logo.svg',
          connector: () => connectWallet('coinbase'),
          isInstalled: typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet
        },
        {
          name: 'WalletConnect',
          icon: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
          connector: () => connectWallet('walletconnect'),
          isInstalled: true // WalletConnect can always be used
        }
      ];

      setWallets(availableWallets);
    }
  }, [isOpen, connectWallet]);

  if (!isOpen) return null;

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
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  // Fallback icon if the image fails to load
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggMkM0LjY4NjI5IDIgMiA0LjY4NjI5IDIgOEMyIDExLjMxMzcgNC42ODYyOSAxNCA4IDE0QzExLjMxMzcgMTQgMTQgMTEuMzEzNyAxNCA4QzE0IDQuNjg2MjkgMTEuMzEzNyAyIDggMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                }}
              />
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

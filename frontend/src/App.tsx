import React, { useState, useEffect, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { Layout } from './components/Layout';
import { CanvasProvider } from './context/CanvasContext';
import { WalletProvider } from './context/WalletContext';
import HomePage from './pages/HomePage';
import HelpModal from './components/HelpModal';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const [showInitialHelp, setShowInitialHelp] = useState(true);

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletProvider>
            <CanvasProvider>
              <Layout>
                <HomePage />
              </Layout>
            </CanvasProvider>
          </WalletProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CanvasProvider } from './context/CanvasContext';
import { WalletProvider } from './context/WalletContext';
import HomePage from '././pages/HomePage';
import HelpModal from './components/HelpModal';

function App() {
  const [showInitialHelp, setShowInitialHelp] = useState(true);

  return (
    <WalletProvider>
      <CanvasProvider>
        <Layout>
          <HomePage />
          {showInitialHelp && (
            <HelpModal onClose={() => setShowInitialHelp(false)} />
          )}
        </Layout>
      </CanvasProvider>
    </WalletProvider>
  );
}

export default App;
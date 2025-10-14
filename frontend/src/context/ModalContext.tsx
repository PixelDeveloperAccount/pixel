import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{
      isWalletModalOpen,
      setIsWalletModalOpen
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

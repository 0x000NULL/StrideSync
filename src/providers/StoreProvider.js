import React from 'react';
import { useStore } from '../stores';

export const StoreContext = React.createContext();

export const StoreProvider = ({ children }) => {
  const store = useStore();
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = React.useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};

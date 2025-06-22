import React from 'react';
import { useStore } from '../stores';

export const StoreContext = React.createContext();

export const StoreProvider = ({ children }) => {
  const store = useStore();

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStoreContext = () => {
  // Try to get the store from React context first
  const context = React.useContext(StoreContext);

  // In cases (e.g., unit tests) where components are rendered without being wrapped
  // in a StoreProvider, `context` will be undefined. To make components and tests
  // more resilient, fall back to the global Zustand store instance. This mirrors
  // the store that StoreProvider would normally supply, while avoiding the need
  // for every test to explicitly wrap components in the provider.

  if (context === undefined) {
    return useStore();
  }

  return context;
};

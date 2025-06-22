import React from 'react';
import { useStore } from '../stores';
import PropTypes from 'prop-types';

export const StoreContext = React.createContext();

export const StoreProvider = ({ children }) => {
  const store = useStore();

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useStoreContext = () => {
  // Try to get the store from React context first
  const contextValue = React.useContext(StoreContext);
  // Always call useStore at the top level
  const globalStore = useStore();

  // In cases (e.g., unit tests) where components are rendered without being wrapped
  // in a StoreProvider, `contextValue` will be undefined. To make components and tests
  // more resilient, fall back to the global Zustand store instance. This mirrors
  // the store that StoreProvider would normally supply, while avoiding the need
  // for every test to explicitly wrap components in the provider.

  if (contextValue === undefined) {
    // This typically means the component is not wrapped in StoreProvider.
    // Fallback to the global store instance.
    return globalStore;
  }

  // Return the context-provided store if available
  return contextValue;
};

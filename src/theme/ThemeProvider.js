import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme as baseTheme } from './theme';
import { useStoreContext } from '../providers/StoreProvider';
import PropTypes from 'prop-types';

// Create light and dark theme variants
const lightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#ffffff',
    card: '#f8f9fa',
    text: {
      primary: '#1a1a1a',
      secondary: '#6c757d',
      disabled: '#adb5bd',
    },
    border: '#dee2e6',
    notification: '#ff6b6b',
  },
  dark: false,
};

const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#121212',
    card: '#1e1e1e',
    text: {
      primary: '#f8f9fa',
      secondary: '#adb5bd',
      disabled: '#6c757d',
    },
    border: '#343a40',
    notification: '#ff6b6b',
  },
  dark: true,
};

const ThemeContext = createContext(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // Use the store context to access settings
  const store = useStoreContext();
  const settings = store?.settings || {};
  const { theme: themePreference = 'system' } = settings;

  // Determine which theme to use based on preference and system settings
  const getTheme = () => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themePreference === 'dark' ? darkTheme : lightTheme;
  };

  const currentTheme = getTheme();

  // Update status bar and navigation bar colors when theme changes
  useEffect(() => {
    // You can add platform-specific theme updates here if needed
  }, [currentTheme]);

  return <ThemeContext.Provider value={currentTheme}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;

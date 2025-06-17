import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { theme } from './theme';

const ThemeContext = createContext(theme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // You can add theme switching logic here if needed
  const colorScheme = useColorScheme();
  
  // For now, we'll use the light theme
  // In the future, you can implement dark/light mode switching here
  const themeMode = theme;

  return (
    <ThemeContext.Provider value={themeMode}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

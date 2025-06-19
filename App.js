import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { StoreProvider } from './src/providers/StoreProvider'; // This is Zustand StoreProvider
import AppNavigator from './src/navigation/AppNavigator';

// Temporary Minimal Redux Store for Run Tracking Background Task
import { configureStore } from '@reduxjs/toolkit';
import runReducer from './src/stores/run_tracking/runSlice';
import { setStoreReference } from './src/services/run_tracking/backgroundLocationTask';

const minimalStoreForRunTracking = configureStore({
  reducer: {
    run: runReducer,
  },
  // It's good practice to disable middleware that you don't need for such a minimal/test store
  // if it were a more complex setup, but for this simple case, defaults are fine.
});
setStoreReference(minimalStoreForRunTracking);
// End of Temporary Minimal Redux Store setup

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { StoreProvider } from './src/providers/StoreProvider';
// import AppNavigator from './src/navigation/AppNavigator'; // Replaced by RunFlowNavigator for this task
import RunFlowNavigator from './navigators/RunFlowNavigator'; // Import the new navigator
import { RunProvider } from './context/RunContext'; // Import the RunProvider

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider>
          <RunProvider> {/* Wrap NavigationContainer or RunFlowNavigator with RunProvider */}
            <NavigationContainer>
              <StatusBar style="auto" />
              <RunFlowNavigator /> {/* Use RunFlowNavigator */}
            </NavigationContainer>
          </RunProvider>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

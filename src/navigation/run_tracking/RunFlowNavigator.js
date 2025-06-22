import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

// Run Flow Screens
import PreRunScreen from '../../screens/run_tracking/PreRunScreen';
import ActiveRunScreen from '../../screens/run_tracking/ActiveRunScreen';
import PauseScreen from '../../screens/run_tracking/PauseScreen';
import RunSummaryScreen from '../../screens/run_tracking/RunSummaryScreen';
import SaveRunScreen from '../../screens/run_tracking/SaveRunScreen';

const Stack = createStackNavigator();

const RunFlowNavigator = () => {
  const theme = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTintColor: theme.colors.text.primary,
    headerTitleStyle: {
      fontWeight: '600',
    },
    cardStyle: { backgroundColor: theme.colors.background },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="PreRun">
      <Stack.Screen
        name="PreRun"
        component={PreRunScreen}
        options={{
          title: 'New Run',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ActiveRun"
        component={ActiveRunScreen}
        options={{
          title: 'Run in Progress',
          headerShown: true,
          headerLeft: null, // Prevent going back to PreRun screen
          gestureEnabled: false, // Prevent swipe back
        }}
      />
      <Stack.Screen
        name="Pause"
        component={PauseScreen}
        options={{
          title: 'Run Paused',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="RunSummary"
        component={RunSummaryScreen}
        options={{
          title: 'Run Summary',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SaveRun"
        component={SaveRunScreen}
        options={{
          title: 'Save Run',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default RunFlowNavigator;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RunTrackerScreen from '../screens/RunTrackerScreen';
import RunLogScreen from '../screens/RunLogScreen';
import ShoeListScreen from '../screens/ShoeListScreen';
import ShoeDetailScreen from '../screens/ShoeDetailScreen';
import RetiredShoesReportScreen from '../screens/RetiredShoesReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddShoeScreen from '../screens/AddShoeScreen';
import EditShoeScreen from '../screens/EditShoeScreen';
import RunDetailScreen from '../screens/RunDetailScreen';

// Run Flow Screens
import PreRunScreen from '../screens/run_tracking/PreRunScreen';
import ActiveRunScreen from '../screens/run_tracking/ActiveRunScreen';
import PauseScreen from '../screens/run_tracking/PauseScreen';
import RunSummaryScreen from '../screens/run_tracking/RunSummaryScreen';
import SaveRunScreen from '../screens/run_tracking/SaveRunScreen';

const Stack = createNativeStackNavigator();

// Main App Navigator with all screens
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'StrideSync' }} 
      />
      <Stack.Screen 
        name="RunTracker" 
        component={RunTrackerScreen} 
        options={{ title: 'Track Run' }} 
      />
      <Stack.Screen 
        name="RunLog" 
        component={RunLogScreen} 
        options={{ title: 'Run Log' }} 
      />
      <Stack.Screen 
        name="RunDetails" 
        component={RunDetailScreen} 
        options={{ title: 'Run Details' }} 
      />
      <Stack.Screen 
        name="ShoeList" 
        component={ShoeListScreen} 
        options={{ title: 'My Shoes' }} 
      />
      <Stack.Screen 
        name="ShoeDetail" 
        component={ShoeDetailScreen} 
        options={{ title: 'Shoe Details' }} 
      />
      <Stack.Screen
        name="AddShoe"
        component={AddShoeScreen}
        options={{ title: 'Add New Shoe' }}
      />
      <Stack.Screen
        name="EditShoe"
        component={EditShoeScreen}
        options={{ title: 'Edit Shoe' }}
      />
      <Stack.Screen 
        name="RetiredShoesReport" 
        component={RetiredShoesReportScreen} 
        options={{ title: 'Retired Shoes Report' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      
      {/* Run Flow Screens with specific presentation modes */}
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
          gestureEnabled: false,
          headerBackVisible: false, // Prevent going back during active run
        }} 
      />
      <Stack.Screen 
        name="Pause" 
        component={PauseScreen} 
        options={{ 
          title: 'Run Paused',
          headerShown: true,
          presentation: 'modal', // Pause should also be a modal
        }} 
      />
      <Stack.Screen 
        name="SaveRun" 
        component={SaveRunScreen} 
        options={{ 
          title: 'Save Run',
          headerShown: true,
          presentation: 'modal', // This should be a modal
        }} 
      />
      <Stack.Screen 
        name="RunSummary" 
        component={RunSummaryScreen} 
        options={{ 
          title: 'Run Summary',
          headerShown: true,
          headerBackVisible: false, // Prevent going back to SaveRun
        }} 
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  return <MainStack />;
};

export default AppNavigator;

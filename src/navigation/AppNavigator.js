import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens (to be created)
import HomeScreen from '../screens/HomeScreen';
import RunTrackerScreen from '../screens/RunTrackerScreen';
import RunLogScreen from '../screens/RunLogScreen';
import ShoeListScreen from '../screens/ShoeListScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
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
        name="ShoeList" 
        component={ShoeListScreen} 
        options={{ title: 'My Shoes' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

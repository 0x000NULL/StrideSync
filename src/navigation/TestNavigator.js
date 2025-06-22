import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShoeListScreen from '../screens/ShoeListScreen';
import AddEditShoeScreen from '../screens/AddEditShoeScreen';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

const TestNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="ShoeList"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary, // Assuming #f4511e maps to primary
        },
        headerTintColor: theme.colors.onPrimary || theme.colors.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="ShoeList" component={ShoeListScreen} options={{ title: 'My Shoes' }} />
      <Stack.Screen
        name="AddEditShoe"
        component={AddEditShoeScreen}
        options={{ title: 'Add Shoe' }}
      />
    </Stack.Navigator>
  );
};

export default TestNavigator;

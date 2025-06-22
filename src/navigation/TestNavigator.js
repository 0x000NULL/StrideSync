import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Button } from 'react-native';
import ShoeListScreen from '../screens/ShoeListScreen';
import AddEditShoeScreen from '../screens/AddEditShoeScreen';
import { useTheme } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator();

const TestNavigator = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    // title: { // Unused style
    //   fontSize: 24,
    //   fontWeight: 'bold',
    //   marginBottom: 20,
    //   textAlign: 'center',
    //   color: theme.colors.text.primary, // Added color
    // },
    text: { // This style was used by the SimpleTest component that was removed.
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.text.primary, // Added color
    },
    // button: { // Unused style
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   backgroundColor: theme.colors.primary, // Assuming #f4511e maps to primary for this test nav
    //   padding: theme.spacing.md,
    //   borderRadius: theme.borderRadius.md,
    //   marginTop: 20,
    // },
    // buttonText: { // Unused style
    //   color: theme.colors.onPrimary || theme.colors.text.light,
    //   fontSize: 16,
    //   fontWeight: 'bold',
    //   marginLeft: theme.spacing.sm,
    // },
    // input: { // Unused style
    //   width: '100%',
    //   height: 40, // Consider theme.controlHeight or similar
    //   borderWidth: 1,
    //   borderColor: theme.colors.border,
    //   padding: theme.spacing.sm,
    //   marginBottom: 20,
    //   borderRadius: theme.borderRadius.sm,
    //   color: theme.colors.text.primary, // Added color
    //   backgroundColor: theme.colors.surface, // Added background
    // },
  });

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

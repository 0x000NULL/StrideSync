import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider'; // Import useTheme

const TestScreen = () => {
  const theme = useTheme(); // Use the theme

  // Define styles inside the component or pass theme to a StyleSheet factory
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background, // Use theme background
    },
    text: {
      fontSize: 24, // Consider theme.typography
      fontWeight: 'bold',
      color: theme.colors.text.primary, // Use theme text color
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
    </View>
  );
};

export default TestScreen;

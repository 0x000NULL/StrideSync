import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider'; // Import useTheme

const SimpleTest = () => {
  const theme = useTheme(); // Use the theme

  // Define styles inside the component or pass theme to a StyleSheet factory
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg, // Use theme spacing
      backgroundColor: theme.colors.background, // Use theme background
    },
    text: {
      fontSize: 20, // Consider theme.typography
      marginBottom: theme.spacing.lg, // Use theme spacing
      color: theme.colors.text.primary, // Use theme text color
    },
    input: {
      width: '100%',
      height: 40, // Consider theme.controlHeight
      borderWidth: 1,
      borderColor: theme.colors.border, // Use theme border color
      padding: theme.spacing.sm, // Use theme spacing
      marginBottom: theme.spacing.lg, // Use theme spacing
      borderRadius: theme.borderRadius.sm, // Use theme border radius
      color: theme.colors.text.primary, // Use theme text color for input
      backgroundColor: theme.colors.surface, // Use theme surface for input background
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Test Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Type something..."
        placeholderTextColor={theme.colors.text.secondary} // Use theme placeholder color
      />
      <Button title="Click me" onPress={() => console.log('Button pressed')} color={theme.colors.primary} />
    </View>
  );
};

export default SimpleTest;

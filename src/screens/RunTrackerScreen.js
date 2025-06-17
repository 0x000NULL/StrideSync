import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const RunTrackerScreen = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Run Tracker Screen</Text>
      <Text style={{ ...theme.typography.body, marginTop: theme.spacing.md }}>
        This is where you'll track your runs in real-time.
      </Text>
    </View>
  );
};

export default RunTrackerScreen;

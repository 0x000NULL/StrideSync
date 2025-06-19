import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import * as Location from 'expo-location';

const RunTrackerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return false;
      }
      
      // Request background permission if needed
      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        console.log('Background location permission not granted');
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const handleStartRun = async () => {
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      // Navigate directly to the PreRun screen
      navigation.navigate('PreRun');
    } else {
      // Show error to user
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to track your run.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      width: '100%',
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      width: '80%',
      alignItems: 'center',
    },
    buttonText: {
      ...theme.typography.button,
      color: theme.colors.text.light,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ready to Run?</Text>
        <Text style={styles.subtitle}>
          Track your runs in real-time and see your progress over time.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleStartRun}
        >
          <Text style={styles.buttonText}>Start New Run</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RunTrackerScreen;

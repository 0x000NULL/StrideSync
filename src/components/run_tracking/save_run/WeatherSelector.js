import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const WeatherSelector = ({ weather, onWeatherChange }) => {
  const theme = useTheme();
  const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Snowy'];

  const styles = StyleSheet.create({
    formSection: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 18, // Consider theme.typography.h6.fontSize
      fontWeight: '600', // Consider theme.typography.h6.fontWeight
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary, // Added color
    },
    buttonGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: theme.spacing.sm, // Using theme spacing for gap
    },
    button: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.xl, // Large radius for pill shape
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 14, // Consider theme.typography.button.fontSize
      color: theme.colors.text.primary,
    },
    selectedButtonText: {
      color: theme.colors.onPrimary || theme.colors.text.light, // Use onPrimary if available
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Weather Condition</Text>
      <View style={styles.buttonGroup}>
        {weatherOptions.map(w => (
          <Pressable
            key={w}
            style={[styles.button, weather === w && styles.selectedButton]}
            onPress={() => onWeatherChange(w)}
          >
            <Text style={[styles.buttonText, weather === w && styles.selectedButtonText]}>{w}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

WeatherSelector.propTypes = {
  weather: PropTypes.string.isRequired,
  onWeatherChange: PropTypes.func.isRequired,
};

export default WeatherSelector;

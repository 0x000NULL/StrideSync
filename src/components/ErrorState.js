import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

/**
 * A component to display when there's an error loading data
 * @param {Object} props - Component props
 * @param {string} [props.icon] - Optional custom icon name
 * @param {string} [props.title] - Optional custom title
 * @param {string|Error} [props.message] - Error message or Error object
 * @param {string} [props.actionLabel] - Label for the retry action button
 * @param {Function} [props.onRetry] - Function to call when retry is pressed
 */
const ErrorState = ({
  icon = 'error-outline',
  title = 'Something went wrong',
  message = "We couldn't load the data. Please try again.",
  actionLabel = 'Try Again',
  onRetry,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    icon: {
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    message: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      maxWidth: 300,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.error,
    },
    retryButtonText: {
      ...theme.typography.button,
      color: theme.colors.text.light,
      marginLeft: theme.spacing.xs,
    },
  });

  // Extract message from Error object if needed
  const errorMessage = message instanceof Error ? message.message : message;

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={48} color={theme.colors.error} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.text.light} />
          <Text style={styles.retryButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(ErrorState);

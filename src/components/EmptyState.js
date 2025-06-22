import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

/**
 * A component to display when a list is empty
 * @param {Object} props - Component props
 * @param {string} props.icon - Name of the icon to display
 * @param {string} props.title - Main title text
 * @param {string} props.message - Description text
 * @param {Object} [props.action] - Optional action button
 * @param {string} props.action.label - Label for the action button
 * @param {Function} props.action.onPress - Function to call when the action button is pressed
 */
const EmptyState = ({ icon, title, message, action }) => {
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
      opacity: 0.5,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.text.primary,
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
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      ...theme.typography.button,
      color: theme.colors.text.light,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={48}
          color={theme.colors.text.secondary}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.text.light} />
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(EmptyState);

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

/**
 * A skeleton loading component that shows placeholder content
 * @param {Object} props - Component props
 * @param {number} [props.count=3] - Number of skeleton items to render
 * @param {string} [props.variant='card'] - Type of skeleton to render ('card', 'list', 'text')
 * @param {Object} [props.style] - Additional style for the container
 */
const LoadingSkeleton = ({ count = 3, variant = 'card', style }) => {
  const theme = useTheme();

  const renderSkeletonItem = index => {
    switch (variant) {
      case 'card':
        return (
          <View key={index} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]} />
              <View style={styles.headerText}>
                <View style={[styles.title, { backgroundColor: theme.colors.surface }]} />
                <View style={[styles.subtitle, { backgroundColor: theme.colors.surface }]} />
              </View>
            </View>
            <View style={styles.content}>
              <View style={[styles.line, { backgroundColor: theme.colors.surface }]} />
              <View
                style={[styles.line, { width: '80%', backgroundColor: theme.colors.surface }]}
              />
              <View
                style={[styles.line, { width: '60%', backgroundColor: theme.colors.surface }]}
              />
            </View>
          </View>
        );

      case 'list':
        return (
          <View
            key={index}
            style={[styles.listItem, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <View style={[styles.listAvatar, { backgroundColor: theme.colors.surface }]} />
            <View style={styles.listContent}>
              <View style={[styles.line, { backgroundColor: theme.colors.surface }]} />
              <View
                style={[styles.line, { width: '70%', backgroundColor: theme.colors.surface }]}
              />
            </View>
          </View>
        );

      case 'text':
        return (
          <View key={index} style={[styles.textContainer, style]}>
            <View style={[styles.line, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View
              style={[styles.line, { width: '90%', backgroundColor: theme.colors.surfaceVariant }]}
            />
            <View
              style={[styles.line, { width: '80%', backgroundColor: theme.colors.surfaceVariant }]}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    // Card variant styles
    card: {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.sm,
    },
    headerText: {
      flex: 1,
    },
    title: {
      height: 16,
      width: '60%',
      marginBottom: 6,
      borderRadius: 4,
    },
    subtitle: {
      height: 12,
      width: '40%',
      borderRadius: 4,
    },
    content: {
      marginTop: theme.spacing.sm,
    },
    line: {
      height: 12,
      borderRadius: 4,
      marginBottom: 8,
      width: '100%',
    },

    // List variant styles
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: theme.spacing.md,
    },
    listContent: {
      flex: 1,
    },

    // Text variant styles
    textContainer: {
      padding: theme.spacing.md,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => renderSkeletonItem(index))}
    </View>
  );
};

export default React.memo(LoadingSkeleton);

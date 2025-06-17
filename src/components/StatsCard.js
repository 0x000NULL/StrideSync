import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';

/**
 * A card component to display a single statistic with an optional icon
 * @param {Object} props - Component props
 * @param {string} props.title - The title/label of the stat
 * @param {string|number} props.value - The main value to display
 * @param {string} [props.unit] - Optional unit to display after the value
 * @param {string} [props.icon] - Name of the icon to display (from MaterialIcons or MaterialCommunityIcons)
 * @param {string} [props.color] - Color for the value and icon
 * @param {string} [props.iconType='material'] - Type of icon set to use ('material' or 'material-community')
 * @param {string} [props.description] - Optional description text below the title
 * @param {boolean} [props.small=false] - Whether to use a smaller size variant
 */
const StatsCard = ({
  title,
  value,
  unit,
  icon,
  color,
  iconType = 'material',
  description,
  small = false,
}) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      minWidth: small ? 100 : 120,
      padding: small ? theme.spacing.sm : theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      margin: theme.spacing.xs,
    },
    content: {
      alignItems: 'center',
    },
    iconContainer: {
      width: small ? 32 : 40,
      height: small ? 32 : 40,
      borderRadius: 20,
      backgroundColor: `${color || theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xxs,
    },
    value: {
      ...(small ? theme.typography.h4 : theme.typography.h3),
      color: color || theme.colors.text.primary,
      fontWeight: '700',
      marginRight: 2,
    },
    unit: {
      ...(small ? theme.typography.caption : theme.typography.body2),
      color: theme.colors.text.secondary,
      marginLeft: 2,
      fontWeight: '500',
    },
    title: {
      ...(small ? theme.typography.overline : theme.typography.caption),
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: description ? 2 : 0,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    description: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontSize: 12,
      opacity: 0.8,
    },
  });

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconProps = {
      name: icon,
      size: small ? 18 : 24,
      color: color || theme.colors.primary,
    };
    
    return (
      <View style={styles.iconContainer}>
        {iconType === 'material-community' ? (
          <MaterialCommunityIcons {...iconProps} />
        ) : (
          <MaterialIcons {...iconProps} />
        )}
      </View>
    );
  };

  return (
    <Card style={[styles.container, small && { padding: theme.spacing.sm }]}>
      <View style={styles.content}>
        {renderIcon()}
        <View style={styles.valueContainer}>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
    </Card>
  );
};

export default React.memo(StatsCard);

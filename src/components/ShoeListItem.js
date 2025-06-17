import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';

const ShoeListItem = ({ 
  id,
  name,
  brand,
  model,
  distance,
  maxDistance = 800, // Default max distance in km
  purchaseDate,
  isActive = true,
  onPress,
  showDivider = true,
  imageUrl = null
}) => {
  const theme = useTheme();

  const calculateUsagePercentage = () => {
    if (!distance || !maxDistance) return 0;
    return Math.min((distance / maxDistance) * 100, 100);
  };

  const getStatusColor = () => {
    const percentage = calculateUsagePercentage();
    if (percentage > 90) return theme.colors.error;
    if (percentage > 70) return theme.colors.warning;
    return theme.colors.success;
  };

  const formatDistance = (km) => {
    if (!km && km !== 0) return '--';
    return `${km.toFixed(1)} km`;
  };

  const formatPurchaseDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const styles = StyleSheet.create({
    container: {
      padding: 0,
      overflow: 'hidden',
    },
    touchable: {
      padding: theme.spacing.md,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      width: 70,
      height: 70,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderIcon: {
      color: theme.colors.text.secondary,
    },
    details: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xxs,
    },
    name: {
      ...theme.typography.body,
      fontWeight: '600',
      color: theme.colors.text.primary,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: isActive 
        ? `${theme.colors.primary}20` 
        : `${theme.colors.text.secondary}20`,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isActive ? getStatusColor() : theme.colors.text.secondary,
      marginRight: 4,
    },
    statusText: {
      ...theme.typography.caption,
      color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    model: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    progressContainer: {
      marginTop: theme.spacing.xs,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    distance: {
      ...theme.typography.caption,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      width: `${calculateUsagePercentage()}%`,
      backgroundColor: getStatusColor(),
    },
    rightIcon: {
      marginLeft: theme.spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing.md,
    },
  });

  return (
    <Card style={styles.container}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image} 
                resizeMode="contain"
              />
            ) : (
              <MaterialIcons 
                name="directions-run" 
                size={32} 
                style={styles.placeholderIcon} 
              />
            )}
          </View>
          
          <View style={styles.details}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {name || 'Unnamed Shoe'}
              </Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isActive ? 'Active' : 'Retired'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.model} numberOfLines={1}>
              {brand} {model}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.distance}>
                  {formatDistance(distance)} of {maxDistance} km
                </Text>
                <Text style={styles.distance}>
                  {Math.round(calculateUsagePercentage())}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </View>
          
          <View style={styles.rightIcon}>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.text.secondary} 
            />
          </View>
        </View>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </Card>
  );
};

export default ShoeListItem;

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';
import { formatDistance, formatPace } from '../utils/formatters';

const ShoeListItem = ({ 
  shoe,
  onPress,
  showDivider = true,
}) => {
  const theme = useTheme();
  const { 
    id,
    name,
    brand,
    model,
    maxDistance = 800, // in km
    purchaseDate,
    isActive = true,
    imageUrl = null,
    stats = {},
    progress = 0,
    remainingDistance = null
  } = shoe;

  // Calculate status color based on usage percentage
  const statusColor = useMemo(() => {
    if (!isActive) return theme.colors.text.secondary;
    if (progress >= 90) return theme.colors.error;
    if (progress >= 70) return theme.colors.warning;
    return theme.colors.success;
  }, [progress, isActive, theme]);

  // Format dates
  const formattedPurchaseDate = useMemo(() => {
    if (!purchaseDate) return '--';
    return new Date(purchaseDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  }, [purchaseDate]);

  const lastRunDate = useMemo(() => {
    if (!stats.lastRun) return 'Never used';
    const date = new Date(stats.lastRun);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [stats.lastRun]);

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
      alignItems: 'flex-start',
    },
    imageContainer: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceVariant,
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
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xxs,
    },
    nameContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    name: {
      ...theme.typography.subtitle1,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    brandModel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: isActive 
        ? `${statusColor}20` 
        : `${theme.colors.text.secondary}20`,
      minWidth: 80,
      justifyContent: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isActive ? statusColor : theme.colors.text.secondary,
      marginRight: 4,
    },
    statusText: {
      ...theme.typography.caption,
      color: isActive ? statusColor : theme.colors.text.secondary,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      ...theme.typography.subtitle2,
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    progressContainer: {
      marginTop: theme.spacing.sm,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    distance: {
      ...theme.typography.caption,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      width: `${progress}%`,
      backgroundColor: statusColor,
    },
    rightIcon: {
      marginLeft: theme.spacing.sm,
      alignSelf: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing.md,
    },
    lastRun: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      fontStyle: 'italic',
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
              <MaterialCommunityIcons 
                name="shoe-sneaker" 
                size={40} 
                style={styles.placeholderIcon} 
              />
            )}
          </View>
          
          <View style={styles.details}>
            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {name || 'Unnamed Shoe'}
                </Text>
                <Text style={styles.brandModel} numberOfLines={1}>
                  {brand} {model && `• ${model}`}
                </Text>
              </View>
              
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isActive ? 'Active' : 'Retired'}
                </Text>
              </View>
            </View>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.totalRuns || '0'}
                </Text>
                <Text style={styles.statLabel}>Runs</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.totalDistance ? formatDistance(stats.totalDistance) : '--'}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.averagePace ? formatPace(stats.averagePace) : '--'}
                </Text>
                <Text style={styles.statLabel}>Avg. Pace</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.distance}>
                  {formatDistance(stats.totalDistance || 0)} of {maxDistance ? `${maxDistance} km` : '∞'}
                </Text>
                <Text style={[styles.distance, { color: statusColor }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              
              <Text style={styles.lastRun}>
                Last run: {lastRunDate}
              </Text>
            </View>
          </View>
          
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={theme.colors.text.secondary}
            style={styles.rightIcon}
          />
        </View>
      </TouchableOpacity>
      
      {showDivider && <View style={styles.divider} />}
    </Card>
  );
};

export default ShoeListItem;

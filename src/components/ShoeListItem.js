import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';
// import { formatDistance as oldFormatDistance, formatPace as oldFormatPace } from '../utils/formatters'; // Keep if other parts still use them
import { useUnits } from '../hooks/useUnits'; // Import useUnits
import { useStore } from '../stores/useStore';
import PropTypes from 'prop-types';

// KM_TO_MI for pace conversion if not exposed by useUnits directly for this calculation
const KM_TO_MI = 0.621371;

const ShoeListItem = ({ shoe, onPress, showDivider = true }) => {
  const theme = useTheme();
  const { formatDistance, distanceUnit } = useUnits(); // Get unit functions

  const {
    id,
    name,
    brand,
    model,
    maxDistance = 800, // This is always in km (base unit for storage)
    purchaseDate,
    isActive = true,
    imageUrl = null,
    stats = {},
    progress = 0,
    // remainingDistance removed since unused for now
    retirementDate,
  } = shoe;

  // Calculate status color based on usage percentage
  const statusColor = useMemo(() => {
    if (!isActive) return theme.colors.secondary;
    if (progress >= 90) return theme.colors.error;
    if (progress >= 70) return theme.colors.warning;
    return theme.colors.success;
  }, [progress, isActive, theme]);

  const statusText = useMemo(() => {
    if (!isActive) return 'Retired';
    if (progress >= 90) return 'Replace Soon';
    if (progress >= 70) return 'Monitor';
    return 'Good';
  }, [progress, isActive]);

  const statusDescription = useMemo(() => {
    if (!isActive) {
      if (retirementDate) {
        return `Retired on ${new Date(retirementDate).toLocaleDateString()}`;
      }
      return 'Retired';
    }
    if (progress >= 90) return 'Consider replacing soon';
    if (progress >= 70) return 'Monitor usage';
    return 'In good condition';
  }, [progress, isActive, retirementDate]);

  // Format dates
  const formattedPurchaseDate = useMemo(() => {
    if (!purchaseDate) return '--';
    return new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      backgroundColor: isActive ? `${statusColor}20` : `${theme.colors.text.secondary}20`,
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
    reactivateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 4,
      marginTop: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    reactivateIcon: {
      marginRight: 6,
    },
    reactivateText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const handleQuickReactivate = e => {
    e.stopPropagation(); // Prevent triggering the parent onPress
    // Assuming we have access to the store's reactivateShoe function
    const { reactivateShoe } = useStore.getState();
    reactivateShoe(id);
  };

  return (
    <Card style={styles.container}>
      <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
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
              <View style={styles.headerContent}>
                <View>
                  <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
                  <Text style={[styles.brand, { color: theme.colors.textSecondary }]}>{brand}</Text>
                </View>
                {!isActive && (
                  <TouchableOpacity
                    style={[
                      styles.reactivateButton,
                      { backgroundColor: `${theme.colors.primary}15` },
                    ]}
                    onPress={handleQuickReactivate}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="refresh" size={16} color={theme.colors.primary} />
                    <Text style={[styles.reactivateText, { color: theme.colors.primary }]}>
                      Reactivate
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
                <View>
                  <Text style={styles.statusText}>{statusText}</Text>
                  <Text style={styles.statusDescription}>{statusDescription}</Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalRuns || '0'}</Text>
                <Text style={styles.statLabel}>Runs</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {/* Assuming stats.totalDistance is in km */}
                  {stats.totalDistance !== undefined
                    ? formatDistance(stats.totalDistance).formatted
                    : '--'}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {/* Assuming stats.averagePace is in seconds/km */}
                  {(() => {
                    if (!stats.averagePace || stats.averagePace <= 0) return '--:--';
                    let paceInSecondsPreferredUnit = stats.averagePace;
                    if (distanceUnit === 'mi') {
                      paceInSecondsPreferredUnit = stats.averagePace / KM_TO_MI;
                    }
                    const paceMinutes = Math.floor(paceInSecondsPreferredUnit / 60);
                    const paceSeconds = Math.round(paceInSecondsPreferredUnit % 60);
                    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} ${distanceUnit === 'mi' ? 'min/mi' : 'min/km'}`;
                  })()}
                </Text>
                <Text style={styles.statLabel}>Avg. Pace</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.distance}>
                  {/* Assuming stats.totalDistance is in km */}
                  {formatDistance(stats.totalDistance || 0).formatted} of{' '}
                  {/* maxDistance is in km, format it */}
                  {maxDistance ? formatDistance(maxDistance).formatted : '∞'}
                </Text>
                <Text style={[styles.distance, { color: statusColor }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>

              <Text style={styles.lastRun}>Last run: {lastRunDate}</Text>
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

ShoeListItem.propTypes = {
  shoe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
    model: PropTypes.string,
    maxDistance: PropTypes.number,
    purchaseDate: PropTypes.string,
    isActive: PropTypes.bool,
    imageUrl: PropTypes.string,
    stats: PropTypes.object,
    progress: PropTypes.number,
    retirementDate: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func,
  showDivider: PropTypes.bool,
};

ShoeListItem.defaultProps = {
  onPress: () => {},
  showDivider: true,
};

export default ShoeListItem;

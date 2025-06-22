import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import Card from './ui/Card';
import { useUnits } from '../hooks/useUnits'; // Import useUnits

// KM_TO_MI for pace conversion
const KM_TO_MI = 0.621371;

const RunListItem = ({ id, date, distance, duration, pace, onPress, showDivider = true }) => {
  // distance is in km, pace is in seconds per km
  const theme = useTheme();
  const { formatDistance, distanceUnit } = useUnits();

  const formatDate = dateString => {
    const dateObj = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatDuration = seconds => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format pace (seconds per km) based on unit preference
  let displayPace = '--:--';
  const currentDistanceUnitLabel = distanceUnit === 'mi' ? '/mi' : '/km';

  if (pace > 0) {
    let paceInSecondsPreferredUnit = pace; // pace is assumed to be seconds per km
    if (distanceUnit === 'mi') {
      // Convert pace from sec/km to sec/mile
      paceInSecondsPreferredUnit = pace / KM_TO_MI;
    }
    const paceMinutes = Math.floor(paceInSecondsPreferredUnit / 60);
    const paceSeconds = Math.round(paceInSecondsPreferredUnit % 60);
    displayPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  }
  displayPace = `${displayPace} ${currentDistanceUnitLabel}`;

  const displayDistance = distance ? formatDistance(distance) : { formatted: '-- --' };

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
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftSection: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    date: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontWeight: '500',
    },
    distance: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xxs,
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.lg,
    },
    detailText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
    },
    duration: {
      ...theme.typography.h4,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    pace: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing.md,
    },
  });

  return (
    <Card style={styles.container}>
      <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={styles.date}>{formatDate(date)}</Text>
            <Text style={styles.distance}>{displayDistance.formatted}</Text>
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <MaterialIcons name="timer" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>
                  {duration ? formatDuration(duration) : '--:--'}
                </Text>
              </View>
              {pace > 0 && ( // Only show pace if available
                <View style={styles.detailItem}>
                  <MaterialIcons name="speed" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>{displayPace}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.rightSection}>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.text.secondary} />
          </View>
        </View>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </Card>
  );
};

export default RunListItem;

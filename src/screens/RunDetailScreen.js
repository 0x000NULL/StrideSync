import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../stores/useStore';
import { useTheme } from '../theme/ThemeProvider';
import { format, parseISO } from 'date-fns';

// Helper to format duration (seconds) to HH:MM:SS or MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.subtitle1,
      color: theme.colors.text.secondary,
    },
    value: {
      ...theme.typography.subtitle1,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
    },
  });

const RunDetailScreen = ({ route }) => {
  const { runId } = route.params || {};
  const getRunById = useStore((state) => state.getRunById);
  const run = getRunById ? getRunById(runId) : null;
  const theme = useTheme();
  const styles = getStyles(theme);

  if (!run) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Run not found.</Text>
      </View>
    );
  }

  // Derived formatted values
  const runDate = run.startTime ? parseISO(run.startTime) : null;
  const formattedDate = runDate ? format(runDate, 'MMMM d, yyyy') : 'Unknown date';
  const formattedTime = runDate ? format(runDate, 'h:mm a') : '';
  const formattedDistance = run.distance ? `${run.distance.toFixed(2)} km` : '-- km';
  const formattedDuration = formatDuration(run.duration);
  const formattedPace =
    run.pace && (run.pace.minutes || run.pace.seconds)
      ? `${run.pace.minutes}:${run.pace.seconds.toString().padStart(2, '0')} min/km`
      : '--:--';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: theme.spacing.lg }}>
      <Text style={styles.header}>Run Details</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{formattedDate}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Start Time</Text>
        <Text style={styles.value}>{formattedTime}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{formattedDistance}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{formattedDuration}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Average Pace</Text>
        <Text style={styles.value}>{formattedPace}</Text>
      </View>
      {/* Additional details such as map or splits can be added here */}
    </ScrollView>
  );
};

export default RunDetailScreen; 
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../stores/useStore';
import { useTheme } from '../theme/ThemeProvider';
import { format, parseISO } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RunMapView from '../components/run_tracking/RunMapView';
import { useUnits } from '../hooks/useUnits'; // Import useUnits

// Helper to format duration (seconds) to HH:MM:SS or MM:SS
const formatDuration = seconds => {
  if (!seconds) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    cardTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
  });

const RunDetailScreen = ({ route }) => {
  const { runId } = route.params || {};
  const navigation = useNavigation();
  const getRunById = useStore(state => state.getRunById);
  const deleteRun = useStore(state => state.deleteRun);
  const run = getRunById ? getRunById(runId) : null;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { formatDistance, distanceUnit, fromKilometers } = useUnits(); // Call useUnits

  // Constants for conversion
  const KM_TO_MI = 0.621371; // Defined in unitUtils.js, duplicating for direct use here if needed, or ensure it's accessible.

  const handleDelete = () => {
    Alert.alert(
      'Delete Run',
      'Are you sure you want to delete this run? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRun(runId);
            navigation.goBack();
          },
        },
      ]
    );
  };

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

  // Use formatDistance from useUnits for distance display
  const displayDistance = run.distance ? formatDistance(run.distance) : { formatted: '-- --' }; // run.distance is in km

  const formattedDuration = formatDuration(run.duration);

  // Adjust pace calculation and display
  let displayPace = '--:--';
  const currentDistanceUnitLabel = distanceUnit === 'mi' ? 'min/mi' : 'min/km';

  // Assuming run.pace is total seconds per kilometer as per models/runData.js
  // If run.pace is an object like { minutes, seconds }, need to convert to total seconds first.
  // For this example, let's assume run.pace IS total seconds per km.
  // If run.pace is an object { minutes: M, seconds: S }, then:
  // const totalSecondsPerKm = run.pace ? (run.pace.minutes * 60) + run.pace.seconds : 0;

  // Let's stick to the definition in `models/runData.js`: `pace - Seconds per kilometer`
  const totalSecondsPerKm = run.pace;

  if (totalSecondsPerKm > 0) {
    let paceInSecondsPreferredUnit = totalSecondsPerKm;
    if (distanceUnit === 'mi') {
      // Convert pace from sec/km to sec/mile
      // 1 km = 0.621371 miles
      // X sec/km * (1 km / 0.621371 mi) = X / 0.621371 sec/mi
      paceInSecondsPreferredUnit = totalSecondsPerKm / KM_TO_MI;
    }
    const paceMinutes = Math.floor(paceInSecondsPreferredUnit / 60);
    const paceSeconds = Math.round(paceInSecondsPreferredUnit % 60);
    displayPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  }
  displayPace = `${displayPace} ${currentDistanceUnitLabel}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Run Details</Text>

      {run.locations && run.locations.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Route</Text>
          <RunMapView path={run.locations} />
        </Card>
      )}

      <Card>
        <Text style={styles.cardTitle}>Summary</Text>
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
          <Text style={styles.value}>{displayDistance.formatted}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formattedDuration}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Average Pace</Text>
          <Text style={styles.value}>{displayPace}</Text>
        </View>
        {run.elevationGain > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Elevation Gain</Text>
            <Text style={styles.value}>{run.elevationGain.toFixed(0)} m</Text>
          </View>
        )}
        {run.avgHeartRate > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Avg. Heart Rate</Text>
            <Text style={styles.value}>{run.avgHeartRate.toFixed(0)} bpm</Text>
          </View>
        )}
        {run.cadence > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Avg. Cadence</Text>
            <Text style={styles.value}>{run.cadence.toFixed(0)} spm</Text>
          </View>
        )}
        {run.caloriesBurned > 0 && (
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Calories Burned</Text>
            <Text style={styles.value}>{run.caloriesBurned.toFixed(0)}</Text>
          </View>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => Alert.alert('Edit', 'Edit functionality coming soon!')}
          variant="outline"
          style={{ flex: 1, marginRight: theme.spacing.sm }}
        />
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="danger"
          style={{ flex: 1, marginLeft: theme.spacing.sm }}
        />
      </View>
    </ScrollView>
  );
};

export default RunDetailScreen;

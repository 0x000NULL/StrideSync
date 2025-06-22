import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../stores/useStore';
import { useTheme } from '../theme/ThemeProvider';
import { format, parseISO } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RunMapView from '../components/run_tracking/RunMapView';

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
  const formattedDistance = run.distance ? `${run.distance.toFixed(2)} km` : '-- km';
  const formattedDuration = formatDuration(run.duration);
  const formattedPace =
    run.pace && (run.pace.minutes || run.pace.seconds)
      ? `${run.pace.minutes}:${run.pace.seconds.toString().padStart(2, '0')} min/km`
      : '--:--';

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

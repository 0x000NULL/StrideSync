/* eslint-disable react-native/no-unused-styles */
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
import {
  calculateVO2Max,
  calculateVDOT,
  calculateTRIMP,
  calculateRunningEconomy,
  calculateRunningPower,
  calculateStrideMetrics,
} from '../utils/runningMetrics';
import PropTypes from 'prop-types';

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
    flex1: {
      // Added style for flex: 1
      flex: 1,
    },
    notesRow: {
      alignItems: 'flex-start',
    },
    notesValue: {
      flex: 1,
      textAlign: 'right',
      marginLeft: 8,
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
  const { formatDistance, distanceUnit } = useUnits(); // Call useUnits

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
  // Safely convert run.startTime to a Date instance. Older saved runs might
  // store this value as a JavaScript Date object (or even a UNIX timestamp),
  // while newer ones use an ISO-8601 string.  We guard against calling
  // `parseISO` with anything other than a string to avoid runtime errors like
  // "dateString.split is not a function".
  let runDate = null;
  if (run.startTime) {
    if (typeof run.startTime === 'string') {
      try {
        runDate = parseISO(run.startTime);
      } catch (err) {
        // Fallback: attempt Date constructor if parseISO fails
        runDate = new Date(run.startTime);
      }
    } else if (run.startTime instanceof Date || typeof run.startTime === 'number') {
      // Date instance or timestamp
      runDate = new Date(run.startTime);
    }
  }
  const formattedDate = runDate ? format(runDate, 'MMMM d, yyyy') : 'Unknown date';
  const formattedTime = runDate ? format(runDate, 'h:mm a') : '';

  // Use formatDistance from useUnits for distance display
  const displayDistance = run.distance ? formatDistance(run.distance) : { formatted: '-- --' }; // run.distance is in km

  const formattedDuration = formatDuration(run.duration);

  // Determine route array (support legacy `locations` key)
  const routePath =
    (run.route && run.route.length > 0
      ? run.route
      : run.path && run.path.length > 0
        ? run.path
        : run.locations) || [];

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

      {routePath.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Route</Text>
          <RunMapView path={routePath} showUserLocation={false} />
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

      {/* Health Metrics Card */}
      {run.avgHeartRate && (
        <Card>
          <Text style={styles.cardTitle}>Health Metrics</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Avg. Heart Rate</Text>
            <Text style={styles.value}>{Math.round(run.avgHeartRate)} bpm</Text>
          </View>
          {run.maxHeartRate && (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Max Heart Rate</Text>
              <Text style={styles.value}>{Math.round(run.maxHeartRate)} bpm</Text>
            </View>
          )}
          {run.accurateCalories && (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Calories Burned (Est.)</Text>
              <Text style={styles.value}>{Math.round(run.accurateCalories)}</Text>
            </View>
          )}
          {run.enhancedTRIMP && (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Training Load (TRIMP)</Text>
              <Text style={styles.value}>{Math.round(run.enhancedTRIMP)}</Text>
            </View>
          )}
          {run.heartRateZones && (
            <>
              <Text style={styles.label}>Time in Zones:</Text>
              {Object.entries(run.heartRateZones).map(([zone, time]) => (
                <View style={styles.rowBetween} key={zone}>
                  <Text style={styles.label}>{`Zone ${zone.charAt(zone.length - 1)}`}</Text>
                  <Text style={styles.value}>{formatDuration(time)}</Text>
                </View>
              ))}
            </>
          )}
        </Card>
      )}

      {/* Performance Metrics Card */}
      <Card>
        <Text style={styles.cardTitle}>Performance Metrics</Text>

        {/* VO2 Max and VDOT */}
        {(() => {
          const distanceKm = run.distance ? run.distance / 1000 : 0;
          const vo2Max = calculateVO2Max(distanceKm, run.duration);
          const vdot = calculateVDOT(distanceKm, run.duration);

          return (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Estimated VO₂ Max</Text>
                <Text style={styles.value}>
                  {vo2Max ? `${vo2Max.toFixed(1)} ml/kg/min` : 'N/A'}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>VDOT</Text>
                <Text style={styles.value}>{vdot ? vdot.toFixed(1) : 'N/A'}</Text>
              </View>
            </>
          );
        })()}

        {/* Training Load (TRIMP) */}
        {(() => {
          const trimp = run.avgHeartRate
            ? calculateTRIMP(run.duration / 60, run.avgHeartRate)
            : null;
          return (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Training Load (TRIMP)</Text>
              <Text style={styles.value}>{trimp ? trimp.toFixed(0) : 'N/A'}</Text>
            </View>
          );
        })()}

        {/* Running Economy */}
        {(() => {
          const distanceKm = run.distance ? run.distance / 1000 : 0;
          const vo2Max = calculateVO2Max(distanceKm, run.duration);
          const runningEconomy = calculateRunningEconomy(vo2Max, run.pace);

          return (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Running Economy</Text>
              <Text style={styles.value}>
                {runningEconomy ? `${runningEconomy.toFixed(1)} ml/kg/km` : 'N/A'}
              </Text>
            </View>
          );
        })()}

        {/* Estimated Power */}
        {(() => {
          const power = calculateRunningPower(run.pace, 70, run.elevationGain || 0);
          return (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Estimated Power</Text>
              <Text style={styles.value}>{power ? `${power.toFixed(0)} W` : 'N/A'}</Text>
            </View>
          );
        })()}

        {/* Stride Metrics */}
        {(() => {
          const velocityKmh = run.pace ? 3600 / run.pace : 0;
          const strideMetrics = run.cadence
            ? calculateStrideMetrics(run.cadence, velocityKmh)
            : null;

          return (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Stride Length</Text>
                <Text style={styles.value}>
                  {strideMetrics ? `${strideMetrics.strideLength.toFixed(2)} m` : 'N/A'}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Stride Rate</Text>
                <Text style={styles.value}>
                  {strideMetrics ? `${strideMetrics.strideRate.toFixed(0)} spm` : 'N/A'}
                </Text>
              </View>
            </>
          );
        })()}

        {/* Max Heart Rate */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Max Heart Rate</Text>
          <Text style={styles.value}>
            {run.maxHeartRate > 0 ? `${run.maxHeartRate.toFixed(0)} bpm` : 'N/A'}
          </Text>
        </View>

        {/* Elevation Loss */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Elevation Loss</Text>
          <Text style={styles.value}>
            {run.elevationLoss > 0 ? `${run.elevationLoss.toFixed(0)} m` : 'N/A'}
          </Text>
        </View>

        {/* Workout Type and Effort */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Workout Type</Text>
          <Text style={styles.value}>
            {run.workoutType
              ? run.workoutType.charAt(0).toUpperCase() + run.workoutType.slice(1)
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Effort Level (RPE)</Text>
          <Text style={styles.value}>{run.effort ? `${run.effort}/5` : 'N/A'}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Mood</Text>
          <Text style={styles.value}>
            {run.mood ? run.mood.charAt(0).toUpperCase() + run.mood.slice(1) : 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Weather and Additional Details */}
      <Card>
        <Text style={styles.cardTitle}>Additional Details</Text>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Temperature</Text>
          <Text style={styles.value}>
            {run.weather && run.weather.temperature
              ? `${run.weather.temperature.toFixed(0)}°C`
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Weather</Text>
          <Text style={styles.value}>
            {run.weather && run.weather.condition
              ? run.weather.condition.charAt(0).toUpperCase() + run.weather.condition.slice(1)
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Surface Type</Text>
          <Text style={styles.value}>
            {run.surfaceType
              ? run.surfaceType.charAt(0).toUpperCase() + run.surfaceType.slice(1)
              : 'N/A'}
          </Text>
        </View>

        <View style={[styles.rowBetween, styles.notesRow]}>
          <Text style={styles.label}>Notes</Text>
          <Text style={[styles.value, styles.notesValue]}>{run.notes || 'N/A'}</Text>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('EditRun', { runId })}
          variant="outline"
          style={[styles.flex1, { marginRight: theme.spacing.sm }]}
        />
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="danger"
          style={[styles.flex1, { marginLeft: theme.spacing.sm }]}
        />
      </View>
    </ScrollView>
  );
};

RunDetailScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      runId: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default RunDetailScreen;

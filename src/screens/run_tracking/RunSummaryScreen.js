import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../../stores/useStore';
import { useUnits } from '../../hooks/useUnits';
import { formatDuration } from '../../utils/formatters';
import PropTypes from 'prop-types';

// Reusable Components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RunMapView from '../../components/run_tracking/RunMapView';
import { theme } from '../../theme/theme';

// Extract colors to use in StyleSheet definitions
const { colors } = theme;

const StatsGrid = ({ run }) => {
  const { formatDistance } = useUnits();

  const pace = useMemo(() => {
    if (run?.distance > 0 && run?.duration > 0) {
      // Pace is typically min/distance_unit
      const distance = formatDistance(run.distance / 1000).value; // distance in preferred unit
      const paceValue = run.duration / 60 / distance;
      return `${paceValue.toFixed(2)} min/${formatDistance(1).unit}`;
    }
    return `--:-- min/${formatDistance(1).unit}`;
  }, [run?.distance, run?.duration, formatDistance]);

  const stats = [
    { label: 'Total Distance', value: formatDistance(run?.distance / 1000).formatted },
    { label: 'Total Duration', value: formatDuration(run?.duration) },
    { label: 'Average Pace', value: pace },
    { label: 'Elevation Gain', value: `${run?.elevationGain?.toFixed(0) || 'N/A'} m` },
    { label: 'Elevation Loss', value: `${run?.elevationLoss?.toFixed(0) || 'N/A'} m` },
    { label: 'Calories Burned', value: `${run?.caloriesBurned?.toFixed(0) || 'N/A'} kcal` },
    { label: 'Notes', value: run?.notes || 'No notes' },
  ];

  return (
    <Card>
      <Text style={styles.cardTitle}>Key Statistics</Text>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
        </View>
      ))}
    </Card>
  );
};

StatsGrid.propTypes = {
  run: PropTypes.shape({
    distance: PropTypes.number,
    duration: PropTypes.number,
    elevationGain: PropTypes.number,
    elevationLoss: PropTypes.number,
    caloriesBurned: PropTypes.number,
    notes: PropTypes.string,
  }).isRequired,
};

const PlaceholderCard = ({ title, text }) => (
  <Card>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.placeholderContent}>
      <Text style={styles.placeholderText}>{text}</Text>
    </View>
  </Card>
);

PlaceholderCard.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const RunSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const routeRunId = route.params?.runId;

  const runs = useStore(state => state.runs);
  const currentRun = useStore(state => state.currentRun);
  const runStatus = useStore(state => state.runStatus);

  const runToDisplayId = useMemo(() => {
    if (routeRunId) {
      return routeRunId;
    }
    // If coming from ActiveRunScreen, currentRun might be the one to show
    if ((runStatus === 'complete' || runStatus === 'saving') && currentRun) {
      return currentRun.id;
    }
    return null;
  }, [routeRunId, runStatus, currentRun]);

  const runDetails = useMemo(() => {
    if (!runToDisplayId) {
      // If we just finished a run, use currentRun data
      if ((runStatus === 'complete' || runStatus === 'saving') && currentRun) {
        return currentRun;
      }
      return null;
    }
    return runs.find(r => r.id === runToDisplayId);
  }, [runToDisplayId, runs, currentRun, runStatus]);

  const handleDone = () => {
    // Navigate back to the main stack, assuming it's 'App' or 'Main'
    navigation.navigate('Home');
  };

  if (!runDetails) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.errorText}>Run details not found.</Text>
        <Text style={styles.errorText}>ID: {runToDisplayId || 'None'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Ensure path is in the correct format for RunMapView if it's stored differently
  const routePath = runDetails.route || runDetails.path || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Run Summary</Text>

      <RunMapView path={routePath} />

      <View style={styles.contentContainer}>
        <StatsGrid run={runDetails} />
        <PlaceholderCard
          title="Pace Chart"
          text="A chart showing your pace over the duration of the run will be displayed here."
        />
        <PlaceholderCard
          title="Elevation Profile"
          text="A chart showing the elevation changes over the course of the run will be shown here."
        />
        <PlaceholderCard
          title="Personal Records"
          text="Any new personal records you achieved during this run will be celebrated here!"
        />
      </View>

      <View style={styles.doneButtonContainer}>
        <Button title="Done" onPress={handleDone} fullWidth />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: colors.text.primary, // Primary text color from navigation theme
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text.primary, // Primary text color
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.border, // Using border for a lighter gray text, or colors.text and adjust opacity
    textAlign: 'center',
    lineHeight: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    maxWidth: '60%', // For notes or long values
    textAlign: 'right',
  },
  errorText: {
    fontSize: 18,
    color: colors.error || 'red', // Use theme error color if available
    textAlign: 'center',
    marginBottom: 10,
  },
  doneButtonContainer: {
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingBottom: 20, //SafeArea
  },
});

export default RunSummaryScreen;

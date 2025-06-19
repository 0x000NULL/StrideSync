import React, { useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

// Helper to format duration (seconds to HH:MM:SS) - Consider moving to a utils file
const formatDuration = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Placeholder Components
const MapWithRoutePlaceholder = ({ path }) => (
  <View style={styles.placeholderComponent}>
    <Text style={styles.placeholderTitle}>Map with Route</Text>
    <Text>Path points: {path?.length || 0}</Text>
  </View>
);

const StatsGrid = ({ run }) => {
  const pace = useMemo(() => {
    if (run?.distance > 0 && run?.duration > 0) {
      return (run.duration / 60) / (run.distance / 1000); // min/km, assuming distance in meters
    }
    return 0;
  }, [run?.distance, run?.duration]);

  return (
    <View style={styles.statsGrid}>
      <Text style={styles.placeholderTitle}>Key Statistics</Text>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total Distance:</Text>
        <Text style={styles.statValue}>{(run?.distance / 1000)?.toFixed(2) || 'N/A'} km</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total Duration:</Text>
        <Text style={styles.statValue}>{formatDuration(run?.duration) || 'N/A'}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Average Pace:</Text>
        <Text style={styles.statValue}>{pace?.toFixed(2) || 'N/A'} min/km</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Elevation Gain:</Text>
        <Text style={styles.statValue}>{run?.elevationGain?.toFixed(0) || 'N/A'} m</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Elevation Loss:</Text>
        <Text style={styles.statValue}>{run?.elevationLoss?.toFixed(0) || 'N/A'} m</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Calories Burned:</Text>
        <Text style={styles.statValue}>{run?.caloriesBurned?.toFixed(0) || 'N/A'} kcal</Text>
      </View>
       <View style={styles.statItem}>
        <Text style={styles.statLabel}>Notes:</Text>
        <Text style={styles.statValue}>{run?.notes || 'No notes'}</Text>
      </View>
    </View>
  );
};

const PaceChartPlaceholder = () => (
  <View style={styles.placeholderComponent}>
    <Text style={styles.placeholderTitle}>Pace Chart</Text>
    <Text>(Chart showing pace over time/distance)</Text>
  </View>
);

const ElevationProfilePlaceholder = () => (
  <View style={styles.placeholderComponent}>
    <Text style={styles.placeholderTitle}>Elevation Profile</Text>
    <Text>(Chart showing elevation over distance)</Text>
  </View>
);

const PersonalRecordsPlaceholder = ({ run }) => (
  <View style={styles.placeholderComponent}>
    <Text style={styles.placeholderTitle}>Personal Records</Text>
    {/* Logic to determine if any PRs were achieved would go here */}
    <Text>No new PRs this run (Placeholder)</Text>
  </View>
);

const RunSummaryScreen = ({ navigation, route }) => {
  // Allow passing runId via route params OR use selectedRunId from Redux store
  // This provides flexibility, e.g., viewing summary immediately after a run (currentRun becomes selectedRun)
  // or viewing any run from a list.
  const routeRunId = route.params?.runId;
  const selectedRunIdFromStore = useSelector(state => state.run.selectedRunId);
  const currentRun = useSelector(state => state.run.currentRun); // For immediate post-run summary
  const runStatus = useSelector(state => state.run.runStatus);

  let runToDisplayId = routeRunId || selectedRunIdFromStore;

  // If coming from ActiveRunScreen (run just completed), currentRun might be the one to show
  // if selectedRunId hasn't updated yet.
  if (!runToDisplayId && runStatus === 'complete' && currentRun) {
     runToDisplayId = currentRun.id;
  }


  const runs = useSelector(state => state.run.runs);
  const runDetails = useMemo(() => {
    if (!runToDisplayId) return null;
    // If the run was just completed and is in currentRun, use that.
    if (currentRun && currentRun.id === runToDisplayId && (runStatus === 'complete' || runStatus === 'saving')) {
        return currentRun;
    }
    return runs.find(r => r.id === runToDisplayId);
  }, [runToDisplayId, runs, currentRun, runStatus]);

  const handleDone = () => {
    // Navigate to a main screen, e.g., a Run Log or Home screen
    // This depends on your app's navigation structure
    navigation.popToTop(); // Example: Go to the top of the current stack
    // Or navigate to a specific tab/navigator:
    // navigation.navigate('MainAppTabs', { screen: 'RunLog' });
  };

  if (!runDetails) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.errorText}>Run details not found.</Text>
        <Text style={styles.errorText}>ID: {runToDisplayId || "None"}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Run Summary</Text>

      <MapWithRoutePlaceholder path={runDetails.path} />
      <StatsGrid run={runDetails} />
      <PaceChartPlaceholder />
      <ElevationProfilePlaceholder />
      <PersonalRecordsPlaceholder run={runDetails} />

      <View style={styles.doneButtonContainer}>
        <Button title="Done" onPress={handleDone} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#333',
  },
  placeholderComponent: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  statsGrid: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 16,
    color: '#444',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    maxWidth: '70%', // For notes or long values
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom:10,
  },
  doneButtonContainer: {
    marginVertical: 30,
    paddingHorizontal: 15,
  }
});

export default RunSummaryScreen;

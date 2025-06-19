import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

// Placeholder Components
const MapWithRoutePlaceholder = () => (
  <View style={styles.placeholderBox}>
    <Text>Map with Route Placeholder</Text>
  </View>
);

const PaceChartPlaceholder = () => (
  <View style={styles.placeholderBox}>
    <Text>Pace Chart Placeholder</Text>
  </View>
);

const ElevationProfilePlaceholder = () => (
  <View style={styles.placeholderBox}>
    <Text>Elevation Profile Placeholder</Text>
  </View>
);

// Stats Grid Component
const StatsGrid = ({ stats }) => (
  <View style={styles.statsGridContainer}>
    <Text style={styles.sectionTitle}>Run Statistics</Text>
    <View style={styles.grid}>
      {Object.entries(stats).map(([key, value]) => (
        <View style={styles.statCell} key={key}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
        </View>
      ))}
    </View>
  </View>
);

// Personal Records Component
const PersonalRecords = ({ records }) => (
  <View style={styles.personalRecordsContainer}>
    <Text style={styles.sectionTitle}>Personal Records</Text>
    {records.length > 0 ? (
      records.map((record, index) => (
        <Text key={index} style={styles.recordText}>🏆 {record}</Text>
      ))
    ) : (
      <Text style={styles.noRecordText}>No new personal records this time.</Text>
    )}
  </View>
);

const RunSummaryScreen = ({ route, navigation }) => {
  // Mock data, potentially overridden by route params
  const passedParams = route.params || {};
  const { pausedStats, note } = passedParams;

  const summaryData = {
    totalDistance: pausedStats?.distance || '5.02',
    duration: pausedStats?.time || '00:30:45',
    averagePace: pausedStats?.pace || '6:08',
    caloriesBurned: '350',
    averageHeartRate: '160',
    maxHeartRate: '175',
    elevationGain: '50m',
    cadence: '170spm',
  };

  const personalRecordsData = [
    'Fastest 5K',
    'Longest Run',
  ];

  const runNote = note || passedParams.runNote || "No note added for this run.";


  const handleSaveRun = () => {
    navigation.navigate('SaveRun', { summaryData, personalRecordsData, runNote });
  };

  const handleDiscard = () => {
     Alert.alert(
      "Discard Run?",
      "Are you sure you want to discard this run? It will not be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", onPress: () => navigation.navigate('PreRun'), style: "destructive" }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Run Summary</Text>

      <MapWithRoutePlaceholder />
      <StatsGrid stats={summaryData} />
      <PaceChartPlaceholder />
      <ElevationProfilePlaceholder />
      <PersonalRecords records={personalRecordsData} />

      <View style={styles.noteSection}>
        <Text style={styles.sectionTitle}>Run Note</Text>
        <Text style={styles.noteText}>{runNote}</Text>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveRun}>
          <Text style={styles.buttonText}>Save Run</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.discardButton]} onPress={handleDiscard}>
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#2c3e50',
  },
  placeholderBox: {
    height: 180,
    backgroundColor: '#e0e6ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
    marginLeft: 15,
    marginBottom: 10,
  },
  statsGridContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCell: {
    width: '48%', // Two columns
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  personalRecordsContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  recordText: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 5,
  },
  noRecordText: {
    fontSize: 15,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  noteSection: {
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  noteText: {
    fontSize: 15,
    color: '#34495e',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopColor: '#e0e6ed',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#27ae60', // Green
  },
  discardButton: {
    backgroundColor: '#c0392b', // Darker Red
  },
});

export default RunSummaryScreen;

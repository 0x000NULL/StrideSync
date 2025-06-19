import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

// Run Stats Summary Component
const RunStatsSummary = ({ distance, time, pace }) => (
  <View style={styles.statsSummaryContainer}>
    <Text style={styles.summaryTitle}>Run Paused</Text>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Distance:</Text>
      <Text style={styles.statValue}>{distance} km</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Time:</Text>
      <Text style={styles.statValue}>{time}</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Average Pace:</Text>
      <Text style={styles.statValue}>{pace} min/km</Text>
    </View>
  </View>
);

// Note Input Component
const NoteInput = ({ note, onChangeNote }) => (
  <View style={styles.noteInputContainer}>
    <Text style={styles.noteLabel}>Add a Note (Optional):</Text>
    <TextInput
      style={styles.textInput}
      value={note}
      onChangeText={onChangeNote}
      placeholder="How was the run?"
      multiline
    />
  </View>
);

const PauseScreen = ({ navigation }) => {
  // Mock data for stats summary
  const [summaryStats, setSummaryStats] = useState({
    distance: '3.10', // Example data
    time: '00:20:05', // Example data
    pace: '6:29',    // Example data
  });
  const [note, setNote] = useState('');

  const handleResume = () => {
    navigation.navigate('ActiveRun');
  };

  const handleSave = () => {
    // Navigate to RunSummary, which then can lead to SaveRun
    navigation.navigate('RunSummary', { pausedStats: summaryStats, note });
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Run?",
      "Are you sure you want to discard this run? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", onPress: () => navigation.navigate('PreRun'), style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <RunStatsSummary {...summaryStats} />
      <NoteInput note={note} onChangeNote={setNote} />
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.button, styles.resumeButton]} onPress={handleResume}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.discardButton]} onPress={handleDiscard}>
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f8', // Light background for a paused state
    justifyContent: 'center',
  },
  statsSummaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#555',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noteInputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  noteLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top', // For multiline
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumeButton: {
    backgroundColor: '#2ecc71', // Green
  },
  saveButton: {
    backgroundColor: '#3498db', // Blue
  },
  discardButton: {
    backgroundColor: '#e74c3c', // Red
  },
});

export default PauseScreen;

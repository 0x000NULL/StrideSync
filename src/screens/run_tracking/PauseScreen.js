import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { resumeRun, cancelActiveRun, updateRun } from '../../stores/run_tracking/runSlice'; // Assuming cancelActiveRun handles discard
import PropTypes from 'prop-types';

// Helper to format duration (seconds to HH:MM:SS) - Duplicated from ActiveRunScreen, consider moving to utils
const formatDuration = totalSeconds => {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Placeholder Components
const RunStatsSummary = ({ distance, duration, pace }) => (
  <View style={styles.summaryContainer}>
    <Text style={styles.summaryTitle}>Run Paused</Text>
    <Text style={styles.statText}>Distance: {distance.toFixed(2)} km</Text>
    <Text style={styles.statText}>Duration: {formatDuration(duration)}</Text>
    <Text style={styles.statText}>Pace: {pace.toFixed(2)} min/km</Text>
  </View>
);

const NoteInput = ({ notes, onNotesChange }) => (
  <View style={styles.notesContainer}>
    <Text style={styles.notesLabel}>Run Notes:</Text>
    <TextInput
      style={styles.textInput}
      placeholder="How was your run?"
      value={notes}
      onChangeText={onNotesChange}
      multiline
      numberOfLines={4}
    />
  </View>
);

const ActionButtons = ({ onResume, onSave, onDiscard }) => (
  <View style={styles.actionButtonsContainer}>
    <Button title="Resume Run" onPress={onResume} color="green" />
    <Button title="Finish & Save Run" onPress={onSave} color="blue" />
    <Button title="Discard Run" onPress={onDiscard} color="red" />
  </View>
);

const PauseScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentRun = useSelector(state => state.run.currentRun);
  const runStatus = useSelector(state => state.run.runStatus);

  const [notes, setNotes] = useState(currentRun?.notes || '');

  // Update local notes if currentRun.notes changes from elsewhere (e.g. rehydration)
  useEffect(() => {
    if (currentRun?.notes && currentRun.notes !== notes) {
      setNotes(currentRun.notes);
    }
  }, [currentRun?.notes]);

  const duration = currentRun?.duration || 0; // Assuming duration is tracked in seconds
  const distance = currentRun?.distance || 0; // Assuming distance in km

  const pace = useMemo(() => {
    if (distance > 0 && duration > 0) {
      return duration / 60 / distance; // min/km
    }
    return 0;
  }, [distance, duration]);

  const handleResumeRun = () => {
    dispatch(resumeRun());
    navigation.goBack(); // Or navigate('ActiveRun') if not coming directly from there
  };

  const handleSaveRun = () => {
    // Update notes in currentRun before navigating.
    // This ensures SaveRunScreen has the latest notes.
    // Alternatively, SaveRunScreen could manage notes input itself.
    if (currentRun && notes !== currentRun.notes) {
      dispatch(updateRun({ runId: currentRun.id, updates: { notes } }));
    }
    navigation.navigate('SaveRun');
  };

  const handleDiscardRun = () => {
    Alert.alert(
      'Discard Run',
      'Are you sure you want to discard this run? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          onPress: () => {
            dispatch(cancelActiveRun()); // This thunk should handle unregistering tasks and then discardRun
            navigation.navigate('RunFlowNavigator', { screen: 'PreRun' }); // Navigate to a neutral screen
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (runStatus !== 'paused' && runStatus !== 'complete') {
    // If the run is no longer paused (e.g., discarded from elsewhere, or resumed and quickly paused then stopped)
    // it might be better to redirect.
    useEffect(() => {
      if (runStatus !== 'paused' && runStatus !== 'complete') {
        console.log(`PauseScreen: Run status is ${runStatus}, navigating away.`);
        navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
      }
    }, [runStatus, navigation]);

    return (
      <View style={styles.container}>
        <Text>Run is not paused. Redirecting...</Text>
      </View>
    );
  }

  if (!currentRun) {
    // This case should ideally not be reached if navigation is managed properly
    // (i.e., only navigate to PauseScreen if there's a pausable currentRun)
    useEffect(() => {
      if (!currentRun) {
        navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
      }
    }, [currentRun, navigation]);
    return (
      <View style={styles.container}>
        <Text>No active run data. Redirecting...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <RunStatsSummary distance={distance} duration={duration} pace={pace} />
      <NoteInput notes={notes} onNotesChange={setNotes} />
      <ActionButtons
        onResume={handleResumeRun}
        onSave={handleSaveRun}
        onDiscard={handleDiscardRun}
      />
      <View style={styles.debugInfo}>
        <Text>Run Status: {runStatus}</Text>
        <Text>Run ID: {currentRun?.id}</Text>
        <Text>Stored Notes: {currentRun?.notes}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statText: {
    fontSize: 18,
    marginBottom: 8,
  },
  notesContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 2,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    minHeight: 80,
    textAlignVertical: 'top', // For Android multiline
    backgroundColor: '#fff',
  },
  actionButtonsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    marginHorizontal: 15,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
});

RunStatsSummary.propTypes = {
  distance: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  pace: PropTypes.number.isRequired,
};

NoteInput.propTypes = {
  notes: PropTypes.string.isRequired,
  onNotesChange: PropTypes.func.isRequired,
};

ActionButtons.propTypes = {
  onResume: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
};

PauseScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    reset: PropTypes.func,
  }).isRequired,
};

export default PauseScreen;

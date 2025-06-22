import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { resumeRun, cancelActiveRun, updateRun } from '../../stores/run_tracking/runSlice'; // Assuming cancelActiveRun handles discard
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

// Helper to format duration (seconds to HH:MM:SS) - Duplicated from ActiveRunScreen, consider moving to utils
const formatDuration = totalSeconds => {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Placeholder Components - These will now need access to theme or have styles passed in.
// For simplicity, we'll define styles within each or make them accept theme.

const RunStatsSummary = ({ distance, duration, pace }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    summaryContainer: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      elevation: 2,
    },
    summaryTitle: {
      fontSize: 22, // Consider theme.typography.h4.fontSize
      fontWeight: 'bold',
      marginBottom: theme.spacing.md,
      color: theme.colors.text.primary,
    },
    statText: {
      fontSize: 18, // Consider theme.typography.body1.fontSize
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.secondary,
    },
  });
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Run Paused</Text>
      <Text style={styles.statText}>Distance: {distance.toFixed(2)} km</Text>
      <Text style={styles.statText}>Duration: {formatDuration(duration)}</Text>
      <Text style={styles.statText}>Pace: {pace.toFixed(2)} min/km</Text>
    </View>
  );
};

const NoteInput = ({ notes, onNotesChange }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    notesContainer: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      elevation: 2,
    },
    notesLabel: {
      fontSize: 16, // Consider theme.typography.subtitle1.fontSize
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      minHeight: 80,
      textAlignVertical: 'top', // For Android multiline
      backgroundColor: theme.colors.surface, // Or theme.colors.background
      color: theme.colors.text.primary,
    },
  });
  return (
    <View style={styles.notesContainer}>
      <Text style={styles.notesLabel}>Run Notes:</Text>
      <TextInput
        style={styles.textInput}
        placeholder="How was your run?"
        placeholderTextColor={theme.colors.text.secondary}
        value={notes}
        onChangeText={onNotesChange}
        multiline
        numberOfLines={4}
      />
    </View>
  );
};

const ActionButtons = ({ onResume, onSave, onDiscard }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    actionButtonsContainer: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      // For Button components, color prop might not work as expected for custom Button.
      // Custom Button usually takes 'variant' or uses style prop for theming.
    },
  });
  return (
    <View style={styles.actionButtonsContainer}>
      <Button title="Resume Run" onPress={onResume} variant="success" style={{ marginBottom: theme.spacing.sm }} />
      <Button title="Finish & Save Run" onPress={onSave} variant="primary" style={{ marginBottom: theme.spacing.sm }} />
      <Button title="Discard Run" onPress={onDiscard} variant="danger" />
    </View>
  );
};

const PauseScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentRun = useSelector(state => state.run.currentRun);
  const runStatus = useSelector(state => state.run.runStatus);

  const [notes, setNotes] = useState(currentRun?.notes || '');

  // Styles specific to PauseScreen container and debugInfo
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.lg,
    },
    debugInfo: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
    },
    text: { // Generic text style if needed for "Redirecting..."
        color: theme.colors.text.primary,
        textAlign: 'center',
        padding: theme.spacing.lg,
    }
  });


  // Update local notes if currentRun.notes changes from elsewhere (e.g. rehydration)
  useEffect(() => {
    if (currentRun?.notes && currentRun.notes !== notes) {
      setNotes(currentRun.notes);
    }
  }, [currentRun?.notes, notes]); // Added notes to dependencies

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
            dispatch(cancelActiveRun());
            navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
          },
          style: 'destructive',
        },
      ]
    );
  };

  // useEffect for navigation based on runStatus
  useEffect(() => {
    if (runStatus !== 'paused' && runStatus !== 'complete') {
      console.log(`PauseScreen: Run status is ${runStatus}, navigating away.`);
      navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
    }
  }, [runStatus, navigation]);

  // useEffect for navigation based on currentRun
  useEffect(() => {
    if (!currentRun && (runStatus === 'paused' || runStatus === 'complete')) { // Only navigate if we expected a run but it's gone
      console.log('PauseScreen: currentRun is null, navigating away.');
      navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
    }
  }, [currentRun, runStatus, navigation]);


  if (runStatus !== 'paused' && runStatus !== 'complete') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Run is not paused. Redirecting...</Text>
      </View>
    );
  }

  if (!currentRun) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No active run data. Redirecting...</Text>
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
        <Text style={{color: theme.colors.text.secondary}}>Run Status: {runStatus}</Text>
        <Text style={{color: theme.colors.text.secondary}}>Run ID: {currentRun?.id}</Text>
        <Text style={{color: theme.colors.text.secondary}}>Stored Notes: {currentRun?.notes}</Text>
      </View>
    </ScrollView>
  );
};

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

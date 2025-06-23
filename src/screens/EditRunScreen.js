import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PropTypes from 'prop-types';
// Zustand store helpers
import { useStore } from '../stores/useStore';
// Theme + UI
import { useTheme } from '../theme/ThemeProvider';
import Button from '../components/ui/Button';
// Form sub-components reused from SaveRun flow
import RunDetailsForm from '../components/run_tracking/save_run/RunDetailsForm';
import WeatherSelector from '../components/run_tracking/save_run/WeatherSelector';
import EffortMoodSelector from '../components/run_tracking/save_run/EffortMoodSelector';
import ShoeSelector from '../components/run_tracking/ShoeSelector';

const EditRunScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  const runId = route.params?.runId;

  // Zustand store selectors
  const getRunById = useStore(state => state.getRunById);
  const updateRun = useStore(state => state.updateRun);

  const run = getRunById ? getRunById(runId) : null;

  // Local form state
  const [runName, setRunName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedShoeId, setSelectedShoeId] = useState(null);
  const [weather, setWeather] = useState(null); // e.g., 'Sunny', 'Cloudy'
  const [effort, setEffort] = useState(3); // Scale 1-5
  const [mood, setMood] = useState('Okay');

  // Populate local state from run once on mount / when run changes
  useEffect(() => {
    if (!run) return;

    // Avoid overwriting if user already typed something
    if (runName === '') setRunName(run.name || '');
    if (notes === '') setNotes(run.notes || '');
    if (selectedShoeId === null) setSelectedShoeId(run.shoeId || null);
    if (weather === null) setWeather(run.weather?.condition || null);
    if (effort === 3) setEffort(run.effort ?? 3);
    if (mood === 'Okay') setMood(run.mood || 'Okay');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const handleSave = () => {
    if (!run) {
      Alert.alert('Error', 'Run not found.');
      return;
    }

    const updates = {
      name: runName.trim(),
      notes: notes.trim(),
      shoeId: selectedShoeId,
      weather: { ...(run.weather || {}), condition: weather },
      effort,
      mood,
    };

    try {
      updateRun(runId, updates);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update run', err);
      Alert.alert('Error', 'Failed to update run. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flexGrow: 1,
    },
    content: {
      padding: theme.spacing.md,
    },
    title: {
      ...(theme.typography?.h2 || { fontSize: 22, fontWeight: 'bold' }),
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: theme.spacing.lg,
    },
    flex1: {
      flex: 1,
    },
  });

  if (!run) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Run not found.</Text>
        <View style={styles.actionButtons}>
          <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Run</Text>

          <RunDetailsForm
            name={runName}
            notes={notes}
            onNameChange={setRunName}
            onNotesChange={setNotes}
          />

          <View style={{ marginHorizontal: theme.spacing.md, marginVertical: theme.spacing.sm }}>
            <ShoeSelector selectedShoeId={selectedShoeId} onSelectShoe={setSelectedShoeId} />
          </View>

          <WeatherSelector weather={weather} onWeatherChange={setWeather} />
          <EffortMoodSelector
            effort={effort}
            mood={mood}
            onEffortChange={setEffort}
            onMoodChange={setMood}
          />

          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={[styles.flex1, { marginRight: theme.spacing.sm }]}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              variant="primary"
              style={[styles.flex1, { marginLeft: theme.spacing.sm }]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Define route params for TypeScript / PropTypes consumers
EditRunScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      runId: PropTypes.string.isRequired,
    }),
  }),
};

export default EditRunScreen;

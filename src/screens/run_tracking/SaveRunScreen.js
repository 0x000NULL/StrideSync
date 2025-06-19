import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, TextInput, ScrollView, Switch, Alert, TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { saveRun, cancelActiveRun, updateRun, setSelectedRunId } from '../../stores/run_tracking/runSlice'; // Assuming setSelectedRunId exists

// Placeholder Components (could be imported or defined more elaborately)
const RunDetailsForm = ({ name, notes, onNameChange, onNotesChange }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Run Details</Text>
    <TextInput style={styles.input} placeholder="Run Name (e.g., Morning Jog)" value={name} onChangeText={onNameChange} />
    <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={onNotesChange} multiline numberOfLines={3} />
  </View>
);

const ShoeSelectorPlaceholder = ({ selectedShoe, onSelectShoe }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Shoe Used</Text>
    <TouchableOpacity onPress={() => onSelectShoe(selectedShoe === 'shoe_xyz' ? 'shoe_abc' : 'shoe_xyz')}>
      <Text style={styles.selectorText}>
        {selectedShoe || 'Select a shoe'} (Tap to change)
      </Text>
    </TouchableOpacity>
  </View>
);

const WeatherSelectorPlaceholder = ({ weather, onWeatherChange }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Weather Condition</Text>
    <View style={styles.buttonGroup}>
      {['Sunny', 'Cloudy', 'Rainy'].map(w => (
        <Button key={w} title={w} onPress={() => onWeatherChange(w)} color={weather === w ? 'dodgerblue' : 'gray'} />
      ))}
    </View>
  </View>
);

const EffortMoodSelector = ({ effort, mood, onEffortChange, onMoodChange }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Effort & Mood</Text>
    <Text>Effort: {effort}/5</Text>
    {/* Placeholder for sliders or segmented controls */}
    <View style={styles.buttonGroup}>
        {[1,2,3,4,5].map(e => <Button key={e} title={String(e)} onPress={() => onEffortChange(e)} color={effort === e ? 'coral' : 'gray'}/>)}
    </View>
    <Text style={{marginTop: 5}}>Mood: {mood}</Text>
     <View style={styles.buttonGroup}>
        {['Great', 'Good', 'Okay', 'Bad'].map(m => <Button key={m} title={m} onPress={() => onMoodChange(m)} color={mood === m ? 'limegreen' : 'gray'}/>)}
    </View>
  </View>
);

const ExportOptions = ({ exportGPX, onToggleGPX, exportTCX, onToggleTCX }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Export Options</Text>
    <View style={styles.switchContainer}>
      <Text>Export as GPX</Text>
      <Switch value={exportGPX} onValueChange={onToggleGPX} />
    </View>
    <View style={styles.switchContainer}>
      <Text>Export as TCX</Text>
      <Switch value={exportTCX} onValueChange={onToggleTCX} />
    </View>
  </View>
);


const SaveRunScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentRun = useSelector(state => state.run.currentRun);
  const runStatus = useSelector(state => state.run.runStatus);

  const [runName, setRunName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedShoeId, setSelectedShoeId] = useState(null);
  const [weather, setWeather] = useState(null); // e.g., 'Sunny', 'Cloudy'
  const [effort, setEffort] = useState(3); // Scale 1-5
  const [mood, setMood] = useState('Okay'); // e.g., 'Good', 'Okay', 'Bad'
  const [exportGPX, setExportGPX] = useState(false);
  const [exportTCX, setExportTCX] = useState(false);

  useEffect(() => {
    if (currentRun) {
      setNotes(currentRun.notes || '');
      setSelectedShoeId(currentRun.shoeId || null);
      // Potentially pre-fill other fields if they exist on currentRun
      // e.g., setRunName(currentRun.name || `Run on ${new Date(currentRun.startTime).toLocaleDateString()}`);
      if (!runName && currentRun.startTime) {
        setRunName(`Run - ${new Date(currentRun.startTime).toLocaleDateString()} ${new Date(currentRun.startTime).toLocaleTimeString()}`);
      }
      if(currentRun.weather?.condition) setWeather(currentRun.weather.condition);
      if(currentRun.effort) setEffort(currentRun.effort);
      if(currentRun.mood) setMood(currentRun.mood);

    } else if (runStatus !== 'saving') {
      // If there's no currentRun and we are not in 'saving' status (which might be transiently nulling currentRun)
      // then perhaps the user navigated here incorrectly.
      Alert.alert("No Run Data", "There is no active run to save.", [{ text: "OK", onPress: () => navigation.navigate('PreRun') }]);
    }
  }, [currentRun, runStatus, navigation, runName]);


  const handleSaveRun = ()_=> {
    if (!currentRun) {
      Alert.alert("Error", "No run data available to save.");
      return;
    }

    const finalRunData = {
      ...currentRun,
      name: runName,
      notes,
      shoeId: selectedShoeId,
      weather: { ...(currentRun.weather || {}), condition: weather }, // Merge with existing weather data if any
      effort,
      mood,
      // Potentially add export preferences to metadata if needed, or handle export here
      // For now, export toggles are UI only.
      status: 'completed', // Ensure status is marked as completed
      endTime: currentRun.endTime || Date.now(), // Ensure endTime is set
    };

    console.log('Saving run:', finalRunData);
    dispatch(saveRun(finalRunData)); // This action should add to runs array and clear currentRun
    dispatch(setSelectedRunId(finalRunData.id)); // Set this for RunSummaryScreen

    // Navigate to RunSummaryScreen with the ID of the saved run
    navigation.navigate('RunSummary', { runId: finalRunData.id });
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Run",
      "Are you sure you want to discard this run? All progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          onPress: () => {
            dispatch(cancelActiveRun()); // This should also unregister background tasks
            navigation.navigate('RunFlowNavigator', { screen: 'PreRun' });
          },
          style: "destructive"
        },
      ]
    );
  };

  // Redirect if currentRun becomes null unexpectedly (e.g. discarded from another process)
    useEffect(() => {
        if (!currentRun && runStatus !== 'idle' && runStatus !== 'saving') {
            // runStatus idle means it was discarded, saving is a brief moment currentRun might be cleared by saveRun
            Alert.alert("Run Ended", "The active run session has ended.", [
                { text: "OK", onPress: () => navigation.navigate('PreRun') }
            ]);
        }
    }, [currentRun, runStatus, navigation]);


  if (!currentRun && runStatus !== 'saving') {
    // Render nothing or a loading indicator while useEffect redirects
    return (
        <View style={styles.containerCenter}>
            <Text>Loading or no active run data...</Text>
        </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Save Your Run</Text>

      <RunDetailsForm name={runName} notes={notes} onNameChange={setRunName} onNotesChange={setNotes} />
      <ShoeSelectorPlaceholder selectedShoe={selectedShoeId} onSelectShoe={setSelectedShoeId} />
      <WeatherSelectorPlaceholder weather={weather} onWeatherChange={setWeather} />
      <EffortMoodSelector effort={effort} mood={mood} onEffortChange={setEffort} onMoodChange={setMood} />
      <ExportOptions
        exportGPX={exportGPX} onToggleGPX={() => setExportGPX(p => !p)}
        exportTCX={exportTCX} onToggleTCX={() => setExportTCX(p => !p)}
      />

      <View style={styles.actionButtons}>
        <Button title="Save Run" onPress={handleSaveRun} color="green" />
        <Button title="Discard Run" onPress={handleDiscard} color="red" />
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectorText: {
    paddingVertical: 10,
    fontSize: 16,
    color: 'dodgerblue',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow wrapping for many buttons
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 15,
    marginTop: 10,
  }
});

export default SaveRunScreen;

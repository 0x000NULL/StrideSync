import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { saveRun, cancelActiveRun, setSelectedRunId } from '../../stores/run_tracking/runSlice';

// Import newly extracted components
import RunDetailsForm from '../../components/run_tracking/save_run/RunDetailsForm';
import WeatherSelector from '../../components/run_tracking/save_run/WeatherSelector';
import EffortMoodSelector from '../../components/run_tracking/save_run/EffortMoodSelector';
import ShoeSelector from '../../components/run_tracking/ShoeSelector';


const SaveRunScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  // Changed to use useStore hook from Zustand
  const currentRun = useSelector(state => state.run.currentRun);
  const runStatus = useSelector(state => state.run.runStatus);

  const [runName, setRunName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedShoeId, setSelectedShoeId] = useState(null);
  const [weather, setWeather] = useState(null); // e.g., 'Sunny', 'Cloudy'
  const [effort, setEffort] = useState(3); // Scale 1-5
  const [mood, setMood] = useState('Okay'); // e.g., 'Good', 'Okay', 'Bad'

  useEffect(() => {
    if (currentRun) {
      setNotes(currentRun.notes || '');
      setSelectedShoeId(currentRun.shoeId || null);
      if (!runName && currentRun.startTime) {
        setRunName(`Run - ${new Date(currentRun.startTime).toLocaleDateString()} ${new Date(currentRun.startTime).toLocaleTimeString()}`);
      }
      if(currentRun.weather?.condition) setWeather(currentRun.weather.condition);
      if(currentRun.effort) setEffort(currentRun.effort);
      if(currentRun.mood) setMood(currentRun.mood);

    } else if (runStatus !== 'saving') {
      Alert.alert("No Run Data", "There is no active run to save.", [{ text: "OK", onPress: () => navigation.navigate('Home') }]);
    }
  }, [currentRun, runStatus, navigation, runName]);


  const handleSaveRun = () => {
    if (!currentRun) {
      Alert.alert("Error", "No run data available to save.");
      return;
    }

    const finalRunData = {
      ...currentRun,
      name: runName,
      notes,
      shoeId: selectedShoeId,
      weather: { ...(currentRun.weather || {}), condition: weather },
      effort,
      mood,
      distance: (currentRun.finalDistance || currentRun.distance || 0) * 1000,
      duration: currentRun.finalDuration || currentRun.duration || 0,
      status: 'completed',
      endTime: currentRun.endTime || Date.now(),
    };

    dispatch(saveRun(finalRunData));
    dispatch(setSelectedRunId(finalRunData.id));

    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'RunSummary', params: { runId: finalRunData.id } }
      ],
    });
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
            dispatch(cancelActiveRun());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
          style: "destructive"
        },
      ]
    );
  };

  useEffect(() => {
        if (!currentRun && runStatus !== 'idle' && runStatus !== 'saving') {
            Alert.alert("Run Ended", "The active run session has ended.", [
                { text: "OK", onPress: () => navigation.navigate('Home') }
            ]);
        }
    }, [currentRun, runStatus, navigation]);


  if (!currentRun && runStatus !== 'saving') {
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
      
      <View style={styles.formSection}>
        <ShoeSelector selectedShoeId={selectedShoeId} onSelectShoe={setSelectedShoeId} />
      </View>

      <WeatherSelector weather={weather} onWeatherChange={setWeather} />
      <EffortMoodSelector effort={effort} mood={mood} onEffortChange={setEffort} onMoodChange={setMood} />

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
    marginHorizontal: 15,
    marginVertical: 8,
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

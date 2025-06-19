import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';

const SaveRunScreen = ({ route, navigation }) => {
  // Expected route.params: { runData: { distance, duration, pace, calories, routeCoordinates } }
  const { runData } = route.params || {};

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [felt, setFelt] = useState(''); // e.g., "Good", "Okay", "Tough"
  const [weather, setWeather] = useState(''); // e.g., "Sunny", "Cloudy", "Rainy"

  if (!runData) {
    // Fallback if no runData is provided
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No run data available to save.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const handleSaveRun = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your run.');
      return;
    }

    const fullRunDetails = {
      ...runData, // distance, duration, pace, calories, routeCoordinates
      title: title.trim(),
      notes: notes.trim(),
      felt: felt.trim(),
      weather: weather.trim(),
      savedAt: new Date().toISOString(), // Add a timestamp for when it was saved
    };

    // Placeholder for actual saving logic (e.g., AsyncStorage, API call)
    console.log('Saving full run details:', fullRunDetails);
    Alert.alert('Run Saved!', 'Your run details have been saved.');

    // Navigate to a screen showing all saved runs or back to a main screen
    // For example, navigate to a hypothetical 'RunHistory' screen or pop to top
    navigation.popToTop(); // Or navigate to a specific screen like navigation.navigate('RunHistory');
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Run?",
      "Are you sure you want to discard this run? Any details entered will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => navigation.goBack() }
        // Or popToTop if this screen can only be accessed after a run
        // { text: "Discard", style: "destructive", onPress: () => navigation.popToTop() }
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Save Your Run</Text>

      <View style={styles.runMetricsPreview}>
        <Text style={styles.previewTitle}>Run Metrics:</Text>
        <Text style={styles.previewText}>Distance: {runData.distance ? runData.distance.toFixed(2) : 'N/A'} km</Text>
        <Text style={styles.previewText}>Duration: {runData.duration ? `${Math.floor(runData.duration / 60)}m ${runData.duration % 60}s` : 'N/A'}</Text>
        {/* Add more metrics if desired, like pace or calories */}
      </View>

      <Text style={styles.label}>Title*</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Morning Jog, Park Loop"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="How was your run? Any PBs or notable things?"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>How I Felt</Text>
      <TextInput
        style={styles.input}
        value={felt}
        onChangeText={setFelt}
        placeholder="e.g., Strong, Tired, Energized"
      />

      <Text style={styles.label}>Weather Conditions</Text>
      <TextInput
        style={styles.input}
        value={weather}
        onChangeText={setWeather}
        placeholder="e.g., Sunny and warm, Windy, Light rain"
      />

      <View style={styles.buttonsContainer}>
        <Button title="Save Run" onPress={handleSaveRun} color="#4CAF50" />
        <Button title="Discard" onPress={handleDiscard} color="#F44336" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  runMetricsPreview: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  previewText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Android specific
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40, // Ensure space for scroll
  },
});

export default SaveRunScreen;

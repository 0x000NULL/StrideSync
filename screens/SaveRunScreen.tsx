import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';

// Reusable Selector Component (could be moved to a common components folder)
const CustomSelector = ({ label, options, selectedValue, onValueChange }) => (
  <View style={styles.selectorContainer}>
    <Text style={styles.label}>{label}:</Text>
    <View style={styles.optionsRow}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            selectedValue === option.value && styles.selectedOption
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text style={[styles.optionText, selectedValue === option.value && styles.selectedOptionText]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


const SaveRunScreen = ({ route, navigation }) => {
  const { summaryData = {}, personalRecordsData = [], runNote = "" } = route.params || {};

  const [runTitle, setRunTitle] = useState(summaryData.title || `Run on ${new Date().toLocaleDateString()}`);
  const [notes, setNotes] = useState(runNote || '');
  const [selectedShoe, setSelectedShoe] = useState(''); // Assuming shoe data might come from pre-run or be fetched
  const [weather, setWeather] = useState(''); // e.g., 'Sunny', 'Cloudy', 'Rainy'
  const [effort, setEffort] = useState(''); // e.g., 'Easy', 'Moderate', 'Hard'
  const [mood, setMood] = useState(''); // e.g., 'Great', 'Good', 'Okay', 'Bad'

  const shoeOptions = [
    { label: 'Shoe A', value: 'shoe_a' },
    { label: 'Shoe B', value: 'shoe_b' },
    { label: 'None', value: 'none' },
  ];
  const weatherOptions = [
    { label: '☀️ Sunny', value: 'sunny' },
    { label: '☁️ Cloudy', value: 'cloudy' },
    { label: '🌧️ Rainy', value: 'rainy' },
    { label: '❄️ Snowy', value: 'snowy' },
  ];
  const effortOptions = [
    { label: 'Easy 😊', value: 'easy' },
    { label: 'Moderate 🙂', value: 'moderate' },
    { label: 'Hard 😓', value: 'hard' },
  ];
  const moodOptions = [
    { label: 'Great 😄', value: 'great' },
    { label: 'Good 👍', value: 'good' },
    { label: 'Okay 😐', value: 'okay' },
    { label: 'Bad 👎', value: 'bad' },
  ];

  const handleSave = () => {
    // In a real app, this would involve API calls, database saving, etc.
    Alert.alert(
      "Run Saved (Simulated)",
      `Title: ${runTitle}\nShoe: ${selectedShoe}\nWeather: ${weather}\nEffort: ${effort}\nMood: ${mood}\nNotes: ${notes}`,
      [{ text: "OK", onPress: () => navigation.popToTop() }] // Pop to top of stack (PreRun)
    );
    // Or navigate to a specific screen like a feed or dashboard
    // navigation.navigate('AppDashboard');
  };

  const handleCancel = () => {
    navigation.goBack(); // Go back to RunSummaryScreen
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Save Your Run</Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>Run Title:</Text>
        <TextInput
          style={styles.input}
          value={runTitle}
          onChangeText={setRunTitle}
          placeholder="e.g., Morning Jog, Long Run"
        />

        <Text style={styles.label}>Notes:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it go? Any specific feelings or observations?"
          multiline
        />
      </View>

      <CustomSelector
        label="Shoes"
        options={shoeOptions}
        selectedValue={selectedShoe}
        onValueChange={setSelectedShoe}
      />
      <CustomSelector
        label="Weather"
        options={weatherOptions}
        selectedValue={weather}
        onValueChange={setWeather}
      />
      <CustomSelector
        label="Perceived Effort"
        options={effortOptions}
        selectedValue={effort}
        onValueChange={setEffort}
      />
      <CustomSelector
        label="Mood"
        options={moodOptions}
        selectedValue={mood}
        onValueChange={setMood}
      />

      <View style={styles.placeholderSection}>
        <Text style={styles.label}>Export Options:</Text>
        <Text style={styles.placeholderText}>GPX, TCX export options will be here.</Text>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Run</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#1a2b48', // Dark blue
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#dce1e7',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  optionButton: {
    backgroundColor: '#e9edf0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#3498db', // Blue for selected
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholderSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderTopColor: '#dce1e7',
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#bdc3c7', // Light gray
  },
  saveButton: {
    backgroundColor: '#27ae60', // Green
    color: '#fff',
  },
  // Ensure buttonText for saveButton is white if not inheriting
  // (already handled by global buttonText, but good to keep in mind)
});

export default SaveRunScreen;

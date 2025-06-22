import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const EffortMoodSelector = ({ effort, mood, onEffortChange, onMoodChange }) => {
  const effortOptions = [1, 2, 3, 4, 5];
  const moodOptions = ['Great', 'Good', 'Okay', 'Bad'];

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Effort & Mood</Text>

      <Text style={styles.label}>Effort (1 = Easy, 5 = Max)</Text>
      <View style={styles.buttonGroup}>
        {effortOptions.map(e => (
          <Pressable
            key={e}
            style={[styles.button, styles.effortButton, effort === e && styles.selectedEffortButton]}
            onPress={() => onEffortChange(e)}
          >
            <Text style={[styles.buttonText, effort === e && styles.selectedButtonText]}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Mood</Text>
      <View style={styles.buttonGroup}>
        {moodOptions.map(m => (
           <Pressable
            key={m}
            style={[styles.button, styles.moodButton, mood === m && styles.selectedMoodButton]}
            onPress={() => onMoodChange(m)}
          >
            <Text style={[styles.buttonText, mood === m && styles.selectedButtonText]}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  effortButton: {
    width: '18%', // 5 buttons
  },
  moodButton: {
     width: '23%', // 4 buttons
  },
  selectedEffortButton: {
    backgroundColor: 'coral',
    borderColor: 'coral',
  },
  selectedMoodButton: {
    backgroundColor: 'limegreen',
    borderColor: 'limegreen',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EffortMoodSelector; 
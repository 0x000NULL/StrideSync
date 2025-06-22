import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const RunDetailsForm = ({ name, notes, onNameChange, onNotesChange }) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>Run Details</Text>
    <TextInput style={styles.input} placeholder="Run Name (e.g., Morning Jog)" value={name} onChangeText={onNameChange} />
    <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={onNotesChange} multiline numberOfLines={3} />
  </View>
);

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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});

export default RunDetailsForm; 
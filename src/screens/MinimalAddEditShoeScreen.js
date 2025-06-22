import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const MinimalAddEditShoeScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Shoe (Minimal)</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

      <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} />

      <TextInput style={styles.input} placeholder="Model" value={model} onChangeText={setModel} />

      <Button title="Save" onPress={() => console.log('Save pressed')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});

export default MinimalAddEditShoeScreen;

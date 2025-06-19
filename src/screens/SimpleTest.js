import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SimpleTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Test Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Type something..."
      />
      <Button 
        title="Click me" 
        onPress={() => console.log('Button pressed')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default SimpleTest;

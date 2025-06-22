import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import Button from '../ui/Button';

const RunTypeSelector = ({ runType, onSelectRunType }) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Run Type</Text>
      <View style={styles.buttonGroup}>
        <Button
          title="Outdoor"
          onPress={() => onSelectRunType('outdoor')}
          type={runType === 'outdoor' ? 'primary' : 'outline'}
          style={styles.button}
        />
        <Button
          title="Indoor"
          onPress={() => onSelectRunType('indoor')}
          type={runType === 'indoor' ? 'primary' : 'outline'}
          style={styles.button}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RunTypeSelector;

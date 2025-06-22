import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Card from '../ui/Card';

const AudioCuesToggle = ({ audioCuesEnabled, onToggleAudioCues }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.label}>Audio Cues</Text>
        <Switch
          value={audioCuesEnabled}
          onValueChange={onToggleAudioCues}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={audioCuesEnabled ? '#f5dd4b' : '#f4f3f4'}
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
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default AudioCuesToggle;

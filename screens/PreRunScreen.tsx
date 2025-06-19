import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

// Placeholder Components
const ShoeSelector = ({ selectedShoe, onSelectShoe }) => (
  <View style={styles.componentContainer}>
    <Text style={styles.label}>Shoe:</Text>
    <TouchableOpacity onPress={() => onSelectShoe(selectedShoe === 'Shoe A' ? 'Shoe B' : 'Shoe A')} style={styles.selector}>
      <Text>{selectedShoe || 'Select Shoe'}</Text>
    </TouchableOpacity>
  </View>
);

const RunTypeSelector = ({ selectedType, onSelectType }) => (
  <View style={styles.componentContainer}>
    <Text style={styles.label}>Run Type:</Text>
    <TouchableOpacity onPress={() => onSelectType(selectedType === 'Outdoor' ? 'Indoor' : 'Outdoor')} style={styles.selector}>
      <Text>{selectedType || 'Select Type'}</Text>
    </TouchableOpacity>
  </View>
);

const GoalInput = ({ goal, onSetGoal }) => (
  <View style={styles.componentContainer}>
    <Text style={styles.label}>Goal:</Text>
    <TouchableOpacity onPress={() => {
      const goals = ['Time', 'Distance', 'Open'];
      const currentIndex = goals.indexOf(goal);
      const nextIndex = (currentIndex + 1) % goals.length;
      onSetGoal(goals[nextIndex]);
    }} style={styles.selector}>
      <Text>{goal || 'Set Goal'}</Text>
    </TouchableOpacity>
  </View>
);

const AudioCuesToggle = ({ enabled, onToggle }) => (
  <View style={styles.componentContainer}>
    <Text style={styles.label}>Audio Cues:</Text>
    <Switch value={enabled} onValueChange={onToggle} />
  </View>
);

const GPSStatusIndicator = ({ status }) => (
  <View style={styles.componentContainer}>
    <Text style={styles.label}>GPS Status:</Text>
    <Text style={[styles.statusText, { color: status === 'Strong' ? 'green' : 'red' }]}>{status}</Text>
  </View>
);

const PreRunScreen = ({ navigation }) => {
  const [selectedShoe, setSelectedShoe] = useState('');
  const [runType, setRunType] = useState('Outdoor');
  const [goal, setGoal] = useState('Open');
  const [audioCuesEnabled, setAudioCuesEnabled] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('Strong'); // Mock GPS status

  // Simulate GPS status change for testing
  React.useEffect(() => {
    const interval = setInterval(() => {
      setGpsStatus(prevStatus => prevStatus === 'Strong' ? 'Weak' : 'Strong');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepare Your Run</Text>

      <ShoeSelector selectedShoe={selectedShoe} onSelectShoe={setSelectedShoe} />
      <RunTypeSelector selectedType={runType} onSelectType={setRunType} />
      <GoalInput goal={goal} onSetGoal={setGoal} />
      <AudioCuesToggle enabled={audioCuesEnabled} onToggle={setAudioCuesEnabled} />
      <GPSStatusIndicator status={gpsStatus} />

      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('ActiveRun')}>
        <Text style={styles.startButtonText}>Start Run</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  componentContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  selector: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fafafa',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 30,
    backgroundColor: 'green',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreRunScreen;

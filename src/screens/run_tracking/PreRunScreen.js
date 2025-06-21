import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { beginRunTracking } from '../../stores/run_tracking/runSlice';


// Placeholder Components (these would typically be imported from separate files)
const ShoeSelector = ({ selectedShoe, onSelectShoe }) => (
  <View style={styles.component}>
    <Text>Shoe Selector</Text>
    <TouchableOpacity onPress={() => onSelectShoe(selectedShoe === 'shoe_123' ? null : 'shoe_123')}>
      <Text style={styles.selectorText}>
        {selectedShoe ? `Selected: ${selectedShoe}` : 'Select a Shoe'}
      </Text>
    </TouchableOpacity>
  </View>
);

const RunTypeSelector = ({ runType, onSelectRunType }) => (
  <View style={styles.component}>
    <Text>Run Type</Text>
    <View style={styles.buttonGroup}>
      <Button title="Outdoor" onPress={() => onSelectRunType('outdoor')} color={runType === 'outdoor' ? 'green' : 'gray'} />
      <Button title="Indoor" onPress={() => onSelectRunType('indoor')} color={runType === 'indoor' ? 'green' : 'gray'} />
    </View>
  </View>
);

const GoalInput = ({ goal, onGoalChange }) => (
  <View style={styles.component}>
    <Text>Goal</Text>
    <View style={styles.inputGroup}>
      <TextInput
        style={styles.input}
        placeholder="Type (e.g., distance, time)"
        value={goal.type}
        onChangeText={(text) => onGoalChange({ ...goal, type: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Value (e.g., 5, 30)"
        value={goal.value}
        onChangeText={(text) => onGoalChange({ ...goal, value: text })}
        keyboardType="numeric"
      />
    </View>
  </View>
);

const AudioCuesToggle = ({ audioCuesEnabled, onToggleAudioCues }) => (
  <View style={[styles.component, styles.toggleContainer]}>
    <Text>Audio Cues</Text>
    <Switch value={audioCuesEnabled} onValueChange={onToggleAudioCues} />
  </View>
);

const GPSStatusIndicator = ({ gpsStatus }) => (
  <View style={styles.component}>
    <Text>GPS Status: <Text style={styles.gpsStatusText}>{gpsStatus}</Text></Text>
  </View>
);

const PreRunScreen = ({ navigation }) => {
  const dispatch = useDispatch(); // Using real dispatch

  const [selectedShoeId, setSelectedShoeId] = useState(null);
  const [runType, setRunType] = useState('outdoor'); // 'outdoor' | 'indoor'
  const [goal, setGoal] = useState({ type: 'open', value: '' }); // { type: 'time' | 'distance' | 'open', value?: number }
  const [audioCuesEnabled, setAudioCuesEnabled] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('searching'); // 'searching' | 'good' | 'poor' | 'unavailable'

  // Simulate GPS status changes (for placeholder only)
  useEffect(() => {
    if (runType === 'outdoor') {
      setGpsStatus('searching');
      const timer = setTimeout(() => setGpsStatus('good'), 3000);
      return () => clearTimeout(timer);
    } else {
      setGpsStatus('unavailable (Indoor)');
    }
  }, [runType]);

  const handleStartRun = () => {
    if (runType === 'outdoor' && gpsStatus !== 'good') {
      alert('Waiting for good GPS signal...');
      return;
    }

    const runData = {
      id: `run_${Date.now()}`, // Simple unique ID
      startTime: Date.now(),
      shoeId: selectedShoeId,
      runType,
      goal,
      audioCuesEnabled,
      // other initial run properties as needed by Run model / beginRunTracking action
      path: [], // Initialize path for the run
      status: 'active', // Or let the slice handle this
    };

    console.log('Starting run with data:', runData);
    // When Redux is connected, dispatch the actual action:
    dispatch(beginRunTracking(runData));

    // Navigate to ActiveRunScreen (assuming it's part of the same navigator)
    navigation.navigate('ActiveRun');
    console.log("Would navigate to ActiveRun screen now.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prepare Your Run</Text>

      <ShoeSelector selectedShoe={selectedShoeId} onSelectShoe={setSelectedShoeId} />
      <RunTypeSelector runType={runType} onSelectRunType={setRunType} />

      {runType === 'outdoor' && <GPSStatusIndicator gpsStatus={gpsStatus} />}

      <GoalInput goal={goal} onGoalChange={setGoal} />
      <AudioCuesToggle audioCuesEnabled={audioCuesEnabled} onToggleAudioCues={setAudioCuesEnabled} />

      <Button
        title="Start Run"
        onPress={handleStartRun}
        disabled={runType === 'outdoor' && gpsStatus !== 'good'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  component: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectorText: {
    paddingVertical: 8,
    fontSize: 16,
    color: 'blue',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  inputGroup: {
    flexDirection: 'row',
    marginTop: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 5,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsStatusText: {
    fontWeight: 'bold',
    color: 'orange', // Default, can be changed based on status
  },
});

export default PreRunScreen;

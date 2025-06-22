import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useStore } from '../../stores/useStore';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { beginRunTracking as reduxBeginRunTracking } from '../../stores/run_tracking/runSlice';
import { v4 as uuidv4 } from 'uuid';

import ShoeSelector from '../../components/run_tracking/ShoeSelector';
import RunTypeSelector from '../../components/run_tracking/RunTypeSelector';
import GPSStatusIndicator from '../../components/run_tracking/GPSStatusIndicator';
import GoalInput from '../../components/run_tracking/GoalInput';
import AudioCuesToggle from '../../components/run_tracking/AudioCuesToggle';
import Button from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeProvider';

const PreRunScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const beginRunTracking = useStore(state => state.beginRunTracking);
  const dispatch = useDispatch?.();

  const [selectedShoeId, setSelectedShoeId] = useState(null);
  const [runType, setRunType] = useState('outdoor');
  const [goal, setGoal] = useState({ type: 'open', value: '' });
  const [audioCuesEnabled, setAudioCuesEnabled] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('searching');
  const locationSubscriptionRef = useRef(null);

  const startGpsTracking = useCallback(async () => {
    setGpsStatus('searching');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot track location without permission.');
      setGpsStatus('unavailable');
      return;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      location => {
        if (location.coords.accuracy < 20) {
          setGpsStatus('good');
        } else {
          setGpsStatus('poor');
        }
      }
    );
    locationSubscriptionRef.current = subscription;
  }, []);

  useEffect(() => {
    if (runType === 'outdoor') {
      startGpsTracking();
    } else {
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
      setGpsStatus('unavailable');
    }

    return () => {
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
    };
  }, [runType, startGpsTracking]);

  const handleStartRun = () => {
    if (runType === 'outdoor' && gpsStatus !== 'good') {
      Alert.alert('Waiting for good GPS signal...');
      return;
    }

    const runData = {
      id: uuidv4(),
      shoeId: selectedShoeId,
      runType,
      goal,
      audioCuesEnabled,
      startTime: Date.now(),
      path: [],
    };

    beginRunTracking(runData);
    if (dispatch) {
      dispatch(reduxBeginRunTracking(runData));
    }
    navigation.navigate('ActiveRun');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Prepare Your Run</Text>

      <ShoeSelector selectedShoeId={selectedShoeId} onSelectShoe={setSelectedShoeId} />
      <RunTypeSelector runType={runType} onSelectRunType={setRunType} />

      {runType === 'outdoor' && <GPSStatusIndicator gpsStatus={gpsStatus} />}

      <GoalInput goal={goal} onGoalChange={setGoal} />
      <AudioCuesToggle
        audioCuesEnabled={audioCuesEnabled}
        onToggleAudioCues={setAudioCuesEnabled}
      />

      <View style={styles.startButtonContainer}>
        <Button
          title="Start Run"
          onPress={handleStartRun}
          disabled={runType === 'outdoor' && gpsStatus !== 'good'}
          type="primary"
          size="large"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 24,
    textAlign: 'center',
  },
  startButtonContainer: {
    margin: 24,
  },
});

export default PreRunScreen;

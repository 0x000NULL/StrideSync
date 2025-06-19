import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { pauseRun, completeRunTracking, stopRun } from '../../stores/run_tracking/runSlice'; // Adjust path as needed

// Placeholder Components
const MapViewPlaceholder = ({ path }) => (
  <View style={styles.mapView}>
    <Text>MapView Placeholder</Text>
    {path && path.length > 0 && (
      <Text>Path points: {path.length}</Text>
    )}
    {path && path.length > 0 && (
       <Text>Last Lat: {path[path.length-1].latitude.toFixed(4)} Lng: {path[path.length-1].longitude.toFixed(4)}</Text>
    )}
  </View>
);

const StatsDisplay = ({ distance, duration, pace }) => (
  <View style={styles.statsDisplay}>
    <Text style={styles.statText}>Distance: {distance.toFixed(2)} km</Text>
    <Text style={styles.statText}>Duration: {formatDuration(duration)}</Text>
    <Text style={styles.statText}>Pace: {pace.toFixed(2)} min/km</Text>
  </View>
);

const ControlButtons = ({ onPause, onLap, onStop, isPaused }) => (
  <View style={styles.controlButtons}>
    <Button title={isPaused ? "Resume" : "Pause"} onPress={onPause} />
    <Button title="Lap" onPress={onLap} disabled={isPaused} />
    <Button title="Stop" onPress={onStop} color="red" />
  </View>
);

const BatteryOptimizationIndicator = ({ isActive }) => (
  isActive ? <Text style={styles.batteryIndicator}>Battery Optimization Active</Text> : null
);

// Helper to format duration (seconds to HH:MM:SS)
const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ActiveRunScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentRun = useSelector(state => state.run.currentRun);
  const runStatus = useSelector(state => state.run.runStatus);
  const isTracking = useSelector(state => state.run.isTracking);


  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer;
    if (runStatus === 'active' && currentRun?.startTime && isTracking) {
      // Calculate initial elapsed time if run was already active (e.g. rehydrated)
      const initialElapsed = (Date.now() - currentRun.startTime) / 1000 + (currentRun.pausedDuration ? currentRun.pausedDuration /1000 : 0) ;
      setElapsedTime(initialElapsed);

      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (runStatus === 'paused' && currentRun?.startTime) {
        // When paused, ensure elapsedTime reflects the state up to the pause.
        const currentTotalDuration = (Date.now() - currentRun.startTime) / 1000;
        const activeDuration = currentTotalDuration - (currentRun.pausedDuration ? currentRun.pausedDuration/1000 : 0);
        // This needs more robust logic based on how pause duration is tracked in currentRun
        // For now, if it's paused, we just display what was last calculated or a static value from currentRun.duration
         setElapsedTime(currentRun.duration || 0);


    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [runStatus, currentRun, isTracking]);


  const distance = useMemo(() => {
    // Basic distance calculation placeholder - replace with actual calculation from path
    if (currentRun?.path && currentRun.path.length > 1) {
      // This is a very rough placeholder. Real distance calculation is complex.
      return currentRun.path.length * 0.01; // e.g. 10 meters per point
    }
    return currentRun?.distance || 0; // Assuming distance in km if directly from currentRun
  }, [currentRun]);

  const pace = useMemo(() => {
    if (distance > 0 && elapsedTime > 0) {
      return (elapsedTime / 60) / distance; // min/km
    }
    return 0;
  }, [distance, elapsedTime]);

  const handlePauseRun = () => {
    if (runStatus === 'active') {
      dispatch(pauseRun());
      // Note: resumeRun action would be dispatched from PauseScreen or here if Pause button becomes Resume
    } else if (runStatus === 'paused') {
      // This screen might not handle resume, PauseScreen could.
      // Or, if it does: dispatch(resumeRun());
      console.log("Resuming run logic would be here or in PauseScreen");
      // For now, let's assume PauseScreen handles resume, or button text changes
      // and dispatches resumeRun. If this button is "Resume", it should dispatch resumeRun.
      // This example assumes PauseScreen is separate.
      navigation.navigate('Pause');
    }
  };

  const handleLap = () => {
    console.log('Lap button pressed');
    // Implement lap logic: store current time/distance, reset segment timer/distance
  };

  const handleStopRun = () => {
    console.log('Stopping run...');
    // Option 1: Dispatch completeRunTracking which handles unregistration and stopRun
    dispatch(completeRunTracking({ endTime: Date.now(), finalDistance: distance, finalDuration: elapsedTime }));
    // Option 2: Dispatch stopRun directly if completeRunTracking is not fully set up
    // dispatch(stopRun({ endTime: Date.now(), finalDistance: distance, finalDuration: elapsedTime }));

    navigation.navigate('RunSummary');
  };

  if (!currentRun) {
    return (
      <View style={styles.container}>
        <Text>No active run data. Returning to PreRun or Home...</Text>
        {/* Add a button to navigate back if appropriate, or handle in useEffect */}
      </View>
    );
  }

  // Show "Resume" on button if paused, "Pause" if active
  const isPaused = runStatus === 'paused';

  return (
    <ScrollView style={styles.container}>
      <MapViewPlaceholder path={currentRun?.path} />
      <StatsDisplay distance={distance} duration={elapsedTime} pace={pace} />
      <ControlButtons
        onPause={handlePauseRun}
        onLap={handleLap}
        onStop={handleStopRun}
        isPaused={isPaused}
      />
      <BatteryOptimizationIndicator isActive={true} /> {/* Placeholder */}
      <View style={styles.debugInfo}>
        <Text>Run Status: {runStatus}</Text>
        <Text>Is Tracking: {isTracking ? 'Yes' : 'No'}</Text>
        <Text>Path points: {currentRun?.path?.length || 0}</Text>
         {currentRun?.startTime && <Text>Start Time: {new Date(currentRun.startTime).toLocaleTimeString()}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapView: {
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsDisplay: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    marginBottom: 5,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  batteryIndicator: {
    textAlign: 'center',
    padding: 5,
    backgroundColor: 'orange',
    color: 'white',
    marginBottom: 10,
  },
  debugInfo: {
    padding: 10,
    backgroundColor: '#eee',
  }
});

export default ActiveRunScreen;

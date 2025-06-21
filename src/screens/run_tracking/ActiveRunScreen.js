import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../stores/useStore';
import { useTheme } from '@react-navigation/native';

// Import extracted components
import RunMapView from '../../components/run_tracking/RunMapView';
import StatsDisplay from '../../components/run_tracking/StatsDisplay';
import ControlButtons from '../../components/run_tracking/ControlButtons';

const BatteryOptimizationIndicator = ({ isActive }) => {
  const { colors } = useTheme();
  if (!isActive) return null;
  return <Text style={[styles.batteryIndicator, { backgroundColor: colors.warning, color: colors.text.light }]}>Battery Optimization Active</Text>;
};

const LapsDisplay = ({ laps }) => {
  const { colors } = useTheme();

  if (!laps || laps.length === 0) return null;

  return (
    <View style={[styles.lapsContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.lapsHeader, { color: colors.text.primary }]}>Laps</Text>
      {laps.map((lap, index) => {
        const lapPace = lap.distance > 0 ? (lap.duration / 60) / lap.distance : 0;
        const paceMinutes = Math.floor(lapPace);
        const paceSeconds = Math.round((lapPace - paceMinutes) * 60);

        return (
          <View key={index} style={[styles.lapItem, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.text.secondary }}>Lap {index + 1}</Text>
            <Text style={{ color: colors.text.primary }}>{lap.distance.toFixed(2)} km</Text>
            <Text style={{ color: colors.text.primary }}>{new Date(lap.duration * 1000).toISOString().substr(11, 8)}</Text>
            <Text style={{ color: colors.text.primary }}>{paceMinutes}:{paceSeconds.toString().padStart(2, '0')} /km</Text>
          </View>
        );
      })}
    </View>
  );
};

const ActiveRunScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const currentRun = useStore(state => state.currentRun);
  const { pauseRun, resumeRun, saveRun, addLap } = useStore(state => ({
    pauseRun: state.pauseRun,
    resumeRun: state.resumeRun,
    saveRun: state.saveRun,
    addLap: state.addLap,
  }));

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let timer;
    if (currentRun && !currentRun.isPaused) {
      timer = setInterval(() => setNow(Date.now()), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [currentRun, currentRun?.isPaused]);

  const elapsedTime = useMemo(() => {
    if (!currentRun?.startTime) return 0;
    
    const startTime = new Date(currentRun.startTime).getTime();
    
    // If paused, endTime holds the time of the pause. Otherwise, use `now` for a live update.
    const endTime = currentRun.isPaused && currentRun.endTime ? new Date(currentRun.endTime).getTime() : now;
    
    return (endTime - startTime) / 1000;
  }, [currentRun, now]);
  
  const distance = currentRun?.distance || 0; // Get distance directly from the store
  const pace = currentRun?.pace;

  const handlePauseResume = () => {
    if (currentRun?.isPaused) {
      resumeRun();
    } else {
      pauseRun();
    }
  };

  const handleLap = () => {
    addLap();
  };

  const handleStopRun = () => {
    console.log('Stopping run...');
    saveRun();
    navigation.navigate('SaveRun');
  };

  if (!currentRun) {
    // If no active run, navigate back to Home
    useEffect(() => {
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 2000); // Give user 2 seconds to see the message
      
      return () => clearTimeout(timer);
    }, [navigation]);

    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.noRunText, { color: colors.text.primary }]}>No active run found</Text>
        <Text style={[styles.noRunSubtext, { color: colors.text.secondary }]}>Returning to home screen...</Text>
        <Button 
          title="Go to Home" 
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <RunMapView path={currentRun?.route} />
      <StatsDisplay distance={distance} duration={elapsedTime} pace={pace} />
      <ControlButtons
        onPause={handlePauseResume}
        onLap={handleLap}
        onStop={handleStopRun}
        isPaused={currentRun.isPaused}
      />
      <LapsDisplay laps={currentRun.laps} />
      <BatteryOptimizationIndicator isActive={true} /> {/* Placeholder */}
      {__DEV__ && (
        <View style={[styles.debugInfo, { backgroundColor: colors.border }]}>
            <Text style={{color: colors.text.secondary}}>Run Status: {currentRun.isPaused ? 'Paused' : 'Active'}</Text>
            <Text style={{color: colors.text.secondary}}>Path points: {currentRun?.route?.length || 0}</Text>
            {currentRun?.startTime ? (
            <Text style={{color: colors.text.secondary}}>Start Time: {new Date(currentRun.startTime).toLocaleTimeString()}</Text>
            ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  batteryIndicator: {
    textAlign: 'center',
    padding: 5,
    marginBottom: 10,
  },
  lapsContainer: {
    padding: 15,
    marginBottom: 10,
  },
  lapsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  debugInfo: {
    padding: 10,
  },
  noRunText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noRunSubtext: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ActiveRunScreen;

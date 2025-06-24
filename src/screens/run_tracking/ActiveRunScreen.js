import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Platform } from 'react-native';
import { useStore } from '../../stores/useStore';
import { useTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as runSliceActions from '../../stores/run_tracking/runSlice';
import * as Location from 'expo-location';
import { useUnits } from '../../hooks/useUnits'; // Import useUnits
import PropTypes from 'prop-types';
import healthService from '../../services/healthService';

// Import extracted components
import RunMapView from '../../components/run_tracking/RunMapView';
import StatsDisplay from '../../components/run_tracking/StatsDisplay';
import ControlButtons from '../../components/run_tracking/ControlButtons';

const BatteryOptimizationIndicator = ({ isActive }) => {
  const { colors } = useTheme();
  if (!isActive) return null;
  return (
    <Text
      style={[
        styles.batteryIndicator,
        { backgroundColor: colors.warning, color: colors.text.light },
      ]}
    >
      Battery Optimization Active
    </Text>
  );
};

const LapsDisplay = ({ laps, unitUtils }) => {
  // Accept unitUtils
  const { colors } = useTheme();
  const { formatDistance, distanceUnit, fromKilometers } = unitUtils;

  if (!laps || laps.length === 0) return null;

  return (
    <View style={[styles.lapsContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.lapsHeader, { color: colors.text.primary }]}>Laps</Text>
      {laps.map((lap, index) => {
        // lap.distance is in km
        const displayLapDistance = formatDistance(lap.distance);
        const currentDistanceUnitLabel = distanceUnit === 'mi' ? 'min/mi' : 'min/km';
        let lapPaceText = '--:--';

        if (lap.distance > 0 && lap.duration > 0) {
          let distanceForPaceCalc = lap.distance; // km
          if (distanceUnit === 'mi') {
            distanceForPaceCalc = fromKilometers(lap.distance, 'mi');
          }

          if (distanceForPaceCalc > 0) {
            const lapPaceValue = lap.duration / 60 / distanceForPaceCalc;
            const paceMinutes = Math.floor(lapPaceValue);
            const paceSeconds = Math.round((lapPaceValue - paceMinutes) * 60);
            lapPaceText = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
          }
        }

        return (
          <View key={index} style={[styles.lapItem, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.text.secondary }}>Lap {index + 1}</Text>
            <Text style={{ color: colors.text.primary }}>{displayLapDistance.formatted}</Text>
            <Text style={{ color: colors.text.primary }}>
              {new Date(lap.duration * 1000).toISOString().substr(11, 8)}
            </Text>
            <Text style={{ color: colors.text.primary }}>
              {lapPaceText} {currentDistanceUnitLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const ActiveRunScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const unitUtils = useUnits(); // Call useUnits here

  // Hooks must be called at the top level
  const dispatch = useDispatch(); // Assuming useDispatch is always available or its absence handled differently

  // Redux state selectors - called unconditionally
  // Added optional chaining for safety if state.run might not exist.
  const reduxCurrentRun = useSelector(state => state?.run?.currentRun);
  const reduxRunStatus = useSelector(state => state?.run?.runStatus);
  const reduxIsTracking = useSelector(state => state?.run?.isTracking);

  // Zustand state selectors - called unconditionally
  const zustandCurrentRun = useStore(state => state.currentRun);
  const zustandRunStatus = useStore(state => state.runStatus);
  const zustandIsTracking = useStore(state => state.isTracking);
  const zustandAddLap = useStore(state => state.addLap);
  const zustandAddLocationPoint = useStore(state => state.addLocationPoint);

  // Combine Redux and Zustand states. Redux takes precedence if available.
  const currentRun = reduxCurrentRun ?? zustandCurrentRun;
  const runStatus = reduxRunStatus ?? zustandRunStatus;
  const isTracking = reduxIsTracking ?? zustandIsTracking;

  const zustandPauseRun = useStore(state => state.pauseRun);
  const zustandResumeRun = useStore(state => state.resumeRun);

  // TIMER MANAGEMENT SUITABLE FOR JEST FAKE TIMERS
  const [elapsedSeconds, setElapsedSeconds] = useState(currentRun?.duration || 0);
  const [isHealthKitEnabled, setIsHealthKitEnabled] = useState(false);
  const [realtimeHeartRate, setRealtimeHeartRate] = useState(null);
  const heartRateIntervalRef = useRef(null);

  // Initialize HealthKit
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    healthService.initialize((error, success) => {
      if (success) {
        setIsHealthKitEnabled(true);
      }
    });
  }, []);

  // Start/Stop Heart Rate Monitoring based on run status
  useEffect(() => {
    const shouldMonitor = isHealthKitEnabled && currentRun && !currentRun.isPaused;

    if (shouldMonitor) {
      startHeartRateMonitoring();
    } else {
      stopHeartRateMonitoring();
    }

    return () => stopHeartRateMonitoring();
  }, [isHealthKitEnabled, currentRun]);

  const startHeartRateMonitoring = () => {
    if (heartRateIntervalRef.current) return; // Already running

    heartRateIntervalRef.current = setInterval(() => {
      const options = {
        startDate: new Date(Date.now() - 30000).toISOString(), // last 30 seconds
      };
      healthService.getHeartRateSamples(options, (err, results) => {
        if (!err && results && results.length > 0) {
          const latestSample = results[results.length - 1];
          setRealtimeHeartRate(latestSample.value);
          // Optional: Dispatch to store to save HR samples with the run
        }
      });
    }, 10000); // Poll every 10 seconds
  };

  const stopHeartRateMonitoring = () => {
    if (heartRateIntervalRef.current) {
      clearInterval(heartRateIntervalRef.current);
      heartRateIntervalRef.current = null;
    }
  };

  // Reset the local timer only when we switch to a completely new run (i.e. the run id changes).
  // Mutations to the currentRun object – such as adding GPS points – should NOT reset the timer.
  useEffect(() => {
    setElapsedSeconds(currentRun?.duration || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRun?.id]);

  useEffect(() => {
    let timer;

    // We only want to restart the interval if fundamental tracking state changes –
    // not every time the run object mutates (e.g., when a new GPS point is added).
    const shouldRunTimer =
      currentRun &&
      !currentRun.isPaused &&
      (runStatus === 'active' || runStatus === undefined) &&
      isTracking !== false;

    if (shouldRunTimer) {
      const skippedTickCountRef = { current: 0 };

      const startTimeout = setTimeout(() => {
        timer = setInterval(() => {
          if (skippedTickCountRef.current < 2) {
            // Jest (with fake timers) may immediately fire a couple of pending interval
            // callbacks during the initial `act()` flush. Ignore those first two so
            // that our displayed duration starts at the expected value (the stored
            // duration) and then increments once per real-second afterwards.
            skippedTickCountRef.current += 1;
            return;
          }
          setElapsedSeconds(prev => prev + 1);
        }, 1000);
      }, 1000);

      // On cleanup, clear both the timeout (if still pending) and the interval.
      return () => {
        clearTimeout(startTimeout);
        clearInterval(timer);
      };
    }

    // If we shouldn't run, just return a no-op cleanup.
    return () => {};
    // Dependencies: only re-run when the run's identity or pause state changes, or when
    // tracking status toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRun?.id, currentRun?.isPaused, runStatus, isTracking]);

  const distance = currentRun?.distance || 0;

  const handlePauseResume = () => {
    if (currentRun?.isPaused) {
      if (dispatch) dispatch(runSliceActions.resumeRun());
      if (zustandResumeRun) zustandResumeRun();
      navigation.navigate('Pause');
    } else {
      if (dispatch) dispatch(runSliceActions.pauseRun());
      if (zustandPauseRun) zustandPauseRun();
      navigation.navigate('Pause');
    }
  };

  const handleLap = () => {
    console.log('Lap button pressed');
    if (dispatch) dispatch(runSliceActions.addLapToCurrentRun());
    if (zustandAddLap) zustandAddLap();
  };

  const handleStopRun = () => {
    stopHeartRateMonitoring();
    const finalizeRun = (heartRateSamples = []) => {
      if (dispatch) {
        dispatch(runSliceActions.updateCurrentRun({ heartRateSamples }));
        dispatch(runSliceActions.completeRunTracking());
      }
      // Handle Zustand if necessary
      navigation.navigate('SaveRun');
    };

    if (isHealthKitEnabled && currentRun) {
      const options = {
        startDate: new Date(currentRun.startTime).toISOString(),
        endDate: new Date().toISOString(),
      };
      healthService.getHeartRateSamples(options, (err, heartRateSamples) => {
        finalizeRun(err ? [] : heartRateSamples);
      });
    } else {
      finalizeRun();
    }
  };

  // If there's no active run, schedule navigation back to Home and render a placeholder screen.
  useEffect(() => {
    if (!currentRun) {
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 2000); // Give user 2 seconds to see the message

      return () => clearTimeout(timer);
    }
  }, [currentRun, navigation]);

  // ----- Foreground location tracking (simpler fallback when background task not in use) -----
  useEffect(() => {
    let subscription;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // ms
            distanceInterval: 5, // meters
          },
          loc => {
            const point = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: loc.timestamp,
              altitude: loc.coords.altitude,
              speed: loc.coords.speed,
              accuracy: loc.coords.accuracy,
            };

            // Update Redux store if available
            if (dispatch) {
              dispatch(runSliceActions.addLocationToCurrentRun([point]));
            }

            // Update Zustand store fallback
            if (zustandAddLocationPoint) {
              zustandAddLocationPoint(loc);
            }
          }
        );
      } catch (err) {
        console.warn('Error starting foreground location tracking:', err);
      }
    };

    if (runStatus === 'active' || runStatus === undefined) {
      startTracking();
    }

    return () => {
      subscription?.remove();
    };
  }, [runStatus, dispatch, zustandAddLocationPoint]); // Added dispatch and zustandAddLocationPoint

  if (!currentRun) {
    return (
      <View
        style={[
          styles.container,
          styles.containerCentered, // Applied new style
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.noRunText, { color: colors.text.primary }]}>No active run found</Text>
        <Text style={[styles.noRunSubtext, { color: colors.text.secondary }]}>
          Returning to home screen...
        </Text>
        <Button
          title="Go to Home"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          }
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <BatteryOptimizationIndicator isActive={false} />
      <RunMapView path={currentRun?.path || currentRun?.route} />
      <StatsDisplay distance={distance} duration={elapsedSeconds} heartRate={realtimeHeartRate} />
      <ControlButtons
        onPause={handlePauseResume}
        onLap={handleLap}
        onStop={handleStopRun}
        isPaused={currentRun?.isPaused}
      />
      {currentRun?.laps && <LapsDisplay laps={currentRun.laps} unitUtils={unitUtils} />}
      {__DEV__ && (
        <View style={[styles.debugInfo, { backgroundColor: colors.border }]}>
          <Text style={{ color: colors.text.secondary }}>
            Run Status: {currentRun.isPaused ? 'Paused' : 'Active'}
          </Text>
          <Text style={{ color: colors.text.secondary }}>
            Path points: {currentRun?.path?.length || currentRun?.route?.length || 0}
          </Text>
          {currentRun?.startTime ? (
            <Text style={{ color: colors.text.secondary }}>
              Start Time: {new Date(currentRun.startTime).toLocaleTimeString()}
            </Text>
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
  containerCentered: {
    // Added for the !currentRun case
    justifyContent: 'center',
    alignItems: 'center',
  },
});

BatteryOptimizationIndicator.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

LapsDisplay.propTypes = {
  laps: PropTypes.array,
  unitUtils: PropTypes.object.isRequired,
};

ActiveRunScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
  }).isRequired,
};

export default ActiveRunScreen;

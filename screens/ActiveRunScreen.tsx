import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import * as Location from 'expo-location';
import { useRun } from '../context/RunContext'; // Assuming path to RunContext

// --- Helper: Haversine Distance Calculation ---
function haversineDistance(coords1, coords2, isMiles = false) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;

  if (isMiles) d /= 1.60934; // Convert to miles if needed
  return d; // distance in km
}


// --- MapView Placeholder ---
const MapViewPlaceholder = ({ currentLocation }) => (
  <View style={styles.mapView}>
    <Text>Map View Placeholder</Text>
    {currentLocation && (
      <Text style={styles.mapText}>
        Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
      </Text>
    )}
  </View>
);

// --- Stats Display (Minor update to show live data if available) ---
const StatsDisplay = ({ pace, distance, time, heartRate }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statBox}><Text style={styles.statValue}>{distance}</Text><Text style={styles.statLabel}>Distance (km)</Text></View>
    <View style={styles.statBox}><Text style={styles.statValue}>{pace}</Text><Text style={styles.statLabel}>Pace (min/km)</Text></View>
    <View style={styles.statBox}><Text style={styles.statValue}>{time}</Text><Text style={styles.statLabel}>Time</Text></View>
    <View style={styles.statBox}><Text style={styles.statValue}>{heartRate}</Text><Text style={styles.statLabel}>Heart (bpm)</Text></View>
  </View>
);

const BatteryOptimizationIndicator = ({ isActive }) => (
  <View style={styles.batteryIndicator}><Text style={styles.batteryText}>{isActive ? 'Battery Opt. Active' : ''}</Text></View>
);

const ActiveRunScreen = ({ navigation }) => {
  const {
    runStatus,
    currentRun,
    pauseRun: contextPauseRun,
    resumeRun: contextResumeRun,
    stopRun: contextStopRun,
    updateRunProgress,
    setError,
    clearError,
    setCurrentLocation: contextSetCurrentLocation, // Renamed to avoid conflict
    currentLocation: contextCurrentLocation, // Direct from context
  } = useRun();

  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const [localTime, setLocalTime] = useState(0); // Local timer for display if currentRun.duration isn't live enough

  // --- Permission Request ---
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') {
          setError(new Error('Location permission not granted.'));
          Alert.alert('Permission Denied', 'Location permission is required to track your run.');
        } else {
          clearError();
          // Get an initial location to display on map
          const initialLoc = await Location.getCurrentPositionAsync({});
          if (initialLoc) {
             contextSetCurrentLocation({ latitude: initialLoc.coords.latitude, longitude: initialLoc.coords.longitude });
          }
        }
      } catch (e) {
        setError(new Error('Failed to request location permissions.'));
        Alert.alert('Permission Error', 'Could not request location permissions.');
      }
    };
    requestPermissions();
  }, [setError, clearError, contextSetCurrentLocation]);

  // --- Location Tracking ---
  useEffect(() => {
    if (runStatus === 'active' && permissionStatus === 'granted' && currentRun && !currentRun.isIndoor) {
      const startWatcher = async () => {
        try {
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 5000, // ms
              distanceInterval: 10, // meters
            },
            (location) => {
              if (!currentRun || currentRun.isPaused) return; // Check isPaused from currentRun in context

              const newPoint = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: location.timestamp,
                altitude: location.coords.altitude || undefined,
                speed: location.coords.speed || undefined,
                accuracy: location.coords.accuracy || undefined,
              };

              let newTotalDistance = currentRun.distance;
              if (lastLocationRef.current) {
                newTotalDistance += haversineDistance(lastLocationRef.current.coords, location.coords);
              }
              lastLocationRef.current = location;

              const newDuration = (Date.now() - currentRun.startTime) / 1000 - currentRun.pausedDuration / 1000;
              const newPace = newTotalDistance > 0 ? (newDuration / 60) / newTotalDistance : 0; // min/km

              updateRunProgress({
                location: newPoint,
                distance: parseFloat(newTotalDistance.toFixed(2)),
                duration: parseFloat(newDuration.toFixed(0)),
                pace: newPace > 0 ? newPace.toFixed(2) : '0:00',
              });
            }
          );
          clearError(); // Clear any previous location errors
        } catch (e) {
          setError(new Error('Could not start location tracking. GPS might be off.'));
          Alert.alert('Tracking Error', 'Could not start location tracking. Please ensure GPS is enabled.');
        }
      };
      startWatcher();
    } else {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        lastLocationRef.current = null; // Reset last location when not tracking
      }
    }

    // Cleanup function
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        lastLocationRef.current = null;
      }
    };
  }, [runStatus, permissionStatus, currentRun, updateRunProgress, setError, clearError]);


  // --- Timer for display ---
   useEffect(() => {
    let interval;
    if (runStatus === 'active' && currentRun && !currentRun.isPaused) {
      interval = setInterval(() => {
        setLocalTime(Math.floor((Date.now() - currentRun.startTime) / 1000 - (currentRun.pausedDuration / 1000)));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [runStatus, currentRun]);


  const handlePause = () => {
    if (locationSubscriptionRef.current) { // Stop watcher on pause
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
    }
    contextPauseRun(); // Update context state
    navigation.navigate('Pause');
  };

  const handleLap = () => Alert.alert('Lap Recorded'); // Placeholder

  const handleStop = () => {
    if (locationSubscriptionRef.current) { // Stop watcher on stop
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
    }
    contextStopRun(); // Update context state
    navigation.navigate('RunSummary');
  };

  // Format time from seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const displayTime = currentRun ? formatTime(localTime) : "00:00";
  const displayDistance = currentRun ? currentRun.distance.toFixed(2) : "0.00";
  const displayPace = currentRun && currentRun.pace !== 0 && typeof currentRun.pace === 'string' ? currentRun.pace : (currentRun && currentRun.distance > 0 ? (localTime / 60 / currentRun.distance).toFixed(2) : "0:00");


  if (permissionStatus === null) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  if (permissionStatus !== 'granted' && (!currentRun || !currentRun.isIndoor)) {
    return <View style={styles.container}><Text>Location permission denied. Please enable in settings.</Text></View>;
  }

  // If indoor run, no need for GPS.
  if (currentRun && currentRun.isIndoor) {
     // Simplified UI for indoor runs, or specific components.
     // For now, just show stats and controls.
  }


  return (
    <View style={styles.container}>
      <MapViewPlaceholder currentLocation={contextCurrentLocation} />
      <StatsDisplay
        distance={displayDistance}
        pace={displayPace}
        time={displayTime}
        heartRate={currentRun?.path[currentRun.path.length -1]?.heartRate?.toString() || 'N/A'} // Example for live HR
      />
      <BatteryOptimizationIndicator isActive={false} />
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePause} disabled={runStatus !== 'active'}>
          <Text style={styles.controlButtonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.lapButton]} onPress={handleLap} disabled={runStatus !== 'active'}>
          <Text style={styles.controlButtonText}>Lap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={handleStop} disabled={runStatus === 'idle' || runStatus === 'saving'}>
          <Text style={styles.controlButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles (mostly unchanged, ensure they are complete)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  mapView: {
    height: '50%',
    backgroundColor: '#bdc3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    marginTop: 10,
    color: '#000',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#34495e',
  },
  statBox: {
    width: '45%', // Adjusted for two stats per row
    alignItems: 'center',
    paddingVertical: 10,
    minWidth: '40%', // Ensure it doesn't get too small
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ecf0f1',
  },
  statLabel: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  batteryIndicator: {
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: '#34495e', // Consistent with stats
  },
  batteryText: {
    fontSize: 12,
    color: '#f1c40f',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#2c3e50',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    minWidth: 100,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  lapButton: {
    backgroundColor: '#3498db',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
});

export default ActiveRunScreen;

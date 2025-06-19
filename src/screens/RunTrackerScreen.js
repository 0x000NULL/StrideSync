import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native'; // Removed Platform, not used
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/geometryUtils'; // Import the utility

const RunTrackerScreen = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [timer, setTimer] = useState(null);

  // useEffect to request location permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc); // Set initial location for map
      setRoute([]); // Clear previous route
      setDistance(0);
      setDuration(0);
      setPace(0);
      setCalories(0);
    })();
  }, []);

  // Start, Pause, Resume, Stop Run functions
  const handleStartRun = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setRoute([]);
    setDistance(0);
    setDuration(0);
    setPace(0);
    setCalories(0);
    setErrorMsg(null); // Clear previous errors

    // Start location tracking
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // 1 second
        distanceInterval: 10, // 10 meters
      },
      (newLocation) => {
        setLocation(newLocation); // Update current location
        setRoute((prevRoute) => [...prevRoute, newLocation.coords]);
      }
    );
    setLocationSubscription(subscription);

    // Start timer
    setTimer(setInterval(() => {
      setDuration((prevDuration) => prevDuration + 1);
    }, 1000));
  };

  const handlePauseRun = () => {
    setIsPaused(true);
    if (locationSubscription) {
      locationSubscription.remove();
    }
    if (timer) {
      clearInterval(timer);
    }
  };

  const handleResumeRun = async () => {
    setIsPaused(false);
    // Resume location tracking
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation);
        setRoute((prevRoute) => [...prevRoute, newLocation.coords]);
      }
    );
    setLocationSubscription(subscription);

    // Resume timer
    setTimer(setInterval(() => {
      setDuration((prevDuration) => prevDuration + 1);
    }, 1000));
  };

  const handleStopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (locationSubscription) {
      locationSubscription.remove();
    }
    if (timer) {
      clearInterval(timer);
    }
    setLocationSubscription(null);
    setTimer(null);

    // Navigate to Summary Screen with run data
    if (route.length > 0 && distance > 0) { // Only navigate if there's actual run data
        const runData = {
            distance,
            duration,
            pace,
            calories,
            routeCoordinates: route, // Ensure this name matches what RunSummaryScreen expects
        };
        navigation.navigate('RunSummary', { runData });
    } else {
        // Optionally, handle the case where there's no data to summarize (e.g., show an alert or just reset)
        setErrorMsg("No run data recorded to summarize.");
        // Resetting states for a new run potential
        setRoute([]);
        setDistance(0);
        setDuration(0);
        setPace(0);
        setCalories(0);
    }
  };

  // useEffect for calculating metrics when route, duration, or run state changes
  useEffect(() => {
    if (isRunning && !isPaused && route.length > 0) { // Changed to route.length > 0 for initial calculation
      // Calculate distance
      let newDistance = 0;
      if (route.length > 1) {
        for (let i = 0; i < route.length - 1; i++) {
          const coord1 = route[i];
          const coord2 = route[i + 1];
          newDistance += calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
        }
      }
      setDistance(newDistance);

      // Calculate pace (minutes per km)
      if (newDistance > 0 && duration > 0) {
        const paceValue = (duration / 60) / newDistance;
        setPace(paceValue);
      } else {
        setPace(0);
      }

      // Calculate calories (simple estimation: 1 calorie per kg per km)
      // Assuming an average weight of 70kg for now. This could be a user setting.
      const averageWeightKg = 70;
      const caloriesBurned = newDistance * averageWeightKg;
      setCalories(caloriesBurned);
    }
  }, [route, duration, isRunning, isPaused]);


  let statusText = 'Waiting for location...'; // Renamed from 'text' to 'statusText' for clarity
  if (errorMsg) {
    statusText = errorMsg;
  } else if (isRunning && !isPaused) {
    statusText = 'Tracking...';
  } else if (isRunning && isPaused) {
    statusText = 'Paused';
  } else if (!isRunning && duration > 0) {
    statusText = "Run complete! Processing..."; // Updated message before navigating
  }


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.coords.latitude : 37.78825,
          longitude: location ? location.coords.longitude : -122.4324,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
      >
        {route.length > 0 && <Polyline coordinates={route} strokeColor="#FF0000" strokeWidth={5} />}
      </MapView>
      <View style={styles.metricsContainer}>
        <Text style={styles.metricText}>Distance: {distance.toFixed(2)} km</Text>
        <Text style={styles.metricText}>Pace: {pace > 0 && !isNaN(pace) ? pace.toFixed(2) : '0.00'} min/km</Text>
        <Text style={styles.metricText}>Duration: {Math.floor(duration / 60)}m {duration % 60}s</Text>
        <Text style={styles.metricText}>Calories: {calories.toFixed(0)}</Text>
      </View>
      <View style={styles.controlsContainer}>
        {!isRunning && !isPaused && duration === 0 && (
          <Button title="Start Run" onPress={handleStartRun} />
        )}
        {isRunning && !isPaused && (
          <Button title="Pause Run" onPress={handlePauseRun} />
        )}
        {isRunning && isPaused && (
          <Button title="Resume Run" onPress={handleResumeRun} />
        )}
        {isRunning && ( // Show Stop Run button if running or paused
          <Button title="Stop Run" onPress={handleStopRun} color="red" />
        )}
         {!isRunning && duration > 0 && ( // After stopping a run, if user didn't navigate away yet
          <Button title="Start New Run" onPress={handleStartRun} />
        )}
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 0.55,
  },
  metricsContainer: {
    flex: 0.25,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  metricText: {
    fontSize: 20,
    fontWeight: '500',
  },
  controlsContainer: {
    flex: 0.15,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statusText: {
    flex: 0.05,
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 14,
    color: 'gray',
  }
});

export default RunTrackerScreen;

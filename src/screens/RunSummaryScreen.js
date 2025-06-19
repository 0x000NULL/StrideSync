import React from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

const RunSummaryScreen = ({ route, navigation }) => {
  // Expected route.params: { runData: { distance, duration, pace, calories, routeCoordinates } }
  const { runData } = route.params || {};

  if (!runData) {
    // Fallback if no runData is provided (e.g., direct navigation without data)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No run data available.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const { distance, duration, pace, calories, routeCoordinates } = runData;

  const handleProceedToSave = () => {
    // Navigate to SaveRunScreen and pass the current runData
    navigation.navigate('SaveRun', { runData });
  };

  const handleDiscardRun = () => {
    console.log('Run discarded');
    // Navigate back to the previous screen (RunTracker) or a main screen
    alert('Run Discarded!');
    navigation.goBack();
  };

  // Function to calculate the map region to fit the polyline
  const getMapRegion = () => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      return {
        latitude: 37.78825, // Default latitude
        longitude: -122.4324, // Default longitude
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    let minLat = routeCoordinates[0].latitude;
    let maxLat = routeCoordinates[0].latitude;
    let minLng = routeCoordinates[0].longitude;
    let maxLng = routeCoordinates[0].longitude;

    routeCoordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const latitudeDelta = (maxLat - minLat) * 1.2; // Add padding
    const longitudeDelta = (maxLng - minLng) * 1.2; // Add padding

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(0.02, latitudeDelta), // Ensure a minimum delta
      longitudeDelta: Math.max(0.02, longitudeDelta), // Ensure a minimum delta
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Run Summary</Text>

      <MapView
        style={styles.map}
        region={getMapRegion()}
        scrollEnabled={false} // Disable scroll for a static summary map
        zoomEnabled={false}   // Disable zoom for a static summary map
      >
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#FF0000" strokeWidth={4} />
        )}
      </MapView>

      <View style={styles.metricsContainer}>
        <Text style={styles.metricItem}>Distance: {distance ? distance.toFixed(2) : '0.00'} km</Text>
        <Text style={styles.metricItem}>Duration: {duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '0m 0s'}</Text>
        <Text style={styles.metricItem}>Pace: {pace && pace > 0 && !isNaN(pace) ? pace.toFixed(2) : '0.00'} min/km</Text>
        <Text style={styles.metricItem}>Calories: {calories ? calories.toFixed(0) : '0'} kcal</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Button title="Add Details & Save" onPress={handleProceedToSave} color="#4CAF50" />
        <Button title="Discard Run" onPress={handleDiscardRun} color="#F44336" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  map: {
    height: Dimensions.get('window').height * 0.35, // 35% of screen height
    borderRadius: 10,
    marginBottom: 20,
  },
  metricsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  metricItem: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default RunSummaryScreen;

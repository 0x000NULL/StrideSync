import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const RunMapView = ({ path }) => {
  const [region, setRegion] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);

  // Request location permission when component mounts
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
      } catch (err) {
        console.warn('Error getting location permission:', err);
      }
    })();
  }, []);

  // Update map region when path changes and user following is active
  useEffect(() => {
    if (isFollowingUser && path && path.length > 0) {
      const lastPoint = path[path.length - 1];
      setRegion({
        latitude: lastPoint.latitude,
        longitude: lastPoint.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [path, isFollowingUser]);

  const handlePanDrag = () => {
    // User has manually panned the map, so stop following
    if (isFollowingUser) {
      setIsFollowingUser(false);
    }
  };

  if (!hasLocationPermission) {
    return (
      <View style={[styles.mapView, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Location permission is required to track your run</Text>
      </View>
    );
  }

  const startPoint = path && path.length > 0 ? path[0] : null;
  const currentPoint = path && path.length > 0 ? path[path.length - 1] : null;

  return (
    <View style={styles.mapView}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={isFollowingUser}
        onPanDrag={handlePanDrag}
        showsMyLocationButton={true}
        loadingEnabled={true}
      >
        {path && path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor="#0000ff"
            strokeWidth={4}
          />
        )}
        {startPoint && (
           <Marker
            coordinate={startPoint}
            title="Start"
            pinColor="green"
          />
        )}
        {currentPoint && (
          <Marker
            coordinate={currentPoint}
            title="Current Location"
            pinColor="blue"
          />
        )}
      </MapView>
      {!isFollowingUser && (
        <TouchableOpacity 
            style={styles.recenterButton}
            onPress={() => setIsFollowingUser(true)}
        >
            <Text style={styles.recenterText}>Recenter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    mapView: {
        height: 300,
        width: '100%',
        marginBottom: 10,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    recenterButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    recenterText: {
        color: '#007AFF', // Blue color like system buttons
        fontWeight: 'bold',
    },
});

export default RunMapView; 
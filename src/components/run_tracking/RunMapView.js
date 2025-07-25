import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '@react-navigation/native';
import PropTypes from 'prop-types';

// Define commonly used colors to avoid inline color literals (react-native/no-color-literals)
const COLORS = {
  black: '#000',
};

const RunMapView = ({ path, showUserLocation = true }) => {
  const { colors } = useTheme();
  const [region, setRegion] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);

  // Request location permission when we intend to show user location
  useEffect(() => {
    if (!showUserLocation) {
      setHasLocationPermission(false);
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');

        if (status !== 'granted') {
          console.log('Permission to access location was denied');
        }
      } catch (err) {
        console.warn('Error getting location permission:', err);
      }
    })();
  }, [showUserLocation]);

  // Initialize region based on user location OR route path
  useEffect(() => {
    const initRegion = async () => {
      if (region) return;

      if (showUserLocation && hasLocationPermission) {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          });
          return;
        } catch (err) {
          console.warn('Error fetching current location:', err);
        }
      }

      // Fallback: center on start of path if available
      if (path && path.length > 0) {
        const first = path[0];
        setRegion({
          latitude: first.latitude,
          longitude: first.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    };

    initRegion();
  }, [showUserLocation, hasLocationPermission, path, region]);

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

  if (showUserLocation && !hasLocationPermission) {
    return (
      <View style={[styles.mapView, styles.mapViewNoPermission]}>
        <Text style={{ color: colors.text.secondary }}>
          Location permission is required to track your run
        </Text>
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
        showsUserLocation={showUserLocation}
        followsUserLocation={showUserLocation && isFollowingUser}
        onPanDrag={handlePanDrag}
        showsMyLocationButton={showUserLocation}
        loadingEnabled={true}
      >
        {path && path.length > 1 && (
          <Polyline coordinates={path} strokeColor={colors.primary} strokeWidth={4} />
        )}
        {startPoint && <Marker coordinate={startPoint} title="Start" pinColor="green" />}
        {showUserLocation && currentPoint && (
          <Marker coordinate={currentPoint} title="Current Location" pinColor="blue" />
        )}
      </MapView>
      {!isFollowingUser && (
        <TouchableOpacity
          style={[styles.recenterButton, { backgroundColor: colors.surface }]}
          onPress={() => setIsFollowingUser(true)}
        >
          <Text style={[styles.recenterText, { color: colors.primary }]}>Recenter</Text>
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
  mapViewNoPermission: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recenterText: {
    fontWeight: 'bold',
  },
});

RunMapView.propTypes = {
  path: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    })
  ),
  showUserLocation: PropTypes.bool,
};

RunMapView.defaultProps = {
  path: [],
  showUserLocation: true,
};

export default RunMapView;

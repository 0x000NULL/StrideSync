import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import {
  addLocationToCurrentRun,
  setError,
  setBackgroundTaskRegistered,
  setLocationUpdatesEnabled,
} from '../store/runSlice';

export const LOCATION_TASK_NAME = 'background-location-task';

// This reference will be set by the setup function called from your main app logic
let storeRef = null;

export const setStoreReference = store => {
  storeRef = store;
};

// 1. Define the task
// This task will run in the background and receive location updates.
// It needs a reference to the Redux store to dispatch actions.
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    if (storeRef) {
      storeRef.dispatch(setError({ message: 'Background location error', details: error.message }));
    }
    return;
  }
  if (data) {
    const { locations } = data;
    if (storeRef && locations && locations.length > 0) {
      // Dispatch an action to add these locations to the current run path
      // You might want to transform the location data here if needed
      const newLocationPoints = locations.map(loc => ({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: loc.timestamp,
        altitude: loc.coords.altitude,
        speed: loc.coords.speed,
        accuracy: loc.coords.accuracy,
        altitudeAccuracy: loc.coords.altitudeAccuracy,
        heading: loc.coords.heading,
      }));
      storeRef.dispatch(addLocationToCurrentRun(newLocationPoints));
    }
  }
});

// 2. Function to register the background task
export const registerBackgroundLocationTaskAsync = async dispatch => {
  try {
    // First, ensure permissions are granted. This should ideally be checked before calling this.
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      dispatch(setError({ message: 'Foreground location permission not granted.' }));
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      dispatch(setError({ message: 'Background location permission not granted.' }));
      return false;
    }

    // Check if already started
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (alreadyStarted) {
      console.log('Background location task already started.');
      dispatch(setBackgroundTaskRegistered(true));
      dispatch(setLocationUpdatesEnabled(true));
      return true;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      showsBackgroundLocationIndicator: true,
      timeInterval: 5000, // 5 seconds - adjust as needed
      distanceInterval: 10, // 10 meters - adjust as needed
      // deferredUpdatesInterval: 0, // fire immediately
      // deferredUpdatesDistance: 0, // fire immediately
      // activityType: Location.ActivityType.Fitness, // More specific for runs
      pausesUpdatesAutomatically: false, // For continuous tracking during a run
    });
    dispatch(setBackgroundTaskRegistered(true));
    dispatch(setLocationUpdatesEnabled(true));
    console.log('Background location task registered successfully.');
    return true;
  } catch (error) {
    console.error('Failed to register background location task:', error);
    dispatch(setError({ message: 'Failed to start location tracking.', details: error.message }));
    dispatch(setBackgroundTaskRegistered(false));
    dispatch(setLocationUpdatesEnabled(false));
    return false;
  }
};

// 3. Function to unregister the background task
export const unregisterBackgroundLocationTaskAsync = async dispatch => {
  try {
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background location task unregistered successfully.');
    } else {
      console.log('Background location task was not running.');
    }
    // Always update state regardless of whether it was running, to ensure consistency
    dispatch(setBackgroundTaskRegistered(false));
    dispatch(setLocationUpdatesEnabled(false));
    return true;
  } catch (error) {
    console.error('Failed to unregister background location task:', error);
    dispatch(setError({ message: 'Failed to stop location tracking.', details: error.message }));
    // Optionally leave flags as they are, or try to set them to a safe state
    // dispatch(setBackgroundTaskRegistered(false)); // Or true, depending on desired recovery
    // dispatch(setLocationUpdatesEnabled(false));
    return false;
  }
};

// It's crucial that `setStoreReference(store)` is called once your Redux store is initialized.
// For example, in your main App.js or store configuration file:
// import { store } from './store'; // your Redux store
// import { setStoreReference } from './services/backgroundLocationTask';
// setStoreReference(store);

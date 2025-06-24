import AppleHealthKit from 'react-native-health';
import { Platform } from 'react-native';

const { Permissions } = AppleHealthKit.Constants;

const permissions = {
  permissions: {
    read: [
      Permissions.HeartRate,
      Permissions.RestingHeartRate,
      Permissions.HeartRateVariability,
      Permissions.Height,
      Permissions.Weight,
      Permissions.DateOfBirth,
      Permissions.BiologicalSex,
      Permissions.Steps,
      Permissions.DistanceWalkingRunning,
      Permissions.ActiveEnergyBurned,
      Permissions.Workout,
    ],
    write: [
      Permissions.Workout,
      Permissions.HeartRate,
      Permissions.ActiveEnergyBurned,
      Permissions.DistanceWalkingRunning,
    ],
  },
};

class HealthService {
  isInitialized = false;

  initialize(callback) {
    if (Platform.OS !== 'ios') {
      return;
    }
    AppleHealthKit.initHealthKit(permissions, error => {
      if (error) {
        console.log('[ERROR] Cannot grant permissions!');
        this.isInitialized = false;
        callback(error, false);
        return;
      }
      this.isInitialized = true;
      callback(null, true);
    });
  }

  getAuthStatus(callback) {
    if (Platform.OS !== 'ios') {
      return;
    }
    AppleHealthKit.getAuthStatus(permissions, (err, results) => {
      if (err) {
        console.error('Error getting auth status:', err);
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  }

  getLatestHeight(callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.getLatestHeight(null, (err, result) => {
      callback(err, result);
    });
  }

  getLatestWeight(callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.getLatestWeight(null, (err, result) => {
      callback(err, result);
    });
  }

  getDateOfBirth(callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.getDateOfBirth(null, (err, result) => {
      callback(err, result);
    });
  }

  getBiologicalSex(callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.getBiologicalSex(null, (err, result) => {
      callback(err, result);
    });
  }

  getHeartRateSamples(options, callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.getHeartRateSamples(options, (err, results) => {
      callback(err, results);
    });
  }

  saveWorkout(options, callback) {
    if (!this.isInitialized) return;
    AppleHealthKit.saveWorkout(options, (err, result) => {
      callback(err, result);
    });
  }
}

export default new HealthService();

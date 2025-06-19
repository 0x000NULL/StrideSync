// __mocks__/expo-location.js
export const requestForegroundPermissionsAsync = jest.fn();
export const getCurrentPositionAsync = jest.fn();
export const watchPositionAsync = jest.fn(() => ({ remove: jest.fn() }));
export const Accuracy = {
  BestForNavigation: 'BestForNavigation',
};
export const PermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
};

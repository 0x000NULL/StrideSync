import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RunTrackerScreen from '../RunTrackerScreen';
import * as Location from 'expo-location';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(() => ({
    remove: jest.fn(),
  })),
  Accuracy: {
    High: 'high', // Mock accuracy value
  },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => <View {...props}>{props.children}</View>;
  const MockPolyline = (props) => <View {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Polyline: MockPolyline,
  };
});

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('RunTrackerScreen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Location.requestForegroundPermissionsAsync.mockReset();
    Location.getCurrentPositionAsync.mockReset();
    Location.watchPositionAsync.mockClear();
    mockNavigate.mockReset();

    // Default mock implementations
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 37.78825, longitude: -122.4324, accuracy: 5, altitude: 0, heading: 0, speed: 0 },
      timestamp: Date.now(),
    });
  });

  it('renders correctly and requests location permission', async () => {
    render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error message if location permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { getByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText('Permission to access location was denied')).toBeTruthy();
    });
  });

  it('shows "Start Run" button initially', async () => {
    const { getByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled()); // Ensure initial setup is done
    expect(getByText('Start Run')).toBeTruthy();
  });

  it('shows "Pause Run" and "Stop Run" buttons when run starts', async () => {
    const { getByText, queryByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Start Run'));

    await waitFor(() => {
      expect(getByText('Pause Run')).toBeTruthy();
      expect(getByText('Stop Run')).toBeTruthy();
      expect(queryByText('Start Run')).toBeNull();
    });
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('shows "Resume Run" and "Stop Run" buttons when run is paused', async () => {
    const { getByText, queryByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Start Run'));
    await waitFor(() => expect(getByText('Pause Run')).toBeTruthy());
    fireEvent.press(getByText('Pause Run'));

    await waitFor(() => {
      expect(getByText('Resume Run')).toBeTruthy();
      expect(getByText('Stop Run')).toBeTruthy();
      expect(queryByText('Pause Run')).toBeNull();
    });
  });

  it('resumes the run correctly', async () => {
    const { getByText, queryByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Start Run'));
    await waitFor(() => expect(getByText('Pause Run')).toBeTruthy());
    fireEvent.press(getByText('Pause Run'));
    await waitFor(() => expect(getByText('Resume Run')).toBeTruthy());
    fireEvent.press(getByText('Resume Run'));

    await waitFor(() => {
      expect(getByText('Pause Run')).toBeTruthy();
      expect(getByText('Stop Run')).toBeTruthy();
      expect(queryByText('Resume Run')).toBeNull();
    });
     // watchPositionAsync is called once on start, once on resume
    expect(Location.watchPositionAsync).toHaveBeenCalledTimes(2);
  });

  it('stops the run and navigates to summary screen if data exists', async () => {
    Location.watchPositionAsync.mockImplementation(async (options, callback) => {
      // Simulate a few location updates to generate a route
      callback({ coords: { latitude: 37.78825, longitude: -122.4324 }, timestamp: Date.now() });
      callback({ coords: { latitude: 37.78835, longitude: -122.4325 }, timestamp: Date.now() });
      return { remove: jest.fn() };
    });

    const { getByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Start Run'));
    await waitFor(() => expect(getByText('Pause Run')).toBeTruthy());

    // Let some time pass for metrics to be calculated (simulated by location updates)
    // Wait for watchPositionAsync to be called and route to be updated
    await waitFor(() => expect(Location.watchPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Stop Run'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('RunSummary', {
        runData: expect.objectContaining({
          distance: expect.any(Number),
          duration: expect.any(Number),
          pace: expect.any(Number),
          calories: expect.any(Number),
          routeCoordinates: expect.any(Array),
        }),
      });
    });
     expect(mockNavigation.navigate.mock.calls[0][1].runData.routeCoordinates.length).toBeGreaterThan(0);
  });

  it('stops the run and shows error if no data exists', async () => {
    // Ensure no location updates occur
     Location.watchPositionAsync.mockResolvedValue({ remove: jest.fn() });


    const { getByText } = render(<RunTrackerScreen navigation={mockNavigation} />);
    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.press(getByText('Start Run'));
    await waitFor(() => expect(getByText('Stop Run')).toBeTruthy()); // Wait for UI update

    fireEvent.press(getByText('Stop Run'));

    await waitFor(() => {
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
      expect(getByText('No run data recorded to summarize.')).toBeTruthy();
    });
  });

});

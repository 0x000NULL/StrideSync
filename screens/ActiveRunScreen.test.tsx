import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location'; // So we can access its mocked parts
import ActiveRunScreen from './ActiveRunScreen'; // Adjust path
import { RunProvider, useRun } from '../context/RunContext'; // Adjust path

// Mock the context and navigation
jest.mock('../context/RunContext', () => ({
  ...jest.requireActual('../context/RunContext'),
  useRun: jest.fn(),
}));
jest.mock('@react-navigation/native');
jest.mock('expo-location'); // Already created in __mocks__

const mockNavigate = jest.fn();
const mockUpdateRunProgress = jest.fn();
const mockPauseRun = jest.fn();
const mockStopRun = jest.fn();
const mockSetError = jest.fn();
const mockClearError = jest.fn();
const mockSetCurrentLocation = jest.fn();

const mockWatchPositionRemove = jest.fn();
(Location.watchPositionAsync as jest.Mock).mockReturnValue({ remove: mockWatchPositionRemove });


const initialMockRunState = {
  runStatus: 'idle',
  currentRun: null,
  currentLocation: null,
  pauseRun: mockPauseRun,
  stopRun: mockStopRun,
  updateRunProgress: mockUpdateRunProgress,
  setError: mockSetError,
  clearError: mockClearError,
  setCurrentLocation: mockSetCurrentLocation,
  // Add other state/functions ActiveRunScreen might use
};

const renderWithRunProvider = (component, providerState = initialMockRunState) => {
  (useRun as jest.Mock).mockReturnValue(providerState);
  return render(
    <RunProvider> {/* RunProvider itself uses the original context logic, useRun() is what we mock for the screen */}
      {component}
    </RunProvider>
  );
};


describe('ActiveRunScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: Location.PermissionStatus.GRANTED });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 10, longitude: 10, altitude: 0, accuracy: 0, altitudeAccuracy: 0, heading: 0, speed: 0 },
      timestamp: Date.now(),
    });
  });

  it('requests location permissions on mount', async () => {
    renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />);
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('handles permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: Location.PermissionStatus.DENIED });
    const { findByText } = renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />);

    expect(await findByText('Location permission denied. Please enable in settings.')).toBeTruthy();
    expect(mockSetError).toHaveBeenCalledWith(expect.any(Error)); // Error set in context
  });

  it('starts location watcher when run is active and permissions granted (not indoor)', async () => {
    const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active',
      currentRun: { id: 'run1', startTime: Date.now(), distance: 0, duration: 0, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: false },
    };
    renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);

    await waitFor(() => {
      expect(Location.watchPositionAsync).toHaveBeenCalledTimes(1);
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        }),
        expect.any(Function) // The callback
      );
    });
  });

  it('does NOT start location watcher if run is indoor', async () => {
    const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active',
      currentRun: { id: 'run1', startTime: Date.now(), distance: 0, duration: 0, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: true },
    };
    renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);

    await waitFor(() => {
      expect(Location.watchPositionAsync).not.toHaveBeenCalled();
    });
  });


  it('calls updateRunProgress with location updates', async () => {
    const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active',
      currentRun: { id: 'run1', startTime: Date.now() - 1000, distance: 0, duration: 1, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: false },
    };

    let locationCallback;
    (Location.watchPositionAsync as jest.Mock).mockImplementationOnce(async (options, callback) => {
      locationCallback = callback; // Capture the callback
      return { remove: mockWatchPositionRemove };
    });

    renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);

    await waitFor(() => expect(Location.watchPositionAsync).toHaveBeenCalled());

    const mockLocation1 = {
      coords: { latitude: 12.34, longitude: 56.78, altitude: 50, speed: 2, accuracy: 5 },
      timestamp: Date.now(),
    };

    // Simulate location update
    await act(async () => {
      if (locationCallback) locationCallback(mockLocation1);
    });

    await waitFor(() => {
      expect(mockUpdateRunProgress).toHaveBeenCalledTimes(1);
      expect(mockUpdateRunProgress).toHaveBeenCalledWith(expect.objectContaining({
        location: expect.objectContaining({
          latitude: mockLocation1.coords.latitude,
          longitude: mockLocation1.coords.longitude,
        }),
        distance: expect.any(Number), // haversine calculation makes this hard to predict exactly without more mocks
        duration: expect.any(Number),
        pace: expect.any(String), // or number depending on your formatting
      }));
    });
  });

  it('calls context.pauseRun and navigates on "Pause" button press', async () => {
     const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active', // Important: button is disabled otherwise
      currentRun: { id: 'run1', startTime: Date.now(), distance: 0, duration: 0, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: false },
    };
    const { getByText } = renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);
    fireEvent.press(getByText('Pause'));

    expect(mockPauseRun).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('Pause');
    expect(mockWatchPositionRemove).toHaveBeenCalledTimes(1); // Watcher should be removed
  });

  it('calls context.stopRun and navigates on "Stop" button press', async () => {
    const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active', // Can also be 'paused' for stop to be enabled
      currentRun: { id: 'run1', startTime: Date.now(), distance: 0, duration: 0, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: false },
    };
    const { getByText } = renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);
    fireEvent.press(getByText('Stop'));

    expect(mockStopRun).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('RunSummary');
    expect(mockWatchPositionRemove).toHaveBeenCalledTimes(1); // Watcher should be removed
  });

  it('cleans up location watcher on unmount', async () => {
    const activeRunState = {
      ...initialMockRunState,
      runStatus: 'active',
      currentRun: { id: 'run1', startTime: Date.now(), distance: 0, duration: 0, pace: 0, path: [], isPaused: false, pausedDuration: 0, isIndoor: false },
    };
    const { unmount } = renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, activeRunState);

    await waitFor(() => expect(Location.watchPositionAsync).toHaveBeenCalled()); // Ensure watcher started

    unmount();
    expect(mockWatchPositionRemove).toHaveBeenCalledTimes(1);
  });

  it('displays current location from context on map placeholder', async () => {
    const location = { latitude: 45.0, longitude: -75.0 };
    const stateWithLocation = {
      ...initialMockRunState,
      currentLocation: location,
    };
    const { findByText } = renderWithRunProvider(<ActiveRunScreen navigation={useNavigation()} />, stateWithLocation);

    expect(await findByText(`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`)).toBeTruthy();
  });

});

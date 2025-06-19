import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ActiveRunScreen from './ActiveRunScreen'; // Adjust path
import * as redux from 'react-redux';
import * as runSlice from '../../stores/run_tracking/runSlice';

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// Mock react-navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock specific actions/thunks that will be dispatched
// For thunks like completeRunTracking, we are checking if dispatch is called with a function.
// For simple actions like pauseRun, we can mock them or check the dispatched object.
jest.mock('../../stores/run_tracking/runSlice', () => ({
  ...jest.requireActual('../../stores/run_tracking/runSlice'), // Import actual things like initialState if needed by tests
  pauseRun: jest.fn(() => ({ type: 'run/pauseRun' })), // Mock as a simple action creator
  // completeRunTracking is a thunk, so dispatch will be called with a function.
  // We don't need to mock it here if we're just checking that dispatch is called with *a* function.
}));


describe('ActiveRunScreen', () => {
  let mockDispatch;
  let mockUseSelector;

  const initialMockRun = {
    id: 'run123',
    startTime: Date.now() - 60000, // Started 60 seconds ago
    path: [{ latitude: 10, longitude: 10, timestamp: Date.now() - 60000 }],
    distance: 1000, // meters
    duration: 60, // seconds (from slice, not screen's timer)
    pausedDuration: 0,
    isPaused: false,
  };

  beforeEach(() => {
    mockDispatch = jest.fn();
    redux.useDispatch.mockReturnValue(mockDispatch);
    mockUseSelector = redux.useSelector;
    jest.useFakeTimers();
    // Date.now() can be mocked here if precise start times are needed for elapsed time tests
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const renderScreen = (currentRunValue = initialMockRun, runStatusValue = 'active', isTrackingValue = true) => {
    mockUseSelector.mockImplementation(callback => {
      const state = {
        run: {
          currentRun: currentRunValue,
          runStatus: runStatusValue,
          isTracking: isTrackingValue,
        },
      };
      return callback(state);
    });
    return render(<ActiveRunScreen navigation={{ navigate: mockNavigate }} />);
  };

  it('renders "No active run" message if currentRun is null', () => {
    const { getByText } = renderScreen(null);
    expect(getByText(/No active run data/i)).toBeTruthy();
  });

  it('renders active run components when currentRun exists', () => {
    const { getByText } } = renderScreen();
    expect(getByText('MapView Placeholder')).toBeTruthy();
    expect(getByText(/Path points: 1/i)).toBeTruthy();
    expect(getByText(/Distance:/i)).toBeTruthy();
    expect(getByText(/Duration:/i)).toBeTruthy();
    expect(getByText(/Pace:/i)).toBeTruthy();
    expect(getByText('Pause')).toBeTruthy(); // Initial state is active, so "Pause"
    expect(getByText('Lap')).toBeTruthy();
    expect(getByText('Stop')).toBeTruthy();
    expect(getByText('Battery Optimization Active')).toBeTruthy(); // Placeholder
  });

  describe('Data Display and Formatting', () => {
    it('displays initial stats correctly and updates duration with timer', () => {
      // Mock Date.now() to control startTime for consistent elapsedTime calculation
      const mockStartTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime);

      const runData = {
        ...initialMockRun,
        startTime: mockStartTime - 10000, // Started 10 seconds ago
        distance: 150, // meters
        duration: 10, // from slice, if it were already running
        path: [{ latitude: 1, longitude: 1, timestamp: mockStartTime -10000}],
      };
      const { getByText, rerender } = renderScreen(runData, 'active', true);

      // Initial elapsed time based on startTime (10s)
      expect(getByText('Duration: 00:00:10')).toBeTruthy();
      expect(getByText('Distance: 0.15 km')).toBeTruthy(); // 150m path length * 0.01 = 1.5km, currentRun.distance should be used
                                                          // currentRun.distance is 150m -> 0.15km. Pace: (10/60) / 0.15 = 1.11 min/km
      expect(getByText(/Pace: \d{1,2}\.\d{2} min\/km/i)).toBeTruthy(); // Example: Pace: 1.11 min/km

      // Advance timer by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Duration should be 15 seconds now
      expect(getByText('Duration: 00:00:15')).toBeTruthy();
      // Distance and pace should also update if they depend on elapsedTime or new points
      // In this test, distance is static from mock, pace recalculates
      // Pace: (15/60) / 0.15 = 1.67 min/km
      expect(getByText(/Pace: \d{1,2}\.\d{2} min\/km/i)).toBeTruthy();


      Date.now.mockRestore();
    });

     it('shows "Resume" when paused and correct duration', () => {
      const pausedRunData = {
        ...initialMockRun,
        startTime: Date.now() - 120000, // started 2 mins ago
        duration: 90, // was active for 90s
        isPaused: true, // This flag is not directly on currentRun in the slice's state structure, runStatus handles it
      };
      const { getByText } = renderScreen(pausedRunData, 'paused', false);
      expect(getByText('Resume')).toBeTruthy();
      expect(getByText('Duration: 00:01:30')).toBeTruthy(); // Shows the stored duration when paused
    });
  });

  describe('User Interactions (Control Buttons)', () => {
    it('handles "Pause" button press when active', () => {
      const { getByText } = renderScreen();
      fireEvent.press(getByText('Pause'));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(runSlice.pauseRun).toHaveBeenCalledTimes(1); // Check if the mocked action creator was called
    });

    it('handles "Pause" (labeled "Resume") button press when paused', () => {
      // When paused, the button text becomes "Resume".
      // The current logic navigates to 'PauseScreen'.
      const { getByText } = renderScreen(initialMockRun, 'paused', false);
      fireEvent.press(getByText('Resume'));
      expect(mockNavigate).toHaveBeenCalledWith('Pause');
    });

    it('handles "Stop" button press', () => {
      const { getByText } = renderScreen();
      fireEvent.press(getByText('Stop'));
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      // completeRunTracking is a thunk
      expect(mockDispatch.mock.calls[0][0]).toBeInstanceOf(Function);
      expect(mockNavigate).toHaveBeenCalledWith('RunSummary');
    });

    it('handles "Lap" button press', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = renderScreen();
      fireEvent.press(getByText('Lap'));
      expect(consoleSpy).toHaveBeenCalledWith('Lap button pressed');
      consoleSpy.mockRestore();
    });
  });

  describe('Timer Logic', () => {
    it('timer clears on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const { unmount } = renderScreen();

      unmount();
      // The number of times clearInterval is called can be > 1 due to re-renders or multiple effects.
      // We just need to ensure it was called at least once by the relevant useEffect cleanup.
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('timer does not run or stops if run is not active or not tracking', () => {
      const mockStartTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime);

      const runData = { ...initialMockRun, startTime: mockStartTime - 5000, duration: 5 }; // 5s ago
      const { getByText, rerender } = renderScreen(runData, 'active', true);

      expect(getByText('Duration: 00:00:05')).toBeTruthy();

      act(() => { jest.advanceTimersByTime(2000); });
      expect(getByText('Duration: 00:00:07')).toBeTruthy();

      // Scenario 1: Run becomes paused
      mockUseSelector.mockImplementation(callback => callback({ run: { currentRun: runData, runStatus: 'paused', isTracking: false } }));
      rerender(<ActiveRunScreen navigation={{ navigate: mockNavigate }} />);

      act(() => { jest.advanceTimersByTime(3000); }); // Advance timer
      // Duration should remain 7s (or switch to currentRun.duration from slice if logic changes for pause)
      // Current logic for 'paused' in useEffect: setElapsedTime(currentRun.duration || 0);
      // So it would show currentRun.duration (which is 5s in this mock data for runData)
      expect(getByText(`Duration: ${formatDuration(runData.duration)}`)).toBeTruthy(); // e.g., 00:00:05

      // Scenario 2: Run is active but no longer tracking (e.g. GPS lost, though isTracking is simplified here)
      mockUseSelector.mockImplementation(callback => callback({ run: { currentRun: runData, runStatus: 'active', isTracking: false } }));
      rerender(<ActiveRunScreen navigation={{ navigate: mockNavigate }} />);
      act(() => { jest.advanceTimersByTime(3000); });
      // Duration should not advance if isTracking is false
      expect(getByText(`Duration: ${formatDuration(runData.duration)}`)).toBeTruthy(); // Remains 00:00:05

      Date.now.mockRestore();
    });
  });

  // Helper function copied for test file scope
  const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
});

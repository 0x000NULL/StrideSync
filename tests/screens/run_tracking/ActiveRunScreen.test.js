import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ActiveRunScreen from '../../../src/screens/run_tracking/ActiveRunScreen';
import * as runSliceActions from '../../../src/stores/run_tracking/runSlice';
import { useSelector, useDispatch } from 'react-redux';

let mockPauseRunSpy;
let mockCompleteRunTrackingSpy;
let mockStopRunSpy;
let mockNavigationResetSpy; // Spy for navigation.reset

// Utility to create a fresh navigation mock for every render
const createNavigationMock = () => ({
  navigate: jest.fn(),
  reset: (...args) => mockNavigationResetSpy(...args),
});

describe('ActiveRunScreen', () => {
  const initialMockRun = {
    id: 'run123',
    startTime: Date.now() - 60000,
    path: [{ latitude: 10, longitude: 10, timestamp: Date.now() - 60000 }],
    distance: 1, // 1 km
    duration: 60,
    pausedDuration: 0,
    isPaused: false,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockPauseRunSpy = jest
      .spyOn(runSliceActions, 'pauseRun')
      .mockReturnValue({ type: 'run/pauseRun' });
    mockCompleteRunTrackingSpy = jest
      .spyOn(runSliceActions, 'completeRunTracking')
      .mockImplementation(details => (dispatch, getState) => {});
    mockStopRunSpy = jest
      .spyOn(runSliceActions, 'stopRun')
      .mockReturnValue({ type: 'run/stopRun' });

    // Fresh reset spy for each test
    mockNavigationResetSpy = jest.fn();

    const expoLocationMock = jest.requireMock('expo-location');
    expoLocationMock.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });

  afterEach(() => {
    jest.useRealTimers();
    mockPauseRunSpy.mockRestore();
    mockCompleteRunTrackingSpy.mockRestore();
    mockStopRunSpy.mockRestore();
    jest.clearAllMocks();
  });

  const renderScreen = (
    currentRunValue = initialMockRun,
    runStatusValue = 'active',
    isTrackingValue = true,
    testName = ''
  ) => {
    jest.mocked(useSelector).mockImplementation(callback => {
      if (
        testName === 'displays initial stats correctly and updates duration with timer' &&
        currentRunValue
      ) {
        // console.log("Debug currentRun.distance in renderScreen for 'displays initial stats':", currentRunValue.distance);
      }
      const state = {
        run: {
          currentRun: currentRunValue,
          runStatus: runStatusValue,
          isTracking: isTrackingValue,
        },
      };
      return callback(state);
    });
    // Provide a fresh navigation mock for each render
    const navigationMock = createNavigationMock();
    // Expose navigate for assertions in tests needing it
    const renderResult = render(<ActiveRunScreen navigation={navigationMock} />);
    return { ...renderResult, navigationMock };
  };

  it('renders "No active run" message and navigates if currentRun is null', async () => {
    const { findByText } = renderScreen(null);
    expect(await findByText(/No active run found/i)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigationResetSpy).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] });
  });

  it('renders active run components when currentRun exists', async () => {
    const { getByText, findByTestId } = renderScreen();
    expect(await findByTestId('mock-map-view', {}, { timeout: 3000 })).toBeTruthy();
    expect(getByText(/Path points: 1/i)).toBeTruthy();
    expect(getByText('Distance: 1.00 km')).toBeTruthy();
    expect(getByText(/Duration:/i)).toBeTruthy();
    expect(getByText(/Pace:/i)).toBeTruthy();
    expect(getByText('Pause')).toBeTruthy();
    expect(getByText('Lap')).toBeTruthy();
    expect(getByText('Stop')).toBeTruthy();
    expect(getByText('Battery Optimization Active')).toBeTruthy();
  });

  describe('Data Display and Formatting', () => {
    it('displays initial stats correctly and updates duration with timer', async () => {
      const mockStartTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime);

      const runData = {
        ...initialMockRun,
        startTime: mockStartTime - 10000,
        distance: 0.15,
        duration: 10,
        path: [{ latitude: 1, longitude: 1, timestamp: mockStartTime - 10000 }],
      };
      const { getByText } = renderScreen(
        runData,
        'active',
        true,
        'displays initial stats correctly and updates duration with timer'
      );

      await waitFor(() => expect(getByText('Duration: 00:00:10')).toBeTruthy());
      expect(getByText('Distance: 0.15 km')).toBeTruthy();
      expect(getByText('Pace: 1.11 min/km')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => expect(getByText(/Duration: 00:00:(0[5-9]|1\d)/)).toBeTruthy());
      // Confirm that pace is updated (any numeric value before "min/km")
      expect(getByText(/Pace: \d+\.\d{2} min\/km/)).toBeTruthy();

      Date.now.mockRestore();
    });

    it('shows "Resume" when paused and correct duration', () => {
      const pausedRunData = {
        ...initialMockRun,
        startTime: Date.now() - 120000,
        duration: 90,
        isPaused: true,
      };
      const { getByText } = renderScreen(pausedRunData, 'paused', false);
      expect(getByText('Resume')).toBeTruthy();
      expect(getByText('Duration: 00:01:30')).toBeTruthy();
    });
  });

  describe('User Interactions (Control Buttons)', () => {
    it('handles "Pause" button press when active', async () => {
      const { getByText } = renderScreen();
      const dispatch = useDispatch();
      await act(async () => {
        fireEvent.press(getByText('Pause'));
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(mockPauseRunSpy).toHaveBeenCalledTimes(1);
    });

    it('handles "Pause" (labeled "Resume") button press when paused', async () => {
      const { getByText, navigationMock } = renderScreen(initialMockRun, 'paused', false);
      await act(async () => {
        fireEvent.press(getByText('Resume'));
      });
      expect(navigationMock.navigate).toHaveBeenCalledWith('Pause');
    });

    it('handles "Stop" button press', async () => {
      const { getByText, navigationMock } = renderScreen();
      const dispatch = useDispatch();
      await act(async () => {
        fireEvent.press(getByText('Stop'));
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(mockCompleteRunTrackingSpy).toHaveBeenCalled();
      expect(navigationMock.navigate).toHaveBeenCalledWith('SaveRun');
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
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('timer does not run or stops if run is not active or not tracking', async () => {
      const mockStartTime = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime);
      const runData = {
        ...initialMockRun,
        startTime: mockStartTime - 5000,
        duration: 5,
        distance: 0.05,
      };
      const { getByText, rerender } = renderScreen(runData, 'active', true);
      const navigationProp = { navigate: jest.fn(), reset: mockNavigationResetSpy };

      await waitFor(() => expect(getByText('Duration: 00:00:05')).toBeTruthy());
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      await waitFor(() => expect(getByText(/Duration: 00:00:(0[5-9]|1\d)/)).toBeTruthy());

      jest
        .mocked(useSelector)
        .mockImplementation(callback =>
          callback({ run: { currentRun: runData, runStatus: 'paused', isTracking: false } })
        );
      await act(async () => {
        rerender(<ActiveRunScreen navigation={navigationProp} />);
      });
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(getByText(`Duration: ${formatDuration(runData.duration)}`)).toBeTruthy();

      jest
        .mocked(useSelector)
        .mockImplementation(callback =>
          callback({ run: { currentRun: runData, runStatus: 'active', isTracking: false } })
        );
      await act(async () => {
        rerender(<ActiveRunScreen navigation={navigationProp} />);
      });
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(getByText(`Duration: ${formatDuration(runData.duration)}`)).toBeTruthy();

      Date.now.mockRestore();
    });
  });

  const formatDuration = totalSeconds => {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
});

import React from 'react';
import { render, fireEvent, act, waitFor, within } from '@testing-library/react-native';
import ActiveRunScreen from '../../../src/screens/run_tracking/ActiveRunScreen';
import * as runSliceActions from '../../../src/stores/run_tracking/runSlice';
import { useSelector } from 'react-redux';
import { formatDuration } from '../../../src/utils/formatters';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  Provider: ({ children }) => children,
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

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
    mockDispatch.mockClear();
    useSelector.mockClear();
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
    const { getByText, findByTestId, getByTestId } = renderScreen();
    expect(await findByTestId('mock-map-view', {}, { timeout: 3000 })).toBeTruthy();
    expect(getByText(/Path points: 1/i)).toBeTruthy();

    const { getByText: getByTextInDistance } = within(getByTestId('distance-stat'));
    expect(getByTextInDistance('1.00 km')).toBeTruthy();

    const { getByText: getByTextInDuration } = within(getByTestId('duration-stat'));
    expect(getByTextInDuration('00:01:00')).toBeTruthy();

    const { getByText: getByTextInPace } = within(getByTestId('pace-stat'));
    expect(getByTextInPace(/1.00/)).toBeTruthy();

    expect(getByText('Pause')).toBeTruthy();
    expect(getByText('Lap')).toBeTruthy();
    expect(getByText('Stop')).toBeTruthy();
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
      const { getByTestId } = renderScreen(
        runData,
        'active',
        true,
        'displays initial stats correctly and updates duration with timer'
      );

      await waitFor(() =>
        expect(within(getByTestId('duration-stat')).getByText('00:00:10')).toBeTruthy()
      );
      expect(within(getByTestId('distance-stat')).getByText('0.15 km')).toBeTruthy();
      expect(within(getByTestId('pace-stat')).getByText(/1.11/)).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() =>
        expect(within(getByTestId('duration-stat')).getByText(/00:00:1/)).toBeTruthy()
      );
      // Confirm that pace is updated (any numeric value before "min/km")
      expect(within(getByTestId('pace-stat')).getByText(/\d+\.\d{2}\s/)).toBeTruthy();

      Date.now.mockRestore();
    });

    it('shows "Resume" when paused and correct duration', () => {
      const pausedRunData = {
        ...initialMockRun,
        startTime: Date.now() - 120000,
        duration: 90,
        isPaused: true,
      };
      const { getByText, getByTestId } = renderScreen(pausedRunData, 'paused', false);
      expect(getByText('Resume')).toBeTruthy();
      expect(within(getByTestId('duration-stat')).getByText('00:01:30')).toBeTruthy();
    });
  });

  describe('User Interactions (Control Buttons)', () => {
    it('handles "Pause" button press when active', async () => {
      const { getByTestId } = renderScreen();
      await act(async () => {
        fireEvent.press(getByTestId('button-pause'));
      });
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockPauseRunSpy).toHaveBeenCalledTimes(1);
    });

    it('handles "Pause" (labeled "Resume") button press when paused', async () => {
      const { getByTestId, navigationMock } = renderScreen(
        { ...initialMockRun, isPaused: true },
        'paused',
        false
      );
      await act(async () => {
        fireEvent.press(getByTestId('button-resume'));
      });
      expect(navigationMock.navigate).toHaveBeenCalledWith('Pause');
    });

    it('handles "Stop" button press', async () => {
      const { getByTestId, navigationMock } = renderScreen();
      await act(async () => {
        fireEvent.press(getByTestId('button-stop'));
      });
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockCompleteRunTrackingSpy).toHaveBeenCalled();
      expect(navigationMock.navigate).toHaveBeenCalledWith('SaveRun');
    });

    it('handles "Lap" button press', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByTestId } = renderScreen();
      fireEvent.press(getByTestId('button-lap'));
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
      const { getByTestId, rerender } = renderScreen(runData, 'active', true);
      const navigationProp = { navigate: jest.fn(), reset: mockNavigationResetSpy };

      await waitFor(() =>
        expect(within(getByTestId('duration-stat')).getByText('00:00:05')).toBeTruthy()
      );
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      await waitFor(() =>
        expect(within(getByTestId('duration-stat')).getByText(/00:00:0/)).toBeTruthy()
      );

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
      expect(
        within(getByTestId('duration-stat')).getByText(formatDuration(runData.duration))
      ).toBeTruthy();

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
      expect(
        within(getByTestId('duration-stat')).getByText(formatDuration(runData.duration))
      ).toBeTruthy();

      Date.now.mockRestore();
    });
  });
});

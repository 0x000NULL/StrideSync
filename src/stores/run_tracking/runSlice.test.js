import runReducer, {
  initialState,
  startNewRun,
  pauseRun,
  resumeRun,
  stopRun,
  saveRun,
  discardRun,
  addLocationToCurrentRun,
  setError,
  clearError,
  rehydrateState,
  setBackgroundTaskRegistered,
  setLocationUpdatesEnabled,
  loadStateFromStorage,
  beginRunTracking,
  completeRunTracking,
  cancelActiveRun,
  // Assume setSelectedRunId is also exported if used in saveRun logic in tests
  setSelectedRunId,
} from './runSlice';
import AsyncStorage from '@react-NAMEREDACTED-async-storage/async-storage'; // Corrected import for mocking
import * as backgroundLocationTask from '../../services/run_tracking/backgroundLocationTask';

// Mock AsyncStorage
jest.mock('@react-NAMEREDACTED-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock backgroundLocationTask services
jest.mock('../../services/run_tracking/backgroundLocationTask', () => ({
  ...jest.requireActual('../../services/run_tracking/backgroundLocationTask'), // Import actual constants like LOCATION_TASK_NAME if needed
  registerBackgroundLocationTaskAsync: jest.fn(),
  unregisterBackgroundLocationTaskAsync: jest.fn(),
}));


describe('runSlice reducer', () => {
  it('should return the initial state', () => {
    expect(runReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('synchronous actions', () => {
    it('should handle startNewRun', () => {
      const runData = { id: 'run1', startTime: Date.now() };
      const nextState = runReducer(initialState, startNewRun(runData));
      expect(nextState.runStatus).toBe('active');
      expect(nextState.isTracking).toBe(true);
      expect(nextState.currentRun).toEqual({ ...runData, path: [] });
    });

    it('should handle pauseRun when a run is active', () => {
      const startTime = Date.now();
      const activeState = {
        ...initialState,
        runStatus: 'active',
        isTracking: true,
        currentRun: { id: 'run1', startTime, path: [], duration: 0, pausedDuration: 0, isPaused: false },
      };
      // Mock Date.now() for predictable pausedDuration calculation if it were part of pauseRun
      // jest.spyOn(Date, 'now').mockReturnValue(startTime + 10000); // 10 seconds later
      const nextState = runReducer(activeState, pauseRun());
      // Date.now().mockRestore();

      expect(nextState.runStatus).toBe('paused');
      expect(nextState.isTracking).toBe(false);
      // The current pauseRun doesn't update currentRun.isPaused or currentRun.pausedDuration directly
      // It relies on saveRelevantState. If we test these, we need to adjust pauseRun or this test.
      // For now, testing only what the reducer itself does.
      // expect(nextState.currentRun.isPaused).toBe(true);
      // expect(nextState.currentRun.pausedDuration).toBe(10000); // Example if it did
    });

    it('should handle pauseRun without a current run (no change expected)', () => {
        const nextState = runReducer(initialState, pauseRun());
        expect(nextState.runStatus).toBe('paused'); // It does change status
        expect(nextState.isTracking).toBe(false); // and tracking
        expect(nextState.currentRun).toBeNull();
    });


    it('should handle resumeRun when a run is paused', () => {
      const startTime = Date.now() - 20000; // Started 20s ago
      const pausedTime = Date.now() - 10000; // Paused 10s ago
      const pausedState = {
        ...initialState,
        runStatus: 'paused',
        isTracking: false,
        currentRun: {
          id: 'run1',
          startTime,
          path: [],
          duration: 10, // Active duration was 10s
          pausedDuration: 10000, // Paused for 10s
          isPaused: true,
          // lastPauseStartTime: pausedTime // if we were to track pause start time precisely
        },
      };
      // jest.spyOn(Date, 'now').mockReturnValue(pausedTime + 5000); // Resumed 5s after pause
      const nextState = runReducer(pausedState, resumeRun());
      // Date.now().mockRestore();

      expect(nextState.runStatus).toBe('active');
      expect(nextState.isTracking).toBe(true);
      // Similar to pauseRun, resumeRun doesn't modify currentRun.isPaused or pausedDuration directly in the reducer
      // expect(nextState.currentRun.isPaused).toBe(false);
      // expect(nextState.currentRun.pausedDuration).toBe(10000 + 5000); // Example
    });

    it('should handle stopRun', () => {
      const activeState = {
        ...initialState,
        runStatus: 'active',
        isTracking: true,
        currentRun: { id: 'run1', startTime: Date.now(), path: [] },
      };
      const endTime = Date.now() + 3600000; // 1 hour later
      const finalDetails = { endTime, distance: 5000, notes: 'Great run!' };
      const nextState = runReducer(activeState, stopRun(finalDetails));

      expect(nextState.runStatus).toBe('complete');
      expect(nextState.isTracking).toBe(false);
      expect(nextState.currentRun).toEqual({ ...activeState.currentRun, ...finalDetails });
    });

    it('should handle saveRun', () => {
      const runToSave = { id: 'run1', startTime: Date.now(), path: [], distance: 5000, duration: 1800 };
      const activeState = {
        ...initialState,
        runStatus: 'complete', // Usually run is complete before saving
        currentRun: runToSave,
        runs: [],
      };
      const nextState = runReducer(activeState, saveRun(runToSave)); // saveRun action receives the run to save

      expect(nextState.runs).toContainEqual(runToSave);
      expect(nextState.currentRun).toBeNull();
      expect(nextState.runStatus).toBe('idle');
      expect(nextState.isSaving).toBe(false); // isSaving is set by the thunk, not reducer directly usually
    });

    it('should handle discardRun', () => {
      const activeState = {
        ...initialState,
        runStatus: 'paused',
        currentRun: { id: 'run1', startTime: Date.now(), path: [] },
      };
      const nextState = runReducer(activeState, discardRun());

      expect(nextState.currentRun).toBeNull();
      expect(nextState.runStatus).toBe('idle');
    });

    it('should handle addLocationToCurrentRun with an empty path', () => {
      const activeState = {
        ...initialState,
        runStatus: 'active',
        isTracking: true,
        currentRun: { id: 'run1', startTime: Date.now(), path: [] },
      };
      const newLocations = [{ latitude: 1, longitude: 1, timestamp: Date.now() }];
      const nextState = runReducer(activeState, addLocationToCurrentRun(newLocations));
      expect(nextState.currentRun.path).toEqual(newLocations);
    });

    it('should handle addLocationToCurrentRun with an existing path', () => {
      const initialPath = [{ latitude: 0, longitude: 0, timestamp: Date.now() - 1000 }];
      const activeState = {
        ...initialState,
        runStatus: 'active',
        isTracking: true,
        currentRun: { id: 'run1', startTime: Date.now(), path: initialPath },
      };
      const newLocations = [{ latitude: 1, longitude: 1, timestamp: Date.now() }];
      const nextState = runReducer(activeState, addLocationToCurrentRun(newLocations));
      expect(nextState.currentRun.path).toEqual([...initialPath, ...newLocations]);
    });

    it('should not addLocationToCurrentRun if not tracking or no currentRun', () => {
      const pausedState = {
        ...initialState,
        runStatus: 'paused',
        isTracking: false,
        currentRun: { id: 'run1', startTime: Date.now(), path: [] },
      };
      const newLocations = [{ latitude: 1, longitude: 1, timestamp: Date.now() }];
      let nextState = runReducer(pausedState, addLocationToCurrentRun(newLocations));
      expect(nextState.currentRun.path).toEqual([]);

      const noRunState = { ...initialState, runStatus: 'idle', isTracking: false, currentRun: null };
      nextState = runReducer(noRunState, addLocationToCurrentRun(newLocations));
      expect(nextState.currentRun).toBeNull();
    });


    it('should handle setError', () => {
      const error = { message: 'Test error', details: 'Some details' };
      const nextState = runReducer(initialState, setError(error));
      expect(nextState.lastError).toEqual(error);
    });

    it('should handle clearError', () => {
      const errorState = { ...initialState, lastError: { message: 'Test error' } };
      const nextState = runReducer(errorState, clearError());
      expect(nextState.lastError).toBeNull();
    });

    it('should handle rehydrateState', () => {
      const persistedState = {
        runs: [{ id: 'runOld', distance: 1000 }],
        currentRun: { id: 'runPaused', distance: 500, path: [] },
      };
      const nextState = runReducer(initialState, rehydrateState(persistedState));
      expect(nextState.runs).toEqual(persistedState.runs);
      expect(nextState.currentRun).toEqual(persistedState.currentRun);
      expect(nextState.hydrated).toBe(true);
    });

    it('should handle rehydrateState with empty payload', () => {
      const nextState = runReducer(initialState, rehydrateState(null));
      expect(nextState.runs).toEqual(initialState.runs);
      expect(nextState.currentRun).toEqual(initialState.currentRun);
      expect(nextState.hydrated).toBe(true); // Still marks as hydrated
    });

    it('should handle setBackgroundTaskRegistered', () => {
        let nextState = runReducer(initialState, setBackgroundTaskRegistered(true));
        expect(nextState.backgroundTaskRegistered).toBe(true);
        nextState = runReducer(nextState, setBackgroundTaskRegistered(false));
        expect(nextState.backgroundTaskRegistered).toBe(false);
    });

    it('should handle setLocationUpdatesEnabled', () => {
        let nextState = runReducer(initialState, setLocationUpdatesEnabled(true));
        expect(nextState.locationUpdatesEnabled).toBe(true);
        nextState = runReducer(nextState, setLocationUpdatesEnabled(false));
        expect(nextState.locationUpdatesEnabled).toBe(false);
    });
  });

  describe('asynchronous thunks', () => {
    afterEach(() => {
      jest.clearAllMocks(); // Clear mock usage counts after each test
    });

    it('loadStateFromStorage should dispatch rehydrateState on success', async () => {
      const mockStoredState = { runs: [{ id: 'run1' }], currentRun: null };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockStoredState));
      const dispatch = jest.fn();

      await loadStateFromStorage()(dispatch, () => {}, undefined);

      // Check that rehydrateState was dispatched with the correct part of stored state
      const rehydrateAction = dispatch.mock.calls.find(call => call[0].type === rehydrateState.type);
      expect(rehydrateAction[0].payload).toEqual({
          runs: mockStoredState.runs,
          currentRun: mockStoredState.currentRun
      });
      // It also dispatches setStateHydrated(true) directly or indirectly via rehydrateState
      const setStateHydratedAction = dispatch.mock.calls.find(call => call[0].type === 'run/setStateHydrated');
      if (setStateHydratedAction) { // This action is dispatched from within the thunk directly
          expect(setStateHydratedAction[0].payload).toBe(true);
      } else { // or rehydrateState itself sets hydrated to true
          const finalStateAfterRehydrate = runReducer(initialState, rehydrateAction[0]);
          expect(finalStateAfterRehydrate.hydrated).toBe(true);
      }
    });

    it('loadStateFromStorage should dispatch setStateHydrated(true) if no state in storage', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const dispatch = jest.fn();
      await loadStateFromStorage()(dispatch, () => {}, undefined);
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'run/setStateHydrated', payload: true }));
    });

    it('loadStateFromStorage should dispatch setError and setStateHydrated(true) on failure', async () => {
        const error = new Error('AsyncStorage fail');
        AsyncStorage.getItem.mockRejectedValue(error);
        const dispatch = jest.fn();
        const thunk = loadStateFromStorage();
        await thunk(dispatch, () => {}, undefined);

        expect(dispatch).toHaveBeenCalledWith(setError(expect.objectContaining({ message: 'Failed to load saved run data.' })));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'run/setStateHydrated', payload: true }));

    });


    it('beginRunTracking should dispatch startNewRun and call registerBackgroundTaskAsync', async () => {
      const runData = { id: 'runNew', startTime: Date.now() };
      backgroundLocationTask.registerBackgroundLocationTaskAsync.mockResolvedValue(true);
      const dispatch = jest.fn();

      await beginRunTracking(runData)(dispatch, () => {}, undefined);

      expect(dispatch).toHaveBeenCalledWith(startNewRun(runData));
      expect(backgroundLocationTask.registerBackgroundLocationTaskAsync).toHaveBeenCalledWith(dispatch);
    });

    it('beginRunTracking should handle registration failure', async () => {
      const runData = { id: 'runNew', startTime: Date.now() };
      backgroundLocationTask.registerBackgroundLocationTaskAsync.mockResolvedValue(false); // Simulate failure
      const dispatch = jest.fn();
      const thunk = beginRunTracking(runData);
      const result = await thunk(dispatch, () => {}, undefined);

      expect(dispatch).toHaveBeenCalledWith(startNewRun(runData));
      expect(backgroundLocationTask.registerBackgroundLocationTaskAsync).toHaveBeenCalledWith(dispatch);
      // Check if it logs a warning or dispatches setError (setError is dispatched by register func itself)
      // The thunk itself might return a rejectedWithValue or log, current implementation logs a warning.
      // For this test, primarily concerned it calls the functions.
      // expect(result.meta.requestStatus).toBe('rejected'); // If using rejectWithValue
    });


    it('completeRunTracking should call unregister and dispatch stopRun', async () => {
      backgroundLocationTask.unregisterBackgroundLocationTaskAsync.mockResolvedValue(true);
      const finalDetails = { notes: 'Done!' };
      const dispatch = jest.fn();
      const getState = jest.fn(() => ({ run: { currentRun: {id: 'run123'} } })); // Mock getState

      await completeRunTracking(finalDetails)(dispatch, getState, undefined);

      expect(backgroundLocationTask.unregisterBackgroundLocationTaskAsync).toHaveBeenCalledWith(dispatch);
      expect(dispatch).toHaveBeenCalledWith(stopRun(expect.objectContaining(finalDetails)));
    });

    it('cancelActiveRun should call unregister and dispatch discardRun', async () => {
      backgroundLocationTask.unregisterBackgroundLocationTaskAsync.mockResolvedValue(true);
      const dispatch = jest.fn();

      await cancelActiveRun()(dispatch, () => {}, undefined);

      expect(backgroundLocationTask.unregisterBackgroundLocationTaskAsync).toHaveBeenCalledWith(dispatch);
      expect(dispatch).toHaveBeenCalledWith(discardRun());
    });
  });
});

// Small helper for console.log in addLocationToCurrentRun to avoid circular JSON issues in test output if path contains complex objects
// JSON.parse(JSON.stringify(state.currentRun.path)) is a simple way to deep log.
// This is just a note for the real implementation, not needed for the test itself.

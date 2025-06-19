import { runReducer, initialState, RunState, StartRunParams, Run, UpdateRunPayload } from './RunContext'; // Adjust path as needed

describe('runReducer', () => {
  it('should return the initial state', () => {
    expect(runReducer(undefined, {} as any)).toEqual(initialState);
  });

  it('should handle START_NEW_RUN', () => {
    const params: StartRunParams = { startTime: 1234567890000, isIndoor: false };
    const action = { type: 'START_NEW_RUN', payload: params };
    const state = runReducer(initialState, action);
    expect(state.runStatus).toBe('active');
    expect(state.currentRun).not.toBeNull();
    expect(state.currentRun?.startTime).toBe(params.startTime);
    expect(state.currentRun?.isIndoor).toBe(false);
    expect(state.currentRun?.path).toEqual([]);
    expect(state.currentLocation).toBeNull();
  });

  it('should handle PAUSE_RUN', () => {
    const startParams: StartRunParams = { startTime: Date.now() };
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: startParams });
    state = runReducer(state, { type: 'PAUSE_RUN' });
    expect(state.runStatus).toBe('paused');
    expect(state.currentRun?.isPaused).toBe(true);
  });

  it('should handle RESUME_RUN', () => {
    const startParams: StartRunParams = { startTime: Date.now() };
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: startParams });
    state = runReducer(state, { type: 'PAUSE_RUN' });
    state = runReducer(state, { type: 'RESUME_RUN' });
    expect(state.runStatus).toBe('active');
    expect(state.currentRun?.isPaused).toBe(false);
  });

  it('should handle STOP_RUN', () => {
    const startTime = Date.now() - 10000; // 10 seconds ago
    const startParams: StartRunParams = { startTime };
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: startParams });

    // Simulate some paused time
    if (state.currentRun) {
      state.currentRun.pausedDuration = 2000; // 2 seconds paused
    }

    const beforeStopTime = Date.now();
    state = runReducer(state, { type: 'STOP_RUN' });
    const afterStopTime = Date.now();

    expect(state.runStatus).toBe('saving');
    expect(state.isSaving).toBe(true);
    expect(state.currentRun?.endTime).toBeGreaterThanOrEqual(beforeStopTime);
    expect(state.currentRun?.endTime).toBeLessThanOrEqual(afterStopTime);

    const expectedDuration = ( (state.currentRun?.endTime || 0) - startTime) / 1000 - (state.currentRun?.pausedDuration || 0) / 1000;
    expect(state.currentRun?.duration).toBeCloseTo(expectedDuration);
    expect(state.currentLocation).toBeNull();
  });

  it('should handle SAVE_RUN', () => {
    const runToSave: Run = {
      id: 'testRun1',
      startTime: Date.now() - 10000,
      endTime: Date.now(),
      distance: 1000,
      duration: 600,
      pace: 600,
      path: [],
      isPaused: false,
      pausedDuration: 0
    };
    const action = { type: 'SAVE_RUN', payload: runToSave };
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: {startTime: Date.now()} }); // Simulate an active run
    state = runReducer(state, { type: 'STOP_RUN' }); // Move to saving state
    state = runReducer(state, action);

    expect(state.runs).toContain(runToSave);
    expect(state.currentRun).toBeNull();
    expect(state.runStatus).toBe('complete');
    expect(state.isSaving).toBe(false);
  });

  it('should handle DISCARD_RUN', () => {
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: {startTime: Date.now()} });
    state = runReducer(state, { type: 'DISCARD_RUN' });
    expect(state.currentRun).toBeNull();
    expect(state.runStatus).toBe('idle');
    expect(state.isSaving).toBe(false);
    expect(state.currentLocation).toBeNull();
  });

  it('should handle SET_ERROR and CLEAR_ERROR', () => {
    const error = new Error('Test error');
    let state = runReducer(initialState, { type: 'SET_ERROR', payload: error });
    expect(state.lastError).toBe(error);
    state = runReducer(state, { type: 'CLEAR_ERROR' });
    expect(state.lastError).toBeNull();
  });

  it('should handle UPDATE_RUN_PROGRESS', () => {
    const startParams: StartRunParams = { startTime: Date.now() };
    let state = runReducer(initialState, { type: 'START_NEW_RUN', payload: startParams });

    const locationData = { latitude: 10, longitude: 20, timestamp: Date.now(), accuracy: 5, speed: 2 };
    const updatePayload: UpdateRunPayload = {
      location: locationData,
      distance: 100,
      duration: 60,
      pace: 6,
    };
    state = runReducer(state, { type: 'UPDATE_RUN_PROGRESS', payload: updatePayload });

    expect(state.currentRun?.path).toContain(locationData);
    expect(state.currentRun?.distance).toBe(100);
    expect(state.currentRun?.duration).toBe(60);
    expect(state.currentRun?.pace).toBe(6);
    expect(state.currentLocation).toEqual({ latitude: locationData.latitude, longitude: locationData.longitude });
  });

  it('should handle SET_CURRENT_LOCATION', () => {
    const location = { latitude: 50, longitude: 50 };
    const action = { type: 'SET_CURRENT_LOCATION', payload: location };
    const state = runReducer(initialState, action);
    expect(state.currentLocation).toEqual(location);
  });

   it('should not modify state for PAUSE_RUN if currentRun is null', () => {
    const state = runReducer(initialState, { type: 'PAUSE_RUN' });
    expect(state).toEqual(initialState);
  });

  it('should not modify state for RESUME_RUN if currentRun is null', () => {
    const state = runReducer(initialState, { type: 'RESUME_RUN' });
    expect(state).toEqual(initialState);
  });

  it('should not modify state for STOP_RUN if currentRun is null', () => {
    const state = runReducer(initialState, { type: 'STOP_RUN' });
    expect(state).toEqual(initialState);
  });

  it('should not modify state for UPDATE_RUN_PROGRESS if currentRun is null', () => {
    const locationData = { latitude: 10, longitude: 20, timestamp: Date.now() };
    const updatePayload: UpdateRunPayload = {
      location: locationData,
      distance: 100,
      duration: 60,
      pace: 6,
    };
    const state = runReducer(initialState, { type: 'UPDATE_RUN_PROGRESS', payload: updatePayload });
    expect(state).toEqual(initialState);
  });

});

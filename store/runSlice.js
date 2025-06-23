import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RUN_STORAGE_KEY = '@strideKeeper/runState';

const initialState = {
  runStatus: 'idle', // 'idle'|'preRun'|'active'|'paused'|'saving'|'complete'
  currentRun: null,
  runs: [],
  selectedRunId: null,
  isSaving: false,
  lastError: null,
  isTracking: false,
  backgroundTaskRegistered: false,
  locationUpdatesEnabled: false,
  // UnitPreference, ThemePreference, and AudioCues will be handled by a separate settingsSlice
  hydrated: false, // To track if state has been loaded from storage
};

// Async thunk to load state from AsyncStorage
export const loadStateFromStorage = createAsyncThunk(
  'run/loadState',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const serializedState = await AsyncStorage.getItem(RUN_STORAGE_KEY);
      if (serializedState === null) {
        // No state in storage, app will use initialState, mark as hydrated
        dispatch(setStateHydrated(true));
        return null; // Or some default if needed
      }
      const storedState = JSON.parse(serializedState);
      // We only want to rehydrate specific parts of the state, not everything.
      // For example, runStatus, isTracking should reflect current app state, not stored.
      const stateToRehydrate = {
        runs: storedState.runs || [],
        currentRun: storedState.currentRun || null, // Only rehydrate if not actively running/paused?
        // selectedRunId could be rehydrated if needed.
      };
      dispatch(rehydrateState(stateToRehydrate));
    } catch (error) {
      console.error('Failed to load run state from AsyncStorage:', error);
      dispatch(setError({ message: 'Failed to load saved run data.', details: error.message }));
      // Mark as hydrated even on error to prevent re-attempts or to signal completion
      dispatch(setStateHydrated(true));
      return rejectWithValue(error.message);
    }
  }
);

import {
  registerBackgroundLocationTaskAsync,
  unregisterBackgroundLocationTaskAsync,
} from '../services/backgroundLocationTask';

// Helper function to save relevant parts of the state
const saveRelevantState = async state => {
  try {
    const stateToSave = {
      runs: state.runs,
      currentRun: state.currentRun, // Persist currentRun details
      // selectedRunId: state.selectedRunId, // If persistence is desired
    };
    const serializedState = JSON.stringify(stateToSave);
    await AsyncStorage.setItem(RUN_STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save run state to AsyncStorage:', error);
    // Optionally dispatch an error action
    // dispatch(setError({ message: 'Failed to save run data.', details: error.message }));
  }
};

// THUNKS for run lifecycle incorporating background tasks
export const beginRunTracking = createAsyncThunk(
  'run/beginTracking',
  async (newRunData, { dispatch, rejectWithValue }) => {
    try {
      // newRunData should be an object like { id: 'someid', startTime: Date.now(), path: [] }
      // It's important that newRunData has enough info to be a valid "Run" object shell.
      dispatch(startNewRun(newRunData));
      const registered = await registerBackgroundLocationTaskAsync(dispatch);
      if (!registered) {
        // If registration failed, we might want to stop the run or alert the user more actively.
        // For now, setError has been dispatched by registerBackgroundLocationTaskAsync.
        // We could potentially discard the run here if background tracking is essential.
        // dispatch(discardRun()); // Example: Rollback if task registration fails
        // return rejectWithValue('Failed to register background location task.');
        console.warn(
          'Background location task registration failed. Run started without background tracking.'
        );
      }
      return newRunData.id; // Or some other relevant data
    } catch (error) {
      console.error('beginRunTracking error:', error);
      dispatch(setError({ message: 'Failed to begin run.', details: error.message }));
      return rejectWithValue(error.message);
    }
  }
);

export const completeRunTracking = createAsyncThunk(
  'run/completeTracking',
  async (finalRunDetails, { dispatch, getState }) => {
    // finalRunDetails might be optional or contain things like endTime
    try {
      await unregisterBackgroundLocationTaskAsync(dispatch);
      // The stopRun action will update currentRun, set status to complete, etc.
      // It might receive final details like photos, notes, etc., from the UI.
      dispatch(stopRun(finalRunDetails || { endTime: Date.now() }));
      // Consider if saveRun should be part of this thunk or a separate user action.
      // For now, this thunk just stops tracking and updates run status.
      // The user would then explicitly save it.
      return getState().run.currentRun?.id;
    } catch (error) {
      console.error('completeRunTracking error:', error);
      dispatch(setError({ message: 'Failed to complete run.', details: error.message }));
      return error.message; // Should be rejectWithValue
    }
  }
);

export const cancelActiveRun = createAsyncThunk('run/cancelTracking', async (_, { dispatch }) => {
  try {
    await unregisterBackgroundLocationTaskAsync(dispatch);
    dispatch(discardRun());
  } catch (error) {
    console.error('cancelActiveRun error:', error);
    dispatch(setError({ message: 'Failed to cancel run.', details: error.message }));
    return error.message; // Should be rejectWithValue
  }
});

const runSlice = createSlice({
  name: 'run',
  initialState,
  reducers: {
    rehydrateState: (state, action) => {
      // Merge the loaded state. Be careful not to overwrite volatile state like runStatus here.
      if (action.payload) {
        state.runs = action.payload.runs || state.runs;
        // Logic for currentRun rehydration might need to be smarter:
        // e.g., only rehydrate currentRun if the app wasn't in an active/paused state.
        // For now, a simple rehydration. If app closed mid-run, this would restore it.
        state.currentRun = action.payload.currentRun || state.currentRun;
      }
      state.hydrated = true;
    },
    setStateHydrated: (state, action) => {
      state.hydrated = action.payload;
    },
    startNewRun: (state, action) => {
      state.runStatus = 'active';
      state.isTracking = true;
      // Ensure currentRun and its path are initialized
      state.currentRun = { ...action.payload, path: action.payload.path || [] };
      // Save state after starting a new run
      saveRelevantState(state);
    },
    pauseRun: state => {
      state.runStatus = 'paused';
      state.isTracking = false;
      // Save state when pausing
      saveRelevantState(state);
    },
    resumeRun: state => {
      state.runStatus = 'active';
      state.isTracking = true;
      // Save state when resuming
      saveRelevantState(state);
    },
    stopRun: (state, action) => {
      // Assuming action.payload might contain final run details
      state.runStatus = 'complete';
      state.isTracking = false;
      if (action.payload) {
        // Update currentRun with any final details from stop action
        state.currentRun = { ...state.currentRun, ...action.payload };
      }
      // Save state after stopping a run
      saveRelevantState(state);
    },
    saveRun: (state, action) => {
      // action.payload is the run to be saved
      state.isSaving = true;
      // Logic to add/update run in state.runs will be here or in an async thunk
      // For now, assuming action.payload is the complete run object to be added
      const existingRunIndex = state.runs.findIndex(r => r.id === action.payload.id);
      if (existingRunIndex !== -1) {
        state.runs[existingRunIndex] = action.payload;
      } else {
        state.runs.push(action.payload);
      }
      state.currentRun = null; // Clear current run after saving
      state.runStatus = 'idle';
      state.isSaving = false;
      // Save state after saving a run
      saveRelevantState(state);
    },
    discardRun: state => {
      state.currentRun = null;
      state.runStatus = 'idle';
      // Save state after discarding a run
      saveRelevantState(state);
    },
    // loadRuns reducer is effectively replaced by loadStateFromStorage thunk and rehydrateState
    // deleteRun and updateRun should also call saveRelevantState
    deleteRun: (state, action) => {
      // payload is runId
      state.runs = state.runs.filter(run => run.id !== action.payload);
      if (state.currentRun && state.currentRun.id === action.payload) {
        state.currentRun = null; // Clear current run if it's the one being deleted
        state.runStatus = 'idle';
      }
      saveRelevantState(state);
    },
    updateRun: (state, action) => {
      // payload: { runId, updates }
      const index = state.runs.findIndex(run => run.id === action.payload.runId);
      if (index !== -1) {
        state.runs[index] = { ...state.runs[index], ...action.payload.updates };
      }
      if (state.currentRun && state.currentRun.id === action.payload.runId) {
        state.currentRun = { ...state.currentRun, ...action.payload.updates };
      }
      saveRelevantState(state);
    },
    setError: (state, action) => {
      state.lastError = action.payload;
    },
    clearError: state => {
      state.lastError = null;
    },
    setBackgroundTaskRegistered: (state, action) => {
      state.backgroundTaskRegistered = action.payload;
    },
    setLocationUpdatesEnabled: (state, action) => {
      state.locationUpdatesEnabled = action.payload;
    },
    addLocationToCurrentRun: (state, action) => {
      if (state.currentRun && state.isTracking) {
        const newLocations = action.payload; // Expecting an array of location points
        state.currentRun.path = (state.currentRun.path || []).concat(newLocations);
        // Potentially update distance, duration, pace here or in a separate thunk
        // For now, just appending to path and saving.
        saveRelevantState(state); // Save state frequently with new locations
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadStateFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          // dispatch(rehydrateState(action.payload)) was called in thunk
        }
        state.hydrated = true;
      })
      .addCase(loadStateFromStorage.rejected, (state, action) => {
        state.hydrated = true;
      })
      .addCase(beginRunTracking.rejected, (state, action) => {
        // If beginRunTracking fails significantly, we might reset runStatus
        // state.runStatus = 'idle'; // Example if task registration is critical
        // setError would have been dispatched already by the thunk or register function
      })
      // Add cases for other thunks if needed for specific state changes on pending/fulfilled/rejected
      .addCase(completeRunTracking.fulfilled, (state, action) => {
        // stopRun is dispatched within, so runStatus is already 'complete'
      })
      .addCase(cancelActiveRun.fulfilled, (state, action) => {
        // discardRun is dispatched within, so currentRun is null and status 'idle'
      });
  },
});

export const {
  rehydrateState,
  setStateHydrated,
  startNewRun,
  pauseRun,
  resumeRun,
  stopRun,
  saveRun,
  discardRun,
  // loadRuns is removed as its functionality is covered by loadStateFromStorage
  deleteRun,
  updateRun,
  setBackgroundTaskRegistered,
  setLocationUpdatesEnabled,
  addLocationToCurrentRun,
  setError,
  clearError,
} = runSlice.actions;

export default runSlice.reducer;

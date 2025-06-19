import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// -------------------- DATA MODELS (from docs/run-tracking-flow-design.md) --------------------
interface Run {
  id: string;
  startTime: number; // Using number (timestamp) for easier state management
  endTime?: number;
  distance: number; // in meters
  duration: number; // in seconds
  pace: number; // seconds per kilometer
  path: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    altitude?: number;
    speed?: number;
    accuracy?: number;
    heartRate?: number;
  }>;
  shoeId?: string;
  notes?: string;
  weather?: {
    temperature?: number;
    condition?: 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog' | 'windy';
  };
  workoutType?: 'easy' | 'tempo' | 'interval' | 'long' | 'race' | 'recovery';
  effort?: 1 | 2 | 3 | 4 | 5;
  mood?: 'terrible' | 'bad' | 'neutral' | 'good' | 'great';
  isPaused: boolean;
  pausedDuration: number; // Total time paused in ms
  // Other fields from the doc can be added as needed
  isIndoor?: boolean;
}

interface StartRunParams {
  startTime: number;
  shoeId?: string;
  workoutType?: Run['workoutType'];
  isIndoor?: boolean;
  goal?: { type: 'time' | 'distance' | 'open', value?: number }; // From PreRunScreen spec
}

// -------------------- STATE DEFINITION --------------------
type RunStatus = 'idle' | 'preRun' | 'active' | 'paused' | 'saving' | 'complete';

interface RunState {
  runStatus: RunStatus;
  currentRun: Run | null;
  runs: Run[];
  isSaving: boolean;
  lastError: Error | null;
  currentLocation: { latitude: number; longitude: number } | null; // Added for current location
}

const initialState: RunState = {
  runStatus: 'idle',
  currentRun: null,
  runs: [],
  isSaving: false,
  lastError: null,
  currentLocation: null, // Added for current location
};

// -------------------- ACTIONS --------------------
// Payload for updating run progress
interface UpdateRunPayload {
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
    altitude?: number;
    speed?: number;
    accuracy?: number;
  };
  distance: number; // new total distance
  duration: number; // new total duration
  pace: number; // new current pace
}

type Action =
  | { type: 'START_NEW_RUN'; payload: StartRunParams }
  | { type: 'PAUSE_RUN' }
  | { type: 'RESUME_RUN' }
  | { type: 'STOP_RUN' }
  | { type: 'SAVE_RUN'; payload: Run }
  | { type: 'DISCARD_RUN' }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_RUN_PROGRESS'; payload: UpdateRunPayload } // New action for live updates
  | { type: 'SET_CURRENT_LOCATION'; payload: { latitude: number; longitude: number } | null }; // New action for current location

// -------------------- REDUCER --------------------
const runReducer = (state: RunState, action: Action): RunState => {
  switch (action.type) {
    case 'START_NEW_RUN':
      return {
        ...state,
        runStatus: 'active', // Directly to active as per typical flow
        currentRun: {
          id: `run_${Date.now()}`, // Simple ID generation
          startTime: action.payload.startTime,
          // Initialize other fields for a new run
          distance: 0,
          duration: 0,
          pace: 0,
          path: [],
          isPaused: false,
          pausedDuration: 0,
          shoeId: action.payload.shoeId,
          workoutType: action.payload.workoutType,
          isIndoor: action.payload.isIndoor,
        },
        lastError: null,
        currentLocation: null,
      };
    case 'PAUSE_RUN':
      if (!state.currentRun) return state;
      return {
        ...state,
        runStatus: 'paused',
        currentRun: { ...state.currentRun, isPaused: true },
      };
    case 'RESUME_RUN':
      if (!state.currentRun) return state;
      return {
        ...state,
        runStatus: 'active',
        currentRun: { ...state.currentRun, isPaused: false },
      };
    case 'STOP_RUN':
      if (!state.currentRun) return state;
      return {
        ...state,
        runStatus: 'saving',
        currentRun: { ...state.currentRun, endTime: Date.now(), duration: (Date.now() - state.currentRun.startTime) / 1000 - state.currentRun.pausedDuration / 1000 },
        isSaving: true,
        currentLocation: null,
      };
    case 'SAVE_RUN':
      return {
        ...state,
        runs: [...state.runs, action.payload],
        currentRun: null,
        runStatus: 'complete',
        isSaving: false,
      };
    case 'DISCARD_RUN':
      return {
        ...state,
        currentRun: null,
        runStatus: 'idle',
        isSaving: false,
        currentLocation: null,
      };
    case 'SET_ERROR':
      return { ...state, lastError: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, lastError: null };
    case 'UPDATE_RUN_PROGRESS':
      if (!state.currentRun) return state;
      return {
        ...state,
        currentRun: {
          ...state.currentRun,
          path: [...state.currentRun.path, action.payload.location],
          distance: action.payload.distance,
          duration: action.payload.duration,
          pace: action.payload.pace,
        },
        currentLocation: { latitude: action.payload.location.latitude, longitude: action.payload.location.longitude },
      };
    case 'SET_CURRENT_LOCATION':
        return { ...state, currentLocation: action.payload };
    default:
      return state;
  }
};

// -------------------- CONTEXT --------------------
interface RunContextProps extends RunState {
  startNewRun: (params: StartRunParams) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  saveRun: (run: Run) => void;
  discardRun: () => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
  updateRunProgress: (payload: UpdateRunPayload) => void; // New action dispatcher
  setCurrentLocation: (location: { latitude: number; longitude: number } | null) => void;
}

const RunContext = createContext<RunContextProps | undefined>(undefined);

// -------------------- PROVIDER --------------------
interface RunProviderProps {
  children: ReactNode;
}

export const RunProvider = ({ children }: RunProviderProps) => {
  const [state, dispatch] = useReducer(runReducer, initialState);

  const startNewRun = (params: StartRunParams) => dispatch({ type: 'START_NEW_RUN', payload: params });
  const pauseRun = () => dispatch({ type: 'PAUSE_RUN' });
  const resumeRun = () => dispatch({ type: 'RESUME_RUN' });
  const stopRun = () => dispatch({ type: 'STOP_RUN' });
  const saveRun = (run: Run) => dispatch({ type: 'SAVE_RUN', payload: run });
  const discardRun = () => dispatch({ type: 'DISCARD_RUN' });
  const setError = (error: Error | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });
  const updateRunProgress = (payload: UpdateRunPayload) => dispatch({ type: 'UPDATE_RUN_PROGRESS', payload });
  const setCurrentLocation = (location: { latitude: number; longitude: number } | null) => dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });

  return (
    <RunContext.Provider
      value={{
        ...state,
        startNewRun,
        pauseRun,
        resumeRun,
        stopRun,
        saveRun,
        discardRun,
        setError,
        clearError,
        updateRunProgress,
        setCurrentLocation,
      }}
    >
      {children}
    </RunContext.Provider>
  );
};

// -------------------- HOOK --------------------
export const useRun = (): RunContextProps => {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error('useRun must be used within a RunProvider');
  }
  return context;
};

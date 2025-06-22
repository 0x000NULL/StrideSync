// Polyfill for crypto.getRandomValues() needed by uuid
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { haversineDistance } from '../utils/unitUtils';

// Helper function to calculate pace in min/km
export const calculatePace = (distance, duration) => {
  if (!distance || !duration) return null;
  const paceInSeconds = duration / 60 / distance; // seconds per km
  const minutes = Math.floor(paceInSeconds / 60);
  const seconds = Math.round(paceInSeconds % 60);
  return { minutes, seconds };
};

export const createRunStore = (set, get) => ({
  // State
  runs: [],
  currentRun: null,
  isLoading: false,
  error: null,
  filters: {
    dateRange: 'all', // 'week', 'month', 'year', 'custom'
    startDate: null,
    endDate: null,
    minDistance: null,
    maxDistance: null,
    shoeId: null,
  },
  sortBy: 'date',
  sortOrder: 'desc',

  // Selector to get a single run by ID
  getRunById: id => {
    const runs = get().runs;
    return runs.find(run => run.id === id);
  },

  // Actions
  setFilters: filters => set({ filters: { ...get().filters, ...filters } }),

  setSort: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),

  addRun: runData => {
    const run = {
      ...runData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({ runs: [run, ...state.runs] }));

    return run.id;
  },

  updateRun: (id, updates) => {
    set(state => ({
      runs: state.runs.map(run => {
        if (run.id !== id) return run;
        let timestamp = new Date().toISOString();
        // Ensure the updatedAt differs from createdAt even if executed within the same ms
        if (timestamp === run.createdAt) {
          timestamp = new Date(Date.now() + 1).toISOString();
        }
        return { ...run, ...updates, updatedAt: timestamp };
      }),
    }));
  },

  deleteRun: id => {
    set(state => ({
      runs: state.runs.filter(run => run.id !== id),
    }));
  },

  // Clear all runs (for testing/development)
  clearAllRuns: () => {
    set({ runs: [] });
  },

  startRun: (initialData = {}) => {
    const newRun = {
      id: uuidv4(),
      startTime: new Date().toISOString(),
      endTime: null,
      distance: 0, // in kilometers
      duration: 0, // in seconds
      pace: { minutes: 0, seconds: 0 }, // min/km
      calories: 0,
      notes: '',
      shoeId: null,
      route: [], // Array of { latitude, longitude, timestamp }
      laps: [], // Array of { distance, duration }
      isPaused: false,
      ...initialData,
    };

    set({ currentRun: newRun });
    return newRun.id;
  },

  // Added alias so UI components can continue using legacy action name
  beginRunTracking: initialData => {
    // Simply reuse the more descriptive `startRun` implementation
    return get().startRun(initialData);
  },

  updateRunInProgress: updates => {
    const { currentRun } = get();
    if (!currentRun) return;

    // Calculate duration in seconds
    const startTime = new Date(currentRun.startTime);
    const currentTime = new Date();
    const duration = Math.floor((currentTime - startTime) / 1000);

    // Calculate pace if distance is updated
    let pace = currentRun.pace;
    if (updates.distance !== undefined) {
      pace = calculatePace(updates.distance, duration);
    }

    set({
      currentRun: {
        ...currentRun,
        ...updates,
        duration,
        pace: pace || currentRun.pace,
        endTime: updates.isPaused === false ? null : currentRun.endTime || new Date().toISOString(),
      },
    });
  },

  addLocationPoint: location => {
    const { currentRun } = get();
    if (!currentRun || currentRun.isPaused) return;

    const newPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date().toISOString(),
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
    };

    const newRoute = [...(currentRun.route || []), newPoint];
    let newDistance = currentRun.distance || 0;

    if (newRoute.length > 1) {
      const lastPoint = newRoute[newRoute.length - 2];
      const distanceIncrement = haversineDistance(lastPoint, newPoint) / 1000; // to kilometers

      // Add increment only if it's a reasonable value to filter out GPS jumps
      if (distanceIncrement > 0.001 && distanceIncrement < 1) {
        newDistance += distanceIncrement;
      }
    }

    set({
      currentRun: {
        ...currentRun,
        route: newRoute,
        distance: newDistance,
      },
    });
  },

  addLap: () => {
    const { currentRun } = get();
    if (!currentRun || currentRun.isPaused) return;

    // Calculate current duration
    const startTime = new Date(currentRun.startTime).getTime();
    const duration = (Date.now() - startTime) / 1000;

    const newLap = {
      distance: currentRun.distance,
      duration: duration,
    };

    set({
      currentRun: {
        ...currentRun,
        laps: [...(currentRun.laps || []), newLap],
      },
    });
  },

  pauseRun: () => {
    const { currentRun } = get();
    if (!currentRun || currentRun.endTime) return;

    set({
      currentRun: {
        ...currentRun,
        isPaused: true,
        endTime: new Date().toISOString(),
      },
    });
  },

  resumeRun: () => {
    const { currentRun } = get();
    if (!currentRun) return;

    // Adjust start time to account for the pause duration
    const pauseDuration = new Date() - new Date(currentRun.endTime);
    const newStartTime = new Date(new Date(currentRun.startTime).getTime() + pauseDuration);

    set({
      currentRun: {
        ...currentRun,
        isPaused: false,
        startTime: newStartTime.toISOString(),
        endTime: null,
      },
    });
  },

  saveRun: async runData => {
    const { currentRun } = get();
    if (!currentRun) return null;

    const runToSave = {
      ...currentRun,
      ...runData,
      id: currentRun.id || uuidv4(),
      endTime: currentRun.endTime || new Date().toISOString(),
      isPaused: false,
    };

    // Calculate final pace
    if (runToSave.distance && runToSave.duration) {
      runToSave.pace = calculatePace(runToSave.distance, runToSave.duration);
    }

    // Update shoe mileage if a shoe is associated with this run
    if (runToSave.shoeId && runToSave.distance > 0) {
      const { default: useShoeStore } = await import('./shoeStore');
      const shoeStore = useShoeStore.getState();
      shoeStore.updateShoeMileage(runToSave);
    }

    // Add to runs array
    set(state => ({
      runs: [runToSave, ...state.runs],
      currentRun: null,
    }));

    return runToSave.id;
  },

  discardRun: () => {
    set({ currentRun: null });
  },

  // CRUD operations for saved runs (duplicates removed, keeping original definitions)

  // Sync helper: called by Redux slice when it saves a run
  syncRunFromRedux: runData => {
    if (!runData || !runData.id) return;

    set(state => {
      const existingIndex = state.runs.findIndex(r => r.id === runData.id);
      if (existingIndex !== -1) {
        // Update existing
        const updatedRuns = [...state.runs];
        updatedRuns[existingIndex] = { ...state.runs[existingIndex], ...runData };
        return { runs: updatedRuns };
      }
      return { runs: [runData, ...state.runs] };
    });
  },

  // Selectors
  getRunsByShoe: shoeId => {
    return get().runs.filter(run => run.shoeId === shoeId);
  },

  getRecentRuns: (limit = 5) => {
    return [...get().runs]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
  },

  // Statistics
  getRunStats: (period = 'all') => {
    const now = new Date();
    let filteredRuns = [...get().runs];

    if (period !== 'all') {
      const cutoff = new Date();
      if (period === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
      } else if (period === 'year') {
        cutoff.setFullYear(now.getFullYear() - 1);
      }

      filteredRuns = filteredRuns.filter(run => new Date(run.startTime) >= cutoff);
    }

    const totalDistance = filteredRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
    const totalDuration = filteredRuns.reduce((sum, run) => sum + (run.duration || 0), 0);
    const totalRuns = filteredRuns.length;
    const avgPace = totalDistance > 0 ? calculatePace(totalDistance, totalDuration) : null;

    return {
      totalRuns,
      totalDistance,
      totalDuration,
      avgPace,
      runs: filteredRuns,
    };
  },
});

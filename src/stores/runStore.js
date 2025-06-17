import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { STORAGE_KEYS, saveData, loadData } from '../services/storage';

// Helper function to calculate pace in min/km
export const calculatePace = (distance, duration) => {
  if (!distance || !duration) return null;
  const paceInSeconds = duration / 60 / distance; // seconds per km
  const minutes = Math.floor(paceInSeconds / 60);
  const seconds = Math.round((paceInSeconds % 60));
  return { minutes, seconds };
};

// Helper function to calculate time period statistics
const calculatePeriodStats = (runs, startDate, endDate) => {
  const periodRuns = runs.filter(run => {
    const runDate = new Date(run.startTime);
    return isWithinInterval(runDate, { start: startDate, end: endDate });
  });

  const totalDistance = periodRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
  const totalDuration = periodRuns.reduce((sum, run) => sum + (run.duration || 0), 0);
  const totalRuns = periodRuns.length;
  
  return {
    totalDistance,
    totalDuration,
    averagePace: calculatePace(totalDistance, totalDuration),
    totalRuns,
  };
};

const PERSIST_DEBOUNCE_MS = 500;
let persistTimeout = null;

const persistRuns = (runs) => {
  // Cancel any pending persist operations
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  
  // Debounce the save operation
  persistTimeout = setTimeout(() => {
    saveData(STORAGE_KEYS.RUNS, runs).catch(console.error);
    persistTimeout = null;
  }, PERSIST_DEBOUNCE_MS);
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

  // Actions
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  setSort: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),
  
  addRun: (runData) => {
    const run = {
      ...runData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => {
      const newRuns = [run, ...state.runs];
      persistRuns(newRuns);
      return { runs: newRuns };
    });
    
    return run.id;
  },
  
  updateRun: (id, updates) => {
    set((state) => {
      const updatedRuns = state.runs.map((run) =>
        run.id === id
          ? { ...run, ...updates, updatedAt: new Date().toISOString() }
          : run
      );
      persistRuns(updatedRuns);
      return { runs: updatedRuns };
    });
  },
  
  deleteRun: (id) => {
    set((state) => {
      const updatedRuns = state.runs.filter((run) => run.id !== id);
      persistRuns(updatedRuns);
      return { runs: updatedRuns };
    });
  },
  
  // Load runs from storage
  loadRuns: async () => {
    try {
      set({ isLoading: true });
      const runs = await loadData(STORAGE_KEYS.RUNS, []);
      set({ runs, isLoading: false });
      return runs;
    } catch (error) {
      console.error('Error loading runs:', error);
      set({ error: 'Failed to load runs', isLoading: false });
      return [];
    }
  },
  
  // Clear all runs (for testing/development)
  clearAllRuns: async () => {
    try {
      await saveData(STORAGE_KEYS.RUNS, []);
      set({ runs: [] });
      return true;
    } catch (error) {
      console.error('Error clearing runs:', error);
      return false;
    }
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
      isPaused: false,
      ...initialData,
    };
    
    set({ currentRun: newRun });
    return newRun.id;
  },

  updateRunInProgress: (updates) => {
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

  addLocationPoint: (location) => {
    const { currentRun } = get();
    if (!currentRun) return;

    const newPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date().toISOString(),
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
    };

    set({
      currentRun: {
        ...currentRun,
        route: [...(currentRun.route || []), newPoint],
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

  saveRun: async (runData) => {
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
    set((state) => ({
      runs: [runToSave, ...state.runs],
      currentRun: null,
    }));

    return runToSave.id;
  },

  discardRun: () => {
    set({ currentRun: null });
  },

  // CRUD operations for saved runs
  addRun: (run) => {
    const newRun = {
      ...run,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      runs: [newRun, ...state.runs],
    }));
    
    return newRun.id;
  },

  updateRun: (id, updates) => {
    set((state) => ({
      runs: state.runs.map((run) =>
        run.id === id ? { ...run, ...updates, updatedAt: new Date().toISOString() } : run
      ),
    }));
  },

  deleteRun: (id) => {
    set((state) => ({
      runs: state.runs.filter((run) => run.id !== id),
    }));
  },

  // Selectors
  getRunById: (id) => {
    return get().runs.find((run) => run.id === id);
  },

  getRunsByShoe: (shoeId) => {
    return get().runs.filter((run) => run.shoeId === shoeId);
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
      
      filteredRuns = filteredRuns.filter(
        (run) => new Date(run.startTime) >= cutoff
      );
    }

    const totalDistance = filteredRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
    const totalDuration = filteredRuns.reduce((sum, run) => sum + (run.duration || 0), 0);
    const totalRuns = filteredRuns.length;
    const avgPace = totalDistance > 0 
      ? calculatePace(totalDistance, totalDuration) 
      : null;

    return {
      totalRuns,
      totalDistance,
      totalDuration,
      avgPace,
      runs: filteredRuns,
    };
  },
});

import { v4 as uuidv4 } from 'uuid';

// Helper function to calculate pace in min/km
export const calculatePace = (distance, duration) => {
  if (!distance || !duration) return null;
  const paceInSeconds = duration / 60 / distance; // seconds per km
  const minutes = Math.floor(paceInSeconds / 60);
  const seconds = Math.round((paceInSeconds % 60));
  return { minutes, seconds };
};

export const createRunStore = (set, get) => ({
  // State
  runs: [],
  currentRun: null,
  isLoading: false,
  error: null,

  // Actions
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

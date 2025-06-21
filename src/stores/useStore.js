import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import individual store creators
import { createRunStore } from './runStore';
import { createShoeStore } from './shoeStore';
import { createSettingsStore } from './settingsStore';

// Create the main store by combining all stores
export const useStore = create(
  persist(
    (set, get) => ({
      ...createRunStore(set, get),
      ...createShoeStore(set, get),
      ...createSettingsStore(set, get),
    }),
    {
      name: 'stride-sync-storage', // unique name for the storage key
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage in React Native
      partialize: (state) => ({
        // Only persist these parts of the state
        runs: state.runs,
        shoes: state.shoes,
        settings: state.settings,
      }),
      version: 1, // increment this to clear storage on version mismatch
    }
  )
);

// Selector hooks for better TypeScript support and performance
export const useRuns = () => useStore((state) => state.runs);
export const useAddRun = () => useStore((state) => state.addRun);
export const useUpdateRun = () => useStore((state) => state.updateRun);
export const useDeleteRun = () => useStore((state) => state.deleteRun);

export const useShoes = () => useStore((state) => state.shoes);
export const useAddShoe = () => useStore((state) => state.addShoe);
export const useUpdateShoe = () => useStore((state) => state.updateShoe);
export const useDeleteShoe = () => useStore((state) => state.deleteShoe);

export const useSettings = () => useStore((state) => state.settings);
export const useUpdateSettings = () => useStore((state) => state.updateSettings);

// Derived selectors
export const useRunStats = () => useStore((state) => ({
  totalRuns: state.runs.length,
  totalDistance: state.runs.reduce((sum, run) => sum + (run.distance || 0), 0),
  totalDuration: state.runs.reduce((sum, run) => sum + (run.duration || 0), 0),
}));

export const useShoeStats = (shoeId) => 
  useStore((state) => {
    const shoeRuns = state.runs.filter(run => run.shoeId === shoeId);
    return {
      totalRuns: shoeRuns.length,
      totalDistance: shoeRuns.reduce((sum, run) => sum + (run.distance || 0), 0),
      lastUsed: shoeRuns.length > 0 
        ? new Date(Math.max(...shoeRuns.map(r => new Date(r.date).getTime()))) 
        : null,
    };
  });

// Convenience hooks to mirror older naming
export const useRunStore = (selector) => useStore(selector);
export const useShoeStore = (selector) => useStore(selector);
export const useSettingsStore = (selector) => useStore(selector);

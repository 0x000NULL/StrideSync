import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { STORAGE_KEYS, saveData, loadData } from '../services/storage';

const PERSIST_DEBOUNCE_MS = 500;
let persistShoesTimeout = null;
let persistShoeUsageTimeout = null;

const persistShoes = (shoes) => {
  if (persistShoesTimeout) {
    clearTimeout(persistShoesTimeout);
  }
  
  persistShoesTimeout = setTimeout(() => {
    saveData(STORAGE_KEYS.SHOES, shoes).catch(console.error);
    persistShoesTimeout = null;
  }, PERSIST_DEBOUNCE_MS);
};

const persistShoeUsage = (shoeUsage) => {
  if (persistShoeUsageTimeout) {
    clearTimeout(persistShoeUsageTimeout);
  }
  
  persistShoeUsageTimeout = setTimeout(() => {
    saveData(STORAGE_KEYS.SHOE_USAGE, shoeUsage).catch(console.error);
    persistShoeUsageTimeout = null;
  }, PERSIST_DEBOUNCE_MS);
};

export const createShoeStore = (set, get) => ({
  // State
  shoes: [],
  isLoading: false,
  error: null,
  shoeUsage: {}, // Track shoe usage over time
  filters: {
    status: 'active', // 'active', 'retired', 'all'
    brand: null,
    minMileage: null,
    maxMileage: null,
  },
  sortBy: 'recent', // 'recent', 'mileage', 'name', 'age'
  sortOrder: 'desc',

  // Actions
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  setSort: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),
  
  // Update shoe mileage when a run is saved
  updateShoeMileage: (run) => {
    if (!run.shoeId || !run.distance) return;
    
    const { shoes, shoeUsage } = get();
    const shoe = shoes.find(s => s.id === run.shoeId);
    if (!shoe) return;
    
    const runDate = new Date(run.startTime);
    const monthYear = format(runDate, 'yyyy-MM');
    
    // Update monthly usage
    const updatedUsage = {
      ...shoeUsage,
      [shoe.id]: {
        ...(shoeUsage[shoe.id] || {}),
        [monthYear]: (shoeUsage[shoe.id]?.[monthYear] || 0) + run.distance,
        total: (shoeUsage[shoe.id]?.total || 0) + run.distance,
        lastUsed: Math.max(shoeUsage[shoe.id]?.lastUsed || 0, runDate.getTime())
      }
    };
    
    set({ shoeUsage: updatedUsage });
    persistShoeUsage(updatedUsage);
    
    // Auto-retire shoe if over max distance
    const currentMileage = updatedUsage[shoe.id]?.total || 0;
    if (shoe.maxDistance > 0 && currentMileage >= shoe.maxDistance) {
      get().updateShoe(shoe.id, { isActive: false });
    }
  },
  
  // Get shoe usage statistics
  getShoeUsage: (shoeId) => {
    const { shoeUsage } = get();
    return shoeUsage[shoeId] || { total: 0, monthly: {} };
  },
  
  // Get shoe statistics including runs data
  getShoeStats: (shoeId) => {
    const { runs } = get();
    const shoeRuns = runs.filter(run => run.shoeId === shoeId);
    
    if (shoeRuns.length === 0) {
      return {
        totalRuns: 0,
        totalDistance: 0,
        averageDistance: 0,
        lastUsed: null,
        runsPerWeek: 0,
        monthlyBreakdown: {},
      };
    }
    
    // Calculate basic stats
    const totalDistance = shoeRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
    const firstRun = new Date(Math.min(...shoeRuns.map(r => new Date(r.startTime).getTime())));
    const lastRun = new Date(Math.max(...shoeRuns.map(r => new Date(r.startTime).getTime())));
    const weeksUsed = Math.max(1, Math.ceil((lastRun - firstRun) / (7 * 24 * 60 * 60 * 1000)));
    
    // Calculate monthly breakdown
    const monthlyBreakdown = shoeRuns.reduce((acc, run) => {
      const monthYear = format(new Date(run.startTime), 'yyyy-MM');
      acc[monthYear] = (acc[monthYear] || 0) + (run.distance || 0);
      return acc;
    }, {});
    
    return {
      totalRuns: shoeRuns.length,
      totalDistance,
      averageDistance: totalDistance / shoeRuns.length,
      firstRun: firstRun.toISOString(),
      lastRun: lastRun.toISOString(),
      runsPerWeek: shoeRuns.length / weeksUsed,
      monthlyBreakdown,
    };
  },
  
  // Get shoes sorted by remaining distance
  getShoesByRemainingDistance: () => {
    const { shoes, shoeUsage } = get();
    return [...shoes]
      .filter(shoe => shoe.isActive && shoe.maxDistance > 0)
      .map(shoe => ({
        ...shoe,
        distanceUsed: shoeUsage[shoe.id]?.total || 0,
        remainingDistance: Math.max(0, shoe.maxDistance - (shoeUsage[shoe.id]?.total || 0))
      }))
      .sort((a, b) => a.remainingDistance - b.remainingDistance);
  },
  
  // Get shoes that need replacement soon
  getShoesNeedingReplacement: (threshold = 50) => {
    return get().getShoesByRemainingDistance()
      .filter(shoe => {
        const percentageLeft = (shoe.remainingDistance / shoe.maxDistance) * 100;
        return percentageLeft <= threshold;
      });
  },
  
  // Get shoes by status with filtering and sorting
  getFilteredShoes: () => {
    const { shoes, filters, sortBy, sortOrder } = get();
    
    return shoes
      .filter(shoe => {
        // Apply filters
        if (filters.status === 'active' && !shoe.isActive) return false;
        if (filters.status === 'retired' && shoe.isActive) return false;
        if (filters.brand && !shoe.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
        
        const usage = get().getShoeUsage(shoe.id).total || 0;
        if (filters.minMileage !== null && usage < filters.minMileage) return false;
        if (filters.maxMileage !== null && usage > filters.maxMileage) return false;
        
        return true;
      })
      .sort((a, b) => {
        const usageA = get().getShoeUsage(a.id);
        const usageB = get().getShoeUsage(b.id);
        
        let comparison = 0;
        
        switch (sortBy) {
          case 'recent':
            comparison = (usageB.lastUsed || 0) - (usageA.lastUsed || 0);
            break;
          case 'mileage':
            comparison = (usageB.total || 0) - (usageA.total || 0);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'age':
            comparison = new Date(b.purchaseDate) - new Date(a.purchaseDate);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'desc' ? comparison : -comparison;
      });
  },
  
  // Load data from storage
  loadShoes: async () => {
    try {
      set({ isLoading: true });
      const [shoes, shoeUsage] = await Promise.all([
        loadData(STORAGE_KEYS.SHOES, []),
        loadData(STORAGE_KEYS.SHOE_USAGE, {})
      ]);
      
      set({ 
        shoes,
        shoeUsage,
        isLoading: false 
      });
      
      return { shoes, shoeUsage };
    } catch (error) {
      console.error('Error loading shoes:', error);
      set({ error: 'Failed to load shoes', isLoading: false });
      return { shoes: [], shoeUsage: {} };
    }
  },
  
  // Clear all data (for testing/development)
  clearAllShoes: async () => {
    try {
      await Promise.all([
        saveData(STORAGE_KEYS.SHOES, []),
        saveData(STORAGE_KEYS.SHOE_USAGE, {})
      ]);
      
      set({ 
        shoes: [],
        shoeUsage: {}
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing shoes:', error);
      return false;
    }
  },
  
  // Import/Export functionality
  exportShoes: async () => {
    const { shoes, shoeUsage } = get();
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      shoes,
      shoeUsage
    };
  },
  
  importShoes: async (data) => {
    if (!data || !Array.isArray(data.shoes) || typeof data.shoeUsage !== 'object') {
      throw new Error('Invalid import data');
    }
    
    await Promise.all([
      saveData(STORAGE_KEYS.SHOES, data.shoes),
      saveData(STORAGE_KEYS.SHOE_USAGE, data.shoeUsage)
    ]);
    
    set({
      shoes: data.shoes,
      shoeUsage: data.shoeUsage
    });
    
    return true;
  },
  
  // Add a new shoe
  addShoe: (shoeData) => {
    const newShoe = {
      id: uuidv4(),
      name: '',
      brand: '',
      model: '',
      purchaseDate: new Date().toISOString(),
      initialDistance: 0, // km
      maxDistance: 800, // km
      isActive: true,
      notes: '',
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...shoeData,
    };

    set((state) => {
      const newShoes = [newShoe, ...state.shoes];
      persistShoes(newShoes);
      return { shoes: newShoes };
    });

    return newShoe.id;
  },

  updateShoe: (id, updates) => {
    set((state) => {
      const updatedShoes = state.shoes.map((shoe) =>
        shoe.id === id 
          ? { 
              ...shoe, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : shoe
      );
      persistShoes(updatedShoes);
      return { shoes: updatedShoes };
    });
  },

  deleteShoe: async (id) => {
    // First, remove shoeId from any runs that reference it
    const { runs, updateRun } = get();
    await Promise.all(
      runs
        .filter((run) => run.shoeId === id)
        .map((run) => updateRun(run.id, { shoeId: null }))
    );

    // Then delete the shoe
    set((state) => {
      const updatedShoes = state.shoes.filter((shoe) => shoe.id !== id);
      persistShoes(updatedShoes);
      
      // Also clean up shoe usage data
      const { shoeUsage } = state;
      const { [id]: _, ...remainingUsage } = shoeUsage;
      persistShoeUsage(remainingUsage);
      
      return { 
        shoes: updatedShoes,
        shoeUsage: remainingUsage 
      };
    });
  },

  toggleShoeActive: (id) => {
    set((state) => {
      const updatedShoes = state.shoes.map((shoe) =>
        shoe.id === id 
          ? { 
              ...shoe, 
              isActive: !shoe.isActive,
              updatedAt: new Date().toISOString() 
            } 
          : shoe
      );
      persistShoes(updatedShoes);
      return { shoes: updatedShoes };
    });
  },

  // Selectors
  getShoeById: (id) => {
    const shoe = get().shoes.find((shoe) => shoe.id === id);
    if (!shoe) return null;
    
    const usage = get().getShoeUsage(id);
    const stats = get().getShoeStats(id);
    
    return {
      ...shoe,
      ...usage,
      ...stats,
      remainingDistance: shoe.maxDistance > 0 
        ? Math.max(0, shoe.maxDistance - (usage.total || 0)) 
        : null,
      percentageUsed: shoe.maxDistance > 0 
        ? Math.min(100, Math.round(((usage.total || 0) / shoe.maxDistance) * 100))
        : null
    };
  },
  
  getActiveShoes: () => {
    return get().getFilteredShoes().filter(shoe => shoe.isActive);
  },
  
  getInactiveShoes: () => {
    return get().getFilteredShoes().filter(shoe => !shoe.isActive);
  },
  
  // Get statistics for all shoes
  getAllShoesStats: () => {
    const { shoes } = get();
    const stats = shoes.map(shoe => ({
      id: shoe.id,
      name: shoe.name,
      ...get().getShoeUsage(shoe.id),
      ...get().getShoeStats(shoe.id),
      maxDistance: shoe.maxDistance,
      isActive: shoe.isActive,
      purchaseDate: shoe.purchaseDate,
    }));
    
    const totalDistance = stats.reduce((sum, shoe) => sum + (shoe.totalDistance || 0), 0);
    const activeShoes = stats.filter(shoe => shoe.isActive);
    const retiredShoes = stats.filter(shoe => !shoe.isActive);
    
    return {
      totalShoes: stats.length,
      activeShoes: activeShoes.length,
      retiredShoes: retiredShoes.length,
      totalDistance,
      averageDistancePerShoe: stats.length > 0 ? totalDistance / stats.length : 0,
      shoes: stats,
    };
  },

  // Shoe rotation
  getNextShoeInRotation: () => {
    const { shoes, runs } = get();
    if (shoes.length === 0) return null;

    // Get active shoes sorted by total distance (least used first)
    const shoesWithUsage = shoes
      .filter(shoe => shoe.isActive)
      .map(shoe => ({
        ...shoe,
        totalDistance: runs
          .filter(run => run.shoeId === shoe.id)
          .reduce((sum, run) => sum + (run.distance || 0), 0)
      }))
      .sort((a, b) => a.totalDistance - b.totalDistance);

    return shoesWithUsage[0]?.id || null;
  },

  // Shoe health
  getShoeHealth: (shoeId) => {
    const shoe = get().shoes.find(s => s.id === shoeId);
    if (!shoe) return 0;
    
    const stats = get().getShoeStats(shoeId);
    const distanceUsed = stats.totalDistance;
    const maxDistance = shoe.maxDistance || 800; // Default 800km
    
    // Return percentage of life remaining (0-100)
    return Math.max(0, 100 - (distanceUsed / maxDistance) * 100);
  },
});

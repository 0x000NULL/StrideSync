import { v4 as uuidv4 } from 'uuid';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { saveData, loadData } from '../services/storage';

const EMPTY_SHOE_USAGE = Object.freeze({ total: 0, monthly: {} });

// Storage keys
const STORAGE_KEYS = {
  RUNS: '@StrideSync:runs',
  SHOES: '@StrideSync:shoes',
  SHOE_USAGE: '@StrideSync:shoeUsage',
  SETTINGS: '@StrideSync:settings',
  VERSION: '@StrideSync:version',
};

// Cache for memoized selectors
const statsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to generate cache key
const getCacheKey = (prefix, ...args) => {
  return `${prefix}_${JSON.stringify(args)}`;
};

// Helper to get cached result or compute and cache
const memoized = (prefix, fn) => (...args) => {
  const key = getCacheKey(prefix, ...args);
  const now = Date.now();
  
  if (statsCache.has(key)) {
    const { value, timestamp } = statsCache.get(key);
    if (now - timestamp < CACHE_TTL) {
      return value;
    }
  }
  
  const result = fn(...args);
  statsCache.set(key, { value: result, timestamp: now });
  return result;
};

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
    if (shoe.isActive && shoe.maxDistance > 0 && currentMileage >= shoe.maxDistance) {
      get().retireShoe(shoe.id, 'Automatically retired: Reached maximum distance');
    }
  },
  
  // Get shoe usage statistics
  getShoeUsage: memoized('getShoeUsage', (shoeId) => {
    return get().shoeUsage[shoeId] || EMPTY_SHOE_USAGE;
  }),
  
  // Get comprehensive shoe statistics
  // CHANGED: Applied memoized decorator
  getShoeStats: memoized('getShoeStats', (shoeId) => {
    const { runs, shoes } = get(); // 'get' should be accessible here from createShoeStore closure
    const shoe = shoes.find(s => s.id === shoeId);
    if (!shoe) return null;
    
    const shoeRuns = runs.filter(run => run.shoeId === shoeId);
    const now = new Date();
    const oneYearAgo = subMonths(now, 12);
    
    if (shoeRuns.length === 0) {
      return {
        // Basic info
        shoeId,
        name: shoe.name,
        brand: shoe.brand,
        purchaseDate: shoe.purchaseDate,
        maxDistance: shoe.maxDistance,
        isActive: shoe.isActive,
        
        // Usage stats
        totalRuns: 0,
        totalDistance: 0,
        averageDistance: 0,
        medianDistance: 0,
        longestRun: 0,
        shortestRun: 0,
        
        // Time-based stats
        firstRun: null,
        lastRun: null,
        daysSinceLastRun: null,
        runsPerWeek: 0,
        runsPerMonth: 0,
        
        // Distance breakdown
        monthlyBreakdown: {},
        weeklyAverage: 0,
        monthlyAverage: 0,
        
        // Projections
        estimatedRemainingRuns: shoe.maxDistance > 0 ? Math.floor(shoe.maxDistance / 5) : null, // Assuming 5km average run
        estimatedRetirementDate: null,
        
        // Usage patterns
        averageDaysBetweenRuns: null,
        mostCommonRunDay: null,
        mostCommonRunTime: null,
        
        // Performance
        averagePace: 0,
        bestPace: 0,
        averageHeartRate: 0,
      };
    }
    
    // Calculate basic stats
    const distances = shoeRuns.map(run => run.distance || 0);
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);
    const firstRun = new Date(Math.min(...shoeRuns.map(r => new Date(r.startTime).getTime())));
    const lastRun = new Date(Math.max(...shoeRuns.map(r => new Date(r.startTime).getTime())));
    const daysUsed = Math.max(1, Math.ceil((lastRun - firstRun) / (24 * 60 * 60 * 1000)));
    const weeksUsed = Math.max(1, Math.ceil(daysUsed / 7));
    const monthsUsed = Math.max(1, (lastRun.getFullYear() - firstRun.getFullYear()) * 12 + 
      (lastRun.getMonth() - firstRun.getMonth()) + 1);
    
    // Calculate monthly breakdown for the last 12 months
    const monthlyBreakdown = {};
    const currentMonth = format(now, 'yyyy-MM');
    monthlyBreakdown[currentMonth] = 0;
    
    for (let i = 1; i < 12; i++) {
      const month = format(subMonths(now, i), 'yyyy-MM');
      monthlyBreakdown[month] = 0;
    }
    
    // Calculate run days and times
    const runDays = new Array(7).fill(0);
    const runHours = new Array(24).fill(0);
    
    shoeRuns.forEach(run => {
      const runDate = new Date(run.startTime);
      const monthYear = format(runDate, 'yyyy-MM');
      
      if (monthlyBreakdown.hasOwnProperty(monthYear)) {
        monthlyBreakdown[monthYear] = (monthlyBreakdown[monthYear] || 0) + (run.distance || 0);
      }
      
      runDays[runDate.getDay()]++;
      runHours[runDate.getHours()]++;
    });
    
    // Calculate averages and medians
    const sortedDistances = [...distances].sort((a, b) => a - b);
    const medianDistance = sortedDistances.length % 2 === 0
      ? (sortedDistances[sortedDistances.length / 2 - 1] + sortedDistances[sortedDistances.length / 2]) / 2
      : sortedDistances[Math.floor(sortedDistances.length / 2)];
    
    // Calculate days between runs
    const sortedRuns = [...shoeRuns]
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    let totalDaysBetween = 0;
    for (let i = 1; i < sortedRuns.length; i++) {
      const prevDate = new Date(sortedRuns[i - 1].startTime);
      const currDate = new Date(sortedRuns[i].startTime);
      totalDaysBetween += (currDate - prevDate) / (1000 * 60 * 60 * 24);
    }
    
    const averageDaysBetweenRuns = totalDaysBetween / (sortedRuns.length - 1) || 0;
    
    // Find most common run day and time
    const mostCommonRunDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      runDays.indexOf(Math.max(...runDays))
    ];
    
    const mostCommonRunTime = `${runHours.indexOf(Math.max(...runHours))}:00`;
    
    // Calculate estimated retirement
    const weeklyAverage = totalDistance / weeksUsed;
    const monthlyAverage = totalDistance / monthsUsed;
    let estimatedRetirementDate = null;
    
    if (shoe.maxDistance > 0 && weeklyAverage > 0) {
      const remainingWeeks = (shoe.maxDistance - totalDistance) / weeklyAverage;
      const retirementDate = new Date(lastRun);
      retirementDate.setDate(retirementDate.getDate() + Math.ceil(remainingWeeks * 7));
      estimatedRetirementDate = retirementDate.toISOString();
    }
    
    // Calculate pace statistics if available
    const runsWithPace = shoeRuns.filter(run => run.pace);
    const averagePace = runsWithPace.length > 0
      ? runsWithPace.reduce((sum, run) => sum + run.pace, 0) / runsWithPace.length
      : 0;
      
    const bestPace = runsWithPace.length > 0
      ? Math.min(...runsWithPace.map(run => run.pace))
      : 0;
    
    // Calculate average heart rate if available
    const runsWithHR = shoeRuns.filter(run => run.averageHeartRate);
    const averageHeartRate = runsWithHR.length > 0
      ? Math.round(runsWithHR.reduce((sum, run) => sum + run.averageHeartRate, 0) / runsWithHR.length)
      : 0;
    
    return {
      // Basic info
      shoeId,
      name: shoe.name,
      brand: shoe.brand,
      purchaseDate: shoe.purchaseDate,
      maxDistance: shoe.maxDistance,
      isActive: shoe.isActive,
      
      // Usage stats
      totalRuns: shoeRuns.length,
      totalDistance,
      averageDistance: totalDistance / shoeRuns.length,
      medianDistance,
      longestRun: Math.max(...distances),
      shortestRun: Math.min(...distances),
      
      // Time-based stats
      firstRun: firstRun.toISOString(),
      lastRun: lastRun.toISOString(),
      daysSinceLastRun: Math.floor((now - lastRun) / (1000 * 60 * 60 * 24)),
      runsPerWeek: shoeRuns.length / weeksUsed,
      runsPerMonth: shoeRuns.length / monthsUsed,
      
      // Distance breakdown
      monthlyBreakdown,
      weeklyAverage,
      monthlyAverage,
      
      // Projections
      estimatedRemainingRuns: shoe.maxDistance > 0 
        ? Math.floor((shoe.maxDistance - totalDistance) / (totalDistance / shoeRuns.length || 5))
        : null,
      estimatedRetirementDate,
      
      // Usage patterns
      averageDaysBetweenRuns,
      mostCommonRunDay,
      mostCommonRunTime,
      
      // Performance
      averagePace,
      bestPace,
      averageHeartRate,
    };
  }), // END OF MEMOIZED WRAPPER
  
  // Get shoes that need replacement soon
  getShoesNeedingReplacement: () => {
    const { shoes } = get();
    return shoes.filter(shoe => {
      if (!shoe.isActive) return false;
      const stats = get().getShoeStats(shoe.id); // This will now call the memoized version
      if (!stats || !shoe.maxDistance) return false;
      const usagePercentage = (stats.totalDistance / shoe.maxDistance) * 100;
      return usagePercentage >= 80; // 80% or more of max distance
    });
  },
  
  // Get recently retired shoes (last 30 days)
  getRecentlyRetiredShoes: (days = 30) => {
    const { shoes } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return shoes.filter(shoe => 
      !shoe.isActive && 
      shoe.retirementDate && 
      new Date(shoe.retirementDate) >= cutoffDate
    );
  },
  
  // Get shoes by activity status
  getShoesByStatus: (status) => {
    const { shoes } = get();
    switch (status) {
      case 'active':
        return shoes.filter(shoe => shoe.isActive);
      case 'retired':
        return shoes.filter(shoe => !shoe.isActive);
      case 'all':
      default:
        return [...shoes];
    }
  },
  
  // Get shoes with enhanced statistics
  getShoesWithStats: () => {
    const { shoes } = get();
    return shoes.map(shoe => {
      const stats = get().getShoeStats(shoe.id);
      const usage = get().getShoeUsage(shoe.id);
      
      return {
        ...shoe,
        stats,
        usage,
        progress: shoe.maxDistance > 0 
          ? Math.min(100, ((usage?.total || 0) / shoe.maxDistance) * 100) 
          : 0,
        remainingDistance: shoe.maxDistance > 0 
          ? Math.max(0, shoe.maxDistance - (usage?.total || 0))
          : null,
      };
    });
  },
  
  // Get shoes sorted by remaining distance
  getShoesByRemainingDistance: () => {
    return get()
      .getShoesWithStats()
      .filter(shoe => shoe.isActive && shoe.maxDistance > 0)
      .sort((a, b) => a.stats.remainingDistance - b.stats.remainingDistance);
  },
  
  // Get shoes that need replacement soon
  getShoesNeedingReplacement: (threshold = 20) => {
    return get()
      .getShoesWithStats()
      .filter(shoe => {
        if (!shoe.isActive || !shoe.maxDistance) return false;
        const percentageLeft = ((shoe.maxDistance - (shoe.stats?.totalDistance || 0)) / shoe.maxDistance) * 100;
        return percentageLeft >= (100 - threshold) && percentageLeft < 100;
      })
      .sort((a, b) => (b.stats?.totalDistance / b.maxDistance) - (a.stats?.totalDistance / a.maxDistance));
  },
  
  // Get shoes by activity level
  getShoesByActivity: (period = 'month') => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = subMonths(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }
    
    return get()
      .getShoesWithStats()
      .filter(shoe => {
        const lastRun = shoe.stats?.lastRun ? new Date(shoe.stats.lastRun) : null;
        return lastRun && lastRun >= startDate;
      })
      .sort((a, b) => new Date(b.stats.lastRun) - new Date(a.stats.lastRun));
  },
  
  // Get shoe usage trends
  getShoeUsageTrends: (periods = 6) => {
    const { runs, shoes } = get();
    const now = new Date();
    const trends = [];
    
    // Get data for each period
    for (let i = periods - 1; i >= 0; i--) {
      const endDate = subMonths(now, i);
      const startDate = startOfMonth(endDate);
      const endOfPeriod = endOfMonth(endDate);
      const periodKey = format(startDate, 'MMM yyyy');
      
      // Filter runs for this period
      const periodRuns = runs.filter(run => {
        const runDate = new Date(run.startTime);
        return isWithinInterval(runDate, { start: startDate, end: endOfPeriod });
      });
      
      // Calculate usage by shoe
      const usageByShoe = periodRuns.reduce((acc, run) => {
        if (!run.shoeId) return acc;
        acc[run.shoeId] = (acc[run.shoeId] || 0) + (run.distance || 0);
        return acc;
      }, {});
      
      // Add to trends
      trends.push({
        period: periodKey,
        totalRuns: periodRuns.length,
        totalDistance: periodRuns.reduce((sum, run) => sum + (run.distance || 0), 0),
        shoes: Object.entries(usageByShoe).map(([shoeId, distance]) => {
          const shoe = shoes.find(s => s.id === shoeId);
          return {
            shoeId,
            name: shoe?.name || 'Unknown Shoe',
            distance,
            percentage: 0, // Will be calculated later
          };
        }),
      });
    }
    
    // Calculate percentages for each period
    return trends.map(period => ({
      ...period,
      shoes: period.shoes.map(shoe => ({
        ...shoe,
        percentage: period.totalDistance > 0 
          ? (shoe.distance / period.totalDistance) * 100 
          : 0,
      })),
    }));
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
  getShoeById: memoized('getShoeById', (id) => {
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
  }),
  
  getActiveShoes: memoized('getActiveShoes', () => 
    get().getFilteredShoes().filter(shoe => shoe.isActive)
  ),
  
  getInactiveShoes: memoized('getInactiveShoes', () => 
    get().getFilteredShoes().filter(shoe => !shoe.isActive)
  ),
  
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

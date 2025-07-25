import { v4 as uuidv4 } from 'uuid';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const EMPTY_SHOE_USAGE = Object.freeze({ total: 0, monthly: {} });

// Cache for memoized selectors
const statsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to generate cache key
const getCacheKey = (prefix, ...args) => {
  return `${prefix}_${JSON.stringify(args)}`;
};

// Helper to get cached result or compute and cache
const memoized =
  (prefix, fn) =>
  (...args) => {
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
  setFilters: filters => set({ filters: { ...get().filters, ...filters } }),

  setSort: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),

  // Update shoe mileage when a run is saved
  updateShoeMileage: run => {
    if (!run.shoeId || !run.distance) return;

    const { shoes } = get();
    const shoe = shoes.find(s => s.id === run.shoeId);
    if (!shoe) return;

    const runDate = new Date(run.startTime);
    const monthYear = format(runDate, 'yyyy-MM');

    // Update monthly usage
    set(state => ({
      shoeUsage: {
        ...state.shoeUsage,
        [shoe.id]: {
          ...(state.shoeUsage[shoe.id] || {}),
          [monthYear]: (state.shoeUsage[shoe.id]?.[monthYear] || 0) + run.distance,
          total: (state.shoeUsage[shoe.id]?.total || 0) + run.distance,
          lastUsed: Math.max(state.shoeUsage[shoe.id]?.lastUsed || 0, runDate.getTime()),
        },
      },
    }));

    // Auto-retire shoe if over max distance
    const currentMileage = get().shoeUsage[shoe.id]?.total || 0;
    if (shoe.isActive && shoe.maxDistance > 0 && currentMileage >= shoe.maxDistance) {
      get().retireShoe(shoe.id, 'Automatically retired: Reached maximum distance');
    }
  },

  // Get shoe usage statistics
  getShoeUsage: memoized('getShoeUsage', shoeId => {
    return get().shoeUsage[shoeId] || EMPTY_SHOE_USAGE;
  }),

  // Get comprehensive shoe statistics
  // CHANGED: Applied memoized decorator
  getShoeStats: memoized('getShoeStats', shoeId => {
    const { runs, shoes } = get(); // 'get' should be accessible here from createShoeStore closure
    const shoe = shoes.find(s => s.id === shoeId);
    if (!shoe) return null;

    const shoeRuns = runs.filter(run => run.shoeId === shoeId);
    const now = new Date();

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
    const monthsUsed = Math.max(
      1,
      (lastRun.getFullYear() - firstRun.getFullYear()) * 12 +
        (lastRun.getMonth() - firstRun.getMonth()) +
        1
    );

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
    const medianDistance =
      sortedDistances.length % 2 === 0
        ? (sortedDistances[sortedDistances.length / 2 - 1] +
            sortedDistances[sortedDistances.length / 2]) /
          2
        : sortedDistances[Math.floor(sortedDistances.length / 2)];

    // Calculate days between runs
    const sortedRuns = [...shoeRuns].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

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
      if (isFinite(remainingWeeks)) {
        estimatedRetirementDate = new Date();
        estimatedRetirementDate.setDate(now.getDate() + remainingWeeks * 7);
      }
    }

    // Calculate pace statistics if available
    const runsWithPace = shoeRuns.filter(run => run.pace);
    const averagePace =
      runsWithPace.length > 0
        ? runsWithPace.reduce((sum, run) => sum + run.pace, 0) / runsWithPace.length
        : 0;

    const bestPace = runsWithPace.length > 0 ? Math.min(...runsWithPace.map(run => run.pace)) : 0;

    // Calculate average heart rate if available
    const runsWithHR = shoeRuns.filter(run => run.avgHeartRate);
    const averageHeartRate =
      runsWithHR.length > 0
        ? Math.round(
            shoeRuns.reduce((sum, run) => sum + (run.avgHeartRate || 0), 0) / shoeRuns.length
          ) || 0
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
      estimatedRemainingRuns:
        shoe.maxDistance > 0
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

  // Get recently retired shoes (last 30 days)
  getRecentlyRetiredShoes: (days = 30) => {
    const { shoes } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return shoes.filter(
      shoe => !shoe.isActive && shoe.retirementDate && new Date(shoe.retirementDate) >= cutoffDate
    );
  },

  // Get shoes by activity status
  getShoesByStatus: status => {
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
        progress:
          shoe.maxDistance > 0 ? Math.min(100, ((usage?.total || 0) / shoe.maxDistance) * 100) : 0,
        remainingDistance:
          shoe.maxDistance > 0 ? Math.max(0, shoe.maxDistance - (usage?.total || 0)) : null,
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
          const shoeInfo = shoes.find(s => s.id === shoeId);
          return {
            shoeId,
            name: shoeInfo?.name || 'Unknown Shoe',
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
        percentage: period.totalDistance > 0 ? (shoe.distance / period.totalDistance) * 100 : 0,
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
        if (filters.brand && !shoe.brand.toLowerCase().includes(filters.brand.toLowerCase()))
          return false;

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

  // Add a new shoe
  addShoe: shoeData => {
    const newShoe = {
      id: uuidv4(),
      ...shoeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      retirementDate: null,
      retirementReason: null,
    };

    set(state => ({ shoes: [newShoe, ...state.shoes] }));

    return newShoe;
  },

  // Update an existing shoe
  updateShoe: (id, updates) => {
    set(state => ({
      shoes: state.shoes.map(shoe =>
        shoe.id === id ? { ...shoe, ...updates, updatedAt: new Date().toISOString() } : shoe
      ),
    }));
  },

  // Retire a shoe
  retireShoe: (id, reason) => {
    set(state => ({
      shoes: state.shoes.map(shoe =>
        shoe.id === id
          ? {
              ...shoe,
              isActive: false,
              retirementDate: new Date().toISOString(),
              retirementReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : shoe
      ),
    }));
  },

  // Un-retire a shoe
  unretireShoe: id => {
    set(state => ({
      shoes: state.shoes.map(shoe =>
        shoe.id === id
          ? {
              ...shoe,
              isActive: true,
              retirementDate: null,
              retirementReason: null,
              updatedAt: new Date().toISOString(),
            }
          : shoe
      ),
    }));
  },

  // Delete a shoe
  deleteShoe: id => {
    set(state => ({
      shoes: state.shoes.filter(shoe => shoe.id !== id),
      shoeUsage: Object.fromEntries(
        Object.entries(state.shoeUsage).filter(([shoeId]) => shoeId !== id)
      ),
    }));
  },

  // Clear all shoes (for testing/development)
  clearAllShoes: () => {
    set({ shoes: [], shoeUsage: {} });
  },

  // Get all brands
  getBrands: memoized('getBrands', () => {
    const { shoes } = get();
    return Array.from(new Set(shoes.map(s => s.brand)));
  }),

  // Selectors
  getShoeById: memoized('getShoeById', id => {
    const selectedShoe = get().shoes.find(s => s.id === id);
    if (!selectedShoe) return null;

    const usage = get().getShoeUsage(id);
    const stats = get().getShoeStats(id);

    return {
      ...selectedShoe,
      ...usage,
      ...stats,
      remainingDistance:
        selectedShoe.maxDistance > 0
          ? Math.max(0, selectedShoe.maxDistance - (usage.total || 0))
          : null,
      percentageUsed:
        selectedShoe.maxDistance > 0
          ? Math.min(100, Math.round(((usage.total || 0) / selectedShoe.maxDistance) * 100))
          : null,
    };
  }),

  getActiveShoes: memoized('getActiveShoes', () =>
    get()
      .getFilteredShoes()
      .filter(shoe => shoe.isActive)
  ),

  getInactiveShoes: memoized('getInactiveShoes', () =>
    get()
      .getFilteredShoes()
      .filter(shoe => !shoe.isActive)
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

    const totalDistance = stats.reduce((sum, statsItem) => sum + (statsItem.totalDistance || 0), 0);
    const activeShoes = stats.filter(statsItem => statsItem.isActive);
    const retiredShoes = stats.filter(statsItem => !statsItem.isActive);

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
          .reduce((sum, run) => sum + (run.distance || 0), 0),
      }))
      .sort((a, b) => a.totalDistance - b.totalDistance);

    return shoesWithUsage[0]?.id || null;
  },

  // Shoe health
  getShoeHealth: shoeId => {
    const shoe = get().shoes.find(s => s.id === shoeId);
    if (!shoe) return 0;

    const stats = get().getShoeStats(shoeId);
    const distanceUsed = stats.totalDistance;
    const maxDistance = shoe.maxDistance || 800; // Default 800km

    // Return percentage of life remaining (0-100)
    return Math.max(0, 100 - (distanceUsed / maxDistance) * 100);
  },

  // =============================
  // New helper actions/selectors added to support UI screens
  // =============================

  // Simple async loader – currently just toggles loading state
  loadShoes: async () => {
    // Prevent overlapping calls
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      // In the current architecture, shoes are persisted via zustand-persist and
      // therefore already available in memory after hydration. If in the future
      // remote fetching is introduced, place your API request logic here and
      // update the `shoes` array as needed (e.g., `set({ shoes: fetchedShoes })`).
      // For now we simulate a small delay so the UI can show a spinner.
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error('loadShoes error:', err);
      set({ error: err?.message || 'Failed to load shoes' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Shoes that have reached (or exceeded) their configured maximum distance while still active
  getShoesNeedingReplacement: () => {
    const { shoes, getShoeUsage, getShoeStats } = get();
    return shoes
      .filter(shoe => {
        if (!shoe.isActive) return false;
        if (!shoe.maxDistance || shoe.maxDistance <= 0) return false;
        const total = getShoeUsage(shoe.id).total || 0;
        return total >= shoe.maxDistance;
      })
      .map(shoe => ({
        ...shoe,
        usage: getShoeUsage(shoe.id),
        stats: getShoeStats(shoe.id),
      }));
  },

  // Convenience: get shoes based on active/retired status
  // This was a duplicate, the one above (getShoesByActivity by period) is kept.
  // getShoesByActivity: isActive => {
  //   const { shoes } = get();
  //   return shoes.filter(shoe => shoe.isActive === isActive);
  // },
});

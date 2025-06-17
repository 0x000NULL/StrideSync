import { v4 as uuidv4 } from 'uuid';

export const createShoeStore = (set, get) => ({
  // State
  shoes: [],
  isLoading: false,
  error: null,

  // Actions
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

    set((state) => ({
      shoes: [newShoe, ...state.shoes],
    }));

    return newShoe.id;
  },

  updateShoe: (id, updates) => {
    set((state) => ({
      shoes: state.shoes.map((shoe) =>
        shoe.id === id 
          ? { 
              ...shoe, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : shoe
      ),
    }));
  },

  deleteShoe: (id) => {
    // First, remove shoeId from any runs that reference it
    const { runs, updateRun } = get();
    runs
      .filter((run) => run.shoeId === id)
      .forEach((run) => {
        updateRun(run.id, { shoeId: null });
      });

    // Then delete the shoe
    set((state) => ({
      shoes: state.shoes.filter((shoe) => shoe.id !== id),
    }));
  },

  toggleShoeActive: (id) => {
    set((state) => ({
      shoes: state.shoes.map((shoe) =>
        shoe.id === id 
          ? { 
              ...shoe, 
              isActive: !shoe.isActive,
              updatedAt: new Date().toISOString() 
            } 
          : shoe
      ),
    }));
  },

  // Selectors
  getShoeById: (id) => {
    return get().shoes.find((shoe) => shoe.id === id);
  },

  getActiveShoes: () => {
    return get().shoes.filter((shoe) => shoe.isActive);
  },

  getInactiveShoes: () => {
    return get().shoes.filter((shoe) => !shoe.isActive);
  },

  // Statistics
  getShoeStats: (shoeId) => {
    const { runs } = get();
    const shoeRuns = runs.filter((run) => run.shoeId === shoeId);
    
    const totalDistance = shoeRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
    const totalRuns = shoeRuns.length;
    const lastUsed = shoeRuns.length > 0
      ? new Date(Math.max(...shoeRuns.map(r => new Date(r.startTime).getTime())))
      : null;

    return {
      totalDistance,
      totalRuns,
      lastUsed,
      runs: shoeRuns,
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

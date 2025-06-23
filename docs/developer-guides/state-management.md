# State Management with Zustand

Stride Keeper uses Zustand for state management, providing a simple and scalable solution for managing application state with minimal boilerplate.

## Core Concepts

### Store Organization

Stride Keeper's state is organized into three main stores, each with a specific responsibility:

1. **Run Store** (`runStore.js`)
   - Tracks current run state
   - Manages run history and statistics
   - Handles run CRUD operations

2. **Shoe Store** (`shoeStore.js`)
   - Manages shoe inventory
   - Tracks shoe usage and mileage
   - Handles shoe rotation logic

3. **Settings Store** (`settingsStore.js`)
   - Manages user preferences
   - Handles unit conversions
   - Manages app configuration

### Store Structure

Each store follows this pattern with persistence:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,

      // Actions
      addItem: (item) => set({ 
        items: [...get().items, { ...item, id: Date.now() }] 
      }),
      
      updateItem: (id, updates) => set({
        items: get().items.map(item => 
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        )
      }),
      
      // ... other actions
    }),
    {
      name: 'store-name-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        items: state.items,
        // Only persist specific state properties
      })
    }
  )
);

export default useStore;

## Using Stores in Components

### Basic Usage

```javascript
import { useStore } from '../stores';

function MyComponent() {
  const runs = useStore(state => state.runs);
  const addRun = useStore(state => state.addRun);
  
  // ...
}
```

### Selectors

For better performance, use selectors to subscribe to specific state changes:

```javascript
import { useStore } from '../stores';

function RunList() {
  // Only re-renders when runs.length changes
  const runCount = useStore(state => state.runs.length);
  
  // ...
}
```

### Pre-defined Selectors

Stride Keeper provides pre-defined selectors for common use cases:

```javascript
import { useRunStats, useShoeStats } from '../stores';

function StatsView() {
  const { totalDistance } = useRunStats('week');
  const shoeStats = useShoeStats('shoe-123');
  
  // ...
}
```

## Persistence

State is automatically persisted using AsyncStorage:

```javascript
create(
  persist(
    (set, get) => ({
      // ... store definition
    }),
    {
      name: 'stride-keeper-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        runs: state.runs,
        shoes: state.shoes,
        settings: state.settings,
      }),
    }
  )
);
```

## Best Practices

1. **Keep Stores Focused**
   - Each store should manage a specific domain
   - Avoid duplicating state between stores

2. **Use Selectors**
   - Prefer selectors over full store access
   - Memoize complex selectors if needed

3. **Immutable Updates**
   - Always return new state objects
   - Use the spread operator or Immer for complex updates

4. **Async Actions**
   - Use the `set` function for async operations
   - Handle loading and error states

## Example: Adding a New Feature

1. **Add State**
   ```javascript
   // In the appropriate store
   const useStore = create((set) => ({
     // ... existing state
     newFeature: { data: [], loading: false, error: null },
     setNewFeature: (updates) => set({ newFeature: { ...get().newFeature, ...updates } }),
   }));
   ```

2. **Add Actions**
   ```javascript
   const useStore = create((set, get) => ({
     // ... existing state
     fetchNewFeature: async () => {
       set({ newFeature: { ...get().newFeature, loading: true } });
       try {
         const data = await api.fetchNewFeature();
         set({ newFeature: { data, loading: false, error: null } });
       } catch (error) {
         set({ newFeature: { ...get().newFeature, loading: false, error } });
       }
     },
   }));
   ```

3. **Use in Components**
   ```javascript
   function NewFeature() {
     const { data, loading, error } = useStore(state => state.newFeature);
     const fetchNewFeature = useStore(state => state.fetchNewFeature);
     
     useEffect(() => {
       fetchNewFeature();
     }, []);
     
     // ...
   }
   ```

## Troubleshooting

- **State Not Updating**: Ensure you're using the `set` function correctly
- **Performance Issues**: Check for unnecessary re-renders with selectors
- **Persistence Issues**: Verify AsyncStorage permissions and storage limits

---
*Next: [API Reference →](./api-reference.md)*

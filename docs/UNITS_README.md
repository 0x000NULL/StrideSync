# Unit Handling in Stride Keeper

This document explains how unit handling works in the Stride Keeper app.

## Available Units

### Distance Units
- `km` (kilometers)
- `mi` (miles)

### Temperature Units
- `celsius` (°C)
- `fahrenheit` (°F)

## How to Use

### 1. The `useUnits` Hook

Import and use the `useUnits` hook in any component that needs to display or work with units:

```javascript
import { useUnits } from '../hooks/useUnits';

function MyComponent() {
  const { 
    distanceUnit,
    temperatureUnit,
    formatDistance,
    formatTemperature,
    toKilometers,
    fromKilometers
  } = useUnits();
  
  // Example usage
  const distance = 5; // in km
  const temp = 20; // in celsius
  
  const formattedDistance = formatDistance(distance);
  const formattedTemp = formatTemperature(temp);
  
  // Convert from user's preferred unit to km (for storage)
  const distanceInKm = toKilometers(userInput, distanceUnit);
  
  // Convert from km to user's preferred unit (for display)
  const displayDistance = fromKilometers(distanceInKm, distanceUnit);
  
  return (
    <View>
      <Text>Distance: {formattedDistance.formatted}</Text>
      <Text>Temperature: {formattedTemp.formatted}</Text>
    </View>
  );
}
```

### 2. Utility Functions

You can also directly import and use the utility functions:

```javascript
import { 
  formatDistance, 
  formatTemperature, 
  toKilometers, 
  fromKilometers 
} from '../utils/unitUtils';

// Format a distance
const distance = formatDistance(10, 'mi'); // { value: 6.2, unit: 'mi', formatted: '6.2 mi' }

// Format a temperature
const temp = formatTemperature(25, 'fahrenheit'); // { value: 77, unit: '°F', formatted: '77°F' }

// Convert to kilometers
const km = toKilometers(10, 'mi'); // 16.0934

// Convert from kilometers
const miles = fromKilometers(10, 'mi'); // 6.21371
```

## Best Practices

1. **Always store values in base units**:
   - Distance: kilometers (km)
   - Temperature: Celsius (°C)

2. **Convert to user's preferred units only for display**

3. **Use the `useUnits` hook** in components to get the user's preferences

4. **Update the settings store** when the user changes their preferences

5. **Test** with both metric and imperial units to ensure consistent display

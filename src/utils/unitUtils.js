// Conversion factors
const KM_TO_MI = 0.621371;
const MI_TO_KM = 1.60934;

// Format distance based on user preference
export const formatDistance = (distanceInKm, unitPreference) => {
  if (unitPreference === 'mi') {
    const miles = distanceInKm * KM_TO_MI;
    return {
      value: miles,
      unit: 'mi',
      formatted: `${miles.toFixed(2)} mi`,
    };
  }
  return {
    value: distanceInKm,
    unit: 'km',
    formatted: `${distanceInKm.toFixed(2)} km`,
  };
};

// Format temperature based on user preference
export const formatTemperature = (tempInCelsius, unitPreference) => {
  if (unitPreference === 'fahrenheit') {
    const fahrenheit = (tempInCelsius * 9) / 5 + 32;
    return {
      value: fahrenheit,
      unit: '°F',
      formatted: `${Math.round(fahrenheit)}°F`,
    };
  }
  return {
    value: tempInCelsius,
    unit: '°C',
    formatted: `${Math.round(tempInCelsius)}°C`,
  };
};

// Convert distance from user's preferred unit back to km (for storage)
export const toKilometers = (value, fromUnit) => {
  return fromUnit === 'mi' ? value * MI_TO_KM : value;
};

// Convert distance from km to user's preferred unit
export const fromKilometers = (kmValue, toUnit) => {
  return toUnit === 'mi' ? kmValue * KM_TO_MI : kmValue;
};

/**
 * Calculates the Haversine distance between two points on the Earth.
 * @param {{latitude: number, longitude: number}} point1 - The first coordinate.
 * @param {{latitude: number, longitude: number}} point2 - The second coordinate.
 * @returns {number} The distance in meters.
 */
export const haversineDistance = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180; // φ, λ in radians
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

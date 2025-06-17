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
      formatted: `${miles.toFixed(1)} mi`
    };
  }
  return {
    value: distanceInKm,
    unit: 'km',
    formatted: `${distanceInKm.toFixed(1)} km`
  };
};

// Format temperature based on user preference
export const formatTemperature = (tempInCelsius, unitPreference) => {
  if (unitPreference === 'fahrenheit') {
    const fahrenheit = (tempInCelsius * 9/5) + 32;
    return {
      value: fahrenheit,
      unit: '°F',
      formatted: `${Math.round(fahrenheit)}°F`
    };
  }
  return {
    value: tempInCelsius,
    unit: '°C',
    formatted: `${Math.round(tempInCelsius)}°C`
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

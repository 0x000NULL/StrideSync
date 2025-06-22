import { useStoreContext } from '../providers/StoreProvider';
import {
  formatDistance,
  formatTemperature,
  fromKilometers,
  toKilometers,
} from '../utils/unitUtils';

export const useUnits = () => {
  const store = useStoreContext();

  if (!store) {
    return {
      distanceUnit: 'km',
      temperatureUnit: 'celsius',
      formatDistance: km => formatDistance(km, 'km'),
      formatTemperature: celsius => formatTemperature(celsius, 'celsius'),
      toKilometers: (value, fromUnit) => toKilometers(value, fromUnit),
      fromKilometers: (kmValue, toUnit) => fromKilometers(kmValue, toUnit),
    };
  }

  const { settings } = store;
  const { distanceUnit = 'km', temperatureUnit = 'celsius' } = settings || {};

  return {
    distanceUnit,
    temperatureUnit,
    formatDistance: km => formatDistance(km, distanceUnit),
    formatTemperature: celsius => formatTemperature(celsius, temperatureUnit),
    toKilometers: (value, fromUnit = distanceUnit) => toKilometers(value, fromUnit),
    fromKilometers: (kmValue, toUnit = distanceUnit) => fromKilometers(kmValue, toUnit),
  };
};

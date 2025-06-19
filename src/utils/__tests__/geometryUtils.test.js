import { calculateDistance } from '../geometryUtils';

describe('calculateDistance', () => {
  it('should return 0 for the same coordinates', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it('should calculate distance correctly for known points (approx)', () => {
    // Paris to London (approx 344 km)
    const lat1 = 48.8566; // Paris
    const lon1 = 2.3522;
    const lat2 = 51.5074; // London
    const lon2 = 0.1278;
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(343.5, 1); // Using toBeCloseTo for float comparison

    // New York to Los Angeles (approx 3940 km)
    const lat3 = 40.7128; // New York
    const lon3 = -74.0060;
    const lat4 = 34.0522; // Los Angeles
    const lon4 = -118.2437;
    const distance2 = calculateDistance(lat3, lon3, lat4, lon4);
    expect(distance2).toBeCloseTo(3940, 0);
  });

  it('should handle negative coordinates correctly', () => {
    const lat1 = -33.8688; // Sydney
    const lon1 = 151.2093;
    const lat2 = -34.6037; // Buenos Aires
    const lon2 = -58.3816;
    // Approx 11800 km, this is a very rough check due to antipodal nature
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(11345, 0); // More accurate value for this pair
  });

  it('should be commutative (distance A to B is same as B to A)', () => {
    const lat1 = 48.8566;
    const lon1 = 2.3522;
    const lat2 = 51.5074;
    const lon2 = 0.1278;
    const distance1 = calculateDistance(lat1, lon1, lat2, lon2);
    const distance2 = calculateDistance(lat2, lon2, lat1, lon1);
    expect(distance1).toBe(distance2);
  });
});

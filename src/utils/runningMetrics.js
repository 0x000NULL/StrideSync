/**
 * @fileoverview Advanced running performance calculations
 * Includes VO2 max estimation, VDOT, training load, and other running metrics
 */

/**
 * Calculate estimated VO2 max using Daniels' formula
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} timeSeconds - Time in seconds
 * @returns {number} Estimated VO2 max in ml/kg/min
 */
export const calculateVO2Max = (distanceKm, timeSeconds) => {
  if (!distanceKm || !timeSeconds || distanceKm <= 0 || timeSeconds <= 0) {
    return null;
  }

  // Daniels' formula for VO2 max estimation
  // VO2 = -4.6 + 0.182258 * (m/min) + 0.000104 * (m/min)²
  const metersPerMinute = (distanceKm * 1000) / (timeSeconds / 60);
  const vo2Max = -4.6 + 0.182258 * metersPerMinute + 0.000104 * Math.pow(metersPerMinute, 2);

  return Math.max(vo2Max, 0);
};

/**
 * Calculate VDOT (V̇O2 max adjusted for running economy)
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} timeSeconds - Time in seconds
 * @returns {number} VDOT value
 */
export const calculateVDOT = (distanceKm, timeSeconds) => {
  if (!distanceKm || !timeSeconds || distanceKm <= 0 || timeSeconds <= 0) {
    return null;
  }

  // Jack Daniels' VDOT formula
  const velocity = distanceKm / (timeSeconds / 3600); // km/h
  const velocityMs = velocity / 3.6; // m/s

  // Oxygen demand calculation
  const oxygenDemand =
    velocityMs <= 4.3
      ? 1.0 + 0.2 * velocityMs + (0.9 * Math.pow(velocityMs, 2)) / 4.3
      : 1.0 + 0.2 * velocityMs + 0.9 * velocityMs - 0.9 * 4.3;

  const percentVO2Max = (oxygenDemand / timeSeconds) * 3600;
  const vdot = percentVO2Max * calculateVO2Max(distanceKm, timeSeconds);

  return Math.max(vdot, 0);
};

/**
 * Calculate training load (TRIMP score)
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} avgHeartRate - Average heart rate
 * @param {number} restingHR - Resting heart rate (default 60)
 * @param {number} maxHR - Maximum heart rate (default 190)
 * @param {string} gender - 'male' or 'female' (default 'male')
 * @returns {number} TRIMP score
 */
export const calculateTRIMP = (
  durationMinutes,
  avgHeartRate,
  restingHR = 60,
  maxHR = 190,
  gender = 'male'
) => {
  if (!durationMinutes || !avgHeartRate || durationMinutes <= 0 || avgHeartRate <= 0) {
    return null;
  }

  const hrReserve = (avgHeartRate - restingHR) / (maxHR - restingHR);
  const k = gender === 'female' ? 1.67 : 1.92;

  const trimp = durationMinutes * hrReserve * 0.64 * Math.exp(k * hrReserve);

  return Math.max(trimp, 0);
};

/**
 * Calculate enhanced TRIMP using actual user biometrics
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} avgHeartRate - Average heart rate
 * @param {object} userBiometrics - User's biometric data { restingHR, maxHR, gender, age }
 * @returns {number} Enhanced TRIMP score
 */
export const calculateEnhancedTRIMP = (durationMinutes, avgHeartRate, userBiometrics) => {
  const { restingHR, maxHR, gender, age } = userBiometrics;
  if (!durationMinutes || !avgHeartRate || durationMinutes <= 0 || avgHeartRate <= 0) {
    return null;
  }

  // Use actual max HR or calculate from age
  const actualMaxHR = maxHR || (age ? 220 - age : 190);
  const actualRestingHR = restingHR || 60;
  const userGender = gender || 'male';

  return calculateTRIMP(durationMinutes, avgHeartRate, actualRestingHR, actualMaxHR, userGender);
};

/**
 * Calculate more accurate calories burned using actual body weight and heart rate data
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} avgHeartRate - Average heart rate during activity
 * @param {object} userBiometrics - User's biometric data { weight, age, gender }
 * @returns {number} Calories burned
 */
export const calculateAccurateCalories = (durationMinutes, avgHeartRate, userBiometrics) => {
  const { weight, age, gender } = userBiometrics;
  if (!durationMinutes || !avgHeartRate || !weight || !age || !gender) {
    return null;
  }

  // Mifflin-St Jeor equation for BMR, adapted for calorie burn during exercise
  let calories;
  if (gender === 'female') {
    calories =
      (durationMinutes * (0.074 * age - 0.126 * weight + 0.4472 * avgHeartRate - 20.4022)) / 4.184;
  } else {
    calories =
      (durationMinutes * (0.2017 * age - 0.09036 * weight + 0.6309 * avgHeartRate - 55.0969)) /
      4.184;
  }

  return Math.max(calories, 0);
};

/**
 * Calculate running economy (oxygen cost per unit distance)
 * @param {number} vo2Max - VO2 max value
 * @param {number} paceSecondsPerKm - Pace in seconds per kilometer
 * @returns {number} Running economy in ml/kg/km
 */
export const calculateRunningEconomy = (vo2Max, paceSecondsPerKm) => {
  if (!vo2Max || !paceSecondsPerKm || vo2Max <= 0 || paceSecondsPerKm <= 0) {
    return null;
  }

  // Simplified running economy calculation
  const velocityKmh = 3600 / paceSecondsPerKm;
  const oxygenUptake = (velocityKmh / 3.6) * 3.5; // ml/kg/min approximation

  return (oxygenUptake / velocityKmh) * 60; // ml/kg/km
};

/**
 * Calculate equivalent race times for different distances
 * @param {number} vdot - VDOT value
 * @returns {Object} Equivalent race times for various distances
 */
export const calculateEquivalentTimes = vdot => {
  if (!vdot || vdot <= 0) {
    return null;
  }

  // Simplified equivalent time calculations based on VDOT
  const velocityAt5K = 0.8 * vdot; // Approximation
  const velocityAt10K = 0.76 * vdot;
  const velocityAtHalfMarathon = 0.72 * vdot;
  const velocityAtMarathon = 0.68 * vdot;

  return {
    '5K': (5 / velocityAt5K) * 3600, // seconds
    '10K': (10 / velocityAt10K) * 3600,
    'Half Marathon': (21.1 / velocityAtHalfMarathon) * 3600,
    Marathon: (42.2 / velocityAtMarathon) * 3600,
  };
};

/**
 * Calculate training zones based on heart rate
 * @param {number} maxHR - Maximum heart rate
 * @param {number} restingHR - Resting heart rate (default 60)
 * @returns {Object} Training zones with HR ranges
 */
export const calculateTrainingZones = (maxHR, restingHR = 60) => {
  if (!maxHR || maxHR <= 0) {
    return null;
  }

  const hrReserve = maxHR - restingHR;

  return {
    zone1: {
      name: 'Active Recovery',
      min: Math.round(restingHR + hrReserve * 0.5),
      max: Math.round(restingHR + hrReserve * 0.6),
    },
    zone2: {
      name: 'Aerobic Base',
      min: Math.round(restingHR + hrReserve * 0.6),
      max: Math.round(restingHR + hrReserve * 0.7),
    },
    zone3: {
      name: 'Aerobic Threshold',
      min: Math.round(restingHR + hrReserve * 0.7),
      max: Math.round(restingHR + hrReserve * 0.8),
    },
    zone4: {
      name: 'Lactate Threshold',
      min: Math.round(restingHR + hrReserve * 0.8),
      max: Math.round(restingHR + hrReserve * 0.9),
    },
    zone5: {
      name: 'VO2 Max',
      min: Math.round(restingHR + hrReserve * 0.9),
      max: maxHR,
    },
  };
};

/**
 * Calculate stride rate and length estimates
 * @param {number} cadence - Steps per minute
 * @param {number} velocityKmh - Velocity in km/h
 * @returns {Object} Stride metrics
 */
export const calculateStrideMetrics = (cadence, velocityKmh) => {
  if (!cadence || !velocityKmh || cadence <= 0 || velocityKmh <= 0) {
    return null;
  }

  const stepsPerSecond = cadence / 60;
  const velocityMs = velocityKmh / 3.6;
  const strideLength = velocityMs / stepsPerSecond;

  return {
    strideLength: strideLength * 2, // meters (double step = stride)
    strideRate: cadence / 2, // strides per minute
    stepLength: strideLength, // meters
  };
};

/**
 * Calculate power estimate based on pace and body weight
 * @param {number} paceSecondsPerKm - Pace in seconds per kilometer
 * @param {number} bodyWeightKg - Body weight in kg (default 70)
 * @param {number} elevationGainM - Elevation gain in meters (default 0)
 * @returns {number} Estimated power in watts
 */
export const calculateRunningPower = (paceSecondsPerKm, bodyWeightKg = 70, elevationGainM = 0) => {
  if (!paceSecondsPerKm || paceSecondsPerKm <= 0) {
    return null;
  }

  const velocityMs = 1000 / paceSecondsPerKm; // m/s
  const bodyWeight = bodyWeightKg > 0 ? bodyWeightKg : 70;

  // Base metabolic power (simplified)
  const basePower = 1.29 * bodyWeight * velocityMs;

  // Elevation adjustment (simplified)
  const elevationPower = elevationGainM > 0 ? bodyWeight * 9.81 * 0.25 : 0;

  return basePower + elevationPower;
};

/**
 * Format time in seconds to human readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = seconds => {
  if (!seconds || seconds <= 0) return '--:--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Analyze time spent in heart rate zones
 * @param {Array} heartRateData - Array of heart rate samples with timestamps
 * @param {Object} hrZones - Heart rate zones object
 * @returns {Object} Time spent in each zone in seconds
 */
export const analyzeHeartRateZones = (heartRateData, hrZones) => {
  if (!heartRateData || !hrZones || heartRateData.length === 0) {
    return null;
  }

  const zoneTime = { zone1: 0, zone2: 0, zone3: 0, zone4: 0, zone5: 0 };

  for (let i = 0; i < heartRateData.length - 1; i++) {
    const sample = heartRateData[i];
    const nextSample = heartRateData[i + 1];
    const duration = (new Date(nextSample.startDate) - new Date(sample.startDate)) / 1000;

    if (duration < 0) continue;

    const hr = sample.value;
    if (hr >= hrZones.zone5.min) zoneTime.zone5 += duration;
    else if (hr >= hrZones.zone4.min) zoneTime.zone4 += duration;
    else if (hr >= hrZones.zone3.min) zoneTime.zone3 += duration;
    else if (hr >= hrZones.zone2.min) zoneTime.zone2 += duration;
    else if (hr >= hrZones.zone1.min) zoneTime.zone1 += duration;
  }

  return zoneTime;
};

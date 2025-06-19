/**
 * @fileoverview JSDoc typedefs for run tracking data models.
 * Based on docs/run-tracking-flow-design.md
 */

/**
 * @typedef {Object} LocationPoint
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {number} [altitude] - In meters
 * @property {number} [speed] - In meters per second
 * @property {number} [accuracy] - GPS accuracy in meters
 * @property {number} [altitudeAccuracy] - Altitude accuracy in meters
 * @property {number} [heading] - Bearing in degrees from true north
 * @property {number} [heartRate] - BPM at this point
 */

/**
 * @typedef {Object} WeatherData
 * @property {number} [temperature] - In Celsius
 * @property {'clear'|'partly-cloudy'|'cloudy'|'rain'|'snow'|'thunderstorm'|'fog'|'windy'} [condition]
 * @property {number} [humidity] - Percentage (0-100)
 * @property {number} [windSpeed] - In m/s
 * @property {number} [windDirection] - Degrees from North (0-360)
 * @property {number} [pressure] - In hPa
 */

/**
 * @typedef {Object} HeartRateZones
 * @property {number} zone1 - Very light intensity
 * @property {number} zone2 - Light intensity
 * @property {number} zone3 - Moderate intensity
 * @property {number} zone4 - Hard intensity
 * @property {number} zone5 - Maximum intensity
 */

/**
 * @typedef {'easy'|'tempo'|'interval'|'long'|'race'|'recovery'} WorkoutType
 * @typedef {1|2|3|4|5} EffortLevel // RPE scale
 * @typedef {'terrible'|'bad'|'neutral'|'good'|'great'} Mood
 * @typedef {'5k'|'10k'|'half-marathon'|'marathon'|'ultra'|'other'} RaceType
 * @typedef {'road'|'track'|'trail'|'treadmill'|'indoor'} SurfaceType
 */

/**
 * @typedef {Object} Run
 * @property {string} id - Unique identifier
 * @property {Date} startTime - When the run started
 * @property {Date} [endTime] - When the run ended
 * @property {number} distance - In meters
 * @property {number} duration - In seconds
 * @property {number} pace - Seconds per kilometer
 * @property {LocationPoint[]} path - Array of location points
 * @property {string} [shoeId] - ID of shoe used
 * @property {string} [notes] - User notes
 * @property {WeatherData} [weather] - Weather conditions
 * @property {WorkoutType} [workoutType]
 * @property {EffortLevel} [effort] - Perceived exertion (RPE)
 * @property {Mood} [mood] - User's mood after run
 * @property {boolean} isPaused - Whether run is currently paused
 * @property {number} pausedDuration - Total time paused in ms
 * @property {number} [elevationGain] - In meters
 * @property {number} [elevationLoss] - In meters
 * @property {number} [avgHeartRate] - In BPM
 * @property {number} [maxHeartRate] - In BPM
 * @property {HeartRateZones} [heartRateZones]
 * @property {number} [cadence] - Steps per minute
 * @property {number} [strideLength] - In meters
 * @property {number} [trainingLoad] - TRIMP score
 * @property {string[]} [tags] - Custom tags
 * @property {boolean} [isRace] - Whether this was a race
 * @property {RaceType} [raceType]
 * @property {number} [raceTime] - In seconds
 * @property {boolean} [isIndoor] - Treadmill/indoor run
 * @property {number} [treadmillIncline] - Percentage (0-100)
 * @property {SurfaceType} [surfaceType]
 * @property {number} [perceivedEffort] - 1-10 scale
 * @property {number} [temperatureFeelsLike] - In Celsius
 * @property {number} [hydrationVolume] - In ml
 * @property {number} [caloriesBurned]
 * @property {string} [trainingPlanId] - Reference to training plan
 * @property {string} [workoutId] - Reference to workout in plan
 * @property {boolean} [isFavorite]
 * @property {number} [shoeMileageAtStart] - In meters
 * @property {number} [shoeMileageAtEnd] - In meters
 */

// This file is for JSDoc type definitions only.
// It doesn't export any runtime code.
// To use these types in other JSDoc comments, you might need to reference them
// using import() type syntax if your JSDoc parser supports it, or ensure this file
// is included in your JSDoc generation process.
// For example: /** @type {import('./models/runData').Run} */
// Or simply rely on global JSDoc type resolution if your tooling supports it.
// For VSCode/TypeScript JSDoc checking, these types will be available globally once the file is part of the project.

const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add a date for the run'],
      default: Date.now,
    },
    distance: {
      type: Number,
      required: [true, 'Please add a distance'],
      min: [0, 'Distance must be a positive number'],
    },
    duration: {
      type: Number, // in seconds
      required: [true, 'Please add a duration in seconds'],
      min: [0, 'Duration must be a positive number'],
    },
    type: {
      type: String,
      enum: ['easy', 'tempo', 'interval', 'long', 'race', 'recovery', 'other'],
      default: 'easy',
    },
    surface: {
      type: String,
      enum: ['road', 'trail', 'track', 'treadmill', 'other'],
      default: 'road',
    },
    elevation: {
      type: Number,
      default: 0,
    },
    avgHr: {
      type: Number,
      min: [0, 'Heart rate must be a positive number'],
    },
    maxHr: {
      type: Number,
      min: [0, 'Heart rate must be a positive number'],
    },
    cadence: {
      type: Number,
      min: [0, 'Cadence must be a positive number'],
    },
    strideLength: {
      type: Number,
      min: [0, 'Stride length must be a positive number'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories must be a positive number'],
    },
    rpe: {
      type: Number,
      min: [1, 'RPE must be between 1 and 10'],
      max: [10, 'RPE must be between 1 and 10'],
    },
    mood: {
      type: String,
      enum: ['terrible', 'bad', 'neutral', 'good', 'great', null],
    },
    weather: {
      temp: Number,
      humidity: Number,
      wind: Number,
      condition: String,
    },
    shoe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shoe',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    isRace: {
      type: Boolean,
      default: false,
    },
    raceName: String,
    raceDistance: Number,
    raceTime: Number, // in seconds
    isTemplate: {
      type: Boolean,
      default: false,
    },
    gpxFile: String, // Path to GPX file if uploaded
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate pace (in seconds per km)
runSchema.virtual('pace').get(function () {
  if (!this.distance || !this.duration) return null;
  return this.duration / (this.distance / 1000); // Convert meters to km
});

// Index for faster querying
runSchema.index({ user: 1, date: -1 });
runSchema.index({ user: 1, type: 1 });
runSchema.index({ user: 1, shoe: 1 });

// Calculate distance in miles
runSchema.virtual('distanceMiles').get(function () {
  if (!this.distance) return null;
  return this.distance * 0.000621371; // Convert meters to miles
});

// Calculate duration in hours:minutes:seconds format
runSchema.virtual('durationFormatted').get(function () {
  if (!this.duration) return null;
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  let result = '';
  if (hours > 0) {
    result += `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    result += `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return result;
});

// Calculate average pace per km in minutes:seconds format
runSchema.virtual('paceFormatted').get(function () {
  if (!this.pace) return null;
  const minutes = Math.floor(this.pace / 60);
  const seconds = Math.floor(this.pace % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
});

// Calculate average speed in km/h
runSchema.virtual('speed').get(function () {
  if (!this.distance || !this.duration || this.duration === 0) return 0;
  return (this.distance / 1000) / (this.duration / 3600); // km/h
});

module.exports = mongoose.model('Run', runSchema);

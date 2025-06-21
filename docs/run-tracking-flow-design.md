# Run Tracking Flow - Technical Design

## 1. Overview
This document outlines the technical design for the run tracking flow in StrideSync, covering the complete user journey from pre-run preparation to saving a completed run.

## 2. Architecture

### 2.1 Component Hierarchy
```
RunFlowNavigator (Stack Navigator)
├── PreRunScreen
├── ActiveRunScreen
├── PauseScreen
├── RunSummaryScreen
└── SaveRunScreen
```

### 2.2 State Management

#### 2.2.1 Store Structure
```javascript
/**
 * @typedef {'idle'|'preRun'|'active'|'paused'|'saving'|'complete'} RunStatus
 * @typedef {'metric'|'imperial'} UnitPreference
 * @typedef {'light'|'dark'|'system'} ThemePreference
 * @typedef {Object} AudioCues
 * @property {boolean} enabled
 * @property {number} distanceInterval - in meters
 * @property {number} timeInterval - in minutes
 * 
 * @typedef {Object} RunState
 * @property {RunStatus} runStatus
 * @property {Object|null} currentRun
 * @property {Array} runs
 * @property {string|null} selectedRunId
 * @property {boolean} isSaving
 * @property {Error|null} lastError
 * @property {Function} startNewRun - (params: Object) => void
 * @property {Function} pauseRun - () => void
 * @property {Function} resumeRun - () => void
 * @property {Function} stopRun - () => void
 * @property {Function} saveRun - (run: Object) => void
 * @property {Function} discardRun - () => void
 * @property {Function} deleteRun - (runId: string) => void
 * @property {Function} updateRun - (runId: string, updates: Object) => void
 * @property {boolean} isTracking
 * @property {boolean} backgroundTaskRegistered
 * @property {boolean} locationUpdatesEnabled
 * @property {UnitPreference} unitPreference
 * @property {ThemePreference} theme
 * @property {AudioCues} audioCues
 * @property {Function} setError - (error: Error|null) => void
 * @property {Function} clearError - () => void
 */

#### 2.2.2 State Persistence
- **Zustand `persist` middleware** is used for all offline storage.
  - The entire app state (runs, shoes, settings) is persisted to **AsyncStorage**.
  - The middleware handles data serialization and hydration automatically.
  - Versioning is managed within the middleware configuration to handle state migrations.

#### 2.2.3 Background Tasks
- **expo-task-manager** for continuous tracking
  - Register background location task
  - Handle app state changes (active/background/quit)
  - Implement battery-efficient location updates
  - Manage task lifecycle (start/pause/stop)

#### 2.2.4 State Validation
- JSON Schema validation for all stored data
- Runtime type checking with TypeScript
- Data migration utilities for app updates
- Input validation for all user-provided data

## 3. Data Models

### 3.1 Run Interface
```javascript
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
 *
 * @typedef {Object} WeatherData
 * @property {number} [temperature] - In Celsius
 * @property {'clear'|'partly-cloudy'|'cloudy'|'rain'|'snow'|'thunderstorm'|'fog'|'windy'} [condition]
 * @property {number} [humidity] - Percentage (0-100)
 * @property {number} [windSpeed] - In m/s
 * @property {number} [windDirection] - Degrees from North (0-360)
 * @property {number} [pressure] - In hPa
 *
 * @typedef {Object} HeartRateZones
 * @property {number} zone1 - Very light intensity
 * @property {number} zone2 - Light intensity
 * @property {number} zone3 - Moderate intensity
 * @property {number} zone4 - Hard intensity
 * @property {number} zone5 - Maximum intensity
 *
 * @typedef {'easy'|'tempo'|'interval'|'long'|'race'|'recovery'} WorkoutType
 * @typedef {1|2|3|4|5} EffortLevel // RPE scale
 * @typedef {'terrible'|'bad'|'neutral'|'good'|'great'} Mood
 * @typedef {'5k'|'10k'|'half-marathon'|'marathon'|'ultra'|'other'} RaceType
 * @typedef {'road'|'track'|'trail'|'treadmill'|'indoor'} SurfaceType
 *
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
```

## 4. Screen Specifications

### 4.1 Pre-run Screen
**Purpose**: Configure run settings before starting.

**UI Components**:
- `ShoeSelector`: A modal-based component to select an active shoe from the user's collection.
- `RunTypeSelector`: A button group to toggle between 'Outdoor' and 'Indoor' runs.
- `GoalInput`: Allows setting a goal for the run (open-ended, distance-based, or time-based).
- `AudioCuesToggle`: A switch to enable or disable audio feedback during the run.
- `GPSStatusIndicator`: Displays the real-time status of the GPS signal ('Searching', 'Good', 'Poor') when in 'Outdoor' mode. This component is hidden for 'Indoor' runs.

**State Management (via Zustand hooks)**:
- `selectedShoeId`: Stored via `useState`, holds the ID of the chosen shoe.
- `runType`: `useState` hook to manage 'outdoor' vs. 'indoor'.
- `goal`: `useState` hook for the goal object `{ type, value }`.
- `audioCuesEnabled`: `useState` boolean for the audio cues switch.
- `gpsStatus`: `useState` to hold the current GPS status string.

**Core Logic**:
- On mount, if `runType` is 'outdoor', the screen requests foreground location permissions using `expo-location`.
- It uses `Location.watchPositionAsync` to monitor the GPS signal and updates the `gpsStatus` state in real-time. The location subscription is managed in a `useEffect` hook to ensure it's properly started and stopped based on the `runType`.
- The "Start Run" button is disabled for outdoor runs until a 'good' GPS signal is acquired.
- On "Start Run" press, it calls the `beginRunTracking` action from the `runStore` with the configured settings and navigates the user to the `ActiveRunScreen`.

### 4.2 Active Run Screen
**Purpose**: Real-time run tracking

**Components**:
- MapView (react-native-maps)
- StatsDisplay (current pace, distance, time, heart rate)
- ControlButtons (pause, lap, stop)
- BatteryOptimizationIndicator

**State**:
- currentRun: Run
- currentLocation: LocationObject | null
- isTracking: boolean
- currentSplit: number
- splits: Array<{ distance: number, time: number }>

### 4.3 Pause Screen
**Purpose**: Temporary run interruption

**Components**:
- RunStatsSummary
- ActionButtons (resume, save, discard)
- NoteInput

### 4.4 Run Summary
**Purpose**: Post-run statistics

**Components**:
- MapWithRoute
- StatsGrid
- PaceChart
- ElevationProfile
- PersonalRecords

### 4.5 Save Run
**Purpose**: Finalize and save run

**Components**:
- RunDetailsForm
- ShoeSelector
- WeatherSelector
- EffortMoodSelector
- ExportOptions

## 5. Location Tracking

### 5.1 Accuracy Requirements
- Desired accuracy: BestForNavigation
- Distance filter: 5 meters
- Time interval: 1 second

### 5.2 Background Tracking
- Uses expo-location's startLocationUpdatesAsync
- Background task registered with expo-task-manager
- Minimal battery impact implementation

## 6. Performance Considerations

### 6.1 Battery Optimization

#### 6.1.1 Location Tracking
- Implement adaptive location update intervals based on:
  - Current speed (faster movement = more frequent updates)
  - Battery level (lower battery = less frequent updates)
  - GPS signal strength (poor signal = less frequent updates)
- Use `distanceFilter` and `timeInterval` parameters in `expo-location`
- Implement significant location changes when app is in background

#### 6.1.2 UI Rendering
- Use `React.memo` for pure components
- Implement windowing for long lists (e.g., run history)
- Optimize map rendering with:
  - `react-native-maps` optimizations
  - Clustering for run markers
  - Simplified polylines for overview

#### 6.1.3 State Management
- Batch state updates using `unstable_batchedUpdates`
- Use selectors to prevent unnecessary re-renders
- Implement state freezing in development

### 6.2 Memory Management

#### 6.2.1 Location Data
- Implement location point decimation:
  - Douglas-Peucker algorithm for path simplification
  - Configurable accuracy thresholds
  - Max points per run setting
- Use typed arrays for coordinate storage
- Implement run data compression for storage

#### 6.2.2 Run History
- Virtualized list implementation
- Paginated data loading
- Lazy loading of run details
- Automatic cleanup of temporary data

#### 6.2.3 Image and Assets
- Optimize image assets with appropriate formats
- Implement image caching
- Lazy load non-critical images
- Use vector images where possible

### 6.3 Background Processing

#### 6.3.1 Location Tracking
- Minimize background location accuracy
- Implement adaptive tracking intervals
- Use significant location change API when appropriate
- Handle background/foreground transitions efficiently

#### 6.3.2 Data Processing
- Offload heavy computations to Web Workers
- Implement incremental processing
- Use native modules for performance-critical operations

### 6.4 Startup Performance

#### 6.4.1 App Launch
- Lazy load non-essential modules
- Implement code splitting
- Optimize initial data loading

#### 6.4.2 First Contentful Paint
- Implement skeleton screens
- Optimize critical rendering path
- Preload essential resources

### 6.5 Monitoring and Profiling

#### 6.5.1 Performance Monitoring
- Implement React DevTools profiler integration
- Track key performance metrics
- Monitor memory usage

#### 6.5.2 Analytics
- Track performance metrics in production
- Monitor battery impact
- Collect user experience metrics

## 7. Error Handling

### 7.1 Error Categories

#### 7.1.1 Location Errors
- **Permission Issues**
  - Location permission denied
  - Background location permission not granted
  - Permission rationale required
  
- **GPS/Network Issues**
  - Poor GPS signal
  - No GPS signal
  - Location timeout
  - High accuracy unavailable

- **Hardware Issues**
  - GPS disabled in device settings
  - Airplane mode enabled
  - Battery saver mode restrictions

#### 7.1.2 State Management Errors
- Data corruption
- Version mismatches
- Storage quota exceeded
- Concurrent modification conflicts

#### 7.1.3 Network Errors (for weather/geocoding)
- Offline mode
- Server errors
- Rate limiting
- Invalid API responses

### 7.2 Error Recovery Strategies

#### 7.2.1 Location Error Recovery
- **Degraded Mode**: Continue with lower accuracy
- **Retry Logic**: Exponential backoff for transient errors
- **User Guidance**: Clear instructions to resolve issues
- **Fallback Mechanisms**: Use last known location when appropriate

#### 7.2.2 State Recovery
- **Auto-save**: Every 30 seconds during active runs
- **Crash Recovery**: Attempt to recover unsaved runs on restart
- **Conflict Resolution**: Last-write-wins with version vectors
- **Data Validation**: Schema validation on load/save

#### 7.2.3 Data Integrity
- Checksums for stored data
- Automatic backup before major operations
- Data repair utilities
- Migration paths for schema changes

### 7.3 User Communication

#### 7.3.1 Error Messages
- Clear, actionable error messages
- Technical details in debug mode
- Localized strings for all user-facing messages

#### 7.3.2 Error Boundaries
- Component-level error boundaries
- Fallback UIs for critical failures
- Error reporting to developer console

### 7.4 Monitoring and Reporting

#### 7.4.1 Error Tracking
- Log errors with context
- Anonymized error reporting
- Crash analytics

#### 7.4.2 User Feedback
- In-app error reporting
- Screenshot attachments
- System information collection

### 7.5 Testing Error Scenarios

#### 7.5.1 Unit Tests
- Test error conditions
- Validate error messages
- Test recovery flows

#### 7.5.2 Integration Tests
- End-to-end error scenarios
- Permission flow testing
- Offline mode testing

## 8. Testing Strategy

### 8.1 Test Pyramid Implementation

#### 8.1.1 Unit Tests (60%)
- **State Management**
  - Store actions and reducers
  - Selectors and computed values
  - State persistence
  - Error handling

- **Utility Functions**
  - Distance and pace calculations
  - Unit conversions
  - Data validation
  - Date/time manipulation

- **Component Logic**
  - Custom hooks
  - Business logic hooks
  - Form validation
  - Data transformation

#### 8.1.2 Integration Tests (30%)
- **Component Integration**
  - Component interactions
  - Navigation flows
  - Form submissions
  - State updates

- **Feature Testing**
  - Complete run flow
  - Background/foreground transitions
  - Permission flows
  - Data persistence

#### 8.1.3 E2E Tests (10%)
- **Critical User Journeys**
  - New user onboarding
  - Complete run tracking
  - Run history management
  - Shoe tracking

### 8.2 Test Automation

#### 8.2.1 Test Runners
- Jest for unit and integration tests
- Detox for E2E testing
- Maestro for visual regression testing

#### 8.2.2 Test Data Management
- Factory functions for test data
- Mock services and APIs
- Test data cleanup

#### 8.2.3 CI/CD Integration
- GitHub Actions workflow
- Test result reporting
- Code coverage requirements
- Performance benchmarks

### 8.3 Test Coverage Requirements

#### 8.3.1 Code Coverage Targets
- 80%+ statement coverage
- 90%+ branch coverage for critical paths
- 100% test coverage for error boundaries

#### 8.3.2 Critical Paths
- Run tracking state management
- Location data processing
- Data persistence layer
- Permission handling
- Error recovery flows

### 8.4 Testing Tools

#### 8.4.1 Unit Testing
- Jest
- React Testing Library
- @testing-library/react-native
- @testing-library/hooks

#### 8.4.2 E2E Testing
- Detox
- Maestro
- Appium

#### 8.4.3 Performance Testing
- React Native Performance Monitor
- Flipper
- React DevTools Profiler

### 8.5 Test Environment

#### 8.5.1 Test Devices
- iOS Simulator
- Android Emulator
- Physical test devices
- Multiple screen sizes

#### 8.5.2 Test Conditions
- Different network conditions
- Low battery mode
- Background/foreground transitions
- Permission states

### 8.6 Manual Testing

#### 8.6.1 Exploratory Testing
- Ad-hoc testing
- Edge case exploration
- Usability testing

#### 8.6.2 Regression Testing
- Smoke tests
- Sanity checks
- Visual regression testing

### 8.7 Performance Testing

#### 8.7.1 Metrics
- App launch time
- Time to interactive
- Memory usage
- Battery impact

#### 8.7.2 Scenarios
- Long-running sessions
- Large run history
- Low-memory conditions
- Background/foreground switching

## 9. Future Considerations

### 9.1 User Experience Enhancements

#### 9.1.1 Personalization
- Customizable dashboards and widgets
- User-defined metrics and goals
- Adaptive training plans based on performance
- Personalized audio feedback and coaching

#### 9.1.2 Accessibility
- Screen reader optimizations
- High contrast mode
- Adjustable text sizes
- Voice control integration
- Haptic feedback customization

#### 9.1.3 Onboarding & Education
- Interactive tutorials
- Running form analysis
- Training plan recommendations
- Recovery guidance
- Nutrition and hydration tracking

### 9.2 Feature Expansions

#### 9.2.1 Advanced Metrics
- VO2 max estimation
- Training load analysis
- Recovery time prediction
- Race time predictions
- Weather impact analysis

#### 9.2.2 Social & Community
- Friend connections and challenges
- Route sharing and discovery
- Group runs with live tracking
- Achievement badges and milestones
- Social media integration

#### 9.2.3 Wearable Integration
- Apple Watch app
- Garmin/Coros/Wahoo support
- Smart shoe integration
- Heart rate strap support
- Music control from app

### 9.3 Technical Improvements

#### 9.3.1 Offline Capabilities
- Full offline mode
- Background sync when online
- Conflict resolution for offline edits
- Local data encryption

#### 9.3.2 Performance Optimizations
- Lazy loading of run details
- Background data processing
- Optimized map rendering
- Reduced battery consumption

### 9.4 Integration Possibilities

#### 9.4.1 Health Platforms
- Apple Health integration
- Google Fit connection
- Strava synchronization
- TrainingPeaks compatibility

#### 9.4.2 Smart Home & IoT
- Smart thermostat adjustments
- Lighting automation post-run
- Music playlist automation
- Smart scale integration

### 9.5 Monetization & Premium Features

#### 9.5.1 Subscription Tiers
- Free tier with basic features
- Premium analytics and insights
- Advanced training plans
- 1:1 coaching integration

#### 9.5.2 Value-Added Services
- Race registration
- Virtual races
- Personalized coaching
- Equipment recommendations

### 9.6 Analytics & Insights

#### 9.6.1 Data Visualization
- Interactive run analysis
- Trend identification
- Performance benchmarking
- Season overviews

#### 9.6.2 AI/ML Features
- Injury prediction
- Form analysis
- Training plan optimization
- Race strategy suggestions

### 9.7 Platform Expansion

#### 9.7.1 Web Dashboard
- Advanced data analysis
- Route planning
- Community features
- Admin tools

#### 9.7.2 Cross-Platform Support
- Tablet optimization
- Desktop applications
- Smart TV dashboards
- CarPlay/Android Auto integration

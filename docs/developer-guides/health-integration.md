# HealthKit Integration

This document outlines the integration of Apple's HealthKit into the StrideSync application using the `react-native-health` library.

## Overview

The HealthKit integration allows StrideSync to:
- Read heart rate data during an active run to provide real-time metrics.
- Save completed runs as workouts in Apple Health.
- Use biometric data from Health (like weight, age) to calculate more accurate run metrics like calories burned (TRIMP).

## Setup

The integration relies on the `react-native-health` package.

### iOS Project Configuration

To enable HealthKit, the following configurations are required in the Xcode project:

1.  **Enable HealthKit Capability:** In the project's "Signing & Capabilities" tab, the "HealthKit" capability must be added.

2.  **Info.plist Keys:** The `Info.plist` file must include usage descriptions for reading and writing health data. These are displayed to the user when requesting permissions.
    ```xml
    <key>NSHealthShareUsageDescription</key>
    <string>Read and understand health data.</string>
    <key>NSHealthUpdateUsageDescription</key>
    <string>Share workout data with other apps.</string>
    ```

## Implementation

### `healthService.js`

This service (`src/services/healthService.js`) acts as a singleton wrapper around the `react-native-health` library, simplifying its use across the application.

- **`initialize(callback)`:**
  - Initializes the connection to HealthKit.
  - Requests permissions for the data types defined in the `permissions` object within the service.
  - This should be called once when the component that needs health data is mounted.

- **`getHeartRateSamples(options, callback)`:**
  - Fetches heart rate samples within a specified date range.
  - Used in `ActiveRunScreen` to get near real-time heart rate data.

- **`saveWorkout(options, callback)`:**
  - Saves a workout to HealthKit.
  - This includes details like activity type, start/end times, distance, and energy burned.
  - Used in `SaveRunScreen` after a run is completed.

### Usage in Screens

#### `ActiveRunScreen.js`

- **Initialization:**
  - In a `useEffect` hook, `healthService.initialize()` is called to set up HealthKit when the screen mounts.
- **Real-time Heart Rate:**
  - Once initialized and if the run is active, a timer is started that calls `healthService.getHeartRateSamples()` periodically to fetch the latest heart rate data.
  - The fetched heart rate is displayed to the user.

#### `SaveRunScreen.js`

- **Saving Workouts:**
  - After the user saves a run, `handleSaveRun` function is called.
  - This function gathers the final run data (duration, distance, etc.).
  - It also calculates enhanced metrics like `accurateCalories` if heart rate data is available.
  - It then calls `healthService.saveWorkout()` to write the run to Apple Health as a workout session.

## Permissions

The `react-native-health` library handles the permission prompts. The permissions are defined in `healthService.js`. Our app requests permission to read and write various data types, including workouts and heart rate.

It's crucial that the `Info.plist` descriptions are clear to the user, as they explain why the app is requesting access to their sensitive health data. 
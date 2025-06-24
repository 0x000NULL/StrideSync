export const createSettingsStore = (set, get) => ({
  // Default settings
  settings: {
    // Units
    distanceUnit: 'km', // 'km' or 'mi'
    weightUnit: 'kg', // 'kg' or 'lbs'
    temperatureUnit: 'celsius', // 'celsius' or 'fahrenheit'

    // Biometrics (can be manually entered or synced from HealthKit)
    gender: null, // 'male', 'female', 'other'
    height: null, // in cm
    weight: null, // in kg, matches weightUnit
    birthDate: null, // ISO 8601 string (e.g., 'YYYY-MM-DD')
    age: null, // calculated from birthDate

    // Run tracking
    autoPause: false,
    voiceFeedback: true,
    voiceFeedbackInterval: 5, // minutes
    minPaceAlert: null, // min/km or min/mi
    maxPaceAlert: null, // min/km or min/mi

    // Notifications
    notifyRunReminder: true,
    runReminderTime: '19:00', // 7:00 PM
    notifyShoeReplacement: true,
    shoeReplacementThreshold: 90, // percentage

    // Appearance
    theme: 'system', // 'light', 'dark', 'system'
    showPaceChart: true,
    showElevationChart: true,
    mapType: 'standard', // 'standard', 'satellite', 'hybrid', 'terrain'

    // Data & Privacy
    allowAnalytics: true,
    allowCrashReports: true,
    autoBackup: true,
    lastBackup: null,

    // Advanced
    useHighAccuracyGPS: false,
    batterySaverMode: false,

    // Internal
    lastUpdated: new Date().toISOString(),
    appVersion: '1.0.0',
  },

  // Actions
  updateSettings: updates => {
    set(state => ({
      settings: {
        ...state.settings,
        ...updates,
        lastUpdated: new Date().toISOString(),
      },
    }));

    // Apply any side effects
    if (updates.birthDate) {
      const birthDate = new Date(updates.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      set(state => ({
        settings: {
          ...state.settings,
          age: age,
        },
      }));
    }

    // Example: If theme changes, you might want to update the app theme here
    if (updates.theme) {
      // Apply theme changes (implementation depends on your theming solution)
      console.log('Theme changed to:', updates.theme);
    }

    // Example: If units change, you might want to convert existing data
    if (updates.distanceUnit || updates.weightUnit) {
      console.log('Units updated, consider converting existing data');
    }
  },

  // Reset to default settings
  resetSettings: () => {
    set(state => ({
      settings: {
        ...createSettingsStore().settings,
        // Preserve some settings that shouldn't be reset
        theme: state.settings.theme,
        distanceUnit: state.settings.distanceUnit,
        weightUnit: state.settings.weightUnit,
        temperatureUnit: state.settings.temperatureUnit,
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  // Import/Export settings
  importSettings: importedSettings => {
    set({
      settings: {
        ...get().settings, // Keep current settings as fallback
        ...importedSettings, // Apply imported settings
        lastUpdated: new Date().toISOString(),
      },
    });
    return true;
  },

  exportSettings: () => {
    return get().settings;
  },

  // Helper methods (getFormattedPace, convertDistance, formatDistance) were found to be unused
  // or redundant with useUnits/unitUtils.js and have been removed to avoid confusion and ensure
  // unit handling consistency as per UNITS_README.md.
});

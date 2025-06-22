export const createSettingsStore = (set, get) => ({
  // Default settings
  settings: {
    // Units
    distanceUnit: 'km', // 'km' or 'mi'
    weightUnit: 'kg', // 'kg' or 'lbs'
    temperatureUnit: 'celsius', // 'celsius' or 'fahrenheit'

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
    const newSettings = { ...get().settings, ...updates };

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

  // Helper methods
  getFormattedPace: paceInSeconds => {
    const { distanceUnit } = get().settings;
    const unitDisplay = distanceUnit === 'km' ? '/km' : '/mi';

    if (!paceInSeconds) return `--:--${unitDisplay}`;

    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}${unitDisplay}`;
  },

  convertDistance: (value, toUnit = null) => {
    const { distanceUnit } = get().settings;
    const targetUnit = toUnit || distanceUnit;

    if (distanceUnit === targetUnit) return value;

    // Convert between km and mi
    if (distanceUnit === 'km' && targetUnit === 'mi') {
      return value * 0.621371; // km to mi
    } else if (distanceUnit === 'mi' && targetUnit === 'km') {
      return value * 1.60934; // mi to km
    }

    return value;
  },

  formatDistance: (value, unit = null) => {
    const { distanceUnit } = get().settings;
    const displayUnit = unit || distanceUnit;
    return `${value.toFixed(2)} ${displayUnit}`;
  },
});

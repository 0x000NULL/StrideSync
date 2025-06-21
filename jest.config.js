module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // Update this pattern to correctly include packages that need transformation
    // Default from jest-expo is usually something like:
    // 'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))'
    // We need to add 'uuid' and potentially others if they are ESM.
    // A common pattern is to allowlist specific packages:
    "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|@expo-google-fonts/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid)"
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!src/navigation/**', // Often harder to test and less critical for unit/component tests
    '!src/theme/**', // Theme files are usually constants or simple functions
    '!**/App.js', // Entry point, tested via component tests of its children
    // Excluding existing test files from coverage calculation
    '!src/screens/AddShoeScreen.test.js',
    '!src/screens/run_tracking/ActiveRunScreen.test.js',
    '!src/screens/run_tracking/PreRunScreen.test.js',
    '!src/stores/run_tracking/runSlice.test.js',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  setupFilesAfterEnv: ['./jest-setup.js'],
};

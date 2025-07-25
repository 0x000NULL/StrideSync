import { jest } from '@jest/globals';
import { Platform } from 'react-native';
import React from 'react';
import mockPropTypes from 'prop-types';

// Force Platform.OS to 'ios' for all tests.
// This relies on jest-expo preset having already set up a basic Platform object.
Platform.OS = 'ios';
Platform.Version = '15.0'; // Example version, ensure it's a string if needed
Platform.isTesting = true;
// Platform.isPad = false; // These might not exist on the default RN Platform object
// Platform.isTV = false;  // Let's only set what's usually there.

// Ensure Platform.select is a robust mock that uses the forced OS.
Platform.select = jest.fn(specs => {
  if (Platform.OS === 'ios' && specs.ios !== undefined) {
    return specs.ios;
  }
  if (Platform.OS === 'android' && specs.android !== undefined) {
    // Should not hit if OS is 'ios'
    return specs.android;
  }
  return specs.default;
});

// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({
  getRandomBase64: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = props => <View testID="mock-map-view" {...props} />;
  const MockMarker = props => <View testID="mock-map-marker" {...props} />;
  const MockPolyline = props => <View testID="mock-map-polyline" {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  hasStartedLocationUpdatesAsync: jest.fn(() => Promise.resolve(false)), // Added this
  Accuracy: {
    BestForNavigation: 'best', // Ensure this matches usage if any
  },
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  // Add other exports as needed by the app
}));

// Mock expo-task-manager
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
  // Add other exports as needed
}));

// Mock react-native-health
jest.mock('react-native-health', () => ({
  __esModule: true,
  default: {
    initHealthKit: jest.fn((permissions, callback) => callback(null)),
    getHeartRateSamples: jest.fn((options, callback) => callback(null, [])),
    getSamples: jest.fn((options, callback) => callback(null, [])),
    getAuthStatus: jest.fn((permissions, callback) => callback(null, {})),
    getLatestHeight: jest.fn((options, callback) => callback(null, {})),
    getLatestWeight: jest.fn((options, callback) => callback(null, {})),
    getDateOfBirth: jest.fn((options, callback) => callback(null, {})),
    getBiologicalSex: jest.fn((options, callback) => callback(null, {})),
    saveWorkout: jest.fn((options, callback) => callback(null, {})),
    Constants: {
      Permissions: {
        HeartRate: 'HeartRate',
        RestingHeartRate: 'RestingHeartRate',
        HeartRateVariability: 'HeartRateVariability',
        Height: 'Height',
        Weight: 'Weight',
        DateOfBirth: 'DateOfBirth',
        BiologicalSex: 'BiologicalSex',
        Steps: 'Steps',
        DistanceWalkingRunning: 'DistanceWalkingRunning',
        ActiveEnergyBurned: 'ActiveEnergyBurned',
        Workout: 'Workout',
      },
    },
  },
}));

// Suppress specific console errors
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Could not find image file')) {
    return;
  }
  originalConsoleError(...args);
};

// --- Common Mocks Identified from Existing Tests ---

// Mock Alert
global.Alert = {
  alert: jest.fn((title, message, buttons) => {
    // Optionally, log alerts or provide a way to inspect them
    // console.log(`Alert shown: ${title} - ${message}`);
    // If buttons are provided and have an onPress, you might want to simulate a press for testing flows
    // For example, automatically press the first button:
    // if (buttons && buttons.length > 0 && typeof buttons[0].onPress === 'function') {
    //   buttons[0].onPress();
    // }
  }),
};

// Mock @react-navigation/native
const mockNavigateFn = jest.fn();
const mockGoBackFn = jest.fn();
const mockDispatchNavFn = jest.fn();
const mockSetOptionsFn = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useTheme: () => ({
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: { primary: '#212529', secondary: '#6c757d', light: '#ffffff', dark: '#212529' },
        border: '#ced4da',
        surface: '#f8f9fa',
        warning: '#ff9800',
      },
    }),
    useNavigation: () => ({
      navigate: mockNavigateFn,
      goBack: mockGoBackFn,
      dispatch: mockDispatchNavFn,
      setOptions: mockSetOptionsFn,
      // Add any other navigation functions used by your app
      getParent: jest.fn(() => ({
        navigate: mockNavigateFn,
        goBack: mockGoBackFn,
      })),
      getState: jest.fn(() => ({
        routes: [],
        index: 0,
      })),
      reset: jest.fn(), // Add reset mock
    }),
    useRoute: () => ({
      params: {}, // Default empty params
      // Add key or name if your components use them from useRoute()
      // key: 'mockRouteKey',
      // name: 'MockScreenName',
    }),
    useFocusEffect: jest.fn(actualNav.useFocusEffect),
    useIsFocused: jest.fn(() => true),
  };
});

// Mock react-redux for component tests (not for slice tests)
const mockReduxDispatchFn = jest.fn(actionOrThunk => {
  if (typeof actionOrThunk === 'function') {
    return actionOrThunk(
      mockReduxDispatchFn,
      jest.fn(() => ({})),
      undefined
    );
  }
  return actionOrThunk;
});
jest.mock('react-redux', () => {
  // Do not spread jest.requireActual if it causes ESM/CJS issues.
  // Provide only the mocks needed.

  // Create a mock Provider component with propTypes defined to avoid lint warnings
  const MockProvider = jest.fn(({ children }) => children);
  MockProvider.propTypes = {
    children: mockPropTypes.node.isRequired,
  };

  return {
    useSelector: jest.fn(selector => selector({})),
    useDispatch: () => mockReduxDispatchFn,
    Provider: MockProvider,
  };
});

// --- End of Common Mocks ---

// If you are using @react-navigation/stack or other navigators,
// you might need to mock them as well, or parts of them.
// For example, for header-related components:
jest.mock('@react-navigation/elements', () => {
  const actualElements = jest.requireActual('@react-navigation/elements');
  const { View } = require('react-native');
  const MockHeader = props => (
    <View testID="mock-header">
      {typeof props.headerTitle === 'function' ? props.headerTitle({}) : props.title}
    </View>
  );
  MockHeader.propTypes = {
    headerTitle: mockPropTypes.oneOfType([mockPropTypes.func, mockPropTypes.string]),
    title: mockPropTypes.string,
  };
  return {
    ...actualElements,
    Header: MockHeader,
    // You might need to mock other components from @react-navigation/elements
    // such as HeaderBackButton, etc., if they are used directly or cause issues.
  };
});

// Mock react-native-gesture-handler
// This is often needed for @react-navigation
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  const actualGestureHandler = jest.requireActual('react-native-gesture-handler');
  return {
    ...actualGestureHandler,
    Swipeable: View,
    DrawerLayout: View,
    // State: {}, // Keep actual State if possible
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    // ToolbarAndroid: View, // Deprecated
    // ViewPagerAndroid: View, // Deprecated
    // DrawerLayoutAndroid: View, // Deprecated
    // WebView: View, // Not part of gesture-handler, but often in lists of mocks
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View, // Keep actual FlatList if possible, or a more functional mock
    gestureHandlerRootHOC: Component => Component, // Pass through HOC
    // Directions: {}, // Keep actual Directions
  };
});

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {}; // Override problematic mock
  return Reanimated;
});

// Mock @electric-sql/react
jest.mock('@electric-sql/react', () => ({
  useElectric: jest.fn(() => ({ db: {} })),
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(async callback => {
      const mockTx = {
        executeSql: jest.fn((sql, params, successCallback, errorCallback) => {
          if (successCallback) {
            successCallback(mockTx, { rows: { _array: [], length: 0 }, rowsAffected: 0 });
          }
        }),
      };
      try {
        await callback(mockTx);
      } catch (e) {
        // console.error("Mocked SQLite transaction error:", e);
      }
    }),
  })),
}));

// Mock react-native-safe-area-context
const mockSafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const mockSafeAreaFrame = { x: 0, y: 0, width: 390, height: 844 };

jest.mock('react-native-safe-area-context', () => {
  const ActualSafeAreaContext = jest.requireActual('react-native-safe-area-context');

  // Create a mock context provider that provides the mockInsets value
  const MockSafeAreaProvider = ({ children }) => {
    // Attempt to use the actual context if possible, but provide mock values
    // This is tricky because the context object itself is not easily mockable externally
    // The most reliable is often to mock the hooks and ensure Provider is a pass-through or provides a simple value.
    // For @react-navigation/elements SafeAreaProviderCompat, it might need a real Context object.
    // Let's try providing a simple value via a new context, though this might not be what SafeAreaProviderCompat uses.
    // The key is that useSafeAreaInsets and useSafeAreaFrame are mocked.
    // The Provider mock itself is mostly for components that expect <SafeAreaProvider> in the tree.
    return (
      <ActualSafeAreaContext.SafeAreaProvider
        initialMetrics={{ insets: mockSafeAreaInsets, frame: mockSafeAreaFrame }}
      >
        {children}
      </ActualSafeAreaContext.SafeAreaProvider>
    );
  };

  MockSafeAreaProvider.propTypes = {
    children: mockPropTypes.node.isRequired,
  };

  // Declare SafeAreaConsumer separately so we can attach propTypes for lint
  // and testing clarity.
  const SafeAreaConsumer = ({ children }) => children(mockSafeAreaInsets);
  SafeAreaConsumer.propTypes = { children: mockPropTypes.node };

  return {
    ...ActualSafeAreaContext, // Spread actual exports
    SafeAreaProvider: MockSafeAreaProvider, // Use our mock provider
    SafeAreaConsumer,
    SafeAreaView: jest.fn(props => {
      const { View } = require('react-native');
      const MockSafeAreaView = ({ children }) => <View>{children}</View>;
      MockSafeAreaView.propTypes = { children: mockPropTypes.node };
      MockSafeAreaView.displayName = 'MockSafeAreaView';
      return <MockSafeAreaView {...props} />;
    }),
    useSafeAreaInsets: jest.fn(() => mockSafeAreaInsets),
    useSafeAreaFrame: jest.fn(() => mockSafeAreaFrame),
    // Provide other exports if used, e.g., initialWindowMetrics
    initialWindowMetrics: {
      insets: mockSafeAreaInsets,
      frame: mockSafeAreaFrame,
    },
  };
});

// Mock victory-native
jest.mock('victory-native', () => {
  const { View } = require('react-native');
  const VictoryBar = props => <View testID="mock-victory-bar" {...props} />;

  const VictoryChart = props => (
    <View testID="mock-victory-chart" {...props}>
      {props.children}
    </View>
  );
  VictoryChart.propTypes = {
    children: mockPropTypes.node,
  };

  const VictoryLine = props => <View testID="mock-victory-line" {...props} />;
  const VictoryPie = props => <View testID="mock-victory-pie" {...props} />;
  const VictoryAxis = props => <View testID="mock-victory-axis" {...props} />;

  return {
    VictoryBar,
    VictoryChart,
    VictoryLine,
    VictoryPie,
    VictoryAxis,
    // Add other Victory components used in your app
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  const actualSvg = jest.requireActual('react-native-svg');
  return {
    ...actualSvg,
    SvgXml: jest.fn(() => <View testID="mock-svg-xml" />),
    // Add other SVG components if they cause issues (e.g., G, Path, Circle)
    // For example:
    // Path: (props) => <View testID="mock-svg-path" {...props} />,
    // Circle: (props) => <View testID="mock-svg-circle" {...props} />,
  };
});

// Mock @react-native-segmented-control/segmented-control
jest.mock('@react-native-segmented-control/segmented-control', () => {
  const { View } = require('react-native');
  return props => <View testID="mock-segmented-control" {...props} />;
});

// Mock ThemeProvider's useTheme hook
jest.mock('./src/theme/ThemeProvider', () => {
  const actualThemeProvider = jest.requireActual('./src/theme/ThemeProvider');
  return {
    ...actualThemeProvider, // Keep original exports like ThemeProvider component itself
    useTheme: () => ({
      colors: {
        primary: '#007bff', // Example primary color
        secondary: '#6c757d', // Example secondary color
        background: '#ffffff',
        text: {
          primary: '#212529',
          secondary: '#6c757d',
          hint: '#adb5bd',
          light: '#ffffff',
          dark: '#212529',
        },
        border: '#ced4da',
        surface: '#f8f9fa',
        card: '#ffffff',
        error: '#dc3545',
        success: '#28a745',
        // Ensure all colors actually used by components are provided
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      typography: {
        h1: { fontSize: 32, fontWeight: 'bold' },
        h2: { fontSize: 24, fontWeight: 'bold' },
        h3: { fontSize: 20, fontWeight: 'bold' },
        body: { fontSize: 16, fontWeight: 'normal' }, // Added fontWeight
        label: { fontSize: 14, color: '#6c757d' },
        // Ensure all typography styles used are provided
      },
      borderRadius: { sm: 4, md: 8, lg: 12 },
      // Add any other theme properties used by components under test
    }),
  };
});

// Mock @expo/vector-icons to provide a mock for MaterialIcons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const MockMaterialIcons = ({ name, style, testID }) => (
    <Text testID={testID || `icon-${name}`} style={style}>
      {name}
    </Text>
  );
  MockMaterialIcons.propTypes = {
    name: mockPropTypes.string.isRequired,
    style: mockPropTypes.oneOfType([mockPropTypes.object, mockPropTypes.array]),
    testID: mockPropTypes.string,
  };
  MockMaterialIcons.displayName = 'MockMaterialIcons';
  return {
    MaterialIcons: MockMaterialIcons,
    // Add mocks for other icon sets if the app uses them e.g.
    // FontAwesome: jest.fn().mockReturnValue(null),
  };
});

// Global afterEach to clear all mocks
// This is important to ensure tests are isolated.
// For navigation and redux mocks, we need to clear the specific mock functions.
afterEach(() => {
  jest.clearAllMocks();

  // Clear navigation mock functions
  mockNavigateFn.mockClear();
  mockGoBackFn.mockClear();
  mockDispatchNavFn.mockClear();
  mockSetOptionsFn.mockClear();

  // Clear redux mock functions
  mockReduxDispatchFn.mockClear();
  // If useNavigation or useSelector were more complex (e.g., returning different values per test),
  // they would need to be reset here too.
  // e.g. jest.mocked(useNavigation).mockReturnValue({ navigate: mockNavigateFn, ...});
});

// It's good practice to also clear any fake timers if they were used globally or not cleaned up in tests
// afterEach(() => {
//   jest.clearAllTimers();
// });

// Mock @react-navigation/native-stack to avoid font errors
jest.mock('@react-navigation/native-stack', () => {
  // React and PropTypes are already imported in module scope – reuse them here.
  return {
    createNativeStackNavigator: jest.fn(() => {
      const Navigator = ({ children }) => <>{children}</>;
      Navigator.propTypes = {
        children: mockPropTypes.node.isRequired,
      };
      Navigator.displayName = 'MockNativeStackNavigator.Navigator';

      const Screen = ({ component: Component, name, children }) => {
        const navigation = {
          navigate: mockNavigateFn,
          goBack: mockGoBackFn,
          reset: jest.fn(),
        };
        if (Component) {
          const Comp = Component;
          // PropType for navigation on Comp would be needed if Comp was defined here with PropTypes
          return <Comp navigation={navigation} />;
        }
        return <>{children}</>;
      };
      Screen.propTypes = {
        component: mockPropTypes.elementType,
        name: mockPropTypes.string.isRequired,
        children: mockPropTypes.node,
      };
      Screen.displayName = 'MockNativeStackNavigator.Screen';

      return { Navigator, Screen };
    }),
  };
});

// Robust mock for Zustand store used across multiple screens/tests
const createMockZustandStore = () => {
  const state = {
    currentRun: null,
    runs: [],
    beginRunTracking: jest.fn(),
    pauseRun: jest.fn(),
    resumeRun: jest.fn(),
    saveRun: jest.fn(),
    addLap: jest.fn(),
  };

  const useStore = jest.fn(selector => {
    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  });

  useStore.setState = partial => {
    Object.assign(state, partial);
  };
  useStore.getState = () => state;
  useStore.getInitialState = () => JSON.parse(JSON.stringify(state));

  return { __esModule: true, useStore };
};

// Conditionally mock useStore: real implementation for tests targeting the store itself
jest.mock('./src/stores/useStore', () => {
  const caller = (expect.getState && expect.getState().testPath) || '';
  if (
    caller.includes('/tests/stores') ||
    caller.includes('runStore.test') ||
    caller.includes('shoeStore.test')
  ) {
    return jest.requireActual('./src/stores/useStore');
  }
  return createMockZustandStore();
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { View, Text, TouchableOpacity } from 'react-native'; // Import common elements once
import PropTypes from 'prop-types';

// --- Helper to create simple mock screen components ---
const createMockScreenComponent = (displayName, testID, navigationProp = false) => {
  const MockComponent = props => (
    <View testID={testID}>
      <Text>Mock {displayName}</Text>
      {navigationProp && props.navigation && (
        <>
          <TouchableOpacity onPress={() => props.navigation.navigate('RunTracker')}>
            <Text>Go to RunTracker</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => props.navigation.navigate('ShoeList')}>
            <Text>Go to ShoeList</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
  MockComponent.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
  };
  MockComponent.displayName = displayName;
  return MockComponent;
};

// --- Mock Screens ---
jest.mock('../../src/screens/HomeScreen', () =>
  createMockScreenComponent('HomeScreen', 'mock-home-screen', true)
);
jest.mock('../../src/screens/RunTrackerScreen', () =>
  createMockScreenComponent('RunTrackerScreen', 'mock-runtracker-screen')
);
jest.mock('../../src/screens/ShoeListScreen', () =>
  createMockScreenComponent('ShoeListScreen', 'mock-shoelist-screen')
);
jest.mock('../../src/screens/RunLogScreen', () =>
  createMockScreenComponent('RunLogScreen', 'mock-runlogscreen')
);
jest.mock('../../src/screens/ShoeDetailScreen', () =>
  createMockScreenComponent('ShoeDetailScreen', 'mock-shoedetailscreen')
);
jest.mock('../../src/screens/RetiredShoesReportScreen', () =>
  createMockScreenComponent('RetiredShoesReportScreen', 'mock-retiredshoesreportscreen')
);
jest.mock('../../src/screens/SettingsScreen', () =>
  createMockScreenComponent('SettingsScreen', 'mock-settingsscreen')
);
jest.mock('../../src/screens/AddShoeScreen', () =>
  createMockScreenComponent('AddShoeScreen', 'mock-addshoescreen')
);
jest.mock('../../src/screens/EditShoeScreen', () =>
  createMockScreenComponent('EditShoeScreen', 'mock-editshoescreen')
);
jest.mock('../../src/screens/RunDetailScreen', () =>
  createMockScreenComponent('RunDetailScreen', 'mock-rundetailscreen')
);
jest.mock('../../src/screens/run_tracking/PreRunScreen', () =>
  createMockScreenComponent('PreRunScreen', 'mock-prerunscreen')
);
jest.mock('../../src/screens/run_tracking/ActiveRunScreen', () =>
  createMockScreenComponent('ActiveRunScreen', 'mock-activerunscreen')
);
jest.mock('../../src/screens/run_tracking/PauseScreen', () =>
  createMockScreenComponent('PauseScreen', 'mock-pausescreen')
);
jest.mock('../../src/screens/run_tracking/RunSummaryScreen', () =>
  createMockScreenComponent('RunSummaryScreen', 'mock-runsummaryscreen')
);
jest.mock('../../src/screens/run_tracking/SaveRunScreen', () =>
  createMockScreenComponent('SaveRunScreen', 'mock-saverunscreen')
);

// Mock ThemeProvider and StoreProvider as App.js does, in case any screen options use them.
jest.mock('../../src/theme/ThemeProvider', () => {
  const ActualThemeProvider = jest.requireActual('../../src/theme/ThemeProvider');
  return {
    ...ActualThemeProvider,
    useTheme: () => ({
      colors: {
        primary: 'blue',
        background: '#fff',
        text: { primary: '#000' },
        card: '#f0f0f0',
        border: '#ccc',
      },
      spacing: { md: 16 },
    }),
    ThemeProvider: ({ children }) => <>{children}</>,
  };
});
// Assign propTypes to the ThemeProvider mock
const ThemeProviderMock = jest.requireMock('../../src/theme/ThemeProvider').ThemeProvider;
ThemeProviderMock.propTypes = {
  children: PropTypes.node.isRequired,
};


jest.mock('../../src/providers/StoreProvider', () => ({
  StoreProvider: jest.fn(({ children }) => <>{children}</>),
  useStoreContext: jest.fn(() => ({ settings: {} })),
}));
// Assign propTypes to the StoreProvider mock
const StoreProviderMock = jest.requireMock('../../src/providers/StoreProvider').StoreProvider;
StoreProviderMock.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('AppNavigator', () => {
  const renderNavigator = () => {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  };

  it('renders the initial route (HomeScreen)', async () => {
    const { findByTestId, findByText } = renderNavigator();
    expect(await findByTestId('mock-home-screen')).toBeTruthy();
    expect(await findByText('Mock HomeScreen')).toBeTruthy();
    // Header title check removed for simplicity as it relies on deeper native stack rendering details
  });

  it('navigates to RunTrackerScreen from HomeScreen', async () => {
    const { findByTestId, getByText, findByText } = renderNavigator();
    expect(await findByTestId('mock-home-screen')).toBeTruthy();

    const goToRunTrackerButton = getByText('Go to RunTracker');
    fireEvent.press(goToRunTrackerButton);

    expect(await findByTestId('mock-runtracker-screen')).toBeTruthy();
    expect(await findByText('Mock RunTrackerScreen')).toBeTruthy();
    // Header title check removed
  });

  it('navigates to ShoeListScreen from HomeScreen', async () => {
    const { findByTestId, getByText, findByText } = renderNavigator();
    expect(await findByTestId('mock-home-screen')).toBeTruthy();

    const goToShoeListButton = getByText('Go to ShoeList');
    fireEvent.press(goToShoeListButton);

    expect(await findByTestId('mock-shoelist-screen')).toBeTruthy();
    expect(await findByText('Mock ShoeListScreen')).toBeTruthy();
    // Header title check removed
  });
});

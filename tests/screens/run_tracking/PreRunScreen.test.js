import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PreRunScreen from '../../../src/screens/run_tracking/PreRunScreen';
import { useStore } from '../../../src/stores/useStore';
import * as Location from 'expo-location';

// Mock child components and external libraries
jest.mock('../../../src/components/run_tracking/ShoeSelector', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  const PropTypes = require('prop-types');
  const MockShoeSelector = ({ selectedShoeId, onSelectShoe }) => (
    <View>
      <Text>Shoe Selector</Text>
      <TouchableOpacity onPress={() => onSelectShoe('shoe_123')} testID="shoe-selector">
        <Text>{selectedShoeId || 'Select a Shoe'}</Text>
      </TouchableOpacity>
    </View>
  );
  MockShoeSelector.displayName = 'MockShoeSelector';
  MockShoeSelector.propTypes = {
    selectedShoeId: PropTypes.string,
    onSelectShoe: PropTypes.func.isRequired,
  };
  return MockShoeSelector;
});

jest.mock('expo-location');

// Mock Zustand store
jest.mock('../../../src/stores/useStore');
const mockBeginRunTracking = jest.fn();
const mockUseStore = useStore;

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('PreRunScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock for Zustand store
    mockUseStore.setState({
      beginRunTracking: mockBeginRunTracking,
      // shoes: initialShoes, etc. if needed by other components
    });

    // Setup mock for expo-location
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockImplementation(async (options, callback) => {
      // Simulate a GPS signal being found
      callback({ coords: { accuracy: 10 } }); // accuracy < 20 is 'good'
      return { remove: () => {} }; // Return a subscription object with a remove function
    });
  });

  const renderScreen = () => render(<PreRunScreen navigation={{ navigate: mockNavigate }} />);

  it('renders initial components correctly', () => {
    const { getByText, getByPlaceholderText } = renderScreen();
    expect(getByText('Prepare Your Run')).toBeTruthy();
    expect(getByText('Shoe Selector')).toBeTruthy();
    expect(getByText('Run Type')).toBeTruthy();
    expect(getByText('Goal')).toBeTruthy();
    expect(getByPlaceholderText('Type (e.g., distance, time)')).toBeTruthy();
    expect(getByText('Audio Cues')).toBeTruthy();
    expect(getByText('Start Run')).toBeTruthy();
  });

  it('shows searching for GPS on mount for outdoor runs', () => {
    const { getByText } = renderScreen();
    expect(getByText(/GPS Status: Searching.../i)).toBeTruthy();
  });

  it('shows good GPS signal after a short delay', async () => {
    const { findByText } = renderScreen();
    await waitFor(() => expect(Location.watchPositionAsync).toHaveBeenCalled());
    const goodSignal = await findByText(/GPS Status: Good/i);
    expect(goodSignal).toBeTruthy();
  });

  it('disables start button until GPS is good for outdoor run', async () => {
    const { getByText, findByText } = renderScreen();

    // Initially disabled
    expect(getByText('Start Run').props.accessibilityState.disabled).toBe(true);

    // Wait for GPS status to become good
    await findByText(/GPS Status: Good/i);

    // Re-query start button to get the updated props
    await waitFor(() => {
      expect(getByText('Start Run').props.accessibilityState.disabled).toBe(false);
    });
  });

  it('enables start button immediately for indoor run', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Indoor'));
    const startButton = getByText('Start Run');
    expect(startButton.props.accessibilityState.disabled).toBe(false);
  });

  it('dispatches beginRunTracking and navigates on start press', async () => {
    const { getByText, findByText } = renderScreen();

    // Wait for GPS to be good and button enabled
    await findByText(/GPS Status: Good/i);
    await waitFor(() => {
      expect(getByText('Start Run').props.accessibilityState.disabled).toBe(false);
    });

    // Select a shoe using the mock
    fireEvent.press(getByText('Select a Shoe'));

    // Press start
    fireEvent.press(getByText('Start Run'));

    expect(mockBeginRunTracking).toHaveBeenCalledWith(
      expect.objectContaining({
        shoeId: 'shoe_123',
        runType: 'outdoor',
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith('ActiveRun');
  });
});

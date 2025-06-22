import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import PreRunScreen from '../../../src/screens/run_tracking/PreRunScreen';
import { useStore } from '../../../src/stores/useStore';
import * as Location from 'expo-location';

// Mock child components and external libraries
jest.mock('../../../src/components/run_tracking/ShoeSelector', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return ({ selectedShoeId, onSelectShoe }) => (
    <View>
      <Text>Shoe Selector</Text>
      <TouchableOpacity onPress={() => onSelectShoe('shoe_123')} testID="shoe-selector">
        <Text>{selectedShoeId || 'Select a Shoe'}</Text>
      </TouchableOpacity>
    </View>
  );
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
    const startButton = getByText('Start Run');

    // Initially disabled
    expect(startButton.props.accessibilityState.disabled).toBe(true);

    // Becomes enabled
    await findByText(/GPS Status: Good/i);
    expect(startButton.props.accessibilityState.disabled).toBe(false);
  });

  it('enables start button immediately for indoor run', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Indoor'));
    const startButton = getByText('Start Run');
    expect(startButton.props.accessibilityState.disabled).toBe(false);
  });

  it('dispatches beginRunTracking and navigates on start press', async () => {
    const { getByText, findByText } = renderScreen();

    // Wait for GPS
    await findByText(/GPS Status: Good/i);

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

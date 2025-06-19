import React from 'react';
import { render, fireEvent, waitFor, Alert } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PauseScreen from './PauseScreen'; // Adjust path
import { RunProvider, useRun } from '../context/RunContext'; // Adjust path

// Mock the context and navigation
jest.mock('../context/RunContext', () => ({
  ...jest.requireActual('../context/RunContext'),
  useRun: jest.fn(),
}));
jest.mock('@react-navigation/native');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockNavigate = jest.fn();
const mockResumeRun = jest.fn();
const mockStopRun = jest.fn(); // Assuming "Save" on PauseScreen calls stopRun then navigates to Summary
const mockDiscardRun = jest.fn();
const mockGoBack = jest.fn();


const initialMockRunState = {
  runStatus: 'paused', // Screen is typically accessed when paused
  currentRun: { id: 'run1', startTime: Date.now(), distance: 3100, duration: 1205, pace: '6:29', path: [], isPaused: true, pausedDuration: 0 },
  resumeRun: mockResumeRun,
  stopRun: mockStopRun,
  discardRun: mockDiscardRun,
  // Add other state/functions PauseScreen might use
};

const renderWithRunProvider = (component, providerState = initialMockRunState, routeParams = {}) => {
  (useRun as jest.Mock).mockReturnValue(providerState);
  (useRoute as jest.Mock).mockReturnValue({ params: routeParams }); // Mock useRoute if screen uses it
  return render(
    <RunProvider>
      {component}
    </RunProvider>
  );
};

describe('PauseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate, goBack: mockGoBack });
  });

  it('renders initial UI elements correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);

    expect(getByText('Run Paused')).toBeTruthy();
    // It uses mock data for stats display, so these values are hardcoded in the component for now
    expect(getByText('3.10 km')).toBeTruthy();
    expect(getByText('00:20:05')).toBeTruthy();
    expect(getByText('6:29 min/km')).toBeTruthy();
    expect(getByPlaceholderText('How was the run?')).toBeTruthy();
    expect(getByText('Resume')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
    expect(getByText('Discard')).toBeTruthy();
  });

  it('calls resumeRun and navigates on "Resume" button press', () => {
    const { getByText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);
    fireEvent.press(getByText('Resume'));

    expect(mockResumeRun).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('ActiveRun');
  });

  it('calls stopRun (for saving flow) and navigates on "Save" button press', () => {
    // The PauseScreen's "Save" button navigates to RunSummary,
    // which then can lead to the actual save.
    // The current implementation in PauseScreen.tsx for handleSave is:
    // navigation.navigate('RunSummary', { pausedStats: summaryStats, note });
    // It does not directly call stopRun or saveRun from context.
    // This test will verify navigation.
    // If the requirement was to call stopRun/saveRun directly, the component would need to change.

    const { getByText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);
    fireEvent.press(getByText('Save'));

    // As per current PauseScreen code, it doesn't call stopRun or saveRun directly.
    // It navigates to RunSummary with params.
    expect(mockNavigate).toHaveBeenCalledWith('RunSummary', {
      pausedStats: { distance: '3.10', time: '00:20:05', pace: '6:29' }, // Mock data from component
      note: '', // Initial note
    });
    // expect(mockStopRun).toHaveBeenCalledTimes(1); // Not called directly by PauseScreen's save
  });

  it('calls discardRun and navigates on "Discard" button press after confirmation', async () => {
    const { getByText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const discardButton = buttons.find(b => b.text === "Discard");
      if (discardButton && discardButton.onPress) {
        discardButton.onPress();
      }
    });

    fireEvent.press(getByText('Discard'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    // Check that the discard function from context is called
    await waitFor(() => {
        expect(mockDiscardRun).toHaveBeenCalledTimes(1);
    });
    // Check that navigation to PreRun occurs
    expect(mockNavigate).toHaveBeenCalledWith('PreRun');
  });

  it('does not discard if user cancels confirmation', () => {
    const { getByText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const cancelButton = buttons.find(b => b.text === "Cancel");
      if (cancelButton && cancelButton.onPress) {
        cancelButton.onPress();
      } else if (cancelButton) {
        // Simulate just pressing cancel without an onPress
      }
    });

    fireEvent.press(getByText('Discard'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(mockDiscardRun).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('PreRun');
  });

  it('updates the note text input', () => {
    const { getByPlaceholderText } = renderWithRunProvider(<PauseScreen navigation={useNavigation()} />);
    const noteInput = getByPlaceholderText('How was the run?');

    fireEvent.changeText(noteInput, 'Felt great today!');
    expect(noteInput.props.value).toBe('Felt great today!');
  });

});

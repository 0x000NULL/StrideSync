import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import PreRunScreen from './PreRunScreen'; // Adjust path
import { RunProvider, useRun } from '../context/RunContext'; // Adjust path

// Mock the context hook and navigation
jest.mock('../context/RunContext', () => ({
  ...jest.requireActual('../context/RunContext'), // Import and retain default exports
  useRun: jest.fn(),
}));
jest.mock('@react-navigation/native');

// Test utility to render with provider
const renderWithRunProvider = (component, providerProps = {}) => {
  return render(
    <RunProvider {...providerProps}>
      {component}
    </RunProvider>
  );
};

describe('PreRunScreen', () => {
  const mockNavigate = jest.fn();
  const mockStartNewRun = jest.fn();

  beforeEach(() => {
    // Reset mocks for each test
    mockNavigate.mockClear();
    mockStartNewRun.mockClear();

    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
    (useRun as jest.Mock).mockReturnValue({
      startNewRun: mockStartNewRun,
      // Provide any other state/functions PreRunScreen might use from context
      runStatus: 'idle',
    });
  });

  it('renders initial UI elements correctly', () => {
    const { getByText, getByTestId } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />); // Pass navigation prop

    expect(getByText('Prepare Your Run')).toBeTruthy();
    expect(getByText('Shoe:')).toBeTruthy();
    expect(getByText('Select Shoe')).toBeTruthy(); // Initial shoe text
    expect(getByText('Run Type:')).toBeTruthy();
    expect(getByText('Outdoor')).toBeTruthy(); // Initial run type
    expect(getByText('Goal:')).toBeTruthy();
    expect(getByText('Open')).toBeTruthy(); // Initial goal
    expect(getByText('Audio Cues:')).toBeTruthy();
    // GPS Status might be tricky if it involves async operations not easily mocked here
    // For Switch, you might need testIDs or more specific queries if text isn't unique
  });

  it('allows selecting a shoe', () => {
    const { getByText } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);
    const shoeSelector = getByText('Select Shoe');
    fireEvent.press(shoeSelector);
    expect(getByText('Shoe A')).toBeTruthy(); // First press
    fireEvent.press(getByText('Shoe A'));
    expect(getByText('Shoe B')).toBeTruthy(); // Second press
  });

  it('allows selecting a run type', () => {
    const { getByText } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);
    const runTypeSelector = getByText('Outdoor'); // Default
    fireEvent.press(runTypeSelector);
    expect(getByText('Indoor')).toBeTruthy();
  });

  it('allows selecting a goal', () => {
    const { getByText } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);
    const goalSelector = getByText('Open'); // Default
    fireEvent.press(goalSelector);
    expect(getByText('Time')).toBeTruthy();
    fireEvent.press(getByText('Time'));
    expect(getByText('Distance')).toBeTruthy();
  });

  // Test for AudioCuesToggle Switch (assuming it has a testID or accessible role)
  // This requires knowing how the Switch is implemented or adding a testID
  // For example, if Switch has testID="audio-cues-switch"
  // it('toggles audio cues', () => {
  //   const { getByTestId } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);
  //   const audioCuesSwitch = getByTestId('audio-cues-switch');
  //   const initialValue = audioCuesSwitch.props.value;
  //   fireEvent(audioCuesSwitch, 'onValueChange', !initialValue);
  //   expect(audioCuesSwitch.props.value).toBe(!initialValue);
  // });


  it('calls startNewRun and navigates on "Start Run" button press', async () => {
    const { getByText } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);
    const startButton = getByText('Start Run');

    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockStartNewRun).toHaveBeenCalledTimes(1);
      // Check parameters of startNewRun if specific data is expected
      expect(mockStartNewRun).toHaveBeenCalledWith(expect.objectContaining({
        //isIndoor: false, // default if "Outdoor" is selected
        //goal: 'Open', // default
        // Check other params like shoeId if applicable and how it's derived
        startTime: expect.any(Number), // Check that startTime is a number
      }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('ActiveRun');
  });

  it('passes correct isIndoor value to startNewRun based on selection', async () => {
    const { getByText } = renderWithRunProvider(<PreRunScreen navigation={useNavigation()} />);

    // Change to Indoor
    const runTypeSelector = getByText('Outdoor');
    fireEvent.press(runTypeSelector); // Now "Indoor"
    expect(getByText('Indoor')).toBeTruthy();

    const startButton = getByText('Start Run');
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(mockStartNewRun).toHaveBeenCalledWith(expect.objectContaining({
        isIndoor: true,
        startTime: expect.any(Number),
      }));
    });
  });

});

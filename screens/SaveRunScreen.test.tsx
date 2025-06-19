import React from 'react';
import { render, fireEvent, waitFor, Alert } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SaveRunScreen from './SaveRunScreen'; // Adjust path
import { RunProvider, useRun } from '../context/RunContext'; // Adjust path

jest.mock('../context/RunContext', () => ({
  ...jest.requireActual('../context/RunContext'),
  useRun: jest.fn(),
}));
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert'); // Mock Alert for save confirmation

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPopToTop = jest.fn();
const mockSaveRun = jest.fn();

const initialMockRunState = {
  // Provide any state SaveRunScreen might use directly from context
  saveRun: mockSaveRun,
};

const renderWithRunProvider = (component, providerState = initialMockRunState, routeParams = {}) => {
  (useRun as jest.Mock).mockReturnValue(providerState);
  (useRoute as jest.Mock).mockReturnValue({ params: routeParams });
  return render(
    <RunProvider>
      {component}
    </RunProvider>
  );
};

describe('SaveRunScreen', () => {
  const mockRouteParams = {
    summaryData: {
      totalDistance: '10.55',
      duration: '01:05:30',
      // title: "My Awesome Run" // Optional: if summaryData can have a title
    },
    runNote: 'Felt strong today!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
        navigate: mockNavigate,
        goBack: mockGoBack,
        popToTop: mockPopToTop,
    });
  });

  it('renders initial UI elements and pre-fills from route params', () => {
    const { getByText, getByDisplayValue, getByPlaceholderText } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );

    expect(getByText('Save Your Run')).toBeTruthy();
    // Title might be auto-generated with date if not in params
    // For this test, we'll check the note which IS in params
    expect(getByDisplayValue(mockRouteParams.runNote)).toBeTruthy();
    expect(getByPlaceholderText('e.g., Morning Jog, Long Run')).toBeTruthy(); // Title input

    // Check selectors are present
    expect(getByText('Shoes:')).toBeTruthy();
    expect(getByText('Weather:')).toBeTruthy();
    expect(getByText('Perceived Effort:')).toBeTruthy();
    expect(getByText('Mood:')).toBeTruthy();
    expect(getByText('Export Options:')).toBeTruthy(); // Placeholder section
    expect(getByText('Save Run')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('pre-fills title with generated date if not provided in params', () => {
    const paramsWithoutTitle = { ...mockRouteParams, summaryData: { ...mockRouteParams.summaryData, title: undefined } };
    const expectedDate = new Date().toLocaleDateString(); // Component generates this
    const { getByDisplayValue } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      paramsWithoutTitle
    );
    expect(getByDisplayValue(`Run on ${expectedDate}`)).toBeTruthy();
  });

  it('updates run title and notes on input change', () => {
    const { getByPlaceholderText, getByDisplayValue } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams // Start with pre-filled note
    );

    const titleInput = getByPlaceholderText('e.g., Morning Jog, Long Run');
    fireEvent.changeText(titleInput, 'Evening Sprint');
    expect(titleInput.props.value).toBe('Evening Sprint');

    const notesInput = getByDisplayValue(mockRouteParams.runNote);
    fireEvent.changeText(notesInput, 'Tough but rewarding.');
    expect(notesInput.props.value).toBe('Tough but rewarding.');
  });

  it('updates shoe, weather, effort, and mood selectors', () => {
    const { getByText } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );

    // Shoe (options: Shoe A, Shoe B, None)
    fireEvent.press(getByText('Shoe A')); // Pressing the label of the option
    expect(getByText('Shoe A').props.style.find(s => s.backgroundColor === '#3498db')).toBeTruthy(); // Check selected style

    // Weather (options: ☀️ Sunny, ☁️ Cloudy, ...)
    fireEvent.press(getByText('🌧️ Rainy'));
    expect(getByText('🌧️ Rainy').props.style.find(s => s.backgroundColor === '#3498db')).toBeTruthy();

    // Effort (options: Easy 😊, Moderate 🙂, ...)
    fireEvent.press(getByText('Hard 😓'));
    expect(getByText('Hard 😓').props.style.find(s => s.backgroundColor === '#3498db')).toBeTruthy();

    // Mood (options: Great 😄, Good 👍, ...)
    fireEvent.press(getByText('Good 👍'));
    expect(getByText('Good 👍').props.style.find(s => s.backgroundColor === '#3498db')).toBeTruthy();
  });

  it('calls Alert and popToTop on "Save Run" button press', async () => {
    const { getByText, getByPlaceholderText } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );

    // Make some changes to ensure data is passed
    const titleInput = getByPlaceholderText('e.g., Morning Jog, Long Run');
    fireEvent.changeText(titleInput, 'Final Test Run');
    fireEvent.press(getByText('Shoe A'));


    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress(); // Simulate pressing OK on the alert
      }
    });

    fireEvent.press(getByText('Save Run'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Run Saved (Simulated)",
        expect.stringContaining("Title: Final Test Run"), // Check if title is in message
        expect.anything()
      );
    });

    // The actual saveRun from context is NOT called by SaveRunScreen directly.
    // The component shows an alert and then navigates.
    // If it were to call context.saveRun, the test would be:
    // expect(mockSaveRun).toHaveBeenCalledTimes(1);
    // expect(mockSaveRun).toHaveBeenCalledWith(expect.objectContaining({ title: 'Final Test Run', notes: mockRouteParams.runNote, shoeId: 'shoe_a' }));

    expect(mockPopToTop).toHaveBeenCalledTimes(1);
  });

  it('calls goBack on "Cancel" button press', () => {
    const { getByText } = renderWithRunProvider(
      <SaveRunScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );
    fireEvent.press(getByText('Cancel'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});

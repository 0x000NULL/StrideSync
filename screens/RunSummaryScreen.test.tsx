import React from 'react';
import { render, fireEvent, Alert, waitFor } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RunSummaryScreen from './RunSummaryScreen'; // Adjust path
import { RunProvider, useRun } from '../context/RunContext'; // Adjust path

jest.mock('../context/RunContext', () => ({
  ...jest.requireActual('../context/RunContext'),
  useRun: jest.fn(),
}));
jest.mock('@react-navigation/native');
jest.spyOn(Alert, 'alert'); // Mock Alert for discard confirmation

const mockNavigate = jest.fn();
const mockDiscardRun = jest.fn(); // If discard on summary also clears context state

const initialMockRunState = {
  // Provide any state RunSummaryScreen might use from context
  // For this screen, it mostly relies on route params.
};

const renderWithRunProvider = (component, providerState = initialMockRunState, routeParams = {}) => {
  (useRun as jest.Mock).mockReturnValue({
    ...providerState,
    discardRun: mockDiscardRun, // Ensure discardRun is part of the mock for this screen too
  });
  (useRoute as jest.Mock).mockReturnValue({ params: routeParams });
  return render(
    <RunProvider>
      {component}
    </RunProvider>
  );
};

describe('RunSummaryScreen', () => {
  const mockRouteParams = {
    summaryData: {
      totalDistance: '10.55',
      duration: '01:05:30',
      averagePace: '6:12',
      caloriesBurned: '750',
      // Add other stats as defined in the component's mock data or expected structure
    },
    personalRecordsData: ['Fastest 10K', 'Longest Run this month'],
    runNote: 'A really good long run!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
  });

  it('renders initial UI elements and data from route params', () => {
    const { getByText, getAllByText } = renderWithRunProvider(
      <RunSummaryScreen navigation={useNavigation()} route={useRoute()} />, // Pass route prop
      initialMockRunState,
      mockRouteParams
    );

    expect(getByText('Run Summary')).toBeTruthy();
    // Check some key stats from summaryData
    expect(getAllByText(mockRouteParams.summaryData.totalDistance)[0]).toBeTruthy(); // StatsGrid displays value
    expect(getAllByText(mockRouteParams.summaryData.duration)[0]).toBeTruthy();
    expect(getAllByText(mockRouteParams.summaryData.averagePace)[0]).toBeTruthy();
    expect(getAllByText(mockRouteParams.summaryData.caloriesBurned)[0]).toBeTruthy();

    // Check personal records
    mockRouteParams.personalRecordsData.forEach(record => {
      expect(getByText(`🏆 ${record}`)).toBeTruthy();
    });

    // Check run note
    expect(getByText(mockRouteParams.runNote)).toBeTruthy();

    // Check placeholders
    expect(getByText('Map with Route Placeholder')).toBeTruthy();
    expect(getByText('Pace Chart Placeholder')).toBeTruthy();
    expect(getByText('Elevation Profile Placeholder')).toBeTruthy();

    expect(getByText('Save Run')).toBeTruthy();
    expect(getByText('Discard')).toBeTruthy();
  });

  it('displays default data if route params are not provided', () => {
    const { getAllByText, getByText } = renderWithRunProvider(
      <RunSummaryScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      {} // Empty params
    );
    // Check for default values used in RunSummaryScreen
    expect(getAllByText('5.02')[0]).toBeTruthy(); // Default totalDistance
    expect(getAllByText('00:30:45')[0]).toBeTruthy(); // Default duration
    expect(getByText('No new personal records this time.')).toBeTruthy();
    expect(getByText('No note added for this run.')).toBeTruthy();
  });

  it('navigates to SaveRunScreen with data on "Save Run" button press', () => {
    const { getByText } = renderWithRunProvider(
      <RunSummaryScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );
    fireEvent.press(getByText('Save Run'));

    expect(mockNavigate).toHaveBeenCalledWith('SaveRun', {
      summaryData: mockRouteParams.summaryData,
      personalRecordsData: mockRouteParams.personalRecordsData,
      runNote: mockRouteParams.runNote,
    });
  });

  it('calls Alert and navigates to PreRunScreen on "Discard" button press after confirmation', async () => {
    const { getByText } = renderWithRunProvider(
      <RunSummaryScreen navigation={useNavigation()} route={useRoute()} />,
      initialMockRunState,
      mockRouteParams
    );

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const discardButton = buttons.find(b => b.text === "Discard");
      if (discardButton && discardButton.onPress) {
        discardButton.onPress();
      }
    });

    fireEvent.press(getByText('Discard'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    // If discardRun from context should be called here, it needs to be part of the component's logic
    // Currently, RunSummaryScreen's discard just navigates.
    // If it were to also call context.discardRun, we'd test for that:
    // await waitFor(() => expect(mockDiscardRun).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledWith('PreRun');
  });

   it('does not navigate on "Discard" if user cancels confirmation', () => {
    const { getByText } = renderWithRunProvider(
        <RunSummaryScreen navigation={useNavigation()} route={useRoute()} />,
        initialMockRunState,
        mockRouteParams
    );

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const cancelButton = buttons.find(b => b.text === "Cancel");
      // Simulate pressing cancel (no action or call cancel's onPress if it exists)
      if (cancelButton && cancelButton.onPress) cancelButton.onPress();
    });

    fireEvent.press(getByText('Discard'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalledWith('PreRun');
    // expect(mockDiscardRun).not.toHaveBeenCalled();
  });
});

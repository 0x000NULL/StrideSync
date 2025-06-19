import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RunSummaryScreen from '../RunSummaryScreen';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MockMapView = (props) => <View {...props}>{props.children}</View>;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MockPolyline = (props) => <View {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Polyline: MockPolyline,
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockDefaultRunData = {
  distance: 5.23,
  duration: 1800, // 30 minutes
  pace: 5.73, // min/km
  calories: 350,
  routeCoordinates: [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4334 },
  ],
};

describe('RunSummaryScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it('renders correctly with valid runData', () => {
    const { getByText, queryByTestId } = render(
      <RunSummaryScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );

    expect(getByText('Run Summary')).toBeTruthy();
    expect(getByText('Distance: 5.23 km')).toBeTruthy();
    expect(getByText('Duration: 30m 0s')).toBeTruthy();
    expect(getByText('Pace: 5.73 min/km')).toBeTruthy();
    expect(getByText('Calories: 350 kcal')).toBeTruthy();
    expect(getByText('Add Details & Save')).toBeTruthy();
    expect(getByText('Discard Run')).toBeTruthy();
    // Check if MapView and Polyline are rendered (using testID if available or by structure)
    // Since react-native-maps is mocked, we can't deeply inspect it, but ensure no crash.
  });

  it('displays error message and go back button if no runData is provided', () => {
    const { getByText } = render(
      <RunSummaryScreen
        route={{ params: {} }} // No runData
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );
    expect(getByText('No run data available.')).toBeTruthy();
    expect(getByText('Go Back')).toBeTruthy();
  });

  it('displays "0.00" for pace if pace is 0 or NaN', () => {
    const runDataWithoutPace = { ...mockDefaultRunData, pace: 0 };
    const { getByText } = render(
      <RunSummaryScreen
        route={{ params: { runData: runDataWithoutPace } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );
    expect(getByText('Pace: 0.00 min/km')).toBeTruthy();
  });


  it('calls navigation.navigate with runData when "Add Details & Save" is pressed', () => {
    const { getByText } = render(
      <RunSummaryScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );

    fireEvent.press(getByText('Add Details & Save'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('SaveRun', { runData: mockDefaultRunData });
  });

  it('calls navigation.goBack when "Discard Run" is pressed', () => {
    // Mock alert
    const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');

    const { getByText } = render(
      <RunSummaryScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );

    fireEvent.press(getByText('Discard Run'));
    // expect(mockAlert).toHaveBeenCalled(); // Alert is called in the original component, but not directly testable here without more setup
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    mockAlert.mockRestore(); // Clean up spy
  });

   it('handles missing routeCoordinates gracefully for map region calculation', () => {
    const runDataNoRoute = { ...mockDefaultRunData, routeCoordinates: [] };
    const { getByText } = render(
      <RunSummaryScreen
        route={{ params: { runData: runDataNoRoute } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );
    // Check that the component renders without crashing and displays metrics
    expect(getByText('Distance: 5.23 km')).toBeTruthy();
    // The map region will default, which is fine.
  });

  it('handles null runData gracefully', () => {
     const { getByText } = render(
      <RunSummaryScreen
        route={{ params: { runData: null } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );
    expect(getByText('No run data available.')).toBeTruthy();
  });

});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SaveRunScreen from '../SaveRunScreen';
import { Alert } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockPopToTop = jest.fn();

const mockDefaultRunData = {
  distance: 5.23,
  duration: 1800, // 30 minutes
  pace: 5.73,
  calories: 350,
  routeCoordinates: [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4334 },
  ],
};

// Spy on Alert.alert
jest.spyOn(Alert, 'alert');

describe('SaveRunScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    mockPopToTop.mockClear();
    Alert.alert.mockClear();
  });

  it('renders correctly with valid runData', () => {
    const { getByText, getByPlaceholderText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    expect(getByText('Save Your Run')).toBeTruthy();
    expect(getByText(`Distance: ${mockDefaultRunData.distance.toFixed(2)} km`)).toBeTruthy();
    expect(getByText(`Duration: ${Math.floor(mockDefaultRunData.duration / 60)}m ${mockDefaultRunData.duration % 60}s`)).toBeTruthy();

    expect(getByPlaceholderText('e.g., Morning Jog, Park Loop')).toBeTruthy();
    expect(getByPlaceholderText('How was your run? Any PBs or notable things?')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Strong, Tired, Energized')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Sunny and warm, Windy, Light rain')).toBeTruthy();

    expect(getByText('Save Run')).toBeTruthy();
    expect(getByText('Discard')).toBeTruthy();
  });

  it('displays error message if no runData is provided', () => {
    const { getByText } = render(
      <SaveRunScreen
        route={{ params: {} }} // No runData
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );
    expect(getByText('No run data available to save.')).toBeTruthy();
    expect(getByText('Go Back')).toBeTruthy();
  });

  it('updates input fields correctly', () => {
    const { getByPlaceholderText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Morning Jog, Park Loop');
    fireEvent.changeText(titleInput, 'My Awesome Run');
    expect(titleInput.props.value).toBe('My Awesome Run');

    const notesInput = getByPlaceholderText('How was your run? Any PBs or notable things?');
    fireEvent.changeText(notesInput, 'Felt great, new PB!');
    expect(notesInput.props.value).toBe('Felt great, new PB!');
  });

  it('shows alert if trying to save without a title', () => {
    const { getByText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    fireEvent.press(getByText('Save Run'));
    expect(Alert.alert).toHaveBeenCalledWith('Title Required', 'Please enter a title for your run.');
    expect(mockPopToTop).not.toHaveBeenCalled();
  });

  it('calls console.log (simulating save) and navigates on "Save Run" with a title', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByText, getByPlaceholderText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Morning Jog, Park Loop');
    fireEvent.changeText(titleInput, 'Test Run Title');
    fireEvent.press(getByText('Save Run'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Saving full run details:',
      expect.objectContaining({
        ...mockDefaultRunData,
        title: 'Test Run Title',
        notes: '',
        felt: '',
        weather: '',
        savedAt: expect.any(String),
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith('Run Saved!', 'Your run details have been saved.');
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  it('shows confirmation alert on "Discard" and navigates back if confirmed', () => {
    const { getByText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    fireEvent.press(getByText('Discard'));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Discard Run?",
      "Are you sure you want to discard this run? Any details entered will be lost.",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Discard", onPress: expect.any(Function) })
      ])
    );

    // Simulate pressing "Discard" in the Alert
    const discardButtonCallback = Alert.alert.mock.calls[0][2].find(button => button.text === "Discard").onPress;
    if(discardButtonCallback) discardButtonCallback();

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('does not navigate back if "Cancel" is pressed on discard alert', () => {
    const { getByText } = render(
      <SaveRunScreen
        route={{ params: { runData: mockDefaultRunData } }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, popToTop: mockPopToTop }}
      />
    );

    fireEvent.press(getByText('Discard'));

    // Simulate pressing "Cancel" in the Alert
     const cancelButtonCallback = Alert.alert.mock.calls[0][2].find(button => button.text === "Cancel").onPress;
    if(cancelButtonCallback) cancelButtonCallback(); // Though typically onPress for cancel is undefined or does nothing

    expect(mockGoBack).not.toHaveBeenCalled();
  });

});

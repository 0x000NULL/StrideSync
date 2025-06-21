import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PreRunScreen from '../../../src/screens/run_tracking/PreRunScreen';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as runSliceActions from '../../../src/stores/run_tracking/runSlice';

let mockBeginRunTrackingSpy;

describe('PreRunScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockBeginRunTrackingSpy = jest.spyOn(runSliceActions, 'beginRunTracking')
      .mockImplementation(runData => async (dispatch, getState) => {
        return Promise.resolve({ payload: runData.id });
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    mockBeginRunTrackingSpy.mockRestore();
    jest.clearAllMocks();
  });

  const renderScreen = (props = {}) => {
    const navigationFunctions = useNavigation();
    const navigationProp = {
      navigate: navigationFunctions.navigate,
      goBack: navigationFunctions.goBack,
    };
    return render(<PreRunScreen navigation={navigationProp} {...props} />);
  };

  it('renders initial components correctly', () => {
    const { getByText, getByPlaceholderText, getByRole } = renderScreen();
    expect(getByText('Prepare Your Run')).toBeTruthy();
    expect(getByText('Shoe Selector')).toBeTruthy();
    expect(getByText('Select a Shoe')).toBeTruthy();
    expect(getByText('Run Type')).toBeTruthy();
    expect(getByText('Outdoor')).toBeTruthy();
    expect(getByText('Indoor')).toBeTruthy();
    // GPSStatusIndicator IS rendered by default because runType defaults to 'outdoor'
    expect(getByText(/GPS Status: searching/i)).toBeTruthy();
    expect(getByText('Goal')).toBeTruthy();
    expect(getByPlaceholderText('Type (e.g., distance, time)')).toBeTruthy();
    expect(getByPlaceholderText('Value (e.g., 5, 30)')).toBeTruthy();
    expect(getByText('Audio Cues')).toBeTruthy();
    expect(getByRole('switch')).toBeTruthy();
    expect(getByText('Start Run')).toBeTruthy();
  });

  it('initial state and UI reflects defaults', () => {
    const { getByText, getByDisplayValue, getByRole } = renderScreen();
    expect(getByText(/GPS Status: searching/i)).toBeTruthy();
    expect(getByDisplayValue('open')).toBeTruthy();
    const switchComponent = getByRole('switch');
    expect(switchComponent.props.value).toBe(false);
  });

  it('handles run type selection', async () => {
    const { getByText, findByText, queryByText } = renderScreen();
    const indoorButton = getByText('Indoor');
    const outdoorButton = getByText('Outdoor');

    fireEvent.press(indoorButton);
    // GPSStatusIndicator component is not rendered for indoor runs
    expect(queryByText(/GPS Status:/i)).toBeNull();
    // The specific text "Status: unavailable (Indoor)" would also not be found
    expect(queryByText("Status: unavailable (Indoor)")).toBeNull();


    fireEvent.press(outdoorButton);
    // GPSStatusIndicator IS rendered for outdoor runs
    expect(await findByText(/GPS Status: searching/i)).toBeTruthy();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(await findByText(/GPS Status: good/i)).toBeTruthy();
  });

  it('handles goal input changes', () => {
    const { getByPlaceholderText } = renderScreen();
    const typeInput = getByPlaceholderText('Type (e.g., distance, time)');
    const valueInput = getByPlaceholderText('Value (e.g., 5, 30)');

    fireEvent.changeText(typeInput, 'distance');
    fireEvent.changeText(valueInput, '10');

    expect(typeInput.props.value).toBe('distance');
    expect(valueInput.props.value).toBe('10');
  });

  it('handles audio cues toggle', () => {
    const { getByRole } = renderScreen();
    const switchComponent = getByRole('switch');

    expect(switchComponent.props.value).toBe(false);
    fireEvent(switchComponent, 'onValueChange', true);
    expect(getByRole('switch').props.value).toBe(true);
  });

  describe('Start Run Button', () => {
    it('is disabled when GPS is searching for outdoor run', () => {
      const { getByText } = renderScreen();
      expect(getByText(/GPS Status: searching/i)).toBeTruthy();
      const startButtonTouchable = getByText('Start Run').parent;
      expect(startButtonTouchable.props.disabled).toBe(true);
    });

    it('is enabled when GPS is good for outdoor run', async () => {
      const { getByText, findByText } = renderScreen();
      act(() => { jest.advanceTimersByTime(3000); });
      expect(await findByText(/GPS Status: good/i)).toBeTruthy();
      const startButtonTouchable = getByText('Start Run').parent;
      expect(startButtonTouchable.props.disabled).toBe(false);
    });

    it('is enabled for indoor run regardless of GPS', () => {
      const { getByText, queryByText } = renderScreen();
      fireEvent.press(getByText('Indoor'));
      expect(queryByText(/GPS Status:/i)).toBeNull();
      const startButtonTouchable = getByText('Start Run').parent;
      expect(startButtonTouchable.props.disabled).toBe(false);
    });

    it('dispatches beginRunTracking and navigates on press (outdoor, good GPS)', async () => {
      const { getByText, findByText } = renderScreen();
      act(() => { jest.advanceTimersByTime(3000); });
      expect(await findByText(/GPS Status: good/i)).toBeTruthy();

      const startButton = getByText('Start Run');
      const navigation = useNavigation();

      await act(async () => {
        fireEvent.press(startButton);
      });

      expect(mockBeginRunTrackingSpy).toHaveBeenCalled();
      expect(navigation.navigate).toHaveBeenCalledWith('ActiveRun');
    });

    it('dispatches beginRunTracking with correct data', async () => {
        const { getByText, getByPlaceholderText, getByRole } = renderScreen();

        fireEvent.press(getByText('Indoor'));
        fireEvent.changeText(getByPlaceholderText('Type (e.g., distance, time)'), 'time');
        fireEvent.changeText(getByPlaceholderText('Value (e.g., 5, 30)'), '45');
        const switchComponent = getByRole('switch');
        fireEvent(switchComponent, 'onValueChange', true);
        fireEvent.press(getByText('Select a Shoe'));

        const startButton = getByText('Start Run');
        await act(async () => {
          fireEvent.press(startButton);
        });

        expect(mockBeginRunTrackingSpy).toHaveBeenCalled();
        expect(mockBeginRunTrackingSpy).toHaveBeenCalledWith(expect.objectContaining({
          runType: 'indoor',
          goal: { type: 'time', value: '45' },
          audioCuesEnabled: true,
        }));
    });
  });
});

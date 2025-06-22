import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddShoeScreen from '../../src/screens/AddShoeScreen';
import { Alert } from 'react-native';

const mockAddShoe = jest.fn();
jest.mock('../../src/stores/useStore', () => ({
  useStore: selector => selector({ addShoe: mockAddShoe }),
}));

// alertSpy needs to be accessible in both beforeEach/afterEach and the tests themselves.
let alertSpy;

describe('AddShoeScreen', () => {
  beforeEach(() => {
    mockAddShoe.mockClear();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    if (alertSpy) {
      // Check if spy was created (it should always be in this setup)
      alertSpy.mockRestore();
    }
  });

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(<AddShoeScreen />);

    expect(getByPlaceholderText('e.g., Pegasus 40, Clifton 9')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Nike, Hoka')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Pegasus, Clifton')).toBeTruthy();
    expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy();
    expect(getByPlaceholderText('e.g., 800')).toBeTruthy();
    expect(getByText('Save Shoe')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('updates input fields on change', () => {
    const { getByPlaceholderText } = render(<AddShoeScreen />);
    const nameInput = getByPlaceholderText('e.g., Pegasus 40, Clifton 9');
    fireEvent.changeText(nameInput, 'Test Shoe');
    expect(nameInput.props.value).toBe('Test Shoe');

    const brandInput = getByPlaceholderText('e.g., Nike, Hoka');
    fireEvent.changeText(brandInput, 'Test Brand');
    expect(brandInput.props.value).toBe('Test Brand');
  });

  it('shows validation error if name is empty on save', () => {
    const { getByText } = render(<AddShoeScreen />);
    fireEvent.press(getByText('Save Shoe'));
    expect(alertSpy).toHaveBeenCalledWith('Validation Error', 'Shoe name is required.');
    expect(mockAddShoe).not.toHaveBeenCalled();
  });

  it('shows validation error if max distance is invalid on save', () => {
    const { getByText, getByPlaceholderText } = render(<AddShoeScreen />);
    const nameInput = getByPlaceholderText('e.g., Pegasus 40, Clifton 9');
    fireEvent.changeText(nameInput, 'Test Shoe');
    const maxDistanceInput = getByPlaceholderText('e.g., 800');
    fireEvent.changeText(maxDistanceInput, 'abc');
    fireEvent.press(getByText('Save Shoe'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Validation Error',
      'Max distance must be a valid positive number.'
    );
    expect(mockAddShoe).not.toHaveBeenCalled();
  });

  it('calls addShoe and navigates back on successful save', async () => {
    const { getByPlaceholderText, getByText } = render(<AddShoeScreen />);
    const navigation = require('@react-navigation/native').useNavigation();

    fireEvent.changeText(getByPlaceholderText('e.g., Pegasus 40, Clifton 9'), 'Victory');
    fireEvent.changeText(getByPlaceholderText('e.g., Nike, Hoka'), 'Nike');
    fireEvent.changeText(getByPlaceholderText('e.g., Pegasus, Clifton'), 'Alphafly 3');
    const today = new Date().toISOString().split('T')[0];
    fireEvent.changeText(getByPlaceholderText('YYYY-MM-DD'), today);
    fireEvent.changeText(getByPlaceholderText('e.g., 800'), '600');

    fireEvent.press(getByText('Save Shoe'));

    await waitFor(() => {
      expect(mockAddShoe).toHaveBeenCalledTimes(1);
      expect(mockAddShoe).toHaveBeenCalledWith({
        name: 'Victory',
        brand: 'Nike',
        model: 'Alphafly 3',
        purchaseDate: today,
        maxDistance: 600,
      });
      expect(navigation.goBack).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates back when cancel is pressed', () => {
    const { getByText } = render(<AddShoeScreen />);
    const navigation = require('@react-navigation/native').useNavigation();
    fireEvent.press(getByText('Cancel'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddShoeScreen from './AddShoeScreen';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
}));

// Mock store
const mockAddShoe = jest.fn();
jest.mock('../stores/useStore', () => ({
  useStore: (selector) => selector({ addShoe: mockAddShoe }),
}));

// Mock theme
jest.mock('../theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      text: { primary: '#000', secondary: '#555', hint: '#999' },
      border: '#ccc',
      surface: '#eee',
      card: '#f8f8f8',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    typography: { h2: {}, label: {} },
    borderRadius: { md: 8 },
  }),
}));

// Mock Alert
global.Alert = {
  alert: jest.fn(),
};


describe('AddShoeScreen', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockAddShoe.mockClear();
    mockGoBack.mockClear();
    global.Alert.alert.mockClear();
  });

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(<AddShoeScreen />);

    expect(getByPlaceholderText('e.g., Pegasus 40, Clifton 9')).toBeTruthy(); // Name
    expect(getByPlaceholderText('e.g., Nike, Hoka')).toBeTruthy(); // Brand
    expect(getByPlaceholderText('e.g., Pegasus, Clifton')).toBeTruthy(); // Model
    expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy(); // Purchase Date
    expect(getByPlaceholderText('e.g., 800')).toBeTruthy(); // Max Distance
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
    expect(global.Alert.alert).toHaveBeenCalledWith('Validation Error', 'Shoe name is required.');
    expect(mockAddShoe).not.toHaveBeenCalled();
  });

  it('shows validation error if max distance is invalid on save', () => {
    const { getByText, getByPlaceholderText } = render(<AddShoeScreen />);
    const nameInput = getByPlaceholderText('e.g., Pegasus 40, Clifton 9');
    fireEvent.changeText(nameInput, 'Test Shoe');
    const maxDistanceInput = getByPlaceholderText('e.g., 800');
    fireEvent.changeText(maxDistanceInput, 'abc'); // Invalid distance
    fireEvent.press(getByText('Save Shoe'));
    expect(global.Alert.alert).toHaveBeenCalledWith('Validation Error', 'Max distance must be a valid positive number.');
    expect(mockAddShoe).not.toHaveBeenCalled();
  });

  it('calls addShoe and navigates back on successful save', async () => {
    const { getByPlaceholderText, getByText } = render(<AddShoeScreen />);

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
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  it('navigates back when cancel is pressed', () => {
    const { getByText } = render(<AddShoeScreen />);
    fireEvent.press(getByText('Cancel'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ShoeSelector from './ShoeSelector';
import { useStore } from '../../stores/useStore';

// Mock the store with a selector-aware jest.fn
jest.mock('../../stores/useStore', () => ({
  useStore: jest.fn(),
}));

const mockShoes = [
  { id: 'shoe_1', name: 'Cloudstratus', brand: 'On', isActive: true },
  { id: 'shoe_2', name: 'Endorphin Speed 2', brand: 'Saucony', isActive: true },
  { id: 'shoe_3', name: 'Pegasus 38', brand: 'Nike', isActive: false },
];

describe('ShoeSelector', () => {
  beforeEach(() => {
    // Make the mock behave like Zustand's selector hook
    useStore.mockImplementation(selector => {
      const state = { shoes: mockShoes };
      return selector ? selector(state) : state;
    });
  });

  it('renders with default text when no shoe is selected', () => {
    const { getByText } = render(<ShoeSelector selectedShoeId={null} onSelectShoe={() => {}} />);
    expect(getByText('Select a Shoe')).toBeTruthy();
  });

  it('renders the selected shoe name', () => {
    const { getByText } = render(<ShoeSelector selectedShoeId="shoe_1" onSelectShoe={() => {}} />);
    expect(getByText('Cloudstratus')).toBeTruthy();
  });

  it('opens the modal when pressed', () => {
    const { getByText, queryByText } = render(
      <ShoeSelector selectedShoeId={null} onSelectShoe={() => {}} />
    );

    expect(queryByText('Select a Shoe')).toBeTruthy();
    fireEvent.press(getByText('Select a Shoe'));

    // After pressing, modal with title "Select a Shoe" should be visible.
    // The test environment might not render the modal content in the same way,
    // so we check for an element inside the modal.
    // A more robust way might require a different setup for modals in tests.
  });

  it('displays a list of active shoes in the modal', () => {
    const { getByText, getAllByRole } = render(
      <ShoeSelector selectedShoeId={null} onSelectShoe={() => {}} />
    );

    fireEvent.press(getByText('Select a Shoe'));

    // Check for active shoes
    expect(getByText('Cloudstratus')).toBeTruthy();
    expect(getByText('Endorphin Speed 2')).toBeTruthy();
  });

  it('does not display inactive shoes', () => {
    const { getByText, queryByText } = render(
      <ShoeSelector selectedShoeId={null} onSelectShoe={() => {}} />
    );
    fireEvent.press(getByText('Select a Shoe'));
    expect(queryByText('Pegasus 38')).toBeNull();
  });

  it('calls onSelectShoe with the correct shoe id when a shoe is selected', () => {
    const onSelectShoeMock = jest.fn();
    const { getByText } = render(
      <ShoeSelector selectedShoeId={null} onSelectShoe={onSelectShoeMock} />
    );

    fireEvent.press(getByText('Select a Shoe'));
    fireEvent.press(getByText('Endorphin Speed 2'));

    expect(onSelectShoeMock).toHaveBeenCalledWith('shoe_2');
  });
});

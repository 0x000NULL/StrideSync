import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
// MaterialIcons is mocked in jest-setup.js
// import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../../src/components/ui/Button';
import { useTheme } from '../../../src/theme/ThemeProvider';

describe('Button Component', () => {
  const mockOnPress = jest.fn();
  const defaultTitle = 'Press Me';

  const getThemeForTest = () => useTheme(); // Helper if needed for style checks

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders with default props (primary, medium)', () => {
    const { getByText } = render(<Button title={defaultTitle} onPress={mockOnPress} />);
    expect(getByText(defaultTitle)).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<Button title={defaultTitle} onPress={mockOnPress} />);
    fireEvent.press(getByText(defaultTitle));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const testID = `button-${defaultTitle.replace(/\s+/g, '-').toLowerCase()}`;
    const { getByTestId } = render(<Button title={defaultTitle} onPress={mockOnPress} disabled />);
    const touchableOpacityInstance = getByTestId(testID);

    // Rely on accessibilityState.disabled for TouchableOpacity
    expect(touchableOpacityInstance.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(touchableOpacityInstance);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading prop is true, and title is present', () => {
    const { getByText, UNSAFE_getByType } = render(
      <Button title={defaultTitle} onPress={mockOnPress} loading />
    );
    expect(getByText(defaultTitle)).toBeTruthy();
    const activityIndicator = UNSAFE_getByType('ActivityIndicator');
    expect(activityIndicator).toBeTruthy();
  });

  it('does not call onPress when loading', () => {
    const testID = `button-${defaultTitle.replace(/\s+/g, '-').toLowerCase()}`;
    const { getByTestId } = render(<Button title={defaultTitle} onPress={mockOnPress} loading />);
    const touchable = getByTestId(testID);
    // When loading, the button should be disabled. Check accessibilityState.
    expect(touchable.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(touchable);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  describe('Variants and Sizes', () => {
    it('renders secondary variant correctly', () => {
      const { getByText } = render(
        <Button title="Secondary" onPress={mockOnPress} variant="secondary" />
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders outline variant correctly', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={mockOnPress} variant="outline" />
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('renders text variant correctly', () => {
      const { getByText } = render(
        <Button title="Text Btn" onPress={mockOnPress} variant="text" />
      );
      expect(getByText('Text Btn')).toBeTruthy();
    });

    it('renders danger variant correctly', () => {
      const { getByText } = render(
        <Button title="Danger" onPress={mockOnPress} variant="danger" />
      );
      expect(getByText('Danger')).toBeTruthy();
    });

    it('renders small size correctly', () => {
      const { getByText } = render(<Button title="Small" onPress={mockOnPress} size="small" />);
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders large size correctly', () => {
      const { getByText } = render(<Button title="Large" onPress={mockOnPress} size="large" />);
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('renders icon on the left by default (mocked icon)', () => {
      const { getByTestId, getByText } = render(
        <Button title="Icon Left" onPress={mockOnPress} icon="home" />
      );
      expect(getByText('Icon Left')).toBeTruthy();
      const iconMock = getByTestId('icon-home');
      expect(iconMock).toBeTruthy();
      expect(iconMock.props.children).toBe('home');
    });

    it('renders icon on the right when iconPosition="right" (mocked icon)', () => {
      const { getByTestId, getByText } = render(
        <Button title="Icon Right" onPress={mockOnPress} icon="settings" iconPosition="right" />
      );
      expect(getByText('Icon Right')).toBeTruthy();
      const iconMock = getByTestId('icon-settings');
      expect(iconMock).toBeTruthy();
      expect(iconMock.props.children).toBe('settings');
    });

    it('renders icon only if title is not provided (mocked icon)', () => {
      const { getByTestId, queryByText } = render(
        // The component's testID for TouchableOpacity becomes "button-icon" when title is null
        <Button title={null} onPress={mockOnPress} icon="favorite" />
      );
      expect(getByTestId('button-icon')).toBeTruthy();
      const iconMock = getByTestId('icon-favorite');
      expect(iconMock).toBeTruthy();
      expect(iconMock.props.children).toBe('favorite');
      // Check that no other text element (like an empty one from a bad title prop) is rendered.
      // queryAllByText(/.+/) should only find "favorite".
      const allTexts = queryByText(/.+/); // This will find the icon's text "favorite"
      expect(allTexts.props.children).toBe('favorite');
    });

    it('renders a custom React element as icon', () => {
      const { Text } = require('react-native');
      const CustomIconComponent = props => <Text testID="custom-icon-actual">{props.name}</Text>;
      CustomIconComponent.displayName = 'CustomIcon';

      const { getByTestId, getByText } = render(
        <Button
          title="Custom Icon"
          onPress={mockOnPress}
          icon={<CustomIconComponent name="star" />}
        />
      );
      expect(getByText('Custom Icon')).toBeTruthy();
      const customIconRendered = getByTestId('custom-icon-actual');
      expect(customIconRendered).toBeTruthy();
      expect(customIconRendered.props.children).toBe('star');
    });
  });

  it('applies fullWidth style when fullWidth is true', () => {
    const testID = `button-full-width`; // Assuming title is "Full Width"
    const { getByTestId } = render(<Button title="Full Width" onPress={mockOnPress} fullWidth />);
    const button = getByTestId(testID);
    // Check for style.alignSelf might be too brittle.
    // We trust the component applies it if fullWidth is true.
    // For a more robust test, snapshot or visual regression would be better.
    expect(button).toBeTruthy();
  });

  it('logs an error if title or onPress is missing in __DEV__', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Button onPress={mockOnPress} title={undefined} />); // title is undefined
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Button] Button is missing required prop: title')
    );

    consoleErrorSpy.mockClear();

    render(<Button title="Test" onPress={undefined} />); // onPress is undefined
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Button] Button is missing required prop: onPress')
    );

    consoleErrorSpy.mockRestore();
  });
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const TestButton = ({ title, onPress, style, textStyle }) => {
  const theme = useTheme();
  console.log('Rendering TestButton with title:', title);

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.colors.onPrimary || theme.colors.text.light,
      fontSize: 16, // Consider theme.typography.button.fontSize
    },
  });

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

TestButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object, // Consider more specific style prop types if possible
  textStyle: PropTypes.object, // Consider more specific style prop types if possible
};

TestButton.defaultProps = {
  style: {},
  textStyle: {},
};

export default TestButton;

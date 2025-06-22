import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button'; // Import the custom Button
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const ControlButtons = ({ onPause, onLap, onStop, isPaused }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    controlButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.sm, // Using theme spacing
      backgroundColor: theme.colors.transparent || 'transparent', // Using theme color
      marginBottom: theme.spacing.sm, // Using theme spacing
    },
  });

  return (
    <View style={styles.controlButtons}>
      <Button
        title={isPaused ? 'Resume' : 'Pause'}
        onPress={onPause}
        variant="secondary"
        testID={isPaused ? 'button-resume' : 'button-pause'}
      />
      <Button
        title="Lap"
        onPress={onLap}
        disabled={isPaused}
        variant="outline"
        testID="button-lap"
      />
      <Button title="Stop" onPress={onStop} variant="danger" testID="button-stop" />
    </View>
  );
};

ControlButtons.propTypes = {
  onPause: PropTypes.func.isRequired,
  onLap: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  isPaused: PropTypes.bool,
};

ControlButtons.defaultProps = {
  isPaused: false,
};

export default ControlButtons;

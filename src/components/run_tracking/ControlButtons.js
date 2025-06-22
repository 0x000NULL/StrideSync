import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button'; // Import the custom Button
import PropTypes from 'prop-types';

const ControlButtons = ({ onPause, onLap, onStop, isPaused }) => (
  <View style={styles.controlButtons}>
    <Button
      title={isPaused ? 'Resume' : 'Pause'}
      onPress={onPause}
      variant="secondary"
      testID={isPaused ? 'button-resume' : 'button-pause'}
    />
    <Button title="Lap" onPress={onLap} disabled={isPaused} variant="outline" testID="button-lap" />
    <Button title="Stop" onPress={onStop} variant="danger" testID="button-stop" />
  </View>
);

const styles = StyleSheet.create({
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'transparent', // No longer need a background color here
    marginBottom: 10,
  },
});

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

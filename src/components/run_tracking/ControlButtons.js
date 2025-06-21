import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../ui/Button'; // Import the custom Button

const ControlButtons = ({ onPause, onLap, onStop, isPaused }) => (
    <View style={styles.controlButtons}>
      <Button 
        title={isPaused ? "Resume" : "Pause"} 
        onPress={onPause}
        variant="secondary"
      />
      <Button 
        title="Lap" 
        onPress={onLap} 
        disabled={isPaused}
        variant="outline"
      />
      <Button 
        title="Stop" 
        onPress={onStop} 
        variant="danger"
      />
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

export default ControlButtons; 
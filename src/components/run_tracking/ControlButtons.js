import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const ControlButtons = ({ onPause, onLap, onStop, isPaused }) => (
    <View style={styles.controlButtons}>
      <Button title={isPaused ? "Resume" : "Pause"} onPress={onPause} />
      <Button title="Lap" onPress={onLap} disabled={isPaused} />
      <Button title="Stop" onPress={onStop} color="red" />
    </View>
);

const styles = StyleSheet.create({
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
});

export default ControlButtons; 
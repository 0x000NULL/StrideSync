import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../utils/formatters';

const StatsDisplay = ({ distance, duration, pace }) => (
    <View style={styles.statsDisplay}>
      <Text style={styles.statText}>Distance: {distance.toFixed(2)} km</Text>
      <Text style={styles.statText}>Duration: {formatDuration(duration)}</Text>
      <Text style={styles.statText}>Pace: {pace ? `${pace.minutes.toFixed(0).padStart(2, '0')}:${pace.seconds.toFixed(0).padStart(2, '0')} min/km` : '--:-- min/km'}</Text>
    </View>
);

const styles = StyleSheet.create({
    statsDisplay: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        alignItems: 'center',
    },
    statText: {
        fontSize: 18,
        marginBottom: 5,
    },
});

export default StatsDisplay; 
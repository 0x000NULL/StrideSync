import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../utils/formatters';
import { useTheme } from '@react-navigation/native';

const StatsDisplay = ({ distance, duration, pace }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.statsDisplay, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statText, { color: colors.text.primary }]}>Distance: {distance.toFixed(2)} km</Text>
          <Text style={[styles.statText, { color: colors.text.primary }]}>Duration: {formatDuration(duration)}</Text>
          <Text style={[styles.statText, { color: colors.text.secondary }]}>Pace: {pace ? `${pace.minutes.toFixed(0).padStart(2, '0')}:${pace.seconds.toFixed(0).padStart(2, '0')} min/km` : '--:-- min/km'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    statsDisplay: {
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    statText: {
        fontSize: 18,
        marginBottom: 5,
    },
});

export default StatsDisplay; 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../utils/formatters';
import { useTheme } from '@react-navigation/native';

const StatsDisplay = ({ distance = 0, duration = 0 }) => {
  const { colors } = useTheme();

  // Pace in minutes per km
  const pace = distance > 0 ? duration / 60 / distance : null;
  const paceText = pace ? `${pace.toFixed(2)} min/km` : '--:-- min/km';

  return (
    <View style={[styles.statsDisplay, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statText, { color: colors.text.primary }]}>
        Distance: {distance.toFixed(2)} km
      </Text>
      <Text style={[styles.statText, { color: colors.text.primary }]}>
        Duration: {formatDuration(duration)}
      </Text>
      <Text style={[styles.statText, { color: colors.text.secondary }]}>Pace: {paceText}</Text>
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

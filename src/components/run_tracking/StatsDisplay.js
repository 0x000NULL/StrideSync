import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../utils/formatters';
import { useTheme } from '@react-navigation/native';
import { useUnits } from '../../hooks/useUnits'; // Import useUnits

const StatsDisplay = ({ distance = 0, duration = 0 }) => { // distance is always in km
  const { colors } = useTheme();
  const { formatDistance, distanceUnit, fromKilometers } = useUnits();

  const displayDistance = formatDistance(distance); // Formats based on user's unit preference

  let paceText = '--:--';
  const currentDistanceUnitLabel = distanceUnit === 'mi' ? 'min/mi' : 'min/km';

  if (distance > 0 && duration > 0) {
    let distanceForPaceCalc = distance; // km
    if (distanceUnit === 'mi') {
      distanceForPaceCalc = fromKilometers(distance, 'mi'); // Convert to miles for pace calculation
    }

    if (distanceForPaceCalc > 0) { // Avoid division by zero if conversion results in very small number rounding to 0
        const pace = duration / 60 / distanceForPaceCalc; // pace in minutes per preferred unit
        const paceMinutes = Math.floor(pace);
        const paceSeconds = Math.round((pace - paceMinutes) * 60);
        paceText = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    }
  }
  paceText = `${paceText} ${currentDistanceUnitLabel}`;


  return (
    <View style={[styles.statsDisplay, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statText, { color: colors.text.primary }]}>
        Distance: {displayDistance.formatted}
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

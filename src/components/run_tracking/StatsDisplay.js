import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDuration } from '../../utils/formatters';
import { useTheme } from '@react-navigation/native';
import { useUnits } from '../../hooks/useUnits'; // Import useUnits
import PropTypes from 'prop-types';

const StatsDisplay = ({ distance = 0, duration = 0, heartRate = null }) => {
  // distance is always in km
  const { colors } = useTheme();
  const { formatDistance, distanceUnit, fromKilometers } = useUnits();

  const displayDistance = formatDistance(distance); // Formats based on user's unit preference

  let paceText = '--';
  const currentDistanceUnitLabel = distanceUnit === 'mi' ? 'min/mi' : 'min/km';

  if (distance > 0 && duration > 0) {
    let distanceForPaceCalc = distance; // km
    if (distanceUnit === 'mi') {
      distanceForPaceCalc = fromKilometers(distance, 'mi'); // Convert to miles for pace calculation
    }

    if (distanceForPaceCalc > 0) {
      const pace = duration / 60 / distanceForPaceCalc;
      paceText = pace.toFixed(2); // two-decimal minutes per unit (e.g., "1.11")
    }
  }

  paceText = `${paceText} ${currentDistanceUnitLabel}`;

  return (
    <View style={[styles.statsDisplay, { backgroundColor: colors.surface }]}>
      <View style={styles.statRow}>
        <View style={styles.stat} testID="distance-stat">
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Distance</Text>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {displayDistance.formatted}
          </Text>
        </View>
        <View style={styles.stat} testID="duration-stat">
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Duration</Text>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>
      <View style={styles.statRow}>
        <View style={styles.stat} testID="pace-stat">
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Pace</Text>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{paceText}</Text>
        </View>
        {heartRate !== null && (
          <View style={styles.stat} testID="heart-rate-stat">
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Heart Rate</Text>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {Math.round(heartRate)} BPM
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsDisplay: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

StatsDisplay.propTypes = {
  distance: PropTypes.number,
  duration: PropTypes.number,
  heartRate: PropTypes.number,
};

StatsDisplay.defaultProps = {
  distance: 0,
  duration: 0,
  heartRate: null,
};

export default StatsDisplay;

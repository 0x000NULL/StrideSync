import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button'; // Assuming a segmented control or button group for type
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const GoalInput = ({ goal, onGoalChange }) => {
  const theme = useTheme();
  const goalTypes = ['open', 'distance', 'time'];

  const styles = StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 16, // Consider theme.typography.subtitle1.fontSize
      fontWeight: '600', // Consider theme.typography.subtitle1.fontWeight
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary, // Using theme color
    },
    typeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    button: {
      flex: 1,
      marginHorizontal: theme.spacing.xxs,
    },
    inputContainer: {
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Goal</Text>
      <View style={styles.typeSelector}>
        {goalTypes.map(type => (
          <Button
            key={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            onPress={() => onGoalChange({ ...goal, type })}
            variant={goal.type === type ? 'primary' : 'outline'} // Changed 'type' prop to 'variant' for Button
            style={styles.button}
          />
        ))}
      </View>
      <Input
        label={
          goal.type === 'distance'
            ? 'Distance (km)' // Consider using distanceUnit from useUnits
            : goal.type === 'time'
              ? 'Time (minutes)'
              : 'Goal Value'
        }
        placeholder={
          goal.type === 'distance'
            ? `Distance (${theme.distanceUnit || 'km'})` // Using theme or default unit
            : goal.type === 'time'
              ? 'Time (minutes)'
              : 'Type (e.g., distance, time)'
        }
        value={goal.value}
        onChangeText={text => onGoalChange({ ...goal, value: text })}
        keyboardType="numeric"
        containerStyle={styles.inputContainer}
        editable={goal.type !== 'open'}
      />
    </Card>
  );
};

GoalInput.propTypes = {
  goal: PropTypes.shape({
    type: PropTypes.oneOf(['open', 'distance', 'time']).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onGoalChange: PropTypes.func.isRequired,
};

export default GoalInput;

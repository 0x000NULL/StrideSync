import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button'; // Assuming a segmented control or button group for type
import PropTypes from 'prop-types';

const GoalInput = ({ goal, onGoalChange }) => {
  const goalTypes = ['open', 'distance', 'time'];

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Goal</Text>
      <View style={styles.typeSelector}>
        {goalTypes.map(type => (
          <Button
            key={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            onPress={() => onGoalChange({ ...goal, type })}
            type={goal.type === type ? 'primary' : 'outline'}
            style={styles.button}
          />
        ))}
      </View>
      <Input
        label={
          goal.type === 'distance'
            ? 'Distance (km)'
            : goal.type === 'time'
              ? 'Time (minutes)'
              : 'Goal Value'
        }
        placeholder={
          goal.type === 'distance'
            ? 'Distance (km)'
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

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 2,
  },
  inputContainer: {
    marginTop: 10,
  },
});

GoalInput.propTypes = {
  goal: PropTypes.shape({
    type: PropTypes.oneOf(['open', 'distance', 'time']).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onGoalChange: PropTypes.func.isRequired,
};

export default GoalInput;

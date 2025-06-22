import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const WeatherSelector = ({ weather, onWeatherChange }) => {
  const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Snowy'];

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Weather Condition</Text>
      <View style={styles.buttonGroup}>
        {weatherOptions.map(w => (
          <Pressable
            key={w}
            style={[styles.button, weather === w && styles.selectedButton]}
            onPress={() => onWeatherChange(w)}
          >
            <Text style={[styles.buttonText, weather === w && styles.selectedButtonText]}>{w}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: 'dodgerblue',
    borderColor: 'dodgerblue',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

WeatherSelector.propTypes = {
  weather: PropTypes.string.isRequired,
  onWeatherChange: PropTypes.func.isRequired,
};

export default WeatherSelector;

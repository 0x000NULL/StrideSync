import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const EffortMoodSelector = ({ effort, mood, onEffortChange, onMoodChange }) => {
  const theme = useTheme();
  const effortOptions = [1, 2, 3, 4, 5];
  const moodOptions = ['Great', 'Good', 'Okay', 'Bad'];

  const styles = StyleSheet.create({
    formSection: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      elevation: 1, // Consider platform-specific shadow or remove if not essential
    },
    sectionTitle: {
      fontSize: 18, // Consider theme.typography.h6.fontSize
      fontWeight: '600', // Consider theme.typography.h6.fontWeight
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary, // Added color
    },
    label: {
      fontSize: 14, // Consider theme.typography.subtitle2.fontSize
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    button: {
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    effortButton: {
      width: '18%', // 5 buttons
    },
    moodButton: {
      width: '23%', // 4 buttons
    },
    selectedEffortButton: {
      // Assuming 'coral' maps to 'error' for 'Hard' effort
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
    selectedMoodButton: {
      // Assuming 'limegreen' maps to 'success' for 'Great/Good' mood
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    buttonText: {
      fontSize: 14, // Consider theme.typography.button.fontSize
      color: theme.colors.text.primary,
    },
    selectedButtonText: {
      color: theme.colors.text.light, // Or theme.colors.onError / theme.colors.onSuccess
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Effort & Mood</Text>

      <Text style={styles.label}>Effort (1 = Easy, 5 = Max)</Text>
      <View style={styles.buttonGroup}>
        {effortOptions.map(e => (
          <Pressable
            key={e}
            style={[
              styles.button,
              styles.effortButton,
              effort === e && styles.selectedEffortButton,
            ]}
            onPress={() => onEffortChange(e)}
          >
            <Text style={[styles.buttonText, effort === e && styles.selectedButtonText]}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Mood</Text>
      <View style={styles.buttonGroup}>
        {moodOptions.map(m => (
          <Pressable
            key={m}
            style={[styles.button, styles.moodButton, mood === m && styles.selectedMoodButton]}
            onPress={() => onMoodChange(m)}
          >
            <Text style={[styles.buttonText, mood === m && styles.selectedButtonText]}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

EffortMoodSelector.propTypes = {
  effort: PropTypes.number.isRequired,
  mood: PropTypes.string.isRequired,
  onEffortChange: PropTypes.func.isRequired,
  onMoodChange: PropTypes.func.isRequired,
};

export default EffortMoodSelector;

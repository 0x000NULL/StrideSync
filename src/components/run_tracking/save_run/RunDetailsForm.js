import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const RunDetailsForm = ({ name, notes, onNameChange, onNotesChange }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    formSection: {
      backgroundColor: theme.colors.card,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 18, // Consider theme.typography.h6.fontSize
      fontWeight: '600', // Consider theme.typography.h6.fontWeight
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary, // Added color
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface, // Or theme.colors.background
      color: theme.colors.text.primary, // Added text color for input
    },
  });

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Run Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Run Name (e.g., Morning Jog)"
        placeholderTextColor={theme.colors.text.secondary} // Added placeholder text color
        value={name}
        onChangeText={onNameChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes"
        placeholderTextColor={theme.colors.text.secondary} // Added placeholder text color
        value={notes}
        onChangeText={onNotesChange}
        multiline
        numberOfLines={3}
      />
    </View>
  );
};

RunDetailsForm.propTypes = {
  name: PropTypes.string,
  notes: PropTypes.string,
  onNameChange: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
};

RunDetailsForm.defaultProps = {
  name: '',
  notes: '',
};

export default RunDetailsForm;

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const AudioCuesToggle = ({ audioCuesEnabled, onToggleAudioCues }) => {
  const theme = useTheme(); // Added useTheme hook

  // Styles need to be created inside the component or passed theme
  const styles = StyleSheet.create({
    card: {
      padding: theme.spacing.md, // Using theme spacing
      marginBottom: theme.spacing.md, // Using theme spacing
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 16, // Consider theme.typography.subtitle1.fontSize or similar
      fontWeight: '600', // Consider theme.typography.subtitle1.fontWeight or similar
      color: theme.colors.text.primary, // Using theme color
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Text style={styles.label}>Audio Cues</Text>
        <Switch
          value={audioCuesEnabled}
          onValueChange={onToggleAudioCues}
          trackColor={{ false: theme.colors.disabled, true: theme.colors.primaryLight }} // Using theme colors
          thumbColor={audioCuesEnabled ? theme.colors.primary : theme.colors.surface} // Using theme colors
        />
      </View>
    </Card>
  );
};

AudioCuesToggle.propTypes = {
  audioCuesEnabled: PropTypes.bool.isRequired,
  onToggleAudioCues: PropTypes.func.isRequired,
};

export default AudioCuesToggle;

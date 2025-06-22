import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

const RunTypeSelector = ({ runType, onSelectRunType }) => {
  const theme = useTheme();

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
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    button: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Run Type</Text>
      <View style={styles.buttonGroup}>
        <Button
          title="Outdoor"
          onPress={() => onSelectRunType('outdoor')}
          variant={runType === 'outdoor' ? 'primary' : 'outline'} // Changed 'type' prop to 'variant'
          style={styles.button}
        />
        <Button
          title="Indoor"
          onPress={() => onSelectRunType('indoor')}
          variant={runType === 'indoor' ? 'primary' : 'outline'} // Changed 'type' prop to 'variant'
          style={styles.button}
        />
      </View>
    </Card>
  );
};

RunTypeSelector.propTypes = {
  runType: PropTypes.oneOf(['outdoor', 'indoor']).isRequired,
  onSelectRunType: PropTypes.func.isRequired,
};

export default RunTypeSelector;

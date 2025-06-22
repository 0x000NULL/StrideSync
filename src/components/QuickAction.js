import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import PropTypes from 'prop-types';

const QuickAction = ({ icon, label, onPress, color }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal: theme.spacing.sm,
      width: 80,
    },
    button: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: color ? `${color}20` : `${theme.colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.button, { borderColor: color || theme.colors.primary }]}>
        {React.cloneElement(icon, {
          size: 24,
          color: color || theme.colors.primary,
        })}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

QuickAction.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  color: PropTypes.string,
};

QuickAction.defaultProps = {
  onPress: () => {},
  color: undefined,
};

export default QuickAction;

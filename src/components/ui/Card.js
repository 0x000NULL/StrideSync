import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import PropTypes from 'prop-types';

const Card = ({ children, onPress, style }) => {
  const theme = useTheme();

  const cardStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: theme.spacing.md,
    },
    pressable: {
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
  });

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[cardStyles.pressable, style]} activeOpacity={0.7}>
        <View style={cardStyles.container}>{children}</View>
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyles.container, style]}>{children}</View>;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Card.defaultProps = {
  onPress: undefined,
  style: {},
};

export default Card;

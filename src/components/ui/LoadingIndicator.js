import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

const LoadingIndicator = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: fullScreen ? 1 : undefined,
      justifyContent: 'center',
      alignItems: 'center',
      padding: fullScreen ? theme.spacing.xl : theme.spacing.md,
      ...(fullScreen && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background,
        zIndex: 1000,
      }),
    },
    text: {
      ...theme.typography.body,
      color: color || theme.colors.text.secondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
      ...textStyle,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color || theme.colors.primary} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

export default LoadingIndicator;

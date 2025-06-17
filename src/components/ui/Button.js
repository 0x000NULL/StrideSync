import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  ...rest
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: theme.colors.secondary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.text.light,
          },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'text':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingHorizontal: 0,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: theme.colors.error,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.text.light,
          },
        };
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.text.light,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.sm,
          },
          text: {
            ...theme.typography.body,
            fontSize: 14,
          },
        };
      case 'large':
        return {
          button: {
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.lg,
          },
          text: {
            ...theme.typography.h3,
          },
        };
      case 'medium':
      default:
        return {
          button: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
          },
          text: {
            ...theme.typography.body,
            fontWeight: '600',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isIconOnly = !title && !!icon;

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { alignSelf: 'stretch' }),
      ...variantStyles.button,
      ...sizeStyles.button,
    },
    text: {
      textAlign: 'center',
      ...variantStyles.text,
      ...sizeStyles.text,
    },
    iconLeft: {
      marginRight: theme.spacing.sm,
    },
    iconRight: {
      marginLeft: theme.spacing.sm,
    },
    iconOnly: {
      padding: theme.spacing.sm,
    },
    loadingContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconSize = size === 'large' ? 24 : size === 'small' ? 16 : 20;
    const iconColor = variantStyles.text?.color || theme.colors.text.light;
    
    return React.cloneElement(icon, {
      size: iconSize,
      color: iconColor,
      style: [
        iconPosition === 'left' && styles.iconLeft,
        iconPosition === 'right' && styles.iconRight,
        isIconOnly && { margin: 0 },
      ],
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        isIconOnly && styles.iconOnly,
        style,
      ]}
      {...rest}
    >
      {!loading && iconPosition === 'left' && renderIcon()}
      {title && <Text style={[styles.text, textStyle]}>{title}</Text>}
      {!loading && iconPosition === 'right' && renderIcon()}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'large'} 
            color={variantStyles.text?.color || theme.colors.text.light}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;

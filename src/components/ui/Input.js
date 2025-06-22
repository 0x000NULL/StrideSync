import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';

const Input = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      error = null,
      helperText = null,
      disabled = false,
      multiline = false,
      numberOfLines = 1,
      leftIcon = null,
      rightIcon = null,
      onRightIconPress,
      inputStyle,
      containerStyle,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();

    const isPassword = secureTextEntry && !showPassword;
    const hasError = !!error;
    const isDisabled = disabled;

    const styles = StyleSheet.create({
      container: {
        marginBottom: theme.spacing.md,
        ...containerStyle,
      },
      label: {
        ...theme.typography.body,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        fontWeight: '500',
        opacity: isDisabled ? 0.7 : 1,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: hasError
          ? theme.colors.error
          : isFocused
            ? theme.colors.primary
            : theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
      },
      input: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text.primary,
        padding: 0,
        margin: 0,
        textAlignVertical: multiline ? 'top' : 'center',
        minHeight: multiline ? 24 * (numberOfLines || 1) : undefined,
        opacity: isDisabled ? 0.7 : 1,
      },
      leftIconContainer: {
        marginRight: theme.spacing.sm,
        justifyContent: 'center',
        paddingTop: multiline ? theme.spacing.sm : 0,
      },
      rightIconContainer: {
        marginLeft: theme.spacing.sm,
        justifyContent: 'center',
        paddingTop: multiline ? theme.spacing.sm : 0,
      },
      errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
      },
      helperText: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
      },
      icon: {
        color: hasError
          ? theme.colors.error
          : isFocused
            ? theme.colors.primary
            : theme.colors.text.secondary,
      },
    });

    const renderIcon = (icon, position) => {
      if (!icon) return null;

      const iconSize = 20;
      const containerStyle =
        position === 'left' ? styles.leftIconContainer : styles.rightIconContainer;

      return (
        <View style={containerStyle}>
          {React.cloneElement(icon, {
            size: iconSize,
            style: [styles.icon, icon.props.style],
          })}
        </View>
      );
    };

    const renderRightIcon = () => {
      if (secureTextEntry) {
        return (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconContainer}
            disabled={isDisabled}
          >
            <MaterialIcons
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              style={styles.icon}
            />
          </TouchableOpacity>
        );
      }

      if (rightIcon) {
        if (onRightIconPress) {
          return (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconContainer}
              disabled={isDisabled}
            >
              {React.cloneElement(rightIcon, {
                size: 20,
                style: styles.icon,
              })}
            </TouchableOpacity>
          );
        }
        return renderIcon(rightIcon, 'right');
      }

      return null;
    };

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputContainer}>
          {renderIcon(leftIcon, 'left')}
          <RNTextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.secondary}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isPassword}
            editable={!isDisabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            {...rest}
          />
          {renderRightIcon()}
        </View>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

export default Input;

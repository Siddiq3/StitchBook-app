/**
 * Production-ready Input Component
 * Supports validation, multiple states, and accessibility
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BRAND_COLORS,
  COMPONENT_SIZES,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../../utils/designSystem';

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  errorText,
  helperText,
  icon,
  iconRight,
  onIconPress,
  required = false,
  disabled = false,
  loading = false,
  secureTextEntry = false,
  maxLength,
  size = 'md',
  variant = 'default',
  clearable = false,
  onClear,
  testID,
  ...textInputProps
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const sizeConfig = COMPONENT_SIZES.input[size] || COMPONENT_SIZES.input.md;

  const borderColor = error
    ? BRAND_COLORS.danger
    : isFocused
    ? BRAND_COLORS.accent
    : BRAND_COLORS.border;

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            TEXT_STYLES.labelMedium,
            {
              color: disabled ? BRAND_COLORS.textMuted : BRAND_COLORS.text,
              marginBottom: SPACING.sm,
            },
          ]}
        >
          {label}
          {required && <Text style={{ color: BRAND_COLORS.danger }}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            height: sizeConfig.height,
            borderColor,
            backgroundColor: disabled ? BRAND_COLORS.lightBg : BRAND_COLORS.white,
            borderWidth: isFocused || error ? 1.5 : 1,
            opacity: disabled ? 0.6 : 1,
          },
          error && styles.errorBorder,
        ]}
      >
        {icon && !iconRight && (
          <MaterialCommunityIcons
            name={icon}
            size={COMPONENT_SIZES.icon.md}
            color={isFocused ? BRAND_COLORS.accent : BRAND_COLORS.textMuted}
            style={{ marginHorizontal: SPACING.md }}
          />
        )}

        <TextInput
          {...textInputProps}
          testID={testID}
          style={[
            styles.input,
            TEXT_STYLES.bodyMedium,
            {
              flex: 1,
              color: BRAND_COLORS.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={BRAND_COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !showPassword}
          maxLength={maxLength}
          editable={!disabled && !loading}
          selectionColor={BRAND_COLORS.accent}
        />

        {maxLength && (
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: BRAND_COLORS.textMuted,
                marginRight: SPACING.md,
              },
            ]}
          >
            {value?.length || 0}/{maxLength}
          </Text>
        )}

        {loading && (
          <ActivityIndicator
            color={BRAND_COLORS.accent}
            size="small"
            style={{ marginHorizontal: SPACING.md }}
          />
        )}

        {clearable && value && !loading && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={10}
            style={{ marginHorizontal: SPACING.md }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={COMPONENT_SIZES.icon.md}
              color={BRAND_COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {secureTextEntry && !clearable && !loading && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
            style={{ marginHorizontal: SPACING.md }}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye' : 'eye-off'}
              size={COMPONENT_SIZES.icon.md}
              color={BRAND_COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {iconRight && !secureTextEntry && !loading && !clearable && (
          <TouchableOpacity
            onPress={onIconPress}
            hitSlop={10}
            style={{ marginHorizontal: SPACING.md }}
            disabled={!onIconPress}
          >
            <MaterialCommunityIcons
              name={iconRight}
              size={COMPONENT_SIZES.icon.md}
              color={
                onIconPress ? BRAND_COLORS.accent : BRAND_COLORS.textMuted
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {error && errorText && (
        <View style={{ marginTop: SPACING.xs, flexDirection: 'row' }}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={14}
            color={BRAND_COLORS.danger}
            style={{ marginRight: SPACING.xs }}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: BRAND_COLORS.danger,
              },
            ]}
          >
            {errorText}
          </Text>
        </View>
      )}

      {!error && helperText && (
        <Text
          style={[
            TEXT_STYLES.caption,
            {
              color: BRAND_COLORS.textMuted,
              marginTop: SPACING.xs,
            },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: BRAND_COLORS.white,
    ...SHADOWS.xs,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  errorBorder: {
    borderColor: BRAND_COLORS.danger,
  },
});

export default Input;

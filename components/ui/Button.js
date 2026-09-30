/**
 * Production-ready Button Component
 * Supports multiple variants, sizes, states, and accessibility
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, COMPONENT_SIZES, TEXT_STYLES, SPACING, RADIUS, SHADOWS, ANIMATIONS } from '../../utils/designSystem';

const BUTTON_VARIANTS = {
  primary: {
    bg: BRAND_COLORS.accent,
    text: BRAND_COLORS.white,
    border: 'transparent',
    pressedBg: '#9F703A',
    disabledBg: BRAND_COLORS.border,
  },
  secondary: {
    bg: BRAND_COLORS.lightBg,
    text: BRAND_COLORS.primary,
    border: BRAND_COLORS.border,
    pressedBg: BRAND_COLORS.borderStrong,
    disabledBg: BRAND_COLORS.lightBg,
  },
  ghost: {
    bg: 'transparent',
    text: BRAND_COLORS.accent,
    border: 'transparent',
    pressedBg: BRAND_COLORS.overlayTint,
    disabledBg: 'transparent',
  },
  danger: {
    bg: BRAND_COLORS.danger,
    text: BRAND_COLORS.white,
    border: 'transparent',
    pressedBg: '#8F4F3B',
    disabledBg: BRAND_COLORS.border,
  },
  success: {
    bg: BRAND_COLORS.success,
    text: BRAND_COLORS.white,
    border: 'transparent',
    pressedBg: '#5B6F5E',
    disabledBg: BRAND_COLORS.border,
  },
};

function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight = false,
  style,
  textStyle,
  testID,
  hitSlop = 12,
  ...props
}) {
  const [isPressed, setIsPressed] = React.useState(false);
  const colors = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const sizeConfig = COMPONENT_SIZES.button[size] || COMPONENT_SIZES.button.md;
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      hitSlop={hitSlop}
      testID={testID}
      style={[
        styles.button,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          backgroundColor: isPressed && !isDisabled ? colors.pressedBg : colors.bg,
          borderColor: colors.border,
          borderWidth: colors.border === 'transparent' ? 0 : 1.5,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={colors.text}
            size={size === 'sm' ? 'small' : 'small'}
            style={styles.loader}
          />
        ) : (
          <>
            {icon && !iconRight && (
              <MaterialCommunityIcons
                name={icon}
                size={COMPONENT_SIZES.icon.sm}
                color={colors.text}
                style={{ marginRight: title ? SPACING.sm : 0 }}
              />
            )}
            {title && (
              <Text
                style={[
                  TEXT_STYLES.labelMedium,
                  {
                    color: colors.text,
                    fontWeight: '600',
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
            {icon && iconRight && (
              <MaterialCommunityIcons
                name={icon}
                size={COMPONENT_SIZES.icon.sm}
                color={colors.text}
                style={{ marginLeft: title ? SPACING.sm : 0 }}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginRight: SPACING.sm,
  },
});

export default Button;

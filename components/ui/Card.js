/**
 * Production-ready Card Component
 * Versatile container for content with multiple variants and states
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  BRAND_COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../../utils/designSystem';

function Card({
  children,
  onPress,
  variant = 'default',
  padding = SPACING.lg,
  style,
  testID,
  disabled = false,
  interactive = true,
  separator = false,
  ...props
}) {
  const variants = {
    default: {
      bg: BRAND_COLORS.white,
      border: BRAND_COLORS.divider,
      borderWidth: 1,
      shadow: SHADOWS.xs,
    },
    elevated: {
      bg: BRAND_COLORS.white,
      border: 'transparent',
      borderWidth: 0,
      shadow: SHADOWS.md,
    },
    outlined: {
      bg: BRAND_COLORS.white,
      border: BRAND_COLORS.divider,
      borderWidth: 1,
      shadow: SHADOWS.none,
    },
    subtle: {
      bg: BRAND_COLORS.lightBg,
      border: 'transparent',
      borderWidth: 0,
      shadow: SHADOWS.none,
    },
    success: {
      bg: BRAND_COLORS.successLight,
      border: BRAND_COLORS.success,
      borderWidth: 1,
      shadow: SHADOWS.xs,
    },
    warning: {
      bg: BRAND_COLORS.warningLight,
      border: BRAND_COLORS.warning,
      borderWidth: 1,
      shadow: SHADOWS.xs,
    },
    danger: {
      bg: BRAND_COLORS.dangerLight,
      border: BRAND_COLORS.danger,
      borderWidth: 1,
      shadow: SHADOWS.xs,
    },
  };

  const variantStyle = variants[variant] || variants.default;

  const cardStyle = [
    styles.card,
    {
      padding,
      backgroundColor: variantStyle.bg,
      borderColor: variantStyle.border,
      borderWidth: variantStyle.borderWidth,
      opacity: disabled ? 0.6 : 1,
      ...variantStyle.shadow,
    },
    style,
  ];

  const content = (
    <View style={cardStyle} testID={testID} {...props}>
      {children}
    </View>
  );

  if (onPress && interactive && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
});

export default Card;

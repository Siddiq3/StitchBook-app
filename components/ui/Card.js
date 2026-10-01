import React from 'react';
import { Pressable } from 'react-native';
import AppCard from '../AppCard';
import { colors123, spacing } from '../../utils/theme';
export default function Card({ children, onPress, variant = 'default', padding = spacing.md, style, testID, disabled = false, interactive = true, separator, ...props }) {
  const tint = { success: colors123.successLight, warning: colors123.warningLight, danger: colors123.dangerLight }[variant];
  const content = <AppCard {...props} testID={testID} padded={false} variant={variant === 'subtle' ? 'muted' : 'default'} style={[{ padding, marginBottom: spacing.md }, tint && { backgroundColor: tint }, disabled && { opacity: 0.5 }, style]}>{children}</AppCard>;
  return onPress && interactive ? <Pressable disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.8 }}>{content}</Pressable> : content;
}

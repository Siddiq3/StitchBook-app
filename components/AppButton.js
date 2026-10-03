import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, fonts, radius, spacing } from "../utils/theme";

export default function AppButton({
  label, title, onPress, icon, variant = "primary", size = "md", style, textStyle,
  loading = false, disabled = false, accessibilityLabel, ...props
}) {
  const unavailable = disabled || loading;
  const buttonLabel = label ?? title ?? "";
  const palette = {
    primary: { bg: colors123.primary, border: colors123.primary, text: colors123.surface },
    accent: { bg: colors123.primary, border: colors123.primary, text: colors123.surface },
    secondary: { bg: colors123.surface, border: colors123.borderStrong, text: colors123.textSecondary },
    ghost: { bg: colors123.primarySoft, border: colors123.primarySoft, text: colors123.primary },
    tertiary: { bg: "transparent", border: "transparent", text: colors123.primary },
    danger: { bg: colors123.dangerSoft, border: colors123.dangerSoft, text: colors123.danger },
  }[variant] || { bg: colors123.primary, border: colors123.primary, text: colors123.surface };

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || buttonLabel}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.small,
        size === "lg" && styles.large,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && !unavailable && styles.pressed,
        pressed && !unavailable && variant === "primary" && { backgroundColor: colors123.primaryPressed },
        unavailable && styles.unavailable,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={palette.text} size="small" /> :
          icon ? <MaterialCommunityIcons color={palette.text} name={icon} size={size === "sm" ? 18 : 20} /> : null}
        <Text style={[styles.label, { color: unavailable ? colors123.textDisabled : palette.text }, textStyle]}>
          {buttonLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  small: { minHeight: 44, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  large: { minHeight: 52, paddingHorizontal: spacing.lg },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  label: { flexShrink: 1, textAlign: "center", fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21 },
  pressed: { opacity: 0.88 },
  unavailable: { opacity: 0.55, backgroundColor: colors123.surfaceMuted, borderColor: colors123.borderLight },
});

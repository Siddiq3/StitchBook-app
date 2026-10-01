import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, spacing } from "../utils/theme";

export default function AppButton({
  label,
  title,
  onPress,
  icon,
  variant = "primary",
  size = "md",
  style,
  textStyle,
  loading = false,
  disabled = false,
  accessibilityLabel,
  ...props
}) {
  const filled = ["primary", "accent", "danger"].includes(variant);
  const foreground = filled
    ? colors123.surface
    : variant === "ghost"
    ? colors123.textSecondary
    : colors123.primary;
  const unavailable = disabled || loading;
  const buttonLabel = label ?? title ?? "";
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
        {
          backgroundColor: filled
            ? variant === "danger"
              ? colors123.danger
              : colors123.primary
            : variant === "ghost"
            ? "transparent"
            : colors123.surface,
          borderColor: filled
            ? variant === "danger"
              ? colors123.danger
              : colors123.primary
            : variant === "ghost"
            ? "transparent"
            : colors123.border,
        },
        style,
        pressed && { opacity: 0.8 },
        unavailable && { opacity: 0.5 },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={foreground} size="small" />
        ) : icon ? (
          <MaterialCommunityIcons color={foreground} name={icon} size={20} />
        ) : null}
        <Text style={[styles.label, { color: foreground }, textStyle]}>
          {buttonLabel}
        </Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  small: { minHeight: 44, paddingVertical: spacing.xs },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  label: {
    flexShrink: 1,
    textAlign: "center",
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
  },
});

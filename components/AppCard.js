import React from "react";
import { StyleSheet, View } from "react-native";
import { colors123, shadows, spacing, radius } from "../utils/theme";

export default function AppCard({
  children,
  style,
  padded = true,
  variant = "default",
  ...props
}) {
  return (
    <View
      {...props}
      style={[
        styles.base,
        padded && styles.padded,
        variant === "muted" && styles.muted,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...shadows.card,
  },
  padded: {
    padding: spacing.md,
  },
  muted: {
    backgroundColor: colors123.surfaceMuted,
    borderColor: colors123.borderLight,
    ...shadows.soft,
  },
});

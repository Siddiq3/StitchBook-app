import React from "react";
import { StyleSheet, View } from "react-native";
import { colors123, shadows, spacing } from "../utils/theme";

export default function AppCard({
  children,
  style,
  padded = true,
  variant = "default",
}) {
  return (
    <View
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
    borderRadius: 16,
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

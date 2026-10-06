import React from "react";
import { StyleSheet, View } from "react-native";
import { colors123, spacing, radius, shadows } from "../utils/theme";

export default function AppCard({ children, style, padded = true, variant = "default", ...props }) {
  return (
    <View {...props} style={[
      styles.base,
      padded && styles.padded,
      variant === "muted" && styles.muted,
      variant === "accent" && styles.accent,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderSubtle,
    ...shadows.card,
  },
  padded: { paddingHorizontal: spacing.md, paddingVertical: 14 },
  muted: { backgroundColor: colors123.surfaceMuted, borderColor: colors123.borderLight, elevation: 0, shadowOpacity: 0 },
  accent: { backgroundColor: colors123.primarySoft, borderColor: colors123.borderLight },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors123, typography, spacing } from "../utils/theme";

export default function ScreenHeader({ eyebrow, title, subtitle, action }) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: {
    ...typography.label,
    color: colors123.primary,
    letterSpacing: 0.15,
    marginBottom: 4,
  },
  title: { ...typography.h1, color: colors123.text },
  subtitle: { ...typography.small, marginTop: 4, color: colors123.textMuted, maxWidth: 520 },
  action: { paddingTop: 2, flexShrink: 0 },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppButton from "./AppButton";
import { colors123, typography, radius, spacing } from "../utils/theme";

export default function InlineAlert({ message, title, tone = "error", onRetry, retryLabel, style }) {
  if (!message) return null;
  const palette = tone === "error"
    ? { color: colors123.danger, bg: colors123.dangerLight, icon: "alert-circle-outline" }
    : tone === "warning"
    ? { color: colors123.warning, bg: colors123.warningLight, icon: "alert-outline" }
    : { color: colors123.info, bg: colors123.infoLight, icon: "information-outline" };

  return (
    <View accessibilityLiveRegion="polite" style={[styles.container, { backgroundColor: palette.bg }, style]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors123.surface }]}>
          <MaterialCommunityIcons name={palette.icon} size={19} color={palette.color} />
        </View>
        <View style={styles.copy}>
          {title ? <Text style={[styles.title, { color: palette.color }]}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      {onRetry ? <AppButton label={retryLabel || "Retry"} variant="secondary" size="sm" onPress={onRetry} style={styles.retry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors123.borderLight, gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0 },
  title: { ...typography.label, marginBottom: 2 },
  message: { ...typography.small, color: colors123.textSecondary },
  retry: { alignSelf: "flex-start" },
});

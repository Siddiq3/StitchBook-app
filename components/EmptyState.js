import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, typography, radius, spacing } from "../utils/theme";

export default function EmptyState({ icon = "hanger", title, description, message, action }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.illustration}>
        <MaterialCommunityIcons color={colors123.primary} name={icon} size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description || message ? <Text style={styles.description}>{description || message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  illustration: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors123.primarySoft,
  },
  title: { ...typography.h3, color: colors123.text, textAlign: "center" },
  description: { ...typography.small, marginTop: spacing.xs, color: colors123.textMuted, textAlign: "center", maxWidth: 320 },
  action: { marginTop: spacing.md, minWidth: 140 },
});

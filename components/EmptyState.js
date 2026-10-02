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
      <Text style={styles.description}>{description || message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  illustration: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    backgroundColor: colors123.primarySoft,
  },
  title: { ...typography.h3, color: colors123.text, textAlign: "center" },
  description: { ...typography.small, marginTop: spacing.xs, color: colors123.textMuted, textAlign: "center", maxWidth: 320 },
  action: { marginTop: spacing.md, minWidth: 140 },
});

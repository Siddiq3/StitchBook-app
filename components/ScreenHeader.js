import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors123, fonts, spacing } from "../utils/theme";

export default function ScreenHeader({ eyebrow, title, subtitle, action }) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
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
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0,
    textTransform: "uppercase",
    color: colors123.primary,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors123.text,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  action: {
    paddingTop: 4,
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";

export default function EmptyState({ icon = "hanger", title, description, message, action }) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.illustration, { backgroundColor: colors123.surfaceMuted }]}
      >
        <View style={styles.innerCircle}>
          <MaterialCommunityIcons
            color={colors123.primary}
            name={icon}
            size={28}
          />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description || message}</Text>
      {action ? <View style={{ marginTop: spacing.md }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...shadows.soft,
  },
  illustration: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  innerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors123.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
    textAlign: "center",
  },
  description: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors123.textMuted,
    textAlign: "center",
  },
});

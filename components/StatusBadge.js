import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts, getStatusTone, radius, spacing } from "../utils/theme";

export default function StatusBadge({ status, compact = false, style }) {
  const tone = getStatusTone(status);
  return (
    <View
      style={[
        styles.badge,
        compact && styles.compact,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          compact && styles.compactText,
          { color: tone.color },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  compact: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  compactText: {
    fontSize: 11,
  },
});

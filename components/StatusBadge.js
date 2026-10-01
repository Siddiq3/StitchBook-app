import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts, getStatusTone, radius, spacing } from "../utils/theme";

import { useLanguage } from "../context/LanguageContext";

export default function StatusBadge({
  status = "pending",
  compact = false,
  style,
}) {
  const { t } = useLanguage();
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
        {tone.labelKey ? t(tone.labelKey) : String(status)}
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
    fontSize: 12,
  },
});

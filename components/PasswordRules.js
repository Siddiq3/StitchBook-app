import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "./AccessibleMotionView";
import { colors123, fonts, spacing } from "../utils/theme";

// Live password checklist: each rule turns green as it is met, so the rule is
// learned while typing instead of from an error after submit.
export const passwordChecks = (value) => ({
  length: String(value || "").length >= 8,
  letter: /[A-Za-z]/.test(value || ""),
  number: /\d/.test(value || ""),
});

function Rule({ met, label }) {
  return (
    <View style={styles.rule} accessible accessibilityLabel={`${label}: ${met ? "✓" : "✗"}`}>
      <MotiView
        animate={{ scale: met ? 1 : 0.85, opacity: met ? 1 : 0.6 }}
        transition={{ type: "timing", duration: 180 }}
      >
        <Ionicons name={met ? "checkmark-circle" : "ellipse-outline"} size={16} color={met ? colors123.success : colors123.textMuted} />
      </MotiView>
      <Text style={[styles.ruleText, met && styles.ruleMet]}>{label}</Text>
    </View>
  );
}

export default function PasswordRules({ value, t }) {
  const checks = passwordChecks(value);
  return (
    <View style={styles.rules}>
      <Rule met={checks.length} label={t("pwRuleLength")} />
      <Rule met={checks.letter} label={t("pwRuleLetter")} />
      <Rule met={checks.number} label={t("pwRuleNumber")} />
    </View>
  );
}

const styles = StyleSheet.create({
  rules: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: 4, marginTop: -4 },
  rule: { flexDirection: "row", alignItems: "center", gap: 4 },
  ruleText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors123.textMuted },
  ruleMet: { color: colors123.success },
});

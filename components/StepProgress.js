import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors123, fonts, spacing } from "../utils/theme";

// Numbered steps joined by a line, so the flow reads as one connected sequence.
export default function StepProgress({ total, current }) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}
      style={styles.row}
    >
      {steps.map((step) => (
        <React.Fragment key={step}>
          {step > 1 && <View style={[styles.line, step <= current && styles.active]} />}
          <View style={[styles.dot, step <= current && styles.active]}>
            <Text style={[styles.label, step <= current && styles.labelActive]}>{step}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.borderLight,
  },
  line: { flex: 1, maxWidth: 40, height: 2, backgroundColor: colors123.borderLight },
  active: { backgroundColor: colors123.primary },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors123.textMuted },
  labelActive: { color: colors123.surface },
});

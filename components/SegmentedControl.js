import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors123, fonts, radius, spacing } from "../utils/theme";
export default function SegmentedControl({
  options,
  value,
  onChange,
  disabled = false,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.options}
      >
        {options.map((option) => (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: option.value === value, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              option.value === value && styles.selected,
              pressed && { opacity: 0.7 },
              disabled && { opacity: 0.5 },
            ]}
          >
            <Text
              style={[
                styles.label,
                option.value === value && {
                  color: colors123.primary,
                  fontFamily: fonts.semibold,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    padding: spacing.xxs,
  },
  options: { gap: spacing.xxs },
  option: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    justifyContent: "center",
  },
  selected: { backgroundColor: colors123.surface },
  label: { fontSize: 13, fontFamily: fonts.medium, color: colors123.textMuted },
});

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors123, fonts, spacing } from "../utils/theme";
export default function ListRow({
  leading,
  title,
  meta,
  trailing,
  onPress,
  accessibilityLabel,
  style,
}) {
  const content = (
    <>
      <View>{leading}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title}>{title}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {trailing}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        style,
        pressed && { backgroundColor: colors123.surfaceMuted },
      ]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[styles.row, style]}>{content}</View>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors123.borderLight,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: colors123.text,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
    marginTop: 2,
  },
});

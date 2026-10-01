import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, spacing } from "../utils/theme";
export default function IconInput({
  label,
  icon,
  error,
  hint,
  multiline = false,
  style,
  inputStyle,
  onFocus,
  onBlur,
  editable = true,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.wrapper,
          focused && { borderColor: colors123.primary },
          error && { borderColor: colors123.danger },
          !editable && { backgroundColor: colors123.surfaceMuted },
        ]}
      >
        {icon ? (
          <MaterialCommunityIcons
            color={error ? colors123.danger : colors123.textMuted}
            name={icon}
            size={20}
          />
        ) : null}
        <TextInput
          {...props}
          accessibilityLabel={
            props.accessibilityLabel || label || props.placeholder
          }
          editable={editable}
          placeholderTextColor={colors123.textMuted}
          style={[styles.input, multiline && { minHeight: 96 }, inputStyle]}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
      {error || hint ? (
        <Text
          accessibilityLiveRegion={error ? "polite" : "none"}
          style={[styles.hint, error && { color: colors123.danger }]}
        >
          {error || hint}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors123.textSecondary,
    marginBottom: spacing.xs,
  },
  wrapper: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors123.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.regular,
    paddingVertical: spacing.sm,
  },
  hint: {
    marginTop: spacing.xs,
    color: colors123.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
});

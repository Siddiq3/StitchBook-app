import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";

export default function IconInput({
  label,
  icon,
  error,
  multiline = false,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.wrapper, error && styles.wrapperError]}>
        {icon ? (
          <MaterialCommunityIcons
            color={error ? colors123.danger : colors123.textMuted}
            name={icon}
            size={18}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors123.textSoft}
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.soft,
  },
  wrapperError: {
    borderColor: colors123.danger,
  },
  input: {
    flex: 1,
    color: colors123.text,
    fontSize: 14,
    fontFamily: fonts.semibold,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 96,
  },
  error: {
    marginTop: spacing.xs,
    color: colors123.danger,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});

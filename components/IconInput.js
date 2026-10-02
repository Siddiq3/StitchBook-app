import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, fonts, radius, spacing } from "../utils/theme";

export default function IconInput({
  label, icon, error, hint, multiline = false, style, inputStyle, onFocus, onBlur, editable = true, ...props
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.wrapper,
        focused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
      ]}>
        {icon ? <MaterialCommunityIcons color={error ? colors123.danger : focused ? colors123.primary : colors123.textMuted} name={icon} size={20} /> : null}
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel || label || props.placeholder}
          editable={editable}
          placeholderTextColor={colors123.textDisabled}
          style={[styles.input, multiline && styles.multiline, inputStyle]}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        />
      </View>
      {error || hint ? (
        <Text accessibilityLiveRegion={error ? "polite" : "none"} style={[styles.hint, error && styles.errorText]}>
          {error || hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors123.textSecondary },
  wrapper: {
    minHeight: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderStrong,
    backgroundColor: colors123.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  focused: { borderColor: colors123.primary, backgroundColor: colors123.primarySoft },
  error: { borderColor: colors123.danger },
  disabled: { backgroundColor: colors123.surfaceMuted, borderColor: colors123.borderLight },
  input: { flex: 1, minWidth: 0, minHeight: 48, color: colors123.text, fontSize: 16, lineHeight: 22, fontFamily: fonts.regular, paddingVertical: 12 },
  multiline: { minHeight: 104, paddingTop: 14 },
  hint: { color: colors123.textMuted, fontSize: 12, lineHeight: 18, fontFamily: fonts.regular },
  errorText: { color: colors123.danger },
});

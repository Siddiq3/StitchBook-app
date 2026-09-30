import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors123, fonts, radius, spacing } from "../utils/theme";

export default function AppButton({
  label,
  title,
  onPress,
  icon,
  variant = "primary",
  style,
  textStyle,
  loading = false,
  disabled = false,
}) {
  const isPrimary = variant === "primary";
  const isAccent = variant === "accent";
  const buttonLabel = label ?? title ?? "";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isAccent && styles.accent,
        !isPrimary && !isAccent && styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={isAccent ? colors123.text : isPrimary ? colors123.surface : colors123.primary}
            size="small"
          />
        ) : (
          <>
            {icon ? (
              <MaterialCommunityIcons
                color={isAccent ? colors123.text : isPrimary ? colors123.surface : colors123.primary}
                name={icon}
                size={18}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                isAccent ? styles.accentLabel : isPrimary ? styles.primaryLabel : styles.secondaryLabel,
                textStyle,
              ]}
            >
              {buttonLabel}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
    shadowColor: colors123.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  secondary: {
    backgroundColor: colors123.surface,
    borderColor: colors123.borderLight,
  },
  accent: {
    backgroundColor: colors123.accent,
    borderColor: colors123.accent,
    shadowColor: colors123.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  primaryLabel: {
    color: colors123.surface,
  },
  accentLabel: {
    color: colors123.text,
  },
  secondaryLabel: {
    color: colors123.primary,
  },
});

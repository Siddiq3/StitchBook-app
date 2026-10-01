import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppButton from "./AppButton";
import { colors123, fonts, radius, spacing } from "../utils/theme";
export default function InlineAlert({
  message,
  title,
  tone = "error",
  onRetry,
  retryLabel,
  style,
}) {
  if (!message) return null;
  const color =
    tone === "error"
      ? colors123.danger
      : tone === "warning"
      ? colors123.warning
      : colors123.primary;
  const backgroundColor =
    tone === "error"
      ? colors123.dangerLight
      : tone === "warning"
      ? colors123.warningLight
      : colors123.primaryLight;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor }, style]}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={
            tone === "error" ? "alert-circle-outline" : "information-outline"
          }
          size={20}
          color={color}
        />
        <View style={{ flex: 1 }}>
          {title ? (
            <Text style={[styles.title, { color }]}>{title}</Text>
          ) : null}
          <Text style={[styles.message, { color }]}>{message}</Text>
        </View>
      </View>
      {onRetry ? (
        <AppButton
          label={retryLabel || "Retry"}
          variant="secondary"
          size="sm"
          onPress={onRetry}
          style={{ alignSelf: "flex-start", marginTop: spacing.sm }}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: spacing.md, borderRadius: radius.md },
  row: { flexDirection: "row", gap: spacing.sm },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginBottom: spacing.xxs,
  },
  message: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
});

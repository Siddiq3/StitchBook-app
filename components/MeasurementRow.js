import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, fonts, spacing } from "../utils/theme";import { useLanguage } from "../context/LanguageContext";

export default function MeasurementRow({
  fieldName,
  value,
  onChangeText,
  onFocus,
  isFocused = false,
  fieldIndex = 1
}) {const { t } = useLanguage();
  const inputRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  const handleChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, "");

    // Validate: only one decimal point allowed
    if ((cleanedText.match(/\./g) || []).length > 1) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onChangeText(cleanedText);
  };

  const handleFocus = () => {
    setHasError(false);
    if (onFocus) {
      onFocus(fieldName);
    }
  };

  const handleClear = () => {
    onChangeText("");
    inputRef.current?.focus();
  };

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={[
      styles.container,
      isFocused && styles.containerFocused,
      hasError && styles.containerError]
      }>

      <View style={styles.leftSection}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{fieldName}</Text>

        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          accessibilityLabel={`${fieldName} (cm)`}
          ref={inputRef}
          style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          value ? styles.inputFilled : {}]
          }
          placeholder={t("enterValue")}
          placeholderTextColor={colors123.textSoft}
          keyboardType="decimal-pad"
          value={value || ""}
          onChangeText={handleChange}
          onFocus={handleFocus}
          maxLength={6} />


        {value &&
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t("clear")} ${fieldName}`}
          onPress={handleClear}
          style={({ pressed }) => [
          styles.clearButton,
          pressed && styles.clearButtonPressed]
          }>

            <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={colors123.textMuted} />

          </Pressable>
        }

        <Text style={styles.unit}>cm</Text>
      </View>
    </Pressable>);

}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    marginVertical: 2,
    backgroundColor: colors123.surface,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: colors123.border,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  containerFocused: {
    borderColor: colors123.primary,
    backgroundColor: colors123.infoLight,
    borderWidth: 2,
  },
  containerError: {
    borderColor: colors123.danger,
    backgroundColor: colors123.dangerLight,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.xs,
    minWidth: 0,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors123.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  numberBadgeText: {
    color: colors123.surface,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: 2,
    lineHeight: 20,
  },
  fieldUnit: {
    fontSize: 12,
    color: colors123.textSoft,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: 144,
    position: "relative",
    gap: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
  },
  inputFocused: {
    borderColor: colors123.primary,
    backgroundColor: colors123.infoLight,
  },
  inputError: {
    borderColor: colors123.danger,
    backgroundColor: colors123.dangerLight,
  },
  inputFilled: {
    borderColor: colors123.primary,
  },
  clearButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonPressed: {
    opacity: 0.6,
  },
  unit: {
    fontSize: 12,
    color: colors123.textMuted,
    fontFamily: fonts.medium,
  },
});

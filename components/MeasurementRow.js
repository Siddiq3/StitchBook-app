import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  Animated } from
"react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>{fieldIndex}</Text>
        </View>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{fieldName}</Text>
          <Text style={styles.fieldUnit}>{t("auto_centimeters")}</Text>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          value ? styles.inputFilled : {}]
          }
          placeholder="0.0"
          placeholderTextColor={colors123.textSoft}
          keyboardType="decimal-pad"
          value={value || ""}
          onChangeText={handleChange}
          onFocus={handleFocus}
          maxLength={6} />
        

        {value &&
        <Pressable
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors123.border
  },
  containerFocused: {
    borderColor: colors123.primary,
    backgroundColor: "#F0F9FF",
    borderWidth: 2
  },
  containerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2"
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.md
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors123.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  numberBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: fonts.bold
  },
  fieldInfo: {
    flex: 1
  },
  fieldName: {
    fontSize: 13,
    fontWeight: fonts.semibold,
    color: colors123.text,
    marginBottom: 2
  },
  fieldUnit: {
    fontSize: 11,
    color: colors123.textSoft
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: 100,
    position: "relative"
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    fontWeight: fonts.semibold,
    color: colors123.text,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: "#FFF"
  },
  inputFocused: {
    borderColor: colors123.primary,
    backgroundColor: "#F0F9FF"
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2"
  },
  inputFilled: {
    borderColor: colors123.primary
  },
  clearButton: {
    padding: spacing.xs,
    marginRight: spacing.xs
  },
  clearButtonPressed: {
    opacity: 0.6
  },
  unit: {
    fontSize: 11,
    color: colors123.textMuted,
    fontWeight: fonts.medium
  }
});

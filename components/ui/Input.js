import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function Input({
  label,
  error,
  placeholder,
  icon,
  required = false,
  ...textInputProps
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: colors123.danger }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? colors123.danger
              : isFocused
              ? colors123.primary
              : colors123.border,
            borderWidth: error || isFocused ? 1.5 : 1,
          },
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={colors123.textMuted}
            style={styles.icon}
          />
        )}

        <TextInput
          {...textInputProps}
          placeholder={placeholder}
          placeholderTextColor={colors123.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              fontSize: normalize(SIZES.md),
            },
          ]}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: normalize(SIZES.sm),
    fontWeight: '800',
    color: colors123.textSecondary,
    marginBottom: 7,
  },
  inputContainer: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors123.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors123.borderLight,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors123.text,
    fontWeight: '600',
  },
  error: {
    fontSize: normalize(SIZES.xs),
    color: colors123.danger,
    marginTop: 4,
  },
});

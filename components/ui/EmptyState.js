import { fonts } from "../../utils/theme";
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import PrimaryButton from './PrimaryButton';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={34} color={colors123.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {actionLabel && onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  title: {
    fontSize: normalize(SIZES.xl),
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: normalize(SIZES.md),
    color: colors123.textMuted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
  },
  button: {
    marginTop: 24,
  },
});

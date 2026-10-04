import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, typography, radius, spacing } from '../../utils/theme';

export default function StatCard({ label, value, icon, color, subtitle }) {
  const tone = color || colors123.primary;
  return (
    <View style={styles.card}>
      {icon ? <View style={[styles.iconWrap, { backgroundColor: `${tone}14` }]}><MaterialCommunityIcons name={icon} size={18} color={tone} /></View> : null}
      <View style={styles.copy}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  copy: { flex: 1, minWidth: 0 },
  iconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.label, color: colors123.textMuted, lineHeight: 18 },
  value: { fontFamily: typography.h2.fontFamily, fontSize: 20, lineHeight: 26, color: colors123.text, fontVariant: ['tabular-nums'] },
  subtitle: { ...typography.caption, color: colors123.textMuted, marginTop: 4 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors123, typography, radius, spacing } from '../../utils/theme';

export default function StatCard({ label, value, icon, color, subtitle }) {
  const tone = color || colors123.primary;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon ? <View style={[styles.iconWrap, { backgroundColor: `${tone}14` }]}><MaterialCommunityIcons name={icon} size={18} color={tone} /></View> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 112,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    justifyContent: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  iconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.label, color: colors123.textMuted, marginLeft: spacing.xs, flex: 1 },
  value: { fontFamily: typography.h2.fontFamily, fontSize: 26, lineHeight: 32, color: colors123.text, fontVariant: ['tabular-nums'] },
  subtitle: { ...typography.caption, color: colors123.textMuted, marginTop: 4 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors123, fonts, SIZES, normalize, shadows } from '../../utils/theme';

export default function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <View
      style={styles.card}
    >
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${color || colors123.primary}18` }]}>
            <MaterialCommunityIcons name={icon} size={18} color={color || colors123.primary} />
          </View>
        )}
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: normalize(SIZES.xs),
    color: colors123.textSecondary,
    fontFamily: fonts.extrabold,
    marginLeft: 8,
    flex: 1,
  },
  value: {
    fontSize: normalize(26),
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginTop: 6,
  },
  subtitle: {
    fontSize: normalize(SIZES.xs),
    color: colors123.textSecondary,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
});

import { fonts } from "../../utils/theme";
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors123, SIZES, normalize } from '../../utils/theme';

export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7} style={styles.actionButton}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md2,
    marginTop: SIZES.lg2,
    paddingHorizontal: SIZES.lg2,
  },
  title: {
    fontSize: normalize(SIZES.lg),
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  actionButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: SIZES.radiusFull,
    backgroundColor: colors123.primarySoft,
  },
  action: {
    fontSize: normalize(SIZES.sm),
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { colors123, SIZES, normalize } from '../../utils/theme';

const STATUS_CONFIG = {
  pending: { bg: colors123.pendingBg, text: colors123.pendingText, labelKey: 'pending' },
  cutting: { bg: colors123.progressBg, text: colors123.progressText, label: 'Cutting' },
  stitching: { bg: colors123.primarySoft, text: colors123.primaryDark, labelKey: 'stitching' },
  in_progress: { bg: colors123.progressBg, text: colors123.progressText, labelKey: 'inProgress' },
  ready: { bg: colors123.readyBg, text: colors123.readyText, labelKey: 'ready' },
  delivered: { bg: colors123.deliveredBg, text: colors123.deliveredText, labelKey: 'delivered' },
  urgent: { bg: colors123.urgentBg, text: colors123.urgentText, labelKey: 'urgent' },
};

export default function StatusBadge({ status = 'pending', compact = false }) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <View
      style={[
        styles.badge,
        compact && styles.compactBadge,
        {
          backgroundColor: config.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
          },
        ]}
      >
        {config.label || t(config.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start',
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: normalize(SIZES.xs),
    fontWeight: '600',
  },
});

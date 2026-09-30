/**
 * Production-ready Badge & Pill Components
 * Status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  COMPONENT_SIZES,
} from '../../utils/designSystem';

/**
 * Status Badge
 * Shows order/item status with color coding
 */
export function StatusBadge({ status, size = 'md', style }) {
  const STATUS_CONFIG = {
    pending: {
      bg: BRAND_COLORS.warningLight,
      text: BRAND_COLORS.warning,
      icon: 'clock-outline',
      label: 'Pending',
    },
    progress: {
      bg: BRAND_COLORS.infoLight,
      text: BRAND_COLORS.info,
      icon: 'progress-check',
      label: 'In Progress',
    },
    ready: {
      bg: BRAND_COLORS.successLight,
      text: BRAND_COLORS.success,
      icon: 'check-circle',
      label: 'Ready',
    },
    delivered: {
      bg: BRAND_COLORS.successLight,
      text: BRAND_COLORS.success,
      icon: 'check-double',
      label: 'Delivered',
    },
    cancelled: {
      bg: BRAND_COLORS.dangerLight,
      text: BRAND_COLORS.danger,
      icon: 'cancel',
      label: 'Cancelled',
    },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizes = {
    sm: { padding: SPACING.xs, fontSize: 11 },
    md: { padding: SPACING.sm, fontSize: 12 },
    lg: { padding: SPACING.md, fontSize: 13 },
  };
  const sizeConfig = sizes[size] || sizes.md;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding / 2,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={COMPONENT_SIZES.icon.sm}
        color={config.text}
        style={{ marginRight: SPACING.xs }}
      />
      <Text
        style={[
          TEXT_STYLES.labelSmall,
          { color: config.text, fontSize: sizeConfig.fontSize },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

/**
 * Pill/Chip Component
 * General-purpose badge for tags, filters, etc.
 */
export function Pill({
  label,
  icon,
  onClose,
  variant = 'default',
  size = 'md',
  style,
}) {
  const variants = {
    default: {
      bg: BRAND_COLORS.lightBg,
      text: BRAND_COLORS.text,
      border: BRAND_COLORS.border,
    },
    primary: {
      bg: BRAND_COLORS.accent,
      text: BRAND_COLORS.white,
      border: 'transparent',
    },
    success: {
      bg: BRAND_COLORS.successLight,
      text: BRAND_COLORS.success,
      border: 'transparent',
    },
    warning: {
      bg: BRAND_COLORS.warningLight,
      text: BRAND_COLORS.warning,
      border: 'transparent',
    },
    danger: {
      bg: BRAND_COLORS.dangerLight,
      text: BRAND_COLORS.danger,
      border: 'transparent',
    },
  };

  const variantConfig = variants[variant] || variants.default;
  const sizeConfig = {
    sm: { padding: 4, fontSize: 11 },
    md: { padding: 6, fontSize: 12 },
    lg: { padding: 8, fontSize: 13 },
  }[size];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
          paddingHorizontal: sizeConfig.padding * 2,
          paddingVertical: sizeConfig.padding,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.xs}
          color={variantConfig.text}
          style={{ marginRight: SPACING.xs }}
        />
      )}
      <Text
        style={[
          TEXT_STYLES.labelSmall,
          { color: variantConfig.text, fontSize: sizeConfig.fontSize },
        ]}
      >
        {label}
      </Text>
      {onClose && (
        <MaterialCommunityIcons
          name="close"
          size={COMPONENT_SIZES.icon.xs}
          color={variantConfig.text}
          style={{ marginLeft: SPACING.xs }}
          onPress={onClose}
        />
      )}
    </View>
  );
}

/**
 * Badge Count
 * Shows a count/number badge (for notifications, etc.)
 */
export function CountBadge({ count, style }) {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : String(count);

  return (
    <View style={[styles.countBadge, style]}>
      <Text
        style={[
          TEXT_STYLES.labelSmall,
          {
            color: BRAND_COLORS.white,
            fontWeight: 'bold',
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
}

/**
 * Tag Component
 * For categorization and filtering
 */
export function Tag({ label, icon, selected = false, onPress, style }) {
  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: selected ? BRAND_COLORS.accent : BRAND_COLORS.white,
          borderColor: selected ? BRAND_COLORS.accent : BRAND_COLORS.border,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.sm}
          color={selected ? BRAND_COLORS.white : BRAND_COLORS.accent}
          style={{ marginRight: SPACING.xs }}
        />
      )}
      <Text
        style={[
          TEXT_STYLES.labelMedium,
          { color: selected ? BRAND_COLORS.white : BRAND_COLORS.accent },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: BRAND_COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
});

export default StatusBadge;

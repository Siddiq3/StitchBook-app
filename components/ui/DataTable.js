/**
 * Production-ready Data Table & List Components
 * Structured display for lists, tables, and data
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  SHADOWS,
  COMPONENT_SIZES,
} from '../../utils/designSystem';

/**
 * List Item Component
 * For displaying items in lists
 */
export function ListItem({
  leftIcon,
  title,
  subtitle,
  rightContent,
  rightIcon,
  onPress,
  selected = false,
  divider = true,
  style,
}) {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.listItem,
          {
            backgroundColor: selected ? BRAND_COLORS.lightBg : BRAND_COLORS.white,
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <MaterialCommunityIcons
              name={leftIcon}
              size={COMPONENT_SIZES.icon.lg}
              color={BRAND_COLORS.accent}
            />
          </View>
        )}

        <View style={styles.listItemContent}>
          <Text style={TEXT_STYLES.labelMedium}>{title}</Text>
          {subtitle && (
            <Text style={[TEXT_STYLES.bodySmall, { color: BRAND_COLORS.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightContent && <View style={styles.rightContent}>{rightContent}</View>}

        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon}
            size={COMPONENT_SIZES.icon.md}
            color={BRAND_COLORS.textMuted}
            style={styles.rightIcon}
          />
        )}
      </TouchableOpacity>

      {divider && <View style={styles.divider} />}
    </>
  );
}

/**
 * Data Table Component
 * For displaying structured data
 */
export function DataTable({
  columns,
  data,
  onRowPress,
  loading = false,
  emptyMessage = 'No data',
  style,
}) {
  const renderCell = (value, column) => {
    if (column.render) {
      return column.render(value);
    }
    return <Text style={TEXT_STYLES.bodySmall}>{value}</Text>;
  };

  if (loading) {
    return (
      <View style={styles.tableContainer}>
        <ActivityIndicator color={BRAND_COLORS.accent} size="large" />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.tableContainer}>
        <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.tableContainer, style]}>
      {/* Header */}
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <View
            key={col.key}
            style={{
              flex: col.flex || 1,
            }}
          >
            <Text style={[TEXT_STYLES.labelSmall, { color: BRAND_COLORS.textMuted }]}>
              {col.header}
            </Text>
          </View>
        ))}
      </View>

      {/* Body */}
      {data.map((row, rowIndex) => (
        <TouchableOpacity
          key={rowIndex}
          style={styles.tableRow}
          onPress={() => onRowPress?.(row)}
          activeOpacity={0.7}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              style={{
                flex: col.flex || 1,
              }}
            >
              {renderCell(row[col.key], col)}
            </View>
          ))}
        </TouchableOpacity>
      ))}
    </View>
  );
}

/**
 * Section List Component
 * For displaying grouped data
 */
export function SectionList({ sections, renderItem, style }) {
  return (
    <View style={[styles.sectionContainer, style]}>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex}>
          {section.title && (
            <Text style={[TEXT_STYLES.headingSmall, styles.sectionTitle]}>
              {section.title}
            </Text>
          )}
          {section.data.map((item, itemIndex) => (
            <View key={itemIndex}>
              {renderItem(item, itemIndex)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Stat Row Component
 * For displaying key-value pairs
 */
export function StatRow({
  label,
  value,
  subvalue,
  icon,
  iconColor = BRAND_COLORS.accent,
  style,
}) {
  return (
    <View style={[styles.statRow, style]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.md}
          color={iconColor}
          style={{ marginRight: SPACING.md }}
        />
      )}
      <View style={styles.statContent}>
        <Text style={[TEXT_STYLES.bodySmall, { color: BRAND_COLORS.textMuted }]}>
          {label}
        </Text>
        <View style={styles.statValueContainer}>
          <Text style={TEXT_STYLES.headingSmall}>{value}</Text>
          {subvalue && (
            <Text style={[TEXT_STYLES.bodySmall, { color: BRAND_COLORS.textMuted }]}>
              {subvalue}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Info Card Component
 * For displaying key information
 */
export function InfoCard({
  icon,
  label,
  value,
  trailing,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.infoCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.infoCardIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={COMPONENT_SIZES.icon.lg}
            color={BRAND_COLORS.accent}
          />
        </View>
      )}
      <View style={styles.infoCardContent}>
        <Text style={[TEXT_STYLES.bodySmall, { color: BRAND_COLORS.textMuted }]}>
          {label}
        </Text>
        <Text style={TEXT_STYLES.headingSmall}>{value}</Text>
      </View>
      {trailing && <View>{trailing}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: BRAND_COLORS.white,
  },
  leftIconContainer: {
    marginRight: SPACING.lg,
  },
  listItemContent: {
    flex: 1,
  },
  rightContent: {
    marginRight: SPACING.md,
  },
  rightIcon: {
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: BRAND_COLORS.divider,
    marginLeft: SPACING.lg + COMPONENT_SIZES.icon.lg,
  },
  tableContainer: {
    backgroundColor: BRAND_COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: BRAND_COLORS.lightBg,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.divider,
  },
  sectionContainer: {
    backgroundColor: BRAND_COLORS.white,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    color: BRAND_COLORS.textMuted,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: BRAND_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.divider,
  },
  statContent: {
    flex: 1,
  },
  statValueContainer: {
    marginTop: SPACING.xs,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  infoCardIcon: {
    marginRight: SPACING.lg,
  },
  infoCardContent: {
    flex: 1,
  },
});

export default ListItem;

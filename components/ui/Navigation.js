/**
 * Production-ready Bottom Navigation Component
 * Tab bar for main navigation
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useSafeAreaInsets,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  COMPONENT_SIZES,
  SHADOWS,
} from '../../utils/designSystem';

/**
 * Bottom Tab Bar Component
 * Main navigation at the bottom of the screen
 */
export function BottomTabBar({
  tabs,
  activeTab,
  onTabChange,
  badgeCount = {},
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + SPACING.sm : SPACING.sm,
        },
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
        >
          <View style={styles.tabContent}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name={tab.icon}
                size={COMPONENT_SIZES.icon.lg}
                color={
                  activeTab === tab.id
                    ? BRAND_COLORS.accent
                    : BRAND_COLORS.textMuted
                }
              />
              {badgeCount[tab.id] > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount[tab.id] > 99 ? '99+' : badgeCount[tab.id]}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                TEXT_STYLES.labelSmall,
                {
                  color:
                    activeTab === tab.id
                      ? BRAND_COLORS.accent
                      : BRAND_COLORS.textMuted,
                  marginTop: SPACING.xs,
                },
              ]}
            >
              {tab.label}
            </Text>
          </View>
          {activeTab === tab.id && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

/**
 * Floating Action Button (FAB)
 * Quick action button
 */
export function FloatingActionButton({
  icon,
  onPress,
  disabled = false,
  size = 'lg',
  variant = 'primary',
  label,
  style,
}) {
  const sizes = {
    sm: COMPONENT_SIZES.icon.md,
    md: COMPONENT_SIZES.icon.lg,
    lg: COMPONENT_SIZES.icon.xl,
  };

  const iconSize = sizes[size] || sizes.lg;

  const variantColors = {
    primary: BRAND_COLORS.accent,
    success: BRAND_COLORS.success,
    danger: BRAND_COLORS.danger,
  };

  const bgColor = variantColors[variant] || variantColors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.fab,
        {
          backgroundColor: bgColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={BRAND_COLORS.white}
      />
      {label && (
        <Text style={[TEXT_STYLES.labelMedium, { color: BRAND_COLORS.white }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Pagination Component
 * For navigating through pages
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  style,
}) {
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  return (
    <View style={[styles.pagination, style]}>
      <TouchableOpacity
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={COMPONENT_SIZES.icon.md}
          color={currentPage === 1 ? BRAND_COLORS.textMuted : BRAND_COLORS.accent}
        />
      </TouchableOpacity>

      {startPage > 1 && (
        <>
          <TouchableOpacity onPress={() => onPageChange(1)}>
            <Text style={styles.pageButton}>1</Text>
          </TouchableOpacity>
          {startPage > 2 && <Text style={styles.ellipsis}>...</Text>}
        </>
      )}

      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
        (page) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
            style={page === currentPage && styles.activePage}
          >
            <Text
              style={[
                styles.pageButton,
                page === currentPage && { color: BRAND_COLORS.white },
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        )
      )}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <Text style={styles.ellipsis}>...</Text>}
          <TouchableOpacity onPress={() => onPageChange(totalPages)}>
            <Text style={styles.pageButton}>{totalPages}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={COMPONENT_SIZES.icon.md}
          color={
            currentPage === totalPages
              ? BRAND_COLORS.textMuted
              : BRAND_COLORS.accent
          }
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.divider,
    ...SHADOWS.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: BRAND_COLORS.overlayLight,
  },
  tabContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: BRAND_COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND_COLORS.white,
  },
  badgeText: {
    color: BRAND_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 3,
    backgroundColor: BRAND_COLORS.accent,
    borderBottomLeftRadius: RADIUS.full,
    borderBottomRightRadius: RADIUS.full,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    lineHeight: 36,
    textAlign: 'center',
    color: BRAND_COLORS.accent,
    fontWeight: '600',
  },
  activePage: {
    minWidth: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    backgroundColor: BRAND_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsis: {
    color: BRAND_COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
});

export default BottomTabBar;

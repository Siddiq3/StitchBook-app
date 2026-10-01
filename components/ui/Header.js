/**
 * Production-ready Screen Header Component
 * Consistent header for all screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useSafeAreaInsets } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  COMPONENT_SIZES,
  SHADOWS,
} from '../../utils/designSystem';

/**
 * Screen Header Component
 * Header with title, subtitle, and action buttons
 */
export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  actionIcon,
  onActionPress,
  secondActionIcon,
  onSecondActionPress,
  backButton = false,
  onBackPress,
  style,
  backgroundColor = BRAND_COLORS.background,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.lg,
        },
        style,
      ]}
    >
      {/* Back button + Title row */}
      <View style={styles.titleRow}>
        {backButton && (
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={12}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={COMPONENT_SIZES.icon.lg}
              color={BRAND_COLORS.primary}
            />
          </TouchableOpacity>
        )}

        <View style={styles.titleContent}>
          {eyebrow && (
            <Text
              style={[
                TEXT_STYLES.labelSmall,
                { color: BRAND_COLORS.accent, marginBottom: SPACING.xs },
              ]}
            >
              {eyebrow}
            </Text>
          )}
          {title && (
            <Text style={TEXT_STYLES.headingLarge}>{title}</Text>
          )}
          {subtitle && (
            <Text
              style={[
                TEXT_STYLES.bodySmall,
                { color: BRAND_COLORS.textMuted, marginTop: SPACING.xs },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Action buttons */}
        {(actionIcon || secondActionIcon) && (
          <View style={styles.actions}>
            {actionIcon && (
              <TouchableOpacity
                onPress={onActionPress}
                hitSlop={12}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons
                  name={actionIcon}
                  size={COMPONENT_SIZES.icon.lg}
                  color={BRAND_COLORS.primary}
                />
              </TouchableOpacity>
            )}
            {secondActionIcon && (
              <TouchableOpacity
                onPress={onSecondActionPress}
                hitSlop={12}
                style={styles.actionButton}
              >
                <MaterialCommunityIcons
                  name={secondActionIcon}
                  size={COMPONENT_SIZES.icon.lg}
                  color={BRAND_COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Tab Navigation Component
 * For switching between views/sections
 */
export function TabNav({ tabs, activeTab, onTabChange, style }) {
  return (
    <View style={[styles.tabNav, style]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
        >
          {tab.icon && (
            <MaterialCommunityIcons
              name={tab.icon}
              size={COMPONENT_SIZES.icon.md}
              color={activeTab === tab.id ? BRAND_COLORS.accent : BRAND_COLORS.textMuted}
              style={{ marginRight: tab.label ? SPACING.xs : 0 }}
            />
          )}
          {tab.label && (
            <Text
              style={[
                TEXT_STYLES.labelMedium,
                {
                  color: activeTab === tab.id ? BRAND_COLORS.accent : BRAND_COLORS.textMuted,
                },
              ]}
            >
              {tab.label}
            </Text>
          )}
          {activeTab === tab.id && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

/**
 * Search Bar Component
 * For searching/filtering content
 */
export function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  loading = false,
  style,
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.searchContainer,
        {
          borderColor: focused ? BRAND_COLORS.accent : BRAND_COLORS.border,
          borderWidth: focused ? 1.5 : 1,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={COMPONENT_SIZES.icon.md}
        color={focused ? BRAND_COLORS.accent : BRAND_COLORS.textMuted}
        style={styles.searchIcon}
      />

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={BRAND_COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        style={styles.searchInput}
      />

      {value && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={COMPONENT_SIZES.icon.md}
            color={BRAND_COLORS.textMuted}
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      )}

      {loading && (
        <MaterialCommunityIcons
          name="loading"
          size={COMPONENT_SIZES.icon.md}
          color={BRAND_COLORS.accent}
          style={[styles.clearIcon, { marginRight: SPACING.md }]}
        />
      )}
    </View>
  );
}

const { TextInput } = require('react-native');

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 0,
    ...SHADOWS.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: SPACING.md,
  },
  titleContent: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    marginLeft: SPACING.md,
  },
  actionButton: {
    marginLeft: SPACING.md,
  },
  tabNav: {
    flexDirection: "row",
    backgroundColor: BRAND_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.divider,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginRight: SPACING.md,
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLORS.accent,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: BRAND_COLORS.accent,
    borderTopLeftRadius: RADIUS.full,
    borderTopRightRadius: RADIUS.full,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.xs,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingVertical: SPACING.md,
    color: BRAND_COLORS.text,
    fontSize: 15,
  },
  clearIcon: {
    marginLeft: SPACING.md,
  },
});

export default ScreenHeader;

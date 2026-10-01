/**
 * Production-ready State Components
 * Empty, Loading, Error, and Success states for all screens
 */

import React from 'react';
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Button from './Button';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  COMPONENT_SIZES,
} from '../../utils/designSystem';

/**
 * Empty State Component
 * Shows when there's no data to display
 */
export function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.xl}
          color={BRAND_COLORS.textMuted}
        />
      </View>
      <Text style={TEXT_STYLES.headingMedium}>{title}</Text>
      {subtitle && (
        <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          icon={actionIcon}
          variant="primary"
          size="md"
          style={{ marginTop: SPACING.lg }}
        />
      )}
    </View>
  );
}

/**
 * Loading State Component
 * Shows when data is being fetched
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <View style={styles.loadingContainer}>
      <MaterialCommunityIcons
        name="loading"
        size={COMPONENT_SIZES.icon.xl}
        color={BRAND_COLORS.accent}
        style={styles.spinner}
      />
      <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
        {message}
      </Text>
    </View>
  );
}

/**
 * Error State Component
 * Shows when an error occurs
 */
export function ErrorState({
  icon = 'alert-circle',
  title = 'Something went wrong',
  subtitle,
  actionLabel = 'Try again',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.xl}
          color={BRAND_COLORS.danger}
        />
      </View>
      <Text style={[TEXT_STYLES.headingMedium, { color: BRAND_COLORS.danger }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
          {subtitle}
        </Text>
      )}
      <View style={styles.actionContainer}>
        {onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="danger"
            size="md"
          />
        )}
        {onSecondaryAction && (
          <Button
            title={secondaryActionLabel || 'Cancel'}
            onPress={onSecondaryAction}
            variant="secondary"
            size="md"
            style={{ marginLeft: SPACING.md }}
          />
        )}
      </View>
    </View>
  );
}

/**
 * Success State Component
 * Shows when an action succeeds
 */
export function SuccessState({
  icon = 'check-circle',
  title = 'Success!',
  subtitle,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={COMPONENT_SIZES.icon.xl}
          color={BRAND_COLORS.success}
        />
      </View>
      <Text style={[TEXT_STYLES.headingMedium, { color: BRAND_COLORS.success }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="success"
          size="md"
          style={{ marginTop: SPACING.lg }}
        />
      )}
    </View>
  );
}

/**
 * No Network State Component
 * Shows when there's no internet connection
 */
export function NoNetworkState({ onRetry }) {
  return (
    <View style={styles.noNetworkContainer}>
      <View style={styles.errorIconContainer}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={COMPONENT_SIZES.icon.xl}
          color={BRAND_COLORS.danger}
        />
      </View>
      <Text style={[TEXT_STYLES.headingMedium, { color: BRAND_COLORS.text }]}>
        No Internet Connection
      </Text>
      <Text style={[TEXT_STYLES.bodyMedium, { color: BRAND_COLORS.textMuted }]}>
        Please check your connection and try again
      </Text>
      {onRetry && (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="primary"
          size="md"
          style={{ marginTop: SPACING.lg }}
        />
      )}
    </View>
  );
}

/**
 * Skeleton Loading Component
 * Shows placeholder while loading data
 */
export function SkeletonLoader({ height = 100, style }) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  noNetworkContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  errorIconContainer: {
    marginBottom: SPACING.lg,
    backgroundColor: BRAND_COLORS.dangerLight,
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: SPACING.lg,
    backgroundColor: BRAND_COLORS.successLight,
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    justifyContent: "center",
    width: "100%",
  },
  spinner: {
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
  skeleton: {
    backgroundColor: BRAND_COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
});

export default EmptyState;

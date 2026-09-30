/**
 * Production-ready Dialog & Modal Components
 * Alerts, confirmations, and custom modals
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from './Button';
import {
  BRAND_COLORS,
  TEXT_STYLES,
  SPACING,
  RADIUS,
  SHADOWS,
  COMPONENT_SIZES,
} from '../../utils/designSystem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Confirmation Dialog
 * Ask user to confirm an action
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  icon = 'help-circle',
  iconColor = BRAND_COLORS.info,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  loading = false,
}) {
  const confirmColor = isDangerous ? BRAND_COLORS.danger : BRAND_COLORS.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={icon}
              size={COMPONENT_SIZES.icon.lg}
              color={iconColor}
            />
          </View>

          <Text style={TEXT_STYLES.headingSmall}>{title}</Text>

          {message && (
            <Text
              style={[
                TEXT_STYLES.bodySmall,
                { color: BRAND_COLORS.textMuted, marginTop: SPACING.md },
              ]}
            >
              {message}
            </Text>
          )}

          <View style={styles.dialogActions}>
            <Button
              title={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              size="md"
              disabled={loading}
            />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              variant={isDangerous ? 'danger' : 'primary'}
              size="md"
              loading={loading}
              style={{ marginLeft: SPACING.md }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Alert Dialog
 * Show an alert message
 */
export function AlertDialog({
  visible,
  title,
  message,
  icon = 'information',
  type = 'info', // info, success, warning, error
  actionLabel = 'OK',
  onAction,
}) {
  const iconColors = {
    info: BRAND_COLORS.info,
    success: BRAND_COLORS.success,
    warning: BRAND_COLORS.warning,
    error: BRAND_COLORS.danger,
  };

  const bgColors = {
    info: BRAND_COLORS.infoLight,
    success: BRAND_COLORS.successLight,
    warning: BRAND_COLORS.warningLight,
    error: BRAND_COLORS.dangerLight,
  };

  const iconNames = {
    info: 'information-outline',
    success: 'check-circle-outline',
    warning: 'alert-outline',
    error: 'alert-circle-outline',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAction}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={[styles.iconBox, { backgroundColor: bgColors[type] }]}>
            <MaterialCommunityIcons
              name={iconNames[type]}
              size={COMPONENT_SIZES.icon.lg}
              color={iconColors[type]}
            />
          </View>

          <Text style={TEXT_STYLES.headingSmall}>{title}</Text>

          {message && (
            <Text
              style={[
                TEXT_STYLES.bodySmall,
                { color: BRAND_COLORS.textMuted, marginTop: SPACING.md },
              ]}
            >
              {message}
            </Text>
          )}

          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </View>
    </Modal>
  );
}

/**
 * Bottom Sheet Modal
 * Slide-up modal for forms and options
 */
export function BottomSheetModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  height = 0.8,
  showHandle = true,
}) {
  const sheetHeight = SCREEN_HEIGHT * height;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <TouchableOpacity
          style={styles.bottomSheetBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.bottomSheetContainer,
            { maxHeight: sheetHeight },
          ]}
        >
          {showHandle && <View style={styles.handle} />}

          {title && (
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.headingSmall}>{title}</Text>
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
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons
                  name="close"
                  size={COMPONENT_SIZES.icon.md}
                  color={BRAND_COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sheetContent}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Loading Dialog
 * Show loading with message
 */
export function LoadingDialog({ visible, message = 'Loading...' }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, styles.loadingOverlay]}>
        <View style={styles.loadingBox}>
          <MaterialCommunityIcons
            name="loading"
            size={COMPONENT_SIZES.icon.lg}
            color={BRAND_COLORS.accent}
            style={styles.loadingSpinner}
          />
          <Text
            style={[
              TEXT_STYLES.bodyMedium,
              { color: BRAND_COLORS.text, marginTop: SPACING.md },
            ]}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BRAND_COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    justifyContent: 'center',
  },
  dialogContainer: {
    backgroundColor: BRAND_COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '85%',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  loadingBox: {
    backgroundColor: BRAND_COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: BRAND_COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dialogActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    width: '100%',
    justifyContent: 'space-between',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: BRAND_COLORS.overlay,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: BRAND_COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: BRAND_COLORS.border,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.divider,
    alignItems: 'flex-start',
  },
  sheetContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  loadingSpinner: {
    alignSelf: 'center',
  },
});

export default ConfirmDialog;

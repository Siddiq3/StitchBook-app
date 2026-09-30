/**
 * Unified Design System for StitchBook (Mobile + Web)
 * Production-ready design tokens and utilities
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ============================================================================
// COLOR SYSTEM - Modern mobile SaaS palette for small business workflows.
// ============================================================================

export const BRAND_COLORS = {
  // Primary brand colors
  primary: '#1A56DB',
  primaryLight: '#EEF4FF',
  primaryDark: '#123E9C',

  // Accent colors
  accent: '#6366F1',
  accentLight: '#EEF2FF',
  accentDark: '#4338CA',

  // Semantic colors
  success: '#16A34A',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',

  // Neutral palette
  white: '#FFFFFF',
  background: '#F5F7FA',
  lightBg: '#F1F5F9',
  border: '#CBD5E1',
  borderStrong: '#94A3B8',
  divider: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textDisabled: '#CBD5E1',

  // Status colors
  pending: '#D97706',
  progress: '#1A56DB',
  ready: '#0F766E',
  delivered: '#16A34A',
  cancelled: '#DC2626',

  // Overlay/Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',
  overlayTint: 'rgba(37, 99, 235, 0.1)',
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const TYPOGRAPHY = {
  // Font sizes (in pixels)
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 22,
    display: 28,
    hero: 32,
  },
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  // Line heights
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Letter spacing
  letterSpacing: {
    tight: 0,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Predefined text styles
export const TEXT_STYLES = {
  displayLarge: {
    fontSize: TYPOGRAPHY.sizes.hero,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 38,
  },
  displayMedium: {
    fontSize: TYPOGRAPHY.sizes.display,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 34,
  },
  headingLarge: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 28,
  },
  headingMedium: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 24,
  },
  headingSmall: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 18,
  },
  labelLarge: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.regular,
    lineHeight: 14,
  },
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const RADIUS = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: (color = BRAND_COLORS.accent) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const COMPONENT_SIZES = {
  // Button sizes
  button: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 48, paddingHorizontal: 20 },
    xl: { height: 56, paddingHorizontal: 24 },
  },
  // Input sizes
  input: {
    sm: { height: 36, paddingHorizontal: 12 },
    md: { height: 44, paddingHorizontal: 14 },
    lg: { height: 52, paddingHorizontal: 16 },
  },
  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const wp = (percent) => (SCREEN_W * percent) / 100;
export const hp = (percent) => (SCREEN_H * percent) / 100;
export const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size));

export const SCREEN = {
  width: SCREEN_W,
  height: SCREEN_H,
  isSmallDevice: SCREEN_W < 375,
  isLargeDevice: SCREEN_W > 428,
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
};

// ============================================================================
// OVERLAY/MODAL OPACITIES
// ============================================================================

export const OPACITIES = {
  disabled: 0.5,
  hover: 0.08,
  active: 0.12,
  focus: 0.16,
  loading: 0.7,
};

// ============================================================================
// DEPRECATED: Legacy color mapping for backward compatibility
// ============================================================================

export const colors123 = {
  primary: BRAND_COLORS.primary,
  primaryDark: BRAND_COLORS.primaryDark,
  primaryLight: BRAND_COLORS.primaryLight,
  primarySoft: BRAND_COLORS.primaryLight,
  accent: BRAND_COLORS.accent,
  secondary: BRAND_COLORS.accent,
  success: BRAND_COLORS.success,
  successLight: BRAND_COLORS.successLight,
  warning: BRAND_COLORS.warning,
  warningLight: BRAND_COLORS.warningLight,
  danger: BRAND_COLORS.danger,
  dangerLight: BRAND_COLORS.dangerLight,
  info: BRAND_COLORS.info,
  infoLight: BRAND_COLORS.infoLight,
  background: BRAND_COLORS.background,
  surface: BRAND_COLORS.white,
  border: BRAND_COLORS.border,
  text: BRAND_COLORS.text,
  textSecondary: BRAND_COLORS.textSecondary,
  textMuted: BRAND_COLORS.textMuted,
  white: BRAND_COLORS.white,
  overlay: BRAND_COLORS.overlay,
  bgInput: BRAND_COLORS.lightBg,
};

export const SIZES = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 22,
  huge: 28,
  xs2: 4,
  xs3: 6,
  sm2: 8,
  sm3: 10,
  md2: 12,
  md3: 16,
  lg2: 20,
  lg3: 24,
  xl2: 32,
  xl3: 40,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 999,
  inputH: 48,
  buttonH: 52,
  buttonHSm: 40,
  tabBarH: 64,
  headerH: 56,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const fonts = {
  xs: { fontSize: 12 },
  sm: { fontSize: 13 },
  base: { fontSize: 15 },
  lg: { fontSize: 16 },
  xl: { fontSize: 18 },
  xxl: { fontSize: 20 },
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const SHADOWS_LEGACY = {
  sm: SHADOWS.sm,
  md: SHADOWS.md,
  lg: SHADOWS.lg,
};

export const shadows = {
  card: SHADOWS.md,
  soft: SHADOWS.sm,
};

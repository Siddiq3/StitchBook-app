// Compatibility facade. Palette, spacing, families and elevation live in theme.js.
import {
  COLORS,
  colors123,
  fonts,
  FONTS,
  SIZES,
  spacing,
  radius,
  SHADOWS,
  SCREEN_W,
  SCREEN_H,
} from "./theme";
export {
  colors123,
  fonts,
  FONTS,
  SIZES,
  spacing,
  radius,
  SHADOWS,
  shadows,
  wp,
  hp,
  normalize,
} from "./theme";
export const BRAND_COLORS = {
  ...COLORS,
  white: COLORS.surface,
  lightBg: colors123.surfaceMuted,
  accentLight: COLORS.primaryLight,
  accentDark: COLORS.primaryDark,
  borderStrong: COLORS.border,
  divider: COLORS.borderLight,
  textDisabled: COLORS.textMuted,
  pending: COLORS.pendingText,
  progress: COLORS.progressText,
  ready: COLORS.readyText,
  delivered: COLORS.deliveredText,
  cancelled: COLORS.danger,
  overlayLight: "rgba(17,24,39,0.08)",
  overlayTint: COLORS.primaryLight,
};
export const SPACING = { ...spacing, xxxl: 40, huge: 48, massive: 64 };
export const RADIUS = { ...radius, none: 0, xxl: radius.xl, full: radius.pill };
export const TYPOGRAPHY = {
  sizes: { ...SIZES, display: 30, hero: 30 },
  weights: FONTS,
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: { tight: 0, normal: 0, wide: 0.5, wider: 1 },
};
const text = (fontSize, lineHeight, fontFamily = fonts.regular) => ({
  fontSize,
  lineHeight,
  fontFamily,
});
export const TEXT_STYLES = {
  displayLarge: text(30, 36, fonts.bold),
  displayMedium: text(30, 36, fonts.bold),
  headingLarge: text(24, 30, fonts.semibold),
  headingMedium: text(20, 26, fonts.semibold),
  headingSmall: text(17, 23, fonts.semibold),
  bodyLarge: text(17, 25),
  bodyMedium: text(15, 22),
  bodySmall: text(13, 20),
  labelLarge: text(15, 22, fonts.medium),
  labelMedium: text(13, 18, fonts.medium),
  labelSmall: text(12, 16, fonts.medium),
  caption: text(12, 18, fonts.medium),
};
export const COMPONENT_SIZES = {
  button: {
    sm: { height: 44, paddingHorizontal: 12 },
    md: { height: 48, paddingHorizontal: 16 },
    lg: { height: 52, paddingHorizontal: 20 },
    xl: { height: 56, paddingHorizontal: 24 },
  },
  input: {
    sm: { height: 48, paddingHorizontal: 12 },
    md: { height: 48, paddingHorizontal: 16 },
    lg: { height: 52, paddingHorizontal: 16 },
  },
  avatar: { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 },
  icon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
};
export const SCREEN = {
  width: SCREEN_W,
  height: SCREEN_H,
  isSmallDevice: SCREEN_W < 380,
  isLargeDevice: SCREEN_W >= 600,
};
export const ANIMATIONS = { fast: 150, normal: 200, slow: 200, slower: 200 };
export const OPACITIES = {
  disabled: 0.5,
  hover: 0.08,
  active: 0.12,
  focus: 0.16,
  loading: 0.7,
};
export const SHADOWS_LEGACY = SHADOWS;

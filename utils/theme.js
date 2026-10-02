import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/**
 * StitchBook visual system
 * Warm tailoring identity + restrained neutral operational surfaces.
 * Business logic should consume semantic roles instead of one-off colors.
 */
export const COLORS = {
  primary: "#E2511E",
  primaryPressed: "#B83E15",
  primaryLight: "#FEF1EA",
  primaryDark: "#B83E15",
  accent: "#E2511E",

  success: "#15803D",
  successLight: "#F0FDF4",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#BE123C",
  dangerLight: "#FEF2F2",
  info: "#1D4ED8",
  infoLight: "#EFF6FF",

  text: "#101014",
  textSecondary: "#45454F",
  textMuted: "#5B5B66",
  textDisabled: "#8A8A95",
  border: "#D3D3D9",
  borderLight: "#E6E6EA",
  borderSubtle: "#EEEEF1",
  background: "#F4F4F6",
  surface: "#FFFFFF",
  surfaceMuted: "#EEEEF1",
  overlay: "rgba(16,16,20,0.52)",

  pendingBg: "#EEEEF1",
  pendingText: "#45454F",
  progressBg: "#EFF6FF",
  progressText: "#1D4ED8",
  readyBg: "#F0FDF4",
  readyText: "#15803D",
  deliveredBg: "#F0FDF4",
  deliveredText: "#166534",
  urgentBg: "#FEF2F2",
  urgentText: "#BE123C",

  avatarColors: [
    "#E2511E",
    "#B83E15",
    "#0F766E",
    "#B45309",
    "#1D4ED8",
    "#15803D",
    "#BE123C",
    "#475569",
  ],

  statPrimary: "#E2511E",
  statSuccess: "#15803D",
  statWarning: "#B45309",
  statPurple: "#7C3AED",
  statDanger: "#BE123C",
  statInfo: "#1D4ED8",
};

export const colors123 = {
  primary: COLORS.primary,
  primaryPressed: COLORS.primaryPressed,
  primaryDark: COLORS.primaryDark,
  primarySoft: COLORS.primaryLight,
  primaryLight: COLORS.primaryLight,
  accent: COLORS.accent,
  secondary: COLORS.textSecondary,
  success: COLORS.success,
  successSoft: COLORS.successLight,
  successLight: COLORS.successLight,
  warning: COLORS.warning,
  warningSoft: COLORS.warningLight,
  warningLight: COLORS.warningLight,
  info: COLORS.info,
  infoSoft: COLORS.infoLight,
  infoLight: COLORS.infoLight,
  danger: COLORS.danger,
  dangerSoft: COLORS.dangerLight,
  dangerLight: COLORS.dangerLight,
  error: COLORS.danger,
  background: COLORS.background,
  backgroundAccent: COLORS.primaryLight,
  surface: COLORS.surface,
  surfaceElevated: COLORS.surface,
  surfaceMuted: COLORS.surfaceMuted,
  card: COLORS.surface,
  border: COLORS.border,
  borderLight: COLORS.borderLight,
  borderSubtle: COLORS.borderSubtle,
  borderStrong: COLORS.border,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textDisabled: COLORS.textDisabled,
  textSoft: COLORS.textSecondary,
  white: COLORS.surface,
  shadow: "rgba(16,16,20,0.08)",
  overlay: COLORS.overlay,
  pendingBg: COLORS.pendingBg,
  pendingText: COLORS.pendingText,
  progressBg: COLORS.progressBg,
  progressText: COLORS.progressText,
  readyBg: COLORS.readyBg,
  readyText: COLORS.readyText,
  deliveredBg: COLORS.deliveredBg,
  deliveredText: COLORS.deliveredText,
  urgentBg: COLORS.urgentBg,
  urgentText: COLORS.urgentText,
  transparent: "transparent",
  bgInput: COLORS.surface,
};

export const FONTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "700",
};

export const SIZES = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 15.5,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  huge: 34,

  xs2: 4,
  xs3: 6,
  sm2: 8,
  sm3: 12,
  md2: 12,
  md3: 16,
  lg2: 24,
  lg3: 24,
  xl2: 32,
  xl3: 48,

  radiusSm: 12,
  radiusMd: 18,
  radiusLg: 22,
  radiusXl: 28,
  radiusFull: 999,

  inputH: 50,
  buttonH: 50,
  buttonHSm: 44,
  tabBarH: 68,
  headerH: 56,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const fonts = {
  xs: { fontSize: 12 },
  sm: { fontSize: 13 },
  base: { fontSize: 15.5 },
  lg: { fontSize: 18 },
  xl: { fontSize: 20 },
  xxl: { fontSize: 24 },
  display: { fontSize: 34 },
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_700Bold",
};

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: fonts.bold, letterSpacing: -1 },
  h1: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 30, fontFamily: fonts.semibold, letterSpacing: -0.4 },
  h3: { fontSize: 18, lineHeight: 26, fontFamily: fonts.semibold },
  body: { fontSize: 15.5, lineHeight: 23, fontFamily: fonts.regular },
  small: { fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  label: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold },
  caption: { fontSize: 12, lineHeight: 18, fontFamily: fonts.regular },
};

const flatShadow = { shadowOpacity: 0, shadowRadius: 0, elevation: 0 };
export const SHADOWS = {
  none: flatShadow,
  xs: flatShadow,
  sm: flatShadow,
  md: flatShadow,
  lg: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 7,
  },
  xl: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 10,
  },
  colored: () => flatShadow,
};

export const shadows = { card: SHADOWS.none, soft: SHADOWS.none, floating: SHADOWS.lg };

export const motion = { fast: 180, base: 280, slow: 440 };
export const wp = (percent) => (SCREEN_W * percent) / 100;
export const hp = (percent) => (SCREEN_H * percent) / 100;
export const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size));
export { SCREEN_W, SCREEN_H };

export const navigationTheme = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.borderLight,
    notification: COLORS.danger,
  },
};

export const normalizeStatus = (status = "") =>
  String(status).trim().toLowerCase().replace(/[\s-]+/g, "_");

export const statusToneMap = {
  pending: { bg: colors123.pendingBg, color: colors123.pendingText, border: colors123.borderLight, labelKey: "pending" },
  new: { bg: colors123.pendingBg, color: colors123.pendingText, border: colors123.borderLight, labelKey: "pending" },
  started: { bg: colors123.pendingBg, color: colors123.pendingText, border: colors123.borderLight, labelKey: "pending" },
  cutting: { bg: colors123.infoLight, color: colors123.info, border: colors123.borderLight, labelKey: "cutting" },
  stitching: { bg: colors123.primaryLight, color: colors123.primaryDark, border: colors123.borderLight, labelKey: "stitching" },
  in_progress: { bg: colors123.infoLight, color: colors123.info, border: colors123.borderLight, labelKey: "inProgress" },
  ready: { bg: colors123.readyBg, color: colors123.readyText, border: colors123.borderLight, labelKey: "ready" },
  delivered: { bg: colors123.deliveredBg, color: colors123.deliveredText, border: colors123.borderLight, labelKey: "delivered" },
  urgent: { bg: colors123.urgentBg, color: colors123.urgentText, border: colors123.borderLight, labelKey: "urgent" },
  overdue: { bg: colors123.urgentBg, color: colors123.urgentText, border: colors123.borderLight, labelKey: "overdue" },
  cancelled: { bg: colors123.urgentBg, color: colors123.urgentText, border: colors123.borderLight, labelKey: "cancelled" },
};

export function getStatusTone(status) {
  return statusToneMap[normalizeStatus(status)] || {
    bg: colors123.surfaceMuted,
    color: colors123.textSecondary,
    border: colors123.borderLight,
  };
}

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function formatCompactCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount || 0));
}

export function getInitials(name = "") {
  return name.split(" ").filter(Boolean).map((chunk) => chunk[0]).join("").slice(0, 2).toUpperCase();
}

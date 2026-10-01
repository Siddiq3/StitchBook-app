import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export const COLORS = {
  // Roles shared by every mobile surface; compatibility aliases remain below.
  primary: "#C2410C",
  primaryLight: "#FEF1EA",
  primaryDark: "#9A3412",
  accent: "#9A3412",

  // Semantic
  success: "#15803D",
  successLight: "#F0FDF4",
  warning: "#B45309",
  warningLight: "#FFFBEB",
  danger: "#BE123C",
  dangerLight: "#FEF2F2",
  info: "#0369A1",
  infoLight: "#F0F9FF",

  // Neutrals (slate/ash scale)
  text: "#101014",
  textSecondary: "#45454F",
  textMuted: "#5B5B66",
  border: "#D3D3D9",
  borderLight: "#E6E6EA",
  background: "#F4F4F6",
  surface: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",

  // Status badge backgrounds + text (exact pairs)
  pendingBg: "#EEEEF1",
  pendingText: "#45454F",
  progressBg: "#EFF6FF",
  progressText: "#C2410C",
  readyBg: "#F0FDF4",
  readyText: "#15803D",
  deliveredBg: "#F0FDF4",
  deliveredText: "#166534",
  urgentBg: "#FEF2F2",
  urgentText: "#BE123C",

  // Avatar colors123 (rotate through these)
  avatarColors: [
    "#C2410C",
    "#9A3412",
    "#0F766E",
    "#B45309",
    "#0369A1",
    "#15803D",
    "#BE123C",
    "#475569",
  ],

  // Stat card colors123 (one per card)
  statPrimary: "#C2410C",
  statSuccess: "#15803D",
  statWarning: "#B45309",
  statPurple: "#9A3412",
  statDanger: "#BE123C",
  statInfo: "#0369A1",
};

// Legacy color mapping for existing code compatibility
export const colors123 = {
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  primarySoft: COLORS.primaryLight,
  primaryLight: COLORS.primaryLight,
  accent: COLORS.accent,
  secondary: COLORS.accent,
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
  background: COLORS.background,
  backgroundAccent: "#FEF1EA",
  surface: COLORS.surface,
  surfaceMuted: "#EEEEF1",
  card: COLORS.surface,
  border: COLORS.border,
  borderLight: COLORS.borderLight,
  borderStrong: COLORS.border,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textSoft: COLORS.textSecondary,
  white: COLORS.surface,
  shadow: "rgba(15,23,42,0.08)",
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
  error: COLORS.danger,
  transparent: "transparent",
  bgInput: "#F4F4F6",
};

export const FONTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
};

export const SIZES = {
  // Text sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 22,
  huge: 28,

  // Spacing
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

  // Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 999,

  // Heights
  inputH: 48,
  buttonH: 52,
  buttonHSm: 44,
  tabBarH: 64,
  headerH: 56,
};

// Legacy spacing mapping for existing code
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Legacy radius mapping for existing code
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

// Legacy fonts mapping for existing code
export const fonts = {
  xs: { fontSize: 12 },
  sm: { fontSize: 13 },
  base: { fontSize: 15 },
  lg: { fontSize: 16 },
  xl: { fontSize: 18 },
  xxl: { fontSize: 20 },
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_600SemiBold",
};

// Elevation is reserved for floating layers. Existing card aliases stay flat.
const flatShadow = { shadowOpacity: 0, shadowRadius: 0, elevation: 0 };
export const SHADOWS = {
  none: flatShadow,
  xs: flatShadow,
  sm: flatShadow,
  md: flatShadow,
  lg: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: () => flatShadow,
};
export const shadows = {
  card: SHADOWS.none,
  soft: SHADOWS.none,
  floating: SHADOWS.lg,
};

// Responsive helpers
export const wp = (percent) => (SCREEN_W * percent) / 100;
export const hp = (percent) => (SCREEN_H * percent) / 100;

export const normalize = (size) => {
  return Math.round(PixelRatio.roundToNearestPixel(size));
};

export { SCREEN_W, SCREEN_H };

export const navigationTheme = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

export const normalizeStatus = (status = "") =>
  String(status)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
export const statusToneMap = {
  pending: {
    bg: colors123.pendingBg,
    color: colors123.pendingText,
    border: colors123.borderLight,
    labelKey: "pending",
  },
  new: {
    bg: colors123.pendingBg,
    color: colors123.pendingText,
    border: colors123.borderLight,
    labelKey: "pending",
  },
  started: {
    bg: colors123.pendingBg,
    color: colors123.pendingText,
    border: colors123.borderLight,
    labelKey: "pending",
  },
  cutting: {
    bg: colors123.progressBg,
    color: colors123.progressText,
    border: colors123.primaryLight,
    labelKey: "cutting",
  },
  stitching: {
    bg: colors123.progressBg,
    color: colors123.progressText,
    border: colors123.primaryLight,
    labelKey: "stitching",
  },
  in_progress: {
    bg: colors123.progressBg,
    color: colors123.progressText,
    border: colors123.primaryLight,
    labelKey: "inProgress",
  },
  ready: {
    bg: colors123.readyBg,
    color: colors123.readyText,
    border: colors123.successLight,
    labelKey: "ready",
  },
  delivered: {
    bg: colors123.deliveredBg,
    color: colors123.deliveredText,
    border: colors123.successLight,
    labelKey: "delivered",
  },
  urgent: {
    bg: colors123.urgentBg,
    color: colors123.urgentText,
    border: colors123.dangerLight,
    labelKey: "urgent",
  },
  overdue: {
    bg: colors123.urgentBg,
    color: colors123.urgentText,
    border: colors123.dangerLight,
    labelKey: "overdue",
  },
  cancelled: {
    bg: colors123.urgentBg,
    color: colors123.urgentText,
    border: colors123.dangerLight,
    labelKey: "cancelled",
  },
};
export function getStatusTone(status) {
  return (
    statusToneMap[normalizeStatus(status)] || {
      bg: colors123.surfaceMuted,
      color: colors123.textSecondary,
      border: colors123.borderLight,
    }
  );
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
  return name
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const COLORS = {
  // Primary brand: modern service-app blue with tailoring-friendly teal support.
  primary:       '#1A56DB',
  primaryLight:  '#EEF4FF',
  primaryDark:   '#123E9C',
  accent:        '#6366F1',

  // Semantic
  success:       '#16A34A',
  successLight:  '#ECFDF5',
  warning:       '#D97706',
  warningLight:  '#FFFBEB',
  danger:        '#DC2626',
  dangerLight:   '#FEF2F2',
  info:          '#0284C7',
  infoLight:     '#F0F9FF',

  // Neutrals (slate/ash scale)
  text:          '#0F172A',
  textSecondary: '#334155',
  textMuted:     '#64748B',
  border:        '#CBD5E1',
  borderLight:   '#E2E8F0',
  background:    '#F5F7FA',
  surface:       '#FFFFFF',
  overlay:       'rgba(0,0,0,0.5)',

  // Status badge backgrounds + text (exact pairs)
  pendingBg:     '#FFFBEB',
  pendingText:   '#92400E',
  progressBg:    '#EFF6FF',
  progressText:  '#1A56DB',
  readyBg:       '#F0FDFA',
  readyText:     '#0F766E',
  deliveredBg:   '#ECFDF5',
  deliveredText: '#166534',
  urgentBg:      '#FEF2F2',
  urgentText:    '#B91C1C',

  // Avatar colors123 (rotate through these)
  avatarColors: [
    '#1A56DB','#6366F1','#0F766E','#D97706',
    '#0284C7','#16A34A','#DC2626','#475569',
  ],

  // Stat card colors123 (one per card)
  statPrimary:  '#1A56DB',
  statSuccess:  '#16A34A',
  statWarning:  '#D97706',
  statPurple:   '#6366F1',
  statDanger:   '#DC2626',
  statInfo:     '#0284C7',
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
  backgroundAccent: '#EEF4FF',
  surface: COLORS.surface,
  surfaceMuted: '#F1F5F9',
  card: COLORS.surface,
  border: COLORS.border,
  borderStrong: COLORS.border,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textSoft: COLORS.textSecondary,
  white: COLORS.surface,
  shadow: 'rgba(15,23,42,0.08)',
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
  error:       COLORS.danger,
  transparent: 'transparent',
  bgInput:     '#F8FAFC',
};

export const FONTS = {
  regular:    '400',
  medium:     '500',
  semibold:   '600',
  bold:       '700',
  extraBold:  '800',
};

export const SIZES = {
  // Text sizes
  xs:   11,
  sm:   12,
  base: 14,
  md:   15,
  lg:   16,
  xl:   18,
  xxl:  20,
  xxxl: 22,
  huge: 28,

  // Spacing
  xs2:  4,
  xs3:  6,
  sm2:  8,
  sm3:  10,
  md2:  12,
  md3:  16,
  lg2:  20,
  lg3:  24,
  xl2:  32,
  xl3:  40,

  // Radius
  radiusSm:   8,
  radiusMd:   12,
  radiusLg:   16,
  radiusXl:   20,
  radiusFull: 999,

  // Heights
  inputH:     48,
  buttonH:    52,
  buttonHSm:  40,
  tabBarH:    64,
  headerH:    56,
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
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 0,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  colored: (color) => ({
  shadowColor: color || '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  }),
};

// Legacy shadows mapping
export const shadows = {
  card: SHADOWS.md,
  soft: SHADOWS.sm,
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

export const statusToneMap = {
  Pending: { bg: colors123.pendingBg, color: colors123.pendingText, border: colors123.warning },
  "In Progress": { bg: colors123.progressBg, color: colors123.progressText, border: colors123.info },
  Ready: { bg: colors123.readyBg, color: colors123.readyText, border: colors123.success },
  Delivered: { bg: colors123.deliveredBg, color: colors123.deliveredText, border: colors123.text },
};

export function getStatusTone(status) {
  return statusToneMap[status] || statusToneMap.Pending;
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

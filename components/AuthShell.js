import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandMark } from "./BrandLogo";
import Reveal from "./Reveal";
import { useLanguage } from "../context/LanguageContext";
import { colors123, fonts, radius, spacing, typography, shadows } from "../utils/theme";

const FEATURES = [
  { icon: "receipt-outline", label: 'authFeatureOrders' },
  { icon: "resize-outline", label: 'authFeatureMeasure' },
  { icon: "people-outline", label: 'authFeatureStaff' },
];

// Shared frame for sign in, sign up and password reset: gradient brand header,
// the form on a raised card, and a feature strip that fills the space below.
export default function AuthShell({ title, subtitle, onBack, step, children, footer }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={[s.hero, { paddingTop: insets.top + spacing.md }]}>
          <View style={s.topRow}>
            {onBack ? (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('authBack')} onPress={onBack} hitSlop={8} style={s.back}>
                <Ionicons name="arrow-back" size={22} color={colors123.surface} />
              </TouchableOpacity>
            ) : (
              <BrandMark size={40} light />
            )}
            <View style={s.secure}>
              <Ionicons name="shield-checkmark" size={14} color={colors123.surface} />
              <Text style={s.secureText}>{step || t('authSecure')}</Text>
            </View>
          </View>
          <Text accessibilityRole="header" style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        </View>

        <Reveal style={s.card}>{children}</Reveal>
        {footer ? <Reveal index={1}>{footer}</Reveal> : null}

        <View style={s.spacer} />
        <Reveal index={2} style={s.features}>
          {FEATURES.map((item) => (
            <View key={item.label} style={s.feature}>
              <View style={s.featureIcon}>
                <Ionicons name={item.icon} size={18} color={colors123.primary} />
              </View>
              <Text style={s.featureText}>{t(item.label)}</Text>
            </View>
          ))}
        </Reveal>
        <Text style={s.brandFoot}>{t('authFooter')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  scroll: { flexGrow: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 72,
    overflow: "hidden",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: colors123.primary,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)" },
  secure: {
    flexDirection: "row", alignItems: "center", gap: 6, minHeight: 32, paddingHorizontal: 12,
    borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.24)",
  },
  secureText: { fontFamily: fonts.semibold, fontSize: 12, color: colors123.surface },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 35, letterSpacing: -0.5, color: colors123.surface, marginTop: spacing.lg },
  subtitle: { ...typography.small, color: "rgba(255,255,255,0.88)", marginTop: 6, maxWidth: 360 },
  card: {
    marginHorizontal: 16,
    marginTop: -48,
    gap: spacing.md,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors123.surface,
    ...shadows.floating,
    shadowOpacity: 0.1,
  },
  spacer: { flexGrow: 1, minHeight: spacing.lg },
  features: {
    marginHorizontal: 16,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderSubtle,
  },
  feature: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  featureIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors123.primarySoft },
  featureText: { ...typography.small, fontFamily: fonts.medium, color: colors123.textSecondary },
  brandFoot: { ...typography.caption, color: colors123.textMuted, textAlign: "center", marginTop: spacing.md },
});

import React, { useEffect, useState } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import IconInput from "../components/IconInput";
import AppButton from "../components/AppButton";
import Reveal from "../components/Reveal";
import { colors123, fonts, radius, SHADOWS, spacing, typography } from "../utils/theme";
import { formatPhone, normalizePhone } from "../utils/formHelpers";

const initialsOf = (name) => {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "SB";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
};

// Shop setup after sign-up, in the same step style as sign-up. The card at the top
// previews the shop as it is typed, so each step visibly builds something.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { createShop, user, logout } = useStitchPro();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: user?.phone ? formatPhone(user.phone) : "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setErrors({}); };

  const back = () => { setStep((s) => Math.max(1, s - 1)); setErrors({}); };

  // This screen is outside the navigator, so Android back is handled here
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 1 && !loading) { back(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [step, loading]);

  const next = () => {
    if (step === 1 && !form.name.trim()) { setErrors({ name: t("shopNameRequired") }); return; }
    if (step === 2 && !form.phone.trim()) { setErrors({ phone: t("phoneRequired") }); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const create = async () => {
    setLoading(true);
    try {
      await createShop({
        name: form.name.trim(),
        phone: normalizePhone(form.phone) || form.phone.trim(),
        location: form.location.trim() || undefined,
      });
      showToast(t("shopCreatedSuccess"), "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const title = { 1: t("askShopName"), 2: t("addContactDetails"), 3: t("reviewShopDetails") }[step];
  const reviewRows = [
    { key: "name", icon: "storefront-outline", label: t("shopName"), value: form.name.trim(), step: 1 },
    { key: "phone", icon: "call-outline", label: t("phone"), value: formatPhone(form.phone), step: 2 },
    { key: "location", icon: "location-outline", label: t("location"), value: form.location.trim() || t("notProvided"), step: 2 },
  ];

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="dark" />
      <View style={[s.topBar, { paddingTop: insets.top + spacing.xs }]}>
        {step > 1 ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")} onPress={back} disabled={loading} hitSlop={8} style={s.back}>
            <Ionicons name="arrow-back" size={22} color={colors123.text} />
          </TouchableOpacity>
        ) : null}
        <View style={s.progress}>
          {[1, 2, 3].map((n) => <View key={n} style={[s.progressBar, n <= step && s.progressBarActive]} />)}
        </View>
        <Text style={s.stepLabel}>{step} of 3</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + spacing.md }]}>
        <Reveal>
          <LinearGradient colors={["#1A8CFF", colors123.primary, "#0057B8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.preview}>
            <View style={s.previewGlow} />
            <View style={s.previewAvatar}>
              <Text style={s.previewInitials}>{initialsOf(form.name)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.previewEyebrow}>{t("yourShop")}</Text>
              <Text style={s.previewName} numberOfLines={1}>{form.name.trim() || t("royalTailorsPlaceholder")}</Text>
              <View style={s.previewMeta}>
                {form.phone.trim() ? <Text style={s.previewMetaText} numberOfLines={1}>{formatPhone(form.phone)}</Text> : null}
                {form.location.trim() ? <Text style={s.previewMetaText} numberOfLines={1}>· {form.location.trim()}</Text> : null}
              </View>
            </View>
          </LinearGradient>
        </Reveal>

        <Reveal key={step} index={1} style={s.body}>
          <Text accessibilityRole="header" style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{t("setupYourShop")}</Text>

          {step === 1 ? (
            <View style={s.fields}>
              <IconInput icon="store-outline" value={form.name} onChangeText={set("name")} placeholder={t("royalTailorsPlaceholder")} autoCapitalize="words" returnKeyType="next" onSubmitEditing={next} error={errors.name} accessibilityLabel={t("shopName")} />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={s.fields}>
              <IconInput label={t("phoneNumber")} icon="phone-outline" value={form.phone} onChangeText={set("phone")} placeholder={t("enterPhoneNumber")} keyboardType="phone-pad" error={errors.phone} />
              <IconInput label={t("locationOptional")} icon="map-marker-outline" value={form.location} onChangeText={set("location")} placeholder={t("locationPlaceholder")} autoCapitalize="words" returnKeyType="next" onSubmitEditing={next} />
            </View>
          ) : null}

          {step === 3 ? (
            <View style={s.review}>
              {reviewRows.map((row, i) => (
                <View key={row.key} style={[s.reviewRow, i < reviewRows.length - 1 && s.reviewDivider]}>
                  <View style={s.reviewIcon}><Ionicons name={row.icon} size={18} color={colors123.primary} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.reviewLabel}>{row.label}</Text>
                    <Text style={s.reviewValue} numberOfLines={2}>{row.value}</Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${t("edit")} ${row.label}`} onPress={() => setStep(row.step)} hitSlop={8} disabled={loading}>
                    <Text style={s.link}>{t("edit")}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
        </Reveal>

        <View style={s.footer}>
          <AppButton
            label={step === 3 ? t("createShop") : t("next")}
            size="lg"
            loading={loading}
            onPress={step === 3 ? create : next}
          />
          {step === 1 ? (
            <TouchableOpacity accessibilityRole="button" onPress={logout} style={s.signOut}>
              <Text style={s.signOutText}>{t("logout")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  topBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.xs, minHeight: 52 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderLight },
  progress: { flex: 1, flexDirection: "row", gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors123.borderLight },
  progressBarActive: { backgroundColor: colors123.primary },
  stepLabel: { ...typography.caption, fontFamily: fonts.semibold, color: colors123.textMuted, minWidth: 36, textAlign: "right" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: spacing.md },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...SHADOWS.lg,
    shadowColor: colors123.primary,
    shadowOpacity: 0.25,
  },
  previewGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -60, top: -80, backgroundColor: "rgba(255,255,255,0.12)" },
  previewAvatar: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors123.surface },
  previewInitials: { fontFamily: fonts.bold, fontSize: 20, color: colors123.primary },
  previewEyebrow: { fontFamily: fonts.semibold, fontSize: 12, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.4 },
  previewName: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: colors123.surface, marginTop: 2 },
  previewMeta: { flexDirection: "row", gap: 4, marginTop: 2 },
  previewMetaText: { fontFamily: fonts.regular, fontSize: 13, color: "rgba(255,255,255,0.85)", flexShrink: 1 },
  body: { paddingTop: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 33, letterSpacing: -0.5, color: colors123.text },
  subtitle: { ...typography.body, color: colors123.textSecondary, marginTop: 6 },
  fields: { gap: spacing.md, marginTop: spacing.lg },
  review: { marginTop: spacing.lg, borderRadius: radius.lg, backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderSubtle, paddingHorizontal: spacing.md, ...SHADOWS.sm },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  reviewDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors123.border },
  reviewIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors123.primarySoft },
  reviewLabel: { ...typography.caption, color: colors123.textMuted },
  reviewValue: { fontFamily: fonts.semibold, fontSize: 15, color: colors123.text },
  link: { ...typography.small, color: colors123.primary, fontFamily: fonts.semibold },
  footer: { marginTop: "auto", paddingTop: spacing.lg, gap: spacing.xs },
  signOut: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  signOutText: { ...typography.small, fontFamily: fonts.semibold, color: colors123.textMuted },
});

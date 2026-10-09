import React, { useEffect, useState } from "react";
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "./AccessibleMotionView";
import { BrandMark } from "./BrandLogo";
import AppButton from "./AppButton";
import StitchProgress from "./StitchProgress";
import { useLanguage } from "../context/LanguageContext";
import { colors123, fonts, spacing, typography } from "../utils/theme";

// One question per screen. The parent owns the step, form and validation; this
// frame handles the header, the stitched progress seam, the slide between steps
// (in the direction of travel), the scene that steps aside for the keyboard,
// Android back between steps, and the pinned primary button.
export default function StepFlow({
  step, total, direction = 1, active = true, onBack, onNext, nextLabel, loading = false,
  scene, title, subtitle, error, children, footer, hideBackOnFirst = false,
}) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Back steps back through the questions; on the first one it leaves (if allowed)
  useEffect(() => {
    if (!active) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (loading) return true;
      if (step > 0) { onBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [active, step, loading, onBack]);

  const canGoBack = step > 0 || !hideBackOnFirst;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="dark" />
      <View style={[s.header, { paddingTop: insets.top + spacing.xs }]}>
        <View style={s.headerRow}>
          {canGoBack ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("authBack")} onPress={onBack} disabled={loading} hitSlop={8} style={s.back}>
              <Ionicons name="arrow-back" size={22} color={colors123.text} />
            </TouchableOpacity>
          ) : <View style={s.backSpacer} />}
          <View style={s.brand}><BrandMark size={26} /></View>
          <Text style={s.count}>{t("authStepOf").replace("{n}", step + 1).replace("{total}", total)}</Text>
        </View>
        <StitchProgress step={step} total={total} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <MotiView
          key={step}
          from={{ opacity: 0, translateX: 28 * direction }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 280 }}
          style={s.stepBody}
        >
          <View style={s.heading}>
            <Text accessibilityRole="header" style={s.title}>{title}</Text>
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={s.fields}>{children}</View>
          {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
        </MotiView>
        {/* The card stays mounted across steps so its rows animate as they fill */}
        {!keyboardOpen && scene ? <View style={s.scene}>{scene}</View> : null}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <AppButton label={nextLabel} size="lg" loading={loading} onPress={onNext} />
        {!keyboardOpen && footer}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  header: { paddingHorizontal: 20, paddingBottom: spacing.sm, gap: spacing.md },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderLight },
  backSpacer: { width: 44, height: 44 },
  brand: { flex: 1, alignItems: "center" },
  count: { ...typography.caption, fontFamily: fonts.semibold, color: colors123.textMuted, minWidth: 44, textAlign: "right" },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: spacing.lg, paddingBottom: spacing.md },
  stepBody: { gap: spacing.lg },
  scene: { marginTop: spacing.lg },
  heading: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 35, letterSpacing: -0.6, color: colors123.text },
  subtitle: { ...typography.body, color: colors123.textSecondary },
  fields: { gap: spacing.md },
  error: { ...typography.small, color: colors123.danger },
  footer: { paddingHorizontal: 24, paddingTop: spacing.sm, gap: spacing.xs },
});

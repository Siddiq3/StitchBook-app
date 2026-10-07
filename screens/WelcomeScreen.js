import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandMark } from "../components/BrandLogo";
import FeatureSlides from "../components/FeatureSlides";
import Reveal from "../components/Reveal";
import AppButton from "../components/AppButton";
import { useLanguage } from "../context/LanguageContext";
import { colors123, fonts, radius, spacing, typography } from "../utils/theme";

// Languages with full translations; shop owners can switch before signing up
const LANGS = [
  { code: "en", label: "EN" },
  { code: "te", label: "తె" },
  { code: "hi", label: "हि" },
];

// First run: the product's own features (orders, measurements, staff, payments),
// the language choice up front, and the two ways in.
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, language, selectLanguage } = useLanguage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <Reveal style={styles.header}>
        <View style={styles.brand}>
          <BrandMark size={34} />
          <Text style={styles.wordmark}>StitchBook</Text>
        </View>
        <View style={styles.langs} accessibilityRole="radiogroup">
          {LANGS.map((lang) => {
            const active = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={lang.code}
                onPress={() => selectLanguage(lang.code)}
                style={[styles.lang, active && styles.langActive]}
              >
                <Text style={[styles.langText, active && styles.langTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Reveal>

      <Reveal index={1} style={styles.slides}>
        <FeatureSlides t={t} />
      </Reveal>

      <Reveal index={2} style={styles.actions}>
        <AppButton label={t("welcomeCreateAccount")} icon="storefront-outline" size="lg" onPress={() => navigation.navigate("Register")} />
        <AppButton label={t("welcomeSignIn")} variant="secondary" size="lg" onPress={() => navigation.navigate("Login")} />
        <View style={styles.trust}>
          <View style={styles.trustItem}>
            <Ionicons name="gift-outline" size={14} color={colors123.success} />
            <Text style={styles.trustText}>{t("welcomeTrial")}</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={14} color={colors123.success} />
            <Text style={styles.trustText}>{t("welcomeSecure")}</Text>
          </View>
        </View>
      </Reveal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  content: { flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  wordmark: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3, color: colors123.text },
  langs: { flexDirection: "row", padding: 3, borderRadius: radius.pill, backgroundColor: colors123.surface, borderWidth: 1, borderColor: colors123.borderLight },
  lang: { minWidth: 40, minHeight: 32, paddingHorizontal: 8, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  langActive: { backgroundColor: colors123.primary },
  langText: { fontFamily: fonts.semibold, fontSize: 13, color: colors123.textSecondary },
  langTextActive: { color: colors123.surface },
  slides: { flex: 1, justifyContent: "center", paddingVertical: spacing.lg },
  actions: { paddingHorizontal: 24, gap: spacing.sm },
  trust: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.md, marginTop: spacing.xs },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  trustText: { ...typography.caption, color: colors123.textMuted },
});

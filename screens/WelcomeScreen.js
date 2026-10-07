import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandMark } from "../components/BrandLogo";
import HeroShowcase from "../components/HeroShowcase";
import Reveal from "../components/Reveal";
import AppButton from "../components/AppButton";
import { colors123, fonts, spacing } from "../utils/theme";

// First run. Reads top to bottom: who we are (logo), what it does (the order card
// cycling through garments), why it helps (headline), and the way in (one button).
// The hero takes the free height, so the buttons stay near the thumb on any phone.
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
      <StatusBar style="dark" />
      <Reveal style={styles.brand}>
        <BrandMark size={34} />
        <Text style={styles.wordmark}>StitchBook</Text>
      </Reveal>

      <View style={styles.heroRegion}>
        <Reveal index={1}>
          <HeroShowcase />
        </Reveal>
      </View>

      <Reveal index={2} style={styles.pitch}>
        <Text accessibilityRole="header" style={styles.headline}>Run your tailoring shop,{"\n"}from your pocket.</Text>
        <Text style={styles.subhead}>Orders, measurements, staff work and payments — all in one place.</Text>
      </Reveal>

      <Reveal index={3}>
        <AppButton label="Get started" size="lg" onPress={() => navigation.navigate("Register")} />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sign in to an existing account"
          onPress={() => navigation.navigate("Login")}
          style={styles.signInRow}
        >
          <Text style={styles.muted}>Already have an account? </Text>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
        <View style={styles.trial}>
          <Ionicons name="shield-checkmark" size={13} color={colors123.textMuted} />
          <Text style={styles.trialText}>10 days free · No card needed</Text>
        </View>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background, paddingHorizontal: 24 },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  wordmark: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3, color: colors123.text },
  heroRegion: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 260 },
  pitch: { marginBottom: spacing.lg },
  headline: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 39, letterSpacing: -1, color: colors123.text },
  subhead: { marginTop: spacing.sm, fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 23, color: colors123.textSecondary, maxWidth: 340 },
  signInRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: spacing.xs },
  muted: { fontFamily: fonts.regular, fontSize: 14.5, color: colors123.textMuted },
  link: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors123.primary },
  trial: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  trialText: { fontFamily: fonts.regular, fontSize: 12, color: colors123.textMuted },
});

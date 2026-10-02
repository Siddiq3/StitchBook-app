import { getNativeGoogleModule, getMsg91Module } from "../services/nativeAuthModules";
import { StatusBar } from "expo-status-bar";
import { fonts } from "../utils/theme";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView } from
"react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from "../components/AccessibleMotionView";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { colors123, SIZES, normalize, SHADOWS } from "../utils/theme";

WebBrowser.maybeCompleteAuthSession();

const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId || "";
const googleAndroidClientId = Constants.expoConfig?.extra?.googleAndroidClientId || "";
const googleIosClientId = Constants.expoConfig?.extra?.googleIosClientId || "";
const msg91WidgetId = Constants.expoConfig?.extra?.msg91WidgetId || "";
const msg91WidgetTokenAuth = Constants.expoConfig?.extra?.msg91WidgetTokenAuth || "";
const enableMobileOtpLogin = Constants.expoConfig?.extra?.enableMobileOtpLogin === true;
const fallbackGoogleClientId = "missing-google-client-id.apps.googleusercontent.com";
const extractMsg91AccessToken = (response) =>
  response?.accessToken ||
  response?.access_token ||
  response?.message ||
  response?.data?.accessToken ||
  response?.data?.message ||
  "";

const toMsg91Identifier = (phone) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
};

export default function LoginScreen() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpReqId, setOtpReqId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();

  const {
    loginWithGoogle,
    loginWithMsg91Widget,
    authError
  } = useStitchPro();
  const { showToast } = useToast();
  const isGoogleConfigured = Platform.select({
    android: Boolean(googleWebClientId),
    ios: Boolean(googleIosClientId),
    default: Boolean(googleWebClientId)
  });
  // Mobile OTP login is disabled in this build.
  const shouldShowMobileOtpLogin = false;
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleWebClientId || fallbackGoogleClientId,
    androidClientId: googleAndroidClientId || fallbackGoogleClientId,
    iosClientId: googleIosClientId || fallbackGoogleClientId,
    selectAccount: true
  });

  useEffect(() => {
    if (Platform.OS !== "android" || !googleWebClientId) return;

    const googleModule = getNativeGoogleModule();
    if (!googleModule?.GoogleSignin) return;

    googleModule.GoogleSignin.configure({
      webClientId: googleWebClientId,
      scopes: ["profile", "email"]
    });
  }, []);

  useEffect(() => {
    if (!shouldShowMobileOtpLogin || !msg91WidgetId || !msg91WidgetTokenAuth) return;

    const msg91 = getMsg91Module();
    msg91?.OTPWidget?.initializeWidget(msg91WidgetId, msg91WidgetTokenAuth);
  }, []);

  useEffect(() => {
    const completeGoogleLogin = async () => {
      if (!googleResponse) return;

      if (googleResponse.type === "dismiss" || googleResponse.type === "cancel") {
        setGoogleLoading(false);
        return;
      }

      if (googleResponse.type !== "success") {
        const message = t("googleLoginFailed");
        setError(message);
        showToast(message, "error");
        setGoogleLoading(false);
        return;
      }

      const idToken =
      googleResponse.params?.id_token ||
      googleResponse.authentication?.idToken;

      if (!idToken) {
        const message = "Google login did not return an ID token.";
        setError(message);
        showToast(message, "error");
        setGoogleLoading(false);
        return;
      }

      try {
        await loginWithGoogle(idToken);
        showToast("Google login successful", "success");
      } catch (err) {
        const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        authError ||
        t("googleLoginFailed");
        setError(message);
        showToast(message, "error");
      } finally {
        setGoogleLoading(false);
      }
    };

    completeGoogleLogin();
  }, [authError, googleResponse, loginWithGoogle, showToast, t]);

  const handleGoogleLogin = async () => {
    if (!isGoogleConfigured) {
      const message = "Google login is not configured for this app build.";
      setError(message);
      showToast(message, "error");
      return;
    }

    if (Platform.OS === "android") {
      setError("");
      setGoogleLoading(true);
      try {
        const googleModule = getNativeGoogleModule();
        if (!googleModule?.GoogleSignin) {
          throw new Error("Google login is unavailable in this preview. Please use the latest installed StitchBook app.");
        }

        const { GoogleSignin, statusCodes } = googleModule;
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signOut().catch(() => null);
        const response = await GoogleSignin.signIn();

        if (response?.type === "cancelled") {
          setGoogleLoading(false);
          return;
        }

        const googleUser = response?.data || response;
        const idToken = googleUser?.idToken || (await GoogleSignin.getTokens())?.idToken;

        if (!idToken) {
          throw new Error("Google login did not return an ID token.");
        }

        await loginWithGoogle(idToken);
        showToast("Google login successful", "success");
      } catch (err) {
        const googleModule = getNativeGoogleModule();
        if (err.code === googleModule?.statusCodes?.SIGN_IN_CANCELLED) {
          setGoogleLoading(false);
          return;
        }

        const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message ||
        authError ||
        t("googleLoginFailed");
        setError(message);
        showToast(message, "error");
      } finally {
        setGoogleLoading(false);
      }
      return;
    }

    if (!googleRequest) {
      const message = "Google login is still loading. Please try again.";
      setError(message);
      showToast(message, "error");
      return;
    }

    setError("");
    setGoogleLoading(true);
    try {
      await promptGoogleAsync();
    } catch (err) {
      const message = err.message || t("googleLoginFailed");
      setError(message);
      showToast(message, "error");
      setGoogleLoading(false);
    }
  };

  // Mobile OTP login is disabled in this build.
  // The old phone-number + OTP flow is intentionally kept as commented reference only.
  const handleSendOtp = async () => {
    setError("Mobile OTP login is disabled in this build.");
    showToast("Mobile OTP login is disabled in this build.", "info");
  };

  const handleVerifyOtp = async () => {
    setError("Mobile OTP login is disabled in this build.");
    showToast("Mobile OTP login is disabled in this build.", "info");
  };

  const handleResendOtp = async () => {
    setError("Mobile OTP login is disabled in this build.");
    showToast("Mobile OTP login is disabled in this build.", "info");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={SIZES.headerH}>

      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        <View



          style={[[
          styles.header,
          {
            paddingTop: insets.top + 28
          }], { backgroundColor: colors123.primary }]
          }>


          <View style={styles.headerTop}>
            <View style={styles.wordmarkWrap}>
              <Text style={styles.wordmarkText}>
                <Text style={styles.wordmarkStitch}>Stitch</Text>
                <Text style={styles.wordmarkBook}>Book</Text>
              </Text>
            </View>
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors123.surface} />
              <Text style={styles.secureBadgeText}>{t("secure")}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{t("loginHeroTitle")}</Text>
          <Text style={styles.headerTagline}>
            {t("loginHeroSubtitle")}
          </Text>
          <View style={styles.trustRow}>
            <View style={styles.trustPill}>
              <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.86)" />
              <Text style={styles.trustText}>{t("orders")}</Text>
            </View>
            <View style={styles.trustPill}>
              <Ionicons name="cut-outline" size={14} color="rgba(255,255,255,0.86)" />
              <Text style={styles.trustText}>{t("staff")}</Text>
            </View>
            <View style={styles.trustPill}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.86)" />
              <Text style={styles.trustText}>{t("payments")}</Text>
            </View>
          </View>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 18 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 420 }}
          style={[
          styles.form,
          {
            marginTop: -32,
            marginHorizontal: 24,
            paddingHorizontal: 24,
            paddingVertical: 24
          }]
          }>

          <Text style={styles.title}>{t("welcomeBack")}</Text>
          <Text style={styles.subtitle}>
            {t("chooseLoginMethod")}
          </Text>

          <TouchableOpacity accessibilityRole="button"
            style={[
              styles.googleButton,
              (!isGoogleConfigured || googleLoading) && styles.disabledButton
            ]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}>
            {googleLoading ?
            <ActivityIndicator color={colors123.text} /> :
            <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>{t("continueWithGoogle")}</Text>
              </>
            }
          </TouchableOpacity>

          {!isGoogleConfigured ? (
            <Text style={styles.configHint}>
              Add Google Android Client ID in app config to enable Google login.
            </Text>
          ) : null}

          {/* Mobile OTP login UI is intentionally disabled for this build. */}
          {false ? (
          <>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.methodHeader}>
            <View style={styles.methodIcon}>
              <Ionicons name={otpSent ? "keypad-outline" : "phone-portrait-outline"} size={18} color={colors123.primary} />
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodTitle}>
                {otpSent ? t("verifyYourOtp") : t("continueWithMobile")}
              </Text>
              <Text style={styles.methodSubtitle}>
                {otpSent ? `${t("otpSentTo")} +91 ${phone}` : t("useOtpMsg91")}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("phoneNumber")}</Text>
            <View
              style={[
              styles.inputWrapper,
              error && { borderColor: colors123.danger, borderWidth: 1.5 }]
              }>

              <Text style={styles.prefix}>+91</Text>
              <TextInput accessibilityLabel={t("enterPhoneNumber")}
                style={styles.input}
                placeholder={t("enterPhoneNumber")}
                placeholderTextColor={colors123.textMuted}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError("");
                }}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!otpSent} />

            </View>
          </View>

          {otpSent ?
          <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("otp")}</Text>
                <View
                style={[
                styles.inputWrapper,
                error && { borderColor: colors123.danger, borderWidth: 1.5 }]
                }>

                  <TextInput accessibilityLabel={t("enterOtp")}
                  style={styles.input}
                  placeholder={t("enterOtp")}
                  placeholderTextColor={colors123.textMuted}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/\D/g, ""));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6} />

                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity accessibilityRole="button"
              style={[
              styles.button,
              verifyLoading && { opacity: 0.7 },
              { backgroundColor: colors123.primary }]
              }
              onPress={handleVerifyOtp}
              disabled={verifyLoading}>

                {verifyLoading ?
              <ActivityIndicator color={colors123.surface} /> :

              <View



                style={[styles.buttonGradient, { backgroundColor: colors123.primary }]}>

                    <Ionicons name="lock-open-outline" size={18} color={colors123.surface} />
                    <Text style={styles.buttonText}>{t("verifyOtp")}</Text>
                  </View>
              }
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.retryChip}
                  onPress={() => handleResendOtp(11)}
                  disabled={isLoading}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors123.primary} />
                  <Text style={styles.actionLink}>SMS</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.retryChip}
                  onPress={() => handleResendOtp(12)}
                  disabled={isLoading}>
                  <Ionicons name="logo-whatsapp" size={14} color={colors123.success} />
                  <Text style={styles.actionLink}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                onPress={() => {
                  setOtpSent(false);
                  setOtpReqId("");
                  setOtp("");
                  setError("");
                }}>

                  <Text style={styles.actionLink}>{t("changeNumber")}</Text>
                </TouchableOpacity>
              </View>
            </> :

          <>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity accessibilityRole="button"
              style={[
              styles.button,
              isLoading && { opacity: 0.7 },
              { backgroundColor: colors123.primary }]
              }
              onPress={handleSendOtp}
              disabled={isLoading}>

                {isLoading ?
              <ActivityIndicator color={colors123.surface} /> :

              <View



                style={[styles.buttonGradient, { backgroundColor: colors123.primary }]}>

                    <Ionicons name="send-outline" size={18} color={colors123.surface} />
                    <Text style={styles.buttonText}>{t("sendOtp")}</Text>
                  </View>
              }
              </TouchableOpacity>
            </>
          }
          </>
          ) : null}

        </MotiView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("loginTerms")}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: {
    minHeight: 292,
    paddingBottom: 48,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -84,
    top: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wordmarkWrap: { minHeight: 42, justifyContent: "center" },
  wordmarkText: { fontSize: normalize(30), lineHeight: 38, fontFamily: fonts.bold, letterSpacing: -0.6 },
  wordmarkStitch: { color: colors123.surface },
  wordmarkBook: { color: colors123.surface },
  secureBadge: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secureBadgeText: { color: colors123.surface, fontSize: normalize(12), fontFamily: fonts.semibold },
  heroTitle: {
    marginTop: 30,
    color: colors123.surface,
    fontSize: normalize(28),
    lineHeight: 35,
    fontFamily: fonts.bold,
    maxWidth: 340,
    letterSpacing: -0.5,
  },
  headerTagline: {
    fontSize: normalize(15),
    lineHeight: 23,
    color: "rgba(255,255,255,0.8)",
    marginTop: 10,
    maxWidth: 340,
  },
  trustRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  trustPill: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: { color: "rgba(255,255,255,0.9)", fontSize: normalize(12), fontFamily: fonts.medium },
  form: {
    backgroundColor: colors123.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...SHADOWS.none,
  },
  title: { fontSize: normalize(24), lineHeight: 30, fontFamily: fonts.bold, color: colors123.text, marginBottom: 4 },
  subtitle: { fontSize: normalize(14), lineHeight: 21, color: colors123.textMuted, marginBottom: 22 },
  inputContainer: { marginBottom: 16 },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    backgroundColor: colors123.primarySoft,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    marginBottom: 18,
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.surface,
  },
  methodCopy: { flex: 1 },
  methodTitle: { color: colors123.text, fontSize: normalize(14), fontFamily: fonts.semibold },
  methodSubtitle: { marginTop: 3, color: colors123.textMuted, fontSize: normalize(12), lineHeight: 17 },
  label: { fontSize: normalize(13), fontFamily: fonts.semibold, color: colors123.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: SIZES.radiusSm,
    backgroundColor: colors123.surface,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  prefix: { fontSize: normalize(15), color: colors123.textSecondary, marginRight: 8 },
  input: { flex: 1, minHeight: 48, fontSize: normalize(16), color: colors123.text },
  errorText: { fontSize: normalize(12), lineHeight: 18, color: colors123.danger, marginTop: -10, marginBottom: 12 },
  button: {
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginBottom: 14,
    overflow: "hidden",
    backgroundColor: colors123.primary,
    ...SHADOWS.none,
  },
  buttonGradient: { width: "100%", height: "100%", minHeight: 50, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  buttonText: { color: colors123.surface, fontSize: normalize(14), fontFamily: fonts.semibold },
  googleButton: {
    minHeight: 50,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    ...SHADOWS.none,
  },
  googleButtonText: { color: colors123.text, fontSize: normalize(14), fontFamily: fonts.semibold },
  disabledButton: { opacity: 0.55 },
  configHint: { fontSize: normalize(12), lineHeight: 18, color: colors123.textMuted, textAlign: "center", marginBottom: 14 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors123.borderLight },
  dividerText: { fontSize: normalize(12), fontFamily: fonts.semibold, color: colors123.textMuted, textTransform: "uppercase" },
  otpActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: -4, marginBottom: 14 },
  retryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: SIZES.radiusFull,
    backgroundColor: colors123.primarySoft,
  },
  actionLink: { color: colors123.primary, fontSize: normalize(13), fontFamily: fonts.semibold },
  footer: { marginTop: 28, alignItems: "center", paddingHorizontal: 24 },
  footerText: { fontSize: normalize(12), lineHeight: 18, color: colors123.textMuted, textAlign: "center" },
});

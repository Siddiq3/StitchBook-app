import { fonts } from "../utils/theme";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { colors123, SIZES, normalize, SHADOWS } from "../utils/theme";
import BrandLogo from "../components/BrandLogo";

const OnboardingScreen = () => {
  const { t } = useLanguage();
  const { createShop } = useStitchPro();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);   // 1, 2, or 3
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    if (!form.name.trim()) {
      setErrors({ name: t('shopNameRequired') });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    if (!form.phone.trim()) {
      setErrors({ phone: t('phoneRequired') });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      setErrors({});
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createShop({
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        location: form.location.trim() || undefined,
      });
      showToast(t('shopCreatedSuccess'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandLogo subtitle={t("tailorShopManager")} />
          <Text style={styles.subtitle}>{t("setupYourShop")}</Text>
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={[
                styles.progressDot,
                dot <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.stepContainer}>
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t("askShopName")}</Text>
              <TextInput accessibilityLabel={t("royalTailorsPlaceholder")}
                style={[styles.input, errors.name && styles.inputError]}
                placeholder={t("royalTailorsPlaceholder")}
                placeholderTextColor={colors123.textSoft}
                value={form.name}
                onChangeText={(text) => {
                  setForm(f => ({ ...f, name: text }));
                  if (errors.name) setErrors({});
                }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t("addContactDetails")}</Text>

              <Text style={styles.label}>{t("phoneNumber")}</Text>
              <TextInput accessibilityLabel={t("enterPhoneNumber")}
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder={t("enterPhoneNumber")}
                placeholderTextColor={colors123.textSoft}
                value={form.phone}
                onChangeText={(text) => {
                  setForm(f => ({ ...f, phone: text }));
                  if (errors.phone) setErrors({});
                }}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>{t("locationOptional")}</Text>
              <TextInput accessibilityLabel={t("locationPlaceholder")}
                style={styles.input}
                placeholder={t("locationPlaceholder")}
                placeholderTextColor={colors123.textSoft}
                value={form.location}
                onChangeText={(text) => setForm(f => ({ ...f, location: text }))}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t("reviewShopDetails")}</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>{t("shopName")}</Text>
                  <Text style={styles.reviewValue}>{form.name}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>{t("phone")}</Text>
                  <Text style={styles.reviewValue}>{form.phone}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>{t("location")}</Text>
                  <Text style={styles.reviewValue}>{form.location || t("notProvided")}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity accessibilityRole="button"
              style={styles.backLink}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.backLinkText}>{t("back")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity accessibilityRole="button"
            style={[
              styles.primaryButton,
              step === 1 && styles.primaryButtonFull,
              loading && styles.buttonDisabled,
            ]}
            onPress={step === 3 ? handleCreate : handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors123.surface} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {step === 3 ? t("createShop") : t("next")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors123.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },
  header: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: normalize(14),
    lineHeight: 21,
    color: colors123.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  progressDot: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors123.border,
  },
  progressDotActive: { backgroundColor: colors123.primary },
  stepContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingVertical: 8,
    ...SHADOWS.none,
  },
  stepContent: { marginBottom: 8 },
  stepTitle: {
    fontSize: normalize(20),
    lineHeight: 27,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginBottom: 18,
    textAlign: "left",
  },
  label: {
    fontSize: normalize(13),
    lineHeight: 18,
    fontFamily: fonts.semibold,
    color: colors123.textSecondary,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: normalize(15),
    color: colors123.text,
    backgroundColor: colors123.surface,
    marginBottom: 16,
  },
  inputError: { borderColor: colors123.danger },
  errorText: {
    fontSize: normalize(12),
    lineHeight: 18,
    color: colors123.danger,
    marginTop: -10,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: colors123.surfaceMuted,
    borderRadius: SIZES.radiusSm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: 0,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors123.border,
  },
  reviewLabel: { fontSize: normalize(12), color: colors123.textMuted, marginBottom: 4 },
  reviewValue: { fontSize: normalize(15), fontFamily: fonts.semibold, color: colors123.text },
  buttonContainer: {
    marginTop: 16,
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backLink: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.38,
    borderRadius: SIZES.radiusSm,
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.border,
  },
  backLinkText: { fontSize: normalize(14), color: colors123.textSecondary, fontFamily: fonts.semibold },
  primaryButton: {
    minHeight: 48,
    backgroundColor: colors123.primary,
    borderRadius: SIZES.radiusSm,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.62,
    paddingHorizontal: 18,
  },
  primaryButtonFull: { flex: 1 },
  primaryButtonText: { color: colors123.surface, fontSize: normalize(14), fontFamily: fonts.semibold },
  buttonDisabled: { opacity: 0.55 },
});

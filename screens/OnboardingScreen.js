import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import IconInput from "../components/IconInput";
import StepFlow from "../components/StepFlow";
import FillCard from "../components/FillCard";
import { colors123, fonts, typography } from "../utils/theme";
import { formatPhone, normalizePhone } from "../utils/formHelpers";

const digitsOf = (value) => String(value || "").replace(/\D/g, "").slice(-10);

// Shop setup, one question per screen: name, phone (prefilled from sign-up),
// location (optional, skippable). The job-sheet preview below fills in as the
// owner types, showing exactly what customers will see.
const STEPS = [
  { key: "name", title: "shopNameTitle", sub: "shopNameHint" },
  { key: "phone", title: "shopPhoneTitle", sub: "shopPhoneHint" },
  { key: "location", title: "shopLocationTitle", sub: "shopLocationSub" },
];

export default function OnboardingScreen() {
  const { t } = useLanguage();
  const { createShop, user, logout } = useStitchPro();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({ name: "", phone: digitsOf(user?.phone), location: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: key === "phone" ? digitsOf(value) : value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const go = useCallback((next) => { setDirection(next > step ? 1 : -1); setErrors({}); setStep(next); }, [step]);
  const back = useCallback(() => { if (step > 0) go(step - 1); }, [step, go]);

  const create = async ({ skipLocation = false } = {}) => {
    setLoading(true);
    try {
      await createShop({
        name: form.name.trim(),
        phone: normalizePhone(form.phone) || form.phone,
        location: skipLocation ? undefined : form.location.trim() || undefined,
      });
      showToast(t("shopCreatedSuccess"), "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step === 0 && !form.name.trim()) { setErrors({ name: t("shopNameRequired") }); return; }
    if (step === 1 && form.phone.length !== 10) { setErrors({ phone: t("registerMobileInvalid") }); return; }
    if (step < STEPS.length - 1) { go(step + 1); return; }
    create();
  };

  const current = STEPS[step];
  // The job-sheet header customers will see, filling in live as the owner types
  const scene = (
    <FillCard icon="cut" title={t("jobSheetPreview")} current={step} rows={[
      { key: "name", icon: "storefront-outline", placeholder: t("shopName"), value: form.name.trim(), big: true },
      { key: "phone", icon: "call-outline", placeholder: t("phoneNumber"), value: step >= 1 && form.phone ? `+91 ${formatPhone(form.phone)}` : "" },
      { key: "location", icon: "location-outline", placeholder: t("location"), value: step >= 2 ? form.location.trim() : "" },
    ]} />
  );

  return (
    <StepFlow
      step={step} total={STEPS.length} direction={direction} hideBackOnFirst
      onBack={back} onNext={next} loading={loading}
      nextLabel={step === STEPS.length - 1 ? t("createShop") : t("authContinue")}
      scene={scene} title={t(current.title)} subtitle={t(current.sub)}
      footer={
        step === STEPS.length - 1 ? (
          <TouchableOpacity accessibilityRole="button" onPress={() => create({ skipLocation: true })} disabled={loading} style={s.secondary}>
            <Text style={s.secondaryText}>{t("skipForNow")}</Text>
          </TouchableOpacity>
        ) : step === 0 ? (
          <TouchableOpacity accessibilityRole="button" onPress={logout} disabled={loading} style={s.secondary}>
            <Text style={s.secondaryMuted}>{t("logout")}</Text>
          </TouchableOpacity>
        ) : null
      }>
      {step === 0 && <IconInput label={t("shopName")} icon="store-outline" value={form.name} onChangeText={set("name")} error={errors.name} placeholder={t("royalTailorsPlaceholder")} autoCapitalize="words" returnKeyType="next" onSubmitEditing={next} />}
      {step === 1 && <IconInput label={t("phoneNumber")} icon="phone-outline" prefix="+91" value={form.phone} onChangeText={set("phone")} error={errors.phone} placeholder={t("registerMobilePlaceholder")} keyboardType="number-pad" maxLength={10} returnKeyType="next" onSubmitEditing={next} />}
      {step === 2 && <IconInput label={t("location")} icon="map-marker-outline" value={form.location} onChangeText={set("location")} placeholder={t("locationPlaceholder")} autoCapitalize="words" returnKeyType="done" onSubmitEditing={next} />}
    </StepFlow>
  );
}

const s = StyleSheet.create({
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  secondaryText: { ...typography.small, fontFamily: fonts.semibold, color: colors123.primary },
  secondaryMuted: { ...typography.small, fontFamily: fonts.semibold, color: colors123.textMuted },
});

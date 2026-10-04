import InlineAlert from "./InlineAlert";
import React, { useMemo, useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import BottomSheet from "./BottomSheet";
import IconInput from "./IconInput";
import AppButton from "./AppButton";
import { spacing, colors123, fonts } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";
import { normalizePhone } from "../utils/formHelpers";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gender: "male",
};

export default function CustomerFormSheet({ visible, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const canSubmit = useMemo(
    () => form.name.trim().length > 0 && normalizePhone(form.phone).length >= 10,
    [form.name, form.phone]
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = t("customerNameRequired");
    }
    const phone = normalizePhone(form.phone);
    if (!/^\d{10}$/.test(phone)) {
      nextErrors.phone = t("validMobileRequired");
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = t("validEmailRequired");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(false);
    try {
      const result = await onSubmit({ ...form, phone });
      if (result === false) {
        setSubmitError(true);
        return;
      }
      setForm(emptyForm);
      setErrors({});
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    // Keep the draft: an accidental back-press or swipe must not wipe what was typed.
    setSubmitError(false);
    setErrors({});
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      subtitle={t("addCustomerSubtitle")}
      title={t("addCustomerTitle")}
    >
      <IconInput
        autoCapitalize="words"
        error={errors.name}
        icon="account-outline"
        label={t("fullName")}
        onChangeText={(value) => handleChange("name", value)}
        placeholder={t("enterCustomerName")}
        value={form.name}
      />
      <IconInput
        error={errors.phone}
        icon="phone-outline"
        keyboardType="phone-pad"
        label={t("phoneNumber")}
        maxLength={16}
        onChangeText={(value) => handleChange("phone", value)}
        placeholder={t("enterCustomerPhone")}
        value={form.phone}
      />
      <IconInput
        autoCapitalize="none"
        error={errors.email}
        icon="email-outline"
        keyboardType="email-address"
        label={t("email")}
        onChangeText={(value) => handleChange("email", value)}
        placeholder={t("enterCustomerEmail")}
        value={form.email}
      />
      <IconInput
        autoCapitalize="words"
        icon="map-marker-outline"
        label={t("address")}
        multiline
        onChangeText={(value) => handleChange("address", value)}
        placeholder={t("enterCustomerAddress")}
        value={form.address}
      />

      {/* Gender Selection */}
      <View style={styles.genderSection}>
        <Text style={styles.genderLabel}>
          {t("gender")}
          <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.genderOptions}>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: form.gender === "male" }}
            accessibilityLabel={t("male")}
            style={[
              styles.genderButton,
              form.gender === "male" && styles.genderButtonActive,
            ]}
            onPress={() => handleChange("gender", "male")}
          >
            <View
              style={[
                styles.radio,
                form.gender === "male" && styles.radioActive,
              ]}
            >
              {form.gender === "male" && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.genderButtonText,
                form.gender === "male" && styles.genderButtonTextActive,
              ]}
            >
              {t("male")}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: form.gender === "female" }}
            accessibilityLabel={t("female")}
            style={[
              styles.genderButton,
              form.gender === "female" && styles.genderButtonActive,
            ]}
            onPress={() => handleChange("gender", "female")}
          >
            <View
              style={[
                styles.radio,
                form.gender === "female" && styles.radioActive,
              ]}
            >
              {form.gender === "female" && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.genderButtonText,
                form.gender === "female" && styles.genderButtonTextActive,
              ]}
            >
              {t("female")}
            </Text>
          </Pressable>
        </View>
      </View>

      <InlineAlert message={submitError ? t("customerCreateFailed") : null} />
      <View style={styles.actions}>
        <AppButton
          label={t("cancel")}
          onPress={handleClose}
          style={styles.action}
          variant="secondary"
        />
        <AppButton
          disabled={!canSubmit || submitting}
          loading={submitting}
          icon="plus"
          label={t("createCustomer")}
          onPress={handleSubmit}
          style={styles.action}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  genderSection: {
    marginVertical: spacing.md,
  },
  genderLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors123.danger,
  },
  genderOptions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.border,
  },
  genderButtonActive: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primaryLight,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors123.textSoft,
    marginLeft: spacing.xs,
  },
  genderButtonTextActive: {
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors123.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: colors123.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors123.primary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
  },
});

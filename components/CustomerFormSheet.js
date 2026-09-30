import React, { useMemo, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native";
import BottomSheet from "./BottomSheet";
import IconInput from "./IconInput";
import AppButton from "./AppButton";
import { spacing, colors123, fonts } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";

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

  const canSubmit = useMemo(
    () => form.name.trim().length > 0 && form.phone.trim().length >= 10,
    [form.name, form.phone],
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = t("customerNameRequired");
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      nextErrors.phone = t("validMobileRequired");
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = t("validEmailRequired");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(form);
    setForm(emptyForm);
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    setForm(emptyForm);
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
        placeholder="Priya Sharma"
        value={form.name}
      />
      <IconInput
        error={errors.phone}
        icon="phone-outline"
        keyboardType="phone-pad"
        label={t("phoneNumber")}
        maxLength={10}
        onChangeText={(value) =>
          handleChange("phone", value.replace(/[^\d]/g, ""))
        }
        placeholder="9876543210"
        value={form.phone}
      />
      <IconInput
        autoCapitalize="none"
        error={errors.email}
        icon="email-outline"
        keyboardType="email-address"
        label={t("email")}
        onChangeText={(value) => handleChange("email", value)}
        placeholder="priya@gmail.com"
        value={form.email}
      />
      <IconInput
        autoCapitalize="words"
        icon="map-marker-outline"
        label={t("address")}
        multiline
        onChangeText={(value) => handleChange("address", value)}
        placeholder="Banjara Hills, Hyderabad"
        value={form.address}
      />

      {/* Gender Selection */}
      <View style={styles.genderSection}>
        <Text style={styles.genderLabel}>{t("gender")}<Text style={styles.required}>*</Text></Text>
        <View style={styles.genderOptions}>
          <Pressable
            style={[
              styles.genderButton,
              form.gender === 'male' && styles.genderButtonActive,
            ]}
            onPress={() => handleChange('gender', 'male')}
          >
            <View style={[
              styles.radio,
              form.gender === 'male' && styles.radioActive,
            ]}>
              {form.gender === 'male' && <View style={styles.radioDot} />}
            </View>
            <Text style={[
              styles.genderButtonText,
              form.gender === 'male' && styles.genderButtonTextActive,
            ]}>
              {t("male")}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.genderButton,
              form.gender === 'female' && styles.genderButtonActive,
            ]}
            onPress={() => handleChange('gender', 'female')}
          >
            <View style={[
              styles.radio,
              form.gender === 'female' && styles.radioActive,
            ]}>
              {form.gender === 'female' && <View style={styles.radioDot} />}
            </View>
            <Text style={[
              styles.genderButtonText,
              form.gender === 'female' && styles.genderButtonTextActive,
            ]}>
              {t("female")}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={t("cancel")}
          onPress={handleClose}
          style={styles.action}
          variant="secondary"
        />
        <AppButton
          disabled={!canSubmit}
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
    fontWeight: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: '#EF4444',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors123.border,
  },
  genderButtonActive: {
    borderColor: colors123.primary,
    backgroundColor: '#EFF6FF',
  },
  genderButtonText: {
    fontSize: 14,
    color: colors123.textSoft,
    marginLeft: spacing.xs,
  },
  genderButtonTextActive: {
    color: colors123.primary,
    fontWeight: fonts.semibold,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors123.border,
    alignItems: 'center',
    justifyContent: 'center',
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

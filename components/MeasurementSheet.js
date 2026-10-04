
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from "./AccessibleMotionView";
import AppButton from "./AppButton";
import BottomSheet from "./BottomSheet";
import AppCard from "./AppCard";
import AvatarBadge from "./AvatarBadge";
import MeasurementFieldThumb from "./MeasurementFieldThumb";
import MeasurementFigure from "./MeasurementFigure";
import measurementFieldsConfig from "../configs/measurementFieldsConfig";
import { useLanguage } from "../context/LanguageContext";
import { colors123, fonts, radius, spacing } from "../utils/theme";

export default function MeasurementSheet({
  customer,
  initialValues,
  outfitType,
  onClose,
  onSubmit,
  visible,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({});
  const [selectedOutfitKey, setSelectedOutfitKey] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const inputRefs = useRef({});
  const sheetScrollRef = useRef(null);
  const fieldLayoutRefs = useRef({});
  const fieldSectionY = useRef(0);

  const normalizeOutfitType = (type) => {
    if (!type) return null;
    const normalized = String(type).toLowerCase().trim();
    const map = {
      shirt: "shirt",
      shirts: "shirt",
      pant: "pant",
      pants: "pant",
      "women-pants": "pant",
      "women pants": "pant",
      trouser: "pant",
      "kurta-pajama": "kurta",
      "kurta pajama": "kurta",
      kurta: "kurta",
      sherwani: "sherwani",
      blazer: "blazer",
      "mens-suit": "blazer",
      "men-suit": "blazer",
      suit: "blazer",
      "men's suit": "blazer",
      "waist-coat": "waistcoat",
      "waist coat": "waistcoat",
      waistcoat: "waistcoat",
      dhoti: "dhoti",
      veshti: "dhoti",
      blouse: "blouse",
      "saree-blouse": "saree_blouse",
      "saree blouse": "saree_blouse",
      salwar: "salwar",
      "ladies-suit": "salwar",
      "ladies suit": "salwar",
      churidar: "salwar",
      kurti: "kurti",
      lehenga: "lehenga",
      saree: "saree_blouse",
      anarkali: "anarkali",
      gown: "gown",
      dupatta: "dupatta",
    };
    return map[normalized] || normalized;
  };

  const getActiveOutfitKey = (values) => {
    const outfitTypeValue = values?.outfitType || values?.outfit_type || outfitType?.id || outfitType?.label || values?.outfitLabel;
    const normalized = normalizeOutfitType(outfitTypeValue);
    return measurementFieldsConfig[normalized] ? normalized : null;
  };

  useEffect(() => {
    const initialForm = { ...(initialValues || {}) };

    if (initialValues?.measurementsData && typeof initialValues.measurementsData === "object") {
      Object.entries(initialValues.measurementsData).forEach(([key, value]) => {
        if (!(key in initialForm)) {
          initialForm[key] = value;
        }
      });
    }

    if (outfitType && !initialForm.outfitType) {
      initialForm.outfitType = outfitType.id || outfitType.label;
      initialForm.outfitLabel = initialForm.outfitLabel || outfitType.label;
    }

    setForm(initialForm);
    setSelectedOutfitKey(getActiveOutfitKey(initialForm));
  }, [initialValues, outfitType, visible]);

  const activeConfig = selectedOutfitKey
    ? measurementFieldsConfig[selectedOutfitKey]
    : null;

  const getDiagramType = () => {
    const image = activeConfig?.bodyImage || "";
    if (image.includes("lower")) return "lower";
    if (image.includes("full")) return "full";
    return "upper";
  };

  const getBodyZoneField = (fieldLabel) => {
    const normalized = String(fieldLabel || "").toLowerCase();
    if (normalized.includes("ankle")) return "Ankle Circumference";
    if (normalized.includes("knee")) return "Knee Circumference";
    if (normalized.includes("thigh")) return "Thigh Circumference";
    if (normalized.includes("hip")) return getDiagramType() === "lower" ? "Hip" : "Hip Circumference";
    if (normalized.includes("waist")) return "Waist";
    if (normalized.includes("length")) return getDiagramType() === "upper" ? "Back Length" : "Length";
    if (normalized.includes("shoulder")) return "Shoulder Width";
    if (normalized.includes("chest") || normalized.includes("bust")) return "Chest";
    if (normalized.includes("sleeve")) return "Sleeve Length";
    if (normalized.includes("wrist")) return "Wrist Circumference";
    if (normalized.includes("arm")) return "Arm Hole";
    if (normalized.includes("neck") || normalized.includes("collar")) return "Neck";
    if (normalized.includes("back")) return "Back Length";
    return null;
  };

  useEffect(() => {
    if (activeConfig?.fields?.length) {
      setFocusedField(getBodyZoneField(activeConfig.fields[0]));
    } else {
      setFocusedField(null);
    }
  }, [selectedOutfitKey, activeConfig?.label]);

  const getFieldValue = (fieldLabel) => {
    return form[fieldLabel] !== undefined && form[fieldLabel] !== null
      ? String(form[fieldLabel])
      : "";
  };

  const completion = activeConfig
    ? Math.round(
        (activeConfig.fields.filter((label) => getFieldValue(label)).length /
          activeConfig.fields.length) *
          100,
      )
    : 0;

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value.replace(/[^\d.]/g, ""),
    }));
  };

  const focusMeasurementField = (fieldLabel) => {
    if (!fieldLabel) return;
    setFocusedField(getBodyZoneField(fieldLabel) || fieldLabel);
    const fieldY = fieldLayoutRefs.current[fieldLabel];
    if (typeof fieldY === "number") {
      sheetScrollRef.current?.scrollTo({
        y: Math.max(0, fieldSectionY.current + fieldY - 96),
        animated: true,
      });
    }
    requestAnimationFrame(() => {
      inputRefs.current[fieldLabel]?.focus?.();
    });
  };

  const focusNextField = (currentIndex) => {
    const fields = activeConfig?.fields || [];
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      focusMeasurementField(nextField);
      return;
    }
    inputRefs.current[fields[currentIndex]]?.blur?.();
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      scrollRef={sheetScrollRef}
      subtitle={
        customer ? `${customer.name}: ${t("editingFitProfile")}` : ""
      }
      title={t("measurementsTitle")}
    >
      <AppCard style={styles.previewCard} variant="muted">
        <View style={styles.previewHeader}>
          <View style={styles.previewCopy}>
            {customer ? (
              <AvatarBadge
                initials={customer.avatar}
                name={customer.name}
                size={42}
              />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{t("customFitPreview")}</Text>
              <Text style={styles.previewSubtitle}>
                {t("fitPreviewSubtitle")}
              </Text>
            </View>
          </View>
          <View style={styles.completionPill}>
            <Text style={styles.completionValue}>{completion}%</Text>
            <Text style={styles.completionLabel}>{t("complete")}</Text>
          </View>
        </View>
        <MeasurementFigure values={form} />
      </AppCard>

      <Text style={styles.helper}>
        {t("measurementReuseHelper")}
      </Text>

      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{t("profileDetails")}</Text>
        <Text style={styles.formSubtitle}>
          {t("profileDetailsSubtitle")}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaField}>
          <Text style={styles.metaLabel}>{t("profileName")}</Text>
          <TextInput
            placeholder={t("profileNamePlaceholder")}
            placeholderTextColor={colors123.textSoft}
            style={styles.metaInput}
            value={form.outfitLabel || form.outfit_label || ""}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, outfitLabel: value }))
            }
          />
        </View>
      </View>

      <View style={styles.outfitSelection}>
        {/* Outfit is already known when opened from an order item */}
        {!outfitType && <>
        <Text style={styles.sectionTitle}>{t("selectOutfitTypeLower")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.outfitScroll}
        >
          {Object.entries(measurementFieldsConfig).map(([key, config]) => {
            const isSelected = selectedOutfitKey === key;
            return (
              <Pressable
                key={key}
                style={[styles.outfitPill, isSelected && styles.pillSelected]}
                onPress={() => {
                  setSelectedOutfitKey(key);
                  setForm((current) => ({
                    ...current,
                    outfitType: key,
                    outfitLabel: current.outfitLabel || config.label,
                  }));
                }}
              >
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        </>}
      </View>

      {activeConfig ? (
        <View
          style={styles.diagramSection}
          onLayout={(event) => {
            fieldSectionY.current = event.nativeEvent.layout.y;
          }}>
          <Text style={styles.inlineGuideTitle}>
            {activeConfig.label} {t("measurementsTitle")}
          </Text>
          <View style={styles.fieldList}>
            {activeConfig.fields.map((fieldLabel, index) => {
              const bodyZoneField = getBodyZoneField(fieldLabel);
              const focusKey = bodyZoneField || fieldLabel;
              const isFocused = focusKey === focusedField;
              const isFilled = Boolean(getFieldValue(fieldLabel));
              const isLastField = index === activeConfig.fields.length - 1;
              return (
                <MotiView
                  key={fieldLabel}
                  onLayout={(event) => {
                    fieldLayoutRefs.current[fieldLabel] = event.nativeEvent.layout.y;
                  }}
                  from={{ opacity: 0, translateY: 8, scale: 0.99 }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                    scale: isFocused ? 1.015 : 1,
                  }}
                  transition={{ delay: index * 28, duration: 220, type: "timing" }}
                  style={[styles.fieldRow, isFocused && styles.fieldRowFocused]}
                >
                  <Pressable
                    onPress={() => focusMeasurementField(fieldLabel)}
                    style={styles.fieldInfo}
                  >
                    <MeasurementFieldThumb
                      active={isFocused}
                      bodyType={getDiagramType()}
                      label={fieldLabel}
                    />
                    <View style={styles.fieldTextGroup}>
                      <Text style={[styles.fieldNumber, isFocused && styles.fieldNumberFocused]}>
                        {index + 1}.
                      </Text>
                      <Text style={[styles.fieldLabel, isFocused && styles.fieldLabelFocused]}>
                        {fieldLabel}
                      </Text>
                    </View>
                  </Pressable>
                  <TextInput
                    ref={(node) => {
                      inputRefs.current[fieldLabel] = node;
                    }}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => handleChange(fieldLabel, value)}
                    onFocus={() => focusMeasurementField(fieldLabel)}
                    onSubmitEditing={() => focusNextField(index)}
                    placeholder="0"
                    placeholderTextColor={colors123.textSoft}
                    returnKeyType={isLastField ? "done" : "next"}
                    style={[styles.fieldInputRow, isFocused && styles.fieldInputRowFocused]}
                    value={getFieldValue(fieldLabel)}
                  />
                  {isFocused ? (
                    <Pressable
                      onPress={() => focusNextField(index)}
                      style={[styles.nextFieldButton, isFilled && styles.nextFieldButtonReady]}
                    >
                      <Ionicons
                        name={isLastField ? "checkmark" : "arrow-down"}
                        size={18}
                        color={isFilled ? colors123.surface : colors123.primary}
                      />
                    </Pressable>
                  ) : null}
                </MotiView>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.noSelectedOutfit}>
          <Text style={styles.noSelectedOutfitText}>
            {t("chooseOutfitForFields")}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <AppButton
          label={t("cancel")}
          onPress={onClose}
          style={styles.action}
          variant="secondary"
        />
        <AppButton
          icon="content-save-outline"
          label={t("saveProfile")}
          onPress={handleSubmit}
          style={styles.action}
          disabled={!activeConfig}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    gap: spacing.md,
    borderRadius: 16,
    backgroundColor: colors123.surface,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  previewCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  previewTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  previewSubtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  completionPill: {
    minWidth: 70,
    borderRadius: radius.lg,
    backgroundColor: colors123.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  completionValue: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors123.surface,
  },
  completionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "rgba(255,255,255,0.84)",
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors123.text,
  },
  formHeader: {
    marginTop: spacing.md,
  },
  formTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  formSubtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors123.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaField: {
    flex: 1,
    gap: spacing.xs,
  },
  metaLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  metaInput: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    color: colors123.text,
  },
  outfitSelection: {
    marginTop: spacing.lg,
  },
  outfitScroll: {
    paddingVertical: spacing.sm,
  },
  outfitPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
    marginRight: spacing.sm,
  },
  diagramSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  inlineGuideTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors123.text,
  },
  fieldList: {
    gap: spacing.xs,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: 18,
    backgroundColor: colors123.surfaceMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 76,
  },
  fieldRowFocused: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primarySoft,
  },
  fieldInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  fieldTextGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldNumber: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.textMuted,
  },
  fieldNumberFocused: {
    color: colors123.primaryDark,
  },
  fieldLabelFocused: {
    color: colors123.primaryDark,
  },
  fieldInputRow: {
    width: 88,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: "center",
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  fieldInputRowFocused: {
    borderColor: colors123.primary,
    backgroundColor: colors123.surface,
  },
  nextFieldButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.primary,
  },
  nextFieldButtonReady: {
    backgroundColor: colors123.primary,
  },
  noSelectedOutfit: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.border,
    backgroundColor: colors123.surface,
  },
  noSelectedOutfitText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textSoft,
    lineHeight: 20,
  },
  pillSelected: {
    backgroundColor: colors123.primarySoft,
    borderColor: colors123.primary,
  },
  pillLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.text,
  },
  pillLabelSelected: {
    color: colors123.primary,
  },
  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors123.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});

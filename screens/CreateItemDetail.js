import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from "../components/AccessibleMotionView";

import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

import { colors123, fonts, formatCurrency, radius, spacing } from "../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import MeasurementFieldThumb from "../components/MeasurementFieldThumb";
import MeasurementPickerModal from "../components/MeasurementPickerModal";
import { getMeasurementEntries } from "../utils/formHelpers";
import StitchOptionsSheet from "../components/StitchOptionsSheet";

export default function CreateItemDetail({
  navigation,
  outfitType,
  customerId,
  onSave,
  onCancel,
}) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  // Item state
  const [itemType, setItemType] = useState("stitching"); // stitching or alteration
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [showMeasurementPicker, setShowMeasurementPicker] = useState(false);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [measurementExpanded, setMeasurementExpanded] = useState(false);

  // Item details
  const [fabric, setFabric] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Stitch options (only for stitching)
  const [stitchOptions, setStitchOptions] = useState({
    collar: "",
    sleeve: "",
    cuff: "",
    pocket: "",
    placket: "",
    numCuffs: "",
    numCollars: "",
    bodyType: "",
  });
  const [showStitchOptions, setShowStitchOptions] = useState(false);

  const [saving, setSaving] = useState(false);

  // Validate measurements for stitching type
  const canSave = () => {
    if (!price || Number(price) <= 0) {
      showToast(t("enterValidPrice"), "error");
      return false;
    }
    if (itemType === "stitching" && !selectedMeasurement) {
      showToast(t("addMeasurementsContinue"), "error");
      return false;
    }
    return true;
  };

  const handleSaveItem = async () => {
    if (!canSave()) return;

    setSaving(true);
    try {
      const normalizedMeasurement = selectedMeasurement
        ? {
            id: selectedMeasurement.id,
            outfitLabel: selectedMeasurement.outfitLabel || selectedMeasurement.outfit_label,
            outfitType: selectedMeasurement.outfitType || selectedMeasurement.outfit_type,
            measurementsData:
              selectedMeasurement.measurementsData || selectedMeasurement.measurements_data || {},
          }
        : null;

      const item = {
        type: outfitType.id,
        typeLabel: outfitType.label,
        fabric: fabric.trim(),
        quantity: Number(quantity),
        price: Number(price),
        itemType, // stitching or alteration
        specialInstructions: specialInstructions.trim(),
        measurement_id: normalizedMeasurement?.id || null,
        measurementSnapshot: normalizedMeasurement,
        measurementLabel: normalizedMeasurement?.outfitLabel || null,
        measurementData: normalizedMeasurement?.measurementsData || null,
        stitch_options: itemType === "stitching" ? stitchOptions : null,
      };

      onSave(item);
      showToast(t("itemSaved"), "success");
    } catch (err) {
      showToast(err.message || t("itemSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMeasurementSelected = (measurement) => {
    setSelectedMeasurement(measurement);
    setMeasurementExpanded(false);
    setShowMeasurementPicker(false);
  };

  const isMandatory = itemType === "stitching";
  const saveButtonDisabled = itemType === "stitching" && !selectedMeasurement;
  const selectedMeasurementData =
    selectedMeasurement?.measurementsData ||
    selectedMeasurement?.measurements_data ||
    {};
  const selectedMeasurementEntries = getMeasurementEntries(selectedMeasurementData);
  const visibleMeasurementEntries = measurementExpanded
    ? selectedMeasurementEntries
    : selectedMeasurementEntries.slice(0, 4);

  const getMeasurementBodyType = () => {
    const type = String(
      selectedMeasurement?.outfitType ||
        selectedMeasurement?.outfit_type ||
        outfitType?.id ||
        outfitType?.label ||
        "",
    ).toLowerCase();
    if (["pant", "pants", "trouser", "dhoti", "dupatta"].includes(type)) return "lower";
    if (["salwar", "lehenga", "anarkali", "gown", "kurta"].includes(type)) return "full";
    return "upper";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors123.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("configureItem")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Outfit Type Header */}
        <View style={styles.outfitCard}>
          <Ionicons
            name="shirt"
            size={32}
            color={colors123.primary}
            style={{ marginRight: spacing.md }}
          />
          <View>
            <Text style={styles.outfitLabel}>{outfitType.label}</Text>
            <Text style={styles.outfitDescription}>
              {t("configureItemDetails")}
            </Text>
          </View>
        </View>

        {/* Type Selection: Stitching vs Alteration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("type")}</Text>
          <View style={styles.typeButtonsContainer}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(itemType === "stitching") }}
              style={[
                styles.typeButton,
                itemType === "stitching" && styles.typeButtonActive,
              ]}
              onPress={() => setItemType("stitching")}
            >
              <Ionicons
                name={itemType === "stitching" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={
                  itemType === "stitching" ? colors123.primary : colors123.border
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === "stitching" && styles.typeButtonTextActive,
                ]}
              >
                {t("stitching")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(itemType === "alteration") }}
              style={[
                styles.typeButton,
                itemType === "alteration" && styles.typeButtonActive,
              ]}
              onPress={() => setItemType("alteration")}
            >
              <Ionicons
                name={itemType === "alteration" ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={
                  itemType === "alteration" ? colors123.primary : colors123.border
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === "alteration" && styles.typeButtonTextActive,
                ]}
              >
                {t("alteration")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurements Section */}
        <View style={styles.section}>
          <View style={styles.measurementHeader}>
            <Text style={styles.sectionTitle}>
              {t("measurementsLabel")}{" "}
              {isMandatory ? (
                <Text style={styles.mandatory}>*</Text>
              ) : (
                <Text style={styles.optional}>{t("optional")}</Text>
              )}
            </Text>
          </View>

          {selectedMeasurement ? (
            <View style={styles.measurementCard}>
              <View style={styles.measurementCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.measurementCardLabel}>
                    {selectedMeasurement.outfitLabel ||
                      selectedMeasurement.outfit_label ||
                      `Profile #${selectedMeasurement.id}`}
                  </Text>
                  <Text style={styles.measurementCardSubtitle}>
                    {selectedMeasurement.outfitType ||
                      selectedMeasurement.outfit_type ||
                      t("fitProfile")}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors123.success}
                />
              </View>

              <ResponsiveGrid minItemWidth={140} style={styles.measurementGrid}>
                {visibleMeasurementEntries.map(([key, value], index) => (
                  <MotiView
                    key={`${selectedMeasurement.id || "selected"}-${key}`}
                    from={{ opacity: 0, translateY: 10, scale: 0.98 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ delay: index * 55, duration: 260, type: "timing" }}
                    style={styles.measurementRow}>
                    <MeasurementFieldThumb
                      bodyType={getMeasurementBodyType()}
                      label={key}
                      size={38}
                    />
                    <View style={styles.measurementRowCopy}>
                      <Text numberOfLines={2} style={styles.measurementRowLabel}>
                        {key}
                      </Text>
                      <Text style={styles.measurementRowValue}>{value}</Text>
                    </View>
                  </MotiView>
                ))}
              </ResponsiveGrid>

              {selectedMeasurementEntries.length > 4 ? (
                <TouchableOpacity accessibilityRole="button"
                  style={styles.measurementDropdown}
                  onPress={() => setMeasurementExpanded((current) => !current)}
                >
                  <Text style={styles.measurementDropdownText}>
                    {measurementExpanded
                      ? "Show less"
                      : `Show all ${selectedMeasurementEntries.length}`}
                  </Text>
                  <Ionicons
                    name={measurementExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors123.primary}
                  />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity accessibilityRole="button"
                style={styles.changeButton}
                onPress={() => setShowMeasurementPicker(true)}
              >
                <Text style={styles.changeButtonText}>{t("change")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity accessibilityRole="button"
              style={styles.addMeasurementButton}
              onPress={() => setShowMeasurementPicker(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={colors123.primary}
              />
              <Text style={styles.addMeasurementText}>{t("addMeasurements")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stitch Options - Only for Stitching */}
        {itemType === "stitching" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("stitchOptions")}</Text>
            <TouchableOpacity accessibilityRole="button"
              style={styles.optionsButton}
              onPress={() => setShowStitchOptions(true)}
            >
              <Ionicons name="settings-outline" size={20} color={colors123.primary} />
              <Text style={styles.optionsButtonText}>{t("configureOptions")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fabric */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("fabricOptional")}</Text>
          <TextInput accessibilityLabel={t("fabricPlaceholder")}
            style={styles.input}
            placeholder={t("fabricPlaceholder")}
            placeholderTextColor={colors123.textSoft}
            value={fabric}
            onChangeText={setFabric}
          />
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("quantity")}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${t("quantity")} −`}
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${t("quantity")} +`}
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("pricePerItem")}</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput accessibilityLabel={t("enterPrice")}
              style={styles.priceInput}
              placeholder={t("enterPrice")}
              placeholderTextColor={colors123.textSoft}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          {price && quantity && (
            <Text style={styles.totalPrice}>
              {t("total")}: {formatCurrency(Number(price) * Number(quantity))}
            </Text>
          )}
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.label}>{t("specialInstructions")}</Text>
          <TextInput accessibilityLabel={t("specialInstructionsPlaceholder")}
            style={[styles.input, styles.textArea]}
            placeholder={t("specialInstructionsPlaceholder")}
            placeholderTextColor={colors123.textSoft}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Spacing for buttons */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Bottom Actions */}
      {saveButtonDisabled &&
      <Text style={styles.saveHint}>{t("saveItemNeedsMeasurement")}</Text>
      }
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity accessibilityRole="button"
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
        </TouchableOpacity>
        <AppButton
          label={saving ? t("saving") : t("saveItem")}
          onPress={handleSaveItem}
          disabled={saveButtonDisabled || saving}
          style={{ flex: 1, marginLeft: spacing.md }}
        />
      </View>

      {/* Measurement Picker Modal */}
      <MeasurementPickerModal
        visible={showMeasurementPicker}
        customerId={customerId}
        outfitType={outfitType}
        selectedMeasurementId={selectedMeasurement?.id}
        onClose={() => setShowMeasurementPicker(false)}
        onSelect={handleMeasurementSelected}
        onSkip={() => setShowMeasurementPicker(false)}
      />

      {/* Stitch Options Sheet */}
      <StitchOptionsSheet
        visible={showStitchOptions}
        outfitType={outfitType}
        existingOptions={stitchOptions}
        onSave={(opts) => { setStitchOptions(opts); setShowStitchOptions(false); }}
        onClose={() => setShowStitchOptions(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.background,
    borderBottomWidth: 1,
    borderBottomColor: colors123.border,
  },
  headerTitle: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    padding: spacing.md,
  },
  outfitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors123.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.border,
  },
  outfitLabel: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  outfitDescription: {
    fontSize: fonts.sm.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  mandatory: {
    color: colors123.warning,
  },
  optional: {
    color: colors123.textSoft,
    fontFamily: fonts.regular,
    fontSize: fonts.sm.fontSize,
  },
  measurementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeButtonsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.md,
    backgroundColor: colors123.card,
  },
  typeButtonActive: {
    backgroundColor: colors123.primary + "15",
    borderColor: colors123.primary,
  },
  typeButtonText: {
    marginLeft: spacing.md,
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  typeButtonTextActive: {
    color: colors123.primary,
    fontFamily: fonts.bold,
  },
  measurementCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors123.primary,
    borderRadius: radius.md,
    backgroundColor: colors123.primary + "10",
  },
  measurementCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  measurementCardLabel: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  measurementCardSubtitle: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  measurementRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    borderRadius: 14,
    backgroundColor: colors123.surface,
    padding: spacing.xs,
    minHeight: 48,
  },
  measurementRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  measurementRowLabel: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
  },
  measurementRowValue: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginTop: 3,
  },
  measurementDropdown: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  measurementDropdownText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.primary,
    fontFamily: fonts.bold,
  },
  changeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  changeButtonText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.primary,
    fontFamily: fonts.semibold,
  },
  addMeasurementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors123.border,
    borderRadius: radius.md,
    backgroundColor: colors123.card,
  },
  addMeasurementText: {
    marginLeft: spacing.md,
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  optionsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.primary,
    borderRadius: radius.md,
    backgroundColor: colors123.primary + "10",
  },
  optionsButtonText: {
    marginLeft: spacing.md,
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  label: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.sm,
    fontSize: fonts.base.fontSize,
    color: colors123.text,
    backgroundColor: colors123.card,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors123.card,
  },
  quantityButtonText: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  quantityValue: {
    minWidth: 48,
    textAlign: "center",
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    paddingVertical: spacing.md,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.md,
    backgroundColor: colors123.card,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginRight: spacing.xs,
  },
  priceInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  totalPrice: {
    marginTop: spacing.sm,
    fontSize: fonts.sm.fontSize,
    color: colors123.textSoft,
    fontStyle: "italic",
  },
  saveHint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    backgroundColor: colors123.background,
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors123.border,
    backgroundColor: colors123.background,
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors123.border,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors123.card,
  },
  cancelButtonText: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
});

import ResponsiveGrid from "./ResponsiveGrid";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet } from
"react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MotiView } from "./AccessibleMotionView";
import BottomSheet from "./BottomSheet";
import AppButton from "./AppButton";
import AppCard from "./AppCard";
import MeasurementFieldThumb from "./MeasurementFieldThumb";
import MeasurementSheet from "./MeasurementSheet";
import { measurementApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { cleanMeasurementValues, getMeasurementEntries } from "../utils/formHelpers";
import { colors123, fonts, spacing } from "../utils/theme";

export default function MeasurementPickerModal({
  visible,
  customerId,
  selectedMeasurementId,
  outfitType,
  onClose,
  onSelect,
  onSkip
}) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [showMeasurementSheet, setShowMeasurementSheet] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedMeasurements, setExpandedMeasurements] = useState([]);

  const normalizeOutfitType = (value) => {
    if (!value) return "";
    const normalized = String(value).toLowerCase().trim();
    const map = {
      pants: "pant",
      "women-pants": "pant",
      trouser: "pant",
      "kurta-pajama": "kurta",
      "mens-suit": "blazer",
      "men's suit": "blazer",
      suit: "blazer",
      "waist-coat": "waistcoat",
      saree: "saree_blouse",
      "saree blouse": "saree_blouse",
      "saree-blouse": "saree_blouse",
      "ladies-suit": "salwar",
      "ladies suit": "salwar",
      churidar: "salwar"
    };
    return map[normalized] || normalized;
  };

  const getBodyType = (measurement) => {
    const type = normalizeOutfitType(
      measurement?.outfitType || measurement?.outfit_type || outfitType?.id || outfitType?.label
    );
    if (["pant", "dhoti", "dupatta"].includes(type)) return "lower";
    if (["salwar", "lehenga", "anarkali", "gown", "kurta"].includes(type)) return "full";
    return "upper";
  };

  useEffect(() => {
    if (visible && customerId) {
      loadMeasurements();
    }
  }, [visible, customerId]);

  const loadMeasurements = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await measurementApi.getByCustomer(customerId);
      let items = res.data?.data?.measurements || [];

      // Filter by outfit type if provided
      if (outfitType) {
        const targetType =
        typeof outfitType === "string" ?
        outfitType :
        outfitType.id || outfitType.label;
        const normalizedTarget = normalizeOutfitType(targetType);

        items = items.filter((m) => {
          const outfitTypeValue = (m.outfitType || m.outfit_type || "").toString().toLowerCase();
          return normalizeOutfitType(outfitTypeValue) === normalizedTarget;
        });
      }

      setMeasurements(items);
    } catch (err) {
      showToast(
        err.response?.data?.message || t("unableLoadMeasurements"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (measurement) => {
    const normalized = {
      ...measurement,
      measurementsData: measurement.measurementsData || measurement.measurements_data
    };
    onSelect?.(normalized);
    onClose?.();
  };

  const toggleMeasurementExpand = (id) => {
    setExpandedMeasurements((current) =>
    current.includes(id) ?
    current.filter((item) => item !== id) :
    [...current, id]
    );
  };

  const handleCreateMeasurement = async (measurementsData) => {
    if (!customerId) {
      showToast(t("customerRequiredMeasurements"), "error");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        customer_id: customerId,
        measurements_data: cleanMeasurementValues(measurementsData),
        outfit_type: outfitType?.id || outfitType?.label || "",
        outfit_label: `${outfitType?.label || t("items")} - ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      };
      const res = await measurementApi.create(payload);
      const created = res.data?.data;
      if (created) {
        // Normalize the response to ensure consistent field names
        const normalizedMeasurement = {
          ...created,
          measurementsData: created.measurementsData || created.measurements_data
        };
        setMeasurements((prev) => [normalizedMeasurement, ...prev]);
        onSelect?.(normalizedMeasurement);
        setShowMeasurementSheet(false);
        onClose?.();
        showToast(t("measurementSaved"), "success");
      }
    } catch (err) {
      const message = err.response?.data?.message || t("unableSaveMeasurement");
      showToast(message, "error");

    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <BottomSheet
        visible={visible && !showMeasurementSheet}
        onClose={onClose}
        title={t("selectMeasurements")}
        subtitle={t("selectMeasurementsSubtitle")}>

        {loading ?
        <ActivityIndicator size="large" color={colors123.primary} /> :
        measurements.length === 0 ?
        <View style={styles.emptyContainer}>
            <Ionicons
            name="body-outline"
            size={48}
            color={colors123.border} />

            <Text style={styles.emptyTitle}>{t("noMeasurementsYet")}</Text>
            <Text style={styles.emptyText}>
              {t("noMeasurementsYetDescription")}
            </Text>
          </View> :

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}>

            {measurements.map((measurement) => {
            const isSelected = measurement.id === selectedMeasurementId;
            const data = measurement.measurementsData || measurement.measurements_data || {};
            const entries = getMeasurementEntries(data);
            const isExpanded = expandedMeasurements.includes(measurement.id);
            const visibleEntries = isExpanded ? entries : [];

            return (
              <TouchableOpacity
                key={measurement.id}
                style={[
                styles.measurementItem,
                isSelected && styles.measurementItemSelected]
                }
                onPress={() => handleSelect(measurement)}>

                  <View style={styles.measurementHeader}>
                    <View style={styles.measurementTitleBlock}>
                      <Text style={styles.measurementTitle}>
                        {measurement.outfitLabel || measurement.outfit_label || `Profile #${measurement.id}`}
                      </Text>
                      <Text style={styles.measurementSubtitle}>
                        {measurement.outfitType || measurement.outfit_type || t("fitProfile")} • {entries.length} fields
                      </Text>
                    </View>
                    <View style={[styles.selectPill, isSelected && styles.selectPillSelected]}>
                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                        size={17}
                        color={isSelected ? colors123.surface : colors123.primary} />
                      <Text style={[styles.selectPillText, isSelected && styles.selectPillTextSelected]}>
                        {isSelected ? "Selected" : "Select"}
                      </Text>
                    </View>
                  </View>

                  {isExpanded ? <ResponsiveGrid style={styles.measurementGrid}>
                    {visibleEntries.map(([key, value], index) =>
                  <MotiView
                    key={`${measurement.id}-${key}`}
                    from={{ opacity: 0, translateY: 10, scale: 0.98 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ delay: index * 45, duration: 260, type: "timing" }}
                    style={styles.measurementRow}>
                        <MeasurementFieldThumb
                      bodyType={getBodyType(measurement)}
                      label={key}
                      size={38} />

                        <View style={styles.measurementRowText}>
                          <Text numberOfLines={2} style={styles.measurementLabel}>{key}</Text>
                          <Text style={styles.measurementValue}>{value}</Text>
                        </View>
                      </MotiView>
                  )}
                  </ResponsiveGrid> : null}

                  {entries.length > 0 ?
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation?.();
                    toggleMeasurementExpand(measurement.id);
                  }}
                  style={styles.expandButton}>

                      <Text style={styles.expandButtonText}>
                        {isExpanded ? "Hide details" : "View details"}
                      </Text>
                      <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors123.primary} />

                    </TouchableOpacity> :
                null}
                </TouchableOpacity>);

          })}
          </ScrollView>
        }

        <AppCard style={styles.actionsCard} variant="muted">
          <AppButton
            label={t("createNewMeasurement")}
            variant={measurements.length > 0 ? "secondary" : "primary"}
            onPress={() => setShowMeasurementSheet(true)} />

          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>{t("skipContinue")}</Text>
          </TouchableOpacity>
        </AppCard>
      </BottomSheet>

      <MeasurementSheet
        visible={showMeasurementSheet}
        outfitType={outfitType}
        onClose={() => setShowMeasurementSheet(false)}
        onSubmit={handleCreateMeasurement} />

    </>);

}

const styles = StyleSheet.create({
  helperText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
    marginBottom: spacing.md,
  },
  listContainer: {
    gap: spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  emptyTitle: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginTop: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: fonts.sm.fontSize,
    color: colors123.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  measurementItem: {
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.surface,
  },
  measurementItemSelected: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primarySoft,
  },
  measurementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  measurementTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  selectPill: {
    minWidth: 86,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors123.primary,
    backgroundColor: colors123.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
  },
  selectPillSelected: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
  },
  selectPillText: {
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.extrabold,
    color: colors123.primary,
  },
  selectPillTextSelected: {
    color: colors123.surface,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  measurementTitle: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.extrabold,
    color: colors123.text,
  },
  measurementSubtitle: {
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  measurementRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    borderRadius: 14,
    backgroundColor: colors123.surfaceMuted,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  measurementRowText: {
    flex: 1,
    minWidth: 0,
  },
  measurementLabel: {
    flex: 1,
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  measurementValue: {
    fontSize: fonts.sm.fontSize,
    color: colors123.text,
    fontFamily: fonts.extrabold,
    marginTop: 3,
  },
  expandButton: {
    marginTop: spacing.xs,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  expandButtonText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.primary,
    fontFamily: fonts.extrabold,
  },
  actionsCard: {
    padding: 0,
    marginTop: spacing.md,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  skipButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.primary,
    fontFamily: fonts.extrabold,
  },
});

import ListRow from "../components/ListRow";
import InlineAlert from "../components/InlineAlert";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import AppButton from "../components/AppButton";
import BodyDiagram from "../components/BodyDiagram";
import MeasurementRow from "../components/MeasurementRow";

import { useToast } from "../context/ToastContext";
import { OUTFIT_TYPES, getOutfitById } from "../services/outfitTypes";
import storage from "../services/storage";
import { colors123, spacing, fonts } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";

export default function RecordMeasurementScreen({
  navigation,
  route: { params = {} } = {},
}) {
  const { t } = useLanguage();
  const {
    customerId,
    customerName,
    customerGender = "male",
    outfitId,
    outfitLabel,
    editMeasurementId = null,
  } = params;

  const { showToast } = useToast();
  const outfit = getOutfitById(outfitId);
  const [mode, setMode] = useState("input"); // 'input' or 'image'
  const [focusedField, setFocusedField] = useState(null);
  const [measurements, setMeasurements] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Set header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel={mode === "input" ? t("auto_image") : t("auto_input")}
          accessibilityRole="button"
          onPress={() => setMode(mode === "input" ? "image" : "input")}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <MaterialCommunityIcons
            name={mode === "input" ? "image-outline" : "pencil-outline"}
            size={20}
            color={colors123.primary}
          />
        </Pressable>
      ),
    });
  }, [navigation, mode]);

  // Load existing measurement if editing
  const loadExistingMeasurement = useCallback(async () => {
    if (editMeasurementId && customerId) {
      try {
        setIsLoading(true);
        setLoadError("");
        const records = await storage.getMeasurementsByCustomer(customerId);
        const record = records.find(
          (item) => String(item.key) === String(editMeasurementId)
        );
        if (!record) throw new Error(t("auto_no_measurements"));
        setMeasurements(
          Object.fromEntries(
            Object.entries(record._measurementsData || {}).map(
              ([key, value]) => [key, String(value)]
            )
          )
        );
      } catch (error) {
        setLoadError(error.message || t("auto_failed_to_load_measurements"));
      } finally {
        setIsLoading(false);
      }
    }
  }, [editMeasurementId, customerId]);

  React.useEffect(() => {
    loadExistingMeasurement();
  }, [loadExistingMeasurement]);

  const handleFieldChange = (fieldName, value) => {
    setMeasurements((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const hasValidMeasurements = useMemo(() => {
    return Object.values(measurements).some((val) => parseFloat(val) > 0);
  }, [measurements]);

  const handleSave = async () => {
    if (!hasValidMeasurements) {
      Alert.alert(
        t("auto_no_measurements"),
        t("auto_please_enter_at_least_one_measurement_value")
      );
      return;
    }

    setIsLoading(true);
    try {
      // Build measurement data for API
      const measurementData = {
        customer_id: customerId,
        measurements_data: Object.entries(measurements).reduce(
          (acc, [key, val]) => {
            if (val && parseFloat(val) > 0) {
              acc[key] = parseFloat(val);
            }
            return acc;
          },
          {}
        ),
        outfit_type: outfitId,
        outfit_label: outfitLabel,
      };

      // Save to API
      if (editMeasurementId) {
        await storage.updateMeasurement(editMeasurementId, measurementData);
      } else {
        await storage.saveMeasurement(customerId, measurementData);
      }

      // Also store locally with timestamp for offline support
      const storageKey = `measurement_${customerId}_${outfitId}_${Date.now()}`;
      await storage.setMeasurement(storageKey, {
        ...measurementData,
        timestamp: new Date().toISOString(),
      });

      showToast(t("auto_measurement_saved_successfully"));
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t("auto_error"),
        t("auto_failed_to_save_measurement_please_try_again")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!outfitId) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.headerTitle}>
          {t("selectOutfit")}
        </Text>
        <Text style={styles.headerSubtitle}>{customerName}</Text>
        {OUTFIT_TYPES.filter((item) => item.gender === customerGender).map(
          (item) => (
            <ListRow
              key={item.id}
              title={item.label}
              onPress={() =>
                navigation.setParams({
                  outfitId: item.id,
                  outfitLabel: item.label,
                })
              }
              trailing={
                <MaterialCommunityIcons
                  name="chevron-right"
                  color={colors123.textMuted}
                  size={24}
                />
              }
            />
          )
        )}
      </ScrollView>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t("auto_outfit_not_found")}</Text>
        <AppButton
          label={t("auto_go_back")}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <InlineAlert
          message={loadError}
          onRetry={loadExistingMeasurement}
          retryLabel={t("retry")}
        />
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{outfitLabel}</Text>
          <Text style={styles.headerSubtitle}>{customerName}</Text>
          <View style={styles.headerTag}>
            <MaterialCommunityIcons
              name={customerGender === "female" ? "human-female" : "human-male"}
              size={16}
              color={colors123.primary}
            />

            <Text style={styles.headerTagText}>
              {customerGender === "female" ? "Female" : "Male"}
            </Text>
          </View>
        </View>

        {/* Mode Indicator */}
        <View style={styles.modeContainer}>
          <View
            style={[
              styles.modeBadge,
              mode === "input" && styles.modeBadgeActive,
            ]}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color={mode === "input" ? "#FFF" : colors123.textMuted}
            />

            <Text
              style={[
                styles.modeBadgeText,
                mode === "input" && styles.modeBadgeTextActive,
              ]}
            >
              {t("auto_input")}
            </Text>
          </View>
          <View
            style={[
              styles.modeBadge,
              mode === "image" && styles.modeBadgeActive,
            ]}
          >
            <MaterialCommunityIcons
              name="image-outline"
              size={16}
              color={mode === "image" ? "#FFF" : colors123.textMuted}
            />

            <Text
              style={[
                styles.modeBadgeText,
                mode === "image" && styles.modeBadgeTextActive,
              ]}
            >
              {t("auto_image")}
            </Text>
          </View>
        </View>

        {/* Body Diagram */}
        <BodyDiagram
          outfitType={outfit.bodyType}
          focusedField={focusedField}
          gender={customerGender}
        />

        {/* Measurement Fields */}
        <View style={styles.fieldsSection}>
          <Text style={styles.fieldsTitle}>
            {t("auto_measurements_3")}
            {outfit.fields.length}
            {t("auto_fields")}
          </Text>
          <View style={styles.fieldsList}>
            {outfit.fields.map((fieldName, index) => (
              <MeasurementRow
                key={fieldName}
                fieldName={fieldName}
                fieldIndex={index + 1}
                value={measurements[fieldName] || ""}
                onChangeText={(value) => handleFieldChange(fieldName, value)}
                onFocus={() => setFocusedField(fieldName)}
                isFocused={focusedField === fieldName}
              />
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("auto_fields_filled")}</Text>
            <Text style={styles.summaryValue}>
              {
                Object.values(measurements).filter((v) => parseFloat(v) > 0)
                  .length
              }{" "}
              of {outfit.fields.length}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            label={t("auto_cancel")}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.actionButton}
          />

          <AppButton
            label={editMeasurementId ? "Update" : "Save Measurement"}
            onPress={handleSave}
            disabled={!hasValidMeasurements || isLoading || Boolean(loadError)}
            loading={isLoading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerButton: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors123.textMuted,
    marginBottom: spacing.sm,
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors123.primaryLight,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  headerTagText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.primary,
  },
  modeContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  modeBadgeActive: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
  },
  modeBadgeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  modeBadgeTextActive: {
    color: colors123.surface,
  },
  fieldsSection: {
    marginVertical: spacing.lg,
  },
  fieldsTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  fieldsList: {
    gap: spacing.xs,
  },
  summary: {
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors123.infoLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: colors123.text,
    fontFamily: fonts.medium,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors123.primary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 14,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

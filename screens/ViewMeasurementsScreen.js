import InlineAlert from "../components/InlineAlert";
import { ListSkeleton } from "../components/SkeletonBlock";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, parseISO } from "date-fns";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import EmptyState from "../components/EmptyState";
import MeasurementFieldThumb from "../components/MeasurementFieldThumb";
import ScreenHeader from "../components/ScreenHeader";
import { useToast } from "../context/ToastContext";
import { getOutfitById } from "../services/outfitTypes";
import storage from "../services/storage";
import { colors123, spacing, fonts, radius } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";

export default function ViewMeasurementsScreen({
  navigation,
  route: { params = {} } = {},
}) {
  const { t } = useLanguage();
  const { customerId, customerName, customerGender = "male" } = params;
  const { showToast } = useToast();

  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [expandedOutfits, setExpandedOutfits] = useState({});

  // Load measurements on mount
  useEffect(() => {
    loadMeasurements();
  }, [customerId]);

  const loadMeasurements = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const data = await storage.getMeasurementsByCustomer(customerId);
      setMeasurements(
        data.map((item) => ({
          ...item._measurementsData,
          ...item,
          timestamp: item._updatedAt || item._createdAt,
        }))
      );
    } catch (error) {
      setLoadError(t("auto_failed_to_load_measurements"));
    } finally {
      setIsLoading(false);
    }
  }, [customerId, showToast]);

  // Group measurements by outfit type
  const groupedMeasurements = useMemo(() => {
    const groups = {};

    measurements.forEach((measurement) => {
      const outfitType = measurement._outfitType;
      if (!groups[outfitType]) {
        groups[outfitType] = [];
      }
      groups[outfitType].push(measurement);
    });

    return groups;
  }, [measurements]);

  const toggleOutfitExpanded = (outfitType) => {
    setExpandedOutfits((prev) => ({
      ...prev,
      [outfitType]: !prev[outfitType],
    }));
  };

  const handleEditMeasurement = (measurement) => {
    navigation.navigate("RecordMeasurement", {
      customerId,
      customerName,
      customerGender: measurement._customerGender || "male",
      outfitId: measurement._outfitType,
      outfitLabel: measurement._outfitLabel,
      editMeasurementId: measurement.key,
    });
  };

  const handleDeleteMeasurement = (measurement) => {
    Alert.alert(
      t("auto_delete_measurement"),
      t("auto_are_you_sure_you_want_to_delete_this_measure"),

      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.deleteMeasurement(measurement.key);
              setMeasurements((prev) =>
                prev.filter((m) => m.key !== measurement.key)
              );
              showToast(t("auto_measurement_deleted_2"));
            } catch (error) {
              showToast(t("auto_failed_to_delete_measurement"), "error");
            }
          },
        },
      ]
    );
  };

  const renderMeasurementValue = (measurement, fieldName) => {
    const value = measurement[fieldName];
    return value !== undefined && value !== null && value !== ""
      ? `${value} cm`
      : "—";
  };

  const getBodyType = (outfitType) => {
    const normalized = String(outfitType || "")
      .toLowerCase()
      .trim();
    if (["pant", "pants", "trouser", "dhoti", "dupatta"].includes(normalized)) {
      return "lower";
    }
    if (
      ["salwar", "lehenga", "anarkali", "gown", "kurta"].includes(normalized)
    ) {
      return "full";
    }
    return "upper";
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ListSkeleton />
      </View>
    );
  }

  if (loadError) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <InlineAlert
          message={loadError}
          onRetry={loadMeasurements}
          retryLabel={t("retry")}
        />
      </ScrollView>
    );
  }

  if (Object.keys(groupedMeasurements).length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t("auto_measurements_2")}

          subtitle={`No measurements recorded for ${customerName} yet.`}
        />

        <EmptyState
          description={t("auto_record_measurements_for_different_outfit_typ")}
          icon="history"
          title={t("auto_no_measurements")}
        />

        <AppButton
          label={t("auto_record_measurement")}
          icon="plus"
          onPress={() => {
            navigation.navigate("RecordMeasurement", {
              customerId,
              customerName,
              customerGender,
            });
          }}
          style={styles.actionButton}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title={t("auto_measurements_2")}

        subtitle={`${
          Object.keys(groupedMeasurements).length
        } outfit types recorded`}
      />

      {Object.entries(groupedMeasurements).map(
        ([outfitType, outfitMeasurements]) => {
          const outfit = getOutfitById(outfitType);
          const isExpanded = expandedOutfits[outfitType];
          const latestMeasurement = outfitMeasurements[0];

          if (!outfit) return null;

          return (
            <View key={outfitType} style={styles.outfitGroup}>
              {/* Header */}
              <Pressable
                accessibilityRole="button"
                onPress={() => toggleOutfitExpanded(outfitType)}
                style={({ pressed }) => [
                  styles.outfitHeader,
                  pressed && { backgroundColor: colors123.background },
                ]}
              >
                <View style={styles.outfitHeaderLeft}>
                  <Text style={styles.outfitName}>{outfit.label}</Text>
                  <View style={styles.outfitMeta}>
                    <MaterialCommunityIcons
                      name="history"
                      size={14}
                      color={colors123.textMuted}
                    />

                    <Text style={styles.outfitMetaText}>
                      {outfitMeasurements.length} version
                      {outfitMeasurements.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={colors123.textMuted}
                />
              </Pressable>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.outfitContent}>
                  {/* Latest measurement preview */}
                  <View style={styles.latestPreview}>
                    <Text style={styles.previewTitle}>
                      {t("auto_latest")}
                      {latestMeasurement.timestamp
                        ? format(
                            parseISO(latestMeasurement.timestamp),
                            "dd MMM yyyy"
                          )
                        : "—"}
                      )
                    </Text>
                    <ResponsiveGrid minItemWidth={140} style={styles.previewGrid}>
                      {outfit.fields.slice(0, 4).map((field) => (
                        <View key={field} style={styles.previewItem}>
                          <MeasurementFieldThumb
                            bodyType={getBodyType(outfitType)}
                            label={field}
                            size={38}
                          />

                          <Text style={styles.previewItemLabel}>
                            {field}
                          </Text>
                          <Text style={styles.previewItemValue}>
                            {renderMeasurementValue(latestMeasurement, field)}
                          </Text>
                        </View>
                      ))}
                    </ResponsiveGrid>
                    {outfit.fields.length > 4 && (
                      <Text style={styles.previewMore}>
                        +{outfit.fields.length - 4}
                        {t("auto_more_fields")}
                      </Text>
                    )}
                  </View>

                  {/* Version List */}
                  <View style={styles.versionList}>
                    <Text style={styles.versionListTitle}>
                      {t("auto_all_versions")}
                    </Text>
                    {outfitMeasurements.map((measurement, index) => (
                      <AppCard
                        key={measurement.key}
                        style={styles.versionCard}
                        variant="muted"
                      >
                        <View style={styles.versionCardHeader}>
                          <View>
                            <Text style={styles.versionCardTitle}>
                              {t("auto_measurement")}
                              {outfitMeasurements.length - index}
                            </Text>
                            <Text style={styles.versionCardDate}>
                              {format(
                                parseISO(measurement.timestamp),
                                "dd MMM yyyy, hh:mm a"
                              )}
                            </Text>
                          </View>
                          <View style={styles.versionCardActions}>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => handleEditMeasurement(measurement)}
                              style={({ pressed }) => [
                                styles.actionIcon,
                                pressed && { opacity: 0.6 },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="pencil-outline"
                                size={18}
                                color={colors123.primary}
                              />
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() =>
                                handleDeleteMeasurement(measurement)
                              }
                              style={({ pressed }) => [
                                styles.actionIcon,
                                pressed && { opacity: 0.6 },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="trash-can-outline"
                                size={18}
                                color="#EF4444"
                              />
                            </Pressable>
                          </View>
                        </View>

                        {/* Measurement grid */}
                        <ResponsiveGrid minItemWidth={140} style={styles.measurementGrid}>
                          {outfit.fields.map((field) => (
                            <View
                              key={field}
                              style={styles.measurementGridItem}
                            >
                              <MeasurementFieldThumb
                                bodyType={getBodyType(outfitType)}
                                label={field}
                                size={40}
                              />

                              <View style={styles.measurementGridCopy}>
                                <Text style={styles.measurementGridLabel}>
                                  {field}
                                </Text>
                                <Text style={styles.measurementGridValue}>
                                  {renderMeasurementValue(measurement, field)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </ResponsiveGrid>
                      </AppCard>
                    ))}
                  </View>

                  {/* Record new button */}
                  <AppButton
                    label={`Record ${outfit.label}`}
                    icon="plus"
                    variant="secondary"
                    onPress={() => {
                      navigation.navigate("RecordMeasurement", {
                        customerId,
                        customerName,
                        customerGender:
                          latestMeasurement._customerGender || "male",
                        outfitId: outfitType,
                        outfitLabel: outfit.label,
                      });
                    }}
                    style={styles.recordButton}
                  />
                </View>
              )}
            </View>
          );
        }
      )}

      {/* Record new outfit button */}
      <AppButton
        label={t("auto_record_new_outfit")}
        icon="plus"
        style={styles.newOutfitButton}
        onPress={() => {
          navigation.navigate("RecordMeasurement", {
            customerId,
            customerName,
            customerGender,
          });
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    marginTop: spacing.md,
  },
  outfitGroup: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  outfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.surface,
  },
  outfitHeaderLeft: {
    flex: 1,
  },
  outfitName: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  outfitMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  outfitMetaText: {
    fontSize: 12,
    color: colors123.textMuted,
  },
  outfitContent: {
    backgroundColor: colors123.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  latestPreview: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0,
    borderColor: colors123.borderLight,
  },
  previewTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.15,
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  previewItem: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.xs,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: spacing.xs,
  },
  previewItemLabel: {
    fontSize: 12,
    color: colors123.textMuted,
    marginBottom: 0,
    flex: 1,
    lineHeight: 18,
  },
  previewItemValue: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors123.primary,
  },
  previewMore: {
    fontSize: 12,
    color: colors123.textMuted,
    textAlign: "center",
  },
  versionList: {
    gap: spacing.sm,
  },
  versionListTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  versionCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  versionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors123.border,
  },
  versionCardTitle: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  versionCardDate: {
    fontSize: 12,
    color: colors123.textMuted,
  },
  versionCardActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionIcon: {
    padding: spacing.xs,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  measurementGridItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors123.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  measurementGridCopy: {
    flex: 1,
    minWidth: 0,
  },
  measurementGridLabel: {
    fontSize: 12,
    color: colors123.textMuted,
    marginBottom: 2,
  },
  measurementGridValue: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  recordButton: {
    marginTop: spacing.md,
  },
  newOutfitButton: {
    marginTop: spacing.lg,
  },
});

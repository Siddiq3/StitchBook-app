import AppButton from "../components/AppButton";
import EmptyState from "../components/EmptyState";
import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppCard from "../components/AppCard";
import AvatarBadge from "../components/AvatarBadge";
import MeasurementFigure from "../components/MeasurementFigure";
import MeasurementSheet from "../components/MeasurementSheet";
import ScreenHeader from "../components/ScreenHeader";
import { ListSkeleton } from "../components/SkeletonBlock";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { measurementFields } from "../utils/mockData";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";import { useLanguage } from "../context/LanguageContext";

function countFilledFields(values) {
  return measurementFields.filter((field) => values?.[field.key]).length;
}

export default function MeasurementsScreen({ navigation }) {const { t } = useLanguage();
  const { measurementsError } = useStitchPro();
  const { customers, measurements, addMeasurement, fetchMeasurements, measurementsLoading, fetchCustomers } =
  useStitchPro();
  const { showToast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch customers and their measurements on mount
  useEffect(() => {
    async function loadData() {
      await fetchCustomers({ limit: 50 });
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!customers || customers.length === 0) return;
    Promise.all(
      customers.map((customer) =>
        fetchMeasurements(customer.id).catch(() => null)
      )
    );
  }, [customers, fetchMeasurements]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCustomers({ limit: 50 });
    const customerList = customers && customers.length > 0 ? customers : [];
    await Promise.all(
      customerList.map((customer) =>
      fetchMeasurements(customer.id).catch(() => null)
      )
    );
    setRefreshing(false);
  }, [fetchCustomers, fetchMeasurements, customers]);

  const measurementRecords = useMemo(
    () => {
      if (!customers || !Array.isArray(customers)) return [];
      return customers.map((customer) => {
        const profile = measurements[customer.id] || {};
        const count = countFilledFields(profile);
        return {
          customer,
          profile,
          completion: Math.round(count / measurementFields.length * 100),
          filledFields: count
        };
      });
    },
    [customers, measurements]
  );

  const completedProfiles = measurementRecords.filter(
    (record) => record.filledFields > 0
  ).length;
  const averageCoverage =
  measurementRecords.length > 0 ?
  Math.round(
    measurementRecords.reduce(
      (sum, record) => sum + record.completion,
      0
    ) / measurementRecords.length
  ) :
  0;
  const spotlightRecord =
  [...measurementRecords].sort(
    (left, right) => right.filledFields - left.filledFields
  )[0] || null;

  const openSheet = (customer) => {
    // CRITICAL: Check if customer has gender set
    if (!customer.gender) {
      showToast(t("auto_please_set_customer_gender_in_customer_profi"),

      'error'
      );
      return;
    }
    setSelectedCustomer(customer);
    setSheetVisible(true);
  };

  const handleSaveMeasurements = (form) => {
    if (!selectedCustomer) {
      return;
    }
    addMeasurement({
      customerId: selectedCustomer.id,
      outfitType: form.outfitType,
      outfitLabel: form.outfitLabel,
      measurementsData: form
    });
    setSheetVisible(false);
    showToast(`${selectedCustomer.name}'s fit profile is saved.`);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

        <ScreenHeader
          eyebrow="Fit Library"
          title={t("auto_measurements_2")}
          subtitle={t("auto_structured_reusable_fit_profiles_make_high_t")} />


<InlineAlert message={measurementsError ? t("loadMeasurementsFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
        <View style={styles.heroCard}>

          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>{t("auto_custom_measurement_studio")}</Text>
              <Text style={styles.heroTitle}>{t("auto_fit_profiles_that_feel_tailored_not_generic")}

              </Text>
              <Text style={styles.heroSubtitle}>{t("auto_open_a_client_profile_review_the_visual_fit_")}

              </Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{averageCoverage}%</Text>
              <Text style={styles.heroPillLabel}>{t("auto_avg_coverage")}</Text>
            </View>
          </View>

          {spotlightRecord ?
          <View style={styles.heroPreview}>
              <View style={styles.heroPreviewCopy}>
                <Text style={styles.heroPreviewLabel}>{t("auto_most_complete_profile")}

              </Text>
                <Text style={styles.heroPreviewName}>
                  {spotlightRecord.customer.name}
                </Text>
                <Text style={styles.heroPreviewMeta}>
                  {spotlightRecord.filledFields}/{measurementFields.length}{t("auto_fit_points_captured")}

              </Text>
              </View>
              <View style={styles.heroFigureWrap}>
                <MeasurementFigure compact values={spotlightRecord.profile} />
              </View>
            </View> :
          null}
        </View>

        <View style={styles.summaryRow}>
          <AppCard style={styles.summaryCard} variant="muted">
            <Text style={styles.summaryLabel}>{t("auto_profiles_saved")}</Text>
            <Text style={styles.summaryValue}>{completedProfiles}</Text>
          </AppCard>
          <AppCard style={styles.summaryCard} variant="muted">
            <Text style={styles.summaryLabel}>{t("auto_average_coverage")}</Text>
            <Text style={styles.summaryValue}>{averageCoverage}%</Text>
          </AppCard>
        </View>

        {measurementsLoading ?
        <ListSkeleton /> : measurementsError && !measurementRecords.length ? null : !measurementRecords.length ? <EmptyState title={t("auto_no_measurements")} description={t("noCustomersYetDescription")} action={<AppButton label={t("customersTitle")} variant="secondary" onPress={() => navigation.navigate("StudioTabs", { screen: "Customers" })} />} /> :

        <View style={styles.list}>
            {measurementRecords.map((record, index) =>
          <MotiView
            key={record.customer.id}
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: 10 }}
            transition={{
              delay: index * 40,
              duration: 260,
              type: "timing"
            }}>

                <Pressable accessibilityRole="button"
              onPress={() => openSheet(record.customer)}
              style={({ pressed }) => [
              styles.recordCard,
              pressed && styles.pressedCard]
              }>

                  <View style={styles.recordTopRow}>
                    <AvatarBadge
                  initials={record.customer.avatar}
                  name={record.customer.name} />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordName}>
                        {record.customer.name}
                      </Text>
                      <Text style={styles.recordMeta}>
                        {record.filledFields > 0 ?
                    `${record.filledFields}/${measurementFields.length} key values captured` :
                    "No measurements captured yet"}
                      </Text>
                    </View>
                    <View style={styles.completionBubble}>
                      <Text style={styles.completionBubbleValue}>
                        {record.completion}%
                      </Text>
                      <Text style={styles.completionBubbleLabel}>fit</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                  style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      record.completion,
                      record.filledFields ? 12 : 0
                    )}%`
                  }]
                  } />

                  </View>

                  <View style={styles.snapshotRow}>
                    {["chest", "waist", "sleeve"].map((key) => {
                  const field = measurementFields.find(
                    (entry) => entry.key === key
                  );
                  return (
                    <View key={key} style={styles.snapshotPill}>
                          <Text style={styles.snapshotLabel}>
                            {field?.shortLabel || key}
                          </Text>
                          <Text style={styles.snapshotValue}>
                            {record.profile[key] ?
                        `${record.profile[key]}"` :
                        "--"}
                          </Text>
                        </View>);

                })}
                  </View>

                  <View style={styles.recordFooter}>
                    <Text style={styles.recordFootnote}>
                      {record.profile.updatedAt ?
                  `Updated ${format(
                    parseISO(record.profile.updatedAt),
                    "dd MMM"
                  )}` :
                  "Tap to create profile"}
                    </Text>
                    <View style={styles.recordCta}>
                      <Text style={styles.recordCtaText}>{t("auto_open_fit_profile")}</Text>
                      <MaterialCommunityIcons
                    color={colors123.primary}
                    name="chevron-right"
                    size={18} />

                    </View>
                  </View>
                </Pressable>
              </MotiView>
          )}
          </View>
        }
      </ScrollView>

      <MeasurementSheet
        customer={selectedCustomer}
        initialValues={
        selectedCustomer ? measurements[selectedCustomer.id] : {}
        }
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSaveMeasurements}
        visible={sheetVisible} />

    </>);

}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 112,
    gap: spacing.md,
    backgroundColor: colors123.background,
  },
  heroCard: {
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    ...shadows.card,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  heroEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 21,
    lineHeight: 27,
    color: colors123.text,
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors123.textMuted,
  },
  heroPill: {
    minWidth: 82,
    borderRadius: 18,
    backgroundColor: colors123.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  heroPillValue: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors123.surface,
  },
  heroPillLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
  },
  heroPreview: {
    borderRadius: 16,
    backgroundColor: colors123.surfaceMuted,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroPreviewCopy: {
    gap: 4,
  },
  heroPreviewLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.textSoft,
    textTransform: "uppercase",
  },
  heroPreviewName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  heroPreviewMeta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
  },
  heroFigureWrap: {
    marginTop: spacing.xs,
    borderRadius: 14,
    backgroundColor: colors123.surface,
    overflow: "visible",
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minHeight: 96,
    justifyContent: "center",
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  summaryValue: {
    marginTop: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors123.text,
  },
  list: {
    gap: spacing.sm,
  },
  recordCard: {
    backgroundColor: colors123.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  pressedCard: {
    opacity: 0.88,
  },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  recordName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  recordMeta: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors123.backgroundAccent,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors123.primary,
  },
  completionBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  completionBubbleValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.primaryDark,
  },
  completionBubbleLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primary,
    textTransform: "uppercase",
  },
  snapshotRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  snapshotPill: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors123.surfaceMuted,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  snapshotLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textSoft,
  },
  snapshotValue: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors123.text,
  },
  recordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  recordFootnote: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textSoft,
  },
  recordCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  recordCtaText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primary,
  },
});

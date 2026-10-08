import AppButton from "../components/AppButton";
import EmptyState from "../components/EmptyState";
import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppCard from "../components/AppCard";
import AvatarBadge from "../components/AvatarBadge";
import MeasurementSheet from "../components/MeasurementSheet";
import { ListSkeleton } from "../components/SkeletonBlock";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import measurementFieldsConfig from "../configs/measurementFieldsConfig";
import { getMeasurementEntries } from "../utils/formHelpers";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";
import { useLanguage } from "../context/LanguageContext";

// Saved values are keyed by the outfit's own field labels ("Chest", "Blouse Length"),
// so coverage is measured against that outfit's field list, not a fixed demo list.
function summarizeProfile(profile) {
  const entries = getMeasurementEntries(profile).filter(([, value]) => Number(value) > 0);
  const expected = measurementFieldsConfig[profile?.outfitType]?.fields?.length || entries.length;
  return {
    entries,
    expected,
    completion: expected ? Math.min(100, Math.round(entries.length / expected * 100)) : 0,
  };
}

export default function MeasurementsScreen({ navigation }) {const { t } = useLanguage();
  const { measurementsError } = useStitchPro();
  const { customers, measurements, addMeasurement, fetchLatestMeasurements, measurementsLoading, fetchCustomers } =
  useStitchPro();
  const { showToast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Customers and every customer's latest measurement, in two requests total
  useEffect(() => {
    fetchCustomers();
    fetchLatestMeasurements();
  }, [fetchCustomers, fetchLatestMeasurements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCustomers({ force: true }), fetchLatestMeasurements()]);
    setRefreshing(false);
  }, [fetchCustomers, fetchLatestMeasurements]);

  const measurementRecords = useMemo(
    () => {
      if (!customers || !Array.isArray(customers)) return [];
      return customers.map((customer) => {
        const profile = measurements[customer.id] || {};
        const { entries, expected, completion } = summarizeProfile(profile);
        return {
          customer,
          profile,
          entries,
          expected,
          completion,
          filledFields: entries.length
        };
      // Saved profiles first; customers without one follow as compact rows
      }).sort((a, b) => (b.filledFields > 0) - (a.filledFields > 0));
    },
    [customers, measurements]
  );

  const completedProfiles = measurementRecords.filter(
    (record) => record.filledFields > 0
  ).length;
  // Coverage of the profiles that exist; customers without one are counted above
  const savedRecords = measurementRecords.filter((record) => record.filledFields > 0);
  const averageCoverage = savedRecords.length ?
  Math.round(savedRecords.reduce((sum, record) => sum + record.completion, 0) / savedRecords.length) :
  0;

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


<InlineAlert message={measurementsError ? t("loadMeasurementsFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
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
            {measurementRecords.map((record, index) => record.filledFields === 0 ?
          <Pressable
            key={record.customer.id}
            accessibilityRole="button"
            accessibilityLabel={`${record.customer.name}. ${t("auto_no_measurements")}`}
            onPress={() => openSheet(record.customer)}
            style={({ pressed }) => [styles.emptyRow, pressed && styles.pressedCard]}>
              <AvatarBadge initials={record.customer.avatar} name={record.customer.name} size={36} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.emptyRowName} numberOfLines={1}>{record.customer.name}</Text>
                <Text style={styles.recordMeta}>{t("auto_no_measurements")}</Text>
              </View>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors123.primary} />
            </Pressable> :
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
                    `${record.profile.outfitLabel || record.profile.outfitType || ""} · ${record.filledFields}/${record.expected}` :
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

                  {record.entries.length > 0 &&
                  <View style={styles.snapshotRow}>
                    {record.entries.slice(0, 3).map(([label, value]) =>
                    <View key={label} style={styles.snapshotPill}>
                          <Text style={styles.snapshotLabel} numberOfLines={1}>{label}</Text>
                          <Text style={styles.snapshotValue}>{`${value}"`}</Text>
                        </View>
                    )}
                  </View>}

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
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors123.background,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    ...shadows.card,
  },
  summaryCard: {
    flex: 1,
    minHeight: 56,
    justifyContent: "center",
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  summaryValue: {
    marginTop: spacing.xs,
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors123.text,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors123.borderLight,
  },
  emptyRowName: { fontFamily: fonts.semibold, fontSize: 15, color: colors123.text },
  list: {
    gap: 0,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.card,
  },
  recordCard: {
    backgroundColor: colors123.surface,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: colors123.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
    ...shadows.card,
  },
  pressedCard: {
    opacity: 0.88,
  },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    borderRadius: radius.sm,
    backgroundColor: colors123.surfaceMuted,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 4,
  },
  snapshotLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textSoft,
  },
  snapshotValue: {
    marginTop: 0,
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

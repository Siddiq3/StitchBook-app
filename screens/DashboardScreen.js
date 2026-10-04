import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import AppButton from "../components/AppButton";
import SegmentedControl from "../components/SegmentedControl";
import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppCard from "../components/AppCard";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/ui/StatusBadge";
import StatCard from "../components/ui/StatCard";
import { DashboardSkeleton } from "../components/SkeletonBlock";
import { useLanguage } from "../context/LanguageContext";
import { useStitchPro } from "../context/StitchProContext";
import {
  colors123,
  SIZES,
  normalize,
  radius,
  spacing,
  fonts,
  formatCompactCurrency,
  formatCurrency } from
"../utils/theme";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTrialDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return String(value);
  }
};

const getTrialMeta = (subscription = {}) => {
  const startDate = toDate(subscription.trialStartDate || subscription.startDate);
  const endDate = toDate(subscription.trialEndDate || subscription.endDate);
  const fallbackTotal = startDate && endDate ?
  Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY)) :
  10;
  const totalDays = Math.max(1, Number(subscription.trialDaysTotal || fallbackTotal));
  const remainingDays = Math.max(0, Number(
    subscription.trialDaysRemaining ?? subscription.daysRemaining ?? 0
  ));
  const usedDays = Math.min(totalDays, Math.max(0, totalDays - remainingDays));
  const progressPercent = Math.min(100, Math.max(0, Math.round(usedDays / totalDays * 100)));

  return {
    totalDays,
    remainingDays,
    usedDays,
    progressPercent
  };
};

const cleanDisplayText = (value, fallback) => {
  const text = String(value || "").trim();
  if (!text || text === "?" || text.toLowerCase() === "undefined" || text.toLowerCase() === "null") {
    return fallback;
  }
  return text;
};

function SummaryTile({ icon, label, value, toneColor, delay = 0 }) {
  return (
    <MotiView
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: 14 }}
      transition={{ delay, duration: 320, type: "timing" }}
      style={styles.gridTile}>

      <StatCard label={label} value={value} icon={icon} color={toneColor} />
    </MotiView>);

}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { dashboardError } = useStitchPro();
  const {
    isBooting,
    orders,
    fetchOrders,
    dashboardLoading,
    dashboardStats,
    fetchDashboardStats,
    subscription,
    fetchSubscription,
    staff,
    fetchStaff,
    user,
    shop
  } = useStitchPro();
  const [period, setPeriod] = useState("week"); // today, week, month, year
  const [orderType, setOrderType] = useState(null); // null, 'stitching', 'alteration'

  // Fetch orders and dashboard stats on mount
  useEffect(() => {
    fetchOrders();
    fetchDashboardStats(period, orderType);
    fetchStaff?.();
  }, [fetchOrders, fetchDashboardStats, fetchStaff, period, orderType]);

  useEffect(() => {
    if (!subscription) {
      fetchSubscription().catch((err) => {

      });
    }
  }, [fetchSubscription, subscription]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    await fetchOrders();
    await fetchDashboardStats(period, orderType);
  }, [fetchOrders, fetchDashboardStats, period, orderType]);

  // Compute today's deliveries and overdue orders from metrics
  const todayDeliveries = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    const today = new Date().toISOString().split("T")[0];
    return orders.filter(
      (order) => order.deliveryDate && order.deliveryDate === today && order.status !== "delivered"
    );
  }, [orders]);

  const overdueOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    const today = new Date().toISOString().split("T")[0];
    return orders.filter(
      (order) => order.deliveryDate && order.deliveryDate < today && order.status !== "delivered"
    );
  }, [orders]);

  const upcomingOrders = useMemo(
    () => {
      if (!orders || !Array.isArray(orders)) return [];
      return [...orders].
      filter((order) => order.deliveryDate && order.status !== "delivered").
      sort((left, right) =>
      left.deliveryDate.localeCompare(right.deliveryDate)
      ).
      slice(0, 4);
    },
    [orders]
  );

  const revenueTrendData = useMemo(() => {
    const rows = dashboardStats?.weeklyRevenue;
    if (!Array.isArray(rows)) return [];

    return rows.
    map((row) => {
      const rawDate = row.date || row.label;
      let label = rawDate ? String(rawDate).slice(0, 10) : "";

      try {
        if (rawDate) {
          label = format(parseISO(String(rawDate)), "dd MMM");
        }
      } catch {
        label = rawDate ? String(rawDate).slice(0, 10) : "";
      }

      return {
        label,
        value: Number(row.revenue ?? row.totalRevenue ?? row.value ?? 0)
      };
    }).
    filter((point) => point.label);
  }, [dashboardStats?.weeklyRevenue]);

  const productionStats = useMemo(() => {
    const rows = Array.isArray(orders) ? orders : [];
    const today = new Date().toISOString().split("T")[0];
    const statusOf = (order) => {
      const status = order.status || "started";
      if (status === "pending") return "started";
      if (status === "in_progress") return "cutting";
      return status;
    };
    const dateOf = (order) => order.deliveryDate || order.delivery_date || "";

    const staffEarnings = (Array.isArray(staff) ? staff : []).reduce(
      (sum, member) => sum + Number(member.current_month_earnings || member.total_earnings || 0),
      0
    );

    return {
      cuttingPending: rows.filter((order) => statusOf(order) === "cutting").length,
      stitchingPending: rows.filter((order) => statusOf(order) === "stitching").length,
      deliveryDue: rows.filter((order) => dateOf(order) === today && statusOf(order) !== "delivered").length,
      lateOrders: rows.filter((order) => dateOf(order) && dateOf(order) < today && statusOf(order) !== "delivered").length,
      staffEarnings
    };
  }, [orders, staff]);
  const isTrialActive = subscription?.status === "trial" && subscription?.isActive;
  const isTrialExpired = subscription?.status === "trial_expired" || subscription?.requiresSubscription;
  const trialMeta = useMemo(() => getTrialMeta(subscription), [subscription]);
  const shopName = cleanDisplayText(shop?.name, t("yourShop"));
  if (isBooting || (dashboardLoading && !dashboardStats && !dashboardError)) {
    return (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}>

        <DashboardSkeleton />
      </ScrollView>);

  }

  if (dashboardError && !dashboardStats) {
    return <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}><ScreenHeader title={shopName} /><InlineAlert message={t("loadDashboardFailed")} onRetry={onRefresh} retryLabel={t("retry")} /></ScrollView>;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
      <RefreshControl
        refreshing={dashboardLoading}
        onRefresh={onRefresh}
        tintColor={colors123.primary}
        colors={[colors123.primary]} />

      }>

      <ScreenHeader title={shopName} action={<AppButton icon="plus" label={t("newOrder")} size="sm" onPress={() => navigation.navigate("CustomerSelection")} />} />
      <InlineAlert message={dashboardError ? t("loadDashboardFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
      <SegmentedControl options={["today", "week", "month", "year"].map(value => ({ value, label: t(value) }))} value={period} onChange={setPeriod} />
      <SegmentedControl options={[{ value: null, label: t("all") }, { value: "stitching", label: t("stitching") }, { value: "alteration", label: t("alteration") }]} value={orderType} onChange={setOrderType} disabled={dashboardLoading} />

      {/* Overdue Orders Alert */}
      {overdueOrders.length > 0 &&
      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: -10 }}
        transition={{ duration: 300 }}>

          <Pressable accessibilityRole="button"
          style={styles.alertCard}
          onPress={() => navigation.navigate("Orders")}>

            <View style={styles.alertIcon}>
              <MaterialCommunityIcons
              color={colors123.surface}
              name="alert-circle"
              size={20} />

            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {overdueOrders.length} {overdueOrders.length > 1 ? t("overdueOrders") : t("overdueOrder")}
              </Text>
              <Text style={styles.alertSubtitle}>
                {overdueOrders[0]?.customerName}
                {overdueOrders.length > 1 ? ` +${overdueOrders.length - 1} more` : ""}
              </Text>
            </View>
            <MaterialCommunityIcons
            color={colors123.surface}
            name="chevron-right"
            size={20} />

          </Pressable>
        </MotiView>
      }

      {/* Today's Deliveries */}
      {todayDeliveries.length > 0 &&
      <AppCard>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>{t("todaysDeliveries")}</Text>
              <Text style={styles.sectionSubtitle}>
                {todayDeliveries.length} {t("orders")} {t("readyForPickup")}
              </Text>
            </View>
            <MaterialCommunityIcons
            color={colors123.success}
            name="calendar-today"
            size={22} />

          </View>

          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.todayScroll}>

            {todayDeliveries.map((order, index) =>
          <MotiView
            key={order.id}
            animate={{ opacity: 1, scale: 1 }}
            from={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 50, duration: 260 }}
            style={styles.todayCard}>

                <View style={styles.todayIcon}>
                  <MaterialCommunityIcons
                color={colors123.success}
                name="check-circle"
                size={20} />

                </View>
                <Text style={styles.todayName} numberOfLines={1}>
                  {order.customerName}
                </Text>
                <Text style={styles.todayItem} numberOfLines={1}>
                  {order.item}
                </Text>
                <StatusBadge compact status={order.status} />
              </MotiView>
          )}
          </ScrollView>
        </AppCard>
      }

      <AppCard style={styles.productionCard}>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionTitle}>Production</Text>

          </View>
          <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={colors123.primary} />
        </View>
        <ResponsiveGrid minItemWidth={140} style={styles.productionGrid}>
          {[
          { label: "Cutting pending", value: productionStats.cuttingPending, icon: "content-cut", color: colors123.warning },
          { label: "Stitching pending", value: productionStats.stitchingPending, icon: "needle", color: colors123.primary },
          { label: "Delivery due", value: productionStats.deliveryDue, icon: "truck-delivery-outline", color: colors123.success },
          { label: "Late orders", value: productionStats.lateOrders, icon: "alert-circle-outline", color: colors123.danger },
          { label: "Staff earnings", value: formatCurrency(productionStats.staffEarnings), icon: "cash-multiple", color: colors123.accent }].
          map((item) =>
          <Pressable accessibilityRole="button"
            key={item.label}
            onPress={() => navigation.navigate(item.label === "Staff earnings" ? "Staff" : "Orders")}
            style={({ pressed }) => [
            styles.productionTile,
            pressed && styles.productionTilePressed]
            }>

              <View style={[styles.productionIcon, { backgroundColor: `${item.color}18` }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.productionLabel}>{item.label}</Text>
                <Text style={styles.productionValue}>{item.value}</Text>
              </View>
            </Pressable>
          )}
        </ResponsiveGrid>
      </AppCard>

      <ResponsiveGrid minItemWidth={140} style={styles.grid}>
        <SummaryTile
          delay={40}
          icon="cash-multiple"
          label={t("revenue")}
          toneColor={colors123.warning}
          value={formatCurrency(dashboardStats?.totalRevenue || 0)} />

        <SummaryTile
          delay={80}
          icon="needle"
          label={t("active")}
          toneColor={colors123.info}
          value={String(dashboardStats?.orderCounts?.in_progress || 0)} />

        <SummaryTile
          delay={120}
          icon="cube-send"
          label={t("ready")}
          toneColor={colors123.success}
          value={String(dashboardStats?.orderCounts?.ready || 0)} />

        <SummaryTile
          delay={160}
          icon="star-four-points-outline"
          label={t("pending")}
          toneColor={colors123.danger}
          value={String(dashboardStats?.orderCounts?.pending || 0)} />

      </ResponsiveGrid>

      <ChartCard
        data={revenueTrendData}
        subtitle={t("revenueTrendSubtitle")}
        title={t("revenueTrend")} />


      {(isTrialActive || isTrialExpired) && (
        <AppCard variant="muted">
          <View style={styles.announcementTopRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.deliveryTitle}>
                {isTrialExpired ? t("subscriptionExpired") : `${t("freeTrial")} · ${t("auto_days_remaining")}: ${trialMeta.remainingDays}`}
              </Text>
              {isTrialActive && <Text style={styles.deliveryMeta}>
                {t("trialEndsOn")} {formatTrialDate(subscription?.trialEndDate || subscription?.endDate)}
              </Text>}
            </View>
            <AppButton label={t("viewPlan")} size="sm" variant="secondary" onPress={() => navigation.navigate("Subscription")} />
          </View>
        </AppCard>
      )}

      <AppCard>
        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionTitle}>{t("upcomingDeliveries")}</Text>
          </View>
          <MaterialCommunityIcons
            color={colors123.textMuted}
            name="calendar-clock-outline"
            size={22} />

        </View>

        <View style={{ gap: spacing.md }}>
          {upcomingOrders.length > 0 ?
          upcomingOrders.map((order, index) =>
          <MotiView
            key={order.id}
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: 12 }}
            transition={{ delay: index * 50, duration: 260, type: "timing" }}
            style={styles.deliveryRow}>

                <View style={styles.deliveryIcon}>
                  <MaterialCommunityIcons
                color={colors123.primary}
                name="hanger"
                size={18} />

                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deliveryTitle}>{order.customerName}</Text>
                  <Text style={styles.deliveryMeta}>
                    {order.item} • {order.fabric || t("customFabric")}
                  </Text>
                </View>
                <View style={styles.deliveryRight}>
                  <Text style={styles.deliveryDate}>
                    {order.deliveryDate ? format(parseISO(order.deliveryDate), "dd MMM") : t("noDate")}
                  </Text>
                  <StatusBadge compact status={order.status} />
                </View>
              </MotiView>
          ) :

          <View style={styles.emptyState}>
              <MaterialCommunityIcons
              color={colors123.textMuted}
              name="check-circle-outline"
              size={40} />

              <Text style={styles.emptyText}>{t("noUpcomingDeliveries")}</Text>
            </View>
          }
        </View>
      </AppCard>
    </ScrollView>);

}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors123.background,
  },
  announcementTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  gridTile: {
    width: "100%",
  },
  productionCard: {
    gap: spacing.sm,
  },
  productionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  productionTile: {
    width: "100%",
    minHeight: 64,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  productionTilePressed: {
    opacity: 0.78,
  },
  productionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  productionValue: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors123.text,
  },
  productionLabel: {
    marginTop: 0,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors123.textMuted,
    lineHeight: 18,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors123.text,
  },
  deliveryMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
  },
  deliveryRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  deliveryDate: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors123.text,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors123.error,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors123.surface,
  },
  alertSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  todayScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  todayCard: {
    width: 116,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  todayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors123.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  todayName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors123.text,
    textAlign: "center",
  },
  todayItem: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors123.textMuted,
  },
  splitSummaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  splitSummaryCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    padding: spacing.md,
  },
  splitSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  splitSummaryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors123.text,
  },
  splitSummaryCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    marginBottom: spacing.xs,
  },
  splitSummaryRevenue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  shopProfileShadow: {
    borderRadius: radius.lg,
    shadowColor: colors123.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0,
    shadowRadius: 24,
    elevation: 0,
  },
  shopProfileCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  shopProfileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  shopProfileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors123.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0,
    shadowRadius: 12,
    elevation: 0,
  },
  shopProfileLogo: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  shopProfileAvatarBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors123.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors123.surface,
  },
  shopProfileInfo: {
    flex: 1,
    minWidth: 0,
  },
  shopProfileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shopProfileEyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    textTransform: "uppercase",
  },
  shopProfileStatusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  shopProfileStatusText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.surface,
  },
  shopProfileName: {
    fontFamily: fonts.extrabold,
    fontSize: 21,
    color: colors123.surface,
    lineHeight: 27,
  },
  shopProfileRole: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: spacing.xs,
  },
  shopProfileDescription: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.76)",
    marginBottom: spacing.md,
  },
  shopProfileMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shopProfileMetaItem: {
    flexGrow: 1,
    flexBasis: "47%",
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  shopProfileMetaText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.surface,
  },
  shopProfileActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  actionButtonPrimary: {
    backgroundColor: colors123.surface,
    borderColor: colors123.surface,
  },
  actionButtonPressed: {
    opacity: 0.82,
  },
  actionButtonText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.surface,
  },
  actionButtonPrimaryText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.primary,
  },
});

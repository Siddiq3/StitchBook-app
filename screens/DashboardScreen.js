import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import Reveal from "../components/Reveal";
import PressableScale from "../components/PressableScale";
import { LinearGradient } from "expo-linear-gradient";
import AppButton from "../components/AppButton";
import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, parseISO } from "date-fns";
import AppCard from "../components/AppCard";
import StatusBadge from "../components/ui/StatusBadge";
import { DashboardSkeleton } from "../components/SkeletonBlock";
import { useLanguage } from "../context/LanguageContext";
import { useStitchPro } from "../context/StitchProContext";
import { orderApi, staffApi } from "../services/api";
import { getAccountStatusText, isAccountInactive } from "../utils/accountStatus";
import { getDeliveryDateKey, getOrderCustomerId, getOrderItemsText, toLocalDateKey } from "../utils/formHelpers";
import {
  colors123,
  radius,
  shadows,
  spacing,
  fonts,
  formatCurrency } from
"../utils/theme";

const formatTrialDate = (value) => {
  if (!value) return "-";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return String(value);
  }
};

const cleanDisplayText = (value, fallback) => {
  const text = String(value || "").trim();
  if (!text || text === "?" || text.toLowerCase() === "undefined" || text.toLowerCase() === "null") {
    return fallback;
  }
  return text;
};

// Staff home: the items assigned to me and what I have earned this month
function MyWorkCard({ t, work, onOpen, onDone }) {
  const assigned = work?.assigned || [];
  const earned = Number(work?.summary?.total_amount || 0);
  return (
    <AppCard style={styles.checklistCard}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t("myWork")}</Text>
        <Text style={styles.sectionSubtitle}>{t("thisMonthPay")}: {formatCurrency(earned)}</Text>
      </View>
      {assigned.length === 0 ?
      <Text style={styles.sectionSubtitle}>{t("noAssignedWork")}</Text> :
      assigned.map((item) =>
      <Pressable
        key={`${item.order_id}-${item.item_type}-${item.task}`}
        accessibilityRole="button"
        onPress={() => onOpen(item.order_id)}
        style={({ pressed }) => [styles.deliveryRow, pressed && styles.productionTilePressed]}>

          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>{item.quantity} × {item.item_type}</Text>
            <Text style={styles.deliveryMeta}>{item.customer_name} · {t(item.task === "cutter" ? "cutting" : "stitching")}</Text>
          </View>
          <View style={styles.deliveryRight}>
            <Text style={styles.deliveryDate}>{item.delivery_date ? format(parseISO(String(item.delivery_date).slice(0, 10)), "dd MMM") : t("noDate")}</Text>
            <AppButton size="sm" variant="ghost" icon="check" label={t("markDone")} onPress={() => onDone(item)} />
          </View>
        </Pressable>
      )}
    </AppCard>);

}

function SetupChecklist({ t, steps }) {
  const doneCount = steps.filter((step) => step.done).length;
  return (
    <AppCard style={styles.checklistCard}>
      <Text style={styles.checklistTitle}>{t("setupChecklistTitle")}</Text>
      <Text style={styles.checklistMeta}>{doneCount} / {steps.length}</Text>
      {steps.map((step) =>
      <Pressable
        key={step.key}
        accessibilityRole="button"
        accessibilityState={{ checked: step.done, disabled: step.done }}
        disabled={step.done}
        onPress={step.onPress}
        style={styles.checklistRow}>

          <MaterialCommunityIcons
          color={step.done ? colors123.success : colors123.textMuted}
          name={step.done ? "check-circle" : "circle-outline"}
          size={22} />

          <Text style={[styles.checklistLabel, step.done && styles.checklistLabelDone]}>{step.label}</Text>
          {!step.done && <MaterialCommunityIcons color={colors123.primary} name="chevron-right" size={22} />}
        </Pressable>
      )}
    </AppCard>);

}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const {
    isBooting,
    orders,
    fetchOrders,
    subscription,
    fetchSubscription,
    user,
    shop,
    customers,
    fetchCustomers,
    can,
    isOwner,
    ordersLoading,
    ordersError
  } = useStitchPro();
  const [myWork, setMyWork] = useState(null);
  const showMyWork = !isOwner && can("work:read");
  const loadMyWork = useCallback(() => {
    if (!showMyWork) return Promise.resolve();
    return staffApi.getMyWork().then((res) => setMyWork(res.data?.data || null)).catch(() => {});
  }, [showMyWork]);
  useEffect(() => {
    loadMyWork();
  }, [loadMyWork]);
  const confirmDone = (item) => {
    Alert.alert(t("markDone"), `${item.quantity} × ${item.item_type} · ${item.customer_name}`, [
    { text: t("cancel"), style: "cancel" },
    { text: t("confirm"), onPress: () => orderApi.markItemDone(item.order_id, item.item_index, item.task).then(loadMyWork).catch(() => Alert.alert(t("markDone"), t("markDoneFailed"))) }]
    );
  };

  useEffect(() => {
    fetchOrders();
    if (can("customers:read")) fetchCustomers?.();
  }, [fetchOrders, fetchCustomers]);

  const customerName = (order) =>
    order.customerName || order.customer_name ||
    customers?.find((customer) => String(customer.id) === String(getOrderCustomerId(order)))?.name || "";

  useEffect(() => {
    if (!subscription) {
      fetchSubscription().catch((err) => {

      });
    }
  }, [fetchSubscription, subscription]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => Promise.all([fetchOrders({ force: true }), loadMyWork()]), [fetchOrders, loadMyWork]);

  const overdueOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    const today = toLocalDateKey();
    return orders.filter(
      (order) => getDeliveryDateKey(order) && getDeliveryDateKey(order) < today && order.status !== "delivered"
    );
  }, [orders]);

  const upcomingOrders = useMemo(
    () => {
      if (!orders || !Array.isArray(orders)) return [];
      return [...orders].
      filter((order) => getDeliveryDateKey(order) && order.status !== "delivered").
      sort((left, right) =>
      getDeliveryDateKey(left).localeCompare(getDeliveryDateKey(right))
      ).
      slice(0, 4);
    },
    [orders]
  );

  const workStats = useMemo(() => {
    const rows = Array.isArray(orders) ? orders : [];
    const count = (fn) => rows.filter(fn).length;
    return {
      cutting: count((order) => order.status === "cutting" || order.status === "in_progress"),
      stitching: count((order) => order.status === "stitching"),
      ready: count((order) => order.status === "ready"),
      pending: count((order) => !order.status || order.status === "pending" || order.status === "new")
    };
  }, [orders]);
  const heroStats = useMemo(() => {
    const today = toLocalDateKey();
    const open = (Array.isArray(orders) ? orders : []).filter((order) => order.status !== "delivered");
    return {
      dueToday: open.filter((order) => getDeliveryDateKey(order) === today).length,
      overdue: overdueOrders.length,
      active: open.length,
    };
  }, [orders, overdueOrders]);
  const isTrialActive = subscription?.status === "trial" && subscription?.isActive;
  const isTrialExpired = isAccountInactive(subscription);
  const shopName = cleanDisplayText(shop?.name, t("yourShop"));
  if (isBooting || (ordersLoading && !orders?.length && !ordersError)) {
    return (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}>

        <DashboardSkeleton />
      </ScrollView>);

  }

  if (ordersError && !orders?.length) {
    return <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}><ScreenHeader title={shopName} /><InlineAlert message={t("loadDashboardFailed")} onRetry={onRefresh} retryLabel={t("retry")} /></ScrollView>;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
      <RefreshControl
        refreshing={ordersLoading}
        onRefresh={onRefresh}
        tintColor={colors123.primary}
        colors={[colors123.primary]} />

      }>

      <Reveal>
        <LinearGradient colors={["#1A8CFF", colors123.primary, "#0057B8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroDate}>{format(new Date(), "EEEE, d MMM")}</Text>
          <Text accessibilityRole="header" numberOfLines={2} style={styles.heroTitle}>{shopName}</Text>
          <View style={styles.heroStats}>
            {[
            { key: "today", label: t("dueToday"), value: heroStats.dueToday },
            { key: "overdue", label: t("overdue"), value: heroStats.overdue },
            { key: "active", label: t("inProgress"), value: heroStats.active }].
            map((stat) =>
            <View key={stat.key} accessible accessibilityLabel={`${stat.label}: ${stat.value}`} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text numberOfLines={2} style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            )}
          </View>
          {can("orders:write") &&
          <PressableScale accessibilityRole="button" onPress={() => navigation.navigate("CustomerSelection")} style={styles.heroButton}>
              <MaterialCommunityIcons name="plus" size={20} color={colors123.primary} />
              <Text style={styles.heroButtonText}>{t("newOrder")}</Text>
            </PressableScale>
          }
        </LinearGradient>
      </Reveal>
      {showMyWork && <Reveal index={1}><MyWorkCard t={t} work={myWork} onOpen={(orderId) => navigation.navigate("OrderDetail", { orderId })} onDone={confirmDone} /></Reveal>}
      {isOwner && (isTrialActive || isTrialExpired) && (
        <AppCard variant="muted">
          <View style={styles.announcementTopRow}>
            <MaterialCommunityIcons
              name={isTrialExpired ? "alert-circle-outline" : "clock-outline"}
              size={22}
              color={isTrialExpired ? colors123.danger : colors123.primary} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.deliveryTitle}>{getAccountStatusText(subscription, t)}</Text>
              <Text style={styles.deliveryMeta}>
                {isTrialExpired ? t("accountInactiveMessage") : `${t("trialEndsOn")} ${formatTrialDate(subscription?.trialEndDate || subscription?.endDate)}`}
              </Text>
            </View>
          </View>
        </AppCard>
      )}
      {isOwner && !ordersLoading && !ordersError && !(orders?.length > 0) &&
      <SetupChecklist
        t={t}
        steps={[
        { key: "shop", label: t("setupShopCreated"), done: true },
        { key: "customer", label: t("setupAddCustomer"), done: customers?.length > 0, onPress: () => navigation.navigate("Customers") },
        { key: "order", label: t("setupCreateOrder"), done: false, onPress: () => navigation.navigate("CustomerSelection") }]
        } />
      }
      {/* Overdue Orders Alert */}
      {overdueOrders.length > 0 &&
      <Reveal index={1}>
          <PressableScale accessibilityRole="button"
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
                {overdueOrders[0] ? customerName(overdueOrders[0]) : ""}
                {overdueOrders.length > 1 ? ` +${overdueOrders.length - 1} more` : ""}
              </Text>
            </View>
            <MaterialCommunityIcons
            color={colors123.surface}
            name="chevron-right"
            size={20} />

          </PressableScale>
        </Reveal>
      }

      <Reveal index={2}>
      <AppCard style={styles.productionCard}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t("workInProgress")}</Text>
          <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={colors123.primary} />
        </View>
        <ResponsiveGrid minItemWidth={140} style={styles.productionGrid}>
          {[
          { key: "new", label: t("pending"), value: workStats.pending, icon: "clipboard-text-outline", color: colors123.info, status: "pending" },
          { key: "cutting", label: t("cutting"), value: workStats.cutting, icon: "content-cut", color: colors123.warning, status: "cutting" },
          { key: "stitching", label: t("stitching"), value: workStats.stitching, icon: "needle", color: colors123.primary, status: "stitching" },
          { key: "ready", label: t("readyForPickupTile"), value: workStats.ready, icon: "cube-send", color: colors123.success, status: "ready" }].
          map((item) =>
          <PressableScale accessibilityRole="button"
            accessibilityLabel={`${item.label}: ${item.value}`}
            key={item.key}
            onPress={() => navigation.navigate("Orders", { status: item.status })}
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
            </PressableScale>
          )}
        </ResponsiveGrid>
      </AppCard>
      </Reveal>

      {can("dashboard:read") &&
      <Reveal index={3}>
      <PressableScale accessibilityRole="button"
        onPress={() => navigation.navigate("Reports")}
        style={({ pressed }) => [styles.reportsRow, pressed && styles.productionTilePressed]}>

        <View style={styles.reportsIcon}>
          <MaterialCommunityIcons name="chart-box-outline" size={22} color={colors123.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{t("viewReports")}</Text>
          <Text style={styles.sectionSubtitle}>{t("viewReportsSubtitle")}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors123.textMuted} />
      </PressableScale>
      </Reveal>
      }

      <Reveal index={4}>
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
          <PressableScale
            key={order.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
            style={({ pressed }) => [styles.deliveryRow, pressed && styles.productionTilePressed]}>

                <View style={styles.deliveryIcon}>
                  <MaterialCommunityIcons
                color={colors123.primary}
                name="hanger"
                size={18} />

                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deliveryTitle}>{customerName(order)}</Text>
                  <Text style={styles.deliveryMeta}>{getOrderItemsText(order)}</Text>
                </View>
                <View style={styles.deliveryRight}>
                  <Text style={styles.deliveryDate}>
                    {getDeliveryDateKey(order) ? format(parseISO(getDeliveryDateKey(order)), "dd MMM") : t("noDate")}
                  </Text>
                  <StatusBadge compact status={order.status} />
                </View>
              </PressableScale>
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
      </Reveal>
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
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: "hidden",
    ...shadows.floating,
    shadowColor: colors123.primary,
    shadowOpacity: 0.3,
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -90,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroDate: { fontFamily: fonts.medium, fontSize: 13, color: "rgba(255,255,255,0.8)" },
  heroTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: colors123.surface },
  heroStats: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  heroStat: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  heroStatValue: { fontFamily: fonts.bold, fontSize: 22, color: colors123.surface },
  heroStatLabel: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.85)" },
  heroButton: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors123.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  heroButtonText: { fontFamily: fonts.semibold, fontSize: 15, color: colors123.primary },
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
  reportsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderSubtle,
    backgroundColor: colors123.surface,
    ...shadows.card,
  },
  reportsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistCard: { gap: spacing.xs },
  checklistTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors123.text },
  checklistMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors123.textMuted },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44 },
  checklistLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors123.text },
  checklistLabelDone: { color: colors123.textMuted, textDecorationLine: "line-through" },
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
});

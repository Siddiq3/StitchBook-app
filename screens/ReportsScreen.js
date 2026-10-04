import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { format, parseISO } from "date-fns";
import SegmentedControl from "../components/SegmentedControl";
import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import ChartCard from "../components/ChartCard";
import StatCard from "../components/ui/StatCard";
import { useLanguage } from "../context/LanguageContext";
import { useStitchPro } from "../context/StitchProContext";
import { colors123, spacing, formatCurrency } from "../utils/theme";

// Period-based business numbers, kept off the home screen so home stays about today's work.
export default function ReportsScreen() {
  const { t } = useLanguage();
  const { dashboardStats, dashboardLoading, dashboardError, fetchDashboardStats, staff, fetchStaff, subscription } = useStitchPro();
  const [period, setPeriod] = useState("month");
  const [orderType, setOrderType] = useState(null);

  const reportLevel = dashboardStats?.reportLevel || subscription?.features?.reportLevel || "basic";
  const reportPeriods =
    dashboardStats?.reportPeriods ||
    subscription?.features?.reportPeriods ||
    (reportLevel === "advanced"
      ? ["today", "week", "month", "year"]
      : reportLevel === "full"
        ? ["week", "month", "year"]
        : ["month"]);
  const canFilterOrderType = Boolean(
    dashboardStats?.reportOrderTypeFilter ?? subscription?.features?.reportOrderTypeFilter
  );
  const hasFullReports = reportLevel === "full" || reportLevel === "advanced";

  useEffect(() => {
    if (!reportPeriods.includes(period)) {
      setPeriod(reportPeriods[0] || "month");
      return;
    }
    fetchDashboardStats(period, canFilterOrderType ? orderType : null);
  }, [fetchDashboardStats, period, orderType, canFilterOrderType, reportPeriods.join("|")]);

  useEffect(() => {
    if (!canFilterOrderType && orderType !== null) setOrderType(null);
  }, [canFilterOrderType, orderType]);

  useEffect(() => {
    if (hasFullReports) fetchStaff?.();
  }, [fetchStaff, hasFullReports]);

  const onRefresh = useCallback(
    () => fetchDashboardStats(period, canFilterOrderType ? orderType : null),
    [fetchDashboardStats, period, orderType, canFilterOrderType]
  );

  const revenueTrendData = useMemo(() => {
    const rows = dashboardStats?.weeklyRevenue;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const rawDate = row.date || row.label;
      let label = rawDate ? String(rawDate).slice(0, 10) : "";
      try {
        if (rawDate) label = format(parseISO(String(rawDate)), period === "year" ? "MMM" : "dd MMM");
      } catch {}
      return { label, value: Number(row.revenue ?? row.totalRevenue ?? row.value ?? 0) };
    }).filter((point) => point.label);
  }, [dashboardStats?.weeklyRevenue, period]);

  const staffEarnings = (Array.isArray(staff) ? staff : []).reduce(
    (sum, member) => sum + Number(member.current_month_earnings || member.total_earnings || 0),
    0
  );
  const value = (n) => (dashboardStats ? String(n || 0) : "—");
  const money = (n) => (dashboardStats ? formatCurrency(n || 0) : "—");

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={onRefresh} tintColor={colors123.primary} colors={[colors123.primary]} />}>

      {reportPeriods.length > 1 &&
      <SegmentedControl options={reportPeriods.map((v) => ({ value: v, label: t(v) }))} value={period} onChange={setPeriod} />}
      {canFilterOrderType &&
      <SegmentedControl options={[{ value: null, label: t("all") }, { value: "stitching", label: t("stitching") }, { value: "alteration", label: t("alteration") }]} value={orderType} onChange={setOrderType} disabled={dashboardLoading} />}
      <InlineAlert message={dashboardError ? t("loadDashboardFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />

      <ResponsiveGrid minItemWidth={140}>
        <StatCard icon="cash-check" label={t("paymentsReceived")} color={colors123.success} value={money(dashboardStats?.paymentsReceived)} />
        <StatCard icon="timer-sand" label={t("toCollect")} color={colors123.warning} value={money(dashboardStats?.outstandingBalance)} />
        <StatCard icon="clipboard-plus-outline" label={t("ordersBooked")} color={colors123.primary} value={value(dashboardStats?.ordersBooked)} />
        <StatCard icon="tag-outline" label={t("bookedValue")} color={colors123.info} value={money(dashboardStats?.bookedValue)} />
        {hasFullReports &&
        <StatCard icon="account-plus-outline" label={t("newCustomers")} color={colors123.accent} value={value(dashboardStats?.newCustomers)} />}
        {hasFullReports &&
        <StatCard icon="account-cash-outline" label={t("staffEarningsMonth")} color={colors123.textSecondary} value={formatCurrency(staffEarnings)} />}
      </ResponsiveGrid>

      {hasFullReports &&
      <ChartCard data={revenueTrendData} subtitle={t("paymentsTrendSubtitle")} title={t("paymentsReceived")} />}
    </ScrollView>);

}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors123.background,
  },
});

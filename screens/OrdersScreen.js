import { useSafeAreaInsets } from "react-native-safe-area-context";
import SegmentedControl from "../components/SegmentedControl";
import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View } from
"react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, isValid, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppButton from "../components/AppButton";
import { getOrderCustomerId, getOrderItemsText, getOrderSearchText } from "../utils/formHelpers";
import AppCard from "../components/AppCard";
import EmptyState from "../components/EmptyState";
import IconInput from "../components/IconInput";
import ScreenHeader from "../components/ScreenHeader";
import { ListSkeleton } from "../components/SkeletonBlock";
import StatusBadge from "../components/ui/StatusBadge";

import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import {
  colors123,
  radius,
  shadows,
  spacing,
  fonts,
  formatCurrency,
  getOrderAmounts } from
"../utils/theme";

// API status values (lowercase)
const statusOptions = ["pending", "cutting", "stitching", "ready", "delivered"];

const safeParseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && isValid(value)) return value;
  try {
    const parsed = parseISO(String(value));
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const allFilters = ["All", ...statusOptions];

const getOrderQuantity = (order) => {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0);
  }
  return Number(order.quantity || order.qty || 1);
};

export default function OrdersScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { ordersError, ordersLoading } = useStitchPro();
  const { customerId, status: routeStatus } = route?.params || {};
  const { orders, customers, isBooting, addOrder, fetchOrders, fetchCustomers, can } =
  useStitchPro();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(routeStatus || "All");

  // Home screen tiles open Orders already filtered
  useEffect(() => {
    if (routeStatus) setActiveFilter(routeStatus);
  }, [routeStatus]);
  const [refreshing, setRefreshing] = useState(false);
  const statusLabels = useMemo(() => ({
    pending: t("pending"),
    cutting: t("cutting"),
    stitching: t("stitching") || "Stitching",
    in_progress: t("cutting"),
    ready: t("ready"),
    delivered: t("delivered")
  }), [t]);

  // Fetch orders and customers on mount
  useEffect(() => {
    fetchOrders();
    if (can("customers:read")) fetchCustomers();
  }, [fetchOrders, fetchCustomers]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders({ force: true }), can("customers:read") ? fetchCustomers({ force: true }) : null]);
    setRefreshing(false);
  }, [fetchOrders, fetchCustomers]);

  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    const query = searchQuery.trim().toLowerCase();

    // Create a map of customers by ID for quick lookup
    const customersMap = {};
    if (Array.isArray(customers)) {
      customers.forEach((customer) => {
        customersMap[customer.id] = customer.name;
      });
    }

    return orders.filter((order) => {
      // Filter by customer if customerId is provided
      if (customerId && String(getOrderCustomerId(order)) !== String(customerId)) {
        return false;
      }

      const matchesFilter =
      activeFilter === "All" ||
      order.status === activeFilter ||
      activeFilter === "cutting" && order.status === "in_progress";
      const matchesQuery =
      !query ||
      (order.customerName || "").toLowerCase().includes(query) ||
      (customersMap[getOrderCustomerId(order)] || "").toLowerCase().includes(query) ||
      getOrderSearchText(order).includes(query);

      return matchesFilter && matchesQuery;
    }).map((order) => {
      const resolvedName = order.customerName || order.customer_name || customersMap[getOrderCustomerId(order)] || 'Unknown Customer';
      return {
        ...order,
        customerName: resolvedName
      };
    });
  }, [activeFilter, customerId, orders, searchQuery, customers]);


  const handleAddOrderPress = () => {
    if (!customers || customers.length === 0) {
      Alert.alert(
        t("noCustomersTitle"),
        t("noCustomersForOrder"),
        [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("goToCustomers"),
          onPress: () => {

            navigation.navigate("Customers");
          } }]

      );
      return;
    }
    // Navigate to CustomerSelection screen first
    navigation.navigate("CustomerSelection");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

        <ScreenHeader
          title={t("ordersTitle")}
          action={can("orders:write") &&
          <AppButton
            icon="plus"
            label={t("add")}
            onPress={handleAddOrderPress}
            style={styles.addButton} />

} />


        <View style={styles.miniStats}>
          <AppCard style={styles.miniStatCard} variant="muted">
            <Text style={styles.miniStatLabel}>{t("inQueue")}</Text>
            <Text style={styles.miniStatValue}>{(orders || []).filter((o) => !["ready", "delivered", "cancelled"].includes(o.status)).length}</Text>
          </AppCard>
          <AppCard style={styles.miniStatCard} variant="muted">
            <Text style={styles.miniStatLabel}>{t("pickupReady")}</Text>
            <Text style={styles.miniStatValue}>{(orders || []).filter((o) => o.status === "ready").length}</Text>
          </AppCard>
          <AppCard style={styles.miniStatCard} variant="muted">
            <Text style={styles.miniStatLabel}>{t("delivered")}</Text>
            <Text style={styles.miniStatValue}>{(orders || []).filter((o) => o.status === "delivered").length}</Text>
          </AppCard>
        </View>

        <IconInput
          icon="magnify"
          onChangeText={setSearchQuery}
          placeholder={t("searchOrdersPlaceholder")}
          value={searchQuery} />


        <SegmentedControl options={allFilters.map(filter => ({ value: filter, label: filter === "All" ? t("all") : statusLabels[filter] || filter }))} value={activeFilter} onChange={setActiveFilter} />

<InlineAlert message={ordersError ? t("loadOrdersFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
        {ordersLoading && !orders.length ?
        <ListSkeleton /> :
        filteredOrders.length === 0 && ordersError ? null :
        filteredOrders.length === 0 ?
        <EmptyState
          description={t("noOrdersMatchDescription")}
          icon="clipboard-search-outline"
          title={t("noOrdersMatch")} /> :

        <View style={styles.list}>
            {filteredOrders.map((order, index) => {
            const deliveryDateValue = order.deliveryDate || order.delivery_date;
            const deliveryDateObj = safeParseDate(deliveryDateValue);
            const itemText = getOrderItemsText(order);
            const quantity = getOrderQuantity(order);
            const { total, paid, balance, paymentStatus } = getOrderAmounts(order);
            const deliveryText = deliveryDateObj ?
            format(deliveryDateObj, "dd MMM yyyy") :
            deliveryDateValue ?
            t("invalidDate") :
            t("noDate");

            return (
              <MotiView
                key={order.id}
                animate={{ opacity: 1, translateY: 0 }}
                from={{ opacity: 0, translateY: 8 }}
                transition={{
                  delay: index * 35,
                  duration: 220,
                  type: "timing"
                }}>

                  <Pressable accessibilityRole="button"
                  onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
                  style={({ pressed }) => [styles.orderCardWrapper, pressed && { opacity: 0.7 }]}>

                    <AppCard style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.customerLine}>
                          <View style={styles.customerAvatar}>
                            <Text style={styles.customerAvatarText}>
                              {String(order.customerName || "?").slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.orderCustomer} numberOfLines={1}>
                              {order.customerName}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.orderTitleRow}>
                          <Text style={styles.orderTitle}>{itemText}</Text>
                          <Text style={styles.quantityText}>Qty {quantity}</Text>
                        {order.orderType ?
                          <View style={[
                          styles.orderTypeBadge,
                          order.orderType === "stitching" ?
                          styles.orderTypeStitching :
                          styles.orderTypeAlteration]
                          }>
                            <Text style={styles.orderTypeText}>
                              {order.orderType === "stitching" ? t("stitching") : t("alteration")}
                            </Text>
                          </View> :
                          null}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
                        <StatusBadge status={order.status} />
                        <StatusBadge compact status={paymentStatus} />
                        <Text style={styles.orderAmount}>
                          {formatCurrency(total)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.amountPanel}>
                      <View style={styles.amountInfo}>
                        <Text style={styles.amountLabel}>{t("paid")}</Text>
                        <Text style={styles.amountValue}>{formatCurrency(paid)}</Text>
                      </View>
                      <View style={styles.amountDivider} />
                      <View style={styles.amountInfo}>
                        <Text style={styles.amountLabel}>{t("balance")}</Text>
                        <Text style={[styles.amountValue, balance > 0 && styles.balanceDueText]}>
                          {formatCurrency(balance)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deliveryRow}>
                        <MaterialCommunityIcons
                          color={colors123.textMuted}
                          name="calendar-clock-outline"
                          size={15} />

                      <Text style={styles.deliveryText}>Delivery: {deliveryText}</Text>
                    </View>

                  </AppCard>
                  </Pressable>
                </MotiView>);

          })}
          </View>
        }
      </ScrollView>
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
  addButton: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  miniStats: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
  },
  miniStatCard: {
    flex: 1,
    minHeight: 56,
    justifyContent: "center",
    borderWidth: 0,
    borderColor: colors123.borderLight,
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  miniStatLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  miniStatValue: {
    marginTop: 3,
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors123.text,
  },
  list: {
    gap: 0,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  orderCard: {
    gap: spacing.xs,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    borderRadius: 0,
    backgroundColor: colors123.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
    paddingVertical: spacing.sm,
  },
  orderHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  customerLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  customerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  customerAvatarText: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors123.primary,
  },
  orderTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  orderTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors123.textMuted,
  },
  quantityText: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.textSecondary,
  },
  orderCustomer: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  orderAmount: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors123.primary,
  },
  amountPanel: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    borderWidth: 0,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  amountInfo: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 6,
  },
  amountLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  amountValue: {
    marginTop: 0,
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.text,
    lineHeight: 20,
  },
  balanceDueText: {
    color: colors123.warning,
  },
  amountDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors123.borderLight,
    marginHorizontal: spacing.sm,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deliveryText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  orderTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 0,
  },
  orderTypeText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "none",
  },
  orderTypeStitching: {
    backgroundColor: colors123.primary + "15",
    borderColor: colors123.primary,
  },
  orderTypeAlteration: {
    backgroundColor: colors123.secondary + "15",
    borderColor: colors123.secondary,
  },
  cardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors123.borderLight,
    gap: spacing.xs,
  },
  openDetailsRow: {
    marginTop: spacing.xs,
    minHeight: 36,
    borderRadius: radius.sm,
    backgroundColor: colors123.primarySoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openDetailsText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.primary,
  },
});

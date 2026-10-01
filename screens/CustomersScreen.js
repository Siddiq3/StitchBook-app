import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import AvatarBadge from "../components/AvatarBadge";
import CustomerFormSheet from "../components/CustomerFormSheet";
import EmptyState from "../components/EmptyState";
import IconInput from "../components/IconInput";
import ScreenHeader from "../components/ScreenHeader";
import { ListSkeleton } from "../components/SkeletonBlock";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { colors123, radius, shadows, spacing, fonts } from "../utils/theme";

export default function CustomersScreen({ navigation }) {
  const { t } = useLanguage();
  const { customersError } = useStitchPro();
  const { customers, orders, isBooting, customersLoading, addCustomer, fetchCustomers, deleteCustomer, fetchOrders } = useStitchPro();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customers and orders on mount
  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, [fetchCustomers, fetchOrders]);

  // Auto-refresh when screen comes into focus (user navigates back)
  useFocusEffect(
    useCallback(() => {

      fetchCustomers();
      fetchOrders();
    }, [fetchCustomers, fetchOrders])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {

    await Promise.all([fetchCustomers(), fetchOrders()]);
  }, [fetchCustomers, fetchOrders]);

  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];

    // Create a map of order counts by customerId
    const orderCountMap = {};
    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        // Check both camelCase and snake_case field names
        const cid = order.customerId || order.customer_id;
        if (cid) {
          orderCountMap[cid] = (orderCountMap[cid] || 0) + 1;
        }
      });
    }

    // Enhance customers with orderCount
    const customersWithOrderCount = customers.map((customer) => ({
      ...customer,
      orderCount: orderCountMap[customer.id] || 0
    }));

    const query = debouncedQuery.trim().toLowerCase();
    if (!query) {
      return customersWithOrderCount;
    }
    return customersWithOrderCount.filter(
      (customer) =>
      customer.name && customer.name.toLowerCase().includes(query) ||
      customer.phone && customer.phone.includes(query) ||
      customer.address && customer.address.toLowerCase().includes(query)
    );
  }, [customers, debouncedQuery, orders]);

  const showSubscriptionRequiredAlert = useCallback(() => {
    Alert.alert(
      t("trialExpired"),
      t("trialExpiredMessage"),
      [
      { text: t("notNow"), style: "cancel" },
      {
        text: t("viewStatus"),
        onPress: () => navigation.navigate("Subscription")
      }]

    );
  }, [navigation, t]);

  const handleCreateCustomer = async (form) => {
    try {
      await addCustomer(form);
      setShowCreateSheet(false);
      showToast(`${form.name} ${t("customerAddedSuffix")}`);
      return true;
    } catch (err) {
      if (err.code === 'SUBSCRIPTION_REQUIRED') {
        setShowCreateSheet(false);
        showSubscriptionRequiredAlert();
        return false;
      }

      const message = err.message === 'DUPLICATE_PHONE' ?
      t("duplicatePhone") :
      t("customerCreateFailed");
      showToast(message, 'error');
      return false;
    }
  };

  const handleDeleteCustomer = useCallback((customer) => {
    Alert.alert(
      t("deleteCustomer"),
      `${t("deleteCustomerMessagePrefix")} ${customer.name}? ${t("deleteCustomerMessageSuffix")}`,
      [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCustomer(customer.id);
            showToast(`${customer.name} ${t("customerRemovedSuffix")}`);
          } catch (err) {
            showToast(t("customerDeleteFailed"), 'error');
          }
        }
      }]

    );
  }, [deleteCustomer, showToast, t]);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
          refreshing={customersLoading}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

        <ScreenHeader
          eyebrow={t("clientBook")}
          title={t("customersTitle")}
          subtitle={t("customersSubtitle")}
          action={
          <AppButton
            icon="account-plus-outline"
            label={t("add")}
            onPress={() => setShowCreateSheet(true)}
            style={styles.addButton} />

          } />


        <AppCard style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialCommunityIcons
              color={colors123.primary}
              name="account-star-outline"
              size={20} />

          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>
              {customers?.length || 0} {t("totalClientsInBook")}
            </Text>
            <Text style={styles.insightSubtitle}>
              {t("customerInsightSubtitle")}
            </Text>
          </View>
        </AppCard>

        <IconInput
          icon="magnify"
          onChangeText={setSearchQuery}
          placeholder={t("searchCustomersPlaceholder")}
          value={searchQuery} />


<InlineAlert message={customersError ? t("loadCustomersFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
        {customersLoading && !customers.length ?
        <ListSkeleton /> :
        filteredCustomers.length === 0 && customersError ? null :
        filteredCustomers.length === 0 ?
        <EmptyState
          description={searchQuery ? t("noCustomerMatchesDescription") : t("noCustomersYetDescription")}
          icon={searchQuery ? "account-search-outline" : "account-plus-outline"}
          title={searchQuery ? t("noCustomerMatches") : t("noCustomersYet")} /> :

        <View style={styles.list}>
            {filteredCustomers.map((customer, index) =>
          <MotiView
            key={customer.id}
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: 10 }}
            transition={{
              delay: index * 40,
              duration: 260,
              type: "timing"
            }}>

                <Pressable
              onPress={() =>
              navigation.navigate("CustomerDetail", {
                customerId: customer.id
              })
              }
              accessibilityRole="button"
              accessibilityLabel={`${customer.name}, ${customer.phone}`}
              onLongPress={() => handleDeleteCustomer(customer)}
              style={({ pressed }) => [
              styles.customerCard,
              pressed && styles.pressedCard]
              }>

                  <AvatarBadge initials={customer.avatar} name={customer.name} />
                  <View style={styles.customerBody}>
                    <View style={styles.customerTitleRow}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                        {customer.gender &&
                    <View style={[styles.genderBadge, { backgroundColor: colors123.surfaceMuted }]}>
                            <Text style={[styles.genderBadgeText, { color: colors123.textSecondary }]}>
                              {customer.gender === 'male' ? 'M' : 'F'}
                            </Text>
                          </View>
                    }
                        {customer.tier &&
                    <View style={styles.tierPill}>
                            <Text style={styles.tierLabel}>{customer.tier}</Text>
                          </View>
                    }
                      </View>
                    </View>
                    <Text style={styles.customerMeta}>{customer.phone}</Text>
                    {customer.address &&
                <Text style={styles.customerMeta} numberOfLines={1}>
                        {customer.address}
                      </Text>
                }
                    <View style={styles.customerFooter}>
                      <Text style={styles.footerText}>
                        {customer.orderCount || 0} {t("orders")}
                      </Text>
                      {customer.createdAt &&
                  <Text style={styles.footerText}>
                          {t("joined")} {format(parseISO(customer.createdAt), "dd MMM yyyy")}
                        </Text>
                  }
                    </View>
                  </View>
                  <MaterialCommunityIcons
                color={colors123.textSoft}
                name="chevron-right"
                size={22} />

                </Pressable>
              </MotiView>
          )}
          </View>
        }
      </ScrollView>

      <CustomerFormSheet
        onClose={() => setShowCreateSheet(false)}
        onSubmit={handleCreateCustomer}
        visible={showCreateSheet} />

    </>);

}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors123.background,
  },
  addButton: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  insightCard: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: colors123.primaryLight,
    borderColor: colors123.primaryLight,
  },
  insightIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
  },
  insightTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors123.text,
  },
  insightSubtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  list: {
    gap: spacing.sm,
  },
  customerCard: {
    backgroundColor: colors123.surface,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderColor: colors123.borderLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  pressedCard: {
    opacity: 0.88,
  },
  customerBody: {
    flex: 1,
  },
  customerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  customerName: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  genderBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  genderBadgeText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  tierPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors123.surfaceMuted,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  tierLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primaryDark,
  },
  customerMeta: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textSecondary,
  },
  customerFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textSoft,
  },
});

import { useSafeAreaInsets } from "react-native-safe-area-context";
import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
import { showAccountInactiveAlert } from "../utils/accountStatus";
import { formatPhone } from "../utils/formHelpers";
import { useLanguage } from "../context/LanguageContext";
import { colors123, radius, shadows, spacing, fonts } from "../utils/theme";

export default function CustomersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { customersError } = useStitchPro();
  const { customers, orders, isBooting, customersLoading, customersPagination, addCustomer, fetchCustomers, deleteCustomer, fetchOrders } = useStitchPro();
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

  // Search the server so customers beyond the first loaded page are findable
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (query.length >= 2) fetchCustomers({ search: query });
    else if (!query) fetchCustomers();
  }, [debouncedQuery, fetchCustomers]);

  // Auto-refresh when screen comes into focus (user navigates back)
  useFocusEffect(
    useCallback(() => {

      fetchCustomers();
      fetchOrders();
    }, [fetchCustomers, fetchOrders])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {

    await Promise.all([fetchCustomers({ force: true }), fetchOrders({ force: true })]);
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


  const handleCreateCustomer = async (form) => {
    try {
      await addCustomer(form);
      setShowCreateSheet(false);
      showToast(`${form.name} ${t("customerAddedSuffix")}`);
      return true;
    } catch (err) {
      if (err.code === 'SUBSCRIPTION_REQUIRED') {
        setShowCreateSheet(false);
        showAccountInactiveAlert(t);
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
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
          refreshing={customersLoading}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

        <ScreenHeader
          title={t("customersTitle")}
          action={
          <AppButton
            icon="account-plus-outline"
            label={t("add")}
            onPress={() => setShowCreateSheet(true)}
            style={styles.addButton} />

          } />


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
          title={searchQuery ? t("noCustomerMatches") : t("noCustomersYet")}
          action={searchQuery ? null : <AppButton icon="account-plus" label={t("addCustomerTitle")} onPress={() => setShowCreateSheet(true)} />} /> :

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
                    <Text style={styles.customerMeta}>{formatPhone(customer.phone)}</Text>
                    <View style={styles.customerFooter}>
                      <Text style={styles.footerText}>
                        {customer.orderCount || 0} {t("orders")}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                color={colors123.textSoft}
                name="chevron-right"
                size={22} />

                </Pressable>
              </MotiView>
          )}
          {!searchQuery && customersPagination?.total > customers.length &&
          <Text style={styles.moreHint}>
            {t("showingCustomersOf").replace("{shown}", customers.length).replace("{total}", customersPagination.total)}
          </Text>
          }
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
  moreHint: { textAlign: "center", paddingVertical: spacing.md, fontFamily: fonts.regular, fontSize: 13, color: colors123.textMuted },
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
  insightCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    gap: 0,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.card,
  },
  customerCard: {
    backgroundColor: colors123.surface,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: colors123.borderSubtle,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
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
    marginTop: 6,
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

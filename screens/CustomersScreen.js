import usePagedList from '../hooks/usePagedList';
import PagedListFooter from '../components/PagedListFooter';
import { customerApi } from '../services/api';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InlineAlert from "../components/InlineAlert";
import React, { useEffect, useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl, Alert } from "react-native";
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
  const { isBooting, addCustomer, deleteCustomer } = useStitchPro();
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

  const customerList = usePagedList(customerApi.getAll, 'customers', {search:debouncedQuery.trim()});
  const {items:customers,loading:customersLoading,error:customersError} = customerList;
  const onRefresh = customerList.reload;
  const {can} = useStitchPro();

  const filteredCustomers = customers;

  const handleCreateCustomer = async (form) => {
    try {
      await addCustomer(form);
      await customerList.reload();
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
      err.response?.data?.message || err.message || t("customerCreateFailed");
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
            await customerList.reload();
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
          action={can("customers:write") &&
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
          action={searchQuery || !can("customers:write") ? null : <AppButton icon="account-plus" label={t("addCustomerTitle")} onPress={() => setShowCreateSheet(true)} />} /> :

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
              onLongPress={can("customers:write") ? () => handleDeleteCustomer(customer) : undefined}
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
          </View>
        }
      <PagedListFooter list={customerList} />
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
  },
  customerCard: {
    backgroundColor: colors123.surface,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
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


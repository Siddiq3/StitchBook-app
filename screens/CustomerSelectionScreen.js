import usePagedList from '../hooks/usePagedList';
import PagedListFooter from '../components/PagedListFooter';
import { customerApi } from '../services/api';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ListRow from "../components/ListRow";
import IconInput from "../components/IconInput";
import InlineAlert from "../components/InlineAlert";
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStitchPro } from "../context/StitchProContext";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";
import AvatarCircle from "../components/AvatarCircle";
import { formatPhone } from "../utils/formHelpers";
import CustomerFormSheet from "../components/CustomerFormSheet";
import { useToast } from "../context/ToastContext";
import { showAccountInactiveAlert } from "../utils/accountStatus";

/**
 * CustomerSelectionScreen
 *
 * Displays list of customers to select from.
 * Used by Orders Tab → Create Order flow.
 *
 * Navigation:
 * - On customer select → Navigate to CreateOrder with customerId
 */import { useLanguage } from "../context/LanguageContext";
export default function CustomerSelectionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const { addCustomer, can } = useStitchPro();
  const { showToast } = useToast();
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // Walk-in customer: create them here and go straight on to the order
  const handleNewCustomer = async (form) => {
    try {
      const created = await addCustomer(form);
      setShowNewCustomer(false);
      if (created?.id) navigation.navigate("CreateOrder", { customerId: created.id });
      return true;
    } catch (err) {
      if (err.code === "SUBSCRIPTION_REQUIRED") {
        setShowNewCustomer(false);
        showAccountInactiveAlert(t);
        return false;
      }
      showToast(err.message === "DUPLICATE_PHONE" ? t("duplicatePhone") : err.response?.data?.message || err.message || t("customerCreateFailed"), "error");
      return false;
    }
  };
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [debouncedSearch,setDebouncedSearch] = useState('');
  useEffect(() => {const timer=setTimeout(()=>setDebouncedSearch(customerSearch.trim()),300);return ()=>clearTimeout(timer);},[customerSearch]);
  const customerList = usePagedList(customerApi.getAll,'customers',{search:debouncedSearch});
  const filteredCustomers = customerList.items;
  const customersError = customerList.error;
  const onRefresh = customerList.reload;

  const handleSelectCustomer = (customer) => {
    // Navigate to CreateOrder with customerId
    navigation.navigate("CreateOrder", { customerId: customer.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

          <Ionicons name="chevron-back" size={28} color={colors123.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("auto_select_customer")}</Text>
        {can("customers:write") && (<TouchableOpacity accessibilityRole="button" accessibilityLabel={t("addCustomerTitle")}
          onPress={() => setShowNewCustomer(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

          <Ionicons name="person-add-outline" size={24} color={colors123.primary} />
        </TouchableOpacity>)}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentScroll}
        refreshControl={
        <RefreshControl
          refreshing={customerList.loading}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

<InlineAlert message={customersError ? t("loadCustomersFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
        {/* Search */}
        <IconInput icon="magnify" placeholder={t("auto_search_customers")} value={customerSearch} onChangeText={setCustomerSearch} />

        {/* Loading State */}
        {customerList.loading && !filteredCustomers.length ?
        <ActivityIndicator
          size="large"
          color={colors123.primary}
          style={{ marginTop: 40 }} /> :

        filteredCustomers.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors123.border} />
            <Text style={styles.emptyText}>{t("auto_no_customers_found")}</Text>
            <Text style={styles.emptySubtext}>{t("auto_add_a_customer_first")}</Text>
            {can("customers:write") && (<TouchableOpacity accessibilityRole="button" onPress={() => setShowNewCustomer(true)} style={{ marginTop: spacing.md }}>
              <Text style={{ color: colors123.primary, fontFamily: fonts.semibold, fontSize: 15 }}>+ {t("addCustomerTitle")}</Text>
            </TouchableOpacity>)}
          </View>) : (

        /* Customers List - Optimized with FlatList */
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) =>
          <ListRow leading={<AvatarCircle name={item.name} size={44} />} title={item.name} meta={formatPhone(item.phone)} onPress={() => handleSelectCustomer(item)} trailing={<Ionicons name="chevron-forward" size={20} color={colors123.textMuted} />} />
          }
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10} />)

        }
      <PagedListFooter list={customerList} />
      </ScrollView>
      <CustomerFormSheet visible={showNewCustomer} onClose={() => setShowNewCustomer(false)} onSubmit={handleNewCustomer} />
    </View>);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors123.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors123.textMuted,
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
  },
});


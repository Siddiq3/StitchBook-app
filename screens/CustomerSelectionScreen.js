import ListRow from "../components/ListRow";
import IconInput from "../components/IconInput";
import InlineAlert from "../components/InlineAlert";
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStitchPro } from "../context/StitchProContext";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";
import AvatarCircle from "../components/AvatarCircle";

/**
 * CustomerSelectionScreen
 *
 * Displays list of customers to select from.
 * Used by Orders Tab → Create Order flow.
 *
 * Navigation:
 * - On customer select → Navigate to CreateOrder with customerId
 */import { useLanguage } from "../context/LanguageContext";
export default function CustomerSelectionScreen({ navigation }) {const { t } = useLanguage();
  const { customersError } = useStitchPro();
  const { customers, fetchCustomers } = useStitchPro();
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Load customers on mount (once only)
  useEffect(() => {
    const loadInitial = async () => {
      setLoadingCustomers(true);
      try {
        await fetchCustomers({ search: "", page: 1, limit: 100 });
      } catch (err) {

      } finally {
        setLoadingCustomers(false);
      }
    };
    loadInitial();
  }, []); // Empty deps - runs once on mount

  // Debounced search effect
  useEffect(() => {
    if (customerSearch.length === 0) return; // Don't search on empty string (initial state)

    const timer = setTimeout(() => {
      if (customerSearch.length >= 2) {
        setLoadingCustomers(true);
        fetchCustomers({ search: customerSearch, page: 1, limit: 100 }).
        catch((err) => {}).
        finally(() => setLoadingCustomers(false));
      }
    }, 400); // debounce 400ms for search only
    return () => clearTimeout(timer);
  }, [customerSearch, fetchCustomers]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCustomers({ search: customerSearch, page: 1, limit: 100 });
    } catch (err) {

    } finally {
      setRefreshing(false);
    }
  }, [customerSearch, fetchCustomers]);

  const filteredCustomers =
  customerSearch.length > 0 ?
  customers.filter((c) =>
  c.name.toLowerCase().includes(customerSearch.toLowerCase())
  ) :
  customers;

  const handleSelectCustomer = (customer) => {
    // Navigate to CreateOrder with customerId
    navigation.navigate("CreateOrder", { customerId: customer.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

          <Ionicons name="chevron-back" size={28} color={colors123.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("auto_select_customer")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentScroll}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors123.primary}
          colors={[colors123.primary]} />

        }>

<InlineAlert message={customersError ? t("loadCustomersFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
        {/* Search */}
        <IconInput icon="magnify" placeholder={t("auto_search_customers")} value={customerSearch} onChangeText={setCustomerSearch} />

        {/* Loading State */}
        {loadingCustomers ?
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
          </View>) : (

        /* Customers List - Optimized with FlatList */
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) =>
          <ListRow leading={<AvatarCircle name={item.name} size={44} />} title={item.name} meta={item.phone} onPress={() => handleSelectCustomer(item)} trailing={<Ionicons name="chevron-forward" size={20} color={colors123.textMuted} />} />
          }
          getItemLayout={(data, index) => ({
            length: 84,
            offset: 84 * index,
            index
          })}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10} />)

        }
      </ScrollView>
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

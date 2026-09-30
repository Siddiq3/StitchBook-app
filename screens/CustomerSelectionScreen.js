import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl } from
"react-native";
import { Ionicons } from "@expo/vector-icons";
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
        <TouchableOpacity
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
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors123.textSoft}
            style={styles.searchIcon} />
          
          <TextInput
            style={styles.searchInput}
            placeholder={t("auto_search_customers")}
            placeholderTextColor={colors123.textSoft}
            value={customerSearch}
            onChangeText={setCustomerSearch} />
          
        </View>

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
          <TouchableOpacity
            style={styles.customerCard}
            onPress={() => handleSelectCustomer(item)}>
            
                <AvatarCircle name={item.name} size={48} />
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerPhone}>{item.phone}</Text>
                </View>
                <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: colors123.secondary + "20",
                borderRadius: radius.sm
              }}>
              
                  <Text
                style={{
                  color: colors123.secondary,
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "capitalize"
                }}>
                
                    {item.gender}
                  </Text>
                </View>
                <Ionicons
              name="chevron-forward"
              size={20}
              color={colors123.border} />
            
              </TouchableOpacity>
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
    backgroundColor: colors123.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors123.text
  },
  content: {
    flex: 1
  },
  contentScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...shadows.soft
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors123.text,
    fontFamily: fonts.regular
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    ...shadows.card
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors123.text,
    marginBottom: 4
  },
  customerPhone: {
    fontSize: 14,
    color: colors123.textSoft,
    fontFamily: fonts.regular
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors123.text,
    marginTop: spacing.md
  },
  emptySubtext: {
    fontSize: 14,
    color: colors123.textSoft,
    marginTop: spacing.sm,
    fontFamily: fonts.regular
  }
});

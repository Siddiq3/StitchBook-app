import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { MotiView } from "../components/AccessibleMotionView";
import AppButton from "../components/AppButton";

import AvatarBadge from "../components/AvatarBadge";
import MeasurementFieldThumb from "../components/MeasurementFieldThumb";
import MeasurementSheet from "../components/MeasurementSheet";
import StatusBadge from "../components/StatusBadge";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";

import { measurementApi } from "../services/api";
import { colors123, fonts, formatCurrency, radius, shadows, spacing } from "../utils/theme";import { useLanguage } from "../context/LanguageContext";

export default function CustomerDetailScreen({ navigation, route }) {const { t } = useLanguage();
  const { customerId } = route.params || {};
  const { customers, measurements, orders, addOrder, addMeasurement, updateMeasurement, deleteMeasurement, fetchMeasurements, fetchOrders, fetchCustomers, measurementsLoading, ordersLoading } =
  useStitchPro();
  const { showToast } = useToast();
  const [showMeasurementSheet, setShowMeasurementSheet] = useState(false);
  const [measurementSheetMode, setMeasurementSheetMode] = useState("add");
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [expandedMeasurements, setExpandedMeasurements] = useState([]);
  const [customerMeasurements, setCustomerMeasurements] = useState([]);
  const [measurementListLoading, setMeasurementListLoading] = useState(false);
  const [measurementListError, setMeasurementListError] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);

  const normalizeOutfitType = (value) => {
    if (!value) return "";
    const normalized = String(value).toLowerCase().trim();
    const map = {
      pants: "pant",
      "women-pants": "pant",
      trouser: "pant",
      "kurta-pajama": "kurta",
      "mens-suit": "blazer",
      "men's suit": "blazer",
      suit: "blazer",
      "waist-coat": "waistcoat",
      saree: "saree_blouse",
      "saree blouse": "saree_blouse",
      "saree-blouse": "saree_blouse",
      "ladies-suit": "salwar",
      "ladies suit": "salwar",
      churidar: "salwar"
    };
    return map[normalized] || normalized;
  };

  const getMeasurementBodyType = (measurement) => {
    const type = normalizeOutfitType(measurement?.outfitType || measurement?.outfit_type);
    if (["pant", "dhoti", "dupatta"].includes(type)) return "lower";
    if (["salwar", "lehenga", "anarkali", "gown", "kurta"].includes(type)) return "full";
    return "upper";
  };

  const loadMeasurementList = async (id) => {
    if (!id) return;
    setMeasurementListLoading(true);
    setMeasurementListError(false);
    try {
      const res = await measurementApi.getByCustomer(id);
      setCustomerMeasurements(res.data?.data?.measurements || res.data?.data || []);
    } catch (error) {

      setMeasurementListError(true);
    } finally {
      setMeasurementListLoading(false);
    }
  };

  // Fetch customer data on mount
  useEffect(() => {
    async function loadCustomerData() {
      setIsLoadingCustomer(true);
      try {
        await Promise.all([
        fetchCustomers(),
        fetchMeasurements(customerId),
        fetchOrders(),
        loadMeasurementList(customerId)]
        );
      } catch (error) {

      } finally {
        setIsLoadingCustomer(false);
      }
    }
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId, fetchCustomers, fetchMeasurements, fetchOrders]);

  const customer = useMemo(
    () => customers && customers.find((entry) => entry.id === customerId),
    [customerId, customers]
  );
  const customerOrders = useMemo(
    () => {
      if (!orders || !Array.isArray(orders)) return [];
      return orders.filter((entry) => entry.customerId === customerId);
    },
    [customerId, orders]
  );
  const sortedMeasurements = useMemo(() => {
    if (!Array.isArray(customerMeasurements)) return [];
    return [...customerMeasurements].sort((left, right) => {
      const leftDate = new Date(left.createdAt || left.created_at || left.updatedAt || left.updated_at);
      const rightDate = new Date(right.createdAt || right.created_at || right.updatedAt || right.updated_at);
      return rightDate - leftDate;
    });
  }, [customerMeasurements]);

  if (isLoadingCustomer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors123.primary} />
        <Text style={styles.loadingText}>{t("auto_loading_customer")}</Text>
      </View>);

  }

  if (!customer) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md }}>
        <MaterialCommunityIcons name="account-alert-outline" size={48} color={colors123.border} style={{ marginBottom: spacing.md }} />
        <Text style={{ fontSize: 16, fontFamily: fonts.semibold, color: colors123.text, textAlign: 'center' }}>{t("auto_customer_not_found")}

        </Text>
        <AppButton
          label={t("auto_back_to_customers")}
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }} />

      </View>);

  }

  const handleCreateOrderPress = () => {
    navigation.navigate("CreateOrder", { customerId: customer.id });
  };

  const openAddMeasurementSheet = () => {
    setSelectedMeasurement(null);
    setMeasurementSheetMode("add");
    setShowMeasurementSheet(true);
  };

  const openEditMeasurementSheet = (measurement) => {
    setSelectedMeasurement({
      ...measurement,
      ...measurement.measurementsData,
      outfitType: measurement.outfitType || measurement.outfit_type,
      outfitLabel: measurement.outfitLabel || measurement.outfit_label
    });
    setMeasurementSheetMode("edit");
    setShowMeasurementSheet(true);
  };

  const handleDeleteMeasurement = (measurement) => {
    Alert.alert(t("auto_delete_this_measurement"), t("auto_this_profile_will_be_removed_permanently"),

    [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await deleteMeasurement(measurement.id, customerId);
          await loadMeasurementList(customerId);
          showToast(t("auto_measurement_deleted"));
        } catch (error) {
          showToast(t("auto_failed_to_delete_measurement"), "error");
        }
      }
    }]

    );
  };

  const handleMeasurementSheetSubmit = async (form) => {
    let cleanedForm = { ...form };
    if (measurementSheetMode === "edit" && selectedMeasurement) {
      try {
        await updateMeasurement(selectedMeasurement.id, customerId, {
          outfitType: cleanedForm.outfitType || cleanedForm.outfit_type || selectedMeasurement.outfitType || selectedMeasurement.outfit_type,
          outfitLabel: cleanedForm.outfitLabel || cleanedForm.outfit_label || selectedMeasurement.outfitLabel || selectedMeasurement.outfit_label,
          measurementsData: cleanedForm
        });
        showToast(t("auto_measurement_updated"));
      } catch (error) {
        showToast(t("auto_failed_to_update_measurement"), "error");
      }
    } else {
      try {
        const outfitType = cleanedForm.outfitType || "Shirt";
        const outfitLabel = cleanedForm.outfitLabel || `${outfitType} - ${format(new Date(), "dd MMM yyyy")}`;
        await addMeasurement({
          customerId: customer.id,
          outfitType,
          outfitLabel,
          measurementsData: cleanedForm
        });
        showToast(t("auto_measurement_saved"));
      } catch (error) {
        showToast(t("auto_failed_to_save_measurement"), "error");
      }
    }
    setShowMeasurementSheet(false);
    setSelectedMeasurement(null);
    await loadMeasurementList(customerId);
  };

  const toggleMeasurementExpand = (id) => {
    setExpandedMeasurements((current) =>
    current.includes(id) ?
    current.filter((item) => item !== id) :
    [...current, id]
    );
  };

  return (
    <>
      {isLoadingCustomer ?
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors123.primary} />
        </View> :
      !customer ?
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md }}>
          <MaterialCommunityIcons name="account-alert-outline" size={48} color={colors123.border} style={{ marginBottom: spacing.md }} />
          <Text style={{ fontSize: 16, fontFamily: fonts.semibold, color: colors123.text, textAlign: 'center' }}>{t("auto_customer_not_found")}

        </Text>
          <AppButton
          label={t("auto_back_to_customers")}
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }} />

        </View> :

      <>
          <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <Pressable accessibilityRole="button" accessibilityLabel={t("back")} onPress={navigation.goBack} style={styles.backButton}>
                <MaterialCommunityIcons color={colors123.text} name="chevron-left" size={24} />
              </Pressable>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{customer?.name || 'Unknown'}</Text>
                <Text style={styles.headerSubtitle}>{customer?.phone || 'No phone'}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={handleCreateOrderPress} style={styles.createOrderButton}>
                <MaterialCommunityIcons color={colors123.surface} name="plus" size={22} />
              </Pressable>
            </View>

            {/* Customer Info Card */}
            <View style={styles.customerCard}>
              <View style={styles.customerCardHeader}>
                <AvatarBadge
                initials={customer?.avatar}
                name={customer?.name}
                size={48} />

                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer?.name || 'Unknown'}</Text>
                  <Text style={styles.customerPhone}>{customer?.phone || 'No phone'}</Text>
                  {customer?.email && <Text style={styles.customerEmail}>{customer?.email}</Text>}
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{customerOrders.length}</Text>
                  <Text style={styles.statLabel}>{t("auto_orders")}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{customerOrders.filter((order) => order.status !== "delivered").length}</Text>
                  <Text style={styles.statLabel}>{t("auto_active")}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(customerOrders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0))}</Text>
                  <Text style={styles.statLabel}>{t("auto_revenue")}</Text>
                </View>
              </View>
            </View>

            {/* Action Cards */}
            <View style={styles.actionCardsRow}>
              <Pressable accessibilityRole="button"
              onPress={() => navigation.navigate('ViewMeasurements', { customerId: customer.id, customerName: customer.name, customerGender: customer.gender || 'male' })}
              style={styles.actionCard}>

                <View style={styles.actionCardIcon}>
                  <MaterialCommunityIcons color={colors123.primary} name="ruler" size={20} />
                </View>
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>{t("auto_measurements_2")}</Text>
                </View>
                <MaterialCommunityIcons color={colors123.textMuted} name="chevron-right" size={20} />
              </Pressable>

              <Pressable accessibilityRole="button"
              onPress={() => navigation.navigate('Orders', { customerId: customer.id })}
              style={styles.actionCard}>

                <View style={styles.actionCardIcon}>
                  <MaterialCommunityIcons color={colors123.primary} name="clipboard-list-outline" size={20} />
                </View>
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>{t("auto_orders")}</Text>
                </View>
                <MaterialCommunityIcons color={colors123.textMuted} name="chevron-right" size={20} />
              </Pressable>
            </View>

            {/* Measurements Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{t("auto_measurements_2")}</Text>
                  <Text style={styles.sectionSubtitle}>{t("auto_keep_a_history_of_fit_profiles")}</Text>
                </View>
              </View>

              <InlineAlert message={measurementListError ? t("loadMeasurementsFailed") : null} onRetry={() => loadMeasurementList(customerId)} retryLabel={t("retry")} />
              {measurementListLoading ?
            <View style={styles.loadingSection}>
                  <ActivityIndicator size="large" color={colors123.primary} />
                </View> :
            measurementListError && sortedMeasurements.length === 0 ? null :
            sortedMeasurements.length === 0 ?
            <View style={styles.emptyStateCard}>
                  <MaterialCommunityIcons color={colors123.border} name="ruler" size={32} />
                  <Text style={styles.emptyStateTitle}>{t("auto_no_measurements_saved")}</Text>
                  <Text style={styles.emptyStateText}>{t("auto_add_measurements_to_speed_up_order_creation")}</Text>
                  <Pressable accessibilityRole="button"
                onPress={openAddMeasurementSheet}
                style={styles.emptyStateButton}>

                    <Text style={styles.emptyStateButtonText}>{t("auto_add_first_measurement")}</Text>
                  </Pressable>
                </View> :

            <View style={styles.measurementsList}>
                  {sortedMeasurements.map((measurement) => {
                const data = measurement.measurementsData || measurement.measurements_data || {};
                const entries = Object.entries(data);
                const createdAt = measurement.createdAt || measurement.created_at || measurement.updatedAt || measurement.updated_at;
                const isExpanded = expandedMeasurements.includes(measurement.id);
                const visibleEntries = isExpanded ? entries : entries.slice(0, 4);

                return (
                  <View key={measurement.id} style={styles.measurementCard}>
                        <View style={styles.measurementCardHeader}>
                          <View style={styles.measurementInfo}>
                            <Text style={styles.measurementCardTitle}>
                              {measurement.outfitLabel || measurement.outfit_label || measurement.outfitType || measurement.outfit_type || `Profile #${measurement.id}`}
                            </Text>
                            <Text style={styles.measurementCardSubtitle}>
                              {createdAt ? format(parseISO(createdAt), "dd MMM yyyy") : "Date unknown"}
                            </Text>
                          </View>
                          <View style={styles.measurementCardActions}>
                            <Pressable accessibilityRole="button" onPress={() => openEditMeasurementSheet(measurement)} style={styles.iconButton}>
                              <MaterialCommunityIcons name="pencil" size={18} color={colors123.primary} />
                            </Pressable>
                            <Pressable accessibilityRole="button" onPress={() => handleDeleteMeasurement(measurement)} style={styles.iconButton}>
                              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors123.danger} />
                            </Pressable>
                          </View>
                        </View>
                        <ResponsiveGrid style={styles.measurementGrid}>
                          {visibleEntries.map(([key, value]) =>
                      <View key={key} style={styles.measurementGridItem}>
                              <MeasurementFieldThumb
                          bodyType={getMeasurementBodyType(measurement)}
                          label={key}
                          size={40} />

                              <View style={styles.measurementGridCopy}>
                                <Text style={styles.measurementGridLabel}>{key}</Text>
                                <Text style={styles.measurementGridValue}>
                                  {typeof value === "number" ? `${value}"` : value}
                                </Text>
                              </View>
                            </View>
                      )}
                        </ResponsiveGrid>
                        {entries.length > 0 &&
                    <Pressable accessibilityRole="button" onPress={() => toggleMeasurementExpand(measurement.id)} style={styles.viewMoreButton}>
                            <Text style={styles.viewMoreLink}>
                              {isExpanded ? "Show less" : `Show all ${entries.length}`}
                            </Text>
                            <MaterialCommunityIcons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors123.primary} />

                          </Pressable>
                    }
                      </View>);

              })}
                </View>
            }
            </View>

            {/* Orders Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{t("auto_order_timeline")}</Text>
                  <Text style={styles.sectionSubtitle}>{t("auto_every_garment_status_and_due_date")}</Text>
                </View>
              </View>

              {customerOrders.length === 0 ?
            <View style={styles.emptyStateCard}>
                  <MaterialCommunityIcons color={colors123.border} name="clipboard-outline" size={32} />
                  <Text style={styles.emptyStateTitle}>{t("auto_no_orders_yet")}</Text>
                  <Text style={styles.emptyStateText}>{t("auto_create_the_first_order_for_this_customer")}</Text>
                  <Pressable accessibilityRole="button"
                onPress={handleCreateOrderPress}
                style={styles.emptyStateButton}>

                    <Text style={styles.emptyStateButtonText}>{t("auto_create_order")}</Text>
                  </Pressable>
                </View> :

            <View style={styles.ordersList}>
                  {customerOrders.map((order, index) =>
              <MotiView
                key={order.id}
                animate={{ opacity: 1, translateY: 0 }}
                from={{ opacity: 0, translateY: 10 }}
                transition={{
                  delay: index * 40,
                  duration: 240,
                  type: "timing"
                }}>

                      <Pressable accessibilityRole="button"
                  onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
                  style={styles.orderCard}>

                        <View style={styles.orderCardHeader}>
                          <View style={styles.orderCardInfo}>
                            <Text style={styles.orderCardTitle}>{order.item}</Text>
                            <Text style={styles.orderCardMeta}>
                              {order.fabric} • {order.color}
                            </Text>
                          </View>
                          <View style={styles.orderCardActions}>
                            <StatusBadge compact status={order.status} />
                            <Text style={styles.orderCardAmount}>
                              {formatCurrency(order.totalAmount || order.amount || 0)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.orderCardDue}>{t("auto_due")}
                    {format(parseISO(order.deliveryDate || order.delivery_date), "dd MMM yyyy")}
                        </Text>
                        {order.notes ?
                  <Text style={styles.orderCardNotes}>{order.notes}</Text> :
                  null}
                      </Pressable>
                    </MotiView>
              )}
                </View>
            }
            </View>

          </ScrollView>

          <MeasurementSheet
          customer={customer}
          initialValues={selectedMeasurement || {}}
          onClose={() => {
            setShowMeasurementSheet(false);
            setSelectedMeasurement(null);
          }}
          onSubmit={handleMeasurementSheetSubmit}
          visible={showMeasurementSheet} />

        </>
      }
    </>);

}
const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: 112,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors123.text,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    marginTop: 2,
  },
  createOrderButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors123.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Customer Info Card
  customerCard: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  customerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  customerPhone: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    marginTop: 2,
  },
  customerEmail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors123.border,
  },

  // Action Cards
  actionCardsRow: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  actionCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors123.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors123.text,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors123.text,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    ...shadows.soft,
  },
  emptyStateTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyStateButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.primary,
    borderRadius: radius.md,
  },
  emptyStateButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors123.surface,
  },

  loadingSection: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  // Measurements
  measurementsList: {
    gap: spacing.md,
  },
  measurementCard: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    ...shadows.card,
  },
  measurementCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementCardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors123.text,
  },
  measurementCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  measurementCardActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  measurementGridItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors123.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.xs,
    minHeight: 64,
  },
  measurementGridCopy: {
    flex: 1,
    minWidth: 0,
  },
  measurementGridLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  measurementGridValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors123.text,
    marginTop: spacing.xs,
  },
  viewMoreButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  viewMoreLink: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors123.primary,
  },
  iconButton: {
    padding: spacing.xs,
  },

  // Orders
  ordersList: {
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    padding: spacing.md,
    ...shadows.card,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  orderCardInfo: {
    flex: 1,
  },
  orderCardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors123.text,
  },
  orderCardMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  orderCardActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  orderCardAmount: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors123.primary,
  },
  orderCardDue: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.textMuted,
    marginBottom: spacing.sm,
  },
  orderCardNotes: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors123.text,
    lineHeight: 20,
    marginTop: spacing.sm,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors123.background,
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors123.textMuted,
  },
});

import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList, TextInput, ActivityIndicator, Platform, Alert } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { getOutfitsByGender } from "../services/outfitTypes";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";
import AvatarCircle from "../components/AvatarCircle";
import AppButton from "../components/AppButton";
import MeasurementPickerModal from "../components/MeasurementPickerModal";
import CreateItemDetail from "./CreateItemDetail";

export default function CreateOrder({ navigation, route }) {
  const { t } = useLanguage();
  const { customersError } = useStitchPro();
  const { addOrder, customers, fetchCustomers } = useStitchPro();
  const { showToast } = useToast();

  // Get customerId from route params (if coming from CustomerDetail or CustomerSelection)
  const routeCustomerId = route?.params?.customerId;

  // Start at step 1 (customer selection) or step 2 (outfit type) if customerId is provided
  const initialStep = routeCustomerId ? 2 : 1;

  // ========== STATE MACHINE: Single source of truth is `currentStep` (1-5) ==========
  const [currentStep, setCurrentStep] = useState(initialStep); // 1-5 - Controls entire UI flow
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Step 1: Customer Selection
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");

  // Steps 2-4: Item configuration loop
  const [currentOutfitType, setCurrentOutfitType] = useState(null);
  const [tempItem, setTempItem] = useState(null); // Persists from step 3 → step 4
  const [currentItemMeasurement, setCurrentItemMeasurement] = useState(null);

  // Step 5: Review all items
  const [selectedItems, setSelectedItems] = useState([]); // Array of complete items with measurements
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ); // Default: 7 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState("normal"); // normal or high
  const [notes, setNotes] = useState("");

  // If customerId provided, find and select that customer immediately
  useEffect(() => {
    if (routeCustomerId && customers.length > 0) {
      const customer = customers.find((c) => c.id === routeCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [routeCustomerId, customers]);

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

  const filteredCustomers =
  customerSearch.length > 0 ?
  customers.filter((c) =>
  c.name.toLowerCase().includes(customerSearch.toLowerCase())
  ) :
  customers;

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCurrentStep(2); // → Step 2: Outfit Type Selection
  };

  const handleSelectOutfit = (outfit) => {
    // User selected outfit → prepare for item details
    setCurrentOutfitType(outfit);
    setTempItem(null); // Reset tempItem
    setCurrentStep(3); // → Step 3: Item Details Configuration
  };

  const handleItemDetailSave = (item) => {
    if (item?.measurementSnapshot) {
      const completeItem = {
        ...item,
        measurementLabel: item.measurementLabel || item.measurementSnapshot.outfitLabel,
        measurementData: item.measurementData || item.measurementSnapshot.measurementsData
      };
      setSelectedItems((current) => [...current, completeItem]);
      setTempItem(null);
      setCurrentOutfitType(null);
      setCurrentItemMeasurement(null);
      showToast(t("itemAddedWithProfile"), "success");
      setCurrentStep(2);
      return;
    }

    // Item details saved → move directly to step 4 (measurements)
    // CRITICAL: tempItem must persist through step 4
    setTempItem(item);
    setCurrentStep(4); // → Step 4: Measurements Selection
  };

  const handleItemDetailCancel = () => {
    // Cancel item details → back to outfit selection
    setCurrentOutfitType(null);
    setTempItem(null);
    setCurrentStep(2); // → Back to Step 2
  };

  const handleMeasurementSelected = (measurement) => {
    if (!tempItem) {
      showToast(t("itemDataLost"), "error");
      return;
    }

    const normalizedMeasurement = {
      id: measurement.id,
      outfitLabel: measurement.outfitLabel || measurement.outfit_label,
      outfitType: measurement.outfitType || measurement.outfit_type,
      measurementsData: measurement.measurementsData || measurement.measurements_data || {}
    };

    const completeItem = {
      ...tempItem,
      measurement_id: normalizedMeasurement.id,
      measurementLabel: normalizedMeasurement.outfitLabel,
      measurementData: normalizedMeasurement.measurementsData,
      measurementSnapshot: normalizedMeasurement
    };

    setSelectedItems((current) => [...current, completeItem]);
    setTempItem(null);
    setCurrentOutfitType(null);
    setCurrentItemMeasurement(normalizedMeasurement);
    showToast(t("itemAddedWithMeasurement"), "success");

    setCurrentStep(2);
  };
  const handleSkipMeasurements = () => {
    // Skip measurements → add item without measurement
    if (!tempItem) {
      showToast(t("itemDataLost"), "error");
      return;
    }

    setSelectedItems([...selectedItems, tempItem]);
    setTempItem(null);
    setCurrentOutfitType(null);
    setCurrentItemMeasurement(null);
    showToast(t("itemAddedWithoutMeasurement"), "success");

    // → Back to Step 2: Allow user to add more items
    setCurrentStep(2);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeliveryDate(selectedDate);
    }
  };

  const resetForm = () => {
    setCurrentStep(routeCustomerId ? 2 : 1);
    setSelectedCustomer(routeCustomerId ? customers.find((c) => c.id === routeCustomerId) || null : null);
    setCustomerSearch("");
    setCurrentOutfitType(null);
    setTempItem(null);
    setCurrentItemMeasurement(null);
    setSelectedItems([]);
    setDeliveryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setPriority("normal");
    setNotes("");
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      showToast(t("selectCustomerError"), "error");
      return;
    }

    if (selectedItems.length === 0) {
      showToast(t("addOneItemError"), "error");
      return;
    }

    const measurementSnapshots = selectedItems.
    filter((item) => item.measurementSnapshot).
    map((item) => item.measurementSnapshot);

    const requiresMeasurement = selectedItems.some(
      (item) => item.itemType === 'stitching' || item.type_category === 'stitching'
    );

    if (requiresMeasurement && measurementSnapshots.length === 0) {
      showToast(t("attachMeasurementError"), "error");
      return;
    }

    setLoading(true);
    try {
      await addOrder({
        customerId: selectedCustomer.id,
        items: selectedItems.map((item) => ({
          type: item.type || item.typeLabel,
          fabric: item.fabric,
          quantity: Number(item.quantity),
          price: Number(item.price),
          measurement_id: item.measurement_id || null,
          measurementLabel: item.measurementLabel || null,
          measurementData: item.measurementData || null,
          measurementSnapshot: item.measurementSnapshot || null
        })),
        deliveryDate: deliveryDate.toISOString().split("T")[0],
        description: notes || '',
        measurement_snapshot: {
          profiles: measurementSnapshots,
          itemCount: selectedItems.length,
          createdAt: new Date().toISOString()
        }
      });

      showToast(t("orderCreatedSuccess"), "success");
      resetForm();
      navigation.navigate("StudioTabs", { screen: "Orders" });
    } catch (err) {
      if (err.code === "SUBSCRIPTION_REQUIRED") {
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
        return;
      }

      showToast(err.message || t("orderCreateFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ========== STEP 3: ITEM DETAIL CONFIGURATION ==========
  if (currentStep === 3 && currentOutfitType && selectedCustomer) {
    return (
      <CreateItemDetail
        navigation={navigation}
        outfitType={currentOutfitType}
        customerId={selectedCustomer.id}
        onSave={handleItemDetailSave}
        onCancel={handleItemDetailCancel} />);

  }

  // ========== STEP 1: CUSTOMER SELECTION ==========
  if (currentStep === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) =>
          <View
            key={dot}
            style={[
            styles.progressDot,
            dot <= currentStep && styles.progressDotActive]
            } />

          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentScroll}>

          <Text style={styles.stepTitle}>{t("selectCustomer")}</Text>
          <Text style={styles.stepSubtitle}>{t("whoOrderFor")}</Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors123.textSoft}
              style={styles.searchIcon} />

            <TextInput accessibilityLabel={t("searchCustomers")}
              style={styles.searchInput}
              placeholder={t("searchCustomers")}
              placeholderTextColor={colors123.textSoft}
              value={customerSearch}
              onChangeText={setCustomerSearch} />

          </View>

<InlineAlert message={customersError ? t("loadCustomersFailed") : null} onRetry={fetchCustomers} retryLabel={t("retry")} />
          {loadingCustomers ?
          <ActivityIndicator
            size="large"
            color={colors123.primary}
            style={{ marginTop: 40 }} /> :

          filteredCustomers.length === 0 ?
          <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors123.border} />
              <Text style={styles.emptyText}>{t("noCustomersFound")}</Text>
              <Text style={styles.emptySubtext}>{t("addCustomerFirst")}</Text>
            </View> :

          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) =>
            <TouchableOpacity accessibilityRole="button"
              style={styles.customerCard}
              onPress={() => handleSelectCustomer(item)}>

                  <AvatarCircle name={item.name} size={48} />
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerPhone}>{item.phone}</Text>
                  </View>
                  <View style={styles.genderPill}>
                    <Text style={styles.genderPillText}>
                      {item.gender}
                    </Text>
                  </View>
                  <Ionicons
                name="chevron-forward"
                size={20}
                color={colors123.border} />

                </TouchableOpacity>
            } />

          }
        </ScrollView>
      </View>);

  }

  // ========== STEP 2: OUTFIT TYPE SELECTION ==========
  if (currentStep === 2) {
    const availableOutfits = selectedCustomer ?
    getOutfitsByGender(selectedCustomer.gender) :
    [];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setCurrentStep(1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) =>
          <View
            key={dot}
            style={[
            styles.progressDot,
            dot <= currentStep && styles.progressDotActive]
            } />

          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}>

          <Text style={styles.stepTitle}>{t("selectOutfitType")}</Text>
          <Text style={styles.stepSubtitle}>
            {t("outfitTypePrompt")}
          </Text>

          {/* Customer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{t("customer")}</Text>
            <View style={styles.customerSummary}>
              <AvatarCircle name={selectedCustomer?.name} size={56} />
              <View style={styles.customerSummaryInfo}>
                <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
                <Text style={styles.customerPhone}>{selectedCustomer?.phone}</Text>
              </View>
            </View>
          </View>

          {/* Items Already Added */}
          {selectedItems.length > 0 &&
          <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>{t("itemsAdded")} ({selectedItems.length})</Text>
              {selectedItems.map((item, index) =>
            <View key={index} style={styles.itemCard}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemType}>{item.typeLabel}</Text>
                    <Text style={styles.itemFabric}>{item.fabric}</Text>
                    <Text style={styles.itemPrice}>
                      {item.quantity}x ₹{item.price} = ₹{item.quantity * item.price}
                    </Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button"
                onPress={() => handleRemoveItem(index)}
                style={styles.removeButton}>

                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
            )}
              <AppButton
              label={t("continueToReview")}
              onPress={() => setCurrentStep(5)}
              style={{ marginTop: spacing.md }} />

            </View>
          }

          {/* Outfit Selection Grid */}
          <ResponsiveGrid style={styles.outfitsGrid}>
            {availableOutfits.map((outfit) => {
              const isSelected = currentOutfitType?.id === outfit.id;
              return (
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(isSelected) }}
                  key={outfit.id}
                  style={[
                  styles.outfitCard,
                  isSelected && styles.outfitCardSelected]
                  }
                  onPress={() => handleSelectOutfit(outfit)}>

                  {isSelected &&
                  <View style={styles.outfitCheckmark}>
                      <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors123.surface} />

                    </View>
                  }
                  <View
                    style={[
                    styles.outfitIconContainer,
                    isSelected && styles.outfitIconContainerSelected]
                    }>

                    <Ionicons
                      name={
                      outfit.category === "alteration" ?
                      "construct-outline" :
                      "shirt-outline"
                      }
                      size={30}
                      color={isSelected ? colors123.surface : colors123.primary} />

                  </View>
                  <Text
                    style={[
                    styles.outfitLabel,
                    isSelected && styles.outfitLabelSelected]
                    }>

                    {outfit.label}
                  </Text>
                </TouchableOpacity>);

            })}
          </ResponsiveGrid>
        </ScrollView>
      </View>);

  }

  // ========== STEP 4: MEASUREMENTS FOR CURRENT ITEM ==========
  if (currentStep === 4) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setCurrentStep(2)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) =>
          <View
            key={dot}
            style={[
            styles.progressDot,
            dot <= currentStep && styles.progressDotActive]
            } />

          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}>

          <Text style={styles.stepTitle}>{t("measurementProfile")}</Text>
          <Text style={styles.stepSubtitle}>
            {t("selectOrCreateMeasurementProfile")} {tempItem?.typeLabel}
          </Text>

          {tempItem &&
          <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>{t("itemDetails")}</Text>
              <Text style={styles.itemType}>{tempItem.typeLabel}</Text>
              <Text style={styles.itemFabric}>{tempItem.fabric}</Text>
              <Text style={styles.itemPrice}>
                {tempItem.quantity}x ₹{tempItem.price}
              </Text>
            </View>
          }

          <AppButton
            label={t("chooseMeasurementProfile")}
            onPress={() => {

              // Modal will show automatically via visible prop
            }} />

          <TouchableOpacity accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={handleSkipMeasurements}>

            <Text style={styles.secondaryButtonText}>
              {t("continueWithoutMeasurements")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Always visible modal for step 4 */}
        <MeasurementPickerModal
          visible={currentStep === 4}
          customerId={selectedCustomer?.id}
          selectedMeasurementId={currentItemMeasurement?.id}
          outfitType={currentOutfitType}
          onClose={() => setCurrentStep(2)}
          onSelect={handleMeasurementSelected}
          onSkip={handleSkipMeasurements} />

      </View>);

  }

  // ========== STEP 5: REVIEW & SUBMIT ==========
  if (currentStep === 5) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setCurrentStep(2)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("reviewOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((dot) =>
          <View
            key={dot}
            style={[
            styles.progressDot,
            dot <= currentStep && styles.progressDotActive]
            } />

          )}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll}>
          {/* Customer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{t("customer")}</Text>
            <View style={styles.customerSummary}>
              <AvatarCircle name={selectedCustomer.name} size={56} />
              <View style={styles.customerSummaryInfo}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerPhone}>
                  {selectedCustomer.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Items Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{t("items")} ({selectedItems.length})</Text>
            {selectedItems.map((item, index) =>
            <View key={index} style={styles.itemSummary}>
                <View>
                  <Text style={styles.itemType}>{item.typeLabel}</Text>
                  <Text style={styles.itemFabric}>{item.fabric}</Text>
                  {item.measurementLabel &&
                <Text style={styles.measurementMeta}>{item.measurementLabel}</Text>
                }
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.itemPrice}>
                    {item.quantity}x ₹{item.price}
                  </Text>
                  <Text style={styles.itemTotal}>
                    ₹{item.quantity * item.price}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("totalAmount")}</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>

          {/* Delivery Details */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{t("deliveryDetails")}</Text>
            <TouchableOpacity accessibilityRole="button"
              onPress={() => setShowDatePicker(true)}
              style={styles.deliveryRow}>

              <Ionicons name="calendar-outline" size={20} color={colors123.primary} />
              <Text style={styles.deliveryDate}>
                {deliveryDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </Text>
            </TouchableOpacity>

            <View style={styles.priorityRow}>
              <Text style={styles.label}>{t("priority")}</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(priority === "normal") }}
                  style={[
                  styles.priorityButton,
                  priority === "normal" && styles.priorityButtonActive]
                  }
                  onPress={() => setPriority("normal")}>

                  <Text
                    style={[
                    styles.priorityButtonText,
                    priority === "normal" && styles.priorityButtonTextActive]
                    }>

                    {t("normal")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(priority === "high") }}
                  style={[
                  styles.priorityButton,
                  priority === "high" && styles.priorityButtonActive]
                  }
                  onPress={() => setPriority("high")}>

                  <Text
                    style={[
                    styles.priorityButtonText,
                    priority === "high" && styles.priorityButtonTextActive]
                    }>

                    {t("high")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.notesContainer}>
              <Text style={styles.label}>{t("notesOptional")}</Text>
              <TextInput accessibilityLabel={t("addSpecialInstructions")}
                style={styles.notesInput}
                placeholder={t("addSpecialInstructions")}
                placeholderTextColor={colors123.textSoft}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3} />

            </View>
          </View>

          {/* Date Picker */}
          {showDatePicker &&
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={new Date()} />

          }

          {/* Action Buttons */}
          <AppButton
            label={t("createOrder")}
            onPress={handleSubmitOrder}
            loading={loading}
            disabled={loading} />


          <TouchableOpacity accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={() => setCurrentStep(2)}
            disabled={loading}>

            <Text style={styles.secondaryButtonText}>{t("editItems")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>);

  }
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.background,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.extrabold,
    color: colors123.text,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: 6,
    backgroundColor: colors123.background,
  },
  progressDot: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors123.borderLight,
  },
  progressDotActive: {
    backgroundColor: colors123.primary,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.sm,
    backgroundColor: colors123.surface,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors123.text,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fonts.sm.fontSize,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  customerPhone: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  genderPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors123.surfaceMuted,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  genderPillText: {
    color: colors123.textSecondary,
    fontSize: 12,
    fontFamily: fonts.extrabold,
    textTransform: "capitalize",
  },
  outfitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: "space-between",
  },
  outfitCard: {
    width: "100%",
    minHeight: 118,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    ...shadows.card,
  },
  outfitCardSelected: {
    backgroundColor: colors123.primarySoft,
    borderColor: colors123.primary,
  },
  outfitCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors123.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  outfitIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors123.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  outfitIconContainerSelected: {
    backgroundColor: colors123.primary,
  },
  outfitLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    textAlign: "center",
  },
  outfitLabelSelected: {
    color: colors123.primaryDark,
  },
  itemsSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  itemDetails: {
    flex: 1,
  },
  itemType: {
    fontSize: 15,
    fontFamily: fonts.extrabold,
    color: colors123.text,
  },
  itemFabric: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  removeButton: {
    padding: spacing.md,
    marginLeft: spacing.md,
  },
  label: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.pill,
    alignItems: "center",
    backgroundColor: colors123.surface,
  },
  secondaryButtonText: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors123.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  cardTitle: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  customerSummary: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerSummaryInfo: {
    marginLeft: spacing.md,
  },
  measurementMeta: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textMuted,
  },
  itemSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors123.borderLight,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  totalValue: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.extrabold,
    color: colors123.primary,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    gap: spacing.md,
  },
  deliveryDate: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  priorityRow: {
    marginBottom: spacing.md,
  },
  priorityButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.pill,
    backgroundColor: colors123.surface,
    alignItems: "center",
  },
  priorityButtonActive: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
  },
  priorityButtonText: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  priorityButtonTextActive: {
    color: colors123.surface,
  },
  notesContainer: {
    marginTop: spacing.md,
  },
  notesInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.sm,
    fontSize: 16,
    color: colors123.text,
    backgroundColor: colors123.surface,
    textAlignVertical: "top",
    ...shadows.soft,
  },
});

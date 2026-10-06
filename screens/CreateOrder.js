import usePagedList from '../hooks/usePagedList';
import PagedListFooter from '../components/PagedListFooter';
import { customerApi } from '../services/api';
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { colors123, fonts, formatCurrency, radius, shadows, spacing } from "../utils/theme";
import AvatarCircle from "../components/AvatarCircle";
import AppButton from "../components/AppButton";
import StepProgress from "../components/StepProgress";
import { showAccountInactiveAlert } from "../utils/accountStatus";
import { formatPhone, toLocalDateKey } from "../utils/formHelpers";
import MeasurementPickerModal from "../components/MeasurementPickerModal";
import CreateItemDetail from "./CreateItemDetail";

export default function CreateOrder({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const { addOrder, recordPayment, can } = useStitchPro();
  const { showToast } = useToast();

  // Get customerId from route params (if coming from CustomerDetail or CustomerSelection)
  const routeCustomerId = route?.params?.customerId;

  // Start at step 1 (customer selection) or step 2 (outfit type) if customerId is provided
  const initialStep = routeCustomerId ? 2 : 1;

  // ========== STATE MACHINE: Single source of truth is `currentStep` (1-5) ==========
  const [currentStep, setCurrentStep] = useState(initialStep); // 1-5 - Controls entire UI flow
  const [loading, setLoading] = useState(false);

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
  const [advance, setAdvance] = useState("");
  const [notes, setNotes] = useState("");

  const [debouncedSearch,setDebouncedSearch] = useState('');
  useEffect(() => {const timer=setTimeout(()=>setDebouncedSearch(customerSearch.trim()),300);return ()=>clearTimeout(timer);},[customerSearch]);
  const customerList = usePagedList(customerApi.getAll,'customers',{search:debouncedSearch});
  const customers = customerList.items;
  const customersError = customerList.error;
  useEffect(() => {
    let active=true;
    setSelectedCustomer(null);
    if(routeCustomerId) customerApi.getById(routeCustomerId).then(response=>{if(active)setSelectedCustomer(response.data?.data);}).catch(err=>{if(active){setCurrentStep(1);showToast(err.response?.data?.message || t('loadCustomersFailed'),'error');}});
    return ()=>{active=false;};
  },[routeCustomerId]);


  const filteredCustomers = customers;

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

  // The item screen already asks for measurements (required for stitching,
  // optional for alteration), so the item is complete here; no second prompt.
  const handleItemDetailSave = (item) => {
    const snapshot = item?.measurementSnapshot;
    const completeItem = snapshot ? {
      ...item,
      measurementLabel: item.measurementLabel || snapshot.outfitLabel,
      measurementData: item.measurementData || snapshot.measurementsData
    } : item;
    setSelectedItems((current) => [...current, completeItem]);
    setTempItem(null);
    setCurrentOutfitType(null);
    setCurrentItemMeasurement(null);
    showToast(t(snapshot ? "itemAddedWithProfile" : "itemAddedWithoutMeasurement"), "success");
    setCurrentStep(2);
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
    setSelectedCustomer(routeCustomerId ? selectedCustomer : null);
    setCustomerSearch("");
    setCurrentOutfitType(null);
    setTempItem(null);
    setCurrentItemMeasurement(null);
    setSelectedItems([]);
    setDeliveryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setAdvance("");
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

    if (advanceAmount > totalAmount) {
      showToast(t("advanceTooHigh"), "error");
      return;
    }

    setLoading(true);
    try {
      const createdOrder = await addOrder({
        customerId: selectedCustomer.id,
        items: selectedItems.map((item) => ({
          type: item.type || item.typeLabel,
          typeLabel: item.typeLabel || null,
          fabric: item.fabric || "",
          quantity: Number(item.quantity),
          price: Number(item.price),
          measurement_id: item.measurement_id || null,
          measurementLabel: item.measurementLabel || null,
          measurementData: item.measurementData || null,
          measurementSnapshot: item.measurementSnapshot || null
        })),
        deliveryDate: toLocalDateKey(deliveryDate),
        description: notes || '',
        measurement_snapshot: {
          profiles: measurementSnapshots,
          itemCount: selectedItems.length,
          createdAt: new Date().toISOString()
        }
      });

      let advanceSaved = true;
      if (advanceAmount > 0 && createdOrder?.id) {
        try {
          await recordPayment({ orderId: createdOrder.id, amount: advanceAmount, paymentMethod: "cash", notes: t("advance") });
        } catch {
          advanceSaved = false;
        }
      }

      // The order exists either way; only the advance needs re-entering if it failed.
      showToast(advanceSaved ? t("orderCreatedSuccess") : t("advanceNotSaved"), advanceSaved ? "success" : "error");
      resetForm();
      navigation.navigate("StudioTabs", { screen: "Orders" });
    } catch (err) {
      if (err.code === "SUBSCRIPTION_REQUIRED") {
        showAccountInactiveAlert(t);
        return;
      }

      showToast(err.response?.data?.message || err.message || t("orderCreateFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const advanceAmount = Number(advance) || 0;

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
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <StepProgress total={4} current={Math.min(currentStep, 4)} />

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

<InlineAlert message={customersError ? t("loadCustomersFailed") : null} onRetry={customerList.reload} retryLabel={t("retry")} />
          {customerList.loading && !customers.length ?
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
                    <Text style={styles.customerPhone}>{formatPhone(item.phone)}</Text>
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
        <PagedListFooter list={customerList} />
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
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setCurrentStep(1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <StepProgress total={4} current={Math.min(currentStep, 4)} />

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
                <Text style={styles.customerPhone}>{formatPhone(selectedCustomer?.phone)}</Text>
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
                    {item.fabric ? <Text style={styles.itemFabric}>{item.fabric}</Text> : null}
                    <Text style={styles.itemPrice}>
                      {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
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
          <ResponsiveGrid minItemWidth={140} style={styles.outfitsGrid}>
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
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => setCurrentStep(2)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <StepProgress total={4} current={Math.min(currentStep, 4)} />

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
              {tempItem.fabric ? <Text style={styles.itemFabric}>{tempItem.fabric}</Text> : null}
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
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
            onPress={() => setCurrentStep(2)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("reviewOrder")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <StepProgress total={4} current={Math.min(currentStep, 4)} />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll}>
          {/* Customer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>{t("customer")}</Text>
            <View style={styles.customerSummary}>
              <AvatarCircle name={selectedCustomer.name} size={56} />
              <View style={styles.customerSummaryInfo}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerPhone}>
                  {formatPhone(selectedCustomer.phone)}
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
                  {item.fabric ? <Text style={styles.itemFabric}>{item.fabric}</Text> : null}
                  {item.measurementLabel &&
                <Text style={styles.measurementMeta}>{item.measurementLabel}</Text>
                }
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.itemPrice}>
                    {item.quantity} × {formatCurrency(item.price)}
                  </Text>
                  <Text style={styles.itemTotal}>
                    {formatCurrency(item.quantity * item.price)}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("totalAmount")}</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
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

            <View style={styles.notesContainer}>
              <Text style={styles.label}>{t("advanceReceived")}</Text>
              <TextInput accessibilityLabel={t("advanceReceived")}
                style={styles.notesInput}
                placeholder="₹0"
                placeholderTextColor={colors123.textSoft}
                keyboardType="number-pad"
                value={advance}
                onChangeText={(value) => setAdvance(value.replace(/[^\d]/g, ""))} />
              {advanceAmount > 0 &&
              <Text style={styles.measurementMeta}>{t("balance")}: {formatCurrency(Math.max(0, totalAmount - advanceAmount))}</Text>
              }
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

          <TouchableOpacity accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={() => setCurrentStep(2)}
            disabled={loading}>

            <Text style={styles.secondaryButtonText}>{t("editItems")}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Primary action pinned within thumb reach */}
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View>
            <Text style={styles.footerLabel}>{t("totalAmount")}</Text>
            <Text style={styles.footerTotal}>{formatCurrency(totalAmount)}</Text>
          </View>
          <AppButton
            icon="check"
            label={t("createOrder")}
            onPress={handleSubmitOrder}
            loading={loading}
            disabled={loading}
            size="lg"
            style={styles.footerButton} />
        </View>
      </View>);

  }
}

const styles = StyleSheet.create({
  stickyFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  footerLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors123.textMuted },
  footerTotal: { fontFamily: fonts.bold, fontSize: 20, color: colors123.text },
  footerButton: { flex: 1 },
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
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
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
    marginBottom: spacing.md,
    justifyContent: "space-between",
  },
  outfitCard: {
    width: "100%",
    minHeight: 76,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: spacing.sm,
    ...shadows.card,
    flexDirection: "row",
    gap: spacing.xs,
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
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors123.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  outfitIconContainerSelected: {
    backgroundColor: colors123.primary,
  },
  outfitLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    textAlign: "left",
    flex: 1,
  },
  outfitLabelSelected: {
    color: colors123.primaryDark,
  },
  itemsSection: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.extrabold,
    color: colors123.text,
    marginBottom: spacing.sm,
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
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.sm,
    alignItems: "center",
    backgroundColor: colors123.surface,
  },
  secondaryButtonText: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
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


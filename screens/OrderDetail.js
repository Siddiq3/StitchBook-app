import { useSafeAreaInsets } from "react-native-safe-area-context";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { parseISO, isValid, format } from "date-fns";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { ORDER_STATUS_CONFIG, PAYMENT_METHODS, getOutfitLabel } from "../services/outfitTypes";
import { getWhatsAppTemplate, generateWhatsAppShareUrl } from "../services/whatsappTemplates";
import api, { orderApi } from "../services/api";
import { colors123, fonts, formatCurrency, radius, shadows, spacing, getOrderAmounts, getStatusTone } from "../utils/theme";

import StatusBadge from "../components/StatusBadge";
import { getMeasurementEntries } from "../utils/formHelpers";
import AppButton from "../components/AppButton";
import MeasurementFieldThumb from "../components/MeasurementFieldThumb";
import generateJobSheetHTML from "../utils/generateJobSheetHTML";import { useLanguage } from "../context/LanguageContext";

const safeParseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && isValid(value)) return value;
  if (typeof value === "number") {
    const date = new Date(value < 10000000000 ? value * 1000 : value);
    return isValid(date) ? date : null;
  }
  try {
    const text = String(value).trim();
    const parsed = parseISO(text);
    if (isValid(parsed)) return parsed;

    const nativeDate = new Date(text);
    return isValid(nativeDate) ? nativeDate : null;
  } catch {
    return null;
  }
};

const getActivityDate = (activity) =>
  safeParseDate(
    activity?.timestamp ||
    activity?.createdAt ||
    activity?.created_at ||
    activity?.updatedAt ||
    activity?.updated_at ||
    activity?.date
  );

const getActivityType = (activity) =>
  String(activity?.type || activity?.action_type || activity?.actionType || "").toLowerCase();

const getActivityIcon = (type = "") => {
  switch (String(type).toLowerCase()) {
    case "status_change":
    case "status":
    case "order_status":
      return "checkmark-circle-outline";
    case "payment":
    case "payment_recorded":
      return "cash-outline";
    case "comment":
    case "note":
      return "chatbubble-ellipses-outline";
    case "delivery_due":
    case "delivery":
      return "calendar-outline";
    case "staff_assignment":
    case "assignment":
      return "people-outline";
    case "order_created":
    case "created":
      return "receipt-outline";
    default:
      return "time-outline";
  }
};

const getActivityStatusLabel = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
    case "started":
      return "New Order";
    case "in_progress":
    case "cutting":
      return "Cutting";
    case "stitching":
      return "Stitching";
    case "ready":
      return "Ready";
    case "delivered":
      return "Delivered";
    default:
      return status || "";
  }
};

const getActivityText = (activity) => {
  const type = getActivityType(activity);
  if (type === "status_change" || type === "status" || type === "order_status") {
    const fromStatus = getActivityStatusLabel(activity.old_value || activity.oldValue || activity.from);
    const toStatus = getActivityStatusLabel(activity.new_value || activity.newValue || activity.status || activity.to);
    if (fromStatus && toStatus) return `Status moved: ${fromStatus} → ${toStatus}`;
    if (toStatus) return `Status updated to ${toStatus}`;
    return activity.notes || "Status updated";
  }

  if (type === "payment" || type === "payment_recorded") {
    return activity.notes || `Payment recorded${activity.amount ? `: ₹${activity.amount}` : ""}`;
  }

  if (type === "comment" || type === "note") {
    return activity.notes || "Comment added";
  }

  if (type === "delivery_due" || type === "delivery") {
    return activity.notes || "Delivery updated";
  }

  if (type === "staff_assignment" || type === "assignment") {
    return activity.notes || "Staff assigned";
  }

  if (type === "order_created" || type === "created") {
    return activity.notes || "Order created";
  }

  return activity.notes || "Activity updated";
};

const getMeasurementBodyType = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (
  normalized.includes("pant") ||
  normalized.includes("trouser") ||
  normalized.includes("bottom") ||
  normalized.includes("salwar") ||
  normalized.includes("lehenga") ||
  normalized.includes("skirt"))
  {
    return "lower";
  }
  return "upper";
};

export default function OrderDetail({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { orderId } = route.params;
  const { orders, customers, shop, staff, fetchStaff, updateOrderStatus, updateOrder, recordPayment, fetchActivityLogs, activityLogs, fetchPayments, payments, fetchCustomers, can, subscription } = useStitchPro();
  const hasStaffManagement = Boolean(subscription?.features?.hasStaffManagement);
  const { showToast } = useToast();

  const [jobSheetLoading, setJobSheetLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const orderFromContext = orders.find((o) => o.id === orderId);
  const [orderDetail, setOrderDetail] = useState(orderFromContext || null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(null);
  const [assignmentSaving, setAssignmentSaving] = useState(false);

  const loadOrderDetail = async () => {
    if (!orderId) return;
    setLoadingOrder(true);
    try {
      const res = await orderApi.getById(orderId);
      const orderData = res.data?.data || null;

      setOrderDetail(orderData);
    } catch (err) {

    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (orderFromContext) {
      setOrderDetail(orderFromContext);
      if (!orderFromContext.measurement) {
        loadOrderDetail();
      }
    } else {
      loadOrderDetail();
    }
  }, [orderFromContext, orderId]);

  useEffect(() => {
    if (can("staff:read") && hasStaffManagement) fetchStaff?.();
  }, [fetchStaff, hasStaffManagement]);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    notes: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load activity, payments, and customers on mount
  useEffect(() => {
    if (orderId) {
      loadActivity();
      if (can("payments:read")) loadPayments();
      if (can("customers:read")) fetchCustomers();
    }
  }, [orderId]);

  const getOrderTypeLabel = (type) => {
    if (!type) return "";
    return type === "alteration" ? "Alteration" : "Stitching";
  };

  const getOrderTypeTone = (type) => {
    if (type === "alteration") {
      return {
        backgroundColor: "#FFEDD5",
        borderColor: "#FDBA74",
        color: "#C2410C"
      };
    }
    return {
      backgroundColor: "#DBEAFE",
      borderColor: "#93C5FD",
      color: "#1D4ED8"
    };
  };

  const renderOrderTypeBadge = (type) => {
    const label = getOrderTypeLabel(type);
    if (!label) return null;
    const tone = getOrderTypeTone(type);
    return (
      <View style={[styles.typeBadge, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
        <Text style={[styles.typeBadgeText, { color: tone.color }]}>{label}</Text>
      </View>);

  };

  const getOrderTotals = (targetOrder = order) => getOrderAmounts(targetOrder);
  // One name per status everywhere (badge, steps, dialogs)
  const statusName = (status) => t(getStatusTone(status).labelKey || status);


  const getCustomerPhone = () =>
    order?.customer_phone ||
    order?.phone ||
    order?.customer?.phone ||
    order?.customer?.phone_number ||
    order?.customer?.phoneNumber ||
    enrichedOrder?.phone ||
    "";

  const formatDisplayDate = (value, fallback = "To be confirmed") => {
    const dateObj = safeParseDate(value);
    if (dateObj) return format(dateObj, "dd MMM yyyy");
    return value ? String(value).split("T")[0] : fallback;
  };

  const buildInvoiceMessage = () => {
    if (!order) return "";

    const customerName = order.customer_name || order.name || "Customer";
    const shopName = shop?.name || "StitchBook";
    const orderNo = order.order_number || `#${order.id}`;
    const delivery = formatDisplayDate(order.deliveryDate || order.delivery_date);
    const { total, paid, balance } = getOrderTotals(order);
    const itemText = (order.items || []).
    map((item, index) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || item.amount || 0);
      return `${index + 1}. ${itemDisplayName(item)} x ${quantity} - Rs ${price * quantity}`;
    }).
    join("\n");

    return `Hi ${customerName},

Invoice for order ${orderNo}

${itemText || "Tailoring order"}

Delivery: ${delivery}
Total: Rs ${total}
Paid: Rs ${paid}
Balance: Rs ${balance}

${balance > 0 ? "Please clear the balance at delivery/pickup." : "Payment completed. Thank you."}

- ${shopName}`;
  };

  const openWhatsAppWithMessage = async (phone, message) => {
    const appUrl = phone ?
    generateWhatsAppShareUrl(phone, message) :
    `whatsapp://send?text=${encodeURIComponent(message || "")}`;
    const webUrl = phone ?
    generateWhatsAppShareUrl(phone, message, "web") :
    `https://wa.me/?text=${encodeURIComponent(message || "")}`;

    try {
      if (appUrl && (await Linking.canOpenURL(appUrl))) {
        await Linking.openURL(appUrl);
        return true;
      }
    } catch {}

    if (webUrl) {
      await Linking.openURL(webUrl);
      return true;
    }

    return false;
  };

  const handleShareOnWhatsApp = async () => {
    if (!order?.id) return;
    setWhatsappLoading(true);
    try {
      const opened = await openWhatsAppWithMessage(getCustomerPhone(), buildInvoiceMessage());
      if (!opened) throw new Error(t("auto_could_not_open_whatsapp"));
      showToast(t("auto_opening_whatsapp"), "success");
    } catch (err) {
      Alert.alert(t("auto_could_not_open_whatsapp"), err.message || "");
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleCopyInvoiceLink = async () => {
    if (!order?.id) {
      showToast(t("auto_invoice_link_unavailable"), "error");
      return;
    }
    setCopyLoading(true);
    try {
      const shareText = buildInvoiceMessage();
      await Clipboard.setStringAsync(shareText);
      showToast(t("auto_link_copied"), 'success');
    } catch (err) {
      showToast(t("auto_could_not_copy_link"), 'error');
    } finally {
      setCopyLoading(false);
    }
  };

  const loadActivity = async () => {
    try {

      await fetchActivityLogs(orderId);
    } catch (err) {

    }
  };

  const loadPayments = async () => {
    try {

      await fetchPayments(orderId);
    } catch (err) {

    }
  };

  const handleAdvanceStatus = async () => {
    if (!order) return;

    const currentStatus = order.status;
    const statusConfig = ORDER_STATUS_CONFIG[currentStatus];

    if (!statusConfig?.nextStatus) {
      showToast(t("auto_order_is_already_completed"), "info");
      return;
    }

    Alert.alert(t("auto_advance_order_status"),

    `${statusName(order.status)} → ${statusName(statusConfig.nextStatus)}`,
    [
    {
      text: t("cancel"),
      onPress: () => {}
    },
    {
      text: t("confirm"),
      onPress: async () => {
        setLoadingStatus(true);
        try {
          await updateOrderStatus(orderId, statusConfig.nextStatus);
          showToast(`${t("orderMovedTo")} ${statusName(statusConfig.nextStatus)}`, "success");
          loadActivity();
        } catch (err) {
          showToast(err.message || "Failed to update status", "error");
        } finally {
          setLoadingStatus(false);
        }
      },
      style: "destructive"
    }]

    );
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      showToast(t("auto_please_enter_a_valid_amount"), "error");
      return;
    }

    setPaymentLoading(true);
    try {
      await recordPayment({
        orderId,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.method,
        notes: paymentForm.notes
      });
      showToast(t("auto_payment_recorded_successfully"), "success");
      setShowPaymentModal(false);
      setPaymentForm({ amount: "", method: "cash", notes: "" });
      loadActivity();
    } catch (err) {
      showToast(err.message || "Failed to record payment", "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleOpenWhatsAppModal = () => {
    if (!order || !enrichedOrder) {
      showToast(t("auto_order_data_not_available"), "error");
      return;
    }

    const status = order.status || order.currentStatus;
    const template = getWhatsAppTemplate(status, enrichedOrder, order, shop);

    if (!template) {
      showToast(t("auto_no_whatsapp_template_available_for_this_stat"), "error");
      return;
    }

    setWhatsappMessage(template);
    setShowWhatsappModal(true);
  };

  const handleOpenReminder = (type) => {
    if (!order || !enrichedOrder) {
      showToast(t("auto_order_data_not_available"), "error");
      return;
    }

    const customerName = enrichedOrder.customer_name || enrichedOrder.name || "Customer";
    const shopName = shop?.name || "StitchBook";
    const orderNo = order.order_number || `#${order.id}`;
    const delivery = formatDisplayDate(order.deliveryDate || order.delivery_date, "to be confirmed");
    const { total, paid, balance } = getOrderAmounts(order);
    const itemText = (order.items || []).
    map((item) => itemDisplayName(item)).
    filter(Boolean).
    join(", ");

    const messages = {
      created: `Hi ${customerName}, your order ${orderNo} is created.\nItems: ${itemText || "Tailoring order"}\nDelivery: ${delivery}\nBalance: Rs ${balance}\n\n-${shopName}`,
      delivery: `Hi ${customerName}, reminder for your order ${orderNo}.\nDelivery date: ${delivery}\nPlease contact us if you need any update.\n\n-${shopName}`,
      payment: `Hi ${customerName}, payment reminder for order ${orderNo}.\nTotal: Rs ${total}\nPaid: Rs ${paid}\nBalance: Rs ${balance}\n\n-${shopName}`
    };

    setWhatsappMessage(messages[type] || messages.created);
    setShowWhatsappModal(true);
  };

  const handleSendWhatsApp = async () => {
    const phoneToUse = getCustomerPhone();

    if (!phoneToUse) {
      showToast("Customer phone not found. Opening WhatsApp without a selected contact.", "info");
    }

    try {
      if (!whatsappMessage) {
        showToast(t("auto_could_not_generate_whatsapp_link"), "error");
        return;
      }

      const opened = await openWhatsAppWithMessage(phoneToUse, whatsappMessage);
      if (opened) {
        setShowWhatsappModal(false);
        showToast(t("auto_opening_whatsapp"), "success");
        return;
      }

      showToast(t("auto_whatsapp_is_not_installed_or_cannot_open_lin"), "error");
    } catch (err) {

      showToast(t("auto_failed_to_send_whatsapp_message"), "error");
    }
  };

  const handleDeleteOrder = () => {
    Alert.alert(t("auto_delete_order"), t("auto_are_you_sure_you_want_to_delete_this_order"),

    [
    {
      text: "Cancel",
      onPress: () => {}
    },
    {
      text: "Delete",
      onPress: async () => {
        showToast(t("auto_order_deleted"), "success");
        navigation.goBack();
      },
      style: "destructive"
    }]

    );
  };

  const handleShareJobSheet = async () => {
    if (!orderDetail?.id) return;
    setJobSheetLoading(true);
    try {
      const res = await orderApi.getJobSheet(orderDetail.id);
      const jobSheetData = res.data?.data;
      const html = generateJobSheetHTML(jobSheetData);
      const { uri } = await printToFileAsync({ html, base64: false });
      await shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Job Sheet'
      });
    } catch (err) {

      Alert.alert(t("auto_job_sheet"), err.message || 'Unable to generate or share the job sheet.');
    } finally {
      setJobSheetLoading(false);
    }
  };

  const staffByRole = (role) =>
  (staff || []).filter(
    (member) =>
    member?.role === role &&
    member?.is_active !== false &&
    member?.active !== false
  );

  const getAssignedStaff = (item, role) => {
    const id =
    role === "cutter" ?
    item.cutter_staff_id || item.cutterStaffId || item.assigned_cutter_id :
    item.stitcher_staff_id || item.stitcherStaffId || item.assigned_stitcher_id;
    const name =
    role === "cutter" ?
    item.cutter_name || item.cutterName || item.assigned_cutter_name :
    item.stitcher_name || item.stitcherName || item.assigned_stitcher_name;

    return {
      id,
      name:
      name ||
      (staff || []).find((member) => String(member.id) === String(id))?.name ||
      ""
    };
  };

  const itemDisplayName = (item = {}) =>
  item.typeLabel || (item.type && getOutfitLabel(item.type)) || item.item_name || item.name || "Item";

  const buildOrderUpdatePayload = (items) => ({
    customer_id: order.customer_id || order.customerId || order.customer?.id,
    delivery_date: order.delivery_date || order.deliveryDate,
    description: order.description || order.notes || "",
    measurement_id: order.measurement_id || order.measurementId || null,
    measurement_snapshot: order.measurement_snapshot || order.measurement || null,
    items: items.map((item) => ({
      id: item.id,
      type: item.type || item.typeLabel || item.item_name || item.name,
      fabric: item.fabric,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || item.amount || 0),
      measurement_id: item.measurement_id || item.measurementId || null,
      measurementLabel: item.measurementLabel || item.measurement_label || null,
      measurementData: item.measurementData || item.measurement_data || null,
      measurementSnapshot: item.measurementSnapshot || item.measurement_snapshot || null,
      cutter_staff_id: item.cutter_staff_id || item.cutterStaffId || null,
      cutter_name: item.cutter_name || item.cutterName || null,
      stitcher_staff_id: item.stitcher_staff_id || item.stitcherStaffId || null,
      stitcher_name: item.stitcher_name || item.stitcherName || null,
      production_status: item.production_status || item.productionStatus || "new"
    }))
  });

  const handleAssignStaff = async (member) => {
    if (!assignmentModal || !order?.items) return;
    const { itemIndex, role } = assignmentModal;
    const updatedItems = order.items.map((item, index) => {
      if (index !== itemIndex) return item;
      if (role === "cutter") {
        return {
          ...item,
          cutter_staff_id: member.id,
          cutterStaffId: member.id,
          cutter_name: member.name,
          cutterName: member.name,
          production_status: item.production_status || "cutting"
        };
      }
      return {
        ...item,
        stitcher_staff_id: member.id,
        stitcherStaffId: member.id,
        stitcher_name: member.name,
        stitcherName: member.name,
        production_status: item.production_status || "stitching"
      };
    });

    setAssignmentSaving(true);
    try {
      const updated = await updateOrder(order.id, buildOrderUpdatePayload(updatedItems));
      setOrderDetail(updated || { ...order, items: updatedItems });
      setAssignmentModal(null);
      loadActivity();
      showToast(`${role === "cutter" ? "Cutter" : "Stitcher"} assigned`, "success");
    } catch (err) {
      showToast(err.message || "Unable to assign staff", "error");
    } finally {
      setAssignmentSaving(false);
    }
  };

  // Enrich order with customer name from customers data
  const enrichedOrder = React.useMemo(() => {
    if (!orderDetail) return null;

    const customerFromDetail =
    orderDetail.customer ||
    orderDetail.customerInfo ||
    orderDetail.customer_data ||
    null;

    const customerId = orderDetail.customerId || orderDetail.customer_id;
    const customerFromList =
    Array.isArray(customers) && customerId ?
    customers.find((c) => c.id === customerId) :
    null;

    const customer = customerFromDetail || customerFromList;
    const phone =
    orderDetail.phone ||
    orderDetail.customer_phone ||
    orderDetail.phone_number ||
    orderDetail.phoneNumber ||
    customer?.phone ||
    customer?.phone_number ||
    customer?.phoneNumber ||
    '';

    return {
      ...orderDetail,
      name:
      orderDetail.name ||
      customer?.name ||
      orderDetail.customer_name ||
      orderDetail.customer?.name ||
      'Unknown Customer',
      customer_name:
      orderDetail.customer_name ||
      customer?.name ||
      orderDetail.customer?.name ||
      'Unknown Customer',
      customer_phone: phone,
      customer: {
        ...customer,
        phone: customer?.phone || phone
      }
    };
  }, [orderDetail, customers]);

  const order = enrichedOrder || orderDetail;
  const snapshot = order?.measurement_snapshot || order?.measurement || null;
  const snapshotProfiles =
  snapshot?.profiles || (Array.isArray(snapshot) ? snapshot : snapshot ? [snapshot] : []);
  const profile = snapshotProfiles[0] || null;
  const measurementData = profile ?
  profile.measurementsData || profile.measurements_data || {} :
  {};
  const outfitType =
  profile?.outfitType ||
  profile?.outfit_type ||
  order?.order_type ||
  order?.items?.[0]?.type ||
  order?.items?.[0]?.typeLabel;

  if (loadingOrder && !order) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("auto_order_details")}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={colors123.primary} />
        </View>
      </View>);

  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors123.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("auto_order_details")}</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.errorText}>{t("auto_order_not_found")}</Text>
        </View>
      </View>);

  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const { total: orderTotal, paid: paidSoFar, balance: balanceDue, paymentStatus } = getOrderAmounts(order);
  const hasNextStatus = statusConfig?.nextStatus;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("back")}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>

          <Ionicons name="chevron-back" size={28} color={colors123.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t("auto_order")}{order.id}</Text>
          <View style={styles.headerBadgeRow}>
            <StatusBadge compact status={order.status} />
            {renderOrderTypeBadge(order.order_type || order.orderType)}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity accessibilityRole="button"
            onPress={handleShareJobSheet}
            disabled={jobSheetLoading}
            style={styles.headerActionButton}>

            {jobSheetLoading ?
            <ActivityIndicator size="small" color={colors123.primary} /> :

            <Text style={styles.headerActionText}>{t("auto_job_sheet_2")}</Text>
            }
          </TouchableOpacity>

          {can("orders:write") &&
          <TouchableOpacity accessibilityRole="button"
            onPress={() => {
              Alert.alert(t("auto_order_options"), "", [
              {
                text: "Delete",
                onPress: handleDeleteOrder,
                style: "destructive"
              },
              {
                text: "Cancel",
                onPress: () => {}
              }]
              );
            }}>

            <Ionicons name="ellipsis-vertical" size={24} color={colors123.primary} />
          </TouchableOpacity>
          }
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentScroll}>
        {/* Order Summary Card */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.label}>{t("auto_customer")}</Text>
              <Text style={styles.value}>{order?.customer_name || 'Unknown Customer'}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
              <StatusBadge compact status={paymentStatus} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.label}>{t("auto_order_date")}</Text>
              <Text style={styles.value}>
                {(() => {
                  const dateValue = order.createdAt || order.created_at || order.createdDate || order.created_date;
                  const dateObj = safeParseDate(dateValue);
                  return dateObj ? format(dateObj, "dd MMM yyyy") : "Invalid date";
                })()}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>{t("auto_delivery_date")}</Text>
              <Text style={styles.value}>
                {(() => {
                  const dateValue = order.deliveryDate || order.delivery_date;
                  const dateObj = safeParseDate(dateValue);
                  return dateObj ? format(dateObj, "dd MMM yyyy") : dateValue ? "Invalid date" : "No date";
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Measurement Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("auto_measurement_profile")}</Text>
          {profile ?
          <View>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.label}>{t("auto_profile")}</Text>
                  <Text style={styles.value}>
                    {profile.outfitLabel ||
                  profile.outfit_label ||
                  profile.outfitType ||
                  `Profile #${profile.id}`}
                  </Text>
                </View>
                {profile.id ?
              <Text style={styles.measurementMeta}>#{profile.id}</Text> :
              null}
              </View>
              <View style={styles.divider} />
              <ResponsiveGrid minItemWidth={140} style={styles.measurementList}>
                {getMeasurementEntries(measurementData).map(([key, value]) =>
              <View key={key} style={styles.measurementRow}>
                    <MeasurementFieldThumb
                  bodyType={getMeasurementBodyType(outfitType)}
                  label={key}
                  size={42} />

                    <View style={styles.measurementRowCopy}>
                      <Text numberOfLines={2} style={styles.measurementLabel}>{key}</Text>
                      <Text style={styles.measurementValue}>{value}</Text>
                    </View>
                  </View>
              )}
              </ResponsiveGrid>
            </View> :

          <View>
              <Text style={styles.emptyText}>{t("auto_no_measurement_profile_attached_to_this_orde")}

            </Text>
            </View>
          }
        </View>

        {/* Status Pipeline */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={styles.cardTitle}>{t("auto_order_status")}</Text>
            <TouchableOpacity accessibilityRole="button"
              onPress={handleOpenWhatsAppModal}
              style={styles.whatsappButton}>

              <MaterialCommunityIcons name="whatsapp" size={18} color="white" />
              <Text style={styles.whatsappButtonText}>{t("auto_message")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusPipeline}>
            {["started", "cutting", "stitching", "ready", "delivered"].map(
              (status, index, arr) => {
                const currentStatus = order.status === status ||
                order.status === 'pending' && status === 'started' ||
                order.status === 'in_progress' && status === 'cutting';
                const normalizedStatus =
                order.status === "pending" ?
                "started" :
                order.status === "in_progress" ?
                "cutting" :
                order.status;
                const isCompleted = arr.indexOf(normalizedStatus) > index;

                return (
                  <View key={status} style={{ alignItems: "center", flex: 1 }}>
                    <View
                      style={[
                      styles.statusCircle,
                      currentStatus && styles.statusCircleActive,
                      isCompleted && styles.statusCircleCompleted]
                      }>

                      {isCompleted ?
                      <Ionicons name="checkmark" size={16} color="white" /> :

                      <View style={styles.statusDot} />
                      }
                    </View>
                    {index < arr.length - 1 &&
                    <View
                      style={[
                      styles.statusLine,
                      isCompleted && styles.statusLineCompleted]
                      } />

                    }
                    <Text
                      style={[
                      styles.statusLabel,
                      currentStatus && styles.statusLabelActive]
                      }>

                      {t(status === 'started' ? 'pending' : status)}
                    </Text>
                  </View>);

              }
            )}
          </View>

          {hasNextStatus && can("orders:update_status") &&
          <AppButton
            title={`${t("markAs")} ${t(statusConfig.nextStatus)}`}
            onPress={handleAdvanceStatus}
            disabled={loadingStatus}
            style={{ marginTop: spacing.lg }} />

          }
        </View>

        {/* WhatsApp Automation */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>WhatsApp reminders</Text>
              <Text style={styles.cardSubtitle}>Send common customer updates quickly</Text>
            </View>
            <MaterialCommunityIcons name="whatsapp" size={22} color="#128C4A" />
          </View>
          <ResponsiveGrid style={styles.reminderGrid}>
            {[
            { key: "created", label: "Order created", icon: "clipboard-check-outline" },
            { key: "delivery", label: "Delivery reminder", icon: "truck-delivery-outline" },
            { key: "payment", label: "Payment reminder", icon: "credit-card-clock-outline" }].
            map((item) =>
            <TouchableOpacity accessibilityRole="button"
              key={item.key}
              style={styles.reminderButton}
              onPress={() => handleOpenReminder(item.key)}>

                <MaterialCommunityIcons name={item.icon} size={17} color={colors123.primary} />
                <Text style={styles.reminderButtonText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          </ResponsiveGrid>
        </View>

        {/* Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("auto_items")}</Text>
          <Text style={styles.cardSubtitle}>Assign cutting and stitching work for each item.</Text>
          <View style={styles.itemsTable}>
            {order.items?.map((item, index) =>
            <View key={index} style={styles.itemWorkCard}>
                <View style={styles.itemWorkHeader}>
                  <View style={styles.itemWorkTitleBlock}>
                  <View style={styles.itemLabelRow}>
                    <Text style={styles.itemLabel}>{itemDisplayName(item)}</Text>
                    {renderOrderTypeBadge(
                    order.order_type || order.orderType || item.order_type || item.orderType
                  )}
                  </View>
                  {item.fabric ?
                <Text style={styles.itemFabric}>{item.fabric}</Text> :
                null}
                  </View>
                  <View style={styles.itemMetaStack}>
                    <Text style={styles.itemMetaText}>Qty {item.quantity}</Text>
                    <Text style={styles.itemPriceText}>{formatCurrency(item.price * item.quantity)}</Text>
                  </View>
                  </View>

                {hasStaffManagement &&
                <View style={styles.assignmentPanel}>
                  <View style={styles.assignmentHeader}>
                    <View>
                      <Text style={styles.assignmentTitle}>Production handoff</Text>
                      <Text style={styles.assignmentSubtitle}>Choose who will cut and stitch this item</Text>
                    </View>
                  </View>
                  <View style={styles.assignmentRow}>
                    {["cutter", "stitcher"].map((role) => {
                    const assigned = getAssignedStaff(item, role);
                    const hasAssigned = Boolean(assigned.name || assigned.id);
                    const label = role === "cutter" ? "Cutter" : "Stitcher";
                    const isCutter = role === "cutter";
                    return (
                      <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(hasAssigned) }}
                        key={role}
                        style={[styles.assignmentChip, hasAssigned && styles.assignmentChipActive]}
                        disabled={!can("orders:write")}
                        onPress={() => setAssignmentModal({ itemIndex: index, role })}>

                        <View style={[
                          styles.assignmentIconBox,
                          isCutter ? styles.cutterIconBox : styles.stitcherIconBox,
                          hasAssigned && styles.assignmentIconBoxActive
                        ]}>
                          <MaterialCommunityIcons
                          name={role === "cutter" ? "content-cut" : "needle"}
                          size={20}
                          color={hasAssigned ? colors123.surface : isCutter ? colors123.warning : colors123.primary} />
                        </View>

                          <View style={styles.assignmentCopy}>
                            <Text style={styles.assignmentRoleText}>
                              {label}
                            </Text>
                          <Text
                          numberOfLines={2}
                          style={[styles.assignmentChipText, hasAssigned && styles.assignmentChipTextActive]}>

                              {hasAssigned ? assigned.name : isCutter ? "Not assigned for cutting" : "Not assigned for stitching"}
                          </Text>
                          </View>

                          <View style={[styles.assignmentActionPill, hasAssigned && styles.assignmentActionPillActive]}>
                            <Text style={[styles.assignmentActionText, hasAssigned && styles.assignmentActionTextActive]}>
                              {hasAssigned ? "Change" : "Assign"}
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={13}
                              color={hasAssigned ? colors123.surface : colors123.primary} />
                          </View>
                        </TouchableOpacity>);

                  })}
                  </View>
                </View>
                }
              </View>
            )}
          </View>

          {order.measurement ?
          <View style={styles.measurementCard}>
              <Text style={styles.cardTitle}>{t("auto_measurements")}</Text>
              <Text style={styles.measurementHeading}>
                {order.measurement.outfitLabel ||
              order.measurement.outfit_label ||
              order.measurement.outfitType ||
              "Measurement profile"}
              </Text>
              <ResponsiveGrid style={styles.measurementGrid}>
                {getMeasurementEntries(measurementData).map(([key, value]) =>
              <View key={key} style={styles.measurementTile}>
                    <MeasurementFieldThumb
                  bodyType={getMeasurementBodyType(outfitType)}
                  label={key}
                  size={40} />

                    <View style={styles.measurementTileCopy}>
                      <Text numberOfLines={2} style={styles.measurementTileLabel}>{key}</Text>
                      <Text style={styles.measurementTileValue}>{value}</Text>
                    </View>
                  </View>
              )}
              </ResponsiveGrid>
            </View> :
          null}

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("auto_subtotal")}</Text>
              <Text style={styles.totalValue}>{formatCurrency(orderTotal)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: spacing.md }]}>
              <Text style={styles.totalLabel}>{t("paid")}</Text>
              <Text style={styles.totalValue}>{formatCurrency(paidSoFar)}</Text>
            </View>
            <View
              style={[
              styles.totalRow,
              {
                marginTop: spacing.md,
                paddingTop: spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors123.border
              }]
              }>

              <Text style={styles.balanceLabel}>{t("auto_balance_due")}</Text>
              <Text
                style={[
                styles.balanceValue,
                balanceDue > 0 && styles.balanceValueWarning]
                }>

                {formatCurrency(balanceDue)}
              </Text>
            </View>
          </View>

          {/* Collect sits right under the balance it settles; it is the one primary action here */}
          {balanceDue > 0 && can("payments:write") &&
          <AppButton
            icon="cash-plus"
            title={t("auto_record_payment")}
            onPress={() => setShowPaymentModal(true)}
            style={{ marginTop: spacing.md }} />
          }

          <View style={styles.invoiceActions}>
            <AppButton
              icon="whatsapp"
              variant="secondary"
              label={t("auto_share_on_whatsapp")}
              onPress={handleShareOnWhatsApp}
              loading={whatsappLoading}
              style={styles.invoiceActionButton} />

            <AppButton
              label={t("auto_copy_invoice_link")}
              variant="secondary"
              onPress={handleCopyInvoiceLink}
              loading={copyLoading}
              style={styles.invoiceActionButton} />

          </View>
        </View>

        {/* Activity Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("auto_activity")}</Text>
          {!activityLogs || activityLogs.length === 0 ?
          <Text style={styles.emptyText}>{t("auto_no_activity_yet")}</Text> :

          <View>
              {activityLogs.map((act, index) =>
            <View
              key={act.id || index}
              style={[
              styles.activityItem,
              index !== activityLogs.length - 1 && styles.activityItemBorder]
              }>

                  <View style={styles.activityIconContainer}>
                    <Ionicons
                  name={getActivityIcon(getActivityType(act))}
                  size={20}
                  color={colors123.primary} />

                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityText}>
                      {getActivityText(act)}
                    </Text>
                    <Text style={styles.activityTime}>
                      {(() => {
                    const dateObj = getActivityDate(act);
                    return dateObj ? format(dateObj, "dd MMM yyyy, hh:mm a") : "Date not available";
                  })()}
                    </Text>
                  </View>
                </View>
            )}
            </View>
          }
        </View>
      </ScrollView>

      {/* Staff Assignment Modal */}
      <Modal
        visible={Boolean(assignmentModal) && hasStaffManagement}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignmentModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Assign {assignmentModal?.role === "cutter" ? "Cutter" : "Stitcher"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {assignmentModal ?
                  itemDisplayName(order.items?.[assignmentModal.itemIndex]) :
                  ""}
                </Text>
              </View>
              <TouchableOpacity accessibilityRole="button" onPress={() => setAssignmentModal(null)}>
                <Ionicons name="close" size={28} color={colors123.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {assignmentModal && staffByRole(assignmentModal.role).length === 0 ?
              <View style={styles.emptyAssignmentBox}>
                  <MaterialCommunityIcons
                  name={assignmentModal.role === "cutter" ? "content-cut" : "needle"}
                  size={28}
                  color={colors123.textMuted} />

                  <Text style={styles.emptyAssignmentTitle}>
                    No {assignmentModal.role === "cutter" ? "cutters" : "stitchers"} added
                  </Text>
                  <Text style={styles.emptyAssignmentText}>
                    Add staff with this role from Staff Management, then assign them here.
                  </Text>
                </View> :

              <View style={styles.staffPickList}>
                  {assignmentModal ?
                staffByRole(assignmentModal.role).map((member) =>
                <TouchableOpacity accessibilityRole="button"
                  key={member.id}
                  disabled={assignmentSaving}
                  style={styles.staffPickRow}
                  onPress={() => handleAssignStaff(member)}>

                          <View style={styles.staffPickAvatar}>
                            <Text style={styles.staffPickAvatarText}>
                              {String(member.name || "?").slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.staffPickName}>{member.name}</Text>
                            <Text style={styles.staffPickPhone}>{member.phone || "No phone"}</Text>
                          </View>
                          {assignmentSaving ?
                  <ActivityIndicator size="small" color={colors123.primary} /> :

                  <MaterialCommunityIcons name="chevron-right" size={22} color={colors123.textMuted} />
                  }
                        </TouchableOpacity>
                ) :
                null}
                </View>
              }
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}>

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("auto_record_payment")}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={28} color={colors123.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t("auto_amount")}</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput accessibilityLabel={t("enterPaymentAmount")}
                    style={styles.amountInput}
                    placeholder={t("enterPaymentAmount")}
                    keyboardType="decimal-pad"
                    value={paymentForm.amount}
                    onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, amount: text })
                    } />

                </View>
                <View style={styles.paymentHintRow}>
                  <Text style={styles.helperText}>{t("auto_balance_due_2")}{Number(balanceDue).toLocaleString("en-IN")}</Text>
                  {balanceDue > 0 &&
                  <AppButton size="sm" variant="ghost" label={t("fullBalance")}
                  onPress={() => setPaymentForm({ ...paymentForm, amount: String(balanceDue) })} />
                  }
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t("auto_payment_method")}</Text>
                <View style={styles.methodGrid}>
                  {PAYMENT_METHODS.map((method) =>
                  <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: Boolean(paymentForm.method === method.id) }}
                    key={method.id}
                    style={[
                    styles.methodButton,
                    paymentForm.method === method.id && styles.methodButtonActive]
                    }
                    onPress={() =>
                    setPaymentForm({ ...paymentForm, method: method.id })
                    }>

                      <Text
                      style={[
                      styles.methodButtonText,
                      paymentForm.method === method.id &&
                      styles.methodButtonTextActive]
                      }>

                        {method.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t("auto_notes_optional")}</Text>
                <TextInput accessibilityLabel={t("auto_reference_number_bank_details_etc")}
                  style={styles.notesInput}
                  placeholder={t("auto_reference_number_bank_details_etc")}
                  value={paymentForm.notes}
                  onChangeText={(text) =>
                  setPaymentForm({ ...paymentForm, notes: text })
                  }
                  multiline
                  numberOfLines={3} />

              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity accessibilityRole="button"
                style={styles.cancelButton}
                onPress={() => setShowPaymentModal(false)}>

                <Text style={styles.cancelButtonText}>{t("auto_cancel")}</Text>
              </TouchableOpacity>
              <AppButton
                title={paymentLoading ? "Collecting..." : t("auto_record_payment")}
                onPress={handleRecordPayment}
                disabled={paymentLoading}
                style={{ flex: 1, marginLeft: spacing.md }} />

            </View>
          </View>
        </View>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showWhatsappModal}
        onRequestClose={() => setShowWhatsappModal(false)}>

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("auto_send_whatsapp_message")}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowWhatsappModal(false)}>
                <Ionicons name="close" size={24} color={colors123.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>{t("auto_message_preview")}</Text>
              <View style={styles.messagePreview}>
                <Text style={styles.messageText}>{whatsappMessage}</Text>
              </View>

              <Text style={styles.modalLabel}>{t("auto_edit_message")}</Text>
              <TextInput accessibilityLabel={t("auto_edit_your_whatsapp_message_here")}
                style={styles.messageInput}
                value={whatsappMessage}
                onChangeText={setWhatsappMessage}
                multiline
                numberOfLines={8}
                placeholder={t("auto_edit_your_whatsapp_message_here")} />


              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={16} color={colors123.primary} />
                <Text style={styles.infoText}>{t("auto_message_will_be_sent_via_whatsapp_to")}
                  {order?.customer_phone || order?.customer?.phone || 'customer'}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity accessibilityRole="button"
                style={styles.cancelButton}
                onPress={() => setShowWhatsappModal(false)}>

                <Text style={styles.cancelButtonText}>{t("auto_cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button"
                onPress={handleSendWhatsApp}
                style={styles.whatsappSendButton}>

                <MaterialCommunityIcons name="whatsapp" size={20} color="white" />
                <Text style={styles.whatsappSendButtonText}>{t("auto_send_via_whatsapp")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors123.background,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  headerTitle: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
    marginRight: spacing.xs,
  },
  headerActionText: {
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statusBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fonts.xs.fontSize,
  },
  typeBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fonts.xs.fontSize,
  },
  itemLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  invoiceActionButton: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  cardTitle: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontSize: fonts.sm.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  reminderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  reminderButton: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.sm,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  reminderButtonText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.text,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.textSoft,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors123.border,
    marginVertical: spacing.sm,
  },
  paymentHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statusPipeline: {
    flexDirection: "row",
    marginVertical: spacing.md,
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  statusCircle: {
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors123.borderLight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors123.background,
  },
  statusCircleActive: {
    borderColor: colors123.primary,
  },
  statusCircleCompleted: {
    backgroundColor: colors123.success,
    borderColor: colors123.success,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors123.border,
  },
  // Joins this step's circle to the next one, drawn behind the circles
  statusLine: {
    position: "absolute",
    top: 15,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: colors123.border,
  },
  statusLineCompleted: {
    backgroundColor: colors123.success,
  },
  statusLabel: {
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.textSoft,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statusLabelActive: {
    color: colors123.primary,
    fontFamily: fonts.bold,
  },
  measurementMeta: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
  },
  measurementList: {
    gap: spacing.sm,
  },
  measurementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors123.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 0,
    borderColor: colors123.borderLight,
    width: "100%",
  },
  measurementRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  measurementLabel: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    textTransform: "capitalize",
  },
  measurementValue: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginTop: 2,
  },
  measurementHeading: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.md,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  measurementTile: {
    width: "100%",
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors123.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  measurementTileCopy: {
    flex: 1,
    minWidth: 0,
  },
  measurementTileLabel: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    marginBottom: 2,
    textTransform: "capitalize",
  },
  measurementTileValue: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  measurementCard: {
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  itemsTable: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  itemWorkCard: {
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    padding: spacing.md,
  },
  itemWorkHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  itemWorkTitleBlock: {
    flex: 1,
  },
  itemMetaStack: {
    alignItems: "flex-end",
    gap: 5,
  },
  itemMetaText: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors123.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    fontFamily: fonts.semibold,
    fontSize: fonts.xs.fontSize,
    color: colors123.textSecondary,
  },
  itemPriceText: {
    fontFamily: fonts.extrabold,
    fontSize: fonts.sm.fontSize,
    color: colors123.text,
  },
  itemLabel: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  itemFabric: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  assignmentPanel: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  assignmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  assignmentTitle: {
    fontFamily: fonts.extrabold,
    fontSize: fonts.sm.fontSize,
    color: colors123.text,
  },
  assignmentSubtitle: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors123.textMuted,
  },
  assignmentRow: {
    gap: spacing.sm,
  },
  assignmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    padding: spacing.sm,
  },
  assignmentChipActive: {
    borderColor: colors123.primary,
    backgroundColor: colors123.surface,
  },
  assignmentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cutterIconBox: {
    backgroundColor: colors123.warningSoft,
  },
  stitcherIconBox: {
    backgroundColor: colors123.primarySoft,
  },
  assignmentIconBoxActive: {
    backgroundColor: colors123.primary,
  },
  assignmentCopy: {
    flex: 1,
    minWidth: 0,
  },
  assignmentRoleText: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: colors123.text,
  },
  assignmentChipText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 15,
    color: colors123.textMuted,
    marginTop: 3,
  },
  assignmentChipTextActive: {
    color: colors123.textSecondary,
  },
  assignmentActionPill: {
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors123.primary,
    backgroundColor: colors123.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  assignmentActionPillActive: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
  },
  assignmentActionText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors123.primary,
  },
  assignmentActionTextActive: {
    color: colors123.surface,
  },
  totalsContainer: {
    paddingTop: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  totalValue: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  balanceLabel: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  balanceValue: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.bold,
    color: colors123.success,
  },
  balanceValueWarning: {
    color: colors123.warning,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors123.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityText: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  activityTime: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.textSoft,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  errorText: {
    fontSize: fonts.base.fontSize,
    color: colors123.textSoft,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors123.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors123.borderLight,
  },
  modalTitle: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: fonts.xs.fontSize,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: "70%",
  },
  staffPickList: {
    gap: spacing.sm,
  },
  staffPickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.lg,
    backgroundColor: colors123.surface,
    padding: spacing.md,
  },
  staffPickAvatar: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
  },
  staffPickAvatarText: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors123.primary,
  },
  staffPickName: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.text,
  },
  staffPickPhone: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  emptyAssignmentBox: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.lg,
    backgroundColor: colors123.surface,
    padding: spacing.lg,
  },
  emptyAssignmentTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors123.text,
  },
  emptyAssignmentText: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors123.textMuted,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors123.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  whatsappButtonText: {
    color: "white",
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
  },
  whatsappSendButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#25D366",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  whatsappSendButtonText: {
    color: "white",
    fontSize: fonts.base.fontSize,
    fontFamily: fonts.semibold,
  },
  messagePreview: {
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  messageText: {
    fontSize: fonts.sm.fontSize,
    color: colors123.text,
    lineHeight: 20,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fonts.sm.fontSize,
    color: colors123.text,
    backgroundColor: colors123.surface,
    marginBottom: spacing.md,
    minHeight: 120,
    textAlignVertical: "top",
  },
  modalLabel: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginBottom: spacing.sm,
  },
  modalBody: {
    padding: spacing.lg,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: colors123.surface,
    borderWidth: 1,
    borderColor: colors123.primary + "30",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fonts.lg.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  helperText: {
    fontSize: fonts.xs.fontSize,
    color: colors123.textSoft,
    marginTop: spacing.xs,
  },
  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  methodButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    alignItems: "center",
  },
  methodButtonActive: {
    backgroundColor: colors123.primary,
    borderColor: colors123.primary,
  },
  methodButtonText: {
    fontSize: fonts.sm.fontSize,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  methodButtonTextActive: {
    color: "white",
  },
  notesInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    fontSize: fonts.base.fontSize,
    color: colors123.text,
    backgroundColor: colors123.surface,
    textAlignVertical: "top",
  },
});

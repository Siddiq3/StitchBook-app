import { ListSkeleton } from "../components/SkeletonBlock";
import InlineAlert from "../components/InlineAlert";
import ResponsiveGrid from "../components/ResponsiveGrid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getMeasurementEntries, toLocalDateKey } from "../utils/formHelpers";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Alert,
  RefreshControl,
  TextInput } from
"react-native";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MotiView } from "../components/AccessibleMotionView";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import EmptyState from "../components/EmptyState";
import { useStitchPro } from "../context/StitchProContext";
import { useToast } from "../context/ToastContext";
import { STAFF_ROLES } from "../services/outfitTypes";
import { colors123, fonts, radius, shadows, spacing } from "../utils/theme";import { useLanguage } from "../context/LanguageContext";

const PAYMENT_TYPES = [
{ id: "monthly", labelKey: "staffMonthly", icon: "calendar-month-outline" },
{ id: "daily", labelKey: "staffDaily", icon: "calendar-today" },
{ id: "per_piece", labelKey: "staffPerPiece", icon: "needle" },
{ id: "commission", labelKey: "staffCommission", icon: "percent-outline" }];

const WORK_STATUSES = [
{ id: "completed", labelKey: "completed" },
{ id: "approved", labelKey: "approved" },
{ id: "paid", labelKey: "paid" }];

const PRIMARY_STAFF_ROLES = [
  {
    id: "cutter",
    title: "Cutter",
    icon: "content-cut",
    summary: "Signs in with email and password; sees current orders and measurements for cutting.",
  },
  {
    id: "stitcher",
    title: "Stitcher",
    icon: "needle",
    summary: "Signs in with email and password; sees assigned stitching work, completed items, and earnings.",
  },
];

const today = () => toLocalDateKey();

const money = (value) => `₹${Number(value || 0).toFixed(0)}`;

const paymentTypeLabel = (type, t) =>
t(PAYMENT_TYPES.find((item) => item.id === type)?.labelKey || "staffMonthly");

const orderItemLabel = (item = {}) =>
item.typeLabel || item.type || item.name || item.item_name || "Item";

const orderLabel = (order = {}) =>
order.order_number || order.orderNumber || `Order #${order.id}`;

const itemPrice = (item = {}) => Number(item.price || item.amount || 0);

const payRateFor = (staff = {}) => Number(staff.pay_rate ?? staff.salary ?? 0);

const payRuleText = (staff = {}) => {
  const rate = payRateFor(staff);
  switch (staff.payment_type) {
    case "daily":
      return `${money(rate)} per work day, counted once per date`;
    case "per_piece":
      return `${money(rate)} for each stitched piece`;
    case "commission":
      return `${rate}% of the selected item price`;
    case "monthly":
    default:
      return `${money(rate)} monthly salary; item logs track output`;
  }
};

const roleSummaryFor = (role) => {
  if (role === "cutter") {
    return "App login: current customer orders and measurements for cutting.";
  }
  if (role === "stitcher") {
    return "App login: assigned stitching work, completed items, and earnings.";
  }
  return "Owner-managed staff record and work ledger.";
};

function StaffCard({ staff, onEdit, onDelete, onLogWork, onViewLedger, onPreview }) {
  const { t } = useLanguage();
  const isActive = staff.is_active !== false && staff.active !== false;
  const roleLabel = t(STAFF_ROLES.find((role) => role.id === staff.role)?.id || staff.role);
  const payRate = staff.pay_rate ?? staff.salary ?? 0;

  return (
    <MotiView
      animate={{ opacity: 1, translateX: 0 }}
      from={{ opacity: 0, translateX: -20 }}
      transition={{ duration: 300, type: "timing" }}>

      <AppCard style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={styles.staffAvatar}>
            <Text style={styles.staffAvatarText}>
              {staff.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.staffName}>{staff.name}</Text>
            <Text style={styles.staffPhone}>{staff.phone || t("noPhone")}</Text>
          </View>
          <View
            style={[
            styles.statusDot,
            {
              backgroundColor: isActive ?
              colors123.success :
              colors123.textMuted
            }]
            } />

        </View>

        <View style={styles.staffMeta}>
          <View style={styles.staffRole}>
            <MaterialCommunityIcons
              name={staff.role === "cutter" ? "content-cut" : "needle"}
              size={14}
              color={colors123.primary} />

            <Text style={styles.staffRoleText}>
              {roleLabel} app access
            </Text>
          </View>
          <View style={styles.staffRole}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={14}
              color={colors123.primary} />

            <Text style={styles.staffRoleText}>
              {paymentTypeLabel(staff.payment_type, t)} - {money(payRate)}
            </Text>
          </View>
        </View>

        <Text style={styles.staffAccessText}>{roleSummaryFor(staff.role)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{t("thisMonth")}</Text>
            <Text style={styles.statValue}>
              {money(staff.current_month_earnings)}
            </Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{t("entries")}</Text>
            <Text style={styles.statValue}>
              {Number(staff.work_entries_count || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.staffActions}>
          <Pressable accessibilityRole="button"
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onPreview(staff)}>

            <MaterialCommunityIcons
              name={staff.role === "cutter" ? "eye-outline" : "clipboard-list-outline"}
              size={16}
              color={colors123.primary} />

            <Text style={styles.actionButtonText}>View</Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(staff)}>

            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={colors123.primary} />

            <Text style={styles.actionButtonText}>{t("edit")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onLogWork(staff)}>

            <MaterialCommunityIcons
              name="needle"
              size={16}
              color={colors123.primary} />

            <Text style={styles.actionButtonText}>{t("work")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onViewLedger(staff)}>

            <MaterialCommunityIcons
              name="clipboard-text-clock-outline"
              size={16}
              color={colors123.primary} />

            <Text style={styles.actionButtonText}>{t("ledger")}</Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={[styles.actionIconButton, styles.deleteButton]}
            onPress={() => onDelete(staff)}>

            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color={colors123.danger} />

          </Pressable>
        </View>
      </AppCard>
    </MotiView>);

}

export default function StaffScreen() {const { t } = useLanguage();
  const { staffError } = useStitchPro();
  const {
    staff,
    staffLoading,
    staffWorkLogs,
    staffSummaries,
    orders,
    fetchStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    fetchOrders,
    addStaffWorkLog,
    fetchStaffWorkLogs,
    fetchStaffSummary,
    deleteStaffWorkLog
  } = useStitchPro();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [workStaff, setWorkStaff] = useState(null);
  const [ledgerStaff, setLedgerStaff] = useState(null);
  const [previewStaff, setPreviewStaff] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "cutter",
    access_role: "cutter",
    can_login: true,
    payment_type: "monthly",
    pay_rate: ""
  });
  const [workForm, setWorkForm] = useState({
    order_id: "",
    order_number: "",
    item_name: "",
    item_type: "",
    quantity: "1",
    work_date: today(),
    status: "completed",
    notes: ""
  });

  const selectedOrder = useMemo(
    () =>
    orders.find((order) => String(order.id) === String(workForm.order_id)),
    [orders, workForm.order_id]
  );

  const selectedItem = useMemo(() => {
    const items = selectedOrder?.items || [];
    return items.find((item) => orderItemLabel(item) === workForm.item_name);
  }, [selectedOrder, workForm.item_name]);

  const calculatedAmount = useMemo(() => {
    if (!workStaff) return 0;
    const quantity = Number(workForm.quantity || 1);
    const rate = payRateFor(workStaff);
    if (workStaff.payment_type === "per_piece") {
      return quantity * rate;
    }
    if (workStaff.payment_type === "commission") {
      const basePrice = itemPrice(selectedItem);
      return basePrice * quantity * rate / 100;
    }
    if (workStaff.payment_type === "daily") {
      const existingLogs = staffWorkLogs[workStaff.id] || [];
      const alreadyCounted = existingLogs.some(
        (log) => log.work_date === workForm.work_date && Number(log.amount) > 0
      );
      return alreadyCounted ? 0 : rate;
    }
    return 0;
  }, [
  staffWorkLogs,
  selectedItem,
  workForm.quantity,
  workForm.work_date,
  workStaff,
  workStaff?.payment_type,
  workStaff?.id]
  );

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
      fetchOrders();
    }, [fetchOrders, fetchStaff])
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchStaff(), fetchOrders({ force: true })]);
  }, [fetchOrders, fetchStaff]);

  const resetStaffForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      role: "cutter",
      access_role: "cutter",
      can_login: true,
      payment_type: "monthly",
      pay_rate: ""
    });
  };

  const handleSaveStaff = async () => {
    if (!formData.name.trim()) {
      showToast(t("auto_enter_staff_name"), "error");
      return;
    }
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      showToast(t("auto_enter_valid_10_digit_phone"), "error");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(t("staffEmailRequired"), "error");
      return;
    }
    // Owner sets the first password when adding staff; staff can reset it later
    // with "Forgot password" on the login screen.
    const password = formData.password;
    if (!editingId && (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))) {
      showToast(t("staffPasswordRule"), "error");
      return;
    }

    const payRate = Number(formData.pay_rate || 0);
    const payload = {
      name: formData.name.trim(),
      phone: phone || undefined,
      email,
      role: formData.role,
      access_role: formData.access_role,
      can_login: true,
      access_scope:
        formData.role === "cutter"
          ? "orders_measurements"
          : "assigned_work_earnings",
      payment_type: formData.payment_type,
      pay_rate: payRate,
      salary: formData.payment_type === "monthly" ? payRate : undefined,
      is_active: true,
      ...(editingId ? {} : { password })
    };

    try {
      if (editingId) {
        await updateStaff(editingId, payload);
        showToast(`${formData.name} updated`, "success");
      } else {
        await addStaff(payload);
        showToast(`${formData.name} added to staff`, "success");
      }
      resetStaffForm();
      setShowForm(false);
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message;
      showToast(
        err.code === "SUBSCRIPTION_REQUIRED"
          ? err.message
          : backendMessage || "Failed to save staff",
        "error"
      );
    }
  };

  const handleEditStaff = (staffMember) => {
    setEditingId(staffMember.id);
    setFormData({
      name: staffMember.name || "",
      phone: staffMember.phone || "",
      email: staffMember.email || "",
      role: staffMember.role || "stitcher",
      access_role: staffMember.access_role || staffMember.role || "stitcher",
      can_login: true,
      payment_type: staffMember.payment_type || "monthly",
      pay_rate: String(staffMember.pay_rate ?? staffMember.salary ?? "")
    });
    setShowForm(true);
    setWorkStaff(null);
  };

  const handleDeleteStaff = (staffMember) => {
    Alert.alert(t("auto_remove_staff"),

    `Are you sure you want to remove ${staffMember.name}?`,
    [
    { text: "Cancel", style: "cancel" },
    {
      text: "Remove",
      style: "destructive",
      onPress: async () => {
        try {
          await deleteStaff(staffMember.id);
          showToast(`${staffMember.name} removed`, "success");
        } catch (err) {
          showToast(
            err.code === "SUBSCRIPTION_REQUIRED"
              ? err.message
              : err.response?.data?.message || t("auto_failed_to_remove_staff"),
            "error"
          );
        }
      }
    }]

    );
  };

  const openWorkForm = (staffMember) => {
    setWorkStaff(staffMember);
    setLedgerStaff(null);
    setWorkForm({
      order_id: "",
      order_number: "",
      item_name: "",
      item_type: "",
      quantity: "1",
      work_date: today(),
      status: "completed",
      notes: ""
    });
    setShowForm(false);
    fetchStaffWorkLogs(staffMember.id).catch(() => {});
  };

  const openLedger = async (staffMember) => {
    try {
      setLedgerStaff(staffMember);
      setWorkStaff(null);
      setLedgerSearch("");
      await Promise.all([
      fetchStaffWorkLogs(staffMember.id),
      fetchStaffSummary(staffMember.id)]
      );
    } catch (err) {
      showToast(t("auto_failed_to_load_staff_ledger"), "error");
    }
  };

  const openStaffPreview = async (staffMember) => {
    setPreviewStaff(staffMember);
    setWorkStaff(null);
    setLedgerStaff(null);
    fetchStaffWorkLogs(staffMember.id).catch(() => {});
    fetchStaffSummary(staffMember.id).catch(() => {});
  };

  const handleSelectOrder = (order) => {
    setWorkForm({
      ...workForm,
      order_id: order.id,
      order_number: orderLabel(order),
      item_name: "",
      item_type: ""
    });
  };

  const handleSelectItem = (item) => {
    const label = orderItemLabel(item);
    setWorkForm({
      ...workForm,
      item_name: label,
      item_type: item.type_category || item.itemType || item.type || "",
      quantity: String(item.quantity || workForm.quantity || 1)
    });
  };

  const handleSaveWork = async () => {
    if (!workStaff) return;
    if (!workForm.item_name.trim()) {
      showToast(t("auto_enter_stitched_item"), "error");
      return;
    }
    if (Number(workForm.quantity || 0) <= 0) {
      showToast(t("auto_enter_valid_quantity"), "error");
      return;
    }
    if (
    workStaff.payment_type === "commission" &&
    itemPrice(selectedItem) <= 0)
    {
      showToast(t("auto_select_an_order_item_with_price_for_commissi"), "error");
      return;
    }

    try {
      await addStaffWorkLog(workStaff.id, {
        order_id: workForm.order_id || undefined,
        order_number: workForm.order_number || undefined,
        item_name: workForm.item_name.trim(),
        item_type: workForm.item_type || undefined,
        item_price: selectedItem ? itemPrice(selectedItem) : undefined,
        quantity: Number(workForm.quantity || 1),
        work_date: workForm.work_date || today(),
        status: workForm.status,
        notes: workForm.notes.trim() || undefined
      });
      showToast(`Work added for ${workStaff.name}`, "success");
      openLedger(workStaff);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to record work",
        "error"
      );
    }
  };

  const handleDeleteWorkLog = (log) => {
    if (!ledgerStaff) return;
    Alert.alert(t("auto_delete_work_entry"),

    `Delete ${log.item_name} from ${ledgerStaff.name}'s ledger?`,
    [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await deleteStaffWorkLog(ledgerStaff.id, log.id);
          showToast(t("auto_work_entry_deleted"), "success");
        } catch (err) {
          showToast(t("auto_failed_to_delete_work_entry"), "error");
        }
      }
    }]

    );
  };

  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const renderWorkflowGuide = () =>
    <AppCard style={styles.workflowCard}>
      <Text style={styles.workflowTitle}>Staff workflow</Text>
      <Text style={styles.workflowSubtitle}>
        Set a login email and password so staff can sign in. A mobile number is optional.
      </Text>
      <View style={styles.workflowGrid}>
        {PRIMARY_STAFF_ROLES.map((role) =>
          <View key={role.id} style={styles.workflowItem}>
            <View style={styles.workflowIcon}>
              <MaterialCommunityIcons name={role.icon} size={18} color={colors123.primary} />
            </View>
            <Text style={styles.workflowItemTitle}>{role.title}</Text>
            <Text style={styles.workflowItemText}>{role.summary}</Text>
          </View>
        )}
      </View>
      <View style={styles.ownerTrackStrip}>
        <MaterialCommunityIcons name="account-tie-outline" size={18} color={colors123.primary} />
        <Text style={styles.ownerTrackText}>
          Owner view: all staff, assigned work, completed work, customer/order links and earnings ledger.
        </Text>
      </View>
    </AppCard>;

  const renderStaffForm = () =>
  <AppCard style={styles.formCard}>
      <Text style={styles.formTitle}>
        {editingId ? "Edit Staff" : "Add New Staff"}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("auto_name")}</Text>
        <View style={styles.input}>
          <MaterialCommunityIcons
          name="account"
          size={18}
          color={colors123.primary} />

          <TextInput accessibilityLabel={t("auto_enter_name")}
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder={t("auto_enter_staff_name")}
          placeholderTextColor={colors123.textMuted}
          returnKeyType="next" />

        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("staffLoginEmail")}</Text>
        <View style={styles.input}>
          <MaterialCommunityIcons
          name="email-outline"
          size={18}
          color={colors123.primary} />

          <TextInput accessibilityLabel={t("enterStaffEmail")}
          style={styles.textInput}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder={t("enterStaffEmail")}
          placeholderTextColor={colors123.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next" />

        </View>
      </View>

      {!editingId &&
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("staffLoginPassword")}</Text>
        <View style={styles.input}>
          <MaterialCommunityIcons
          name="lock-outline"
          size={18}
          color={colors123.primary} />

          <TextInput accessibilityLabel={t("staffLoginPassword")}
          style={styles.textInput}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          placeholder={t("staffPasswordRule")}
          placeholderTextColor={colors123.textMuted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next" />

        </View>
        <Text style={styles.helpText}>{t("staffLoginHelp")}</Text>
      </View>
      }

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("auto_phone")} {t("optional")}</Text>
        <View style={styles.input}>
          <MaterialCommunityIcons
          name="phone"
          size={18}
          color={colors123.primary} />

          <TextInput accessibilityLabel={t("auto_enter_phone")}
          style={styles.textInput}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder={t("enterPhoneNumber")}
          placeholderTextColor={colors123.textMuted}
          keyboardType="phone-pad"
          returnKeyType="done" />

        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("auto_role")}</Text>
        <View style={styles.accessRoleGrid}>
          {PRIMARY_STAFF_ROLES.map((role) => {
            const selected = formData.role === role.id;
            return (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: Boolean(selected) }}
                key={role.id}
                style={[styles.accessRoleCard, selected && styles.accessRoleCardActive]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    role: role.id,
                    access_role: role.id,
                    can_login: true,
                  })
                }>
                <View style={styles.accessRoleHeader}>
                  <View style={[styles.accessRoleIcon, selected && styles.accessRoleIconActive]}>
                    <MaterialCommunityIcons
                      name={role.icon}
                      size={19}
                      color={selected ? colors123.surface : colors123.primary}
                    />
                  </View>
                  <Text style={[styles.accessRoleTitle, selected && styles.roleButtonTextActive]}>
                    {role.title}
                  </Text>
                </View>
                <Text style={styles.accessRoleSummary}>{role.summary}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.helpText}>
          Staff access is limited by role. Owner keeps full tracking for orders, work and earnings.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t("auto_payment_basis")}</Text>
        <ResponsiveGrid style={styles.paymentGrid}>
          {PAYMENT_TYPES.map((type) =>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: Boolean(formData.payment_type === type.id) }}
          key={type.id}
          style={[
          styles.paymentButton,
          formData.payment_type === type.id && styles.roleButtonActive]
          }
          onPress={() =>
          setFormData({ ...formData, payment_type: type.id })
          }>

              <MaterialCommunityIcons
            name={type.icon}
            size={18}
            color={
            formData.payment_type === type.id ?
            colors123.primary :
            colors123.textMuted
            } />

              <Text
            style={[
            styles.roleButtonText,
            formData.payment_type === type.id &&
            styles.roleButtonTextActive]
            }>

                {t(type.labelKey)}
              </Text>
            </Pressable>
        )}
        </ResponsiveGrid>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {formData.payment_type === "commission" ? "Commission %" : "Pay Rate"}
        </Text>
        <View style={styles.input}>
          <MaterialCommunityIcons
          name="cash"
          size={18}
          color={colors123.primary} />

          <TextInput accessibilityLabel={
          formData.payment_type === "commission" ?
          t("enterCommissionRate") :
          t("enterPayRate")
          }
          style={styles.textInput}
          value={formData.pay_rate}
          onChangeText={(text) =>
          setFormData({ ...formData, pay_rate: text })
          }
          placeholder={
          formData.payment_type === "commission" ?
          t("enterCommissionRate") :
          t("enterPayRate")
          }
          placeholderTextColor={colors123.textMuted}
          keyboardType="numeric" />

        </View>
      </View>

      <View style={styles.formActions}>
        <Pressable accessibilityRole="button"
        style={styles.cancelButton}
        onPress={() => {
          resetStaffForm();
          setShowForm(false);
        }}>

          <Text style={styles.cancelButtonText}>{t("auto_cancel")}</Text>
        </Pressable>
        <AppButton
        label={editingId ? "Save Changes" : "Add Staff"}
        onPress={handleSaveStaff}
        style={{ flex: 1 }} />

      </View>
    </AppCard>;

  const renderWorkForm = () => {
    if (!workStaff) return null;
    const orderItems = selectedOrder?.items || [];

    return (
      <AppCard style={styles.formCard}>
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.formTitle}>{t("auto_log_work")}</Text>
            <Text style={styles.sheetSubtitle}>{workStaff.name}</Text>
          </View>
          <Pressable accessibilityRole="button"
            style={styles.closeButton}
            onPress={() => setWorkStaff(null)}>

            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors123.text} />

          </Pressable>
        </View>

        {orders.length > 0 &&
        <View style={styles.formGroup}>
            <Text style={styles.label}>{t("auto_order_2")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {orders.slice(0, 12).map((order) =>
              <Pressable accessibilityRole="button" accessibilityState={{ selected: Boolean(String(workForm.order_id) === String(order.id)) }}
                key={order.id}
                style={[
                styles.orderChip,
                String(workForm.order_id) === String(order.id) &&
                styles.roleButtonActive]
                }
                onPress={() => handleSelectOrder(order)}>

                    <Text
                  style={[
                  styles.orderChipText,
                  String(workForm.order_id) === String(order.id) &&
                  styles.roleButtonTextActive]
                  }>

                      {orderLabel(order)}
                    </Text>
                  </Pressable>
              )}
              </View>
            </ScrollView>
          </View>
        }

        {orderItems.length > 0 &&
        <View style={styles.formGroup}>
            <Text style={styles.label}>{t("auto_item")}</Text>
            <View style={styles.roleOptions}>
              {orderItems.map((item, index) => {
              const label = orderItemLabel(item);
              return (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: Boolean(workForm.item_name === label) }}
                  key={`${label}-${index}`}
                  style={[
                  styles.roleButton,
                  workForm.item_name === label && styles.roleButtonActive]
                  }
                  onPress={() => handleSelectItem(item)}>

                    <Text
                    style={[
                    styles.roleButtonText,
                    workForm.item_name === label &&
                    styles.roleButtonTextActive]
                    }>

                      {label}
                    </Text>
                  </Pressable>);

            })}
            </View>
          </View>
        }

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("auto_stitched_item")}</Text>
          <View style={styles.input}>
            <MaterialCommunityIcons
              name="hanger"
              size={18}
              color={colors123.primary} />

            <TextInput accessibilityLabel={t("auto_shirt_pant_blouse")}
              style={styles.textInput}
              value={workForm.item_name}
              onChangeText={(text) =>
              setWorkForm({ ...workForm, item_name: text })
              }
              placeholder={t("auto_shirt_pant_blouse")}
              placeholderTextColor={colors123.textMuted} />

          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t("auto_qty")}</Text>
            <View style={styles.input}>
              <TextInput
                style={[styles.textInput, { marginLeft: 0 }]}
                value={workForm.quantity}
                onChangeText={(text) =>
                setWorkForm({ ...workForm, quantity: text })
                }
                keyboardType="numeric" />

            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t("auto_work_date")}</Text>
            <View style={styles.input}>
              <TextInput accessibilityLabel={t("auto_yyyy_mm_dd")}
                style={[styles.textInput, { marginLeft: 0 }]}
                value={workForm.work_date}
                onChangeText={(text) =>
                setWorkForm({ ...workForm, work_date: text })
                }
                placeholder={t("auto_yyyy_mm_dd")}
                placeholderTextColor={colors123.textMuted} />

            </View>
          </View>
        </View>

        <View style={styles.payRuleBox}>
          <View style={styles.payRuleIcon}>
            <MaterialCommunityIcons
              name="calculator-variant-outline"
              size={18}
              color={colors123.primary} />

          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.payRuleTitle}>{t("auto_auto_pay_rule")}</Text>
            <Text style={styles.payRuleText}>{payRuleText(workStaff)}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("auto_status")}</Text>
          <View style={styles.roleOptions}>
            {WORK_STATUSES.map((status) =>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: Boolean(workForm.status === status.id) }}
              key={status.id}
              style={[
              styles.roleButton,
              workForm.status === status.id && styles.roleButtonActive]
              }
              onPress={() => setWorkForm({ ...workForm, status: status.id })}>

                <Text
                style={[
                styles.roleButtonText,
                workForm.status === status.id &&
                styles.roleButtonTextActive]
                }>

                  {t(status.labelKey)}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.earningsPreview}>
          <Text style={styles.statLabel}>{t("auto_auto_calculated_pay")}</Text>
          <Text style={styles.previewAmount}>{money(calculatedAmount)}</Text>
        </View>

        <AppButton label={t("auto_save_work_entry")} onPress={handleSaveWork} />
      </AppCard>);

  };

  const renderLedger = () => {
    if (!ledgerStaff) return null;
    const logs = staffWorkLogs[ledgerStaff.id] || [];
    const searchText = ledgerSearch.trim().toLowerCase();
    const visibleLogs = searchText ?
    logs.filter((log) =>
    [
    log.item_name,
    log.order_number,
    log.customer_name,
    log.work_date,
    log.status].

    filter(Boolean).
    some((value) => String(value).toLowerCase().includes(searchText))
    ) :
    logs;
    const summary = staffSummaries[ledgerStaff.id] || {};

    return (
      <AppCard style={styles.formCard}>
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.formTitle}>{t("auto_staff_ledger")}</Text>
            <Text style={styles.sheetSubtitle}>{ledgerStaff.name}</Text>
          </View>
          <Pressable accessibilityRole="button"
            style={styles.closeButton}
            onPress={() => setLedgerStaff(null)}>

            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors123.text} />

          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{t("auto_earned")}</Text>
            <Text style={styles.statValue}>{money(summary.total_amount)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{t("auto_unpaid")}</Text>
            <Text style={styles.statValue}>{money(summary.unpaid_amount)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{t("auto_items")}</Text>
            <Text style={styles.statValue}>
              {Number(summary.total_quantity || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors123.textMuted} />

          <TextInput accessibilityLabel={t("auto_search_item_order_date_status")}
            style={styles.searchInput}
            value={ledgerSearch}
            onChangeText={setLedgerSearch}
            placeholder={t("auto_search_item_order_date_status")}
            placeholderTextColor={colors123.textMuted} />

          {ledgerSearch.length > 0 &&
          <Pressable accessibilityRole="button" onPress={() => setLedgerSearch("")}>
              <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors123.textMuted} />

            </Pressable>
          }
        </View>

        {logs.length === 0 ?
        <Text style={styles.emptyLedgerText}>{t("auto_no_work_entries_yet")}</Text> :
        visibleLogs.length === 0 ?
        <Text style={styles.emptyLedgerText}>{t("auto_no_matching_entries")}</Text> :

        <View style={styles.logList}>
            {visibleLogs.map((log) =>
          <View key={log.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logItem}>{log.item_name}</Text>
                  <Text style={styles.logMeta}>
                    {log.order_number || "Manual"}{t("auto_qty_2")}{log.quantity} -{" "}
                    {log.work_date}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.logAmount}>{money(log.amount)}</Text>
                  <Text style={styles.logStatus}>{log.status}</Text>
                </View>
                <Pressable accessibilityRole="button"
              style={styles.logDeleteButton}
              onPress={() => handleDeleteWorkLog(log)}>

                  <MaterialCommunityIcons
                name="trash-can-outline"
                size={16}
                color={colors123.danger} />

                </Pressable>
              </View>
          )}
          </View>
        }
      </AppCard>);

  };

  const renderStaffPreview = () => {
    if (!previewStaff) return null;
    const logs = staffWorkLogs[previewStaff.id] || [];
    const summary = staffSummaries[previewStaff.id] || {};
    const isCutter = previewStaff.role === "cutter";
    const assignedRows = (orders || []).flatMap((order) =>
      (order.items || []).flatMap((item, index) => {
        const assignedId = isCutter
          ? item.cutter_staff_id || item.cutterStaffId || item.assigned_cutter_id
          : item.stitcher_staff_id || item.stitcherStaffId || item.assigned_stitcher_id;
        if (String(assignedId) !== String(previewStaff.id)) return [];
        return [{
          key: `${order.id}-${index}`,
          order,
          item,
        }];
      })
    );

    return (
      <AppCard style={styles.formCard}>
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.formTitle}>
              {isCutter ? "Cutter app view" : "Stitcher app view"}
            </Text>
            <Text style={styles.sheetSubtitle}>{previewStaff.name}</Text>
          </View>
          <Pressable accessibilityRole="button"
            style={styles.closeButton}
            onPress={() => setPreviewStaff(null)}>

            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors123.text} />

          </Pressable>
        </View>

        <Text style={styles.previewHint}>
          {isCutter
            ? "Cutter sees only current customer order details and measurements needed for cutting."
            : "Stitcher sees assigned stitching work, completed work and earnings."}
        </Text>

        {!isCutter &&
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Earning</Text>
            <Text style={styles.statValue}>{money(summary.total_amount)}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Items</Text>
            <Text style={styles.statValue}>{Number(summary.total_quantity || logs.length || 0)}</Text>
          </View>
        </View>
        }

        {assignedRows.length === 0 ?
        <Text style={styles.emptyLedgerText}>
          {isCutter ? "No cutting orders assigned yet." : "No stitching orders assigned yet."}
        </Text> :
        <View style={styles.previewList}>
          {assignedRows.map(({ key, order, item }) => {
            const measurement =
              item.measurementData ||
              item.measurement_data ||
              item.measurementSnapshot?.measurementsData ||
              {};
            const measurementEntries = getMeasurementEntries(measurement).slice(0, isCutter ? 4 : 2);
            return (
              <View key={key} style={styles.previewOrderCard}>
                <View style={styles.previewOrderTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewOrderTitle}>
                      {order.customer_name || order.customerName || order.customer?.name || "Customer"}
                    </Text>
                    <Text style={styles.previewOrderMeta}>
                      {order.order_number || `Order #${order.id}`} · {item.typeLabel || item.type || item.item_name || "Item"}
                    </Text>
                  </View>
                  <Text style={styles.previewDue}>
                    {order.deliveryDate || order.delivery_date || "No date"}
                  </Text>
                </View>
                {isCutter && measurementEntries.length > 0 ?
                <ResponsiveGrid style={styles.previewMeasurementGrid}>
                  {measurementEntries.map(([label, value]) =>
                    <View key={label} style={styles.previewMeasurementTile}>
                      <Text style={styles.previewMeasurementLabel}>{label}</Text>
                      <Text style={styles.previewMeasurementValue}>{value}</Text>
                    </View>
                  )}
                </ResponsiveGrid> :
                null}
              </View>
            );
          })}
        </View>
        }

        {!isCutter && logs.length > 0 ?
        <View style={styles.previewList}>
          <Text style={styles.versionListTitle}>Completed work</Text>
          {logs.slice(0, 5).map((log) =>
            <View key={log.id} style={styles.logRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.logItem}>{log.item_name}</Text>
                <Text style={styles.logMeta}>{log.order_number || "Manual"} · Qty {log.quantity}</Text>
              </View>
              <Text style={styles.logAmount}>{money(log.amount)}</Text>
            </View>
          )}
        </View> :
        null}
      </AppCard>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
      <RefreshControl
        refreshing={staffLoading}
        onRefresh={onRefresh}
        tintColor={colors123.primary} />

      }>


<InlineAlert message={staffError ? t("loadStaffFailed") : null} onRetry={onRefresh} retryLabel={t("retry")} />
      <AppButton label={showWorkflowGuide ? "Hide staff guide" : "How staff access works"} variant="ghost" icon={showWorkflowGuide ? "chevron-up" : "chevron-down"} onPress={() => setShowWorkflowGuide(value => !value)} />
      {showWorkflowGuide && renderWorkflowGuide()}

      {!showForm ?
      <AppButton
        label={t("auto_add_staff_member")}
        onPress={() => {
          resetStaffForm();
          setShowForm(true);
          setWorkStaff(null);
          setLedgerStaff(null);
        }}
        style={styles.addButton} /> :

      renderStaffForm()
      }

      {renderWorkForm()}
      {renderStaffPreview()}
      {renderLedger()}

      {staffLoading && !staff.length ? <ListSkeleton /> : staffError && !staff.length ? null : staff.length === 0 ?
      <EmptyState
        icon="account-group-outline"
        title={t("auto_no_staff_members")}
        description={t("auto_add_team_members_to_delegate_tasks_and_manag")} /> :

      <FlatList
        data={staff}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) =>
        <StaffCard
          staff={item}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onLogWork={openWorkForm}
          onViewLedger={openLedger}
          onPreview={openStaffPreview} />

        } />

      }
    </ScrollView>);

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
    marginBottom: spacing.sm,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  workflowCard: {
    gap: spacing.sm,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  workflowTitle: {
    fontSize: 17,
    fontFamily: fonts.extrabold,
    color: colors123.text,
  },
  workflowSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  workflowGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  workflowItem: {
    flex: 1,
    minHeight: 112,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    padding: spacing.sm,
  },
  workflowIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
    marginBottom: spacing.xs,
  },
  workflowItemTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.text,
  },
  workflowItemText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors123.textMuted,
  },
  ownerTrackStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors123.primarySoft,
    padding: spacing.sm,
  },
  ownerTrackText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 18,
    color: colors123.primaryDark,
  },
  previewHint: {
    marginBottom: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors123.textMuted,
  },
  previewList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  previewOrderCard: {
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    padding: spacing.md,
  },
  previewOrderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  previewOrderTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors123.text,
  },
  previewOrderMeta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  previewDue: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors123.primary,
  },
  previewMeasurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  previewMeasurementTile: {
    width: "100%",
    borderRadius: radius.md,
    backgroundColor: colors123.surfaceMuted,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  previewMeasurementLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors123.textMuted,
  },
  previewMeasurementValue: {
    marginTop: 2,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: colors123.text,
  },
  versionListTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: colors123.text,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginBottom: spacing.xs,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sheetSubtitle: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.surfaceMuted,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors123.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors123.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
  },
  textInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors123.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    padding: 0,
  },
  twoColumn: {
    flexDirection: "row",
    gap: spacing.md,
  },
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  accessRoleGrid: {
    gap: spacing.sm,
  },
  accessRoleCard: {
    borderWidth: 1,
    borderColor: colors123.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors123.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  accessRoleCardActive: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primarySoft,
  },
  accessRoleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  accessRoleIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
  },
  accessRoleIconActive: {
    backgroundColor: colors123.primary,
  },
  accessRoleTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors123.text,
  },
  accessRoleSummary: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors123.textMuted,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  paymentButton: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  orderChip: {
    maxWidth: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors123.borderLight,
    backgroundColor: colors123.surface,
  },
  orderChipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  roleButtonActive: {
    backgroundColor: colors123.primarySoft,
    borderColor: colors123.primary,
  },
  roleButtonText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  roleButtonTextActive: {
    color: colors123.primary,
  },
  formActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors123.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  staffCard: {
    padding: spacing.md,
  },
  staffHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors123.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  staffAvatarText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors123.primary,
  },
  staffName: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  staffPhone: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  staffMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  staffAccessText: {
    marginBottom: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors123.textMuted,
  },
  staffRole: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors123.primarySoft,
    borderRadius: radius.sm,
  },
  staffRoleText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statPill: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors123.bgInput,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
  },
  statValue: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors123.text,
    marginTop: 2,
  },
  staffActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionIconButton: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  editButton: {
    borderColor: colors123.primary,
    backgroundColor: colors123.primarySoft,
  },
  deleteButton: {
    borderColor: colors123.danger,
    backgroundColor: colors123.dangerSoft || "#FFEBEE",
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.primary,
  },
  earningsPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors123.primarySoft,
    marginBottom: spacing.md,
  },
  payRuleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors123.bgInput,
    marginBottom: spacing.md,
  },
  payRuleIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors123.primarySoft,
  },
  payRuleTitle: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  payRuleText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginTop: spacing.xs,
  },
  previewAmount: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors123.primary,
  },
  emptyLedgerText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors123.bgInput,
  },
  searchInput: {
    flex: 1,
    color: colors123.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    padding: 0,
  },
  logList: {
    gap: spacing.sm,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors123.border,
  },
  logItem: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors123.text,
  },
  logMeta: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors123.textMuted,
    marginTop: 2,
  },
  logAmount: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors123.text,
  },
  logStatus: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors123.textMuted,
    textTransform: "capitalize",
    marginTop: 2,
  },
  logDeleteButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors123.dangerSoft || "#FFEBEE",
  },
});

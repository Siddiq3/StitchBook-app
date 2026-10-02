
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback } from
"react";
import { authService } from "../services/authService";
import { storage } from "../services/storage";
import {
  shopApi,
  customerApi,
  orderApi,
  measurementApi,
  dashboardApi,
  paymentApi,
  activityApi,
  staffApi,
  notificationApi,
  uploadApi,
  invoiceApi,
  galleryApi,
  subscriptionApi } from
"../services/api";

const StitchProContext = createContext(null);

const SUBSCRIPTION_REQUIRED_MESSAGE =
"Your StitchBook plan is not active.";

export const useStitchPro = () => {
  const ctx = useContext(StitchProContext);
  if (!ctx) throw new Error("useStitchPro must be inside StitchProProvider");
  return ctx;
};

const INITIAL = {
  // Auth
  isBooting: true,
  isAuthenticated: false,
  user: null,
  token: null,
  shop: null,
  shopError: null,
  subscriptionState: "idle",
  authError: null,

  // Customers
  customers: [],
  customersLoading: false,
  customersError: null,
  customersPagination: { page: 1, limit: 20, total: 0 },

  // Orders
  orders: [],
  ordersLoading: false,
  ordersError: null,
  ordersPagination: { page: 1, limit: 20, total: 0 },

  // Measurements
  measurements: [],
  measurementsLoading: false,
  measurementsError: null,

  // Dashboard
  dashboardStats: null,
  dashboardLoading: false,
  dashboardError: null,
  dashboardPeriod: "month",

  // Subscription
  subscription: null,
  subscriptionLoading: false,
  subscriptionError: null,

  // Staff
  staff: [],
  staffLoading: false,
  staffError: null,
  staffWorkLogs: {},
  staffSummaries: {},

  // Notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
  notificationCount: 0,

  // Payments
  payments: [],
  paymentsLoading: false,

  // Activity Logs
  activityLogs: [],
  activityLoading: false
};

export const StitchProProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL);

  // Safe updater — always spreads previous state
  const set = useCallback((updates) => {
    setState((prev) => {
      const resolved = typeof updates === "function" ? updates(prev) : updates;
      const next = { ...prev, ...resolved };












      return next;
    });
  }, []);

  // ════════════════════════════════════════
  // BOOT — runs once on app start
  // ════════════════════════════════════════

  useEffect(() => {
    bootApp();
  }, []);

  const bootApp = async () => {

    try {
      const session = await authService.restoreSession();

      if (!session || !session.token) {

        set({ isBooting: false });
        return;
      }


      set({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        shop: session.shop || null
      });

      // Fetch shop to decide: onboarding or main app
      await fetchShopSilently();
      await fetchSubscription().catch(() => {});
    } catch (err) {

      set({ authError: "Could not restore your account. Please try again.", isAuthenticated: false });
    } finally {
      set({ isBooting: false });

    }
  };

  // ════════════════════════════════════════
  // SHOP — fetch silently after login/boot
  // ════════════════════════════════════════

  const fetchShopSilently = async () => {

    set({ shopError: null });
    try {
      const res = await shopApi.get();
      const shop = res.data.data;

      await storage.saveShop(shop);
      set({ shop });
    } catch (err) {
      const code = err.response?.data?.error?.code;


      if (code === "SHOP_NOT_FOUND") {

        set({ shop: null });
      } else {
        set({ shopError: "Could not load your shop. Check your connection and try again." });
      }
    }
  };

  // ════════════════════════════════════════
  // AUTH ACTIONS
  // ════════════════════════════════════════

  const completeLogin = async (authPromise, label) => {

    set({ authError: null });

    try {
      const result = await authPromise;
      const { token, refreshToken, user } = result;



      // CRITICAL: set isAuthenticated FIRST
      set({
        user,
        token,
        isAuthenticated: true,
        authError: null
      });



      // Then fetch shop
      await fetchShopSilently();
      await fetchSubscription().catch(() => {});


    } catch (err) {
      const message =
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      err.response?.data?.error ||
      err.message ||
      "Login failed";










      set({
        authError: message,
        isAuthenticated: false
      });
      throw err;
    }
  };

  const registerWithPassword = async (data) => {
    return completeLogin(authService.registerWithPassword(data), "password signup");
  };

  const loginWithPassword = async (identifier, password) => {
    return completeLogin(authService.loginWithPassword(identifier, password), "password");
  };

  const setPassword = async (currentPassword, newPassword) => {
    const result = await authService.setPassword(currentPassword, newPassword);
    if (result?.user) set({ user: result.user });
    return result;
  };

  const loginWithGoogle = async (idToken) => {
    return completeLogin(authService.loginWithGoogle(idToken), "Google");
  };

  const loginWithMsg91Widget = async (accessToken) => {
    return completeLogin(authService.loginWithMsg91Widget(accessToken), "mobile OTP");
  };

  const sendMsg91MobileOtp = async (identifier) => {
    return authService.sendMsg91MobileOtp(identifier);
  };

  const loginWithMsg91MobileOtp = async (reqId, otp) => {
    return completeLogin(authService.loginWithMsg91MobileOtp(reqId, otp), "mobile OTP");
  };

  const updateAuthenticatedUser = async (user) => {
    if (!user) return;
    await storage.setUser(user);
    set({ user });
  };

  const logout = async () => {

    await authService.logout();
    // Reset to initial but keep isBooting false
    setState({ ...INITIAL, isBooting: false });

  };

  // ════════════════════════════════════════
  // SHOP ACTIONS
  // ════════════════════════════════════════

  const createShop = async ({ name, phone, location }) => {
    const res = await shopApi.create({ name, phone, location });
    const shop = res.data.data;
    await storage.saveShop(shop);
    set({ shop });
    // Navigator auto-switches to MainTabNavigator
  };

  const updateShop = async (data) => {
    const res = await shopApi.update(data);
    const shop = res.data.data;
    await storage.saveShop(shop);
    set({ shop });
  };

  // ════════════════════════════════════════
  // SUBSCRIPTION ACTIONS
  // ════════════════════════════════════════

  const fetchSubscription = useCallback(async () => {
    set({ subscriptionLoading: true, subscriptionError: null, subscriptionState: "loading" });
    try {
      const res = await subscriptionApi.getStatus();
      const subscription = res.data?.data || res.data;
      set({ subscription, subscriptionLoading: false, subscriptionState: "ready" });
      return subscription;
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        set({ subscription: null, subscriptionLoading: false, subscriptionState: "ready" });
        return null;
      }

      set({ subscription: null, subscriptionLoading: false, subscriptionError: "Could not verify subscription. Please try again.", subscriptionState: "error" });
      throw err;
    }
  }, []);

  const checkSubscriptionActive = async () => {
    try {
      const res = await subscriptionApi.checkActive();
      return res.data?.data || res.data;
    } catch (err) {

      throw err;
    }
  };


  const isSubscriptionRequiredError = (err) => {
    const details = err.response?.data?.error;
    return (
      err.response?.status === 402 ||
      details?.code === "SUBSCRIPTION_REQUIRED" ||
      err.code === "SUBSCRIPTION_REQUIRED");

  };

  const handleSubscriptionRequiredError = (err) => {
    if (!isSubscriptionRequiredError(err)) return false;

    const details = err.response?.data?.error || {};
    set((prev) => ({
      subscription: {
        ...(prev.subscription || {}),
        status: details.status || "trial_expired",
        isActive: false,
        canUseApp: false,
        requiresSubscription: true,
        trialEndDate: details.trialEndDate || prev.subscription?.trialEndDate
      },
      subscriptionLoading: false
    }));

    return true;
  };

  const createSubscriptionRequiredError = (err) => {
    const message =
    err.response?.data?.message ||
    SUBSCRIPTION_REQUIRED_MESSAGE;
    const error = new Error(message);
    error.code = "SUBSCRIPTION_REQUIRED";
    error.requiresSubscription = true;
    return error;
  };

  // ════════════════════════════════════════
  // CUSTOMER ACTIONS
  // ════════════════════════════════════════

  const fetchCustomers = useCallback(
    async ({ search = "", page = 1, limit = 20 } = {}) => {
      set({ customersLoading: true, customersError: null });
      try {

        const res = await customerApi.getAll({ search, page, limit });

        // Defensive check for response structure





        // Backend returns either:
        // 1. { customers: [], pagination: {} } - normal response
        // 2. { items: [], pagination: {} } - fallback
        const responseData = res.data?.data || {};
        const items = responseData.customers || responseData.items || [];
        const pagination = responseData.pagination || {
          page,
          limit,
          total: items.length
        };






        set({
          customers: items,
          customersPagination: pagination,
          customersLoading: false
        });
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message;
        const responseData = err.response?.data;





        if (status === 401) {


        }
        set({ customersLoading: false, customersError: err.message || "Unable to load data" });
      }
    },
    []
  );

  const addCustomer = async (data) => {
    try {




      const res = await customerApi.create(data);





      // Wait a moment then fetch to ensure backend is ready
      setTimeout(() => {

        fetchCustomers();
      }, 500);

      return res.data.data;
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      const code = err.response?.data?.error?.code;
      const errorMsg = err.response?.data?.message || err.message;





      if (code === "DUPLICATE_PHONE") throw new Error("DUPLICATE_PHONE");
      throw err;
    }
  };

  const updateCustomer = async (id, data) => {
    try {
      await customerApi.update(id, data);
      await fetchCustomers();
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await customerApi.delete(id);
      setState((prev) => ({
        ...prev,
        customers: prev.customers.filter((c) => c.id !== id)
      }));
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  // ════════════════════════════════════════
  // ORDER ACTIONS
  // ════════════════════════════════════════

  const fetchOrders = useCallback(
    async ({ status, customerId, page = 1, limit = 20 } = {}) => {
      set({ ordersLoading: true, ordersError: null });
      try {






        const res = await orderApi.getAll({
          status,
          customerId,
          page,
          limit
        });

        // Defensive check for response structure
        // Backend returns either:
        // 1. { orders: [], pagination: {} } - actual backend response
        // 2. { items: [], pagination: {} } - fallback
        const responseData = res.data?.data || {};
        const items = responseData.orders || responseData.items || [];
        const pagination = responseData.pagination || {
          page,
          limit,
          total: items.length
        };


        set({
          orders: items,
          ordersPagination: pagination,
          ordersLoading: false
        });
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message;
        const responseData = err.response?.data;





        set({ ordersLoading: false, ordersError: err.message || "Unable to load data" });
      }
    },
    []
  );

  const addOrder = async (data) => {
    try {
      const measurementSnapshots = (data.items || []).
      filter((item) => item.measurementSnapshot).
      map((item) => item.measurementSnapshot);

      const payload = {
        customer_id: data.customerId,
        delivery_date: data.deliveryDate,
        description: data.description || "",
        measurement_id: data.measurementId || null,
        measurement_snapshot:
        measurementSnapshots.length > 0 ?
        {
          profiles: measurementSnapshots,
          itemCount: data.items.length,
          createdAt: new Date().toISOString()
        } :
        null,
        items: data.items.map((i) => ({
          type: i.type || i.typeLabel,
          fabric: i.fabric,
          quantity: Number(i.quantity),
          price: Number(i.price),
          measurement_id: i.measurement_id || null,
          measurementLabel: i.measurementLabel || null,
          measurementData: i.measurementData || null,
          measurementSnapshot: i.measurementSnapshot || null
        }))
      };




      const res = await orderApi.create(payload);

      await fetchOrders();
      return res.data.data;
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Failed to create order";

      throw new Error(message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => o.id === id ? { ...o, status } : o)
      }));
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      const message = err.response?.data?.message || "Cannot update status";
      throw new Error(message);
    }
  };

  const updateOrder = async (id, data) => {
    try {
      const res = await orderApi.update(id, data);
      const updatedOrder = res.data?.data || { id, ...data };
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => o.id === id ? { ...o, ...updatedOrder } : o)
      }));
      return updatedOrder;
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      const message =
      err.response?.data?.message || err.message || "Failed to update order";
      throw new Error(message);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await orderApi.delete(id);
      setState((prev) => ({
        ...prev,
        orders: prev.orders.filter((o) => o.id !== id)
      }));
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  const recordPayment = async ({ orderId, amount, paymentMethod, notes }) => {
    try {
      await paymentApi.record({
        orderId,
        amount: Number(amount),
        paymentMethod,
        paymentDate: new Date().toISOString().split("T")[0],
        notes
      });
      const res = await orderApi.getById(orderId);
      const updated = res.data.data;
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => o.id === orderId ? updated : o)
      }));
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  // ════════════════════════════════════════
  // MEASUREMENT ACTIONS
  // ════════════════════════════════════════

  const fetchMeasurements = useCallback(async (customerId) => {
    set({ measurementsLoading: true, measurementsError: null });
    try {

      const res = await measurementApi.getByCustomer(customerId);
      const responseData = res.data?.data || {};
      const measurements =
      responseData.measurements || responseData.items || [];





      const latest = measurements[0] || null;
      const latestData = latest ?
      {
        ...(latest.measurementsData || latest.measurements_data || {}),
        outfitType: latest.outfitType || latest.outfit_type,
        outfitLabel: latest.outfitLabel || latest.outfit_label,
        updatedAt: latest.updatedAt || latest.updated_at || latest.createdAt || latest.created_at
      } :
      {};

      setState((prev) => ({
        ...prev,
        measurements: {
          ...(prev.measurements && !Array.isArray(prev.measurements) ? prev.measurements : {}),
          [customerId]: latestData,
          [`${customerId}_profiles`]: measurements
        },
        measurementsLoading: false
      }));
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;





      set({ measurementsLoading: false, measurementsError: err.message || "Unable to load data" });
    }
  }, []);

  const addMeasurement = async ({
    customerId,
    outfitType,
    outfitLabel,
    measurementsData
  }) => {
    const clean = {};
    Object.keys(measurementsData).forEach((k) => {
      clean[k] = parseFloat(measurementsData[k]) || 0;
    });
    try {
      await measurementApi.create({
        customerId,
        customer_id: customerId,
        outfitType,
        outfit_type: outfitType,
        outfitLabel,
        outfit_label: outfitLabel,
        measurementsData: clean,
        measurements_data: clean
      });
      await fetchMeasurements(customerId);
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  const updateMeasurement = async (id, customerId, data) => {
    try {
      await measurementApi.update(id, data);
      await fetchMeasurements(customerId);
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  const deleteMeasurement = async (id, customerId) => {
    try {
      await measurementApi.delete(id);
      await fetchMeasurements(customerId);
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }
      throw err;
    }
  };

  // ════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════

  const fetchDashboardStats = useCallback(
    async (period = "month", order_type) => {
      set({ dashboardLoading: true, dashboardError: null });
      try {
        const res = await dashboardApi.getStats(period, order_type);
        set({
          dashboardStats: res.data.data,
          dashboardLoading: false,
          dashboardPeriod: period
        });
      } catch (err) {

        set({ dashboardLoading: false, dashboardError: err.message || "Unable to load data" });
      }
    },
    []
  );

  // ════════════════════════════════════════
  // STAFF ACTIONS
  // ════════════════════════════════════════

  const fetchStaff = useCallback(async () => {
    set({ staffLoading: true, staffError: null });
    try {
      const shopId = state.shop?.id;
      if (!shopId) {

        set({ staff: [], staffLoading: false });
        return;
      }


      const res = await staffApi.getAll({ shop_id: shopId });
      const responseData = res.data?.data || {};
      const items = responseData.staff || responseData.items || [];

      set({
        staff: items,
        staffLoading: false
      });
    } catch (err) {

      set({ staffLoading: false, staffError: err.message || "Unable to load data" });
    }
  }, [state.shop?.id]);

  const addStaff = async (data) => {
    try {
      const shopId = state.shop?.id;
      if (!shopId) {
        throw new Error("No shop selected");
      }

      const payload = { ...data, shop_id: shopId };






      const res = await staffApi.create(payload);
      set((prev) => ({
        staff: [...prev.staff, res.data.data]
      }));
      return res.data.data;
    } catch (err) {

      throw err;
    }
  };

  const updateStaff = async (id, data) => {
    try {
      const res = await staffApi.update(id, data);
      const updatedStaff = res.data?.data || { id, ...data };
      set((prev) => ({
        staff: prev.staff.map((s) =>
        s.id === id ? { ...s, ...updatedStaff } : s
        )
      }));
      return updatedStaff;
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      throw err;
    }
  };

  const deleteStaff = async (id) => {
    try {
      await staffApi.delete(id);
      set((prev) => ({
        staff: prev.staff.filter((s) => s.id !== id)
      }));
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }

      throw err;
    }
  };

  const fetchStaffWorkLogs = async (staffId, params = {}) => {
    try {
      const res = await staffApi.getWorkLogs(staffId, params);
      const responseData = res.data?.data || {};
      const items = responseData.items || responseData.work_logs || [];
      set((prev) => ({
        staffWorkLogs: {
          ...prev.staffWorkLogs,
          [staffId]: items
        }
      }));
      return items;
    } catch (err) {

      throw err;
    }
  };

  const fetchStaffSummary = async (staffId, params = {}) => {
    try {
      const res = await staffApi.getWorkSummary(staffId, params);
      const summary = res.data?.data || {};
      set((prev) => ({
        staffSummaries: {
          ...prev.staffSummaries,
          [staffId]: summary
        }
      }));
      return summary;
    } catch (err) {

      throw err;
    }
  };

  const addStaffWorkLog = async (staffId, data) => {
    try {
      const res = await staffApi.addWorkLog(staffId, data);
      const workLog = res.data?.data || res.data;
      set((prev) => ({
        staffWorkLogs: {
          ...prev.staffWorkLogs,
          [staffId]: [workLog, ...(prev.staffWorkLogs[staffId] || [])]
        }
      }));
      await fetchStaff();
      await fetchStaffSummary(staffId);
      return workLog;
    } catch (err) {

      throw err;
    }
  };

  const deleteStaffWorkLog = async (staffId, workLogId) => {
    try {
      await staffApi.deleteWorkLog(staffId, workLogId);
      set((prev) => ({
        staffWorkLogs: {
          ...prev.staffWorkLogs,
          [staffId]: (prev.staffWorkLogs[staffId] || []).filter(
            (log) => log.id !== workLogId
          )
        }
      }));
      await fetchStaff();
      await fetchStaffWorkLogs(staffId);
      await fetchStaffSummary(staffId);
    } catch (err) {

      throw err;
    }
  };

  // ════════════════════════════════════════
  // NOTIFICATION ACTIONS
  // ════════════════════════════════════════

  const fetchNotifications = useCallback(async () => {
    set({ notificationsLoading: true, notificationsError: null });
    try {

      const res = await notificationApi.getAll();
      const items = res.data.data.items || res.data.data.notifications || [];
      const unreadCount = items.filter((n) => !n.read).length;






      set({
        notifications: items,
        notificationCount: unreadCount,
        notificationsLoading: false
      });
    } catch (err) {

      set({ notificationsLoading: false, notificationsError: err.message || "Unable to load data" });
    }
  }, []);

  const markAllRead = async () => {
    try {

      await notificationApi.markAllAsRead();
      set((prev) => ({
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        notificationCount: 0
      }));
    } catch (err) {

      throw err;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((prev) => ({
        notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
        ),
        notificationCount:
        prev.notificationCount > 0 ? prev.notificationCount - 1 : 0
      }));
    } catch (err) {

    }
  };

  // ════════════════════════════════════════
  // PAYMENT ACTIONS
  // ════════════════════════════════════════

  const fetchPayments = useCallback(async (orderId) => {
    set({ paymentsLoading: true });
    try {

      const res = await paymentApi.getByOrder(orderId);
      const items = res.data.data.items || res.data.data.payments || [];

      set({
        payments: items,
        paymentsLoading: false
      });
    } catch (err) {

      set({ paymentsLoading: false });
    }
  }, []);

  // ════════════════════════════════════════
  // ACTIVITY ACTIONS
  // ════════════════════════════════════════

  const fetchActivityLogs = useCallback(async (orderId) => {
    set({ activityLoading: true });
    try {

      const res = await activityApi.getByOrder(orderId);
      const items = res.data.data.items || res.data.data.activities || [];

      set({
        activityLogs: items,
        activityLoading: false
      });
    } catch (err) {

      set({ activityLoading: false });
    }
  }, []);

  const addActivityComment = async (orderId, notes) => {
    try {

      await activityApi.addComment(orderId, notes);
      await fetchActivityLogs(orderId);
    } catch (err) {

      throw err;
    }
  };

  // ════════════════════════════════════════
  // UPLOAD ACTIONS
  // ════════════════════════════════════════

  const uploadImage = async (imageUri) => {
    try {

      const res = await uploadApi.uploadImage(imageUri);
      const imageUrl = res.data.data.url;

      return imageUrl;
    } catch (err) {
      if (handleSubscriptionRequiredError(err)) {
        throw createSubscriptionRequiredError(err);
      }


      throw err;
    }
  };

  // ════════════════════════════════════════
  // UTILITY ACTIONS
  // ════════════════════════════════════════

  const getWhatsAppInvoiceLink = (orderId) => {
    // Construct WhatsApp message with invoice preview
    const message = `Hi! Here's your invoice for order #${orderId}. Check the details in the app.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  // ════════════════════════════════════════
  // CONTEXT VALUE
  // ════════════════════════════════════════

  return (
    <StitchProContext.Provider
      value={{
        ...state,

        // Auth
        retryShop: fetchShopSilently,
        retryBoot: bootApp,
        logout,
        registerWithPassword,
        loginWithPassword,
        setPassword,
        loginWithGoogle,
        loginWithMsg91Widget,
        sendMsg91MobileOtp,
        loginWithMsg91MobileOtp,
        updateAuthenticatedUser,

        // Shop
        createShop,
        updateShop,

        // Customers
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        // Orders
        fetchOrders,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        recordPayment,

        // Measurements
        fetchMeasurements,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,

        // Dashboard
        fetchDashboardStats,

        // Subscription
        subscription: state.subscription,
        subscriptionLoading: state.subscriptionLoading,
        fetchSubscription,
        checkSubscriptionActive,

        // Staff
        fetchStaff,
        addStaff,
        updateStaff,
        deleteStaff,
        fetchStaffWorkLogs,
        fetchStaffSummary,
        addStaffWorkLog,
        deleteStaffWorkLog,

        // Notifications
        fetchNotifications,
        markAllRead,
        markNotificationRead,

        // Payments
        fetchPayments,

        // Activity
        fetchActivityLogs,
        addActivityComment,

        // Upload
        uploadImage,

        // Utilities
        getWhatsAppInvoiceLink
      }}>

      {children}
    </StitchProContext.Provider>);

};

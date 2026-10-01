import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import storage from "./authStorage";

const PRODUCTION_API_BASE_URL = "https://stitchbook-backend.onrender.com/api";

const getDevApiBaseUrl = () => {
  const hostUri =
  Constants.expoConfig?.hostUri ||
  Constants.manifest2?.extra?.expoClient?.hostUri ||
  Constants.manifest?.debuggerHost;
  const host = hostUri?.split(":")?.[0];

  if (host) {
    return `http://${host}:5002/api`;
  }

  return PRODUCTION_API_BASE_URL;
};

const configuredBaseUrl =
process.env.EXPO_PUBLIC_API_BASE_URL ||
Constants.expoConfig?.extra?.apiBaseUrl ||
Constants.manifest?.extra?.apiBaseUrl;

const BASE_URL =
configuredBaseUrl && configuredBaseUrl !== "auto" ?
configuredBaseUrl :
getDevApiBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "x-client-platform": Platform.OS
  }
});



// REQUEST: inject token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE: handle errors with token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      const requestBaseURL = error.config?.baseURL || BASE_URL;
      const requestUrl = error.config?.url || "";
      const fullUrl = `${requestBaseURL || ""}${requestUrl || ""}`;
      const networkError = new Error(
        fullUrl ?
        `Cannot reach backend server at ${fullUrl}` :
        "Cannot reach backend server"
      );
      networkError.config = error.config;
      networkError.cause = error;
      throw networkError;
    }

    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest = [
    "/auth/google",
    "/auth/login",
    "/auth/msg91-widget",
    "/auth/refresh-token"].
    some((path) => requestUrl.includes(path));

    if (isAuthRequest) {
      throw error;
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          await storage.clearAll();
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken
        });

        const newToken = response.data.data.token;
        const newRefreshToken = response.data.data.refreshToken;

        await storage.setToken(newToken);
        await storage.setRefreshToken(newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await storage.clearAll();
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

// ── AUTH ──────────────────────────────
export const authApi = {
  login: (firebaseToken) => api.post("/auth/login", { firebaseToken }),
  google: (idToken) =>
  api.post("/auth/google", {
    idToken,
    platform: Platform.OS,
    device: Platform.OS
  }),
  msg91Widget: (accessToken) =>
  api.post("/auth/msg91-widget", {
    accessToken,
    platform: Platform.OS,
    device: Platform.OS
  }),
  msg91MobileSendOtp: (identifier) =>
  api.post("/auth/msg91-mobile/send-otp", { identifier }),
  msg91MobileVerifyOtp: (reqId, otp) =>
  api.post("/auth/msg91-mobile/verify-otp", {
    reqId,
    otp,
    platform: Platform.OS,
    device: Platform.OS
  }),
  methods: () => api.get("/auth/methods"),
  linkGoogle: (idToken) => api.post("/auth/link/google", { idToken }),
  linkMobileVerifyOtp: (reqId, otp) =>
  api.post("/auth/link/mobile/verify-otp", { reqId, otp }),
  linkMobileAccessToken: (accessToken) =>
  api.post("/auth/link/mobile-token", { accessToken }),
  refreshToken: (refreshToken) =>
  api.post("/auth/refresh-token", { refreshToken })
};

// ── SHOP ──────────────────────────────
export const shopApi = {
  create: (data) => api.post("/shop", data),
  get: () => api.get("/shop"),
  update: (data) => api.put("/shop", data),
  delete: () => api.delete("/shop")
};

// ── CUSTOMER ──────────────────────────
export const customerApi = {
  create: (data) => api.post("/customer", data),
  getAll: (params) => api.get("/customer", { params }),
  getById: (id) => api.get(`/customer/${id}`),
  update: (id, data) => api.put(`/customer/${id}`, data),
  delete: (id) => api.delete(`/customer/${id}`)
};

// ── ORDER ─────────────────────────────
export const orderApi = {
  create: (data) => api.post("/order", data),
  getAll: (params) => api.get("/order", { params }),
  getById: (id) => api.get(`/order/${id}`),
  getJobSheet: (id) => api.get(`/order/${id}/jobsheet`),
  update: (id, data) => api.put(`/order/${id}`, data),
  updateStatus: (id, status) => api.put(`/order/${id}/status`, { status }),
  delete: (id) => api.delete(`/order/${id}`)
};

// ── SUBSCRIPTION ─────────────────────
// Read-only: plans are purchased on the website; the backend is the source of truth.
export const subscriptionApi = {
  getStatus: () => api.get("/subscription/status"),
  checkActive: () => api.post("/subscription/check-active")
};

// ── MEASUREMENT ───────────────────────
export const measurementApi = {
  create: (data) => api.post("/measurement", data),
  getByCustomer: (customerId) => api.get(`/measurement/customer/${customerId}`),
  getById: (id) => api.get(`/measurement/${id}`),
  update: (id, data) =>
  api.put(`/measurement/${id}`, { measurementsData: data }),
  delete: (id) => api.delete(`/measurement/${id}`)
};

// ── PAYMENT (NEW) ─────────────────────
export const paymentApi = {
  record: (data) => api.post("/payment", data),
  getByOrder: (orderId) => api.get(`/payment/order/${orderId}`),
  delete: (id) => api.delete(`/payment/${id}`)
};

// ── ACTIVITY (NEW) ────────────────────
export const activityApi = {
  getByOrder: (orderId) => api.get(`/activity/order/${orderId}`),
  addComment: (orderId, notes) =>
  api.post(`/activity/order/${orderId}`, { notes })
};

// ── PORTFOLIO (NEW) ───────────────────
export const portfolioApi = {
  create: (data) => api.post("/portfolio", data),
  getAll: (params) => api.get("/portfolio", { params }),
  getPublic: (shopId) => api.get(`/portfolio/public/${shopId}`),
  delete: (id) => api.delete(`/portfolio/${id}`)
};

// ── UPLOAD (NEW) ──────────────────────
export const uploadApi = {
  uploadImage: async (imageUri) => {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: `photo_${Date.now()}.jpg`
    });
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    // Returns: response.data.data.url
  }
};

// ── DASHBOARD (NEW) ───────────────────
export const dashboardApi = {
  getStats: (period = "month", order_type) => {
    const params = { period };
    if (order_type) params.order_type = order_type;
    return api.get("/dashboard/stats", { params });
  }
};

// ── STAFF (NEW) ────────────────────────
export const staffApi = {
  create: (data) => api.post("/staff", data),
  getAll: (params) => api.get("/staff", { params }),
  getById: (id) => api.get(`/staff/${id}`),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  addWorkLog: (id, data) => api.post(`/staff/${id}/work`, data),
  getWorkLogs: (id, params) => api.get(`/staff/${id}/work`, { params }),
  getWorkSummary: (id, params) => api.get(`/staff/${id}/summary`, { params }),
  deleteWorkLog: (id, workLogId) =>
  api.delete(`/staff/${id}/work/${workLogId}`)
};

// ── NOTIFICATION (NEW) ─────────────────
export const notificationApi = {
  create: (data) => api.post("/notification", data),
  getAll: (params) => api.get("/notification", { params }),
  getByUser: (userId) => api.get(`/notification/user/${userId}`),
  markAsRead: (id) => api.put(`/notification/${id}/read`),
  markAllAsRead: () => api.put("/notification/read-all"),
  delete: (id) => api.delete(`/notification/${id}`)
};

// ── GALLERY (NEW) ──────────────────────
export const galleryApi = {
  create: (data) => api.post("/gallery", data),
  getAll: (params) => api.get("/gallery", { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
  reorder: (items) => api.put("/gallery/reorder", { items })
};

// ── INVOICE (NEW) ──────────────────────
export const invoiceApi = {
  create: (data) => api.post("/invoice", data),
  getAll: (params) => api.get("/invoice", { params }),
  getById: (id) => api.get(`/invoice/${id}`),
  getByNumber: (number) => api.get(`/invoice/number/${number}`),
  update: (id, data) => api.put(`/invoice/${id}`, data),
  recordPayment: (id, data) => api.post(`/invoice/${id}/payment`, data),
  delete: (id) => api.delete(`/invoice/${id}`)
};

export default api;

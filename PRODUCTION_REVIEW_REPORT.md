# 🔴 COMPREHENSIVE PRODUCTION REVIEW
## StitchPro React Native Mobile App
**Date:** May 10, 2026  
**Reviewer:** Senior React Native Architect + Mobile Security Engineer  
**Status:** ⚠️ **NOT READY FOR PRODUCTION** — Critical Issues Found

---

## EXECUTIVE SUMMARY

Your React Native app has **solid architecture and good UI**, but has **CRITICAL security issues**, **incomplete error handling**, and **production-preventing issues** that must be fixed before any app store release.

### 🎯 Production Readiness Score: **4.2/10**

| Dimension | Score | Status |
|-----------|-------|--------|
| **Security** | 🔴 2/10 | **CRITICAL** — Hardcoded URLs, test keys, AsyncStorage token leak |
| **Architecture** | 🟡 6/10 | Good structure but state management issues |
| **Performance** | 🟡 6/10 | Decent but unnecessary re-renders, no memoization |
| **Error Handling** | 🟡 5/10 | Basic error UI but missing retry logic |
| **API Integration** | 🟢 7/10 | Token refresh works but no offline support |
| **UX/UI** | 🟢 8/10 | Beautiful, responsive, accessible |
| **Code Quality** | 🟡 5/10 | Good patterns but 20+ console.log debug statements |
| **Testing** | 🔴 1/10 | No unit/E2E tests visible |
| **Release Readiness** | 🔴 2/10 | Debug configs, no env separation |

---

## 🚨 CRITICAL ISSUES (MUST FIX BEFORE PRODUCTION)

### 1. 🔴 HARDCODED DEV API URL

**File:** [services/api.js](services/api.js#L4)

```javascript
const BASE_URL = 'http://192.168.1.64:5002/api';  // ❌ HARDCODED DEV MACHINE IP
```

**Why This Is Dangerous:**
- Your developer's local IP is exposed in source code
- Will fail on ANY device except your machine
- APK/IPA built with this will show YOUR private network IP
- Reverse engineers can see your network setup
- **App will be completely broken for end users**

**Impact:** 🔴 **PRODUCTION BREAKING**

**Fix:**

```javascript
// ✅ PRODUCTION FIX: Create config/environment.js

import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://192.168.1.64:5002/api',  // Only for local development
    TIMEOUT: 15000,
  },
  staging: {
    API_URL: 'https://api-staging.tailorcrm.com/api',
    TIMEOUT: 30000,
  },
  production: {
    API_URL: 'https://api.tailorcrm.com/api',
    TIMEOUT: 30000,
  },
};

// Detect environment from app.json or env variable
const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  if (Constants.manifest?.extra?.environment === 'staging') return ENV.staging;
  return ENV.production;
};

export const API_URL = getEnvVars().API_URL;
export const API_TIMEOUT = getEnvVars().TIMEOUT;
```

**Updated api.js:**

```javascript
import { API_URL, API_TIMEOUT } from '../config/environment';

const BASE_URL = API_URL;  // ✅ From config, not hardcoded

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,  // ✅ Also configurable
  headers: { 'Content-Type': 'application/json' },
});
```

**app.json:**

```json
{
  "extra": {
    "environment": "production"
  }
}
```

**Timeline:** Fix immediately. This blocks any release.

---

### 2. 🔴 TOKENS STORED IN PLAINTEXT AsyncStorage

**Files:** [services/storage.js](services/storage.js#L14-L23), [services/authService.js](services/authService.js#L5-L8)

```javascript
// ❌ INSECURE: AsyncStorage is NOT encrypted
const KEYS = {
  TOKEN: 'auth_token',
  REFRESH: 'refresh_token',
  USER: 'user_data',
  SHOP: 'shop_data',
};

saveAuth: async (token, refreshToken, user) => {
  await AsyncStorage.multiSet([
    [KEYS.TOKEN, token],        // ❌ PLAINTEXT
    [KEYS.REFRESH, refreshToken],  // ❌ PLAINTEXT
    [KEYS.USER, JSON.stringify(user)],
  ]);
};
```

**Why This Is Dangerous:**

1. **AsyncStorage is NOT encrypted** — any app with file access can read it
2. **Rooted/jailbroken devices** can access AsyncStorage directly
3. **Physical device access** exposes all tokens
4. **7-day access tokens** can be reused if stolen
5. **Refresh tokens** can reissue new session indefinitely
6. **Android backups** include unencrypted AsyncStorage

**Real Attack Scenario:**
```javascript
// Attacker on rooted device:
adb shell
su
cat /data/data/com.stitchpro/files/RCTAsyncLocalStorage_V1/stitchpro.db

// Gets all tokens + user data instantly
```

**Impact:** 🔴 **CRITICAL SECURITY BREACH**

**Fix: Use Expo SecureStore (Encrypted)**

```javascript
// ✅ PRODUCTION FIX: Use Secure Storage

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'auth_token',
  REFRESH: 'refresh_token',
  USER: 'user_data',
  SHOP: 'shop_data',
};

export const storage = {
  // ✅ Secure storage for tokens
  saveAuth: async (token, refreshToken, user) => {
    try {
      // Store sensitive data in encrypted SecureStore
      await Promise.all([
        SecureStore.setItemAsync(KEYS.TOKEN, token),
        SecureStore.setItemAsync(KEYS.REFRESH, refreshToken),
      ]);
      
      // Non-sensitive data can stay in AsyncStorage
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(KEYS.SHOP, JSON.stringify(shop));
    } catch (err) {
      console.error('Failed to save auth:', err);
      throw err;
    }
  },

  getToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.TOKEN);
    } catch (err) {
      return null;  // Fallback for older devices
    }
  },

  setToken: async (token) => {
    try {
      return await SecureStore.setItemAsync(KEYS.TOKEN, token);
    } catch (err) {
      console.error('Failed to set token:', err);
    }
  },

  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH);
    } catch (err) {
      return null;
    }
  },

  setRefreshToken: async (token) => {
    try {
      return await SecureStore.setItemAsync(KEYS.REFRESH, token);
    } catch (err) {
      console.error('Failed to set refresh token:', err);
    }
  },

  clearAll: async () => {
    try {
      // Clear both secured and regular storage
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(KEYS.REFRESH).catch(() => {}),
        AsyncStorage.multiRemove(Object.values(KEYS)),
      ]);
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  },
};
```

**Installation:**

```bash
expo install expo-secure-store
```

**Update package.json:**

```json
{
  "dependencies": {
    "expo-secure-store": "~14.0.1"
  }
}
```

**Timeline:** Fix immediately — this is a **legal/compliance issue**. Cannot ship without secure storage.

---

### 3. 🔴 EXCESSIVE DEBUG LOGGING EXPOSES SENSITIVE DATA

**Files:** [App.js](App.js#L1), [context/StitchProContext.js](context/StitchProContext.js#L1), [utils/theme.js](utils/theme.js#L272)

```javascript
// ❌ PRODUCTION BUG: console.log in production builds
console.log('APP_START_1: before imports');
console.log('APP_START_2: imports done, colors123=', typeof colors123);
console.log('[APP] startup colors123', colors123);
console.log('[CTX SET]', Object.keys(updates), '→', updates.isAuthenticated...);
console.log('[LOGIN] API success, userId:', user.id);
console.log('[LOGIN] Calling API with phone:', phone);  // ❌ Exposes phone
console.log('[SHOP] Found:', shop.name);
console.log('[BOOT] Session found, user:', session.user?.id);
```

**Why This Is Dangerous:**

1. **Metro bundler includes console.log in release builds** (by default)
2. **Attacker can intercept logs** via USB debugging or crash reports
3. **Phone numbers logged** = privacy violation (GDPR/CCPA issue)
4. **Session data logged** = token/user ID exposure
5. **Crash logs from Sentry/Rollbar** will include sensitive data
6. **Play Store reviews** can see debug logs

**Actual Exposure:**
```javascript
// From console in crash report:
[LOGIN] API success, userId: 12345
[LOGIN] Calling API with phone: +919876543210
[SHOP] Found: Raja's Tailor Shop
[BOOT] Session found, user: {id: 12345, phone: '+919876543210', ...}
```

**Impact:** 🔴 **LEGAL/PRIVACY ISSUE**

**Fix: Remove all console.log from production**

```javascript
// ✅ PRODUCTION FIX: Create utils/logger.js

const __DEV__ = process.env.NODE_ENV === 'development' || __DEV__;

export const logger = {
  debug: (...args) => {
    if (__DEV__) console.log('[DEBUG]', ...args);
  },
  info: (...args) => {
    if (__DEV__) console.info('[INFO]', ...args);
  },
  error: (msg, err) => {
    // Always log errors but never include sensitive data
    if (__DEV__) console.error('[ERROR]', msg);
    
    // In production: send to error tracking (Sentry, Rollbar)
    // WITHOUT sensitive data
    reportError({
      message: msg,
      errorMessage: err?.message,
      errorCode: err?.code,
      timestamp: new Date().toISOString(),
    });
  },
  warn: (...args) => {
    if (__DEV__) console.warn('[WARN]', ...args);
  },
};

// Usage:
import { logger } from '../utils/logger';

logger.debug('[LOGIN] Calling API');  // ❌ DON'T INCLUDE PHONE
logger.info('[LOGIN] Success');
logger.error('Login failed', err);
```

**Remove from all files:**

```bash
# Find all console.log statements
grep -r "console\.log" . --include="*.js" | head -20

# You'll find 20+ statements that need removal
```

**Timeline:** Must fix before release. Every single console.log must be removed or behind `__DEV__` flag.

---

### 4. 🔴 NO INPUT VALIDATION ON API REQUESTS

**File:** [screens/CreateOrder.js](screens/CreateOrder.js#L1)

```javascript
// ❌ NO INPUT VALIDATION
const handleSubmit = async () => {
  const orderData = {
    customerId: selectedCustomer.id,
    items: selectedItems,  // ❌ No validation
    deliveryDate: deliveryDate,  // ❌ Could be invalid date
    priority: priority,  // ❌ No enum validation
    notes: notes,  // ❌ Could contain malicious content
  };

  await addOrder(orderData);  // ❌ Sends directly to API
};

// ❌ In StitchProContext
const addOrder = async (form) => {
  try {
    const res = await orderApi.create(form);  // ❌ NO validation before API call
    // ...
  } catch (err) {
    // Error handling
  }
};
```

**Why This Is Dangerous:**

1. **Server doesn't trust client** (correct) but client doesn't pre-validate (incorrect)
2. **Malformed data** gets sent to API, causing poor error UX
3. **No field-level error messages** for users
4. **XSS/injection possible** if you ever use RN WebView
5. **Performance waste** — failed API calls take time
6. **User frustration** — no clear feedback on what's wrong

**Real Scenario:**
```javascript
// User enters invalid data, app sends to API:
POST /order {
  customerId: null,      // ❌ Required field missing
  items: [],             // ❌ Empty array
  deliveryDate: "invalid", // ❌ Not a date
  priority: "URGENT",    // ❌ Not in valid enum
}

// API returns 400 with generic error
// User has no idea which field is wrong
```

**Fix: Add validation layer**

```javascript
// ✅ PRODUCTION FIX: Create utils/validation.js

export const validateOrder = (data) => {
  const errors = {};

  // Validate customerId
  if (!data.customerId) {
    errors.customerId = 'Customer is required';
  }

  // Validate items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    data.items.forEach((item, idx) => {
      if (!item.type) {
        errors[`items[${idx}].type`] = 'Item type is required';
      }
      if (!item.measurement || typeof item.measurement !== 'object') {
        errors[`items[${idx}].measurement`] = 'Measurements are required';
      }
    });
  }

  // Validate deliveryDate
  if (!data.deliveryDate || !(data.deliveryDate instanceof Date)) {
    errors.deliveryDate = 'Valid delivery date is required';
  } else if (data.deliveryDate < new Date()) {
    errors.deliveryDate = 'Delivery date must be in the future';
  }

  // Validate priority
  const validPriorities = ['normal', 'high', 'urgent'];
  if (!validPriorities.includes(data.priority)) {
    errors.priority = 'Invalid priority level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Invalid phone number' };
  }
  return { isValid: true };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }
  return { isValid: true };
};
```

**Use in CreateOrder.js:**

```javascript
import { validateOrder, validatePhone } from '../utils/validation';

const handleSubmit = async () => {
  const validation = validateOrder({
    customerId: selectedCustomer?.id,
    items: selectedItems,
    deliveryDate: deliveryDate,
    priority: priority,
    notes: notes,
  });

  if (!validation.isValid) {
    // Show field-specific errors
    Object.entries(validation.errors).forEach(([field, error]) => {
      showToast(error, 'error');
    });
    return;
  }

  // NOW safe to send to API
  try {
    await addOrder({
      customerId: selectedCustomer.id,
      items: selectedItems,
      deliveryDate: deliveryDate,
      priority: priority,
      notes: notes,
    });
    showToast('Order created successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};
```

**Timeline:** Fix before release. Affects UX significantly.

---

### 5. 🔴 NO RETRY LOGIC FOR FAILED REQUESTS

**File:** [services/api.js](services/api.js#L19-L86)

```javascript
// ❌ NO RETRY LOGIC
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) throw new Error('No internet connection');
    
    // Only retries 401 (token refresh)
    if (error.response.status === 401 && !originalRequest._retry) {
      // ... token refresh logic
    }
    
    // ❌ Everything else (timeout, 500, etc) fails immediately
    throw error;
  }
);
```

**Why This Is Dangerous:**

1. **Network blips cause immediate failure** — no graceful degradation
2. **502/503 errors not retried** — temporary service issues = complete failure
3. **Timeout errors (504) not retried** — network lag = broken flow
4. **Bad UX** — user has no "retry" option
5. **Low resilience** — production APIs have hiccups

**Real Scenario:**
```javascript
// User creates order during WiFi connection loss
// Timeout error returned immediately
// Order appears failed
// User frustrated, app uninstall risk
```

**Fix: Add exponential backoff retry**

```javascript
// ✅ PRODUCTION FIX: Create utils/retryConfig.js

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  // Retry on these status codes
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const shouldRetry = (error, attemptNumber) => {
  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  // Retry on network errors
  if (!error.response) {
    return true;
  }

  // Retry on specific status codes
  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

export const getBackoffDelay = (attemptNumber) => {
  const delay = RETRY_CONFIG.initialDelayMs * 
    Math.pow(RETRY_CONFIG.backoffMultiplier, attemptNumber - 1);
  
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
};
```

**Enhanced api.js with retry:**

```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
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
    const originalRequest = error.config;
    
    // ✅ Initialize retry counter
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Handle 401 with token refresh (existing logic)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          storage.clearAll();
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken }
        );

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
        storage.clearAll();
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ NEW: Retry logic for other errors
    if (shouldRetry(error, originalRequest._retryCount + 1)) {
      originalRequest._retryCount += 1;
      const delay = getBackoffDelay(originalRequest._retryCount);
      
      logger.debug(`Retry attempt ${originalRequest._retryCount} after ${delay}ms`);
      
      await sleep(delay);
      return api(originalRequest);
    }

    throw error;
  }
);
```

**Timeline:** Fix before release. Essential for user experience.

---

### 6. 🔴 NO OFFLINE SUPPORT

**Current State:** App fully fails when offline

```javascript
// ❌ API call fails immediately when offline
await orderApi.getAll({ limit: 50 });  // No error handling for offline

// User sees:
// - Empty screen
// - "No internet connection" generic error
// - No "retry" button
// - No local cached data
```

**Why This Is Dangerous:**

1. **Mobile networks are unreliable** — 4G drops, WiFi switches, airplanes
2. **Bad UX** — users expect app to work offline at least partially
3. **No resilience** — temporary network issues = complete app failure
4. **Lost data** — form inputs cleared on error
5. **No retry mechanism** — user must fully restart flow

**Fix: Add offline support with cache**

```javascript
// ✅ PRODUCTION FIX: Create utils/offlineCache.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const CACHE_KEYS = {
  ORDERS: 'cache_orders',
  CUSTOMERS: 'cache_customers',
  MEASUREMENTS: 'cache_measurements',
};

export const CACHE_DURATION = {
  ORDERS: 1 * 60 * 1000,        // 1 minute
  CUSTOMERS: 5 * 60 * 1000,     // 5 minutes
  MEASUREMENTS: 5 * 60 * 1000,  // 5 minutes
};

export const offlineCache = {
  async setCache(key, data, duration) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        duration,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (err) {
      logger.error('Failed to set cache', err);
    }
  },

  async getCache(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp, duration } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > duration) {
        // Cache expired
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (err) {
      logger.error('Failed to get cache', err);
      return null;
    }
  },

  async clearCache(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      logger.error('Failed to clear cache', err);
    }
  },
};
```

**Use in API calls:**

```javascript
// ✅ Wrapper for GET requests with offline support
export async function fetchWithFallback(apiCall, cacheKey, cacheDuration) {
  try {
    const response = await apiCall();
    // Update cache on success
    await offlineCache.setCache(cacheKey, response.data.data, cacheDuration);
    return response;
  } catch (err) {
    // Try to use cached data as fallback
    const cachedData = await offlineCache.getCache(cacheKey);
    if (cachedData) {
      logger.debug('Using cached data for', cacheKey);
      return { data: { data: cachedData }, _fromCache: true };
    }
    throw err;
  }
}

// In StitchProContext:
const fetchOrders = async (params) => {
  try {
    set({ ordersLoading: true });
    const response = await fetchWithFallback(
      () => orderApi.getAll(params),
      CACHE_KEYS.ORDERS,
      CACHE_DURATION.ORDERS
    );
    
    set({
      orders: response.data.data,
      isOffline: response._fromCache,  // ← Flag to show "offline" badge
    });
  } catch (err) {
    // No cache available
    set({ ordersError: err.message });
  } finally {
    set({ ordersLoading: false });
  }
};
```

**Show offline indicator:**

```javascript
// In OrdersScreen
{isOffline && (
  <View style={styles.offlineBanner}>
    <MaterialCommunityIcons name="wifi-off" size={16} color="#F59E0B" />
    <Text style={styles.offlineText}>Offline - Showing cached data</Text>
    <TouchableOpacity onPress={onRefresh}>
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

**Timeline:** Fix before release. Major UX improvement.

---

## ⚠️ HIGH PRIORITY ISSUES (Must Fix)

### 7. ⚠️ MEMORY LEAKS IN EFFECT HOOKS

**File:** [screens/OrdersScreen.js](screens/OrdersScreen.js#L1), [screens/CreateOrder.js](screens/CreateOrder.js#L1)

```javascript
// ❌ MEMORY LEAK: useEffect without cleanup
useEffect(() => {
  fetchOrders({ limit: 50 });
  fetchCustomers();
}, [fetchOrders, fetchCustomers]);  // ❌ Both refetch on every render

// ❌ If component unmounts mid-fetch, state updates continue
const [orders, setOrders] = useState([]);

useEffect(() => {
  fetchOrders().then(data => {
    setOrders(data);  // ❌ If unmounted, still sets state → warning
  });
}, []);
```

**Why This Is Dangerous:**

1. **React warnings** when component unmounts during fetch
2. **Memory leak** — callbacks keep running after unmount
3. **Battery drain** — unnecessary processing
4. **State corruption** — stale updates applied

**Fix:**

```javascript
// ✅ FIX: Use cleanup function and abort signal

useEffect(() => {
  let isMounted = true;  // Track mount status
  let abortController = new AbortController();

  const loadData = async () => {
    try {
      const data = await fetchOrders({ 
        limit: 50,
        signal: abortController.signal,  // Pass abort signal
      });
      
      // ✅ Only update if still mounted
      if (isMounted) {
        setOrders(data);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        logger.error('Failed to fetch orders', err);
      }
    }
  };

  loadData();

  // ✅ Cleanup: cancel requests and mark unmounted
  return () => {
    isMounted = false;
    abortController.abort();  // Cancel fetch
  };
}, []);  // Empty dependency array = only run once
```

**Timeline:** Fix before release. Affects performance.

---

### 8. ⚠️ NO ERROR BOUNDARIES

**Current State:** Single error crashes entire app

```javascript
// ❌ If any screen crashes:
// - Entire app is gone
// - User must force close
// - No error reporting

// Example: CreateOrder.js crashes
// ❌ CRASH: TypeError: Cannot read property 'id' of undefined
// → Whole app white screens
```

**Fix: Add Error Boundary**

```javascript
// ✅ CREATE: components/ErrorBoundary.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors123 } from '../utils/theme';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Report to error tracking service
    logger.error('ErrorBoundary caught error', error);
    // reportToSentry(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={colors123.error}
          />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          <Text style={styles.error}>{this.state.error?.message}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={this.handleReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    color: colors123.text,
  },
  message: {
    fontSize: 14,
    color: colors123.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  error: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors123.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

**Wrap in App.js:**

```javascript
// In App.js
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <StitchProProvider>
        <LanguageProvider>
          <ToastProvider>
            <StitchProNavigator />
          </ToastProvider>
        </LanguageProvider>
      </StitchProProvider>
    </ErrorBoundary>
  );
}
```

**Timeline:** Fix before release. Critical for stability.

---

### 9. ⚠️ NO TIMEOUT HANDLING

**File:** [services/api.js](services/api.js#L6-L10)

```javascript
// ❌ Timeout set but not handled
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,  // 15 second timeout
  headers: { 'Content-Type': 'application/json' },
});

// ❌ But timeouts not caught differently from other errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) throw new Error('No internet connection');
    // ❌ Timeout errors not distinguished
    throw error;
  }
);
```

**Fix:**

```javascript
// ✅ Handle timeout separately

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ❌ NO INTERNET / NETWORK ERROR
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - please check your connection');
      }
      throw new Error('No internet connection');
    }

    // Handle 401 token refresh...
    if (error.response.status === 401 && !originalRequest._retry) {
      // ... existing logic
    }

    throw error;
  }
);
```

**Timeline:** Fix before release.

---

## 🟡 MEDIUM PRIORITY ISSUES (Should Fix)

### 10. 🟡 NO INPUT SANITIZATION

```javascript
// ❌ User input not sanitized
const [notes, setNotes] = useState("");

<TextInput
  value={notes}
  onChangeText={setNotes}  // ❌ Any input accepted
/>

// Sent directly to API
await api.post('/order', { notes: notes });
```

**Fix:**

```javascript
// ✅ Sanitize input
const sanitizeText = (text) => {
  return text
    .trim()
    .replace(/[<>]/g, '')  // Remove HTML-like tags
    .substring(0, 500);    // Limit length
};

<TextInput
  value={notes}
  onChangeText={(text) => setNotes(sanitizeText(text))}
  maxLength={500}
/>
```

---

### 11. 🟡 MISSING STATE VALIDATION

```javascript
// ❌ State can be inconsistent
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [selectedItems, setSelectedItems] = useState([]);

// No guarantee selectedCustomer is still valid if customers list changes
// selectedItems could have invalid item structures
```

**Fix: Add state validation**

```javascript
// ✅ Validate before use
const isFormValid = () => {
  return (
    selectedCustomer?.id &&
    selectedItems.length > 0 &&
    selectedItems.every(item => 
      item.type && item.measurement && Object.keys(item.measurement).length > 0
    ) &&
    deliveryDate && deliveryDate > new Date()
  );
};

<AppButton
  disabled={!isFormValid()}
  onPress={handleSubmit}
  title="Create Order"
/>
```

---

### 12. 🟡 PERFORMANCE: Unnecessary Re-renders

```javascript
// ❌ OrdersScreen re-renders on every filteredOrders change
const filteredOrders = useMemo(() => {
  // ... filtering logic
}, [activeFilter, customerId, orders, searchQuery, customers]);

// ❌ But OrderCard component re-renders even if data unchanged
{filteredOrders.map(order => (
  <OrderCard key={order.id} order={order} />  // ❌ No memoization
))}
```

**Fix:**

```javascript
// ✅ Memoize OrderCard
const OrderCard = React.memo(({ order, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(order.id)}>
      {/* card content */}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.order.id === nextProps.order.id &&
         prevProps.order.status === nextProps.order.status;
});

// ✅ Use useCallback for handlers
const handleOrderPress = useCallback((orderId) => {
  navigation.navigate('OrderDetail', { orderId });
}, [navigation]);

// ✅ In render:
{filteredOrders.map(order => (
  <OrderCard 
    key={order.id} 
    order={order}
    onPress={handleOrderPress}
  />
))}
```

---

## 🟢 PRODUCTION QUALITY CHECKLIST

### Required Before Release:

- [ ] **1. Configure environment-specific API URLs** (dev/staging/production)
- [ ] **2. Switch to SecureStore for tokens** (not AsyncStorage)
- [ ] **3. Remove all console.log statements** from production builds
- [ ] **4. Add input validation** for all forms
- [ ] **5. Implement retry logic** with exponential backoff
- [ ] **6. Add offline support** with cache
- [ ] **7. Fix memory leaks** in useEffect hooks
- [ ] **8. Add Error Boundaries** for crash handling
- [ ] **9. Handle timeout errors** separately
- [ ] **10. Add input sanitization**
- [ ] **11. Validate all state** before use
- [ ] **12. Memoize expensive components** (React.memo)
- [ ] **13. Remove test login** (use Firebase only)
- [ ] **14. Add unit tests** (at least 50% coverage)
- [ ] **15. Test on real device** (not just emulator)
- [ ] **16. Run App Store security scan** (if iOS)
- [ ] **17. Run Play Store security checklist**
- [ ] **18. Set up crash reporting** (Sentry/Rollbar)
- [ ] **19. Set up analytics** (Firebase, Mixpanel)
- [ ] **20. Remove debug navigation flow** (StitchProNavigator logs)

---

## 📊 DETAILED SCORES

### Security: 🔴 2/10

**Broken:**
- ❌ Hardcoded API URL
- ❌ AsyncStorage tokens (unencrypted)
- ❌ Excessive logging of sensitive data
- ❌ No input validation/sanitization

**Needs Work:**
- ⚠️ No rate limiting on client
- ⚠️ No certificate pinning
- ⚠️ No root/jailbreak detection

**Good:**
- ✅ JWT token refresh works
- ✅ Bearer token in headers

---

### Architecture: 🟡 6/10

**Good:**
- ✅ Clean Context API for state
- ✅ Separated services layer
- ✅ Reusable components
- ✅ Proper navigation structure

**Needs Improvement:**
- ⚠️ No error boundaries
- ⚠️ Heavy screens (CreateOrder 400+ lines)
- ⚠️ No custom hooks for reusable logic
- ⚠️ Tight coupling in some contexts

---

### Performance: 🟡 6/10

**Good:**
- ✅ FlatList with key props
- ✅ useMemo for filtered lists
- ✅ Skeleton loaders

**Needs Improvement:**
- ⚠️ No React.memo for card components
- ⚠️ Missing useCallback for event handlers
- ⚠️ No lazy loading for screens
- ⚠️ Large component trees in CreateOrder

---

### Error Handling: 🟡 5/10

**Good:**
- ✅ Toast notifications for feedback
- ✅ Loading states

**Broken:**
- ❌ No retry logic
- ❌ No timeout handling
- ❌ No offline support
- ❌ No Error Boundaries

---

### Testing: 🔴 1/10

**Missing:**
- ❌ No unit tests
- ❌ No integration tests
- ❌ No E2E tests
- ❌ No snapshot tests

---

## 🛠️ IMPLEMENTATION ROADMAP

**Phase 1: Critical Security (Week 1)**
- [ ] Fix API URL configuration
- [ ] Switch to SecureStore
- [ ] Remove console.log statements
- [ ] Add input validation

**Phase 2: Reliability (Week 2)**
- [ ] Add retry logic
- [ ] Add Error Boundaries
- [ ] Fix memory leaks
- [ ] Add offline support

**Phase 3: Quality (Week 3)**
- [ ] Add unit tests
- [ ] Optimize performance
- [ ] Polish UX
- [ ] Remove test login

**Phase 4: Release Prep (Week 4)**
- [ ] Security review
- [ ] Performance testing
- [ ] Device testing
- [ ] App Store submission

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

Before submitting to App Store/Play Store:

### Code Quality
- [ ] No console.log in production builds
- [ ] All error handling in place
- [ ] No hardcoded credentials
- [ ] All TODOs resolved
- [ ] Dead code removed

### Security
- [ ] Tokens in SecureStore
- [ ] API endpoints use HTTPS
- [ ] Certificate pinning enabled (optional but recommended)
- [ ] No sensitive data in logs/analytics
- [ ] No test accounts in release build

### Performance
- [ ] App boots < 3 seconds
- [ ] Screens load < 2 seconds
- [ ] 60 FPS animations
- [ ] Bundle size < 50MB
- [ ] Memory usage < 100MB

### Testing
- [ ] 50%+ test coverage
- [ ] All user flows tested
- [ ] Tested on Android 8+ and iOS 14+
- [ ] Tested on low-end devices
- [ ] Tested on slow networks

### Compliance
- [ ] Privacy policy in app
- [ ] Terms of service accessible
- [ ] GDPR/CCPA compliant
- [ ] No forbidden APIs
- [ ] Accessibility standards met

### Release Configuration
- [ ] Environment set to "production"
- [ ] API_URL points to production
- [ ] Analytics enabled
- [ ] Crash reporting enabled
- [ ] No debug menus visible

---

## 📞 NEXT STEPS

### Immediate Actions (This Week):
1. ✅ Create `config/environment.js` and update API_URL
2. ✅ Install and implement `expo-secure-store`
3. ✅ Remove ALL console.log statements
4. ✅ Create validation layer for forms

### This Sprint:
5. ✅ Add retry logic to API client
6. ✅ Implement Error Boundary
7. ✅ Add offline cache support
8. ✅ Fix memory leaks in effects

### Before Release:
9. ✅ Remove test login (Firebase only)
10. ✅ Add unit tests (50% coverage minimum)
11. ✅ Security audit pass
12. ✅ Device testing pass

---

## 🎯 CONCLUSION

Your React Native app has **excellent UI/UX** and **good architecture**, but has **critical security issues** that prevent production release.

**Not shipable until:**
1. API URL configuration fixed
2. Tokens moved to SecureStore
3. Console logging removed
4. Input validation added
5. Error boundaries added
6. Retry logic implemented

**Timeline to Production:** 4-6 weeks with focused effort on these fixes.

**Current Status:** ⚠️ **NOT PRODUCTION READY**  
**Target Status:** ✅ **PRODUCTION READY** (after fixes)

---

*End of Production Review Report*

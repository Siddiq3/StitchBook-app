# 🔧 PRODUCTION FIX IMPLEMENTATION GUIDE
## StitchPro React Native App
**Quick Implementation Reference for Critical Issues**

---

## PART 1: ENVIRONMENT CONFIGURATION

### Step 1: Create config/environment.js

```javascript
// config/environment.js
import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://localhost:5002/api',
    API_TIMEOUT: 15000,
    ENABLE_LOGGING: true,
    ENABLE_MOCK_DATA: true,
  },
  staging: {
    API_URL: 'https://api-staging.tailorcrm.com/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
    ENABLE_MOCK_DATA: false,
  },
  production: {
    API_URL: 'https://api.tailorcrm.com/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: false,
    ENABLE_MOCK_DATA: false,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  
  // Check for staging environment variable
  if (Constants.manifest?.extra?.environment === 'staging') {
    return ENV.staging;
  }
  
  return ENV.production;
};

const envVars = getEnvVars();

export const API_URL = envVars.API_URL;
export const API_TIMEOUT = envVars.API_TIMEOUT;
export const ENABLE_LOGGING = envVars.ENABLE_LOGGING;
export const ENABLE_MOCK_DATA = envVars.ENABLE_MOCK_DATA;

export default envVars;
```

### Step 2: Update app.json

```json
{
  "expo": {
    "name": "StitchPro",
    "slug": "stitchpro",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.tailorcrm.stitchpro"
    },
    "android": {
      "package": "com.tailorcrm.stitchpro"
    },
    "extra": {
      "environment": "production"
    }
  }
}
```

### Step 3: Update services/api.js

```javascript
// services/api.js
import axios from 'axios';
import { API_URL, API_TIMEOUT } from '../config/environment';
import storage from './storage';

const BASE_URL = API_URL;  // ✅ From config, not hardcoded

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,  // ✅ Also from config
  headers: { 'Content-Type': 'application/json' },
});

// ... rest of API setup
```

---

## PART 2: SECURE TOKEN STORAGE

### Step 1: Install expo-secure-store

```bash
expo install expo-secure-store
```

### Step 2: Create Enhanced Storage Service

```javascript
// services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';

const KEYS = {
  TOKEN: 'auth_token',
  REFRESH: 'refresh_token',
  USER: 'user_data',
  SHOP: 'shop_data',
};

export const storage = {
  /**
   * ✅ SECURE: Use SecureStore for sensitive tokens
   * - Encrypted on device
   * - Protected by OS keychain/keystore
   * - Safe for rooted/jailbroken devices
   */
  saveAuth: async (token, refreshToken, user, shop) => {
    try {
      await Promise.all([
        // Store tokens securely
        SecureStore.setItemAsync(KEYS.TOKEN, token),
        SecureStore.setItemAsync(KEYS.REFRESH, refreshToken),
        // Non-sensitive data in regular AsyncStorage
        AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
        shop && AsyncStorage.setItem(KEYS.SHOP, JSON.stringify(shop)),
      ]);
      logger.debug('Auth saved securely');
    } catch (err) {
      logger.error('Failed to save auth', err);
      throw err;
    }
  },

  getToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.TOKEN);
    } catch (err) {
      logger.error('Failed to get token', err);
      return null;
    }
  },

  setToken: async (token) => {
    try {
      return await SecureStore.setItemAsync(KEYS.TOKEN, token);
    } catch (err) {
      logger.error('Failed to set token', err);
      throw err;
    }
  },

  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH);
    } catch (err) {
      logger.error('Failed to get refresh token', err);
      return null;
    }
  },

  setRefreshToken: async (token) => {
    try {
      return await SecureStore.setItemAsync(KEYS.REFRESH, token);
    } catch (err) {
      logger.error('Failed to set refresh token', err);
      throw err;
    }
  },

  getUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.error('Failed to get user', err);
      return null;
    }
  },

  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (err) {
      logger.error('Failed to set user', err);
    }
  },

  getShop: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SHOP);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.error('Failed to get shop', err);
      return null;
    }
  },

  saveShop: async (shop) => {
    try {
      await AsyncStorage.setItem(KEYS.SHOP, JSON.stringify(shop));
    } catch (err) {
      logger.error('Failed to save shop', err);
    }
  },

  /**
   * ✅ SECURE: Clear both secure and regular storage
   */
  clearAll: async () => {
    try {
      const secureKeys = [KEYS.TOKEN, KEYS.REFRESH];
      const asyncStorageKeys = Object.values(KEYS);

      // Delete from SecureStore
      await Promise.all(
        secureKeys.map(key =>
          SecureStore.deleteItemAsync(key).catch(() => {
            // Ignore errors if item doesn't exist
          })
        )
      );

      // Delete from AsyncStorage
      await AsyncStorage.multiRemove(asyncStorageKeys);
      logger.debug('All storage cleared');
    } catch (err) {
      logger.error('Failed to clear storage', err);
    }
  },
};

export default storage;
```

---

## PART 3: REMOVE SENSITIVE LOGGING

### Step 1: Create Logger Utility

```javascript
// utils/logger.js
import { ENABLE_LOGGING } from '../config/environment';

const shouldLog = () => {
  return ENABLE_LOGGING || __DEV__;
};

/**
 * ✅ PRODUCTION FIX: All logging behind __DEV__ flag
 * - No sensitive data in console
 * - Removed from release builds
 * - Only for debugging
 */
export const logger = {
  debug: (...args) => {
    if (shouldLog()) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    if (shouldLog()) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    if (shouldLog()) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (message, error) => {
    if (shouldLog()) {
      console.error('[ERROR]', message, error);
    }

    // ✅ IMPORTANT: Report to error tracking WITHOUT sensitive data
    // reportErrorToSentry({
    //   message,
    //   errorMessage: error?.message,
    //   errorCode: error?.code,
    //   timestamp: new Date().toISOString(),
    // });
  },
};

export default logger;
```

### Step 2: Replace All console.log

**Find all console.log statements:**

```bash
# In terminal
grep -rn "console\.log" stitchpro-app/src --include="*.js" | wc -l

# You should find ~20-30 statements
```

**Search in VS Code:**
- Ctrl+Shift+F (or Cmd+Shift+F on Mac)
- Find: `console\.log`
- Filter by `.js` files

**Replace pattern:**

```
Before: console.log('[BOOT] Starting...');
After:  logger.debug('[BOOT] Starting...');

Before: console.log('[LOGIN] Calling API with phone:', phone);
After:  logger.debug('[LOGIN] Calling API');  // ✅ Don't include phone

Before: console.log('[SHOP] Found:', shop.name);
After:  logger.debug('[SHOP] Found shop');  // ✅ Don't include name

Before: console.log('Error:', err);
After:  logger.error('Error:', err);  // ✅ For actual errors only
```

---

## PART 4: INPUT VALIDATION

### Step 1: Create Validation Utils

```javascript
// utils/validation.js
export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  if (!cleanPhone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Invalid phone number' };
  }
  
  return { isValid: true, value: cleanPhone };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }
  
  return { isValid: true, value: email };
};

export const validateOrder = (data) => {
  const errors = {};

  // Validate customerId
  if (!data.customerId) {
    errors.customerId = 'Please select a customer';
  }

  // Validate items array
  if (!data.items || !Array.isArray(data.items)) {
    errors.items = 'Items array is invalid';
  } else if (data.items.length === 0) {
    errors.items = 'Add at least one item to the order';
  } else {
    // Validate each item
    data.items.forEach((item, idx) => {
      if (!item.type) {
        errors[`item_${idx}_type`] = 'Item type is required';
      }
      if (!item.measurement || typeof item.measurement !== 'object') {
        errors[`item_${idx}_measurement`] = 'Measurements are required';
      }
      if (!item.size) {
        errors[`item_${idx}_size`] = 'Size is required';
      }
    });
  }

  // Validate deliveryDate
  if (!data.deliveryDate) {
    errors.deliveryDate = 'Delivery date is required';
  } else if (!(data.deliveryDate instanceof Date)) {
    errors.deliveryDate = 'Invalid delivery date';
  } else if (data.deliveryDate < new Date()) {
    errors.deliveryDate = 'Delivery date must be in the future';
  }

  // Validate priority
  const validPriorities = ['normal', 'high', 'urgent'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.priority = 'Invalid priority level';
  }

  // Validate notes
  if (data.notes && data.notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeText = (text, maxLength = 500) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/[<>]/g, '')  // Remove HTML-like tags
    .substring(0, maxLength);
};

export const validateMeasurements = (measurements) => {
  if (!measurements || typeof measurements !== 'object') {
    return { isValid: false, error: 'Invalid measurements object' };
  }

  const keys = Object.keys(measurements);
  if (keys.length === 0) {
    return { isValid: false, error: 'At least one measurement is required' };
  }

  // Validate all values are positive numbers
  for (const [key, value] of Object.entries(measurements)) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      return { isValid: false, error: `${key} must be a positive number` };
    }
  }

  return { isValid: true };
};
```

### Step 2: Use Validation in Forms

```javascript
// screens/LoginScreen.js
import { validatePhone } from '../utils/validation';
import { logger } from '../utils/logger';

const handleLogin = async () => {
  const validation = validatePhone(phone);
  
  if (!validation.isValid) {
    setError(validation.error);
    showToast(validation.error, 'error');
    return;
  }

  setError('');
  setIsLoading(true);

  try {
    await login(validation.value);
    showToast('Login successful!', 'success');
  } catch (err) {
    const message = err.message || authError || 'Login failed';
    setError(message);
    showToast(message, 'error');
    logger.error('Login failed', err);
  } finally {
    setIsLoading(false);
  }
};
```

---

## PART 5: RETRY LOGIC WITH EXPONENTIAL BACKOFF

### Step 1: Create Retry Configuration

```javascript
// utils/retryConfig.js
import { logger } from './logger';

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  // Only retry on these status codes
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  // Don't retry these methods
  nonRetryableMethods: ['DELETE', 'PUT'],  // Usually idempotent except DELETE
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ✅ PRODUCTION FIX: Determine if error is retryable
 */
export const shouldRetry = (error, config) => {
  const { retryCount = 0, maxRetries = RETRY_CONFIG.maxRetries } = config;

  // Exceeded max retries
  if (retryCount >= maxRetries) {
    return false;
  }

  // Network errors (no response at all)
  if (!error.response) {
    logger.debug(`Retryable: Network error on attempt ${retryCount + 1}`);
    return true;
  }

  const status = error.response.status;
  const method = error.config?.method?.toUpperCase();

  // Check if status code is retryable
  if (RETRY_CONFIG.retryableStatusCodes.includes(status)) {
    logger.debug(`Retryable: Status ${status} on attempt ${retryCount + 1}`);
    return true;
  }

  return false;
};

/**
 * ✅ Calculate exponential backoff delay
 */
export const getBackoffDelay = (retryCount) => {
  const exponentialDelay =
    RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
  
  // Cap at maxDelayMs
  const delay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelayMs);
  
  // Add small random jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  
  return Math.floor(delay + jitter);
};
```

### Step 2: Update API Client with Retry

```javascript
// services/api.js
import axios from 'axios';
import { API_URL, API_TIMEOUT } from '../config/environment';
import storage from './storage';
import { logger } from '../utils/logger';
import {
  shouldRetry,
  getBackoffDelay,
  sleep,
  RETRY_CONFIG,
} from '../utils/retryConfig';

const BASE_URL = API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ REQUEST: inject token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // ✅ Initialize retry counter
  if (!config._retryCount) {
    config._retryCount = 0;
  }
  return config;
});

// ✅ RESPONSE: handle errors with retry + token refresh
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

    // ✅ Handle 401 with token refresh
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

        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
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
        storage.clearAll();
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ NEW: Retry logic for other errors
    if (shouldRetry(error, {
      retryCount: originalRequest._retryCount,
      maxRetries: RETRY_CONFIG.maxRetries,
    })) {
      originalRequest._retryCount += 1;
      const delay = getBackoffDelay(originalRequest._retryCount - 1);

      logger.debug(
        `Retrying request (attempt ${originalRequest._retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms`
      );

      await sleep(delay);
      return api(originalRequest);
    }

    // ❌ Not retryable or max retries exceeded
    throw error;
  }
);

// ... rest of API exports
```

---

## PART 6: ERROR BOUNDARY

### Step 1: Create Error Boundary Component

```javascript
// components/ErrorBoundary.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors123 } from '../utils/theme';
import { logger } from '../utils/logger';

/**
 * ✅ PRODUCTION FIX: Catch crashes in component tree
 * - Prevents white screen of death
 * - Shows user-friendly error message
 * - Allows recovery without force close
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught error', error);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // ✅ Send to error tracking (Sentry, Rollbar, etc)
    // reportErrorToTracking({
    //   type: 'React Error',
    //   message: error.toString(),
    //   stack: errorInfo.componentStack,
    // });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={80}
              color={colors123.error}
              style={styles.icon}
            />

            <Text style={styles.title}>Oops! Something went wrong</Text>

            <Text style={styles.message}>
              An unexpected error occurred. Our team has been notified.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => this.props.navigation?.goBack()}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Go Back
              </Text>
            </TouchableOpacity>

            <Text style={styles.errorId}>
              Error ID: {this.state.errorCount}
            </Text>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors123.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors123.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors123.error,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors123.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors123.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: colors123.primary,
  },
  errorId: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
  },
});
```

### Step 2: Wrap App with Error Boundary

```javascript
// App.js
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

---

## PART 7: OFFLINE SUPPORT WITH CACHING

### Step 1: Create Offline Cache Utility

```javascript
// utils/offlineCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export const CACHE_KEYS = {
  ORDERS: '@cache_orders',
  CUSTOMERS: '@cache_customers',
  MEASUREMENTS: '@cache_measurements',
  DASHBOARD: '@cache_dashboard',
};

export const CACHE_DURATION = {
  ORDERS: 5 * 60 * 1000,        // 5 minutes
  CUSTOMERS: 10 * 60 * 1000,    // 10 minutes
  MEASUREMENTS: 10 * 60 * 1000, // 10 minutes
  DASHBOARD: 2 * 60 * 1000,     // 2 minutes
};

/**
 * ✅ PRODUCTION FIX: Cache data for offline support
 */
export const offlineCache = {
  /**
   * Set cache with expiration
   */
  async setCache(key, data, duration = 5 * 60 * 1000) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        duration,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      logger.debug(`Cache set: ${key}`);
    } catch (err) {
      logger.error(`Failed to set cache for ${key}`, err);
    }
  },

  /**
   * Get cache if not expired
   */
  async getCache(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) {
        return null;
      }

      const { data, timestamp, duration } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > duration) {
        // Cache expired
        logger.debug(`Cache expired for ${key}`);
        await AsyncStorage.removeItem(key);
        return null;
      }

      logger.debug(`Using cached data for ${key}`);
      return data;
    } catch (err) {
      logger.error(`Failed to get cache for ${key}`, err);
      return null;
    }
  },

  /**
   * Clear specific cache
   */
  async clearCache(key) {
    try {
      await AsyncStorage.removeItem(key);
      logger.debug(`Cache cleared: ${key}`);
    } catch (err) {
      logger.error(`Failed to clear cache for ${key}`, err);
    }
  },

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      logger.debug('All caches cleared');
    } catch (err) {
      logger.error('Failed to clear all caches', err);
    }
  },
};
```

### Step 2: Create Fetch Wrapper with Fallback

```javascript
// services/fetchWithCache.js
import { offlineCache, CACHE_KEYS, CACHE_DURATION } from '../utils/offlineCache';
import { logger } from '../utils/logger';

/**
 * ✅ PRODUCTION FIX: API calls with offline fallback to cache
 */
export async function fetchWithCache(apiCall, cacheKey, cacheDuration) {
  try {
    const response = await apiCall();
    
    // ✅ Success: Update cache
    if (response.data && response.data.data) {
      await offlineCache.setCache(cacheKey, response.data.data, cacheDuration);
    }
    
    return {
      ...response,
      _fromCache: false,
      _isOnline: true,
    };
  } catch (err) {
    // ✅ Failed: Try cache as fallback
    logger.debug(`API call failed, trying cache for ${cacheKey}`);
    
    const cachedData = await offlineCache.getCache(cacheKey);
    
    if (cachedData) {
      // ✅ Return cached data with offline flag
      logger.debug(`Using cached data for ${cacheKey}`);
      return {
        data: { data: cachedData },
        _fromCache: true,
        _isOnline: false,
      };
    }
    
    // ✅ No cache available, throw original error
    throw err;
  }
}
```

### Step 3: Use in Context API

```javascript
// context/StitchProContext.js
import { fetchWithCache } from '../services/fetchWithCache';
import { CACHE_KEYS, CACHE_DURATION } from '../utils/offlineCache';

export const StitchProProvider = ({ children }) => {
  const [state, setState] = useState({
    ...INITIAL,
    isOffline: false,  // ✅ Track offline status
  });

  const fetchOrders = async (params = {}) => {
    try {
      set({ ordersLoading: true });
      
      const response = await fetchWithCache(
        () => orderApi.getAll(params),
        CACHE_KEYS.ORDERS,
        CACHE_DURATION.ORDERS
      );

      set({
        orders: response.data.data,
        isOffline: response._fromCache,  // ✅ Set flag if from cache
        ordersError: null,
      });
    } catch (err) {
      logger.error('Failed to fetch orders', err);
      set({
        ordersError: err.message,
        isOffline: false,
      });
    } finally {
      set({ ordersLoading: false });
    }
  };

  // Similar for fetchCustomers, fetchMeasurements, etc.
};
```

### Step 4: Show Offline Indicator in UI

```javascript
// screens/OrdersScreen.js
export default function OrdersScreen({ navigation }) {
  const { isOffline } = useStitchPro();

  return (
    <View style={styles.container}>
      {/* ✅ Show offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons 
            name="wifi-off" 
            size={16} 
            color="#F59E0B" 
          />
          <Text style={styles.offlineText}>
            You're offline - viewing cached data
          </Text>
        </View>
      )}

      {/* Rest of screen... */}
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    borderBottomColor: '#F59E0B',
    borderBottomWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  offlineText: {
    marginLeft: 8,
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
});
```

---

## PART 8: FIX MEMORY LEAKS

### Step 1: Add Cleanup to Effects

```javascript
// screens/OrdersScreen.js - BEFORE (❌ Memory Leak)
useEffect(() => {
  fetchOrders({ limit: 50 });
  fetchCustomers();
}, [fetchOrders, fetchCustomers]);

// AFTER (✅ Fixed)
useEffect(() => {
  let isMounted = true;
  let abortController = new AbortController();

  const loadData = async () => {
    try {
      // ✅ Pass abort signal
      const [orders, customers] = await Promise.all([
        orderApi.getAll({ limit: 50, signal: abortController.signal }),
        customerApi.getAll({ signal: abortController.signal }),
      ]);

      // ✅ Only update if still mounted
      if (isMounted) {
        setOrders(orders);
        setCustomers(customers);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && isMounted) {
        logger.error('Failed to load data', err);
      }
    }
  };

  loadData();

  // ✅ Cleanup function
  return () => {
    isMounted = false;
    abortController.abort();  // Cancel in-flight requests
  };
}, []);  // ✅ Empty dependency array = only once on mount
```

---

## IMPLEMENTATION PRIORITY

### Week 1 (Security Critical)
1. ✅ Environment configuration (1 hour)
2. ✅ SecureStore for tokens (2 hours)
3. ✅ Remove console.log (1 hour)
4. ✅ Input validation (2 hours)

### Week 2 (Reliability)
5. ✅ Retry logic (3 hours)
6. ✅ Error boundaries (2 hours)
7. ✅ Offline cache (3 hours)
8. ✅ Memory leak fixes (2 hours)

### Week 3-4 (Polish & Release)
9. ✅ Testing and QA
10. ✅ Device testing
11. ✅ App Store submission prep

---

## TESTING CHECKLIST

After implementing fixes, test:

- [ ] Login works with different networks
- [ ] Token refresh works without UI interruption
- [ ] App doesn't crash on network errors
- [ ] Offline mode shows cached data correctly
- [ ] No console logs in Release build
- [ ] Tokens are encrypted (check with Android Studio)
- [ ] Retry logic works (simulate network errors)
- [ ] Error boundary catches crashes
- [ ] Form validation prevents bad data submission
- [ ] Pull-to-refresh works with offline cache
- [ ] Memory usage doesn't grow over time

---

## DEPLOYMENT

After all fixes and testing:

```bash
# Update app.json
"extra": { "environment": "production" }

# Build for iOS
eas build --platform ios --auto-submit

# Build for Android
eas build --platform android --auto-submit
```

---

*End of Implementation Guide*

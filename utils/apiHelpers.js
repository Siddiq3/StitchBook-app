/**
 * API Helper Utilities
 * Common functions for API operations, error handling, and validation
 */

// ════════════════════════════════════════
// ERROR PARSING & HANDLING
// ════════════════════════════════════════

export const parseApiError = (error) => {
  /**
   * Extracts error message and code from API response
   * @param {Error} error - Axios error object
   * @returns {Object} { code, message, details }
   */
  const response = error?.response?.data;

  if (!response) {
    return {
      code: 'NETWORK_ERROR',
      message: error?.message || 'No internet connection',
      details: {}
    };
  }

  return {
    code: response?.error?.code || 'UNKNOWN_ERROR',
    message: response?.message || response?.error?.message || 'Operation failed',
    details: response?.error?.details || {}
  };
};

export const getErrorMessage = (error, context = '') => {
  /**
   * Gets user-friendly error message
   * @param {Error} error - Error object
   * @param {string} context - Context for error (e.g., 'order_creation')
   * @returns {string} User-friendly message
   */
  const parsed = parseApiError(error);

  const errorMessages = {
    INVALID_INPUT: 'Please check your input and try again',
    UNAUTHORIZED: 'Your session expired. Please login again.',
    FORBIDDEN: 'You do not have permission for this action',
    NOT_FOUND: 'Resource not found',
    DUPLICATE_PHONE: 'This phone number is already registered',
    INVALID_STATUS_TRANSITION: 'Cannot skip order stages. Follow the flow: New Order → Cutting → Stitching → Ready → Delivered',
    CUSTOMER_NOT_FOUND: 'Customer not found',
    ORDER_NOT_FOUND: 'Order not found',
    SHOP_NOT_FOUND: 'Shop not configured',
    MEASUREMENT_NOT_FOUND: 'Measurement not found',
    INTERNAL_ERROR: 'Server error. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.'
  };

  return errorMessages[parsed.code] || parsed.message;
};

export const shouldLogoutOnError = (error) => {
  /**
   * Determines if error should trigger logout
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  const parsed = parseApiError(error);
  return parsed.code === 'UNAUTHORIZED';
};

// ════════════════════════════════════════
// VALIDATION UTILITIES
// ════════════════════════════════════════

export const validateOrder = (orderData) => {
  /**
   * Validates order creation payload
   * @param {Object} orderData - Order data to validate
   * @returns {Object} { isValid: boolean, errors: [] }
   */
  const errors = [];

  if (!orderData.customerId || typeof orderData.customerId !== 'number') {
    errors.push('Customer ID is required');
  }

  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (orderData.items) {
    orderData.items.forEach((item, idx) => {
      if (!item.type) errors.push(`Item ${idx + 1}: Type is required`);
      if (!item.fabric) errors.push(`Item ${idx + 1}: Fabric is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item ${idx + 1}: Valid quantity is required`);
      if (!item.price || item.price <= 0) errors.push(`Item ${idx + 1}: Valid price is required`);
    });
  }

  if (orderData.deliveryDate && !isValidDate(orderData.deliveryDate)) {
    errors.push('Delivery date must be in YYYY-MM-DD format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCustomer = (customerData) => {
  /**
   * Validates customer creation payload
   * @param {Object} customerData - Customer data to validate
   * @returns {Object} { isValid: boolean, errors: [] }
   */
  const errors = [];

  if (!customerData.name || customerData.name.trim().length === 0) {
    errors.push('Customer name is required');
  }

  if (!customerData.phone || !isValidPhone(customerData.phone)) {
    errors.push('Valid phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidPhone = (phone) => {
  /**
   * Validates phone number format
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidDate = (dateString) => {
  /**
   * Validates date format (YYYY-MM-DD)
   * @param {string} dateString - Date string
   * @returns {boolean}
   */
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isValidStatusTransition = (currentStatus, nextStatus) => {
  /**
   * Validates order status transition
   * @param {string} currentStatus - Current status
   * @param {string} nextStatus - Desired next status
   * @returns {boolean}
   */
  const transitions = {
    pending: ['cutting'],
    in_progress: ['stitching'],
    cutting: ['stitching'],
    stitching: ['ready'],
    ready: ['delivered'],
    delivered: []
  };

  return transitions[currentStatus]?.includes(nextStatus) || false;
};

export const getNextStatus = (currentStatus) => {
  /**
   * Gets the next valid status for current status
   * @param {string} currentStatus - Current status
   * @returns {string|null} Next status or null
   */
  const next = {
    pending: 'cutting',
    in_progress: 'stitching',
    cutting: 'stitching',
    stitching: 'ready',
    ready: 'delivered',
    delivered: null
  };

  return next[currentStatus] || null;
};

// ════════════════════════════════════════
// DATA FORMATTING UTILITIES
// ════════════════════════════════════════

export const formatOrderForDisplay = (order) => {
  /**
   * Formats order data for UI display
   * @param {Object} order - Order object from API
   * @returns {Object} Formatted order
   */
  return {
    ...order,
    totalAmountFormatted: `₹${order.totalAmount?.toFixed(2) || '0.00'}`,
    deliveryDateFormatted: formatDate(order.deliveryDate),
    itemsCount: order.items?.length || 0,
    itemsLabel: `${order.items?.length || 0} item${order.items?.length !== 1 ? 's' : ''}`,
    statusLabel: capitalizeStatus(order.status)
  };
};

export const formatCustomerForDisplay = (customer) => {
  /**
   * Formats customer data for UI display
   * @param {Object} customer - Customer object from API
   * @returns {Object} Formatted customer
   */
  return {
    ...customer,
    displayName: `${customer.name} (${customer.phone})`,
    initials: getInitials(customer.name)
  };
};

export const formatDate = (dateString) => {
  /**
   * Formats date string to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const capitalizeStatus = (status) => {
  /**
   * Capitalizes status for display
   * @param {string} status - Status string
   * @returns {string} Capitalized status
   */
  return status?.
  split('_').
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ') || '';
};

export const getInitials = (name) => {
  /**
   * Gets initials from name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  return name?.
  split(' ').
  map((word) => word.charAt(0)).
  join('').
  toUpperCase().
  slice(0, 2) || '';
};

// ════════════════════════════════════════
// LOGGING UTILITIES
// ════════════════════════════════════════

export const logApiCall = (method, endpoint, data = null) => {
  /**
   * Logs API call for debugging
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {*} data - Request data
   */
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];




};

export const logApiResponse = (endpoint, response, duration) => {
  /**
   * Logs API response for debugging
   * @param {string} endpoint - API endpoint
   * @param {*} response - Response data
   * @param {number} duration - Request duration in ms
   */
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];




};

export const logApiError = (endpoint, error) => {
  /**
   * Logs API error for debugging
   * @param {string} endpoint - API endpoint
   * @param {Error} error - Error object
   */
  const parsed = parseApiError(error);
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];








};

// ════════════════════════════════════════
// RETRY UTILITIES
// ════════════════════════════════════════

export const retryWithBackoff = async (
fn,
maxRetries = 3,
initialDelayMs = 1000) =>
{
  /**
   * Retries a function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} initialDelayMs - Initial delay in milliseconds
   * @returns {*} Function result
   */
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

// ════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CUTTING: 'cutting',
  STITCHING: 'stitching',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  CHECK: 'check'
};

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_PHONE: 'DUPLICATE_PHONE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  SHOP_NOT_FOUND: 'SHOP_NOT_FOUND',
  MEASUREMENT_NOT_FOUND: 'MEASUREMENT_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Export all utilities
export default {
  parseApiError,
  getErrorMessage,
  shouldLogoutOnError,
  validateOrder,
  validateCustomer,
  isValidPhone,
  isValidDate,
  isValidStatusTransition,
  getNextStatus,
  formatOrderForDisplay,
  formatCustomerForDisplay,
  formatDate,
  capitalizeStatus,
  getInitials,
  logApiCall,
  logApiResponse,
  logApiError,
  retryWithBackoff,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  ERROR_CODES
};

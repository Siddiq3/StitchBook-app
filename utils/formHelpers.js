import { getOutfitLabel } from "../services/outfitTypes";

/**
 * Form utilities and validators
 * Common patterns for forms across the app
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Accept "+91 98765-43210", "098765 43210", "(987) 654 3210" → "9876543210"
export const normalizePhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

// Phone validation (Indian format)
export const isValidPhone = (phone) => /^[0-9]{10}$/.test(normalizePhone(phone));

// Password validation
export const isValidPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Sanitize phone number
export const sanitizePhone = normalizePhone;

// Format phone number for display: "98765 43210"; leaves unknown formats untouched
export const formatPhone = (phone) => {
  const cleaned = normalizePhone(phone);
  return cleaned.length === 10 ? `${cleaned.slice(0, 5)} ${cleaned.slice(5)}` : String(phone || '');
};

// Profile metadata stored alongside body measurements; never shown as a measurement row
const MEASUREMENT_META_KEYS = new Set(['outfitType', 'outfit_type', 'outfitLabel', 'outfit_label', 'unit', 'notes']);

export const getMeasurementEntries = (data) =>
  Object.entries(data || {}).filter(
    ([key, value]) => !MEASUREMENT_META_KEYS.has(key) && value !== '' && value !== null && value !== undefined && typeof value !== 'object'
  );

// Orders from the API carry snake_case ids and an items array; these read either shape.
export const getOrderCustomerId = (order) => order?.customerId ?? order?.customer_id ?? null;

export const getOrderItemsText = (order) => {
  if (order?.item) return order.item;
  const names = (Array.isArray(order?.items) ? order.items : [])
    .map((item) => item.name || item.item_name || item.typeLabel || (item.type && getOutfitLabel(item.type)) || item.category)
    .filter(Boolean);
  if (names.length === 0) return 'Custom order';
  return names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0];
};

export const getOrderSearchText = (order) =>
  [getOrderItemsText(order), order?.fabric, ...(Array.isArray(order?.items) ? order.items.map((item) => item.fabric) : [])]
    .filter(Boolean).join(' ').toLowerCase();

// Currency formatter
export const formatCurrency = (amount, currency = '₹') => {
  if (!amount) return `${currency}0`;
  return `${currency}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Number formatter
export const formatNumber = (num) => {
  if (!num) return '0';
  return Number(num).toLocaleString('en-IN');
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncate = (text, length = 20) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Convert bytes to readable size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Local calendar day as 'YYYY-MM-DD' (toISOString would give the UTC day,
// which is yesterday in India before 5:30 AM).
export const toLocalDateKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Delivery day of an order as 'YYYY-MM-DD', whatever shape the API sent.
export const getDeliveryDateKey = (order) => {
  const value = order?.deliveryDate || order?.delivery_date;
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : toLocalDateKey(d);
};

// Date formatters
export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[d.getMonth()];

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('MMM', monthName)
    .replace('YYYY', year);
};

// Time formatter
export const formatTime = (time) => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const m = parseInt(minutes);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${String(m).padStart(2, '0')} ${ampm}`;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Convert to title case
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Generate color from string (for avatars)
export const stringToColor = (str) => {
  const colors = [
    '#0F6B5F',
    '#C08A3E',
    '#123B35',
    '#0E7490',
    '#D99A00',
    '#35604E',
    '#D92D20',
    '#71827A',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  isValidPassword,
  isValidName,
  sanitizePhone,
  formatPhone,
  formatCurrency,
  formatNumber,
  capitalize,
  truncate,
  formatFileSize,
  formatDate,
  formatTime,
  getInitials,
  toTitleCase,
  stringToColor,
};

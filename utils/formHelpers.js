/**
 * Form utilities and validators
 * Common patterns for forms across the app
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

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
export const sanitizePhone = (phone) => {
  return phone.replace(/[\s-()]/g, '');
};

// Format phone number
export const formatPhone = (phone) => {
  const cleaned = sanitizePhone(phone);
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return cleaned;
};

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

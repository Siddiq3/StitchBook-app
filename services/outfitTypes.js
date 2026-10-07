export const OUTFIT_TYPES = [
  // ── MEN ──────────────────────────
  { id: 'shirt', label: 'Shirt', gender: 'male', bodyType: 'upper',
    fields: ['Medium Length','Shoulder Width','Chest','Waist',
             'Hip Circumference','Arm Hole','Bicep','Elbow Round',
             'Sleeve Length','Wrist Circumference','Upper Front',
             'Mid Front','Lower Front','Neck'] },

  { id: 'pants', label: 'Pants', gender: 'male', bodyType: 'lower',
    fields: ['Length','Waist Bottom','Hip Circumference Bottom',
             'Thigh Circumference','Knee Circumference',
             'Crotch','Fly','Ankle Circumference'] },

  { id: 'kurta-pajama', label: 'Kurta Pajama', gender: 'male',
    bodyType: 'full',
    fields: ['Kurta Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck','Wrist Circumference',
             'Pajama Length','Pajama Waist','Thigh Circumference',
             'Knee Circumference','Ankle Circumference'] },

  { id: 'mens-suit', label: "Men's Suit", gender: 'male',
    bodyType: 'full',
    fields: ['Coat Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck','Collar',
             'Trouser Length','Trouser Waist','Thigh Circumference',
             'Knee Circumference','Ankle Circumference'] },

  { id: 'sherwani', label: 'Sherwani', gender: 'male', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck','Wrist Circumference',
             'Trouser Length','Trouser Waist','Thigh Circumference'] },

  { id: 'indo-western', label: 'Indo Western', gender: 'male',
    bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'blazer', label: 'Blazer', gender: 'male', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole','Collar'] },

  { id: 'kurta', label: 'Kurta', gender: 'male', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'nehru-jacket', label: 'Nehru Jacket', gender: 'male',
    bodyType: 'upper',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'waist-coat', label: 'Waist Coat', gender: 'male',
    bodyType: 'upper',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width','Neck'] },

  { id: 't-shirt', label: 'T Shirt', gender: 'male', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'pajama', label: 'Pajama', gender: 'male', bodyType: 'lower',
    fields: ['Length','Waist','Hip','Thigh Circumference',
             'Knee Circumference','Ankle Circumference'] },

  { id: 'dhoti', label: 'Dhoti', gender: 'male', bodyType: 'lower',
    fields: ['Length','Waist','Hip'] },

  { id: 'coord-set-men', label: 'Co Ord Set', gender: 'male',
    bodyType: 'full',
    fields: ['Top Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Bottom Length','Bottom Waist'] },

  { id: 'safari-suit', label: 'Safari Suit', gender: 'male',
    bodyType: 'full',
    fields: ['Coat Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Trouser Length','Trouser Waist'] },

  { id: 'nigerian-suit', label: 'Nigerian Suit', gender: 'male',
    bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Trouser Length','Trouser Waist'] },

  { id: 'bandi', label: 'Bandi', gender: 'male', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width'] },

  // ── WOMEN ────────────────────────
  { id: 'blouse', label: 'Blouse', gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width','Sleeve Length',
             'Back Length','Neck Front','Neck Back','Arm Hole',
             'Wrist Circumference'] },

  { id: 'lehenga', label: 'Lehenga', gender: 'female', bodyType: 'full',
    fields: ['Choli Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck Front','Neck Back',
             'Lehenga Length','Lehenga Waist','Hip'] },

  { id: 'ladies-suit', label: 'Ladies Suit', gender: 'female',
    bodyType: 'full',
    fields: ['Kameez Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck Front','Neck Back',
             'Salwar Length','Salwar Waist','Thigh Circumference',
             'Knee Circumference','Ankle Circumference'] },

  { id: 'sharara', label: 'Sharara', gender: 'female', bodyType: 'full',
    fields: ['Top Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Neck Front','Sharara Length',
             'Sharara Waist','Thigh Circumference'] },

  { id: 'gown', label: 'Gown', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck Front','Back Length'] },

  { id: 'kurti', label: 'Kurti', gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'saree', label: 'Saree', gender: 'female', bodyType: 'upper',
    fields: ['Blouse Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Back','Neck Front','Neck Back',
             'Arm Hole','Wrist Circumference'] },

  { id: 'dress', label: 'Dress', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Neck Front','Back'] },

  { id: 'under-skirt', label: 'Under Skirt', gender: 'female',
    bodyType: 'lower',
    fields: ['Length','Waist','Hip'] },

  { id: 'rida', label: 'Rida', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Neck'] },

  { id: 'coord-set-women', label: "Women's Co Ord Set",
    gender: 'female', bodyType: 'full',
    fields: ['Top Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Bottom Length','Bottom Waist'] },

  { id: 'womens-blazer', label: "Women's Blazer",
    gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole'] },

  { id: 'women-pants', label: 'Women Pants', gender: 'female',
    bodyType: 'lower',
    fields: ['Length','Waist','Hip','Thigh Circumference',
             'Knee Circumference','Ankle Circumference'] },

  { id: 'kaftan', label: 'Kaftan', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length','Neck'] },

  { id: 'cape', label: 'Cape', gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Shoulder Width','Sleeve Length'] },

  { id: 'shrug', label: 'Shrug', gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Shoulder Width','Sleeve Length',
             'Arm Hole'] },

  { id: 'skirt', label: 'Skirt', gender: 'female', bodyType: 'lower',
    fields: ['Length','Waist','Hip','Thigh Circumference'] },

  { id: 'slip', label: 'Slip', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip'] },

  { id: 'nighty', label: 'Nighty', gender: 'female', bodyType: 'full',
    fields: ['Length','Chest','Waist','Hip','Shoulder Width',
             'Sleeve Length'] },

  { id: 'jacket', label: 'Jacket', gender: 'female', bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole'] },

  { id: 'ethnic-jackets', label: 'Ethnic Jackets', gender: 'female',
    bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width',
             'Sleeve Length','Arm Hole','Neck'] },

  { id: 'camisole', label: 'Camisole', gender: 'female',
    bodyType: 'upper',
    fields: ['Length','Chest','Waist','Shoulder Width'] },
];

// Shared garment silhouettes for outfit selection and item configuration.
const OUTFIT_ICON_TYPES = {
  shirt: 'shirt', pants: 'pants', 'kurta-pajama': 'set', 'mens-suit': 'suit',
  sherwani: 'kurta', 'indo-western': 'kurta', blazer: 'jacket', kurta: 'kurta',
  'nehru-jacket': 'vest', 'waist-coat': 'vest', 't-shirt': 'tshirt',
  pajama: 'pants', dhoti: 'drape', 'coord-set-men': 'set',
  'safari-suit': 'suit', 'nigerian-suit': 'set', bandi: 'vest',
  blouse: 'blouse', lehenga: 'lehenga', 'ladies-suit': 'set', sharara: 'set',
  gown: 'dress', kurti: 'kurta', saree: 'saree', dress: 'dress',
  'under-skirt': 'skirt', rida: 'dress', 'coord-set-women': 'set',
  'womens-blazer': 'jacket', 'women-pants': 'pants', kaftan: 'dress',
  cape: 'cape', shrug: 'jacket', skirt: 'skirt', slip: 'camisole',
  nighty: 'dress', jacket: 'jacket', 'ethnic-jackets': 'jacket', camisole: 'camisole',
};

export const getOutfitIconType = (outfit) => {
  const value = typeof outfit === 'string' ? outfit : outfit?.id || outfit?.outfitType || outfit?.outfit_type || outfit?.label;
  const normalized = String(value || '').trim().toLowerCase();
  const aliases = { pant: 'pants', trouser: 'pants', salwar: 'ladies-suit', saree_blouse: 'saree', waistcoat: 'waist-coat' };
  const id = aliases[normalized] || OUTFIT_TYPES.find(item => item.label.toLowerCase() === normalized)?.id || normalized;
  return OUTFIT_ICON_TYPES[id] || 'hanger';
};

/**
 * Order status configuration with display colors123 and transitions
 */
export const ORDER_STATUS_CONFIG = {
  started: {
    label: 'Started',
    color: '#0EA5E9',
    bgColor: '#CFFAFE',
    textColor: '#0C4A6E',
    nextStatus: 'cutting',
    whatsappKey: 'started',
  },
  cutting: {
    label: 'Cutting',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    nextStatus: 'stitching',
    whatsappKey: 'cutting',
  },
  stitching: {
    label: 'Stitching',
    color: '#0F6B5F',
    bgColor: '#E8F3F0',
    textColor: '#123B35',
    nextStatus: 'ready',
    whatsappKey: 'cutting',
  },
  ready: {
    label: 'Ready',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    nextStatus: 'delivered',
    whatsappKey: 'ready',
  },
  delivered: {
    label: 'Delivered',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    nextStatus: null,
    whatsappKey: 'delivered',
  },
  
  // Legacy status names for backward compatibility
  pending: {
    label: 'Started',
    color: '#0EA5E9',
    bgColor: '#CFFAFE',
    textColor: '#0C4A6E',
    nextStatus: 'cutting',
    whatsappKey: 'started',
  },
  in_progress: {
    label: 'Cutting',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    nextStatus: 'stitching',
    whatsappKey: 'cutting',
  },
};

/**
 * Legacy ORDER_STATUS for backward compatibility
 */
export const ORDER_STATUS = {
  started:     { label: 'Started',     color: '#0EA5E9', next: 'cutting' },
  cutting:     { label: 'Cutting', color: '#F59E0B', next: 'stitching' },
  stitching:   { label: 'Stitching', color: '#0F6B5F', next: 'ready' },
  ready:       { label: 'Ready',       color: '#8B5CF6', next: 'delivered' },
  delivered:   { label: 'Delivered',   color: '#10B981', next: null },
  // Legacy names
  pending:     { label: 'Started',     color: '#0EA5E9', next: 'cutting' },
  in_progress: { label: 'Cutting', color: '#F59E0B', next: 'stitching' },
};

/**
 * Priority levels for orders
 */
export const ORDER_PRIORITY = [
  { id: 'normal', label: 'Normal', color: '#6B7280' },
  { id: 'urgent', label: 'Urgent', color: '#EF4444' },
];

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'other', label: 'Other' },
];

/**
 * Staff roles
 */
export const STAFF_ROLES = [
  { id: 'manager', label: 'Manager' },
  { id: 'cutter', label: 'Cutter' },
  { id: 'stitcher', label: 'Stitcher' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'helper', label: 'Helper' },
];

/**
 * Staff permissions
 */
export const STAFF_PERMISSIONS = [
  { id: 'view_orders', label: 'View Orders' },
  { id: 'create_orders', label: 'Create Orders' },
  { id: 'edit_measurements', label: 'Edit Measurements' },
  { id: 'access_billing', label: 'Access Billing' },
  { id: 'access_reports', label: 'Access Reports' },
];

/**
 * Gender options
 */
export const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

/**
 * Measurement units
 */
export const MEASUREMENT_UNITS = [
  { id: 'inches', label: 'Inches' },
  { id: 'cm', label: 'Centimeters' },
];

/**
 * Currency options
 */
export const CURRENCIES = [
  { id: 'INR', label: '₹ Indian Rupee' },
  { id: 'USD', label: '$ US Dollar' },
  { id: 'AED', label: 'د.إ UAE Dirham' },
  { id: 'GBP', label: '£ British Pound' },
];

/**
 * Activity log action types
 */
export const ACTIVITY_TYPES = {
  status_change: { label: 'Status Changed', icon: '📋' },
  payment: { label: 'Payment', icon: '💰' },
  comment: { label: 'Comment', icon: '💬' },
  delivery_due: { label: 'Delivery Due', icon: '🚚' },
};

/**
 * Get all outfit types for a specific gender
 * @param {string} gender - 'male' or 'female'
 * @returns {array} Array of outfit type objects
 */
export const getOutfitsByGender = (gender) =>
  OUTFIT_TYPES.filter(o => o.gender === gender);

/**
 * Get a specific outfit by ID
 * @param {string} id - outfit type id
 * @returns {object} outfit object or null
 */
export const getOutfitById = (id) =>
  OUTFIT_TYPES.find(o => o.id === id);

/**
 * Get outfit label by ID
 * @param {string} id - outfit type id
 * @returns {string} outfit label or id if not found
 */
export const getOutfitLabel = (id) => {
  const outfit = getOutfitById(id);
  return outfit ? outfit.label : id;
};

/**
 * Format outfit types for grid display
 * @param {string} gender - 'male' or 'female'
 * @returns {array} Array of outfits for grid
 */
export const getOutfitGridData = (gender) => {
  return getOutfitsByGender(gender).map(outfit => ({
    id: outfit.id,
    label: outfit.label,
    gender: outfit.gender,
    fields: outfit.fields,
  }));
};

/**
 * Get status badge style for order status
 * @param {string} status - order status
 * @returns {object} Badge styling
 */
export const getStatusBadgeStyle = (status) => {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
};

/**
 * Get next status in pipeline
 * @param {string} status - current status
 * @returns {string} Next status or null if final
 */
export const getNextStatus = (status) => {
  const config = ORDER_STATUS_CONFIG[status];
  return config ? config.nextStatus : null;
};

/**
 * Check if status can transition to next status
 * @param {string} currentStatus - current status
 * @param {string} nextStatus - desired next status
 * @returns {boolean} true if valid transition
 */
export const isValidStatusTransition = (currentStatus, nextStatus) => {
  const allowedNext = getNextStatus(currentStatus);
  return allowedNext === nextStatus;
};

/**
 * Get all valid statuses
 * @returns {array} Array of status keys
 */
export const getAllStatuses = () =>
  Object.keys(ORDER_STATUS_CONFIG);

/**
 * Get gender initials for avatar
 * @param {string} gender - gender value
 * @returns {string} Single letter for avatar (M/F/O)
 */
export const getGenderInitial = (gender) => {
  const map = { male: 'M', female: 'F', other: 'O' };
  return map[gender] || 'U';
};

/**
 * Get role display label
 * @param {string} roleId - role id
 * @returns {string} Role label
 */
export const getRoleLabel = (roleId) => {
  const role = STAFF_ROLES.find(r => r.id === roleId);
  return role ? role.label : roleId;
};

/**
 * Get payment method label
 * @param {string} methodId - payment method id
 * @returns {string} Payment method label
 */
export const getPaymentMethodLabel = (methodId) => {
  const method = PAYMENT_METHODS.find(m => m.id === methodId);
  return method ? method.label : methodId;
};

export default OUTFIT_TYPES;

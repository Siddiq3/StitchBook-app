export const garmentTypes = [
  "Blouse",
  "Salwar Set",
  "Kurta",
  "Lehenga",
  "Saree Blouse",
  "Anarkali",
  "Sharara",
  "Alteration",
];

export const statusOptions = ["Pending", "In Progress", "Ready", "Delivered"];

export const seedCustomers = [
  {
    id: 1,
    name: "Priya Sharma",
    phone: "9876543210",
    email: "priya@gmail.com",
    address: "Banjara Hills, Hyderabad",
    avatar: "PS",
    tier: "VIP",
    lastOrderAt: "2026-04-03",
  },
  {
    id: 2,
    name: "Anita Reddy",
    phone: "9123456789",
    email: "anita@gmail.com",
    address: "Jubilee Hills, Hyderabad",
    avatar: "AR",
    tier: "Repeat",
    lastOrderAt: "2026-04-05",
  },
  {
    id: 3,
    name: "Meera Patel",
    phone: "9988776655",
    email: "meera@gmail.com",
    address: "Kondapur, Hyderabad",
    avatar: "MP",
    tier: "Premium",
    lastOrderAt: "2026-04-06",
  },
  {
    id: 4,
    name: "Sneha Verma",
    phone: "9445566778",
    email: "sneha@gmail.com",
    address: "Madhapur, Hyderabad",
    avatar: "SV",
    tier: "New",
    lastOrderAt: "2026-04-07",
  },
];

export const seedMeasurements = {
  1: {
    chest: 36,
    waist: 30,
    hips: 38,
    shoulder: 14,
    length: 24,
    sleeve: 22,
    neck: 14.5,
    blouseLength: 16,
    updatedAt: "2026-04-02",
  },
  2: {
    chest: 34,
    waist: 28,
    hips: 36,
    shoulder: 13.5,
    length: 22,
    sleeve: 21,
    neck: 13.5,
    blouseLength: 15,
    updatedAt: "2026-04-03",
  },
  3: {
    chest: 38,
    waist: 32,
    hips: 40,
    shoulder: 14.5,
    length: 25,
    sleeve: 23,
    neck: 15,
    blouseLength: 17,
    updatedAt: "2026-04-05",
  },
};

export const seedOrders = [
  {
    id: 101,
    customerId: 1,
    customerName: "Priya Sharma",
    item: "Salwar Set",
    fabric: "Georgette",
    color: "Royal Blue",
    deliveryDate: "2026-04-20",
    status: "In Progress",
    amount: 2500,
    notes: "Gold border work with soft flare finish",
    createdAt: "2026-04-01",
  },
  {
    id: 102,
    customerId: 2,
    customerName: "Anita Reddy",
    item: "Blouse",
    fabric: "Silk",
    color: "Ruby Red",
    deliveryDate: "2026-04-15",
    status: "Ready",
    amount: 800,
    notes: "Deep neck, sleeveless with pearl detailing",
    createdAt: "2026-04-03",
  },
  {
    id: 103,
    customerId: 3,
    customerName: "Meera Patel",
    item: "Lehenga",
    fabric: "Velvet",
    color: "Maroon",
    deliveryDate: "2026-04-25",
    status: "Pending",
    amount: 5500,
    notes: "Heavy embroidery and cancan finishing",
    createdAt: "2026-04-05",
  },
  {
    id: 104,
    customerId: 2,
    customerName: "Anita Reddy",
    item: "Kurta",
    fabric: "Cotton",
    color: "Ivory",
    deliveryDate: "2026-04-18",
    status: "Delivered",
    amount: 1200,
    notes: "Clean straight cut with side pockets",
    createdAt: "2026-03-28",
  },
  {
    id: 105,
    customerId: 4,
    customerName: "Sneha Verma",
    item: "Saree Blouse",
    fabric: "Banarasi Silk",
    color: "Emerald",
    deliveryDate: "2026-04-17",
    status: "In Progress",
    amount: 1900,
    notes: "Princess cut with tassel finishing",
    createdAt: "2026-04-07",
  },
];

export const measurementFieldGroups = [
  {
    key: "upper",
    title: "Upper Body",
    description: "Neckline, shoulder spread and the blouse base fit.",
  },
  {
    key: "core",
    title: "Core Shape",
    description: "Bust, waist and hip definition for a clean silhouette.",
  },
  {
    key: "finish",
    title: "Fall & Finish",
    description: "Sleeve and length details that affect final drape.",
  },
];

export const measurementFields = [
  {
    key: "neck",
    label: "Neck",
    shortLabel: "Neck",
    icon: "circle-outline",
    group: "upper",
  },
  {
    key: "shoulder",
    label: "Shoulder",
    shortLabel: "Shoulder",
    icon: "arrow-expand-horizontal",
    group: "upper",
  },
  {
    key: "blouseLength",
    label: "Blouse Length",
    shortLabel: "Blouse",
    icon: "arrow-expand-vertical",
    group: "upper",
  },
  {
    key: "chest",
    label: "Chest",
    shortLabel: "Chest",
    icon: "tape-measure",
    group: "core",
  },
  {
    key: "waist",
    label: "Waist",
    shortLabel: "Waist",
    icon: "ruler-square-compass",
    group: "core",
  },
  {
    key: "hips",
    label: "Hips",
    shortLabel: "Hips",
    icon: "human-female",
    group: "core",
  },
  {
    key: "sleeve",
    label: "Sleeve",
    shortLabel: "Sleeve",
    icon: "ruler",
    group: "finish",
  },
  {
    key: "length",
    label: "Length",
    shortLabel: "Length",
    icon: "human-male-height",
    group: "finish",
  },
];

export const revenueTrend = [
  { label: "Mon", value: 12000 },
  { label: "Tue", value: 9800 },
  { label: "Wed", value: 16200 },
  { label: "Thu", value: 14400 },
  { label: "Fri", value: 21000 },
  { label: "Sat", value: 18800 },
];

export const outfitCatalog = [
  { key: "kurta-pajama", label: "Kurta Pajama", variant: "kurta" },
  { key: "dress", label: "Dress", variant: "dress" },
  { key: "blouse", label: "Blouse", variant: "blouse" },
  { key: "mens-suit", label: "Men's Suit", variant: "suit" },
  { key: "pants", label: "Pants", variant: "pants" },
  { key: "gown", label: "Gown", variant: "gown" },
  { key: "ladies-suit", label: "Ladies Suit", variant: "ladies-suit" },
  { key: "shirt", label: "Shirt", variant: "shirt" },
  { key: "under-skirt", label: "Under Skirt", variant: "skirt" },
  { key: "nehru-jacket", label: "Nehru Jacket", variant: "jacket" },
  { key: "rida", label: "Rida", variant: "rida" },
  { key: "waist-coat", label: "Waist Coat", variant: "waistcoat" },
  { key: "lehenga", label: "Lehenga", variant: "lehenga" },
  { key: "sharara", label: "Sharara", variant: "sharara" },
  { key: "sherwani", label: "Sherwani", variant: "sherwani" },
];

export const measurementFieldLibrary = [
  "Around Thigh",
  "Hip Circumference",
  "Short Length",
  "Lower Front",
  "Arm Hole",
  "Back Neck Depth",
  "Knee Circumference",
  "Medium Length",
  "In Seam",
  "Nikker Length",
  "Bottom Gher",
  "Above Head",
  "Wrist Circumference",
  "Cross Back",
  "Crotch",
  "Waist Bottom",
  "Lower Waist",
  "Thigh Circumference",
  "Bust",
  "Long Length",
  "Lower Waist Bottom",
  "Pardi Gher",
  "Above Bust",
  "Kas",
  "Dart Point",
  "Chest",
  "Shoulder to apex",
  "Around Calf",
  "Length",
  "Upper Front",
  "Apex to apex",
  "Below Bust",
  "Calf Circumference",
  "Front Neck Depth",
  "Around Shoulder",
  "Neck",
  "Mid Front",
  "Shoulder Width",
  "Bicep",
  "Fly",
  "Waist",
  "Elbow Round",
  "Sleeve Length",
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function inferMeasurementKind(label = "") {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("length") ||
    normalized.includes("inseam") ||
    normalized.includes("in seam")
  ) {
    return "length";
  }
  if (normalized.includes("shoulder")) {
    return "shoulder";
  }
  if (normalized.includes("neck")) {
    return "neck";
  }
  if (normalized.includes("chest") || normalized.includes("bust")) {
    return "chest";
  }
  if (normalized.includes("waist")) {
    return "waist";
  }
  if (normalized.includes("hip")) {
    return "hip";
  }
  if (normalized.includes("arm hole")) {
    return "arm-hole";
  }
  if (normalized.includes("bicep")) {
    return "bicep";
  }
  if (normalized.includes("elbow")) {
    return "elbow";
  }
  if (normalized.includes("wrist")) {
    return "wrist";
  }
  if (normalized.includes("thigh")) {
    return "thigh";
  }
  if (normalized.includes("calf")) {
    return "calf";
  }

  return "generic";
}

export function createMeasurementTemplateField(label, id) {
  return {
    id: id || slugify(label),
    label,
    kind: inferMeasurementKind(label),
  };
}

const measurementTemplateSeedMap = {
  "kurta-pajama": [
    "Medium Length",
    "Shoulder Width",
    "Chest",
    "Waist",
    "Hip Circumference",
    "Arm Hole",
    "Bicep",
    "Elbow Round",
  ],
  dress: [
    "Shoulder Width",
    "Bust",
    "Waist",
    "Hip Circumference",
    "Length",
    "Arm Hole",
    "Bicep",
    "Front Neck Depth",
  ],
  blouse: [
    "Shoulder Width",
    "Bust",
    "Waist",
    "Arm Hole",
    "Back Neck Depth",
    "Front Neck Depth",
    "Apex to apex",
    "Length",
  ],
  "mens-suit": [
    "Shoulder Width",
    "Chest",
    "Waist",
    "Length",
    "Sleeve Length",
    "Bicep",
    "Cross Back",
    "Neck",
  ],
  pants: [
    "Waist",
    "Hip Circumference",
    "Around Thigh",
    "Knee Circumference",
    "Calf Circumference",
    "Bottom Gher",
    "In Seam",
    "Length",
  ],
  gown: [
    "Shoulder Width",
    "Bust",
    "Waist",
    "Hip Circumference",
    "Length",
    "Arm Hole",
    "Bicep",
    "Mid Front",
  ],
  "ladies-suit": [
    "Shoulder Width",
    "Bust",
    "Waist",
    "Hip Circumference",
    "Length",
    "Arm Hole",
    "Bicep",
    "Bottom Gher",
  ],
  shirt: [
    "Medium Length",
    "Shoulder Width",
    "Chest",
    "Waist",
    "Hip Circumference",
    "Arm Hole",
    "Bicep",
    "Elbow Round",
  ],
  "under-skirt": [
    "Waist",
    "Hip Circumference",
    "Length",
    "Bottom Gher",
    "Lower Waist",
  ],
  "nehru-jacket": [
    "Shoulder Width",
    "Chest",
    "Waist",
    "Length",
    "Arm Hole",
    "Neck",
  ],
  rida: [
    "Shoulder Width",
    "Bust",
    "Waist",
    "Length",
    "Sleeve Length",
    "Front Neck Depth",
  ],
  "waist-coat": [
    "Shoulder Width",
    "Chest",
    "Waist",
    "Length",
    "Neck",
  ],
  lehenga: [
    "Waist",
    "Hip Circumference",
    "Length",
    "Bottom Gher",
    "Pardi Gher",
  ],
  sharara: [
    "Waist",
    "Hip Circumference",
    "Around Thigh",
    "Length",
    "Bottom Gher",
  ],
  sherwani: [
    "Shoulder Width",
    "Chest",
    "Waist",
    "Length",
    "Sleeve Length",
    "Neck",
    "Cross Back",
  ],
};

export const seedMeasurementTemplates = Object.fromEntries(
  outfitCatalog.map((outfit) => [
    outfit.key,
    (measurementTemplateSeedMap[outfit.key] || []).map((label, index) =>
      createMeasurementTemplateField(
        label,
        `${outfit.key}-${slugify(label)}-${index}`,
      ),
    ),
  ]),
);

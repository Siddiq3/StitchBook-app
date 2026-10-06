const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");
const root = path.resolve(__dirname, "..");
function loadModule(file, imports = {}) {
  const { code } = babel.transformSync(
    fs.readFileSync(path.join(root, file), "utf8"),
    {
      configFile: false,
      babelrc: false,
      plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    }
  );
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      assert.ok(name in imports, `Unexpected dependency ${name}`);
      return imports[name];
    },
  });
  return exports;
}
const theme = loadModule("utils/theme.js", {
  "react-native": {
    Dimensions: { get: () => ({ width: 360, height: 800 }) },
    PixelRatio: { roundToNearestPixel: (value) => value },
  },
});
test("status labels and tones support API and legacy spelling", () => {
  for (const status of [
    "in_progress",
    "In Progress",
    "in-progress",
    " IN_PROGRESS ",
  ]) {
    assert.equal(theme.getStatusTone(status).labelKey, "inProgress");
  }
  for (const status of [
    "pending",
    "cutting",
    "stitching",
    "ready",
    "delivered",
    "urgent",
    "overdue",
    "cancelled",
  ]) {
    assert.equal(theme.getStatusTone(status).labelKey, status);
  }
  assert.equal(
    theme.getStatusTone("Delivered").color,
    theme.colors123.deliveredText
  );
  assert.equal(theme.getStatusTone("started").labelKey, "pending");
  assert.equal(theme.getStatusTone("New").labelKey, "pending");
  assert.equal(theme.getStatusTone("future_stage").labelKey, undefined);
});
test("premium SaaS visual tokens stay consistent", () => {
  assert.equal(theme.COLORS.primary, "#007FFF");
  assert.equal(theme.COLORS.primaryLight, "#EAF4FF");
  assert.equal(theme.COLORS.background, "#F4F7FB");
  assert.equal(theme.COLORS.surface, "#FFFFFF");
  assert.equal(theme.COLORS.text, "#101828");
  assert.equal(theme.spacing.xxs, 4);
  assert.equal(theme.spacing.xs, 8);
  assert.equal(theme.spacing.sm, 12);
  assert.equal(theme.spacing.md, 16);
  assert.equal(theme.spacing.lg, 24);
  assert.equal(theme.spacing.xl, 32);
  assert.equal(theme.spacing.xxl, 48);
  assert.equal(theme.radius.sm, 10);
  assert.equal(theme.radius.md, 14);
  assert.equal(theme.radius.lg, 18);
  assert.equal(theme.radius.xl, 22);
  assert.equal(theme.SIZES.buttonHSm, 44);
  assert.equal(theme.SIZES.inputH, 48);
});

test("compatibility tokens share one palette and loaded font families", () => {
  const system = loadModule("utils/designSystem.js", { "./theme": theme });
  assert.equal(system.BRAND_COLORS.primary, theme.COLORS.primary);
  assert.equal(system.SPACING.md, theme.spacing.md);
  assert.equal(system.RADIUS.md, theme.radius.md);
  assert.equal(system.TEXT_STYLES.bodyMedium.fontFamily, "Inter_400Regular");
  for (const weight of ["regular", "medium", "semibold", "bold", "extrabold"]) {
    assert.match(theme.fonts[weight], /^Inter_/);
  }
});
test("grids fit narrow forms, nested panels and tablet sheets", () => {
  const { getGridLayout } = loadModule("utils/layout.js");
  assert.equal(getGridLayout(328).columns, 1);
  assert.equal(getGridLayout(348).columns, 2);
  assert.equal(getGridLayout(560).columns, 2);
  assert.equal(getGridLayout(0).columns, 1);
  // Numeric cards and measurement summaries remain paired inside phone panels.
  for (const width of [296, 328, 360]) {
    const compact = getGridLayout(width, 140);
    assert.equal(compact.columns, 2);
    assert.ok(compact.columns * compact.itemWidth + 12 <= width);
  }
  assert.equal(getGridLayout(280, 140).columns, 1);
  for (const width of [280, 328, 348, 560, 1000]) {
    const { columns, itemWidth } = getGridLayout(width);
    assert.ok(columns * itemWidth + (columns - 1) * 12 <= width + 0.001);
  }
});
test("literal translation keys resolve in English across the mobile source", () => {
  const source = fs
    .readFileSync(path.join(root, "localization/translations.js"), "utf8")
    .replace(/export const /g, "const ");
  const box = {};
  vm.runInNewContext(source + "\nthis.translate = getTranslation;", box);
  const missing = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (file.endsWith(".js")) {
        for (const match of fs
          .readFileSync(file, "utf8")
          .matchAll(/\bt\(["']([^"']+)["']\)/g)) {
          if (box.translate("en", match[1]) === match[1])
            missing.push(`${path.relative(root, file)}: ${match[1]}`);
        }
      }
    }
  }
  for (const dir of ["screens", "components", "navigation"])
    scan(path.join(root, dir));
  assert.deepEqual(missing, []);
});

test("UI theme references have an import or local binding", () => {
  const traverse = require("@babel/traverse").default;
  const tokens = new Set(["spacing", "radius", "colors123", "fonts", "typography", "SIZES", "normalize"]);
  const unbound = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (file.endsWith(".js")) {
        const ast = babel.parseSync(fs.readFileSync(file, "utf8"), {
          configFile: false,
          babelrc: false,
          parserOpts: { plugins: ["jsx"] },
        });
        traverse(ast, {
          ReferencedIdentifier(reference) {
            const name = reference.node.name;
            if (tokens.has(name) && !reference.scope.hasBinding(name)) {
              unbound.push(`${path.relative(root, file)}:${reference.node.loc.start.line} ${name}`);
            }
          },
        });
      }
    }
  }
  for (const dir of ["screens", "components", "navigation"]) scan(path.join(root, dir));
  assert.deepEqual(unbound, [], "Unbound theme tokens can crash the app while loading modules");
});
test("order amounts never go negative and pick a payment status", () => {
  const amounts = (order) => ({ ...theme.getOrderAmounts(order) });
  assert.deepEqual(amounts({ total_amount: 1000, advance_paid: 400 }), { total: 1000, paid: 400, balance: 600, paymentStatus: "partially_paid" });
  assert.equal(amounts({ total_amount: 500, advance_paid: 700 }).balance, 0);
  assert.equal(amounts({ amount: "800", balance_due: 0 }).paymentStatus, "paid");
  assert.equal(amounts({ totalAmount: 300 }).paymentStatus, "unpaid");
  assert.equal(amounts({}).balance, 0);
  assert.equal(theme.getStatusTone("partially_paid").labelKey, "partiallyPaid");
});
test("phone input is lenient and display is consistent", () => {
  const phone = loadModule("utils/formHelpers.js", { "../services/outfitTypes": { getOutfitLabel: (id) => id } });
  for (const raw of ["+91 98765-43210", "098765 43210", "(98765) 43210", "9876543210"]) {
    assert.equal(phone.normalizePhone(raw), "9876543210");
    assert.equal(phone.formatPhone(raw), "98765 43210");
  }
  assert.equal(phone.isValidPhone("12345"), false);
});
test("dates use the local calendar day and accept API shapes", () => {
  const h = loadModule("utils/formHelpers.js", { "../services/outfitTypes": { getOutfitLabel: (id) => (id === "blouse" ? "Blouse" : id) } });
  assert.equal(h.toLocalDateKey(new Date(2026, 9, 11, 0, 30)), "2026-10-11");
  assert.equal(h.getDeliveryDateKey({ delivery_date: "2026-10-11" }), "2026-10-11");
  assert.equal(h.getDeliveryDateKey({ deliveryDate: null }), "");
  assert.equal(h.getOrderItemsText({ items: [{ type: "blouse" }, { typeLabel: "Kurti" }] }), "Blouse +1");
  assert.equal(JSON.stringify(h.getMeasurementEntries({ outfitType: "blouse", outfitLabel: "Blouse", Chest: "34", Waist: "" })), JSON.stringify([["Chest", "34"]]));
});
test("compact amounts read naturally in Indian units", () => {
  assert.equal(theme.formatCompactCurrency(2000), "₹2,000");
  assert.equal(theme.formatCompactCurrency(150000), "₹1.5L");
  assert.equal(theme.formatCompactCurrency(20000000), "₹2Cr");
});
test("measurement payloads keep only positive numeric body measurements", () => {
  const h = loadModule("utils/formHelpers.js", { "../services/outfitTypes": { getOutfitLabel: (id) => id } });
  const out = h.cleanMeasurementValues({ id: 1, customer_id: 5, createdAt: "2026-10-06T10:00:00Z", outfitType: "kurta", outfitLabel: "Kurta", Chest: "40", Waist: "", Hip: "abc", Neck: 0, Sleeve: "22.5" });
  assert.equal(JSON.stringify(out), JSON.stringify({ Chest: 40, Sleeve: 22.5 }));
});

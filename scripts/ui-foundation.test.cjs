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

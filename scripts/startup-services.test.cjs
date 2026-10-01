const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");
const root = path.resolve(__dirname, "..");

function load(file, imports) {
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
    require(name) {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

function nativeModules({
  platform = "android",
  environment = "bare",
  linked = false,
} = {}) {
  const google = { GoogleSignin: {} },
    msg91 = { OTPWidget: {} };
  const imports = {
    "expo-constants": { executionEnvironment: environment },
    "react-native": {
      Platform: { OS: platform },
      NativeModules: linked ? { BiometricAuth: {} } : {},
      TurboModuleRegistry: { get: () => (linked ? {} : null) },
    },
  };
  // Unlinked SDK imports deliberately have no mock: requiring one fails the test.
  if (linked)
    Object.assign(imports, {
      "@react-native-google-signin/google-signin": google,
      "@msg91comm/sendotp-react-native": msg91,
    });
  return {
    module: load("services/nativeAuthModules.js", imports),
    google,
    msg91,
  };
}

test("missing native modules never import enforcing SDK entry points", () => {
  const { module } = nativeModules();
  assert.equal(module.getNativeGoogleModule(), null);
  assert.equal(module.getMsg91Module(), null);
});

test("Expo Go and web skip native auth SDKs", () => {
  for (const options of [{ environment: "storeClient" }, { platform: "web" }]) {
    const { module } = nativeModules(options);
    assert.equal(module.getNativeGoogleModule(), null);
    assert.equal(module.getMsg91Module(), null);
  }
});

test("linked Android builds keep native Google and OTP SDKs available", () => {
  const { module, google, msg91 } = nativeModules({ linked: true });
  assert.equal(module.getNativeGoogleModule(), google);
  assert.equal(module.getNativeGoogleModule(), google);
  assert.equal(module.getMsg91Module(), msg91);
});

test("extracted auth persistence preserves keys, tokens and logout cleanup", async () => {
  const secure = new Map(),
    local = new Map();
  const storage = load("services/authStorage.js", {
    "expo-secure-store": {
      setItemAsync: async (k, v) => secure.set(k, v),
      getItemAsync: async (k) => secure.get(k) ?? null,
      deleteItemAsync: async (k) => secure.delete(k),
    },
    "@react-native-async-storage/async-storage": {
      setItem: async (k, v) => local.set(k, v),
      getItem: async (k) => local.get(k) ?? null,
      multiRemove: async (keys) => keys.forEach((k) => local.delete(k)),
    },
  }).default;
  await storage.saveAuth("token", "refresh", { id: 42 });
  assert.equal(await storage.getToken(), "token");
  assert.equal(await storage.getRefreshToken(), "refresh");
  assert.equal((await storage.getUser()).id, 42);
  await storage.setToken("renewed");
  await storage.setRefreshToken("rotated");
  assert.equal(secure.get("auth_token"), "renewed");
  assert.equal(secure.get("auth_refresh"), "rotated");
  await storage.saveShop({ id: 7 });
  local.set("measurements_cache", "cached");
  local.set("unrelated", "preserved");
  await storage.clearAll();
  assert.equal(secure.size, 0);
  assert.equal(await storage.getUser(), null);
  assert.equal(await storage.getShop(), null);
  assert.equal(local.has("measurements_cache"), false);
  assert.equal(local.get("unrelated"), "preserved");
});

test("local service imports form an acyclic graph", () => {
  const active = new Set(),
    visited = new Set();
  function visit(file) {
    assert.equal(active.has(file), false, `Service import cycle at ${file}`);
    if (visited.has(file)) return;
    active.add(file);
    const source = fs.readFileSync(file, "utf8");
    for (const [, specifier] of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
      const dependency = path.resolve(path.dirname(file), `${specifier}.js`);
      if (fs.existsSync(dependency)) visit(dependency);
    }
    active.delete(file);
    visited.add(file);
  }
  for (const file of fs.readdirSync(path.join(root, "services"))) {
    if (file.endsWith(".js")) visit(path.join(root, "services", file));
  }
});

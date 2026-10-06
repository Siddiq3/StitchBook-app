const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const babel = require("@babel/core");
function load(file, imports = {}) {
  const { code } = babel.transformSync(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      babelrc: false,
      configFile: false,
      plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    }
  );
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    require: (n) => {
      assert.ok(n in imports, `Unexpected import ${n}`);
      return imports[n];
    },
  });
  return module.exports;
}
const { mergePage } = load("utils/pagination.js");
const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((r, j) => {
    resolve = r;
    reject = j;
  });
  return { promise, resolve, reject };
};
const response = (ids, page, total) => ({
  data: {
    data: {
      orders: ids.map((id) => ({ id })),
      pagination: { page, total, hasMore: page * 50 < total },
      summary: { total },
    },
  },
});
function hookHarness(fetchPage) {
  const slots = [];
  let index = 0,
    pending,
    cleanup;
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  const react = {
    useRef(initial) {
      const i = index++;
      return (slots[i] ??= { current: initial });
    },
    useState(initial) {
      const i = index++;
      slots[i] ??= initial;
      return [
        slots[i],
        (updater) => {
          slots[i] =
            typeof updater === "function" ? updater(slots[i]) : updater;
        },
      ];
    },
    useCallback(fn, deps) {
      const i = index++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { fn, deps };
      return slots[i].fn;
    },
  };
  const useList = load("hooks/usePagedList.js", {
    react,
    "@react-navigation/native": {
      useFocusEffect(fn) {
        const i = index++;
        if (slots[i] !== fn) {
          slots[i] = fn;
          pending = fn;
        }
      },
    },
    "../utils/pagination": { mergePage },
  }).default;
  return {
    render(params = {}) {
      index = 0;
      const value = useList(fetchPage, "orders", params);
      if (pending) {
        cleanup?.();
        cleanup = pending();
        pending = null;
      }
      return value;
    },
    blur() {
      cleanup?.();
    },
  };
}
test("pages replace on refresh and deduplicate IDs when appending", () => {
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        mergePage(
          [{ id: 1 }, { id: 2 }],
          [{ id: "2", name: "updated" }, { id: 3 }],
          2
        )
      )
    ),
    [{ id: 1 }, { id: "2", name: "updated" }, { id: 3 }]
  );
  assert.equal(mergePage([{ id: 1 }], [{ id: 9 }], 1).length, 1);
});
test("search reset ignores late responses and clears previous customer/order results", async () => {
  const first = deferred(),
    second = deferred();
  const calls = [];
  const h = hookHarness((params) => {
    calls.push(params);
    return calls.length === 1 ? first.promise : second.promise;
  });
  h.render({ search: "old" });
  h.render({ search: "new" });
  second.resolve(response([9], 1, 1));
  await tick();
  first.resolve(response([1], 1, 1));
  await tick();
  const list = h.render({ search: "new" });
  assert.equal(list.items[0].id, 9);
  assert.equal(list.summary.total, 1);
  assert.equal(list.loading, false);
  assert.equal(calls[0].limit, 50);
  assert.equal(calls[1].page, 1);
});
test("load more prevents duplicate in-flight pages and retries failed pages without dropping data", async () => {
  const next = deferred();
  let calls = 0;
  const h = hookHarness(() => {
    calls++;
    if (calls === 1) return Promise.resolve(response([1, 2], 1, 101));
    if (calls === 2) return next.promise;
    return Promise.resolve(response([2, 3], 2, 101));
  });
  h.render();
  await tick();
  let list = h.render();
  const request = list.loadMore();
  list.loadMore();
  assert.equal(calls, 2);
  next.reject(new Error("offline"));
  await request;
  list = h.render();
  assert.equal(list.items.length, 2);
  assert.equal(list.error, "offline");
  await list.loadMore();
  list = h.render();
  assert.equal(list.items.length, 3);
  assert.equal(list.pagination.page, 2);
  assert.equal(list.error, null);
});
test("refresh cancels pending pagination and blur ignores late responses", async () => {
  let calls = 0;
  const next = deferred(),
    refresh = deferred();
  const h = hookHarness(() =>
    ++calls === 1
      ? Promise.resolve(response([1], 1, 101))
      : calls === 2
      ? next.promise
      : refresh.promise
  );
  h.render();
  await tick();
  const list = h.render();
  const more = list.loadMore();
  const reload = list.reload();
  refresh.resolve(response([5], 1, 1));
  await reload;
  next.resolve(response([2], 2, 101));
  await more;
  assert.equal(h.render().items[0].id, 5);
  assert.equal(h.render().items.length, 1);
  const late = deferred();
  const other = hookHarness(() => late.promise);
  other.render();
  other.blur();
  late.resolve(response([99], 1, 1));
  await tick();
  assert.equal(other.render().items.length, 0);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const stitch = true;
function setup(status) {
  let handler, requests = 0, refreshes = 0, clears = 0;
  const api = Object.assign(async () => { requests++; return 'retried'; }, {
    interceptors: { request: { use() {} }, response: { use(ok, fail) { handler = fail; } } },
    defaults: { headers: { common: {} } },
    request: async () => { requests++; return 'retried'; },
  });
  const storage = { getToken: async () => 'current', getRefreshToken: async () => 'refresh', clearAll: async () => { clears++; }, setToken: async () => {}, setRefreshToken: async () => {} };
  const axios = { create: () => api, post: async () => { refreshes++; if (status) throw { response: { status } }; return { data: stitch ? { data: { token: 'next', refreshToken: 'next-refresh' } } : { accessToken: 'next', refreshToken: 'next-refresh' } }; } };
  const path = stitch ? 'services/api.js' : 'src/api/client.js';
  let source = fs.readFileSync(path, 'utf8').replace(/^import .*;\s*$/gm, '').replace(/export default api;/g, '').replace(/export /g, '');
  const context = { axios, storage, Constants: {}, Platform: { OS: 'android' }, process: { env: {} } };
  vm.createContext(context);
  vm.runInContext(source + (stitch ? '' : '\nbuildApi({getAccessToken:()=>"current",getRefreshToken:async()=>"refresh",setSession:async()=>{},clearSession:async()=>{clearCount();}});'), Object.assign(context, { clearCount: () => { clears++; } }));
  return { run: (token = 'current') => handler({ response: { status: 401 }, config: { url: '/private', headers: { Authorization: `Bearer ${token}` } } }), counts: () => ({ requests, refreshes, clears }) };
}
test('late 401 retries with already renewed token without rotating again', async () => {
  const s = setup(); await s.run('old'); assert.deepEqual(s.counts(), { requests: 1, refreshes: 0, clears: 0 });
});
for (const status of [429, 500, 503]) test(`refresh ${status} preserves saved session`, async () => {
  const s = setup(status); await assert.rejects(s.run()); assert.equal(s.counts().clears, 0);
});
test('refresh 401 clears rejected session', async () => {
  const s = setup(401); await assert.rejects(s.run()); assert.equal(s.counts().clears, 1);
});
test('successful renewal retries original request', async () => {
  const s = setup(); await s.run(); assert.deepEqual(s.counts(), { requests: 1, refreshes: 1, clears: 0 });
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = require('node:path').resolve(__dirname, '..');
const req = createRequire(root + '/package.json');
function load(file, imports) {
  const {code} = req('@babel/core').transformSync(fs.readFileSync(root + '/' + file, 'utf8'), {
    configFile:false, babelrc:false,
    presets:[[req.resolve('@babel/preset-react'), {runtime:'classic'}]],
    plugins:[req.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const exports = {};
  vm.runInNewContext(code, {exports, setTimeout, clearTimeout, console, require(name) {
    assert.ok(name in imports, 'Unexpected import ' + name); return imports[name];
  }});
  return exports;
}
function provider({shopError, subscriptionError} = {}) {
  let state, cleared = 0, savedShop;
  const effects = [];
  const session = {token:'test-token',user:{id:1},shop:{id:7}};
  const react = {
    createContext:() => ({Provider:'provider'}),
    useState(initial) {state = initial; return [state, updater => {state = typeof updater === 'function' ? updater(state) : updater;}];},
    useEffect: callback => effects.push(callback),
    useCallback:callback => callback,
    useRef:initial => ({current:initial}),
    createElement:(_type,props) => props,
  };
  let orderCalls = 0;
  const api = {
    shopApi:{get:async () => {if(shopError) throw shopError; return {data:{data:session.shop}};}},
    subscriptionApi:{getStatus:async () => {if(subscriptionError) throw subscriptionError; return {data:{data:{isActive:true}}};}},
    customerApi:{getAll:async () => ({data:{data:{customers:[{id:3}],pagination:{total:1}}}})},
    orderApi:{getAll:async () => {orderCalls++; return {data:{data:{orders:[{id:4}],pagination:{total:1}}}};}},
  };
  const module = load('context/StitchProContext.js', {
    react,
    '../services/authService':{authService:{restoreSession:async () => session,loginWithGoogle:async () => session,registerWithPassword:async () => session}},
    '../services/storage':{storage:{saveShop:async shop=>{savedShop=shop;},clearAll:async()=>{cleared++;}}},
    '../services/api':api,
    '../utils/formHelpers':{toLocalDateKey:()=>'2026-01-01'},
  });
  const value = module.StitchProProvider({children:null}).value;
  return {value, effects, state:()=>state, cleared:()=>cleared, savedShop:()=>savedShop, orderCalls:()=>orderCalls};
}
const networkError = () => new Error('Network unavailable');
const shopResponseError = (status, message, code) => ({response:{status,data:{message,error:code ? {code} : null}}});
for (const code of [undefined, 'SHOP_NOT_FOUND']) {
  test(`first-time password signup opens shop setup with ${code || 'legacy'} missing-shop response`, async()=>{
    const p=provider({shopError:shopResponseError(404,'Shop not found',code)});
    await p.value.registerWithPassword({name:'New owner',email:'new@example.com',password:'stitch123'});
    assert.equal(p.state().isAuthenticated,true);
    assert.equal(p.state().shop,null);
    assert.equal(p.state().shopError,null);
    assert.equal(p.savedShop(),null);
  });
}
test('missing shop on restart clears stale shop cache and opens setup', async()=>{
  const p=provider({shopError:shopResponseError(404,'Shop not found','SHOP_NOT_FOUND')});
  p.effects[0]();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(p.state().isAuthenticated,true);
  assert.equal(p.state().shop,null);
  assert.equal(p.state().shopError,null);
  assert.equal(p.savedShop(),null);
});
for (const error of [networkError(),shopResponseError(500,'Shop not found'),shopResponseError(404,'Route not found'),shopResponseError(403,'Permission denied')]) {
  test(`signup preserves recovery screen for real shop failure: ${error.response?.status || 'network'}`, async()=>{
    const p=provider({shopError:error});
    await p.value.registerWithPassword({});
    assert.equal(p.state().isAuthenticated,true);
    assert.ok(p.state().shopError);
    assert.equal(p.savedShop(),undefined);
  });
}
test('successful login retains authenticated session and shop', async()=>{
  const p=provider(); await p.value.loginWithGoogle('test-id-token');
  assert.equal(p.state().isAuthenticated,true); assert.equal(p.state().shop.id,7);
});
test('customer and order API payloads populate state', async()=>{
  const p=provider(); await p.value.fetchCustomers(); await p.value.fetchOrders();
  assert.equal(p.state().customers[0].id,3); assert.equal(p.state().orders[0].id,4);
  assert.equal(p.state().customersLoading,false); assert.equal(p.state().ordersLoading,false);
});
test('identical list requests are reused until forced or invalidated', async()=>{
  const p=provider();
  await Promise.all([p.value.fetchOrders(), p.value.fetchOrders()]);
  await p.value.fetchOrders();
  assert.equal(p.orderCalls(),1,'Repeat list request within the freshness window hit the API');
  await p.value.fetchOrders({force:true});
  assert.equal(p.orderCalls(),2,'Pull-to-refresh must always reach the API');
  await p.value.fetchOrders({status:'ready'});
  assert.equal(p.orderCalls(),3,'Different filters must not reuse another list');
});
test('subscription network failure must not turn successful login into auth failure', async()=>{
  const p=provider({subscriptionError:networkError()});
  await p.value.loginWithGoogle('test-id-token').catch(()=>{});
  assert.equal(p.state().isAuthenticated,true,'Valid Google login was incorrectly marked unauthenticated');
});
test('temporary subscription outage during boot must preserve stored credentials', async()=>{
  const p=provider({subscriptionError:networkError()}); p.effects[0]();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(p.cleared(),0,'Boot erased valid credentials after subscription fetch failed');
});
test('temporary shop outage must retain restored shop instead of sending user to onboarding', async()=>{
  const p=provider({shopError:networkError()}); p.effects[0]();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(p.state().shop?.id,7,'Cached shop was discarded on a network error');
});
test('logout must remove locally saved customer measurement records', async()=>{
  const local = new Map([['measurement_3_shirt_123',{chest:40}],['unrelated','keep']]);
  const storage=load('services/authStorage.js',{
    'expo-secure-store':{deleteItemAsync:async()=>{}},
    '@react-native-async-storage/async-storage':{getAllKeys:async()=>[...local.keys()],multiRemove:async keys=>keys.forEach(key=>local.delete(key))},
  }).default;
  await storage.clearAll();
  assert.equal(local.has('measurement_3_shirt_123'),false,'Customer measurements survive logout');
});

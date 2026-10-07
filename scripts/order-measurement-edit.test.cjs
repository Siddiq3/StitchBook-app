const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '..');
function load(file, imports) {
  const { code } = babel.transformSync(fs.readFileSync(path.join(root, file), 'utf8'), {
    configFile: false, babelrc: false,
    presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const exports = {};
  vm.runInNewContext(code, { exports, require(name) {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  }});
  return exports;
}
function harness(file, extra = {}) {
  const state = [];
  let cursor = 0;
  const effects = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (next) => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
    },
    useEffect(fn) { effects.push(fn); },
    useRef(value) { return { current: value }; },
    createElement(type, props, ...children) { return { type, props: { ...props, children } }; },
  };
  const toast = [];
  const imports = {
    react,
    'react-native': Object.fromEntries(['View', 'Text', 'TouchableOpacity', 'ScrollView', 'TextInput', 'Pressable'].map(name => [name, name])),
    '@expo/vector-icons/Ionicons': 'Icon',
    '../context/ToastContext': { useToast: () => ({ showToast: (...args) => toast.push(args) }) },
    '../context/LanguageContext': { useLanguage: () => ({ t: key => key }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    '../utils/theme': { colors123: {}, fonts: { base: {}, sm: {}, xs: {}, lg: {} }, spacing: {}, radius: {}, formatCurrency: String },
    '../utils/formHelpers': load('utils/formHelpers.js', { '../services/outfitTypes': { getOutfitLabel: String } }),
  };
  imports['react-native'].StyleSheet = { create: value => value };
  for (const name of ['OutfitIcon', 'ResponsiveGrid', 'AppButton', 'MeasurementFieldThumb', 'MeasurementPickerModal', 'MeasurementSheet', 'StitchOptionsSheet', 'BottomSheet', 'AppCard', 'AvatarBadge', 'MeasurementFigure']) {
    imports[`../components/${name}`] = name;
    imports[`./${name}`] = name;
  }
  imports['../components/AccessibleMotionView'] = imports['./AccessibleMotionView'] = { MotiView: 'MotiView' };
  const Component = load(file, { ...imports, ...extra }).default;
  return { toast, render(props) { cursor = 0; effects.length = 0; return Component(props); }, effects };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
function find(tree, type, predicate = () => true) {
  const node = nodes(tree).find(node => node.type === type && predicate(node.props));
  assert.ok(node, `Missing ${type}`);
  return node.props;
}
for (const dataKey of ['measurementsData', 'measurements_data']) {
  test(`selected ${dataKey} can be edited, cancelled and saved as an isolated item snapshot`, async () => {
    const h = harness('screens/CreateItemDetail.js');
    let saved;
    const props = { outfitType: { id: 'shirt', label: 'Shirt' }, customerId: 4, onSave: item => { saved = item; } };
    const profile = Object.freeze({ id: 7, outfit_type: 'shirt', outfit_label: 'Regular fit', [dataKey]: Object.freeze({ Chest: 40, Waist: 34 }) });
    let tree = h.render(props);
    find(tree, 'MeasurementPickerModal').onSelect(profile);
    tree = h.render(props);
    const editButton = nodes(tree).find(node => node.type === 'TouchableOpacity' && nodes(node).some(child => child.type === 'Text' && child.props.children.includes('editOrderMeasurements')));
    assert.ok(editButton);
    editButton.props.onPress();
    tree = h.render(props);
    assert.equal(find(tree, 'MeasurementSheet').visible, true);
    assert.equal(find(tree, 'MeasurementSheet').initialValues[dataKey].Chest, 40);
    find(tree, 'MeasurementSheet').onClose();
    tree = h.render(props);
    assert.equal(find(tree, 'MeasurementSheet').visible, false);
    find(tree, 'MeasurementSheet').onSubmit({ Chest: '42.5', Waist: '34', outfitLabel: 'Order fit', id: 7 });
    tree = h.render(props);
    // Enter a price and save through the real item handler.
    find(tree, 'TextInput', p => p.keyboardType === 'decimal-pad').onChangeText('500');
    tree = h.render(props);
    await find(tree, 'AppButton', p => p.label === 'saveItem').onPress();
    assert.equal(saved.measurement_id, 7);
    assert.equal(saved.measurementData.Chest, 42.5);
    assert.equal(saved.measurementData.Waist, 34);
    assert.equal(saved.measurementSnapshot.measurementsData.Chest, 42.5);
    assert.equal(saved.measurementLabel, 'Order fit');
    assert.equal(saved.measurementData.id, undefined);
    assert.equal(profile[dataKey].Chest, 40);
  });
}
test('empty edits remain open and do not replace selected measurements', () => {
  const h = harness('screens/CreateItemDetail.js');
  const props = { outfitType: { id: 'shirt', label: 'Shirt' } };
  let tree = h.render(props);
  find(tree, 'MeasurementPickerModal').onSelect({ id: 1, measurementsData: { Chest: 40 } });
  tree = h.render(props);
  const editButton = nodes(tree).find(node => node.type === 'TouchableOpacity' && nodes(node).some(child => child.type === 'Text' && child.props.children.includes('editOrderMeasurements')));
  editButton.props.onPress();
  tree = h.render(props);
  find(tree, 'MeasurementSheet').onSubmit({ Chest: '', Waist: '0' });
  tree = h.render(props);
  assert.equal(find(tree, 'MeasurementSheet').visible, true);
  assert.equal(find(tree, 'MeasurementSheet').initialValues.measurementsData.Chest, 40);
  assert.equal(h.toast.at(-1)[1], 'error');
});
for (const dataKey of ['measurementsData', 'measurements_data']) {
  test(`measurement editor prefills ${dataKey} and submits changed and untouched fields`, () => {
    const h = harness('components/MeasurementSheet.js', {
      '../configs/measurementFieldsConfig': { shirt: { label: 'Shirt', fields: ['Chest', 'Waist'] } },
    });
    let form;
    const props = { visible: true, orderOnly: true, outfitType: { id: 'shirt', label: 'Shirt' }, initialValues: { [dataKey]: { Chest: 40, Waist: 34 } }, onSubmit: value => { form = value; } };
    h.render(props);
    h.effects[0]();
    let tree = h.render(props);
    assert.equal(find(tree, 'TextInput', p => p.keyboardType === 'decimal-pad' && p.value === '40').value, '40');
    find(tree, 'TextInput', p => p.value === '40').onChangeText('42.5');
    tree = h.render(props);
    find(tree, 'AppButton', p => p.label === 'applyMeasurements').onPress();
    assert.equal(form.Chest, '42.5');
    assert.equal(form.Waist, 34);
  });
}

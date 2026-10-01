const test=require('node:test');
const assert=require('node:assert/strict');
const {validateReleaseConfig}=require('./release-config.cjs');
const signed={UPLOAD_STORE_FILE:'/private/upload.jks',UPLOAD_STORE_PASSWORD:'test',UPLOAD_KEY_ALIAS:'upload',UPLOAD_KEY_PASSWORD:'test',EXPO_PUBLIC_API_BASE_URL:'https://api.example.org/api'};
test('unsigned verification is allowed, partial and debug signing fail',()=>{
  assert.equal(validateReleaseConfig({}),false);
  assert.equal(validateReleaseConfig(signed),true);
  assert.throws(()=>validateReleaseConfig({UPLOAD_KEY_ALIAS:'upload'}));
  assert.throws(()=>validateReleaseConfig({...signed,UPLOAD_STORE_FILE:'debug.keystore'}));
});
test('signed builds require explicit HTTPS API configuration',()=>{
  for(const url of [undefined,'auto','http://api.example.org','http://localhost:5002/api','https://127.0.0.1/api']) assert.throws(()=>validateReleaseConfig({...signed,EXPO_PUBLIC_API_BASE_URL:url}));
});

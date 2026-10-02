const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');

test('primary mobile auth uses email-or-mobile plus password and no Google login UI',()=>{
  const login=read('screens/LoginScreen.js');
  assert.match(login,/Email or mobile number/);
  assert.match(login,/loginWithPassword/);
  assert.match(login,/Password/);
  assert.doesNotMatch(login,/continueWithGoogle|loginWithGoogle|GoogleSignin|useIdTokenAuthRequest/);
});

test('registration requires name email mobile password and confirmation',()=>{
  const register=read('screens/RegisterScreen.js');
  for(const label of ['Your name','Email address','Mobile number','Password','Confirm password']) assert.match(register,new RegExp(label));
  assert.match(register,/registerWithPassword/);
  assert.match(register,/Passwords don't match/);
});

test('legacy authenticated accounts can reach password setup from settings',()=>{
  const settings=read('screens/SettingsScreen.js');
  const navigation=read('navigation/MainTabNavigator.js');
  assert.match(settings,/Password & security/);
  assert.match(settings,/navigation\.navigate\("Password"\)/);
  assert.match(navigation,/name="Password"/);
});

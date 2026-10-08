const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
// Screens render translation keys; check the key is used and its English text is right
const strings=read('localization/translations.js');
const usesLabel=(source,key,english)=>{
  assert.match(source,new RegExp(`t\\('${key}'\\)`));
  assert.ok(strings.includes(`"${key}": ${JSON.stringify(english)}`),`${key} should read "${english}"`);
};

test('primary mobile auth uses email-or-mobile plus password and no Google login UI',()=>{
  const login=read('screens/LoginScreen.js');
  usesLabel(login,'loginIdentifier','Email or mobile number');
  assert.match(login,/loginWithPassword/);
  assert.match(login,/Password/);
  assert.doesNotMatch(login,/continueWithGoogle|loginWithGoogle|GoogleSignin|useIdTokenAuthRequest/);
});

test('registration requires name email mobile password and confirmation',()=>{
  const register=read('screens/RegisterScreen.js');
  for(const [key,english] of [['registerName','Your name'],['authEmail','Email address'],['registerMobile','Mobile number'],['authPassword','Password'],['registerConfirm','Confirm password']]) usesLabel(register,key,english);
  assert.match(register,/registerWithPassword/);
  usesLabel(register,'authPasswordsMismatch',"Passwords don't match.");
});

test('legacy authenticated accounts can reach password setup from settings',()=>{
  const settings=read('screens/SettingsScreen.js');
  const navigation=read('navigation/MainTabNavigator.js');
  assert.match(settings,/t\("passwordSecurity"\)/);
  assert.match(settings,/navigation\.navigate\("Password"\)/);
  assert.match(navigation,/name="Password"/);
});


test('forgot password flow is linked from login and wired to public recovery APIs',()=>{
  const login=read('screens/LoginScreen.js');
  const recovery=read('screens/ForgotPasswordScreen.js');
  const api=read('services/api.js');
  const navigation=read('navigation/StitchProNavigator.js');
  usesLabel(login,'loginForgot','Forgot password?');
  assert.match(login,/ForgotPassword/);
  usesLabel(recovery,'forgotSendCode','Send verification code');
  usesLabel(recovery,'forgotReset','Reset password');
  assert.match(api,/\/auth\/forgot-password/);
  assert.match(api,/\/auth\/reset-password/);
  assert.match(navigation,/name="ForgotPassword"/);
});

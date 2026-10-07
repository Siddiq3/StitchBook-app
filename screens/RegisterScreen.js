import React,{useState} from 'react';
import {StyleSheet,Text,TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {PRIVACY_URL,TERMS_URL,openLink} from '../utils/legalLinks';
import AuthShell from '../components/AuthShell';
import {colors123,fonts,spacing,typography} from '../utils/theme';

const validEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
const validPhone=(value)=>{const d=String(value||'').replace(/\D/g,'');return d.length===10||(d.length===12&&d.startsWith('91'));};
const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

export default function RegisterScreen({navigation}){
  const {registerWithPassword}=useStitchPro();
  const {showToast}=useToast();
  const [form,setForm]=useState({name:'',email:'',phone:'',password:'',confirm:''});
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const set=(key)=>(value)=>{setForm(prev=>({...prev,[key]:value}));setError('');};

  const submit=async()=>{
    if(form.name.trim().length<2){setError('Enter your name.');return;}
    if(!validEmail(form.email)){setError('Enter a valid email address.');return;}
    if(!validPhone(form.phone)){setError('Enter a valid 10-digit mobile number.');return;}
    if(!validPassword(form.password)){setError('Password must be at least 8 characters with a letter and a number.');return;}
    if(form.password!==form.confirm){setError("Passwords don't match.");return;}
    setLoading(true);setError('');
    try{
      await registerWithPassword({name:form.name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone.trim(),password:form.password});
      showToast('Account created','success');
    }catch(err){
      const message=err.response?.data?.message||err.message||'Could not create account';
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  return <AuthShell
    title="Create your account"
    subtitle="Set up your shop in a minute. Includes a 10-day free trial."
    onBack={()=>navigation.goBack()}
    footer={<TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.goBack()}>
      <Text style={s.altMuted}>Already have an account? </Text><Text style={s.altLink}>Sign in</Text>
    </TouchableOpacity>}>
    <IconInput label="Your name" icon="account-outline" value={form.name} onChangeText={set('name')} placeholder="Enter your name" autoCapitalize="words" autoComplete="name"/>
    <IconInput label="Email address" icon="email-outline" value={form.email} onChangeText={set('email')} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"/>
    <IconInput label="Mobile number" icon="phone-outline" value={form.phone} onChangeText={set('phone')} placeholder="Enter your mobile number" keyboardType="phone-pad" autoComplete="tel"/>
    <IconInput
      label="Password"
      icon="lock-outline"
      value={form.password}
      onChangeText={set('password')}
      placeholder="Create a password"
      secureTextEntry={!showPassword}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="new-password"
      hint="8 or more characters, with a letter and a number."
      right={
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
          <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
        </TouchableOpacity>
      }
    />
    <IconInput label="Confirm password" icon="lock-check-outline" value={form.confirm} onChangeText={set('confirm')} placeholder="Re-enter your password" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit}/>
    {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
    <AppButton label="Create account" loading={loading} onPress={submit} size="lg"/>
    <Text style={s.legal}>
      By creating an account, you agree to the{' '}
      <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(TERMS_URL)}>Terms of service</Text>
      {' '}and{' '}
      <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(PRIVACY_URL)}>Privacy policy</Text>.
    </Text>
  </AuthShell>;
}

const s=StyleSheet.create({
  error:{...typography.small,color:colors123.danger},
  legal:{...typography.caption,color:colors123.textMuted,textAlign:'center'},
  legalLink:{color:colors123.primary,fontFamily:fonts.semibold,textDecorationLine:'underline'},
  alt:{minHeight:48,alignItems:'center',justifyContent:'center',flexDirection:'row',marginTop:spacing.sm},
  altMuted:{...typography.small,color:colors123.textMuted},
  altLink:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

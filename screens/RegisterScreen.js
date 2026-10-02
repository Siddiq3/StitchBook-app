import React,{useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,fonts,radius,spacing,typography} from '../utils/theme';

const validEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
const validPhone=(value)=>{const d=String(value||'').replace(/\D/g,'');return d.length===10||(d.length===12&&d.startsWith('91'));};
const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

export default function RegisterScreen({navigation}){
  const insets=useSafeAreaInsets();
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

  return <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
    <StatusBar style="dark"/>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll,{paddingTop:insets.top+20}]}>
      <TouchableOpacity accessibilityRole="button" style={s.back} onPress={()=>navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors123.text}/><Text style={s.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={s.title}>Create your account</Text>
      <Text style={s.subtitle}>Use one account for StitchBook on mobile and web.</Text>

      <View style={s.card}>
        <IconInput label="Your name" icon="account-outline" value={form.name} onChangeText={set('name')} placeholder="Full name" autoCapitalize="words" autoComplete="name"/>
        <IconInput label="Email address" icon="email-outline" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"/>
        <IconInput label="Mobile number" icon="phone-outline" value={form.phone} onChangeText={set('phone')} placeholder="98765 43210" keyboardType="phone-pad" autoComplete="tel"/>
        <IconInput
          label="Password"
          icon="lock-closed-outline"
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
        <AppButton label="Create account" loading={loading} onPress={submit}/>
        <Text style={s.legal}>By creating an account, you confirm these details belong to you and your tailoring business.</Text>
      </View>

      <TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.goBack()}>
        <Text style={s.altMuted}>Already have an account? </Text><Text style={s.altLink}>Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const s=StyleSheet.create({
  container:{flex:1,backgroundColor:colors123.background},
  scroll:{flexGrow:1,paddingHorizontal:20,paddingBottom:spacing.xl},
  back:{minHeight:44,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,paddingRight:12},
  backText:{...typography.small,color:colors123.text},
  title:{...typography.h1,color:colors123.text,marginTop:spacing.sm},
  subtitle:{...typography.small,color:colors123.textMuted,marginTop:6,marginBottom:spacing.lg},
  card:{backgroundColor:colors123.surface,borderRadius:radius.lg,borderWidth:1,borderColor:colors123.borderLight,padding:20,gap:spacing.md},
  error:{...typography.small,color:colors123.danger},
  legal:{...typography.caption,color:colors123.textMuted,textAlign:'center'},
  alt:{minHeight:52,alignItems:'center',justifyContent:'center',flexDirection:'row',marginTop:spacing.sm},
  altMuted:{...typography.small,color:colors123.textMuted},
  altLink:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

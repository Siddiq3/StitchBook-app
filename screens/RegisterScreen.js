import React,{useEffect,useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import Reveal from '../components/Reveal';
import {PRIVACY_URL,TERMS_URL,openLink} from '../utils/legalLinks';
import {colors123,fonts,radius,spacing,typography} from '../utils/theme';

const validEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
const validPhone=(value)=>{const d=String(value||'').replace(/\D/g,'');return d.length===10||(d.length===12&&d.startsWith('91'));};
const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

const STEPS={
  1:{title:'Create your account',subtitle:'Start with a few details about you.'},
  2:{title:'Secure your account',subtitle:'Choose a password you will use to sign in.'},
};

// Two short steps instead of one long form: details first, password second.
// The action stays pinned at the bottom, near the thumb, like the rest of first run.
export default function RegisterScreen({navigation}){
  const insets=useSafeAreaInsets();
  const {registerWithPassword}=useStitchPro();
  const {showToast}=useToast();
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:'',email:'',phone:'',password:'',confirm:''});
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const set=(key)=>(value)=>{setForm(prev=>({...prev,[key]:value}));setError('');};

  // Android back on step 2 returns to step 1 instead of leaving sign-up
  useEffect(()=>navigation.addListener('beforeRemove',(event)=>{
    if(step!==2||!['GO_BACK','POP'].includes(event.data.action.type)) return;
    event.preventDefault();
    setStep(1);setError('');
  }),[navigation,step]);

  const back=()=>{ if(step===2){setStep(1);setError('');} else navigation.goBack(); };

  const next=()=>{
    if(form.name.trim().length<2){setError('Enter your name.');return;}
    if(!validPhone(form.phone)){setError('Enter a valid 10-digit mobile number.');return;}
    if(!validEmail(form.email)){setError('Enter a valid email address.');return;}
    setError('');setStep(2);
  };

  const submit=async()=>{
    if(!validPassword(form.password)){setError('Password must be at least 8 characters with a letter and a number.');return;}
    if(form.password!==form.confirm){setError("Passwords don't match.");return;}
    setLoading(true);setError('');
    try{
      await registerWithPassword({name:form.name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone.trim(),password:form.password});
      showToast('Account created','success');
    }catch(err){
      const message=err.response?.data?.message||err.message||'Could not create account';
      setError(message);showToast(message,'error');
      // A taken email or number is fixed on step 1
      if(/exists|already/i.test(message)) setStep(1);
    }finally{setLoading(false);}
  };

  const eye=<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
    <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
  </TouchableOpacity>;

  return <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
    <StatusBar style="dark"/>
    <View style={[s.topBar,{paddingTop:insets.top+spacing.xs}]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" onPress={back} hitSlop={8} style={s.back}>
        <Ionicons name="arrow-back" size={22} color={colors123.text}/>
      </TouchableOpacity>
      <View style={s.progress}>
        {[1,2].map((n)=><View key={n} style={[s.progressBar,n<=step&&s.progressBarActive]}/>)}
      </View>
      <Text style={s.stepLabel}>{step} of 2</Text>
    </View>

    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll,{paddingBottom:insets.bottom+spacing.md}]}>
      <Reveal key={step} style={s.body}>
        <Text accessibilityRole="header" style={s.title}>{STEPS[step].title}</Text>
        <Text style={s.subtitle}>{STEPS[step].subtitle}</Text>

        {step===1?<View style={s.fields}>
          <IconInput label="Your name" icon="account-outline" value={form.name} onChangeText={set('name')} placeholder="Enter your name" autoCapitalize="words" autoComplete="name" returnKeyType="next"/>
          <IconInput label="Mobile number" icon="phone-outline" value={form.phone} onChangeText={set('phone')} placeholder="10-digit mobile number" keyboardType="phone-pad" autoComplete="tel" maxLength={14}/>
          <IconInput label="Email address" icon="email-outline" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={next} hint="Used to sign in and to reset your password."/>
        </View>:<View style={s.fields}>
          <View style={s.who}>
            <View style={s.whoIcon}><Ionicons name="person" size={18} color={colors123.primary}/></View>
            <View style={{flex:1}}>
              <Text style={s.whoName} numberOfLines={1}>{form.name.trim()}</Text>
              <Text style={s.whoMeta} numberOfLines={1}>{form.email.trim().toLowerCase()}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={back} hitSlop={8}><Text style={s.link}>Edit</Text></TouchableOpacity>
          </View>
          <IconInput label="Password" icon="lock-outline" value={form.password} onChangeText={set('password')} placeholder="Create a password" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" hint="8 or more characters, with a letter and a number." right={eye}/>
          <IconInput label="Confirm password" icon="lock-check-outline" value={form.confirm} onChangeText={set('confirm')} placeholder="Re-enter your password" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit}/>
        </View>}
        {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
      </Reveal>

      <View style={s.footer}>
        {step===1
          ?<AppButton label="Continue" size="lg" onPress={next}/>
          :<AppButton label="Create account" size="lg" loading={loading} onPress={submit}/>}
        <TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.navigate('Login')}>
          <Text style={s.altMuted}>Already have an account? </Text><Text style={s.link}>Sign in</Text>
        </TouchableOpacity>
        <Text style={s.legal}>
          By creating an account, you agree to the{' '}
          <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(TERMS_URL)}>Terms of service</Text>
          {' '}and{' '}
          <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(PRIVACY_URL)}>Privacy policy</Text>.
        </Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const s=StyleSheet.create({
  container:{flex:1,backgroundColor:colors123.background},
  topBar:{flexDirection:'row',alignItems:'center',gap:spacing.sm,paddingHorizontal:spacing.md,paddingBottom:spacing.xs},
  back:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:colors123.surface,borderWidth:1,borderColor:colors123.borderLight},
  progress:{flex:1,flexDirection:'row',gap:6},
  progressBar:{flex:1,height:4,borderRadius:2,backgroundColor:colors123.borderLight},
  progressBarActive:{backgroundColor:colors123.primary},
  stepLabel:{...typography.caption,fontFamily:fonts.semibold,color:colors123.textMuted,minWidth:36,textAlign:'right'},
  scroll:{flexGrow:1,paddingHorizontal:24},
  body:{paddingTop:spacing.lg},
  title:{fontFamily:fonts.bold,fontSize:28,lineHeight:35,letterSpacing:-0.6,color:colors123.text},
  subtitle:{...typography.body,color:colors123.textSecondary,marginTop:6},
  fields:{gap:spacing.md,marginTop:spacing.lg},
  who:{flexDirection:'row',alignItems:'center',gap:spacing.sm,padding:spacing.sm,borderRadius:radius.md,backgroundColor:colors123.surface,borderWidth:1,borderColor:colors123.borderLight},
  whoIcon:{width:36,height:36,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:colors123.primarySoft},
  whoName:{fontFamily:fonts.semibold,fontSize:15,color:colors123.text},
  whoMeta:{...typography.caption,color:colors123.textMuted},
  error:{...typography.small,color:colors123.danger,marginTop:spacing.sm},
  footer:{marginTop:'auto',paddingTop:spacing.lg,gap:spacing.xs},
  alt:{minHeight:48,alignItems:'center',justifyContent:'center',flexDirection:'row'},
  altMuted:{...typography.small,color:colors123.textMuted},
  link:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
  legal:{...typography.caption,color:colors123.textMuted,textAlign:'center'},
  legalLink:{color:colors123.primary,fontFamily:fonts.semibold,textDecorationLine:'underline'},
});

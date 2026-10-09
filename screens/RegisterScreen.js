import React,{useCallback,useState} from 'react';
import {StyleSheet,Text,TouchableOpacity} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import {useLanguage} from '../context/LanguageContext';
import IconInput from '../components/IconInput';
import StepFlow from '../components/StepFlow';
import PasswordRules from '../components/PasswordRules';
import FillCard from '../components/FillCard';
import {PRIVACY_URL,TERMS_URL,openLink} from '../utils/legalLinks';
import {colors123,fonts,typography} from '../utils/theme';

const validEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
const validPhone=(value)=>String(value||'').replace(/\D/g,'').length===10;
const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

// One question per screen: email, name, mobile, password. Each step validates
// only its own field; a taken email or number sends the owner back to that step.
const STEPS=[
  {key:'email',title:'suEmailTitle',sub:'suEmailSub'},
  {key:'name',title:'suNameTitle',sub:'suNameSub'},
  {key:'phone',title:'suPhoneTitle',sub:'suPhoneSub'},
  {key:'password',title:'suPasswordTitle',sub:'suPasswordSub'},
];

export default function RegisterScreen({navigation}){
  const {t}=useLanguage();
  const focused=useIsFocused();
  const {registerWithPassword}=useStitchPro();
  const {showToast}=useToast();
  const [step,setStep]=useState(0);
  const [direction,setDirection]=useState(1);
  const [form,setForm]=useState({email:'',name:'',phone:'',password:'',confirm:''});
  const [showPassword,setShowPassword]=useState(false);
  const [errors,setErrors]=useState({});
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  const set=(key)=>(value)=>{
    setForm(prev=>({...prev,[key]:key==='phone'?value.replace(/\D/g,'').slice(-10):value}));
    setErrors(prev=>({...prev,[key]:undefined}));setError('');
  };
  const go=useCallback((next)=>{setDirection(next>step?1:-1);setErrors({});setError('');setStep(next);},[step]);
  const back=useCallback(()=>{ if(step>0) go(step-1); else navigation.goBack(); },[step,go,navigation]);

  const stepErrors=(index)=>{
    const e={};
    if(index===0&&!validEmail(form.email))e.email=t('authInvalidEmail');
    if(index===1&&form.name.trim().length<2)e.name=t('registerNameMissing');
    if(index===2&&!validPhone(form.phone))e.phone=t('registerMobileInvalid');
    if(index===3){
      if(!validPassword(form.password))e.password=t('authPasswordRule');
      else if(form.password!==form.confirm)e.confirm=t('authPasswordsMismatch');
    }
    return e;
  };

  const next=async()=>{
    const invalid=stepErrors(step);
    setErrors(invalid);
    if(Object.keys(invalid).length)return;
    if(step<STEPS.length-1){go(step+1);return;}
    setLoading(true);setError('');
    try{
      await registerWithPassword({name:form.name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone,password:form.password});
      showToast(t('registerDone'),'success');
    }catch(err){
      const serverMessage=err.response?.data?.message||err.message||'';
      if(/exists|already/i.test(serverMessage)){
        // Taken email or number: back to the email step with a plain message
        setDirection(-1);setStep(0);setErrors({email:t('registerExists')});
        return;
      }
      setError(serverMessage||t('registerFailed'));
    }finally{setLoading(false);}
  };

  const current=STEPS[step];
  // Answers already given (only steps behind the current one) fill the account card
  const done=(index,value)=>index<step?value:'';
  const scene=<FillCard icon="person" title={t('accountCardTitle')} current={step} rows={[
    {key:'email',icon:'mail-outline',placeholder:t('authEmail'),value:done(0,form.email.trim().toLowerCase())},
    {key:'name',icon:'person-outline',placeholder:t('registerName'),value:done(1,form.name.trim()),big:true},
    {key:'phone',icon:'call-outline',placeholder:t('registerMobile'),value:done(2,form.phone&&`+91 ${form.phone.slice(0,5)} ${form.phone.slice(5)}`)},
    {key:'password',icon:'lock-closed-outline',placeholder:t('authPassword'),value:done(3,'••••••••')},
  ]}/>;
  const eye=<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?t('authHidePassword'):t('authShowPassword')} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
    <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
  </TouchableOpacity>;

  return <StepFlow
    step={step} total={STEPS.length} direction={direction} active={focused}
    onBack={back} onNext={next} loading={loading}
    nextLabel={step===STEPS.length-1?t('authCreateAccount'):t('authContinue')}
    scene={scene} title={t(current.title)} subtitle={t(current.sub)} error={error}
    footer={<>
      <TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.navigate('Login')}>
        <Text style={s.altMuted}>{t('registerHaveAccount')}</Text><Text style={s.link}>{t('authSignIn')}</Text>
      </TouchableOpacity>
      {step===STEPS.length-1&&<Text style={s.legal}>
        {t('registerAgree')}{' '}
        <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(TERMS_URL)}>{t('authTerms')}</Text>
        {' '}{t('registerAnd')}{' '}
        <Text accessibilityRole="link" style={s.legalLink} onPress={()=>openLink(PRIVACY_URL)}>{t('authPrivacy')}</Text>.
      </Text>}
    </>}>
    {step===0&&<IconInput label={t('authEmail')} icon="email-outline" value={form.email} onChangeText={set('email')} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={next}/>}
    {step===1&&<IconInput label={t('registerName')} icon="account-outline" value={form.name} onChangeText={set('name')} error={errors.name} placeholder={t('registerNamePlaceholder')} autoCapitalize="words" autoComplete="name" returnKeyType="next" onSubmitEditing={next}/>}
    {step===2&&<IconInput label={t('registerMobile')} icon="phone-outline" prefix="+91" value={form.phone} onChangeText={set('phone')} error={errors.phone} placeholder={t('registerMobilePlaceholder')} keyboardType="number-pad" autoComplete="tel" maxLength={10} returnKeyType="next" onSubmitEditing={next}/>}
    {step===3&&<>
      <IconInput label={t('authPassword')} icon="lock-outline" value={form.password} onChangeText={set('password')} error={errors.password} placeholder={t('registerCreatePassword')} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" right={eye}/>
      <PasswordRules value={form.password} t={t}/>
      <IconInput label={t('registerConfirm')} icon="lock-check-outline" value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} hint={form.confirm&&form.confirm===form.password?t('pwMatch'):undefined} placeholder={t('registerConfirmPlaceholder')} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={next}/>
    </>}
  </StepFlow>;
}

const s=StyleSheet.create({
  alt:{minHeight:44,alignItems:'center',justifyContent:'center',flexDirection:'row'},
  altMuted:{...typography.small,color:colors123.textMuted},
  link:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
  legal:{...typography.caption,color:colors123.textMuted,textAlign:'center'},
  legalLink:{color:colors123.primary,fontFamily:fonts.semibold,textDecorationLine:'underline'},
});

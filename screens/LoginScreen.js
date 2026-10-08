import React,{useState} from 'react';
import {StyleSheet,Text,TouchableOpacity} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import {useLanguage} from '../context/LanguageContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import AuthShell from '../components/AuthShell';
import {colors123,fonts,spacing,typography} from '../utils/theme';

export default function LoginScreen({navigation}){
  const {t}=useLanguage();
  const {loginWithPassword,authError}=useStitchPro();
  const {showToast}=useToast();
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  const submit=async()=>{
    const clean=identifier.trim();
    if(!clean||!password){setError(t('loginMissing'));return;}
    setLoading(true);setError('');
    try{
      await loginWithPassword(clean,password);
      showToast(t('loginTitle'),'success');
    }catch(err){
      const message=err.response?.data?.message||authError||t('loginInvalid');
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  return <AuthShell
    title={t('loginTitle')}
    subtitle={t('loginSubtitle')}
    onBack={navigation.canGoBack()?()=>navigation.goBack():undefined}
    footer={<TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.navigate('Register')}>
      <Text style={s.altMuted}>{t('loginNew')}</Text><Text style={s.altLink}>{t('authCreateAccount')}</Text>
    </TouchableOpacity>}>
    <IconInput
      label={t('loginIdentifier')}
      icon="account-outline"
      value={identifier}
      onChangeText={(v)=>{setIdentifier(v);setError('');}}
      placeholder={t('loginIdentifierPlaceholder')}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="email-address"
      autoComplete="username"
      returnKeyType="next"
    />
    <IconInput
      label={t('authPassword')}
      icon="lock-outline"
      value={password}
      onChangeText={(v)=>{setPassword(v);setError('');}}
      placeholder={t('loginPasswordPlaceholder')}
      secureTextEntry={!showPassword}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="current-password"
      returnKeyType="go"
      onSubmitEditing={submit}
      right={
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?t('authHidePassword'):t('authShowPassword')} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
          <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
        </TouchableOpacity>
      }
    />
    <TouchableOpacity accessibilityRole="button" style={s.forgot} onPress={()=>navigation.navigate('ForgotPassword')}>
      <Text style={s.forgotText}>{t('loginForgot')}</Text>
    </TouchableOpacity>
    {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
    <AppButton label={t('authSignIn')} loading={loading} onPress={submit} size="lg"/>
  </AuthShell>;
}

const s=StyleSheet.create({
  forgot:{minHeight:36,alignSelf:'flex-end',justifyContent:'center',marginTop:-6},
  forgotText:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
  error:{...typography.small,color:colors123.danger},
  alt:{minHeight:48,alignItems:'center',justifyContent:'center',flexDirection:'row',marginTop:spacing.sm},
  altMuted:{...typography.small,color:colors123.textMuted},
  altLink:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

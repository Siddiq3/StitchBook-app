import React,{useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reveal from '../components/Reveal';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import {useLanguage} from '../context/LanguageContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,radius,spacing,typography,shadows} from '../utils/theme';

const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

export default function PasswordScreen(){
  const {t}=useLanguage();
  const {setPassword}=useStitchPro();
  const {showToast}=useToast();
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [show,setShow]=useState(false);

  const submit=async()=>{
    if(!validPassword(newPassword)){setError(t('authPasswordRule'));return;}
    if(newPassword!==confirm){setError(t('authPasswordsMismatch'));return;}
    setLoading(true);setError('');
    try{
      await setPassword(currentPassword,newPassword);
      setCurrentPassword('');setNewPassword('');setConfirm('');
      showToast(t('pwdUpdated'),'success');
    }catch(err){
      const message=err.response?.data?.message||err.message||t('pwdUpdateFailed');
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  const eye=<TouchableOpacity accessibilityRole="button" accessibilityLabel={show?t('pwdHideAll'):t('pwdShowAll')} onPress={()=>setShow(v=>!v)} hitSlop={10}>
    <Ionicons name={show?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
  </TouchableOpacity>;

  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "ios" ? "padding" : "height"}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    <Reveal style={s.info}>
      <View style={s.infoIcon}><Ionicons name="shield-checkmark" size={24} color={colors123.primary}/></View>
      <View style={{flex:1}}>
        <Text style={s.infoTitle}>{t('pwdInfoTitle')}</Text>
        <Text style={s.infoText}>{t('pwdInfoBody')}</Text>
      </View>
    </Reveal>
    <Reveal index={1} style={s.card}>
      <IconInput label={t('pwdCurrent')} icon="lock-outline" value={currentPassword} onChangeText={(v)=>{setCurrentPassword(v);setError('');}} placeholder={t('pwdCurrentPlaceholder')} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" right={eye}/>
      <IconInput label={t('forgotNewPassword')} icon="lock-plus-outline" value={newPassword} onChangeText={(v)=>{setNewPassword(v);setError('');}} placeholder={t('pwdNewPlaceholder')} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" hint={t('authPasswordHint')}/>
      <IconInput label={t('forgotConfirmNew')} icon="lock-check-outline" value={confirm} onChangeText={(v)=>{setConfirm(v);setError('');}} placeholder={t('pwdConfirmPlaceholder')} secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit}/>
      {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
      <AppButton label={t('pwdUpdate')} loading={loading} onPress={submit} size="lg"/>
    </Reveal>
    <Reveal index={2} style={s.tips}>
      {[t('pwdTip1'),t('pwdTip2'),t('pwdTip3')].map((tip)=>(
        <View key={tip} style={s.tip}><Ionicons name="checkmark-circle" size={18} color={colors123.success}/><Text style={s.tipText}>{tip}</Text></View>
      ))}
    </Reveal>
  </ScrollView></KeyboardAvoidingView>;
}
const s=StyleSheet.create({
  page:{flexGrow:1,backgroundColor:colors123.background,padding:spacing.md,gap:spacing.md},
  info:{flexDirection:'row',gap:spacing.sm,alignItems:'flex-start',padding:spacing.md,borderRadius:radius.lg,backgroundColor:colors123.primarySoft},
  infoIcon:{width:44,height:44,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:colors123.surface},
  infoTitle:{...typography.h3,color:colors123.text},
  infoText:{...typography.small,color:colors123.textSecondary,marginTop:4},
  card:{gap:spacing.md,padding:20,borderRadius:radius.xl,backgroundColor:colors123.surface,borderWidth:1,borderColor:colors123.borderSubtle,...shadows.card},
  tips:{gap:spacing.sm,paddingHorizontal:spacing.xs},
  tip:{flexDirection:'row',gap:spacing.xs,alignItems:'flex-start'},
  tipText:{...typography.small,color:colors123.textMuted,flex:1},
  error:{...typography.small,color:colors123.danger},
});

import React,{useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reveal from '../components/Reveal';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,radius,spacing,typography,shadows} from '../utils/theme';

const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

export default function PasswordScreen(){
  const {setPassword}=useStitchPro();
  const {showToast}=useToast();
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [show,setShow]=useState(false);

  const submit=async()=>{
    if(!validPassword(newPassword)){setError('New password must be at least 8 characters with a letter and a number.');return;}
    if(newPassword!==confirm){setError("Passwords don't match.");return;}
    setLoading(true);setError('');
    try{
      await setPassword(currentPassword,newPassword);
      setCurrentPassword('');setNewPassword('');setConfirm('');
      showToast('Password updated','success');
    }catch(err){
      const message=err.response?.data?.message||err.message||'Could not update password';
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  const eye=<TouchableOpacity accessibilityRole="button" accessibilityLabel={show?'Hide passwords':'Show passwords'} onPress={()=>setShow(v=>!v)} hitSlop={10}>
    <Ionicons name={show?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
  </TouchableOpacity>;

  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === "ios" ? "padding" : "height"}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    <Reveal style={s.info}>
      <View style={s.infoIcon}><Ionicons name="shield-checkmark" size={24} color={colors123.primary}/></View>
      <View style={{flex:1}}>
        <Text style={s.infoTitle}>Password sign-in</Text>
        <Text style={s.infoText}>Leave Current password empty if you have not set one yet. Otherwise, enter your existing password.</Text>
      </View>
    </Reveal>
    <Reveal index={1} style={s.card}>
      <IconInput label="Current password" icon="lock-outline" value={currentPassword} onChangeText={(v)=>{setCurrentPassword(v);setError('');}} placeholder="Leave empty if not set" secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" right={eye}/>
      <IconInput label="New password" icon="lock-plus-outline" value={newPassword} onChangeText={(v)=>{setNewPassword(v);setError('');}} placeholder="Create a new password" secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" hint="8 or more characters, with a letter and a number."/>
      <IconInput label="Confirm new password" icon="lock-check-outline" value={confirm} onChangeText={(v)=>{setConfirm(v);setError('');}} placeholder="Re-enter new password" secureTextEntry={!show} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit}/>
      {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
      <AppButton label="Update password" loading={loading} onPress={submit} size="lg"/>
    </Reveal>
    <Reveal index={2} style={s.tips}>
      {['Use a password you don’t use on other apps.','Staff passwords are set by the shop owner from Staff.','Forgot it? Use “Forgot password” on the sign-in screen.'].map((tip)=>(
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

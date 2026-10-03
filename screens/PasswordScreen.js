import React,{useState} from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,radius,spacing,typography} from '../utils/theme';

const validPassword=(value)=>String(value||'').length>=8&&/[A-Za-z]/.test(value)&&/\d/.test(value);

export default function PasswordScreen(){
  const {setPassword}=useStitchPro();
  const {showToast}=useToast();
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

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

  return <View style={s.page}>
    <View style={s.info}>
      <Text style={s.infoTitle}>Password sign-in</Text>
      <Text style={s.infoText}>If this account previously used Google or mobile OTP and does not have a password yet, leave Current password empty and create one now. After a password exists, the current password is required to change it.</Text>
    </View>
    <IconInput label="Current password" icon="lock-outline" value={currentPassword} onChangeText={(v)=>{setCurrentPassword(v);setError('');}} placeholder="Current password (if already set)" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password"/>
    <IconInput label="New password" icon="lock-plus-outline" value={newPassword} onChangeText={(v)=>{setNewPassword(v);setError('');}} placeholder="Create a new password" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" hint="8 or more characters, with a letter and a number."/>
    <IconInput label="Confirm new password" icon="lock-check-outline" value={confirm} onChangeText={(v)=>{setConfirm(v);setError('');}} placeholder="Re-enter new password" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit}/>
    {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
    <AppButton label="Update password" loading={loading} onPress={submit}/>
  </View>;
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:colors123.background,padding:spacing.md,gap:spacing.md},
  info:{padding:spacing.md,borderRadius:radius.sm,backgroundColor:colors123.primarySoft},
  infoTitle:{...typography.h3,color:colors123.text},
  infoText:{...typography.small,color:colors123.textSecondary,marginTop:6},
  error:{...typography.small,color:colors123.danger},
});

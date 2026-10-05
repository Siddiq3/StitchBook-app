import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AppButton from '../components/AppButton';
import InlineAlert from '../components/InlineAlert';
import api from '../services/api';
import { useStitchPro } from '../context/StitchProContext';
import { colors123, fonts, radius, spacing } from '../utils/theme';

export default function DeleteAccountScreen() {
  const { logout,user } = useStitchPro();
  const tokenKey=`account_deletion_token_${user?.id || 'pending'}`;
  const [confirmation,setConfirmation] = useState('');
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [progress,setProgress] = useState('');
  const run = async () => {
    setBusy(true); setError('');
    try {
      let token = await SecureStore.getItemAsync(tokenKey);
      if (!token) {
        // Confirm identity with the current password before anything is deleted
        if (!password) throw new Error('Enter your password to confirm.');
        const response = await api.post('/user/delete-account',{password,confirmation});
        token = response.data.data.deletionToken;
        await SecureStore.setItemAsync(tokenKey,token);
      }
      // Bound each foreground attempt. A retry/restart resumes with the same capability.
      for (let batch=0; batch<30; batch++) {
        setProgress('Deleting your account safely… Keep this screen open.');
        const response = await api.post('/user/delete-account',{}, {headers:{'x-deletion-token':token}});
        if (response.data.data.complete) {
          await SecureStore.deleteItemAsync(tokenKey);
          await logout(); return;
        }
      }
      setProgress('Deletion is still in progress. Tap Continue deletion to resume.');
    } catch (failure) {
      if ([400,401].includes(failure.response?.status)) await SecureStore.deleteItemAsync(tokenKey);
      setError(failure.response?.data?.message || failure.message || 'Deletion could not finish. Please try again.');
    } finally { setBusy(false); }
  };
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
    <Text accessibilityRole="header" style={styles.title}>Delete account</Text>
    <Text style={styles.body}>This permanently removes your profile and the shop data you own, including customers, measurements, orders and files. A staff account’s deletion preserves the shop’s business records. This cannot be undone.</Text>
    <Text style={styles.body}>Enter your password to confirm. Any active subscription is cancelled before cleanup.</Text>
    <Text style={styles.label}>Password</Text>
    <TextInput accessibilityLabel="Password" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password" value={password} onChangeText={setPassword} editable={!busy} style={styles.input} />
    <Text style={styles.label}>Type DELETE to confirm</Text>
    <TextInput accessibilityLabel="Type DELETE to confirm" autoCapitalize="characters" autoCorrect={false} value={confirmation} onChangeText={setConfirmation} editable={!busy} style={styles.input} />
    <InlineAlert message={error} />
    {progress ? <Text accessibilityLiveRegion="polite" style={styles.body}>{progress}</Text> : null}
    <AppButton label={progress?'Continue deletion':'Permanently delete account'} variant="danger" loading={busy} disabled={confirmation!=='DELETE'||(!password&&!progress)||busy} onPress={run} />
  </ScrollView>;
}
const styles=StyleSheet.create({page:{flexGrow:1,padding:spacing.md,gap:spacing.md,backgroundColor:colors123.background},title:{fontFamily:fonts.bold,fontSize:22,lineHeight:28,color:colors123.text},body:{fontFamily:fonts.regular,fontSize:15,lineHeight:23,color:colors123.textSecondary},label:{fontFamily:fonts.semibold,fontSize:14,color:colors123.text},input:{minHeight:48,borderWidth:1,borderColor:colors123.border,borderRadius:radius.sm,paddingHorizontal:14,paddingVertical:12,backgroundColor:colors123.surface,color:colors123.text,fontFamily:fonts.regular,fontSize:15}});

import React,{useMemo,useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {authService} from '../services/authService';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,fonts,radius,spacing,typography} from '../utils/theme';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({navigation}){
  const insets=useSafeAreaInsets();
  const {showToast}=useToast();
  const [step,setStep]=useState('email');
  const [email,setEmail]=useState('');
  const [otp,setOtp]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  const cleanEmail=useMemo(()=>email.trim().toLowerCase(),[email]);

  const sendCode=async()=>{
    if(!EMAIL_RE.test(cleanEmail)){setError('Enter a valid email address.');return;}
    setLoading(true);setError('');
    try{
      await authService.requestPasswordReset(cleanEmail);
      setStep('code');
      showToast('If an account exists, a verification code has been sent.','success');
    }catch(err){
      const message=err.response?.data?.message||err.message||'Unable to request a reset code.';
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  const continueWithCode=()=>{
    if(!/^\d{6}$/.test(otp.trim())){setError('Enter the 6-digit verification code.');return;}
    setError('');setStep('password');
  };

  const resetPassword=async()=>{
    if(password.length<8||!/[A-Za-z]/.test(password)||!/\d/.test(password)){
      setError('Password must be at least 8 characters and include a letter and a number.');return;
    }
    if(password!==confirm){setError('Passwords do not match.');return;}
    setLoading(true);setError('');
    try{
      await authService.resetPassword(cleanEmail,otp.trim(),password);
      showToast('Password reset. Sign in with your new password.','success');
      navigation.reset({index:0,routes:[{name:'Login'}]});
    }catch(err){
      const message=err.response?.data?.message||err.message||'Invalid or expired verification code.';
      setError(message);showToast(message,'error');
      if((err.response?.data?.message||'').toLowerCase().includes('verification code')) setStep('code');
    }finally{setLoading(false);}
  };

  const subtitle=step==='email'
    ? 'Enter the email linked to your StitchBook account.'
    : step==='code'
      ? 'Enter the 6-digit code sent to '+cleanEmail+'.'
      : 'Create a new password for your StitchBook account.';

  return <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
    <StatusBar style="dark"/>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scroll,{paddingTop:insets.top+16,paddingBottom:insets.bottom+spacing.xl}]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to sign in" onPress={()=>navigation.goBack()} style={s.back}>
        <Ionicons name="arrow-back" size={21} color={colors123.text}/>
      </TouchableOpacity>

      <View style={s.iconWrap}><Ionicons name="key-outline" size={28} color={colors123.primary}/></View>
      <Text style={s.title}>Reset your password</Text>
      <Text style={s.subtitle}>{subtitle}</Text>

      <View style={s.card}>
        {step==='email'?<>
          <IconInput
            label="Email address"
            icon="email-outline"
            value={email}
            onChangeText={(v)=>{setEmail(v);setError('');}}
            placeholder="Enter your email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={sendCode}
          />
          <Text style={s.helper}>For privacy, we show the same confirmation whether or not an account exists.</Text>
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label="Send verification code" loading={loading} onPress={sendCode}/>
        </>:null}

        {step==='code'?<>
          <IconInput
            label="Verification code"
            icon="numeric"
            value={otp}
            onChangeText={(v)=>{setOtp(v.replace(/\D/g,'').slice(0,6));setError('');}}
            placeholder="Enter the 6-digit verification code"
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={continueWithCode}
          />
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label="Continue" onPress={continueWithCode}/>
          <AppButton label="Send code again" variant="tertiary" loading={loading} onPress={sendCode}/>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{setStep('email');setOtp('');setError('');}} style={s.linkButton}>
            <Text style={s.link}>Use a different email</Text>
          </TouchableOpacity>
        </>:null}

        {step==='password'?<>
          <IconInput
            label="New password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(v)=>{setPassword(v);setError('');}}
            placeholder="Enter your new password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            right={<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
              <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
            </TouchableOpacity>}
          />
          <IconInput
            label="Confirm new password"
            icon="lock-check-outline"
            value={confirm}
            onChangeText={(v)=>{setConfirm(v);setError('');}}
            placeholder="Re-enter your new password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={resetPassword}
          />
          <Text style={s.helper}>Use 8–128 characters with at least one letter and one number.</Text>
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label="Reset password" loading={loading} onPress={resetPassword}/>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{setStep('code');setError('');}} style={s.linkButton}>
            <Text style={s.link}>Back to verification code</Text>
          </TouchableOpacity>
        </>:null}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const s=StyleSheet.create({
  container:{flex:1,backgroundColor:colors123.background},
  scroll:{flexGrow:1,paddingHorizontal:20},
  back:{width:44,height:44,borderRadius:radius.sm,alignItems:'center',justifyContent:'center'},
  iconWrap:{marginTop:spacing.lg,width:48,height:48,borderRadius:radius.sm,alignItems:'center',justifyContent:'center',backgroundColor:colors123.primarySoft},
  title:{...typography.h1,color:colors123.text,marginTop:spacing.md},
  subtitle:{...typography.small,color:colors123.textMuted,marginTop:6,maxWidth:380},
  card:{marginTop:spacing.md,gap:spacing.md},
  helper:{...typography.caption,color:colors123.textMuted},
  error:{...typography.small,color:colors123.danger},
  linkButton:{minHeight:44,alignItems:'center',justifyContent:'center'},
  link:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

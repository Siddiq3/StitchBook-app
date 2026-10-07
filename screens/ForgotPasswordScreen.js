import React,{useMemo,useState} from 'react';
import {StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {authService} from '../services/authService';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import AuthShell from '../components/AuthShell';
import {colors123,fonts,spacing,typography} from '../utils/theme';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({navigation}){
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
      navigation.reset({index:1,routes:[{name:'Welcome'},{name:'Login'}]});
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

  const stepNumber={email:1,code:2,password:3}[step];

  return <AuthShell title="Reset your password" subtitle={subtitle} step={`Step ${stepNumber} of 3`} onBack={()=>navigation.goBack()}>
    <View style={s.progress}>
      {[1,2,3].map((n)=><View key={n} style={[s.progressBar,n<=stepNumber&&s.progressBarActive]}/>)}
    </View>
    <View style={s.form}>
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
            icon="lock-outline"
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
  </AuthShell>;
}

const s=StyleSheet.create({
  form:{gap:spacing.md},
  progress:{flexDirection:'row',gap:6},
  progressBar:{flex:1,height:4,borderRadius:2,backgroundColor:colors123.borderLight},
  progressBarActive:{backgroundColor:colors123.primary},
  helper:{...typography.caption,color:colors123.textMuted},
  error:{...typography.small,color:colors123.danger},
  linkButton:{minHeight:44,alignItems:'center',justifyContent:'center'},
  link:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

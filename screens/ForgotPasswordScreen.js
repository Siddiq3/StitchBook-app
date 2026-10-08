import React,{useMemo,useState} from 'react';
import {StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {authService} from '../services/authService';
import {useToast} from '../context/ToastContext';
import {useLanguage} from '../context/LanguageContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import AuthShell from '../components/AuthShell';
import {colors123,fonts,spacing,typography} from '../utils/theme';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({navigation}){
  const {t}=useLanguage();
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
    if(!EMAIL_RE.test(cleanEmail)){setError(t('authInvalidEmail'));return;}
    setLoading(true);setError('');
    try{
      await authService.requestPasswordReset(cleanEmail);
      setStep('code');
      showToast(t('forgotCodeSent'),'success');
    }catch(err){
      const message=err.response?.data?.message||err.message||t('forgotRequestFailed');
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  const continueWithCode=()=>{
    if(!/^\d{6}$/.test(otp.trim())){setError(t('forgotCodeInvalid'));return;}
    setError('');setStep('password');
  };

  const resetPassword=async()=>{
    if(password.length<8||!/[A-Za-z]/.test(password)||!/\d/.test(password)){
      setError(t('authPasswordRule'));return;
    }
    if(password!==confirm){setError(t('authPasswordsMismatch'));return;}
    setLoading(true);setError('');
    try{
      await authService.resetPassword(cleanEmail,otp.trim(),password);
      showToast(t('forgotDone'),'success');
      navigation.reset({index:1,routes:[{name:'Welcome'},{name:'Login'}]});
    }catch(err){
      const message=err.response?.data?.message||err.message||t('forgotCodeExpired');
      setError(message);showToast(message,'error');
      if((err.response?.data?.message||'').toLowerCase().includes('verification code')) setStep('code');
    }finally{setLoading(false);}
  };

  const subtitle=step==='email'
    ? t('forgotSubtitleEmail')
    : step==='code'
      ? t('forgotSubtitleCode')+' '+cleanEmail
      : t('forgotSubtitlePassword');

  const stepNumber={email:1,code:2,password:3}[step];

  return <AuthShell title={t('forgotTitle')} subtitle={subtitle} step={t('authStepOf').replace('{n}',stepNumber).replace('{total}',3)} onBack={()=>navigation.goBack()}>
    <View style={s.progress}>
      {[1,2,3].map((n)=><View key={n} style={[s.progressBar,n<=stepNumber&&s.progressBarActive]}/>)}
    </View>
    <View style={s.form}>
        {step==='email'?<>
          <IconInput
            label={t('authEmail')}
            icon="email-outline"
            value={email}
            onChangeText={(v)=>{setEmail(v);setError('');}}
            placeholder={t('authEnterEmail')}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={sendCode}
          />
          <Text style={s.helper}>{t('forgotPrivacyNote')}</Text>
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label={t('forgotSendCode')} loading={loading} onPress={sendCode}/>
        </>:null}

        {step==='code'?<>
          <IconInput
            label={t('forgotCode')}
            icon="numeric"
            value={otp}
            onChangeText={(v)=>{setOtp(v.replace(/\D/g,'').slice(0,6));setError('');}}
            placeholder={t('forgotCodePlaceholder')}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={continueWithCode}
          />
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label={t('authContinue')} onPress={continueWithCode}/>
          <AppButton label={t('forgotResend')} variant="tertiary" loading={loading} onPress={sendCode}/>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{setStep('email');setOtp('');setError('');}} style={s.linkButton}>
            <Text style={s.link}>{t('forgotDifferentEmail')}</Text>
          </TouchableOpacity>
        </>:null}

        {step==='password'?<>
          <IconInput
            label={t('forgotNewPassword')}
            icon="lock-outline"
            value={password}
            onChangeText={(v)=>{setPassword(v);setError('');}}
            placeholder={t('forgotNewPasswordPlaceholder')}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            right={<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?t('authHidePassword'):t('authShowPassword')} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
              <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
            </TouchableOpacity>}
          />
          <IconInput
            label={t('forgotConfirmNew')}
            icon="lock-check-outline"
            value={confirm}
            onChangeText={(v)=>{setConfirm(v);setError('');}}
            placeholder={t('forgotConfirmNewPlaceholder')}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={resetPassword}
          />
          <Text style={s.helper}>{t('forgotPasswordRuleLong')}</Text>
          {error?<Text style={s.error}>{error}</Text>:null}
          <AppButton label={t('forgotReset')} loading={loading} onPress={resetPassword}/>
          <TouchableOpacity accessibilityRole="button" onPress={()=>{setStep('code');setError('');}} style={s.linkButton}>
            <Text style={s.link}>{t('forgotBackToCode')}</Text>
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

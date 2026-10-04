import React,{useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStitchPro} from '../context/StitchProContext';
import {useToast} from '../context/ToastContext';
import IconInput from '../components/IconInput';
import AppButton from '../components/AppButton';
import {colors123,fonts,radius,spacing,typography} from '../utils/theme';

export default function LoginScreen({navigation}){
  const insets=useSafeAreaInsets();
  const {loginWithPassword,authError}=useStitchPro();
  const {showToast}=useToast();
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');

  const submit=async()=>{
    const clean=identifier.trim();
    if(!clean||!password){setError('Enter your email or mobile number and password.');return;}
    setLoading(true);setError('');
    try{
      await loginWithPassword(clean,password);
      showToast('Welcome back','success');
    }catch(err){
      const message=err.response?.data?.message||authError||'Invalid email/mobile number or password';
      setError(message);showToast(message,'error');
    }finally{setLoading(false);}
  };

  return <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
    <StatusBar style="dark"/>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>
      <View style={[s.hero,{paddingTop:insets.top+28}]}>
        <View style={s.brandRow}>
          <Text style={s.wordmark}>StitchBook</Text>
          <View style={s.secure}><Ionicons name="shield-checkmark" size={14} color={colors123.primary}/><Text style={s.secureText}>Secure</Text></View>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.title}>Sign in</Text>
        <IconInput
          label="Email or mobile number"
          icon="account-outline"
          value={identifier}
          onChangeText={(v)=>{setIdentifier(v);setError('');}}
          placeholder="Enter your email or mobile number"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="username"
          returnKeyType="next"
        />
        <IconInput
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={(v)=>{setPassword(v);setError('');}}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={submit}
          right={
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} hitSlop={10}>
              <Ionicons name={showPassword?'eye-off-outline':'eye-outline'} size={20} color={colors123.textMuted}/>
            </TouchableOpacity>
          }
        />
        <TouchableOpacity accessibilityRole="button" style={s.forgot} onPress={()=>navigation.navigate('ForgotPassword')}>
          <Text style={s.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        {error?<Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>:null}
        <AppButton label="Sign in" loading={loading} onPress={submit} style={s.primary}/>
        <TouchableOpacity accessibilityRole="button" style={s.alt} onPress={()=>navigation.navigate('Register')}>
          <Text style={s.altMuted}>New to StitchBook? </Text><Text style={s.altLink}>Create account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const s=StyleSheet.create({
  container:{flex:1,backgroundColor:colors123.background},
  scroll:{flexGrow:1,paddingBottom:spacing.xl},
  hero:{backgroundColor:colors123.background,paddingHorizontal:20,paddingBottom:18},
  brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
  wordmark:{fontFamily:fonts.bold,fontSize:28,lineHeight:36,color:colors123.text,letterSpacing:-.5},
  secure:{flexDirection:'row',alignItems:'center',gap:6,minHeight:34,paddingHorizontal:10,borderRadius:radius.pill,backgroundColor:colors123.primarySoft,borderWidth:1,borderColor:colors123.borderLight},
  secureText:{fontFamily:fonts.semibold,fontSize:12,color:colors123.primary},
  heroTitle:{...typography.h1,color:colors123.text,marginTop:24},
  heroCopy:{...typography.small,color:colors123.textMuted,marginTop:6,maxWidth:350},
  card:{marginHorizontal:20,marginTop:4,gap:spacing.md},
  title:{...typography.h2,color:colors123.text},
  subtitle:{...typography.small,color:colors123.textMuted,marginTop:-8},
  forgot:{minHeight:36,alignSelf:'flex-end',justifyContent:'center',marginTop:-6},
  forgotText:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
  error:{...typography.small,color:colors123.danger},
  primary:{marginTop:2},
  alt:{minHeight:44,alignItems:'center',justifyContent:'center',flexDirection:'row'},
  altMuted:{...typography.small,color:colors123.textMuted},
  altLink:{...typography.small,color:colors123.primary,fontFamily:fonts.semibold},
});

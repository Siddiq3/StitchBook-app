import React,{useCallback,useEffect,useState} from 'react';
import {ScrollView,Text,StyleSheet} from 'react-native';
import AppButton from '../components/AppButton';
import ListRow from '../components/ListRow';
import InlineAlert from '../components/InlineAlert';
import {ListSkeleton} from '../components/SkeletonBlock';
import {authApi} from '../services/api';
import {useStitchPro} from '../context/StitchProContext';
import {colors123,fonts,spacing} from '../utils/theme';
import {useLanguage} from '../context/LanguageContext';
import {format,parseISO} from 'date-fns';

// 'android' / 'ios' read as a phone; a real device model stays as reported
const deviceName=(session,t)=>{
  const platform=String(session.platform||'').toLowerCase();
  const device=typeof session.device==='string'?session.device:'';
  if(device&&device.toLowerCase()!==platform&&device!=='Unknown device')return device;
  return platform==='ios'?t('iphoneDevice'):platform==='android'?t('androidDevice'):t('unknownDevice');
};
const lastActive=(value)=>{
  const date=typeof value==='number'?new Date(value):parseISO(String(value||''));
  return Number.isNaN(date.getTime())?'':format(date,'d MMM');
};
export default function SessionsScreen(){
  const {logout}=useStitchPro();
  const {t}=useLanguage();
  const [sessions,setSessions]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{const response=await authApi.sessions();setSessions(response.data.data||[]);}
    catch{setError(t('loadDevicesFailed'));}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  const revoke=async(session)=>{
    try{await authApi.revokeSession(session.id);if(session.current)await logout();else await load();}
    catch{setError(t('signOutDeviceFailed'));}
  };
  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.body}>{t('sessionsIntro')}</Text>
    <InlineAlert message={error} onRetry={load} retryLabel={t('retry')}/>
    {loading?<ListSkeleton/>:sessions.map(session=><ListRow key={session.id} title={deviceName(session,t)} meta={session.current?t('thisDevice'):`${t('lastActive')} ${lastActive(session.lastActiveAt)}`} trailing={<AppButton size="sm" label={t('signOut')} variant="danger" onPress={()=>revoke(session)}/>}/>)}
    <AppButton label={t('signOutAllDevices')} variant="danger" onPress={async()=>{try{await authApi.logoutAll();await logout();}catch{setError(t('signOutAllFailed'));}}}/>
  </ScrollView>;
}
const styles=StyleSheet.create({page:{flexGrow:1,padding:spacing.md,gap:spacing.md,backgroundColor:colors123.background},title:{fontFamily:fonts.bold,fontSize:22,lineHeight:28,color:colors123.text},body:{fontFamily:fonts.regular,fontSize:15,lineHeight:23,color:colors123.textSecondary}});

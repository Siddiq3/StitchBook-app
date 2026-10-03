import React,{useCallback,useEffect,useState} from 'react';
import {ScrollView,Text,StyleSheet} from 'react-native';
import AppButton from '../components/AppButton';
import ListRow from '../components/ListRow';
import InlineAlert from '../components/InlineAlert';
import {ListSkeleton} from '../components/SkeletonBlock';
import {authApi} from '../services/api';
import {useStitchPro} from '../context/StitchProContext';
import {colors123,fonts,spacing} from '../utils/theme';
export default function SessionsScreen(){
  const {logout}=useStitchPro();
  const [sessions,setSessions]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{const response=await authApi.sessions();setSessions(response.data.data||[]);}
    catch{setError('Could not load your devices. Please try again.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);
  const revoke=async(session)=>{
    try{await authApi.revokeSession(session.id);if(session.current)await logout();else await load();}
    catch{setError('Could not sign out this device. Please try again.');}
  };
  return <ScrollView contentContainerStyle={styles.page}>
    <Text accessibilityRole="header" style={styles.title}>Devices and sessions</Text>
    <Text style={styles.body}>Remove a device you no longer use. Sign out all devices if you suspect someone else has access.</Text>
    <InlineAlert message={error} onRetry={load}/>
    {loading?<ListSkeleton/>:sessions.map(session=><ListRow key={session.id} title={typeof session.device==='string'?session.device:session.platform||'Device'} meta={`${session.platform||'App'}${session.current?' · This device':''}`} trailing={<AppButton size="sm" label="Sign out" variant="danger" onPress={()=>revoke(session)}/>}/>)}
    <AppButton label="Sign out all devices" variant="danger" onPress={async()=>{try{await authApi.logoutAll();await logout();}catch{setError('Could not sign out all devices. Please try again.');}}}/>
  </ScrollView>;
}
const styles=StyleSheet.create({page:{flexGrow:1,padding:spacing.md,gap:spacing.md,backgroundColor:colors123.background},title:{fontFamily:fonts.bold,fontSize:22,lineHeight:28,color:colors123.text},body:{fontFamily:fonts.regular,fontSize:15,lineHeight:23,color:colors123.textSecondary}});

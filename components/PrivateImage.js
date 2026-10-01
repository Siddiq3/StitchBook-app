import React,{useEffect,useState} from 'react';
import {Image} from 'react-native';
import api from '../services/api';
export default function PrivateImage({source,...props}){
  const [resolved,setResolved]=useState(source);
  useEffect(()=>{
    let active=true;
    const uri=source?.uri;
    const filePath=typeof uri==='string'?uri.match(/\/uploads\/\d+\/[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|gif|webp)/)?.[0]:null;
    if(!filePath){setResolved(source);return;}
    setResolved(undefined);
    api.get('/upload/access',{params:{path:filePath}}).then(response=>{if(active)setResolved({uri:response.data.data.url});}).catch(()=>{if(active){setResolved(undefined);props.onError?.();}});
    return ()=>{active=false;};
  },[source?.uri]);
  return <Image {...props} source={resolved} />;
}

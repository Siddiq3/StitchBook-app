function validateReleaseConfig(env) {
  const keys=['UPLOAD_STORE_FILE','UPLOAD_STORE_PASSWORD','UPLOAD_KEY_ALIAS','UPLOAD_KEY_PASSWORD'];
  const count=keys.filter(key=>Boolean(env[key])).length;
  if(count!==0&&count!==keys.length) throw new Error('All four upload signing variables must be provided together');
  if(count===keys.length) {
    if(/debug\.keystore$/i.test(env.UPLOAD_STORE_FILE)||env.UPLOAD_KEY_ALIAS==='androiddebugkey') throw new Error('Debug signing cannot be used for production');
    let url;
    try{url=new URL(env.EXPO_PUBLIC_API_BASE_URL);}catch{throw new Error('Signed builds require an explicit EXPO_PUBLIC_API_BASE_URL');}
    if(url.protocol!=='https:'||['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password) throw new Error('Signed builds require an HTTPS production API URL');
  }
  return count===keys.length;
}
if(require.main===module) validateReleaseConfig(process.env);
module.exports={validateReleaseConfig};

import {GoogleAuth} from 'google-auth-library';
let auth;
export function geminiConfigured(){return process.env.GEMINI_AUTH_MODE==='adc'?!!process.env.GOOGLE_CLOUD_PROJECT:!!process.env.GEMINI_API_KEY}
export async function geminiTransport(model){
 if(process.env.GEMINI_AUTH_MODE!=='adc'){
  if(!process.env.GEMINI_API_KEY)throw new Error('Configure a Gemini API key or Google Cloud ADC.');
  return {url:`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY}};
 }
 const project=process.env.GOOGLE_CLOUD_PROJECT,location=process.env.GOOGLE_CLOUD_LOCATION||'global';
 if(!project||!/^[a-z][a-z0-9-]{4,62}$/.test(project)||!/^([a-z]+-[a-z]+\d|global)$/.test(location))throw new Error('Set a valid Google Cloud project ID and model location for ADC.');
 auth||=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
 let token;try{token=await auth.getAccessToken()}catch{throw new Error('Google ADC is unavailable. Run gcloud auth application-default login, then restart the API.')}
 if(!token)throw new Error('Google ADC did not provide an access token.');
 const host=location==='global'?'aiplatform.googleapis.com':`${location}-aiplatform.googleapis.com`;
 return {url:`https://${host}/v1/projects/${encodeURIComponent(project)}/locations/${location}/publishers/google/models/${encodeURIComponent(model)}:generateContent`,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,'x-goog-user-project':project}};
}

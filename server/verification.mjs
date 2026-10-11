import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../.integrations.local.json',import.meta.url);
const keys={gemini:['GEMINI_API_KEY','GEMINI_AUTH_MODE','GOOGLE_CLOUD_PROJECT','GOOGLE_CLOUD_LOCATION','GEMINI_MODEL'],tiger:['TIGER_DATABASE_URL','TIGER_CA_FILE'],elevenlabs:['ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID'],photon:['PHOTON_PROJECT_ID','PHOTON_PROJECT_SECRET'],snowflake:['SNOWFLAKE_HOST','SNOWFLAKE_TOKEN','SNOWFLAKE_WAREHOUSE','SNOWFLAKE_DATABASE']};
function fingerprint(provider){return createHash('sha256').update(JSON.stringify(keys[provider].map(k=>process.env[k]||''))).digest('hex')}
export function verification(provider){try{const row=JSON.parse(readFileSync(file,'utf8'))[provider];return row?.fingerprint===fingerprint(provider)&&Date.now()-row.at<86400000?row:null}catch{return null}}
export function recordVerification(provider,passed){let rows={};try{rows=JSON.parse(readFileSync(file,'utf8'))}catch{}rows[provider]={fingerprint:fingerprint(provider),at:Date.now(),passed};writeFileSync(file,JSON.stringify(rows),{mode:0o600})}

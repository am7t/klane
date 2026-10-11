import {integrationStatus} from './status.mjs';
import {recordVerification} from './verification.mjs';
const results=integrationStatus();if(!process.argv.includes('--live')){console.log(JSON.stringify({mode:'configuration-only',results},null,2));process.exit(0)}
for(const entry of results){if(!entry.configured){entry.test='skipped: credentials missing';continue}try{if(entry.provider==='tiger'){const {database,closeDatabase}=await import('./integrations/tiger.mjs');await database().query('SELECT 1');await closeDatabase()}
if(entry.provider==='snowflake'){const {statement}=await import('./integrations/snowflake.mjs');await statement('SELECT 1 AS CONNECTION_OK')}
if(entry.provider==='gemini'){const {generate}=await import('./integrations/gemini.mjs');await generate({text:'For an unverified expansion signal, give one short qualification question. No external search.',maxTokens:100})}
if(entry.provider==='photon'){const {photon,closePhoton}=await import('./integrations/photon.mjs');await photon();await closePhoton()}
if(entry.provider==='elevenlabs'){const response=await fetch('https://api.elevenlabs.io/v1/voices/'+encodeURIComponent(process.env.ELEVENLABS_VOICE_ID),{headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY},signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Voice authentication failed.')}
recordVerification(entry.provider,true);entry.test='live connection passed'}catch{recordVerification(entry.provider,false);entry.test='live connection failed — check credentials/service configuration'}}console.log(JSON.stringify({mode:'live-connection-tests',results},null,2));if(results.some(r=>r.test==='live connection failed — check credentials/service configuration'))process.exitCode=1;

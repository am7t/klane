import {mergeDiscovery} from './discovery-merge.mjs';
import {randomUUID} from 'node:crypto';
import {profileSchema} from './contracts.mjs';
import {discoverCompanies,getStoredDiscovery} from './engine.mjs';
const jobs=new Map();
export function startDiscovery({profile,exclude=[]}){
 profile=profileSchema.parse(profile);if(!Array.isArray(exclude)||exclude.some(n=>typeof n!=='string'||n.length>200)||exclude.length>30)throw new Error('Too many exclusions.');
 const signature=JSON.stringify({profile,exclude});const active=[...jobs.values()].find(j=>j.accountId===profile.accountId&&j.status==='researching');if(active&&active.signature===signature)return {id:active.id};
 const completed=[...jobs.values()].find(j=>j.accountId===profile.accountId&&j.signature===signature&&j.status==='complete'&&j.companies.length>=5&&j.createdAt>Date.now()-600000);if(completed)return {id:completed.id};
 if(active)active.status='superseded';if(jobs.size>=30)jobs.delete(jobs.keys().next().value);
 const job={id:randomUUID(),accountId:profile.accountId,signature,createdAt:Date.now(),status:'researching',companies:[],cachedCount:0,round:0,error:null,warnings:[],diagnostics:[],searchSuggestions:[]};jobs.set(job.id,job);
 void(async()=>{let followUp='';let successfulBatches=0;const rejectedClosed=new Set();try{
  try{const stored=await getStoredDiscovery(profile);if(job.status!=='researching')return;for(const c of stored.filter(c=>!exclude.some(name=>name.toLowerCase()===c.name.toLowerCase()))) {mergeDiscovery(job.companies,c);if(job.companies.length===5)break}job.cachedCount=job.companies.length}catch{}
  // Cached evidence is visible while the remaining public-source batches run.
  for(let round=0;round<3&&job.companies.length<5&&job.status==='researching';round++){
   job.round=round+1;const skip=[...exclude,...job.companies.map(c=>c.name),...rejectedClosed];let result;
   try{result=await discoverCompanies({...profile,brief:[profile.brief,followUp?`Prior research found these leads but could not fully validate them. Follow up missing official project/site/address documents; do not repeat an uncorroborated result: ${followUp}`:'',`Search batch ${round+1}. Find ${round===0?2:3} additional END CUSTOMER sites. Exclude these already reviewed entities: ${skip.join(', ')}. ${round===1?'Prioritize institutional future roofing/mechanical/electrical work, capital plans, city permit/planning records and procurement.':round===2?'Prioritize local news, company expansions and institutional facilities.':''}`].filter(Boolean).join('\n').slice(0,6000)},{saveProfile:false});successfulBatches++}
   catch(e){job.warnings.push('Batch '+(round+1)+': '+e.message);continue}
   if(job.status!=='researching')return;followUp=result.followUp||'';for(const detail of result.diagnostics?.rejectionDetails||[])if(detail.reason==='currentness')rejectedClosed.add(detail.name);
   if(result.diagnostics)job.diagnostics.push({round:round+1,...result.diagnostics});
   job.warnings.push(...(result.warnings||[]));if(result.searchSuggestions)job.searchSuggestions.push(result.searchSuggestions);
   for(const c of result.companies){if(!exclude.some(n=>n.toLowerCase()===c.name.toLowerCase()))mergeDiscovery(job.companies,c);if(job.companies.length===5)break}
  }
  if(job.status==='superseded')return;
  job.status=successfulBatches||job.companies.length?'complete':'stopped';job.error=job.warnings.length?job.warnings.at(-1):null;
  if(!job.companies.length&&!job.error){const candidates=job.diagnostics.reduce((sum,d)=>sum+d.candidates,0);job.error=candidates?`Checked ${candidates} candidate records; none passed source, currentness and site-location checks.`:'The source searches did not return sufficiently supported buyer records.'}
 }catch(e){job.error=e.message;job.status='stopped'}})();
 return {id:job.id};
}
export function getDiscoveryJob({id,accountId}){const job=jobs.get(id);if(!job||job.accountId!==accountId)throw new Error('Search session unavailable.');return job}

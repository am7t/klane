import {plainDocument} from './institutional-sources.mjs';
const cache=new Map();
export async function municipalSources(profile){
 if(!/raleigh/i.test(profile.territory||''))return [];
 const trade=/hvac|heating|cooling/i.test(profile.service)?/hvac|mechanical/i:/electric/i.test(profile.service)?/electrical/i:/plumb/i.test(profile.service)?/plumbing/i:/landscap/i.test(profile.service)?/landscap|seeding|site restoration/i:/roof/i.test(profile.service)?/roofing|roof replacement/i:null;
 if(!trade)return [];const key=profile.service.toLowerCase();const hit=cache.get(key);if(hit&&hit.until>Date.now())return hit.documents;
 const uri='https://raleighnc.gov/doing-business/services/business-engagement-and-opportunities-program/project-pipeline';
 try{const r=await fetch(uri,{signal:AbortSignal.timeout(8000)});if(!r.ok)return [];const html=await r.text();const text=plainDocument(html);const updated=text.match(/Updated:\s*([A-Z][a-z]+ \d{1,2}, \d{4})/);const publication=updated&&Date.parse(updated[1]);if(!publication||publication>Date.now()||Date.now()-publication>180*86400000)return [];
 const currentMonth=new Date();currentMonth.setUTCDate(1);currentMonth.setUTCHours(0,0,0,0);
 const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(c=>plainDocument(c[1]))).filter(c=>c.length>=4&&trade.test(c[2])).filter(c=>{const month=Date.parse('1 '+c[3]);return Number.isFinite(month)&&month>=currentMonth.getTime()&&month<currentMonth.getTime()+366*86400000}).filter(c=>!(/hvac|heating|cooling/i.test(profile.service)&&/pump and motor repair/i.test(c[0]))).sort((a,b)=>Number(/hvac|chiller|cooling tower|air.handling/i.test(b[0]+' '+b[1]))-Number(/hvac|chiller|cooling tower|air.handling/i.test(a[0]+' '+a[1]))).slice(0,6);
 const documents=rows.length?[{uri,title:'City of Raleigh · upcoming construction and trade packages',publishedAt:new Date(publication).toISOString().slice(0,10),supportedStatements:`Official pipeline updated ${updated[1]}. These are anticipated posting dates, NOT confirmed open bids or awards. Verify a separate site/address document and any latest procurement notice. ${rows.map(c=>`Project: ${c[0]}. Scope: ${c[1]}. Published possible trades: ${c[2]}. Anticipated procurement posting: ${c[3]}.`).join(' ').slice(0,2400)}`}]:[];
 if(documents.length){
  // Read official facility directories to corroborate pipeline sites without another model call.
  const directories=await Promise.all(['https://raleighnc.gov/parks-directory','https://raleighnc.gov/parks-and-recreation/services/aquatics'].map(async directory=>{try{const response=await fetch(directory,{signal:AbortSignal.timeout(8000)});return response.ok?{uri:directory,html:await response.text()}:null}catch{return null}}));
  for(const directory of directories.filter(Boolean)){
   const blocks=[...directory.html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>|<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(m=>m[0]);
   for(const block of blocks){const content=plainDocument(block);const facility=rows.find(c=>{const name=(c[0]+' '+c[1]).replace(/\bRd\b/gi,'Road');return content.includes('Address')?name.toLowerCase().includes(plainDocument(block.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]||'__missing__').toLowerCase()):name.toLowerCase().includes(plainDocument(block.match(/<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1]||'__missing__').toLowerCase())});
    if(!facility||! /\b\d{2,6}\s+[A-Za-z]/.test(content))continue;
    const path=block.match(/href="(\/parks-and-recreation\/places\/[^"]+)"/)?.[1];documents.push({uri:path?'https://raleighnc.gov'+path:directory.uri,title:'City of Raleigh · '+facility[0]+' · official facility address',supportedStatements:content.slice(0,900)});if(documents.length>=5)break;
   }
  }
 }
 if(documents.length)cache.set(key,{until:Date.now()+900000,documents});return documents;
 }catch{return []}
}

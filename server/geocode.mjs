// Census misses private campus roads; county address points provide a sourced fallback.
const wakeAddresses='https://maps.wake.gov/arcgis/rest/services/Property/Addresses/MapServer/0';
const cache=new Map();
const streetTypes={STREET:'ST',ROAD:'RD',DRIVE:'DR',AVENUE:'AVE',BOULEVARD:'BLVD',LANE:'LN',COURT:'CT',CIRCLE:'CIR',PARKWAY:'PKWY',PLACE:'PL',TRAIL:'TRL',HIGHWAY:'HWY'};
export function normalizeStreet(value){return String(value).toUpperCase().replace(/\./g,'').replace(/\b(NORTH|SOUTH|EAST|WEST)\b/g,s=>s[0]).replace(/\b(STREET|ROAD|DRIVE|AVENUE|BOULEVARD|LANE|COURT|CIRCLE|PARKWAY|PLACE|TRAIL|HIGHWAY)\b/g,s=>streetTypes[s]).replace(/\s+/g,' ').trim()}
export function streetFromAddress(value){const plain=String(value).replace(/\([^)]*\)/g,'');return plain.match(/\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){1,7}(?:Street|St|Road|Rd|Drive|Dr|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Court|Ct|Circle|Cir|Parkway|Pkwy|Place|Pl|Trail|Trl|Highway|Hwy)\b/i)?.[0]||''}
export async function geocodeAddress(address){
 const street=streetFromAddress(address);if(!street)return null;
 const cleaned=String(address).replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim(),key=normalizeStreet(cleaned);
 const hit=cache.get(key);if(hit&&hit.until>Date.now())return hit.result;
 let result=null;
 try{const url=new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');url.search=new URLSearchParams({address:cleaned,benchmark:'Public_AR_Current',format:'json'}).toString();const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(r.ok){const matches=(await r.json()).result?.addressMatches||[];if(matches.length===1){const m=matches[0];result={coordinates:[m.coordinates.x,m.coordinates.y],matchedAddress:m.matchedAddress||cleaned,provider:'US Census',sourceUrl:url.href}}}}catch{}
 if(!result){
  const number=Number(street.match(/^\d+/)?.[0]),streetName=normalizeStreet(street).replace(/^\d+\s+/,'').replace(/\s+(ST|RD|DR|AVE|BLVD|LN|CT|CIR|PKWY|PL|TRL|HWY)$/,'').replace(/^(N|S|E|W)\s+/,'');
  if(!number||!streetName)return null;
  const url=new URL(wakeAddresses+'/query');url.search=new URLSearchParams({f:'json',where:`ST_NUM=${number} AND ST_NAME='${streetName.replace(/'/g,"''")}'`,outFields:'FULLADDR,POSTAL_CITY',outSR:'4326',returnGeometry:'true',resultRecordCount:'8'}).toString();
  try{const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(r.ok){const data=await r.json();const matches=(data.features||[]).filter(f=>normalizeStreet(f.attributes?.FULLADDR)===normalizeStreet(street)&&Number.isFinite(f.geometry?.x)&&Number.isFinite(f.geometry?.y));if(matches.length===1){const m=matches[0];result={coordinates:[m.geometry.x,m.geometry.y],matchedAddress:m.attributes.FULLADDR+', '+m.attributes.POSTAL_CITY+', NC',provider:'Wake County address records',sourceUrl:url.href}}}}catch{}
 }
 if(result&&result.coordinates.every(Number.isFinite)){if(cache.size>=300)cache.delete(cache.keys().next().value);cache.set(key,{until:Date.now()+86400000,result});return result}return null;
}

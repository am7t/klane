// Read a bounded primary-source feed before asking the model to search broadly.
// This adds original documents without additional LLM calls or hardcoded leads.
const cache=new Map();
export function plainDocument(html){return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&(?:amp|nbsp|quot|apos|lt|gt);/g,entity=>({'&amp;':'&','&nbsp;':' ','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'}[entity])).replace(/\s+/g,' ').trim()}
export function expiredPrequalification(document,now=Date.now()){
 if(!/prequalification/i.test(document.title))return false;
 const date=document.supportedStatements.match(/(?:by|due|deadline)[^.]{0,80}?(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2}))(?!\d)/i)?.[1];
 return !!date&&Number.isFinite(Date.parse(date))&&Date.parse(date)+86400000<=now;
}
export async function institutionalSources(profile){
 const term=/roof/i.test(profile.service)?'roof':/hvac|heating|cooling/i.test(profile.service)?'hvac':/electric/i.test(profile.service)?'electrical':/plumb/i.test(profile.service)?'plumbing':null;
 if(!term)return [];const hit=cache.get(term);if(hit&&hit.until>Date.now())return hit.documents;
 const now=Date.now(),cutoff=now-180*86400000;const url=new URL('https://facilities.ofa.ncsu.edu/wp-json/wp/v2/posts');url.search=new URLSearchParams({search:term,per_page:'6',after:new Date(cutoff).toISOString().slice(0,19),_fields:'date,link,title,content'}).toString();
 try{const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(!r.ok)return [];const posts=await r.json();if(!Array.isArray(posts))return [];
  const documents=posts.filter(post=>Date.parse(post.date+'Z')>=cutoff&&Date.parse(post.date+'Z')<=now&&/^https:\/\/facilities\.ofa\.ncsu\.edu\//.test(post.link||'')).slice(0,4).map(post=>({uri:post.link,title:plainDocument(post.title?.rendered||'NC State facilities notice').slice(0,250),publishedAt:post.date.slice(0,10),supportedStatements:`Published ${post.date.slice(0,10)}. ${plainDocument(post.content?.rendered||'').slice(0,2400)}`})).filter(document=>!expiredPrequalification(document,now));
  if(documents.length)cache.set(term,{until:now+900000,documents});return documents;
 }catch{return []}
}

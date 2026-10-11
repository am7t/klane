// Recover individual grounded records; one malformed signal must not erase a buyer.
export function sourceForReference(ref,sources){return /^S\d+$/i.test(String(ref||''))?sources[Number(String(ref).slice(1))]:undefined}
const trim=(value,max)=>typeof value==='string'?value.trim().slice(0,max):value;
export function parseCandidates(raw,sources,schema){
 const issues=[],companies=[];const signalSchema=schema.shape.signals.element;
 for(const candidate of raw.slice(0,8)){
  const signals=[];for(const input of (Array.isArray(candidate.signals)?candidate.signals:[]).slice(0,3)){
   const signal={...input,claim:trim(input.claim,600),source:trim(input.source,200),excerpt:trim(input.excerpt,1000),observedAt:sourceForReference(input.sourceRef,sources)?.publishedAt||trim(input.observedAt,10),confidence:typeof input.confidence==='number'&&input.confidence>1&&input.confidence<=100?input.confidence/100:input.confidence,sourceUrl:input.sourceRef?sourceForReference(input.sourceRef,sources)?.uri:input.sourceUrl};
   const parsed=signalSchema.safeParse(signal);if(parsed.success)signals.push(parsed.data);else issues.push({name:trim(candidate.name,100),issues:parsed.error.issues.map(issue=>({path:'signals.'+issue.path.join('.'),message:issue.message}))});
  }
  const availability=candidate.availability?{...candidate.availability,evidenceDate:sourceForReference(candidate.availability.sourceRef,sources)?.publishedAt||candidate.availability.evidenceDate}:undefined;
  const cleaned={...candidate,availability,name:trim(candidate.name,200),industry:trim(candidate.industry,100),city:trim(candidate.city,100),address:trim(candidate.address,250),summary:trim(candidate.summary,1000),corroboratingSourceRefs:candidate.corroboratingSourceRefs?.slice(0,5),signals};
  const parsed=schema.safeParse(cleaned);if(parsed.success&&signals.length)companies.push(parsed.data);else if(!parsed.success)issues.push({name:trim(candidate.name,100),issues:parsed.error.issues.map(issue=>({path:issue.path.join('.'),message:issue.message}))});
 }
 return {companies,issues};
}
export function compactResearch(text){return text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g,'$1').replace(/https?:\/\/\S+/g,'[linked source]').slice(0,7000)}

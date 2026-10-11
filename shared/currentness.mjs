// A publication date is not an open buying window. Historical signals can
// corroborate a project, but cannot independently qualify it as a live prospect.
const day=86400000;
function deadlines(text){
 const result=[];
 const patterns=[/\b(?:due|deadline|closing(?: date(?:\/time)?)?|bids? (?:due|close)|proposals? due)\s*(?:by|on|at|:)?\s*((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/gi];
 for(const re of patterns)for(const m of text.matchAll(re)){const n=Date.parse(m[1]);if(Number.isFinite(n))result.push(n)}
 return result;
}
export function actionableSignal(signal,now=Date.now()){
 const date=Date.parse(signal.observedAt),text=[signal.claim,signal.excerpt].join(' ');
 if(!Number.isFinite(date)||date>now||now-date>180*day)return false;
 if(/\b(?:intent to award|notice of award|contract (?:was |has been )?awarded|awarded (?:to|contract)|bid(?:s|ding)? (?:is |are |was |were )?closed|status:\s*closed|completed construction|construction (?:is |was )?completed|project (?:is |was )?completed)\b/i.test(text))return false;
 if(deadlines(text).some(d=>d+day<=now))return false;
 return true;
}
export function isCurrentOpportunity(company,now=Date.now()){
 if(company.signals?.every(s=>s.status==='sample'))return true;
 if(company.availability){const a=company.availability;
  if(!['open','upcoming','ongoing-service'].includes(a.status))return false;
  const checked=Date.parse(a.evidenceDate);
  if(!Number.isFinite(checked)||checked>now||now-checked>180*day)return false;
  if(a.deadline&&Date.parse(a.deadline)+day<=now)return false;
  // The current window must be supported by a dated project signal, not an
  // unrelated address page or a model's general assumption about maintenance.
  return company.signals?.some(s=>s.sourceUrl===a.sourceUrl&&actionableSignal(s,now))||false;
 }
 return company.signals?.some(s=>actionableSignal(s,now))||false;
}

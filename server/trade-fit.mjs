export function unrelatedTradeProject(company,service){
 const evidence=company.signals.map(s=>s.claim+' '+s.excerpt).join(' ');
 if(/hvac|heating|air conditioning/i.test(service)&&/all building trades/i.test(evidence)){
  const explicit=company.signals.map(s=>(s.claim+' '+s.excerpt).replace(/all building trades[^.]*?(?:\.|$)/gi,'')).join(' ');
  if(!/\b(hvac|mechanical|boilers?|chillers?|air.handling|air.conditioning|heat.pumps?|ventilation|cooling towers?)\b/i.test(explicit))return true;
 }
 const context=company.summary+' '+evidence;
 // Generator engine maintenance is not building heating/air-conditioning work.
 return /hvac|heating|air conditioning/i.test(service)&&/\bgenerators?\b/i.test(context)&&! /\b(hvac|boilers?|chillers?|air.handling|air.conditioning|heat.pumps?|building heating|ventilation|cooling towers?)\b/i.test(evidence);
}

// Fixed routes keep research broad across buyers without unbounded model loops.
const trades=[
 [/hvac|heating|cooling/i,['HVAC replacement chiller air handling unit building automation energy retrofit','facility HVAC maintenance mechanical services annual contract','new school hospital hotel laboratory construction mechanical scope']],
 [/landscap|grounds/i,['park greenway streetscape stormwater landscape planting irrigation project','grounds maintenance mowing landscaping contract property management','new multifamily hotel commercial development site plan landscape installation']],
 [/electric/i,['electrical upgrades EV charging switchgear lighting facilities project','electrical maintenance procurement capital improvement plan','new building laboratory manufacturing expansion electrical scope']],
 [/roof/i,['roof replacement envelope capital improvement project','roof maintenance facilities procurement','commercial expansion renovation building enclosure']],
 [/plumb/i,['plumbing replacement water sewer facility renovation','plumbing maintenance procurement','new multifamily hospitality institutional construction']],
];
export function discoveryPlan(profile){
 const routes=trades.find(([pattern])=>pattern.test(profile.service))?.[1]||[`${profile.service} facility project`,`${profile.service} procurement maintenance`,`${profile.service} expansion renovation`];
 const round=Math.max(0,Math.min(2,Number(profile.brief?.match(/Search batch (\d)/)?.[1]||1)-1));
 const domains=profile.territory==='Cary'?['carync.gov','wake.gov','rdu.com']:profile.territory==='Durham'?['durhamnc.gov','dconc.gov','duke.edu','nccu.edu']:['raleighnc.gov','ncsu.edu','rdu.com'];
 const keywords=/hvac|heating|cooling/i.test(profile.service)?['chiller cooling tower HVAC restoration current bids','mechanical HVAC upcoming construction project pipeline','HVAC maintenance facilities capital improvements']:/landscap|grounds/i.test(profile.service)?['park construction landscaping','grounds maintenance RFP','development landscape plan']:/electric/i.test(profile.service)?['electrical upgrades','electrical maintenance RFP','EV charging project']:/roof/i.test(profile.service)?['roof repair replacement bids','roof replacement designer advertisement future construction','roof repair replacement capital improvement']:/plumb/i.test(profile.service)?['plumbing renovation','plumbing maintenance RFP','facility construction']:[`${profile.service} project`,`${profile.service} procurement`,`${profile.service} renovation`];
 return {route:routes[round],queries:[`${profile.territory} NC ${keywords[round]}`,`site:${domains[round%domains.length]} ${keywords[round]} ${new Date().getUTCFullYear()}`,`${profile.territory} NC ${keywords[(round+1)%3]}`],domains};
}

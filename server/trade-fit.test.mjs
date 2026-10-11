import {it,expect} from 'vitest';
import {unrelatedTradeProject} from './trade-fit.mjs';
it('does not equate generator engine maintenance with HVAC work',()=>{
 const c={summary:'Generator maintenance contract',signals:[{claim:'Three-year generator servicing',excerpt:'Fuel filters and engine inspections'}]};
 expect(unrelatedTradeProject(c,'HVAC')).toBe(true);
 expect(unrelatedTradeProject({...c,signals:[...c.signals,{claim:'HVAC chiller replacement',excerpt:'Building air conditioning upgrade'}]},'HVAC')).toBe(false);
 expect(unrelatedTradeProject(c,'Electrical')).toBe(false);
});
it('requires a mechanical scope instead of inferring HVAC from all building trades alone',()=>{const c={summary:'New facility',signals:[{claim:'Construction of a new fire station',excerpt:''},{claim:'All building trades, including HVAC, are anticipated',excerpt:''}]};expect(unrelatedTradeProject(c,'HVAC')).toBe(true);expect(unrelatedTradeProject({...c,signals:[...c.signals,{claim:'Mechanical air-handling system replacement',excerpt:'Building ventilation'}]},'HVAC')).toBe(false)});

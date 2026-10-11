import {it,expect} from 'vitest';
import {discoveryPlan} from './discovery-plan.mjs';
it('uses trade-specific buyer queries and changes source angles across batches',()=>{
 const p={service:'Landscaping',territory:'Cary'};
 const first=discoveryPlan(p),second=discoveryPlan({...p,brief:'Search batch 2.'}),third=discoveryPlan({...p,brief:'Search batch 3.'});
 expect(first.queries).toHaveLength(3);
 expect(first.route).toContain('irrigation');
 expect(first.queries[0]).toContain('park construction landscaping');
 expect(second.route).toContain('grounds maintenance');
 expect(third.route).toContain('site plan');
 expect(first.domains).toContain('carync.gov');
});
it('looks for HVAC buyers through equipment, maintenance and development evidence',()=>{
 const p={service:'HVAC',territory:'Durham'};
 expect(discoveryPlan(p).route).toContain('chiller');
 expect(discoveryPlan({...p,brief:'Search batch 2.'}).route).toContain('annual contract');
 expect(discoveryPlan(p).queries.join(' ')).toContain('durhamnc.gov');
});

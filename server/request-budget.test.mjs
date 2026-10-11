import {it,expect} from 'vitest';
import {requestBudget} from './request-budget.mjs';
it('background polls do not consume user action allowance',()=>{
 for(let i=0;i<100;i++)expect(requestBudget('poll-test','getDiscoveryJob',1000).allowed).toBe(true);
 for(let i=0;i<30;i++)expect(requestBudget('poll-test','companyDossier',1000).allowed).toBe(true);
 expect(requestBudget('poll-test','companyDossier',1000)).toEqual({allowed:false,retryAfter:60});
 expect(requestBudget('another-account','companyDossier',1000).allowed).toBe(true);
 expect(requestBudget('poll-test','companyDossier',61001).allowed).toBe(true);
});

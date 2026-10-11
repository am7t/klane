import {describe,it,expect} from 'vitest';
import {samples,score,mockProvider,ResearchSchema} from './domain';
const profile={name:'Test',service:'HVAC',territory:'Triangle',radius:30};
describe('opportunity intelligence',()=>{
 it('ranks richer, newer evidence above weak old evidence',()=>{const strong=samples[0];const weak={...strong,fit:20,signals:[{...strong.signals[0],confidence:.1,observedAt:'2025-01-01'}]};expect(score(strong).total).toBeGreaterThan(score(weak).total);});
 it('keeps absent evidence confidence at zero',()=>expect(score({...samples[0],signals:[]}).confidence).toBe(0));
 it('discovers within a selected city',async()=>{const cs=await mockProvider.discoverCompanies({...profile,territory:'Durham'});expect(cs.length).toBeGreaterThan(0);expect(cs.every(c=>c.city==='Durham')).toBe(true)});
 it('links research to evidence without claiming intent',async()=>{const r=await mockProvider.researchCompany(samples[0],profile);expect(ResearchSchema.safeParse(r).success).toBe(true);expect(r.evidenceIds.every(id=>samples[0].signals.some(s=>s.id===id))).toBe(true);expect(r.summary).toContain('unconfirmed');expect(r.summary).toContain('hvac')});
 it('company questions cite only supplied records and disclose missing live sources',async()=>{const r=await mockProvider.handleMessage('What is actually supported?',[samples[0]],profile);expect(r).toContain(samples[0].name);for(const signal of samples[0].signals)expect(r).toContain(signal.id);expect(r).toContain('No live news');expect(r).toContain('Buying intent remains unknown');expect(r).not.toContain(samples[1].name)});
 it('rejects out of range model confidence',()=>expect(ResearchSchema.safeParse({companyId:'1',summary:'a',recommendation:'b',confidence:2,evidenceIds:[]}).success).toBe(false));
 it('messenger shares the research contract',async()=>{const r=await mockProvider.handleMessage('Research Canopy Workspaces',samples,profile);expect(r).toContain('Canopy Workspaces');expect(r).toContain('sample evidence')});
});

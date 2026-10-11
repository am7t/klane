import {describe,it,expect} from 'vitest';
import {initialAccounts,restoreAccounts} from './accounts';
import {samples} from './domain';
describe('demo account migration',()=>{
 it('adds the third account and renames the guest while retaining saved work',()=>{const legacy=initialAccounts.slice(0,2).map(a=>({...a,label:a.id==='blank'?'Random':a.label}));legacy[1]={...legacy[1],preferences:{...legacy[1].preferences,radius:45},saved:[samples[0].id],records:[samples[0]]};const restored=restoreAccounts(legacy);expect(restored).toHaveLength(3);expect(restored[0].label).toBe('Guest');expect(restored[1].saved).toEqual([samples[0].id]);expect(restored[1].preferences.radius).toBe(45);expect(restored[2].preferences.service).toBe('HVAC');expect(restored[2].saved).toEqual([])});
 it('starts guest without affiliation or prefilled search preferences',()=>{const guest=restoreAccounts(null)[0];expect(guest.preferences.configured).toBe(false);expect(guest.preferences.company).toBe('');expect(guest.preferences.service).toBe('');expect(guest.preferences.territory).toBe('')});
});

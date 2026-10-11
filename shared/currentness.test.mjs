import {it,expect} from 'vitest';
import {isCurrentOpportunity,actionableSignal} from './currentness.mjs';
const now=Date.parse('2026-10-10');
const s={observedAt:'2026-10-01',claim:'New work',excerpt:'',sourceUrl:'https://city.gov/new'};
it('rejects the 2024 crime-lab advertisement without claiming an award',()=>expect(isCurrentOpportunity({signals:[{...s,observedAt:'2024-08-13',excerpt:'Re-advertisement for design services, bids due by August 28, 2024.'}]},now)).toBe(false));
it('rejects expired deadlines even when a search snippet is recently dated',()=>expect(actionableSignal({...s,excerpt:'Bids due by August 28, 2024'},now)).toBe(false));
it('rejects an explicit award or closed notice',()=>{expect(actionableSignal({...s,excerpt:'Intent to award contract to Bradley Services'},now)).toBe(false);expect(actionableSignal({...s,excerpt:'Status: Closed'},now)).toBe(false)});
it('allows a separately evidenced new window alongside historical background',()=>expect(isCurrentOpportunity({signals:[{...s,observedAt:'2024-08-13'},s],availability:{status:'open',evidenceDate:s.observedAt,sourceUrl:s.sourceUrl,deadline:'2026-11-01'}},now)).toBe(true));
it('does not qualify old project evidence using a recent identity page',()=>expect(isCurrentOpportunity({signals:[{...s,observedAt:'2024-08-13'}],availability:{status:'ongoing-service',evidenceDate:'2026-10-01',sourceUrl:'https://city.gov/address'}},now)).toBe(false));

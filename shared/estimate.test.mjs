import {describe,it,expect} from 'vitest';
import {estimateJob} from './estimate.mjs';
const input={units:1000,bidRate:10,materialRate:3,crew:4,productivity:250,hourlyLabor:35,equipment:1200,overhead:12,contingency:10};
describe('job economics',()=>{
 it('reserves full crew days and separates revenue from costs',()=>{const r=estimateJob(input);expect(r.days).toBe(1);expect(r.labor).toBe(1120);expect(r.materials).toBe(3000);expect(r.total).toBeCloseTo(6554.24);expect(r.profit).toBeCloseTo(3445.76);expect(r.margin).toBeCloseTo(34.4576)});
 it('reports a loss below break-even without hiding it',()=>{const r=estimateJob({...input,bidRate:4});expect(r.profit).toBeLessThan(0);expect(r.margin).toBeLessThan(0)});
 it('keeps scope unknown instead of presenting a fictional job value',()=>expect(estimateJob({...input,units:0})).toBeNull());
 it('rejects a zero crew and invalid cost inputs',()=>{expect(()=>estimateJob({...input,crew:0})).toThrow();expect(()=>estimateJob({...input,materialRate:NaN})).toThrow()});
});

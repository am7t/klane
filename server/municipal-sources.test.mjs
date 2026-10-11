import {it,expect,vi,afterEach} from 'vitest';
import {municipalSources} from './municipal-sources.mjs';
afterEach(()=>vi.unstubAllGlobals());
it('keeps future trade packages, prioritizes explicit HVAC scope, and excludes past procurement months',async()=>{
 const date=new Date();const month=date.toLocaleString('en-US',{month:'long',timeZone:'UTC'}),year=date.getUTCFullYear();
 const row=(name,scope,trade,posting)=>`<tr><td>${name}</td><td>${scope}</td><td>${trade}</td><td>${posting}</td></tr>`;
 const html=`<p>Updated: ${month} ${date.getUTCDate()}, ${year}</p><table>${row('Old HVAC','Replace HVAC','Mechanical','January 2024')}${row('New community center','New building','Mechanical',`${month} ${year}`)}${row('Aquatic center HVAC','HVAC replacement','Mechanical',`${month} ${year}`)}${row('Pump and Motor Repair Services','Pump repair','Mechanical',`${month} ${year}`)}</table>`;
 const fetch=vi.fn().mockResolvedValue(new Response(html));vi.stubGlobal('fetch',fetch);
 const sources=await municipalSources({service:'HVAC test',territory:'Raleigh'});expect(sources).toHaveLength(1);expect(sources[0].supportedStatements).toContain('anticipated posting dates');expect(sources[0].supportedStatements).not.toContain('Old HVAC');expect(sources[0].supportedStatements).not.toContain('Pump and Motor');expect(sources[0].supportedStatements.indexOf('Aquatic center HVAC')).toBeLessThan(sources[0].supportedStatements.indexOf('New community center'));await municipalSources({service:'HVAC test',territory:'Raleigh'});expect(fetch).toHaveBeenCalledTimes(3);
});
it('does not substitute Raleigh projects for a different city',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);expect(await municipalSources({service:'HVAC',territory:'Durham'})).toEqual([]);expect(fetch).not.toHaveBeenCalled()});
it('ignores stale municipal pipeline publication dates',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<p>Updated: January 1, 2024</p>')));expect(await municipalSources({service:'Electrical test',territory:'Raleigh'})).toEqual([])});

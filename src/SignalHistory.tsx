import {useEffect,useState} from 'react';
import {Company,Profile} from './domain';
type Point={week:string;signals:number;confidence:number};
export default function SignalHistory({company,profile}:{company:Company;profile:Profile}){
 const[points,setPoints]=useState<Point[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);const live=import.meta.env.VITE_API_MODE==='live';
 useEffect(()=>{let current=true;setPoints([]);setError('');
  if(!live){const grouped=new Map<string,Point>();for(const s of company.signals){const date=new Date(s.observedAt.length===7?s.observedAt+'-01':s.observedAt);if(!Number.isFinite(date.getTime()))continue;date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));const week=date.toISOString().slice(0,10);const p=grouped.get(week)||{week,signals:0,confidence:0};p.signals++;grouped.set(week,p)}setPoints([...grouped.values()].sort((a,b)=>a.week.localeCompare(b.week)));return}
  setLoading(true);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  fetch('/api/getSignalHistory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile,companyId:company.id}),signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'History unavailable');if(current)setPoints(data)}).catch(e=>{if(current)setError(e.message)}).finally(()=>{clearTimeout(timeout);if(current)setLoading(false)});
  return()=>{current=false;clearTimeout(timeout);controller.abort()}
 },[company.id,company.signals,profile.accountId,live]);
 const max=Math.max(1,...points.map(p=>p.signals));
 return <section className="signal-history"><div className="section-caption"><b>Evidence by source week</b><span>{live?'Tiger Cloud · past 90 days':'Sample evidence · source dates'}</span></div>{points.length?<div className="history-series" role="img" aria-label="Distinct recorded evidence signals grouped by source date, week starting Monday">{points.map(p=><div key={p.week}><time>{p.week.slice(0,10)}</time><i style={{width:(p.signals/max*70)+'%'}}/><b>{p.signals}</b></div>)}</div>:<p>{loading?'Loading saved evidence…':error?'Saved evidence could not be loaded.':'No dated evidence saved in this window.'}</p>}<small>Each bar counts distinct saved signals dated that week, not when Klane collected them. This is source coverage for this buyer, not new jobs or buying intent. Month-only dates use the first day for weekly grouping.</small>{error&&<p className="error">{error}</p>}</section>
}

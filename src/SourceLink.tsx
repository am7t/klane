import {ArrowUpRight,FileText} from 'lucide-react';
export function sourcePresentation(uri:string,title?:string,context?:string){
 try{
  const u=new URL(uri);const host=u.hostname.replace(/^www\./,'');const supplied=(title||'').trim();
  const generic=!supplied||supplied.toLowerCase()===host.toLowerCase()||/^https?:\/\//i.test(supplied)||/^(public document|source|official website|website)$/i.test(supplied);
  const slugs=u.pathname.split('/').filter(Boolean).reverse().map(segment=>decodeURIComponent(segment).replace(/\.(pdf|html?|aspx?|php)$/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim());
  let slug=slugs.find(segment=>segment.length>=12&&!/^[\d\s]+$/.test(segment)&&!/[a-f\d]{8} [a-f\d]{4} [a-f\d]{4} [a-f\d]{4} [a-f\d]{12}/i.test(segment)&&!/^([a-z]+ )?[a-f\d]{16,}$/i.test(segment.replace(/ /g,''))&&!/^(view|download|index|home|query|details|attendees)$/i.test(segment))||'';
  if(host.includes('vertexaisearch'))slug='';
  slug=slug.replace(/^directions parking$/i,'Directions & parking');
  const kind=/\.pdf$/i.test(u.pathname)?'PDF document':/procure|solicit|bids?|rfp|rfq/i.test(u.pathname)?'Procurement notice':/arcgis|permit|planning|record/i.test(uri)?'Public record':host.endsWith('.gov')?'Government source':/news|press|article/i.test(u.pathname)?'News / announcement':'Organization / supporting source';
  const label=generic?(context|| (slug?slug[0].toUpperCase()+slug.slice(1):`${host} · ${kind.toLowerCase()}`)):supplied;
  return {label:label.slice(0,180),kind,url:host+decodeURIComponent(u.pathname)+(u.search?'?'+u.searchParams.toString():''),host};
 }catch{return {label:context||title||'Evidence document',kind:'Source link',url:uri,host:''}}
}
export default function SourceLink({uri,title,context,className=''}:{uri:string;title?:string;context?:string;className?:string}){
 const source=sourcePresentation(uri,title,context);
 return <a className={`source-document ${className}`} href={uri} target="_blank" rel="noreferrer" title={uri}><span className="source-document-icon"><FileText size={17}/></span><span className="source-document-copy"><small>{source.kind}</small><strong>{source.label}</strong><span className="source-document-url">{source.url}</span></span><ArrowUpRight className="source-document-arrow" size={17}/></a>
}

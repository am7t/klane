import {useEffect,useRef,useState} from 'react';
import {Mic,Square,LoaderCircle} from 'lucide-react';
import type {RealtimeConnection} from '@elevenlabs/client';

export default function MicrophoneInput({onText,onStart,accountId}:{onText:(text:string)=>void;onStart:()=>void;accountId:string}){
 const [status,setStatus]=useState<'idle'|'connecting'|'listening'|'finishing'>('idle');
 const [error,setError]=useState('');
 const connection=useRef<RealtimeConnection|null>(null),alive=useRef(false),generation=useRef(0);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),finishTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const callbacks=useRef({onText,onStart});callbacks.current={onText,onStart};
 const committed=useRef(''),partial=useRef(''),stopping=useRef(false);
 function release(){generation.current++;if(timer.current)clearTimeout(timer.current);if(finishTimer.current)clearTimeout(finishTimer.current);const c=connection.current;connection.current=null;c?.close();if(alive.current)setStatus('idle')}
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;release()}},[]);
 function finish(){if(!connection.current||stopping.current)return;stopping.current=true;setStatus('finishing');if(timer.current)clearTimeout(timer.current);
  // Silence lets VAD commit the last segment; keep its last partial visible meanwhile.
  try{connection.current.mute()}catch{release();return}
  finishTimer.current=setTimeout(release,2500);
 }
 async function start(){setError('');setStatus('connecting');stopping.current=false;committed.current='';partial.current='';callbacks.current.onStart();const version=++generation.current;
  const current=()=>alive.current&&version===generation.current;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone input is unavailable in this browser.');
   const [{Scribe,CommitStrategy,RealtimeEvents},response]=await Promise.all([import('@elevenlabs/client'),fetch('/api/createScribeToken',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId}),signal:AbortSignal.timeout(10000)})]);
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Live transcription unavailable.');if(!current())return;
   const c=Scribe.connect({token:data.token,modelId:'scribe_v2_realtime',commitStrategy:CommitStrategy.VAD,vadSilenceThresholdSecs:.7,languageCode:'en',microphone:{echoCancellation:true,noiseSuppression:true}});connection.current=c;
   const publish=()=>{if(current())callbacks.current.onText([committed.current,partial.current].filter(Boolean).join(' ').slice(0,1000))};
   c.on(RealtimeEvents.SESSION_STARTED,()=>{if(current()){setStatus('listening');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(finish,30000)}});
   c.on(RealtimeEvents.PARTIAL_TRANSCRIPT,d=>{if(current()){partial.current=d.text;publish()}});
   c.on(RealtimeEvents.COMMITTED_TRANSCRIPT,d=>{if(!current())return;committed.current=[committed.current,d.text].filter(Boolean).join(' ');partial.current='';publish();if(stopping.current)release()});
   const fail=()=>{if(current()){setError('Live transcription disconnected. Your text is kept; tap the microphone to retry.');release()}};
   for(const event of [RealtimeEvents.ERROR,RealtimeEvents.AUTH_ERROR,RealtimeEvents.QUOTA_EXCEEDED,RealtimeEvents.RATE_LIMITED,RealtimeEvents.TRANSCRIBER_ERROR,RealtimeEvents.INPUT_ERROR,RealtimeEvents.UNACCEPTED_TERMS,RealtimeEvents.INVALID_REQUEST,RealtimeEvents.RESOURCE_EXHAUSTED])c.on(event,fail);
   c.on(RealtimeEvents.CLOSE,()=>{if(current()){if(!stopping.current)setError('Voice input ended. Your text is kept.');release()}});
   timer.current=setTimeout(()=>{if(current()){setError('Microphone connection timed out. Please retry.');release()}},15000);
  }catch(e){if(current()){setError(e instanceof Error?e.message:'Microphone unavailable');release()}}
 }
 const busy=status==='connecting'||status==='finishing',recording=status==='listening';
 return <div className="mic-input"><button type="button" aria-label={recording?'Finish voice input':busy?'Connecting voice input':'Describe your work by voice'} aria-pressed={recording} title={recording?'Listening · words appear live':busy?'Connecting…':'Speak your search'} disabled={busy} onClick={()=>recording?finish():void start()}>{busy?<LoaderCircle className="mic-spinner" size={18}/>:recording?<Square size={16}/>:<Mic size={19}/>}</button>{status!=='idle'&&<span className="mic-live-label" role="status">{recording?'Listening live':status==='finishing'?'Finishing…':'Connecting…'}</span>}{error&&<small role="alert">{error}</small>}</div>
}

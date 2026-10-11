const buckets=new Map();
export function requestBudget(identity,operation,now=Date.now()){
 const polling=operation==='getDiscoveryJob';
 const key=identity+':'+(polling?'poll':'action');
 const ceiling=polling?120:30;
 const recent=(buckets.get(key)||[]).filter(t=>t>now-60000);
 if(recent.length>=ceiling)return {allowed:false,retryAfter:Math.max(1,Math.ceil((recent[0]+60000-now)/1000))};
 recent.push(now);if(buckets.size>1000)buckets.delete(buckets.keys().next().value);buckets.set(key,recent);
 return {allowed:true};
}

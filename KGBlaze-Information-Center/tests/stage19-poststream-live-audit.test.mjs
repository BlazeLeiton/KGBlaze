import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {finalization} from '../src/core.mjs';

// Read-only production snapshot. Never logs logoData, tokens, private URLs,
// raw provider descriptions, or writes editorial state.
const origins=[
 'https://kgblaze.dpdns.org/departures/api/public',
 'https://kgblaze-terminal.drago68575.workers.dev/api/public'
];
const cdmxDay=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',
 year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
function viewerStatus(event,sync,now){
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const start=html.indexOf('function verifiedItem(s){'),end=html.indexOf('function mergedEvents(){',start);
 assert.ok(start>=0&&end>start,'Published-compatible viewer status must exist');
 const text=html.slice(start,end);
 const fields=d=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Mexico_City',year:'numeric',month:'numeric',day:'numeric',
  hour:'numeric',minute:'numeric',hourCycle:'h23'
 }).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 class DateAt extends Date{static now(){return now.getTime();}}
 const scope={
  publicState:{sync:{[event.id]:sync}},Date:DateAt,
  TWITCH_RESTART_GRACE_MS:15*60*1000,
  TZ:'America/Mexico_City',zoneFields:fields,
  foreignToUTC:(y,m,d,h,mi)=>Date.UTC(y,m-1,d,h+6,mi)
 };
 vm.createContext(scope);
 return vm.runInContext(text+'\nresolveDisplayStatus',scope)(event);
}
const compact=o=>o?{
 source:o.source??null,status:o.status??null,verified:o.verified===true,
 matchConfirmed:o.matchConfirmed===true,checkedAt:o.checkedAt??null,
 checkedAgeMinutes:o.checkedAt?Math.round((Date.now()-Date.parse(o.checkedAt))/60000):null,
 videoId:o.videoId??null,
 lifeCycleStatus:o.lifeCycleStatus??null,
 actualEndTime:o.actualEndTime??null,
 endedAt:o.endedAt??null,
 scanComplete:o.scanComplete??null
}:null;

test('Live production post-broadcast snapshot, no writes',async()=>{
 let data=null,where=null;
 for(const endpoint of origins){
  try{
   const res=await fetch(endpoint,{headers:{Accept:'application/json','Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});
   if(!res.ok)continue;
   const val=await res.json();
   if(Array.isArray(val?.events)){data=val;where=endpoint;break;}
  }catch{}
 }
 assert.ok(data,'Public Terminal could not be read; do not claim transition success');
 const now=new Date();
 console.log('RELIGHT POSTSTREAM SNAPSHOT',JSON.stringify({
  checkedAt:now.toISOString(),localDay:cdmxDay(now),revision:data.revision,
  generatedAt:data.responseGeneratedAt,source:where,eventCount:data.events.length,
  syncEntries:Object.keys(data.sync||{}).length
 }));
 const nearby=data.events.filter(e=>/killer chat/i.test(e.title||'')||
  ['2026-10-13','2026-10-14',cdmxDay(now)].includes(e.day)).slice(0,25);
 assert.ok(nearby.length>0,'No matching current/recent events; cannot determine which closed');
 for(const e of nearby){
  const sync=data.sync?.[e.id]||{};
  console.log('RELIGHT POSTSTREAM EVENT',JSON.stringify({
   id:e.id,day:e.day,time:e.time,title:e.title,category:e.category,
   editorial:e.status,display:(()=>{try{return viewerStatus(e,sync,now);}catch(err){return 'NOT_EVALUABLE:'+err.message;}})(),finalization:finalization(e,sync,now.getTime()),
   platforms:e.platforms,videoId:e.videoId||null,
   youtube:compact(sync.youtube),twitch:compact(sync.twitch)
  }));
  if(/killer chat/i.test(e.title||'')&&sync.youtube?.checkedAt){
   const staleAt=new Date(Date.parse(sync.youtube.checkedAt)+16*60*1000);
   console.log('RELIGHT POSTSTREAM TTL FORECAST',JSON.stringify({
    basedOnObservedAt:sync.youtube.checkedAt,
    statusAt16MinutesWithoutFreshObservation:viewerStatus(e,sync,staleAt),
    permanentFinalizationAt16Minutes:finalization(e,sync,staleAt.getTime()),
    editorialStatusUnaffected:e.status,
    note:'Simulation only. This is not an observation of the actual future state.'
   }));
  }
 }
 console.log('RELIGHT POSTSTREAM READ ONLY: no action applied to agenda or sync.');
});

// Follow-up read-only observation after initial EN VIVO sample's 15-min freshness boundary.

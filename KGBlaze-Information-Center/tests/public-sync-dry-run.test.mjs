// Simulate platform observations against the actual public viewer status rules.
// Intentionally no HTTP, no Cloudflare, no credentials, no production writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const start=html.indexOf('function verifiedItem(s){');
const end=html.indexOf('function mergedEvents(){',start);
assert.ok(start>0&&end>start,'Viewer sync status functions must be present');
const statusSource=html.slice(start,end);
assert.match(statusSource,/function resolveDisplayStatus\(e\)/);

const NOW='2026-10-13T22:00:00.000Z';
const checkedAt='2026-10-13T21:59:00.000Z';
const T0=Date.parse(NOW);
const liveYT={verified:true,checkedAt,matchConfirmed:true,status:'live',videoId:'abcdefghijk'};
const liveTW={verified:true,checkedAt,matchConfirmed:true,status:'live'};
const event=(overrides={})=>({id:'tw:test-fixture',origin:'twitch',day:'2026-10-13',time:'22:00',title:'Caso de prueba',status:'A TIEMPO',platforms:['yt','tw'],...overrides});
const cdmxParts=iso=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date(iso)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
function displayedStatus(e,observation={},now=NOW){
 class FakeDate extends Date {static now(){return Date.parse(now);}}
 const scope={
  publicState:{sync:{[e.id]:observation}},
  Date:FakeDate,
  TWITCH_RESTART_GRACE_MS:15*60*1000,
  TZ:'America/Mexico_City',
  zoneFields:cdmxParts,
  // Mexico City no longer applies DST; test events are deliberately in 2026.
  foreignToUTC:(y,m,d,h,mi)=>Date.UTC(y,m-1,d,h+6,mi)
 };
 vm.createContext(scope);
 const resolve=vm.runInContext(statusSource+'\nresolveDisplayStatus',scope);
 return resolve(e);
}
test('without observations the viewer leaves editorial states unchanged',()=>{
 assert.equal(displayedStatus(event()),'A TIEMPO');
 assert.equal(displayedStatus(event({status:'POR CONFIRMAR'})),'POR CONFIRMAR');
 assert.equal(displayedStatus(event({status:'DESPEGÓ'})),'DESPEGÓ');
});
test('only fresh, confirmed and verified YouTube live is shown as EN VIVO',()=>{
 assert.equal(displayedStatus(event(),{youtube:liveYT}),'EN VIVO');
 assert.equal(displayedStatus(event(),{youtube:{...liveYT,verified:false}}),'A TIEMPO');
 assert.equal(displayedStatus(event(),{youtube:{...liveYT,matchConfirmed:false}}),'A TIEMPO');
 assert.equal(displayedStatus(event(),{youtube:{...liveYT,checkedAt:'2026-10-13T21:43:00Z'}}),'A TIEMPO');
 assert.equal(displayedStatus(event(),{youtube:{...liveYT,checkedAt:'2026-10-13T22:02:00Z'}}),'A TIEMPO');
});
test('YouTube completion requires completed plus lifeCycleStatus complete',()=>{
 const completed={...liveYT,status:'completed'};
 assert.equal(displayedStatus(event(),{youtube:completed}),'A TIEMPO');
 assert.equal(displayedStatus(event(),{youtube:{...completed,lifeCycleStatus:'complete'}}),'DESPEGÓ');
 assert.equal(displayedStatus(event(),{youtube:{...completed,lifeCycleStatus:'interrupted'}}),'A TIEMPO');
});
test('confirmed future YouTube scheduling can confirm or reschedule without editing original event',()=>{
 const base=event({status:'POR CONFIRMAR'});
 assert.equal(displayedStatus(base,{youtube:{...liveYT,status:'upcoming'}}),'A TIEMPO');
 assert.equal(displayedStatus(base,{youtube:{...liveYT,status:'upcoming',scheduledAt:'2026-10-14T04:00:00Z'}}),'A TIEMPO');
 assert.equal(displayedStatus(base,{youtube:{...liveYT,status:'upcoming',scheduledAt:'2026-10-14T05:00:00Z'}}),'REPROGRAMADO');
 assert.equal(base.status,'POR CONFIRMAR');
});
test('dual-platform event defers to a recognized YouTube room instead of Twitch LIVE',()=>{
 const e=event();
 assert.equal(displayedStatus(e,{youtube:{...liveYT,status:'upcoming'},twitch:liveTW}),'A TIEMPO');
 assert.equal(displayedStatus(e,{youtube:{...liveYT,status:'missing',scanComplete:true},twitch:liveTW}),'EN VIVO');
 assert.equal(displayedStatus(e,{twitch:liveTW}),'EN VIVO');
});
test('Twitch-only event is live on confirmed observation; late or untrusted samples are rejected',()=>{
 const e=event({platforms:['tw']});
 assert.equal(displayedStatus(e,{twitch:liveTW}),'EN VIVO');
 assert.equal(displayedStatus(e,{twitch:{...liveTW,verified:false}}),'A TIEMPO');
 assert.equal(displayedStatus(e,{twitch:{...liveTW,checkedAt:'2026-10-13T21:43:00Z'}}),'A TIEMPO');
});
test('Twitch finalizes only at or beyond the 15-minute disconnect grace period',()=>{
 const e=event({platforms:['tw']});
 const tw={...liveTW,status:'completed',endedAt:new Date(T0-899000).toISOString()};
 assert.equal(displayedStatus(e,{twitch:tw}),'EN VIVO');
 assert.equal(displayedStatus(e,{twitch:{...tw,endedAt:new Date(T0-900000).toISOString()}}),'DESPEGÓ');
 assert.equal(displayedStatus(e,{twitch:{...tw,endedAt:undefined}}),'EN VIVO');
});
test('manual cancellation, rest days, layovers and hiatus override platform observations',()=>{
 for(const s of ['CANCELADO','DESCANSO','ESCALA','HIATUS']){
  assert.equal(displayedStatus(event({status:s}),{youtube:liveYT,twitch:liveTW}),s);
 }
});
test('events not marked with a platform ignore matching observations from it',()=>{
 const e=event({platforms:[]});
 assert.equal(displayedStatus(e,{youtube:liveYT,twitch:liveTW}),'A TIEMPO');
});
test('status simulations do not modify the event or observation objects',()=>{
 const e=event(),sync={youtube:liveYT,twitch:liveTW};
 const beforeEvent=structuredClone(e),beforeSync=structuredClone(sync);
 assert.equal(displayedStatus(e,sync),'EN VIVO');
 assert.deepEqual(e,beforeEvent);assert.deepEqual(sync,beforeSync);
});

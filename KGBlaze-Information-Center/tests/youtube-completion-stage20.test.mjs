import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY_AGENDA,finalization,lockedChanges} from '../src/core.mjs';
import {buildTrustedYouTubeObservations,applyTrustedYouTubeObservations,editorialIdentity} from '../experiments/youtube-matching/trusted-sync.mjs';
import {runScheduledYouTubeSync} from '../src/youtube-sync.mjs';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const OWN='UCRd_uwPjrsf6Z3CRXwNehEQ',FOREIGN='UC'+'Z'.repeat(22);
const VIDEO='JDkg-5tZ3G0',EVENT='tw:killer';
const END='2026-10-14T08:20:00Z', START='2026-10-14T04:01:00Z';
const NOW=new Date('2026-10-14T08:40:00Z');
const event=(x={})=>({id:EVENT,origin:'twitch',day:'2026-10-13',time:'22:00',
 title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',
 platforms:['yt','tw'],videoId:VIDEO,status:'A TIEMPO',...x});
const agenda=(events=[event()])=>({...EMPTY_AGENDA(),revision:2,events});
const broadcast=(updates={})=>({
 id:VIDEO,snippet:{channelId:OWN,title:'Encuentra el Amor | Killer Chat!',liveBroadcastContent:'none'},
 liveStreamingDetails:{scheduledStartTime:'2026-10-14T04:00:00Z',actualStartTime:START,actualEndTime:END},
 ...updates
});
const evidence=(items=[broadcast()],updates={})=>({
 ownedChannelId:OWN,fetchedAt:NOW.toISOString(),discoveryComplete:true,
 resources:items,discoveredVideoIds:[],
 ...updates
});
const previous=(e=event())=>({
 [e.id]:{youtube:{source:'youtube_data_api_v3',verified:true,matchConfirmed:true,
  checkedAt:'2026-10-14T08:15:00Z',status:'live',videoId:VIDEO,
  editorialIdentity:editorialIdentity(e)}}
});
const calculate=({e=event(),ev=evidence(),sync=previous(e),now=NOW,enabled=true}={})=>
 buildTrustedYouTubeObservations(agenda([e]),ev,{
  ownedChannelId:OWN,existingSync:sync,now,allowCompletion:enabled
 });
const complete=x=>x.observations[EVENT];

test('Gated by default: final video metadata never writes a completion',()=>{
 const x=calculate({enabled:false});
 assert.deepEqual(x.observations,{});
});
test('Verified YouTube video completion drives DESPEGÓ without manual editing',()=>{
 const x=calculate();
 const o=complete(x);
 assert.equal(o.status,'completed');
 assert.equal(o.lifeCycleStatus,'complete');
 assert.equal(o.completionEvidence,'videos_list_actual_end_time');
 assert.equal(o.endedAt,END);assert.equal(o.actualEndTime,END);
 assert.equal(o.videoId,VIDEO);assert.equal(o.verified,true);
 assert.equal(o.editorialIdentity,editorialIdentity(event()));
 assert.equal(finalization(event(),{youtube:o},NOW.getTime())?.reason,'youtube_complete');
 const merged=applyTrustedYouTubeObservations(previous(),x.observations);
 assert.equal(merged.changed,1);
 assert.equal(merged.next[EVENT].youtube.status,'completed');
});
test('YouTube actualEndTime finalizes at once, without a 15-minute Twitch grace',()=>{
 for(const offsetMs of [0,1_000,60_000,4*60_000,5*60_000,14*60_000+59_000]){
  const now=new Date(Date.parse(END)+offsetMs);
  const result=calculate({now,ev:evidence([broadcast()],{fetchedAt:now.toISOString()})});
  assert.equal(complete(result)?.status,'completed','elapsed milliseconds '+offsetMs);
  assert.equal(complete(result)?.completionEvidence,'videos_list_actual_end_time');
 }
 const early=new Date(Date.parse(END)-1);
 assert.equal(complete(calculate({now:early,ev:evidence([broadcast()],{fetchedAt:early.toISOString()})})),undefined,
  'A future end time cannot be accepted even one millisecond ahead');
});
test('Twitch-only retains its independent 15-minute confirmed-restart guard',()=>{
 const endedAt=END;
 const twitchOnly=event({platforms:['tw'],videoId:undefined});
 const sync={twitch:{status:'completed',matchConfirmed:true,endedAt}};
 assert.equal(finalization(twitchOnly,sync,Date.parse(END)+899000),null);
 assert.equal(finalization(twitchOnly,sync,Date.parse(END)+900000)?.reason,'twitch_grace_elapsed');
});
test('Dual-platform event waits for its verified YouTube room even if Twitch ended',()=>{
 const stream=event();
 const obs={youtube:previous()[EVENT].youtube,twitch:{status:'completed',matchConfirmed:true,endedAt:END}};
 assert.equal(finalization(stream,obs,Date.parse(END)+900_000),null,
  'Do not close an active matched YouTube broadcast on a Twitch-only signal');
 const now=new Date(Date.parse(END)+5_000);
 const completed=complete(calculate({now,ev:evidence([broadcast()],{fetchedAt:now.toISOString()})}));
 assert.equal(finalization(stream,{...obs,youtube:completed},now.getTime())?.reason,'youtube_complete');
});
test('Identity, verified channel and provider freshness are mandatory',()=>{
 const cases=[
  {e:event({videoId:'Z'.repeat(11)}),sync:{}},
  {e:event({videoId:undefined}),sync:{},ev:evidence()},
  {e:event({videoId:undefined}),sync:{[EVENT]:{youtube:{status:'live',source:'foreign',verified:true,videoId:VIDEO,matchConfirmed:true}}}},
  {ev:evidence([broadcast({snippet:{channelId:FOREIGN,title:'Killer Chat!',liveBroadcastContent:'none'}})])},
  {ev:evidence([broadcast()],{discoveryComplete:false})},
  {ev:evidence([broadcast()],{fetchedAt:'2026-10-14T08:01:00Z'})},
  {ev:evidence([broadcast()],{ownedChannelId:FOREIGN})},
  {e:event({status:'CANCELADO'})},
  {e:event({platforms:['tw']})}
 ];
 for(let i=0;i<cases.length;i++)assert.equal(complete(calculate(cases[i])),undefined,'case '+i);
});
test('Inconsistent or forged end metadata never finalizes',()=>{
 const cases=[
  {snippet:{channelId:OWN,title:'Killer Chat!',liveBroadcastContent:'live'}},
  {snippet:{channelId:OWN,title:'Killer Chat!',liveBroadcastContent:'upcoming'}},
  {liveStreamingDetails:{actualStartTime:START}},
  {liveStreamingDetails:{actualStartTime:START,actualEndTime:'2026-10-14T04:00:00Z'}},
  {liveStreamingDetails:{actualStartTime:START,actualEndTime:'2026-10-14T08:49:00Z'}},
  {liveStreamingDetails:{actualStartTime:START,actualEndTime:'2026-10-11T08:20:00Z'}},
  {liveStreamingDetails:{actualStartTime:'garbage',actualEndTime:END}}
 ];
 for(let i=0;i<cases.length;i++)assert.equal(complete(calculate({ev:evidence([broadcast(cases[i])])})),undefined,'case '+i);
});
test('No stale resurrection after verified completion; other platforms stay intact',()=>{
 const completed=complete(calculate());
 const original={[EVENT]:{twitch:{source:'trusted',status:'live'},youtube:completed}};
 const live={...previous()[EVENT].youtube,checkedAt:'2026-10-14T08:41:00Z'};
 const r=applyTrustedYouTubeObservations(original,{[EVENT]:live});
 assert.equal(r.changed,0);assert.deepEqual(r.next,original);
 const stale=applyTrustedYouTubeObservations(previous(),{[EVENT]:{...completed,checkedAt:'2026-10-14T08:14:00Z'}});
 assert.equal(stale.changed,0);
});
test('No completed without strong proof even if source/verified are asserted',()=>{
 const weak={...previous()[EVENT].youtube,status:'completed',lifeCycleStatus:'complete'};
 const r=applyTrustedYouTubeObservations({}, {[EVENT]:weak});
 assert.equal(r.changed,0);
});
test('Actual viewer chooses DESPEGÓ over a stale live and locks finalized editorial content',()=>{
 const c=complete(calculate());
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const start=html.indexOf('function verifiedItem(s){'),end=html.indexOf('function mergedEvents(){',start);
 assert.ok(start>=0&&end>start);
 const scope={publicState:{sync:{[EVENT]:{youtube:c}}},Date:class extends Date{static now(){return NOW.getTime();}},
  TWITCH_RESTART_GRACE_MS:900000,TZ:'America/Mexico_City'};
 vm.createContext(scope);
 const status=vm.runInContext(html.slice(start,end)+'\nresolveDisplayStatus',scope);
 assert.equal(status(event()),'DESPEGÓ');
 const first=agenda(),changed=structuredClone(first);changed.events[0].time='23:00';
 assert.deepEqual(lockedChanges(first,changed,{[EVENT]:{youtube:c}},NOW.getTime()),[EVENT]);
});
function fakeDB(a=agenda(),sync=previous()){
 const row={revision:2,editorial_json:JSON.stringify(a),sync_json:JSON.stringify(sync)};
 const db={row,writes:0,audits:0,conflict:false,prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>this.row};
  if(sql.startsWith('UPDATE'))return {bind:(next,revision,old)=>({run:async()=>{
   if(this.conflict||revision!==this.row.revision||old!==this.row.sync_json)return {meta:{changes:0}};
   this.row.sync_json=next;this.writes++;return {meta:{changes:1}};
  }})};
  if(sql.startsWith('INSERT'))return {bind:()=>({run:async()=>{this.audits++;}})};
  throw Error('Unexpected SQL');
 }};
 return db;
}
const config=(db,flag)=>({
 DB:db,YOUTUBE_SYNC_ENABLED:'true',YOUTUBE_COMPLETION_ENABLED:flag,
 YOUTUBE_CHANNEL_ID:OWN,YOUTUBE_API_KEY:'SYNTHETIC-KEY',
 YOUTUBE_PREVIEW_LIMITER:{limit:async()=>({success:true})}
});
const provider=async url=>{
 const u=new URL(url);
 if(u.pathname.endsWith('/videos'))return {ok:true,json:async()=>({items:[broadcast()]})};
 if(u.pathname.endsWith('/search'))return {ok:true,json:async()=>({items:[]})};
 throw Error('Unexpected request');
};
test('Cron commits verified completed observation only when Stage 20 flag enabled',async()=>{
 const db=fakeDB();
 const res=await runScheduledYouTubeSync(config(db,'true'),{now:NOW,slot:NOW,fetchImpl:provider});
 assert.equal(res.writes,1);assert.equal(db.writes,1);
 assert.equal(db.audits,1);
 assert.equal(db.row.revision,2);
 assert.equal(JSON.parse(db.row.editorial_json).events[0].status,'A TIEMPO');
 assert.equal(JSON.parse(db.row.sync_json)[EVENT].youtube.status,'completed');
 const again=await runScheduledYouTubeSync(config(db,'true'),{now:NOW,slot:NOW,fetchImpl:provider});
 assert.equal(again.writes,0);assert.equal(db.writes,1);
});
test('Cron disabled completion flag makes no irreversible write',async()=>{
 const db=fakeDB(),baseline=structuredClone(db.row);
 const res=await runScheduledYouTubeSync(config(db,'false'),{now:NOW,slot:NOW,fetchImpl:provider});
 assert.equal(res.writes,0);
 assert.equal(db.writes,0);
 assert.deepEqual(db.row,baseline);
});
test('Cron database CAS conflict blocks completion with no editorial changes',async()=>{
 const db=fakeDB();db.conflict=true;const baseline=structuredClone(db.row);
 const r=await runScheduledYouTubeSync(config(db,'true'),{now:NOW,slot:NOW,fetchImpl:provider});
 assert.equal(r.reason,'concurrent_update');
 assert.deepEqual(db.row,baseline);assert.equal(db.audits,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY_AGENDA} from '../src/core.mjs';
import {
 buildTrustedYouTubeObservations,applyTrustedYouTubeObservations,
 activeYouTubeEvents,editorialIdentity
} from '../experiments/youtube-matching/trusted-sync.mjs';
import {readYouTubeKnownVideos} from '../experiments/youtube-matching/read-only-source.mjs';
import {runScheduledYouTubeSync} from '../src/youtube-sync.mjs';

const OWN='UCRd_uwPjrsf6Z3CRXwNehEQ';
const FOREIGN='UC'+'Z'.repeat(22);
const NOW=new Date('2026-10-14T04:00:00Z'); // Tue 13 Oct 22:00 Mexico City
const id='JDkg-5tZ3G0';
const fixture=(overrides={})=>({
 id:'tw:killer',origin:'twitch',day:'2026-10-13',time:'22:00',
 title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',
 status:'A TIEMPO',platforms:['yt','tw'],...overrides
});
const agenda=(events=[fixture()])=>({...EMPTY_AGENDA(),revision:2,events});
const video=(overrides={})=>({
 id, snippet:{channelId:OWN,title:'💌 Encuentra el Amor | Killer Chat!',liveBroadcastContent:'upcoming'},
 liveStreamingDetails:{scheduledStartTime:NOW.toISOString()},...overrides
});
const proof=(resources=[video()],overrides={})=>({
 ownedChannelId:OWN,fetchedAt:NOW.toISOString(),discoveryComplete:true,
 discoveredVideoIds:[id],resources,
 discovery:{searchResults:{upcoming:1,live:0},uniqueDiscoveredVideoIds:1,explicitEditorialVideoIds:0},
 ...overrides
});
const plan=(a=agenda(),e=proof(),s={})=>buildTrustedYouTubeObservations(a,e,{
 ownedChannelId:OWN,existingSync:s,now:NOW
});
function dbFor(a=agenda(),sync={}){
 const row={revision:2,editorial_json:JSON.stringify(a),sync_json:JSON.stringify(sync)};
 const db={row,updates:0,audits:0,conflict:false,prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>this.row};
  if(sql.startsWith('UPDATE'))return {bind:(value,rev,old)=>({run:async()=>{
   if(this.conflict||this.row.revision!==rev||this.row.sync_json!==old)return {meta:{changes:0}};
   this.row.sync_json=value;this.updates++;return {meta:{changes:1}};
  }})};
  if(sql.startsWith('INSERT'))return {bind:()=>({run:async()=>{this.audits++;}})};
  throw Error('Unexpected SQL');
 }};
 return db;
}
const env=(db,overrides={})=>({
 DB:db,YOUTUBE_SYNC_ENABLED:'true',YOUTUBE_CHANNEL_ID:OWN,YOUTUBE_API_KEY:'FAKE-PRIVATE-KEY',
 YOUTUBE_PREVIEW_LIMITER:{limit:async()=>({success:true})},...overrides
});
const provider=(items=[video()],search=true)=>async raw=>{
 const url=new URL(raw);
 const itemsOut=url.pathname.endsWith('/search')
  ?{items:search&&url.searchParams.get('eventType')==='upcoming'?items.map(x=>({id:{kind:'youtube#video',videoId:x.id}})):[]}
  :{items};
 return {ok:true,json:async()=>itemsOut};
};
test('trusted planner converts original Killer Chat creative title to verified upcoming',()=>{
 const res=plan();
 assert.equal(res.considered,1);
 assert.equal(res.blocked,0);
 assert.deepEqual(Object.keys(res.observations),['tw:killer']);
 const o=res.observations['tw:killer'];
 assert.equal(o.verified,true);assert.equal(o.matchConfirmed,true);
 assert.equal(o.source,'youtube_data_api_v3');assert.equal(o.status,'upcoming');
 assert.equal(o.videoId,id);assert.equal(o.checkedAt,NOW.toISOString());
 assert.equal(o.scheduledAt,NOW.toISOString());
 for(const k of ['lifeCycleStatus','actualEndTime','endedAt'])assert.equal(Object.hasOwn(o,k),false);
});
test('live requires metadata plus actualStartTime, correct channel and UTC chronology',()=>{
 const live=video({snippet:{...video().snippet,liveBroadcastContent:'live'},
  liveStreamingDetails:{scheduledStartTime:NOW.toISOString(),actualStartTime:NOW.toISOString()}});
 assert.equal(plan(agenda(),proof([live])).observations['tw:killer'].status,'live');
 const future=video({...live,liveStreamingDetails:{...live.liveStreamingDetails,actualStartTime:'2026-10-15T04:00:00Z'}});
 assert.equal(Object.keys(plan(agenda(),proof([future])).observations).length,0);
 const foreign=video({...live,snippet:{...live.snippet,channelId:FOREIGN}});
 assert.equal(Object.keys(plan(agenda(),proof([foreign])).observations).length,0);
});
test('videos.list ended metadata NEVER authorizes irreversible DESPEGÓ',()=>{
 const ended=video({snippet:{...video().snippet,liveBroadcastContent:'none'},
  liveStreamingDetails:{scheduledStartTime:NOW.toISOString(),actualStartTime:'2026-10-14T02:00:00Z',actualEndTime:'2026-10-14T03:00:00Z'}});
 const r=plan(agenda([fixture({videoId:id})]),proof([ended]));
 assert.equal(Object.keys(r.observations).length,0);
});
test('stale, future or incomplete sources cannot publish verified claims',()=>{
 for(const e of [
  proof([video()],{fetchedAt:'2026-10-14T03:40:00Z'}),
  proof([video()],{fetchedAt:'2026-10-14T04:10:00Z'}),
  proof([video()],{discoveryComplete:false}),
  proof([video()],{ownedChannelId:FOREIGN})
 ]) {
  const r=plan(agenda(),e);
  assert.deepEqual(r.observations,{});
 }
});
test('manual overrides and wrong platforms never get sync',()=>{
 const r=plan(agenda([
  fixture({id:'one',status:'CANCELADO'}),
  fixture({id:'two',status:'DESCANSO'}),
  fixture({id:'three',platforms:['tw']})
 ]));
 assert.equal(r.considered,0);
 assert.equal(Object.keys(r.observations).length,0);
});
test('duplicated room claims stay blocked even when the video is authentic',()=>{
 const r=plan(agenda([fixture({id:'a'}),fixture({id:'b'})]));
 assert.equal(r.blocked,2);assert.deepEqual(r.observations,{});
});
test('existing Twitch or other provider sync is preserved and not trusted for YouTube',()=>{
 const previous={'tw:killer':{twitch:{status:'live',verified:true}}};
 const p=plan();
 const merged=applyTrustedYouTubeObservations(previous,p.observations);
 assert.equal(merged.changed,1);assert.deepEqual(merged.next['tw:killer'].twitch,previous['tw:killer'].twitch);
 assert.deepEqual(previous,{'tw:killer':{twitch:{status:'live',verified:true}}});
});
test('only server-labelled observations are allowed into merge',()=>{
 const r=applyTrustedYouTubeObservations({},{
  a:{verified:true,matchConfirmed:true,videoId:id,status:'live'},
  b:{source:'youtube_data_api_v3',verified:false,matchConfirmed:true,videoId:id,status:'live'},
  c:{source:'youtube_data_api_v3',verified:true,matchConfirmed:true,videoId:id,status:'completed'}
 });
 assert.equal(r.changed,0);assert.deepEqual(r.next,{});
});
test('nearby events use timezone-aware windows, never poll months ahead',()=>{
 assert.equal(activeYouTubeEvents(agenda([fixture()]),NOW).length,1);
 assert.equal(activeYouTubeEvents(agenda([fixture({day:'2026-11-01'})]),NOW).length,0);
 assert.equal(activeYouTubeEvents(agenda([fixture({day:'2026-10-11'})]),NOW).length,0);
});
test('scheduled runner is OFF by default even if Preview is true',async()=>{
 const db=dbFor();
 const r=await runScheduledYouTubeSync(env(db,{YOUTUBE_SYNC_ENABLED:undefined,YOUTUBE_PREVIEW_ENABLED:'true'}),{
  now:NOW,fetchImpl:async()=>{throw Error('MUST NEVER FETCH');}
 });
 assert.equal(r.reason,'disabled');assert.equal(db.updates,0);
});
test('scheduled hourly discovery writes verified upcoming with CAS and no editorial change',async()=>{
 const db=dbFor();
 const initial=structuredClone(db.row);
 const called=[];
 const fake=async url=>{called.push(new URL(url));return provider() (url);};
 const result=await runScheduledYouTubeSync(env(db),{now:NOW,fetchImpl:fake});
 assert.equal(result.reason,'verified_observations_written');
 assert.equal(result.writes,1);assert.equal(db.updates,1);assert.equal(db.audits,1);
 assert.equal(called.filter(x=>x.pathname.endsWith('/search')).length,2);
 assert.equal(called.filter(x=>x.pathname.endsWith('/videos')).length,1);
 assert.equal(db.row.revision,initial.revision);
 assert.equal(db.row.editorial_json,initial.editorial_json);
 const sync=JSON.parse(db.row.sync_json);
 assert.equal(sync['tw:killer'].youtube.status,'upcoming');
 assert.equal(sync['tw:killer'].youtube.verified,true);
 assert.equal(JSON.stringify(result).includes('FAKE-PRIVATE-KEY'),false);
});
test('five-minute detail refresh uses videos.list only after editorial or stored match',async()=>{
 const a=agenda([fixture({videoId:id})]),db=dbFor(a);
 const now=new Date('2026-10-14T04:05:00Z');
 let searches=0,videos=0;
 const fake=async url=>{
  const u=new URL(url);
  if(u.pathname.endsWith('/search'))searches++;else videos++;
  return {ok:true,json:async()=>({items:[video()]})};
 };
 const result=await runScheduledYouTubeSync(env(db),{now,fetchImpl:fake});
 assert.equal(result.writes,1);assert.equal(searches,0);assert.equal(videos,1);
});
test('unknown unlinked event waits for discovery time instead of repeatedly searching',async()=>{
 const db=dbFor();
 const now=new Date('2026-10-14T04:05:00Z');
 const result=await runScheduledYouTubeSync(env(db),{now,fetchImpl:async()=>{throw Error('SHOULD NOT FETCH');}});
 assert.equal(result.reason,'await_discovery_slot');assert.equal(db.updates,0);
});
test('trusted discovered room is refreshed without editorial ID via stored identity',async()=>{
 const a=agenda(),source=plan(a).observations,db=dbFor(a,{'tw:killer':{youtube:source['tw:killer']}});
 const now=new Date('2026-10-14T04:05:00Z');
 const result=await runScheduledYouTubeSync(env(db),{now,fetchImpl:provider([video()],false)});
 assert.equal(result.writes,1);
 assert.equal(JSON.parse(db.row.sync_json)['tw:killer'].youtube.videoId,id);
});
test('provider failure and CAS conflict never corrupt editorial revision or sync',async()=>{
 const db=dbFor();
 const before=structuredClone(db.row);
 await assert.rejects(runScheduledYouTubeSync(env(db),{now:NOW,fetchImpl:async()=>({ok:false,status:403})}));
 assert.deepEqual(db.row,before);
 db.conflict=true;
 const result=await runScheduledYouTubeSync(env(db),{now:NOW,fetchImpl:provider()});
 assert.equal(result.reason,'concurrent_update');
 assert.equal(db.updates,0);assert.equal(db.audits,0);
});
test('disabled channel, missing key, or rate limiter fails before provider',async()=>{
 for(const overrides of [
  {YOUTUBE_API_KEY:undefined},{YOUTUBE_CHANNEL_ID:FOREIGN},
  {YOUTUBE_PREVIEW_LIMITER:undefined},
  {YOUTUBE_PREVIEW_LIMITER:{limit:async()=>({success:false})}}
 ]){
  const db=dbFor();
  const out=await runScheduledYouTubeSync(env(db,overrides),{
   now:NOW,fetchImpl:async()=>{throw Error('SHOULD NOT FETCH');}
  });
  assert.equal(db.updates,0);assert.notEqual(out.reason,'verified_observations_written');
 }
});
test('non-hour detail API accepts explicit IDs but never claims fresh search discovery',async()=>{
 const r=await readYouTubeKnownVideos({ownedChannelId:OWN,apiKey:'SYNTHETIC',fetchImpl:provider(),videoIds:[id],now:()=>NOW});
 assert.equal(r.resources.length,1);assert.equal(r.discoveryComplete,true);
 assert.deepEqual(r.discoveredVideoIds,[]);assert.equal(r.discovery.uniqueDiscoveredVideoIds,0);
});
test('editorialIdentity changes when title or time changes',()=>{
 assert.notEqual(editorialIdentity(fixture()),editorialIdentity(fixture({time:'21:00'})));
 assert.notEqual(editorialIdentity(fixture()),editorialIdentity(fixture({title:'Otra salida'})));
});

test('72-hour preflight window sees tomorrow and day-after rooms, not week-away rooms',()=>{
 const nextEvent=fixture({day:'2026-10-16',time:'22:00'});
 assert.equal(activeYouTubeEvents(agenda([nextEvent]),NOW).length,1,
  'October 16 at 22:00 CDMX is precisely 72 hours after test instant');
 assert.equal(activeYouTubeEvents(agenda([fixture({day:'2026-10-17',time:'22:00'})]),NOW).length,0);
});
test('expanded 72-hour window does not remove the 8-hour past-broadcast cutoff',()=>{
 const old=fixture({day:'2026-10-13',time:'13:59'});
 assert.equal(activeYouTubeEvents(agenda([old]),NOW).length,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {buildYouTubePreflight,runManualYouTubePreflight} from '../experiments/youtube-matching/preflight.mjs';
import {readYouTubePreviewEvidence} from '../experiments/youtube-matching/read-only-source.mjs';
import {publicAgenda,EMPTY_AGENDA} from '../src/core.mjs';

const OWN='UC'+'A'.repeat(22), OTHER='UC'+'B'.repeat(22);
const TIME='2026-10-14T00:00:00Z';
const NOW=new Date(TIME);
const event=(changes={})=>({id:'tw:test',origin:'twitch',day:'2026-10-13',time:'18:00',title:'Azur Lane Octublaze',status:'A TIEMPO',platforms:['yt','tw'],...changes});
const room=(changes={})=>({id:'Abcdef12345',snippet:{channelId:OWN,title:'Azur Lane Octublaze',liveBroadcastContent:'upcoming'},liveStreamingDetails:{scheduledStartTime:TIME},...changes});
const agenda=(events=[event()])=>({...EMPTY_AGENDA(),revision:1,events});
const evidence=(resources=[room()],changes={})=>({schema:'relight-youtube-evidence-preview-v1',ownedChannelId:OWN,fetchedAt:'2026-10-13T23:59:00Z',discoveryComplete:true,resources,...changes});
const preview=(a=agenda(),e=evidence(),own=OWN)=>buildYouTubePreflight(a,e,{ownedChannelId:own,now:NOW});

test('preflight returns a proposal, not verified, confirmed, or sync object',()=>{
 const r=preview();assert.equal(r.items.length,1);assert.equal(r.items[0].decision,'candidate');
 assert.equal(r.items[0].evidenceSignal,'upcoming_unverified');
 assert.equal(r.safeToApply,false);assert.equal(r.directSyncWrites,0);
 for(const k of ['sync','verified','matchConfirmed','status','lifeCycleStatus'])assert.equal(Object.hasOwn(r.items[0],k),false);
});
test('preflight cannot mutate public agenda, source data, revision or editorial status',()=>{
 const a=agenda(),e=evidence(),a0=structuredClone(a),e0=structuredClone(e);
 const pub=publicAgenda(a,{},1,NOW),copy=structuredClone(pub);preview(a,e);
 assert.deepEqual(a,a0);assert.deepEqual(e,e0);assert.deepEqual(pub,copy);
 assert.equal(pub.revision,1);assert.equal(pub.events[0].status,'A TIEMPO');
});
test('public video actualEndTime alone never supplies lifeCycleStatus complete',()=>{
 const v=room({snippet:{...room().snippet,liveBroadcastContent:'none'},liveStreamingDetails:{
  scheduledStartTime:TIME,actualStartTime:TIME,actualEndTime:'2026-10-14T01:00:00Z'
 }});
 const r=preview(agenda(),evidence([v]));
 assert.equal(r.items[0].evidenceSignal,'ended_unverified');
 assert.equal(JSON.stringify(r).includes('lifeCycleStatus'),false);
 assert.equal(JSON.stringify(r).includes('matchConfirmed'),false);
});
test('YouTube live metadata alone remains explicitly unverified',()=>{
 const v=room({snippet:{...room().snippet,liveBroadcastContent:'live'},liveStreamingDetails:{
  scheduledStartTime:TIME,actualStartTime:'2026-10-14T00:01:00Z'
 }});
 const r=preview(agenda(),evidence([v]));
 assert.equal(r.items[0].evidenceSignal,'live_unverified');assert.equal('status' in r.items[0],false);
});
test('stale samples, future-dated samples, and absent timestamps are review-only',()=>{
 for(const fetchedAt of ['2026-10-13T23:54:00Z','2026-10-14T00:01:00Z',null]){
  const r=preview(agenda(),evidence([room()],{fetchedAt}));
  assert.equal(r.items[0].decision,'review');assert.equal(r.items[0].reason,'stale_or_missing_evidence_timestamp');
 }
});
test('pagination may conceal competing rooms: no unique-match assertion',()=>{
 const r=preview(agenda(),evidence([room()],{discoveryComplete:false}));
 assert.equal(r.items[0].reason,'source_discovery_incomplete');assert.equal(r.items[0].decision,'review');
});
test('own channel must match independently configured trusted ID',()=>{
 const r=preview(agenda(),evidence([room()],{ownedChannelId:OTHER}));
 assert.equal(r.items[0].reason,'untrusted_channel_configuration');assert.equal(r.items[0].decision,'review');
});
test('wrong channel candidate is never accepted',()=>{
 const v=room({snippet:{...room().snippet,channelId:OTHER}});
 const r=preview(agenda(),evidence([v]));assert.equal(r.items[0].decision,'none');
});
test('manual rest days and unplatformed Collab Padoru are never touched',()=>{
 const a=agenda([
  event({id:'man:rest-12',origin:'manual',day:'2026-10-12',time:'',title:'',status:'DESCANSO',platforms:[]}),
  event({id:'man:collab',origin:'manual',day:'2026-10-17',time:'',title:'Collab Padoru',status:'POR CONFIRMAR',platforms:[]}),
  event({id:'man:rest-18',origin:'manual',day:'2026-10-18',time:'',title:'',status:'DESCANSO',platforms:[]})
 ]);
 const r=preview(a);assert.deepEqual(r.items.map(x=>x.decision),['skipped','skipped','skipped']);
 assert.equal(a.events[1].status,'POR CONFIRMAR');assert.equal(a.events[1].origin,'manual');
});
test('manual Mexico GP with YouTube platform is eligible but is not an invented match',()=>{
 const e=event({id:'man:gp',origin:'manual',day:'2026-11-01',time:'14:00',
  title:'Formula 1 Gran Premio de la Ciudad de México 2026',platforms:['yt','tw','dc']});
 const r=preview(agenda([e]));assert.equal(r.items[0].reason,'no_safe_match');
 assert.equal(e.status,'A TIEMPO');
});
test('inconsistent liveStreamingDetails yields manual review',()=>{
 const v=room({snippet:{...room().snippet,liveBroadcastContent:'live'}});
 const r=preview(agenda(),evidence([v]));
 assert.equal(r.items[0].decision,'review');assert.equal(r.items[0].reason,'inconsistent_platform_metadata');
});
test('two departures attempting to claim the same YouTube room are rejected',()=>{
 const r=preview(agenda([event({id:'tw:one'}),event({id:'tw:two'})]));
 assert.deepEqual(r.items.map(x=>x.reason),['video_claimed_by_multiple_events','video_claimed_by_multiple_events']);
});
test('invalid editorial input is rejected before any HTTP request',async()=>{
 let calls=0;
 await assert.rejects(runManualYouTubePreflight({schema:'invalid',events:[]},{fetchImpl:async()=>{calls++;}}),/INVALID_EDITORIAL_INPUT/);
 assert.equal(calls,0);
});
test('no channel ID or credentials: fail closed without network',async()=>{
 let calls=0;
 const fn=async()=>{calls++;};
 await assert.rejects(readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'',fetchImpl:fn}),/YOUTUBE_READ_CONFIGURATION_REQUIRED/);
 await assert.rejects(readYouTubePreviewEvidence({ownedChannelId:'@channel',apiKey:'fake',fetchImpl:fn}),/YOUTUBE_READ_CONFIGURATION_REQUIRED/);
 assert.equal(calls,0);
});
test('manual API reader scopes search to channel, type video, upcoming and live, then enriches IDs',async()=>{
 const calls=[];
 const fake=async u=>{
  const url=new URL(u);calls.push(url);
  return {ok:true,json:async()=>url.pathname.endsWith('/search')
   ?{items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}}]}
   :{items:[room()]}};
 };
 const r=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'secret-fixture',fetchImpl:fake,now:()=>NOW});
 assert.equal(calls.length,3);assert.deepEqual(calls.slice(0,2).map(x=>x.searchParams.get('eventType')),['upcoming','live']);
 assert.ok(calls.slice(0,2).every(x=>x.searchParams.get('channelId')===OWN&&x.searchParams.get('type')==='video'));
 assert.deepEqual(r.resources,[room()]);assert.equal(r.discoveryComplete,true);
 assert.equal(JSON.stringify(r).includes('secret-fixture'),false);
});
test('unfinished search pagination safely blocks apparent one-to-one match',async()=>{
 const fake=async u=>({ok:true,json:async()=>new URL(u).pathname.endsWith('/search')
  ?{nextPageToken:'NEXT',items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}}]}
  :{items:[room()]}});
 const r=await runManualYouTubePreflight(agenda(),{ownedChannelId:OWN,apiKey:'fake',fetchImpl:fake,now:()=>NOW});
 assert.equal(r.items[0].decision,'review');assert.equal(r.items[0].reason,'source_discovery_incomplete');
});
test('missing video detail response is incomplete',async()=>{
 const fake=async()=>({ok:true,json:async()=>({items:[]})});
 const r=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'fake',fetchImpl:fake,explicitVideoIds:['Abcdef12345'],now:()=>NOW});
 assert.equal(r.discoveryComplete,false);
});
test('fixed ID is enriched even when search returns no entries',async()=>{
 const calls=[];
 const fake=async u=>{
  const url=new URL(u);calls.push(url);
  return {ok:true,json:async()=>url.pathname.endsWith('/search')?{items:[]}:{items:[room()]}};
 };
 const r=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'fake',fetchImpl:fake,explicitVideoIds:['Abcdef12345'],now:()=>NOW});
 assert.equal(r.resources.length,1);assert.equal(calls.filter(x=>x.pathname.endsWith('/videos')).length,1);
});
test('network errors never leak API key or response body',async()=>{
 const fake=async()=>({ok:false,status:403,text:async()=>'secret'});
 await assert.rejects(readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'TOP-SECRET',fetchImpl:fake}),e=>{
  assert.equal(e.message.includes('TOP-SECRET'),false);assert.equal(e.message.includes('secret'),false);return true;
 });
});
test('manual end-to-end preflight with mocked provider never returns API key or sync',async()=>{
 const fake=async u=>({ok:true,json:async()=>new URL(u).pathname.endsWith('/search')
  ?{items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}}]}
  :{items:[room()]}});
 const r=await runManualYouTubePreflight(agenda(),{ownedChannelId:OWN,apiKey:'SECRET-ONLY-IN-MEMORY',fetchImpl:fake,now:()=>NOW});
 assert.equal(r.items[0].decision,'candidate');assert.equal(r.safeToApply,false);
 assert.equal(r.directSyncWrites,0);assert.equal(JSON.stringify(r).includes('SECRET-ONLY-IN-MEMORY'),false);
});


test('Stage 6 real-world fixture: preflight discovers Killer Chat by game category with no manual ID',async()=>{
 const editorial=agenda([event({
  title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition'
 })]);
 const creative=room({
  id:'JDkg-5tZ3G0',
  snippet:{...room().snippet,title:'💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!'}
 });
 const requests=[];
 const fake=async raw=>{
  const url=new URL(raw);requests.push(url);
  if(url.pathname.endsWith('/search'))return {ok:true,json:async()=>({
   items:url.searchParams.get('eventType')==='upcoming'
    ?[{id:{kind:'youtube#video',videoId:'JDkg-5tZ3G0'}}]:[]
  })};
  return {ok:true,json:async()=>({items:[creative]})};
 };
 const result=await runManualYouTubePreflight(editorial,{ownedChannelId:OWN,apiKey:'fixture-only',fetchImpl:fake,now:()=>NOW});
 assert.equal(requests.length,3);
 assert.equal(result.evidenceSummary.uniqueDiscoveredVideoIds,1);
 assert.equal(result.evidenceSummary.explicitEditorialVideoIds,0);
 assert.equal(result.evidenceSummary.discoveryComplete,true);
 assert.deepEqual(result.items[0],{
  eventId:'tw:test',decision:'candidate',reason:'unique_channel_category_time',
  videoId:'JDkg-5tZ3G0',evidenceSignal:'upcoming_unverified'
 });
 assert.equal(result.safeToApply,false);
 assert.equal(result.directSyncWrites,0);
 assert.equal(JSON.stringify(result).includes('fixture-only'),false);
});
test('Stage 6: preflight refuses two different game-title segments in competing rooms',()=>{
 const editorial=agenda([event({
  title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition'
 })]);
 const shared={...room().snippet};
 const first=room({id:'JDkg-5tZ3G0',snippet:{...shared,title:'Cita mortal | Killer Chat!'}});
 const second=room({id:'Another1234',snippet:{...shared,title:'Una historia diferente | Killer Chat!'}});
 const out=preview(editorial,evidence([first,second]));
 assert.equal(out.items[0].decision,'review');
 assert.equal(out.items[0].reason,'ambiguous_multiple_rooms');
 assert.equal(out.safeToApply,false);
});


test('Stage 6: linked Killer Chat also reports a search-only autonomous probe in the same HTTP call',async()=>{
 const editorial=agenda([event({
  title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',videoId:'JDkg-5tZ3G0'
 })]);
 const real=room({id:'JDkg-5tZ3G0',snippet:{...room().snippet,title:'💌 Encuentra el Amor o MUERE Intentándolo.....espera :v 🔪 | Killer Chat!'}});
 const requests=[];
 const fake=async raw=>{
  const url=new URL(raw);requests.push(url);
  return {ok:true,json:async()=>url.pathname.endsWith('/search')
   ?{items:url.searchParams.get('eventType')==='upcoming'?[{id:{kind:'youtube#video',videoId:'JDkg-5tZ3G0'}}]:[]}
   :{items:[real]}};
 };
 const result=await runManualYouTubePreflight(editorial,{ownedChannelId:OWN,apiKey:'fixture-only',fetchImpl:fake,now:()=>NOW});
 assert.equal(requests.length,3); // no extra Google API calls for the shadow probe
 assert.equal(result.evidenceSummary.explicitEditorialVideoIds,1);
 assert.equal(result.items[0].reason,'explicit_editorial_video_id');
 assert.equal(result.items[0].evidenceSignal,'upcoming_unverified');
 assert.deepEqual(result.items[0].autonomousProbe,{
  decision:'candidate',reason:'unique_channel_category_time',videoId:'JDkg-5tZ3G0'
 });
 assert.equal(result.safeToApply,false);
 assert.equal(result.directSyncWrites,0);
});
test('Stage 6: a manually linked ID retrieved only by videos.list must NOT masquerade as search discovery',async()=>{
 const editorial=agenda([event({
  title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',videoId:'JDkg-5tZ3G0'
 })]);
 const real=room({id:'JDkg-5tZ3G0',snippet:{...room().snippet,title:'Una cita mortal | Killer Chat!'}});
 const fake=async raw=>({ok:true,json:async()=>new URL(raw).pathname.endsWith('/search')
  ?{items:[]}
  :{items:[real]}});
 const out=await runManualYouTubePreflight(editorial,{ownedChannelId:OWN,apiKey:'fixture-only',fetchImpl:fake,now:()=>NOW});
 assert.equal(out.items[0].decision,'candidate');
 assert.equal(out.items[0].reason,'explicit_editorial_video_id');
 assert.deepEqual(out.items[0].autonomousProbe,{decision:'none',reason:'no_safe_match'});
 assert.equal(out.safeToApply,false);
});
test('Stage 6: an autonomously discovered different room conflicts with the manual editorial ID',()=>{
 const manual=room({id:'JDkg-5tZ3G0',snippet:{...room().snippet,title:'Otro directo del canal'}});
 const auto=room({id:'Another1234',snippet:{...room().snippet,title:'Juego de romance | Killer Chat!'}});
 const e=event({title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',videoId:'JDkg-5tZ3G0'});
 const out=preview(agenda([e]),evidence([manual,auto],{discoveredVideoIds:['Another1234']}));
 assert.equal(out.items[0].decision,'candidate');
 assert.deepEqual(out.items[0].autonomousProbe,{decision:'review',reason:'autonomous_editorial_id_conflict'});
});
test('Stage 6: shadow probes fail closed if discovery origin is missing, stale or incomplete',()=>{
 const e=event({title:'Killer Chat!: Original Edition',category:'Killer Chat!: Original Edition',videoId:'JDkg-5tZ3G0'});
 const v=room({id:'JDkg-5tZ3G0',snippet:{...room().snippet,title:'Encuentra el amor | Killer Chat!'}});
 for(const [changes, reason] of [
  [{},'search_origin_ids_unavailable'],
  [{discoveredVideoIds:['JDkg-5tZ3G0'],discoveryComplete:false},'source_discovery_incomplete'],
  [{discoveredVideoIds:['JDkg-5tZ3G0'],fetchedAt:'2026-10-13T23:00:00Z'},'stale_or_missing_evidence_timestamp']
 ]) {
  const out=preview(agenda([e]),evidence([v],changes));
  assert.equal(out.items[0].autonomousProbe.reason,reason);
  assert.notEqual(out.items[0].autonomousProbe.decision,'candidate');
 }
});

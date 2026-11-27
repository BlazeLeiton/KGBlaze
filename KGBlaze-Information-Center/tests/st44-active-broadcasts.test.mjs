import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {EMPTY_AGENDA,normalizeEditorial,publicAgenda,toSyncEnvelope} from '../src/core.mjs';
import {ACTIVE_BROADCASTS_KEY,projectActiveBroadcasts,refreshActiveYouTube,refreshActiveTwitch,syncActiveBroadcasts,setActiveBroadcastEditorial} from '../src/active-broadcasts.mjs';
const channel='UCRd_uwPjrsf6Z3CRXwNehEQ',id='3jW8vQ3uo4c';
const now=new Date('2026-11-27T06:30:00Z');
const title='La Estudiante de Intercambio en la Academia | Azur Lane - The Transfer Student of Veritas Academy';
const y={id,channelId:channel,title,startedAt:'2026-11-27T05:55:00Z',checkedAt:now.toISOString()};
const tw={id:'12345',userId:'70386764',title:'🎓 La Estudiante de Intercambio en la Academia Veritas | Azur Lane x 2.5 Dimensional Seduction',category:'Azur Lane',startedAt:'2026-11-27T06:00:00Z',checkedAt:now.toISOString()};
const data=()=>publicAgenda(EMPTY_AGENDA(),{},4,now);
const env={YOUTUBE_CHANNEL_ID:channel,YOUTUBE_API_KEY:'TEST',TWITCH_RECOGNITION_BROADCASTER_ID:'70386764',TWITCH_CLIENT_ID:'test-client',TWITCH_CLIENT_SECRET:'TEST'};
const response=body=>({ok:true,json:async()=>body});
function video(privacy='public',status='live',owner=channel,endedAt){return {id,snippet:{channelId:owner,title,liveBroadcastContent:status},status:{privacyStatus:privacy},liveStreamingDetails:{actualStartTime:y.startedAt,...(endedAt?{actualEndTime:endedAt}:{})}}}
test('Stage 44: live simulcast adds one public-only row in YouTube/Twitch order with actual Mexico City start',()=>{
 const raw=data(),out=projectActiveBroadcasts(raw,{youtube:[y],twitch:tw},now);
 assert.equal(raw.events.length,0);
 assert.equal(out.events.length,1);const e=out.events[0];
 assert.deepEqual(e.platforms,['yt','tw']);assert.equal(e.status,'EN VIVO');
 assert.equal(e.spontaneous,true);assert.equal(e.day,'2026-11-26');assert.equal(e.time,'23:55');
 assert.equal(e.title,'Azur Lane');assert.equal(e.category,'Azur Lane');assert.equal(e.extra,title);
 assert.equal(out.sync[e.id].youtube.videoTitle,title);assert.equal(out.sync[e.id].youtube.videoId,id);
 assert.equal(out.sync[e.id].twitch.streamId,'12345');
 assert.equal(out.revision,4);
 assert.equal(normalizeEditorial(out,now).events.length,0);
 assert.deepEqual(toSyncEnvelope({[ACTIVE_BROADCASTS_KEY]:{youtube:[y]},original:{youtube:{status:'live'}}},4).events,[{eventId:'original',youtube:{status:'live'}}]);
});
test('Stage 44: exact scheduled video identity updates observation instead of adding row',()=>{
 const e={id:'planned',origin:'manual',day:'2026-11-26',time:'23:55',title,category:'Azur Lane',platforms:['yt','tw'],status:'A TIEMPO',videoId:id};
 const out=projectActiveBroadcasts({...data(),events:[e]},{youtube:[y],twitch:tw},now);
 assert.equal(out.events.length,1);assert.equal(out.events[0].id,'planned');assert.equal(out.events[0].status,'A TIEMPO');
 assert.equal(out.sync.planned.youtube.status,'live');
});
test('Stage 44: unrelated concurrent broadcasts are not merged; stale evidence expires',()=>{
 const out=projectActiveBroadcasts(data(),{youtube:[y],twitch:{...tw,title:'Otro juego distinto'}},now);
 assert.equal(out.events.length,2);
 const after=new Date(now.getTime()+15*60000);
 assert.equal(projectActiveBroadcasts(data(),{youtube:[y],twitch:tw},after).events.length,0);
});
test('Stage 44: shared discovery avoids duplicate search and verifies owner, public privacy and live status',async()=>{
 let calls=[];
 const result=await refreshActiveYouTube(env,[],{now,slot:now,sharedIds:[id],fetchImpl:async u=>{
  calls.push(new URL(u));return response({items:[video()]})}});
 // minute 30 is the independent live search slot; hour slot reuses shared discovery.
 calls=[];
 const hour=new Date('2026-11-27T06:00:00Z');
 const valid=await refreshActiveYouTube(env,[],{now,slot:hour,sharedIds:[id],fetchImpl:async u=>{
  calls.push(new URL(u));return response({items:[video()]})}});
 assert.equal(calls.length,1);assert.match(calls[0].pathname,/\/videos$/);
 assert.equal(valid[0].id,id);assert.equal(calls[0].searchParams.get('part'),'snippet,liveStreamingDetails,status');
 for(const v of [video('unlisted'),video('private'),video('public','none'),video('public','live','UCforeign'),video('public','live',channel,now.toISOString())]){
  const r=await refreshActiveYouTube(env,[y],{now,slot:new Date('2026-11-27T06:35:00Z'),fetchImpl:async()=>response({items:[v]})});
  assert.deepEqual(r,[]);
 }
});
test('Stage 44: bootstrap checks public state even outside discovery slots, expires and does not hardcode live state',async()=>{
 const config={...env,YOUTUBE_ACTIVE_BOOTSTRAP_VIDEO_ID:id,YOUTUBE_ACTIVE_BOOTSTRAP_UNTIL:'2026-11-27T18:00:00Z'};
 let calls=0;const fetchImpl=async u=>{calls++;assert.match(new URL(u).pathname,/\/videos$/);return response({items:[video()]})};
 const slot=new Date('2026-11-27T06:35:00Z');
 assert.equal((await refreshActiveYouTube(config,[],{now,slot,fetchImpl})).length,1);
 assert.equal(calls,1);
 const expired=new Date('2026-11-27T18:05:00Z');
 assert.deepEqual(await refreshActiveYouTube(config,[],{now:expired,slot:expired,fetchImpl}),[]);
 assert.equal(calls,1);
});
test('Stage 44: Twitch checks public stream of owner with app credentials; grace never creates new false live row',async()=>{
 let called=[];
 const fetchImpl=async (u,init)=>{const url=new URL(u);called.push(url);if(url.hostname==='id.twitch.tv')return response({access_token:'TEST',expires_in:3600});assert.equal(url.searchParams.get('user_id'),'70386764');assert.equal(init.headers.Authorization,'Bearer TEST');return response({data:[{id:'12345',user_id:'70386764',title:tw.title,game_name:'Azur Lane',type:'live',started_at:tw.startedAt}]})};
 const actual=await refreshActiveTwitch(env,null,{now,fetchImpl});assert.equal(actual.id,tw.id);
 assert.equal(called.length,2);
 const noLive=async()=>response({data:[]});
 assert.equal(await refreshActiveTwitch(env,null,{now,fetchImpl:noLive}),null);
 assert.equal((await refreshActiveTwitch(env,actual,{now,fetchImpl:noLive})).id,tw.id);
 const after=new Date(now.getTime()+15*60000);
 assert.equal(await refreshActiveTwitch(env,actual,{now:after,fetchImpl:noLive}),null);
});
test('Stage 44: D1 writer preserves editorial and existing observations via CAS',async()=>{
 const base={revision:4,editorial_json:JSON.stringify(EMPTY_AGENDA()),sync_json:JSON.stringify({planned:{youtube:{status:'upcoming'}}})};
 let written;const DB={prepare:sql=>({first:async()=>base,bind:(...args)=>({run:async()=>{assert.match(sql,/UPDATE terminal_state SET sync_json=\?/);assert.equal(args[1],4);assert.equal(args[2],base.sync_json);written=JSON.parse(args[0]);return {meta:{changes:1}}}})})};
 const config={...env,ACTIVE_BROADCASTS_ENABLED:'true',DB,YOUTUBE_ACTIVE_BOOTSTRAP_VIDEO_ID:id,YOUTUBE_ACTIVE_BOOTSTRAP_UNTIL:'2026-11-27T18:00:00Z'};
 const fetchImpl=async u=>{const url=new URL(u);if(url.hostname==='id.twitch.tv')return response({access_token:'TEST',expires_in:3600});if(url.hostname==='api.twitch.tv')return response({data:[]});return response({items:[video()]})};
 const r=await syncActiveBroadcasts(config,{now,slot:new Date('2026-11-27T06:35:00Z'),fetchImpl});
 assert.equal(r.ok,true);assert.equal(written.planned.youtube.status,'upcoming');
 assert.equal(written[ACTIVE_BROADCASTS_KEY].youtube[0].id,id);assert.equal(base.revision,4);
});

test('Stage 44: Twitch-only uses the game as its headline and the stream title as the extra',()=>{
 const e=projectActiveBroadcasts(data(),{youtube:[],twitch:tw},now).events[0];
 assert.equal(e.title,'Azur Lane');assert.equal(e.category,'Azur Lane');
 assert.equal(e.extra,tw.title);assert.deepEqual(e.platforms,['tw']);
});
test('Stage 44: YouTube-only uses a known specific activity or official category, never the long title as headline',()=>{
 const own={...y,categoryId:'20',category:'Videojuegos'};
 let e=projectActiveBroadcasts(data(),{youtube:[own],twitch:null},now).events[0];
 assert.equal(e.title,'Videojuegos');assert.equal(e.extra,title);
 const future={id:'planned',origin:'manual',day:'2026-11-28',time:'18:00',title:'Otro evento',category:'Azur Lane',platforms:['yt'],status:'A TIEMPO'};
 const input={...data(),events:[future]};
 const out=projectActiveBroadcasts(input,{youtube:[own],twitch:null},now);
 e=out.events.find(x=>x.spontaneous);
 assert.equal(e.title,'Azur Lane');assert.equal(e.extra,title);
 assert.deepEqual(out.events.find(x=>x.id==='planned'),future);
 const ambiguous={...future,id:'planned2',category:'Academia'};
 e=projectActiveBroadcasts({...input,events:[future,ambiguous]},{youtube:[own],twitch:null},now).events.find(x=>x.spontaneous);
 assert.equal(e.title,'Videojuegos');
 e=projectActiveBroadcasts(data(),{youtube:[y],twitch:null},now).events[0];
 assert.equal(e.title,'Transmisión en directo');assert.equal(e.extra,title);
});
test('Stage 44: official YouTube category lookup is batched, cached and non-blocking',async()=>{
 let categoryCalls=0;
 const v=video();v.snippet.categoryId='20';
 const fetchImpl=async u=>{
  const url=new URL(u);
  if(url.pathname.endsWith('/videoCategories')){
   categoryCalls++;
   assert.equal(url.searchParams.get('id'),'20');
   assert.equal(url.searchParams.get('hl'),'es');
   return response({items:[{id:'20',snippet:{title:'Videojuegos'}}]});
  }
  return response({items:[v]});
 };
 const slot=new Date('2026-11-27T06:00:00Z');
 const first=await refreshActiveYouTube(env,[],{now,slot,sharedIds:[id],fetchImpl});
 assert.equal(first[0].category,'Videojuegos');assert.equal(categoryCalls,1);
 const again=await refreshActiveYouTube(env,first,{now,slot,sharedIds:[id],fetchImpl});
 assert.equal(again[0].category,'Videojuegos');assert.equal(categoryCalls,1);
 const degraded=await refreshActiveYouTube(env,[],{now,slot,sharedIds:[id],fetchImpl:async u=>
  new URL(u).pathname.endsWith('/videoCategories')?{ok:false}:response({items:[v]})});
 assert.equal(degraded[0].id,id);assert.equal(degraded[0].category,'');
});

test('Stage 44: actual Home banner uses projected category and provider title, idle returns empty',()=>{
 const ctx={window:{}};
 runInNewContext(readFileSync(new URL('../public/assets/home-departure-state.js',import.meta.url),'utf8'),ctx);
 const home=ctx.window.KGHomeDeparture;
 for(const state of [{youtube:[y],twitch:tw},{youtube:[],twitch:tw}]){
  const d=projectActiveBroadcasts(data(),state,now);
  const selected=home.select(d,now.getTime());
  assert.equal(selected.kind,'live');
  assert.equal(home.category(selected.e),'Azur Lane');
  assert.equal(home.subtitle(selected.e,selected.sync,selected.status,'es'),state.youtube.length?title:tw.title);
 }
 assert.equal(home.select(projectActiveBroadcasts(data(),{youtube:[],twitch:null},now),now.getTime()).kind,'empty');
});

test('Stage 44: owner editorial override changes presentation only, survives projection, and rejects nonexistent live IDs',async()=>{
 const state={youtube:[y],twitch:tw};const d=data();let row={revision:d.revision,editorial_json:JSON.stringify(d),sync_json:JSON.stringify({[ACTIVE_BROADCASTS_KEY]:state})};
 const db={prepare(sql){return {first:async()=>({...row}),bind(encoded,revision,old){return {run:async()=>{assert.equal(revision,row.revision);assert.equal(old,row.sync_json);row.sync_json=encoded;return {meta:{changes:1}}}}}}}};
 const e=projectActiveBroadcasts(d,state,now).events[0];const settings={...env,ACTIVE_BROADCASTS_ENABLED:'true',DB:db};
 assert.equal((await setActiveBroadcastEditorial(settings,{id:'auto-live:yt:missing',activity:'x',detail:''},now)).code,404);
 assert.equal((await setActiveBroadcastEditorial(settings,{id:e.id,activity:'Actividad propia',detail:'Detalle propio'},now)).ok,true);
 const stored=JSON.parse(row.sync_json)[ACTIVE_BROADCASTS_KEY],out=projectActiveBroadcasts(d,stored,now),edited=out.events[0];
 assert.equal(edited.title,'Actividad propia');assert.equal(edited.category,'Actividad propia');assert.equal(edited.extra,'Detalle propio');assert.equal(edited.status,'EN VIVO');assert.equal(out.sync[e.id].youtube.videoTitle,title);assert.equal(out.sync[e.id].twitch.streamId,tw.id);assert.equal(normalizeEditorial(out,now).events.length,0);
 const ctx={window:{}};runInNewContext(readFileSync(new URL('../public/assets/home-departure-state.js',import.meta.url),'utf8'),ctx);
 const h=ctx.window.KGHomeDeparture,selected=h.select(out,now.getTime());assert.equal(h.subtitle(selected.e,selected.sync,selected.status,'es'),'Detalle propio');
 assert.equal(projectActiveBroadcasts(d,{youtube:[],twitch:null,overrides:stored.overrides},now).events.length,0);
 assert.equal((await setActiveBroadcastEditorial(settings,{id:e.id,activity:'',detail:''},now)).ok,true);
 assert.equal(projectActiveBroadcasts(d,JSON.parse(row.sync_json)[ACTIVE_BROADCASTS_KEY],now).events[0].title,'Azur Lane');
});

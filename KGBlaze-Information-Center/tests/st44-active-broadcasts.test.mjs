import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY_AGENDA,normalizeEditorial,publicAgenda,toSyncEnvelope} from '../src/core.mjs';
import {ACTIVE_BROADCASTS_KEY,projectActiveBroadcasts,refreshActiveYouTube,refreshActiveTwitch,syncActiveBroadcasts} from '../src/active-broadcasts.mjs';
const channel='UCRd_uwPjrsf6Z3CRXwNehEQ',id='3jW8vQ3uo4c';
const now=new Date('2026-11-27T06:30:00Z');
const title='La Estudiante de Intercambio en la Academia Veritas | Azur Lane';
const y={id,channelId:channel,title,startedAt:'2026-11-27T05:55:00Z',checkedAt:now.toISOString()};
const tw={id:'12345',userId:'70386764',title:title+' x 2.5 Dimensional Seduction',category:'Azur Lane',startedAt:'2026-11-27T06:00:00Z',checkedAt:now.toISOString()};
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
 assert.equal(e.category,'Azur Lane');assert.equal(out.sync[e.id].youtube.videoId,id);
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

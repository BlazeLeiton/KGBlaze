import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyMusicVideo,syncMusicRadar,musicRadarView,MUSIC_RADAR_KEY,knownMusicIds} from '../src/music-publication-radar.mjs';
import {publicAgenda,EMPTY_AGENDA,normalizeEditorial,toSyncEnvelope} from '../src/core.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';
import worker from '../src/worker.mjs';
const owner='UCRd_uwPjrsf6Z3CRXwNehEQ',since='2026-11-27T20:34:00Z',now=new Date('2026-11-28T01:00:00Z'),id='newCover001';
const template='━━━ 🎵 CRÉDITOS ━━━\n🎵 Canción: Ejemplo\n🎤 Artista original: Artista\n📺 Serie / Obra: Serie\n🔗 Original: https://example.com\n🎙️ Voz: Blaze Leiton\n📝 Letra / adaptación al español: Autor\n🎼 Instrumental: Autor\n🎚️ Mix / Master: Autor\n🎬 Video / MV: Autor\n━━━ 🧡✨ SIGUE EL VIAJE ━━━';
const fixture=(patch={})=>({id,status:{privacyStatus:'public'},snippet:{channelId:owner,title:'Ejemplo | COVER EN ESPAÑOL',description:template,categoryId:'10',publishedAt:'2026-11-27T22:00:00Z',liveBroadcastContent:'none',tags:['cover','VSinger'],...patch}});
const options={since,now,knownIds:new Set()};
test('template positive synthetic control, accented title and music category',()=>{
 const c=classifyMusicVideo(fixture(),options);assert.equal(c.score,100);assert.equal(c.confidence,'high');assert.equal(c.points.template,40);
 assert.ok(classifyMusicVideo(fixture({categoryId:'24'}),options));
 assert.ok(classifyMusicVideo(fixture({title:'Ejemplo | English cover'}),options));
 assert.ok(classifyMusicVideo(fixture({title:'Ejemplo'}),options));
});
test('reject historical, known, foreign, nonpublic, promotional, gaming and live/upcoming; do not reject completed premiere',()=>{
 for(const p of [{publishedAt:'2026-11-16T00:00:00Z'},{channelId:'foreign'},{title:'Teaser | Cover en español'},{categoryId:'20'},{liveBroadcastContent:'live'},{liveBroadcastContent:'upcoming'},{title:'Directo de charla',description:'SIGUE EL VIAJE',tags:[]}]){
  assert.equal(classifyMusicVideo(fixture(p),options),null);
 }
 assert.equal(classifyMusicVideo({...fixture(),status:{privacyStatus:'unlisted'}},options),null);
 assert.equal(classifyMusicVideo(fixture(),{...options,knownIds:new Set([id])}),null);
 assert.ok(classifyMusicVideo({...fixture(),liveStreamingDetails:{actualStartTime:'2026-11-27T22:00:00Z',actualEndTime:'2026-11-27T22:05:00Z'}},options));
 assert.ok(knownMusicIds().has('KY678pt_GK0'));assert.ok(knownMusicIds().has('Z-jGRvrjW-I'));
});
test('hourly scan uses official uploads, no search or catalog writes, private CAS and no repeat slot',async()=>{
 let row={revision:3,sync_json:JSON.stringify({flight:{youtube:{status:'live'}}})},calls=[];
 const DB={prepare(sql){return {first:async()=>({...row}),bind(encoded,rev,old){return {run:async()=>{assert.match(sql,/UPDATE terminal_state SET sync_json/);assert.equal(rev,3);assert.equal(old,row.sync_json);row.sync_json=encoded;return {meta:{changes:1}}}}}}}};
 const env={MUSIC_RADAR_ENABLED:'true',MUSIC_RADAR_SINCE:since,YOUTUBE_CHANNEL_ID:owner,YOUTUBE_API_KEY:'TEST',DB};
 const fetchImpl=async url=>{const u=new URL(url),e=u.pathname.split('/').at(-1);calls.push(e);let items;
  if(e==='channels')items=[{id:owner,contentDetails:{relatedPlaylists:{uploads:'UU'+owner.slice(2)}}}];
  else if(e==='playlistItems')items=[{contentDetails:{videoId:id},snippet:{publishedAt:'2026-11-27T22:00:00Z'}}];
  else if(e==='videos')items=[fixture()];
  else throw Error('unexpected API');
  return {ok:true,json:async()=>({items})};
 };
 assert.equal((await syncMusicRadar(env,{now,fetchImpl})).ok,true);
 assert.deepEqual(calls,['channels','playlistItems','videos']);const stored=JSON.parse(row.sync_json);
 assert.equal(stored.flight.youtube.status,'live');assert.equal(musicRadarView(env,stored).candidates.length,1);
 assert.equal((await syncMusicRadar(env,{now,fetchImpl})).reason,'already_scanned');
 assert.equal(calls.length,3);
 assert.equal((await syncMusicRadar(env,{now,slot:new Date('2026-11-28T01:05:00Z'),fetchImpl})).reason,'disabled_or_not_due');
 assert.equal((await syncMusicRadar(env,{now:new Date('2026-11-28T02:00:00Z'),fetchImpl:async()=>({ok:false})})).ok,false);
 assert.equal(row.sync_json,JSON.stringify(stored));
 const malicious={...EMPTY_AGENDA(),events:[{id:MUSIC_RADAR_KEY,day:'2026-11-28',title:'bad',status:'A TIEMPO'}]};
 assert.equal(publicAgenda(malicious,stored,3,now).events.length,0);
 assert.equal(normalizeEditorial(malicious,now).events.length,0);
 assert.ok(!JSON.stringify(toSyncEnvelope(stored,3)).includes(id));
});
test('private route only and unauthenticated access rejected; page contains no candidate data',async()=>{
 const req=new Request('https://kgblaze.dpdns.org/departures/api/admin/music-radar');
 assert.equal(new URL(routePortalRequest(req).request.url).pathname,'/api/admin/music-radar');
 assert.equal(routePortalRequest(new Request('https://kgblaze.dpdns.org/api/admin/music-radar')).response.status,404);
 assert.equal(routePortalRequest(new Request(req.url,{method:'POST'})).response.status,405);
 const response=await worker.fetch(req,{DB:{},ADMIN_TOKEN:'secret'},{});
 assert.equal(response.status,401);
 const page=await worker.fetch(new Request('https://kgblaze.dpdns.org/departures/dashboard/music-radar/'),{},{});
 assert.equal(page.status,200);assert.match(await page.text(),/Radar musical/);
});

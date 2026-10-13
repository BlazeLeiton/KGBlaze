import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA} from '../src/core.mjs';

const TOKEN='test-long-private-admin-token';
const CHANNEL='UC'+'A'.repeat(22);
const jsonHeaders={'Content-Type':'application/json','Authorization':'Bearer '+TOKEN,'X-Relight-Preview-Only':'ack-read-only'};
function calendar() {
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',hourCycle:'h23'
 }).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return {day:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute};
}
function setup(overrides={}) {
 const a={...EMPTY_AGENDA(),events:[{
  id:'tw:room',origin:'twitch',...calendar(),title:'Azur Lane Octublaze',
  status:'A TIEMPO',platforms:['yt','tw']
 }]};
 const db={
  row:{revision:1,editorial_json:JSON.stringify(a),sync_json:'{}',updated_at:'2026-10-12T21:00:00Z'},
  writes:0,
  prepare(q){
   return {first:async()=>q.includes('FROM terminal_state')?this.row:null,
    bind:()=>({run:async()=>{this.writes++;throw Error('A read-only endpoint tried to write D1');}})};
  }
 };
 const env={DB:db,ADMIN_TOKEN:TOKEN,YOUTUBE_PREVIEW_ENABLED:'true',
  YOUTUBE_CHANNEL_ID:CHANNEL,YOUTUBE_API_KEY:'PRIVATE-TEST-API-KEY',...overrides};
 return {env,db};
}
function call(env,headers=jsonHeaders,method='POST',body=undefined) {
 return worker.fetch(new Request('https://test.workers.dev/api/admin/youtube-preflight',{method,headers,body}),env);
}
function providerFake() {
 const called=[];
 const fn=async url=>{
  const u=new URL(url);called.push(u);
  return {ok:true,json:async()=>u.pathname.endsWith('/search')
   ?{items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}}]}
   :{items:[{id:'Abcdef12345',snippet:{channelId:CHANNEL,title:'Azur Lane Octublaze',liveBroadcastContent:'upcoming'},
     liveStreamingDetails:{scheduledStartTime:new Date().toISOString()}}]}};
 };
 return {fn,called};
}
test('unauthed and wrong-token preflight requests cannot call the provider',async()=>{
 const {env}=setup();
 assert.equal((await call(env,{'X-Relight-Preview-Only':'ack-read-only'})).status,401);
 assert.equal((await call(env,{...jsonHeaders,Authorization:'Bearer incorrect'})).status,401);
});
test('feature flag defaults to off even if admin credentials are valid',async()=>{
 const {env}=setup({YOUTUBE_PREVIEW_ENABLED:undefined});
 const r=await call(env);assert.equal(r.status,503);
 assert.equal((await r.json()).error,'YOUTUBE_PREFLIGHT_DISABLED');
});
test('endpoint requires the explicit acknowledgment header and private provider configuration',async()=>{
 const {env}=setup();
 const noAck=await call(env,{Authorization:'Bearer '+TOKEN});
 assert.equal(noAck.status,400);assert.equal((await noAck.json()).error,'PREVIEW_ACK_REQUIRED');
 const noKey=await call({...env,YOUTUBE_API_KEY:undefined});
 assert.equal(noKey.status,503);assert.equal((await noKey.json()).error,'YOUTUBE_PREFLIGHT_NOT_CONFIGURED');
});
test('private preview does not run on GET, nor expose a public route',async()=>{
 const {env}=setup();
 const r=await call(env,jsonHeaders,'GET');assert.equal(r.status,404);
 const pub=await worker.fetch(new Request('https://test.workers.dev/api/youtube-preflight'),env);
 assert.equal(pub.status,503); // No public API route or configured asset handler.
});
test('authenticated POST returns proposal, never changes D1, revision or public agenda',async()=>{
 const {env,db}=setup(),before=structuredClone(db.row),oldFetch=globalThis.fetch;
 const fake=providerFake();
 try {
  globalThis.fetch=fake.fn;
  const r=await call(env,jsonHeaders,'POST',JSON.stringify({sync:{fake:{youtube:{verified:true}}}}));
  assert.equal(r.status,200,await r.clone().text());
  const out=await r.json();
  assert.equal(out.schema,'relight-youtube-preflight-v1');
  assert.equal(out.revision,1);assert.equal(out.safeToApply,false);
  assert.equal(out.directSyncWrites,0);
  assert.equal(out.items[0].decision,'candidate');assert.equal(out.items[0].evidenceSignal,'upcoming_unverified');
  assert.equal(JSON.stringify(out).includes('PRIVATE-TEST-API-KEY'),false);
  assert.equal(JSON.stringify(out).includes('matchConfirmed'),false);
  assert.deepEqual(db.row,before);assert.equal(db.writes,0);
  assert.equal(fake.called.length,3);
  const publicResponse=await worker.fetch(new Request('https://test.workers.dev/api/public'),env);
  const published=await publicResponse.json();
  assert.equal(published.revision,1);assert.deepEqual(published.sync,{});
 } finally {globalThis.fetch=oldFetch;}
});
test('provider failures return sanitized errors without publishing anything',async()=>{
 const {env,db}=setup(),oldFetch=globalThis.fetch;
 try {
  globalThis.fetch=async()=>({ok:false,status:403,text:async()=> 'PRIVATE-TEST-API-KEY'});
  const r=await call(env);assert.equal(r.status,503);
  const text=await r.text();assert.equal(text.includes('PRIVATE-TEST-API-KEY'),false);
  assert.equal(JSON.parse(text).error,'YOUTUBE_PREFLIGHT_UNAVAILABLE');assert.equal(db.writes,0);
 }finally{globalThis.fetch=oldFetch;}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA} from '../src/core.mjs';

const OWN='UCRd_uwPjrsf6Z3CRXwNehEQ';
const TOKEN='synthetic-audit-admin-token';
const ID='UXoSxjT-r28';
const HEADERS={
 Authorization:'Bearer '+TOKEN,
 'X-Relight-Preview-Only':'ack-read-only'
};
function fixture(overrides={}){
 const db={writes:0,prepare(sql){
  return {first:async()=>({
   revision:2,editorial_json:JSON.stringify(EMPTY_AGENDA()),
   sync_json:'{}',updated_at:'2026-10-13T17:00:00Z'
  }),bind:()=>({run:async()=>{this.writes++;throw Error('UNEXPECTED_D1_WRITE');}})};
 }};
 return {env:{
  DB:db,ADMIN_TOKEN:TOKEN,YOUTUBE_PREVIEW_ENABLED:'true',
  YOUTUBE_CHANNEL_ID:OWN,YOUTUBE_API_KEY:'FAKE-API-KEY',
  YOUTUBE_PREVIEW_LIMITER:{limit:async()=>({success:true})},...overrides
 },db};
}
function metadata(owner=OWN){
 return {
  id:ID,snippet:{
   channelId:owner,
   title:'⏳ ¡ÚLTIMAS HORAS! | Substellar Crepuscule | Azur Lane',
   description:'#OCTUBLAZE - Dia 14 ⚓⏳\n\n¡El tiempo se nos acaba!',
   tags:['Azur Lane','Substellar Crepuscule','BlazeLeiton'],
   publishedAt:'2026-10-13T17:30:00Z',
   liveBroadcastContent:'upcoming'
  },
  liveStreamingDetails:{scheduledStartTime:'2026-10-15T04:00:00Z'}
 };
}
const invoke=(env,id=ID,headers=HEADERS)=>
 worker.fetch(new Request(
  'https://test.workers.dev/api/admin/youtube-video-audit?videoId='+encodeURIComponent(id),
  {method:'GET',headers}),env
 );

test('owned public YouTube metadata is fetched from one videos.list and never written',async()=>{
 const {env,db}=fixture();const previous=globalThis.fetch;
 const urls=[];
 try {
  globalThis.fetch=async raw=>{
   const url=new URL(raw);urls.push(url);
   return {ok:true,json:async()=>({items:[metadata()]})};
  };
  const res=await invoke(env);
  assert.equal(res.status,200,await res.clone().text());
  const data=await res.json();
  assert.equal(data.ok,true);assert.equal(data.readOnly,true);
  assert.equal(data.videoId,ID);
  assert.equal(data.title,metadata().snippet.title);
  assert.equal(data.description,metadata().snippet.description);
  assert.deepEqual(data.tags,metadata().snippet.tags);
  assert.equal(data.scheduledStartTime,'2026-10-15T04:00:00Z');
  assert.equal(JSON.stringify(data).includes('FAKE-API-KEY'),false);
  assert.equal(db.writes,0);
  assert.equal(urls.length,1);
  assert.equal(urls[0].pathname.endsWith('/videos'),true);
  assert.equal(urls[0].searchParams.get('id'),ID);
 } finally {globalThis.fetch=previous;}
});
test('audit is private, disabled unless preview flag is true, and requires explicit read-only acknowledgment',async()=>{
 const {env,db}=fixture();
 const noAuth=await invoke(env,ID,{});
 assert.equal(noAuth.status,401);
 const wrong=await invoke(env,ID,{Authorization:'Bearer bad','X-Relight-Preview-Only':'ack-read-only'});
 assert.equal(wrong.status,401);
 const disabled=await invoke({...env,YOUTUBE_PREVIEW_ENABLED:undefined});
 assert.equal(disabled.status,503);
 assert.equal((await disabled.json()).error,'YOUTUBE_PREFLIGHT_DISABLED');
 const ack=await invoke(env,ID,{Authorization:'Bearer '+TOKEN});
 assert.equal(ack.status,400);
 assert.equal((await ack.json()).error,'PREVIEW_ACK_REQUIRED');
 const bad=await invoke(env,'../credentials');
 assert.equal(bad.status,400);
 assert.equal((await bad.json()).error,'INVALID_VIDEO_ID');
 assert.equal(db.writes,0);
});
test('audit denies foreign channel and unavailable resources, no automatic editor association',async()=>{
 const {env,db}=fixture(),prev=globalThis.fetch;
 try {
  globalThis.fetch=async()=>({ok:true,json:async()=>({items:[metadata('UC'+'z'.repeat(22))]})});
  const foreign=await invoke(env);
  assert.equal(foreign.status,404);
  assert.equal((await foreign.json()).error,'YOUTUBE_VIDEO_NOT_OWNED_OR_UNAVAILABLE');
  globalThis.fetch=async()=>({ok:true,json:async()=>({items:[]})});
  assert.equal((await invoke(env)).status,404);
  assert.equal(db.writes,0);
 } finally {globalThis.fetch=prev;}
});
test('audit fails closed on missing key, channel mismatch, limiter rejection and provider errors',async()=>{
 const {env,db}=fixture(),prev=globalThis.fetch;
 try {
  globalThis.fetch=async()=>{throw Error('unexpected call');};
  assert.equal((await invoke({...env,YOUTUBE_API_KEY:undefined})).status,503);
  assert.equal((await invoke({...env,YOUTUBE_CHANNEL_ID:'UC'+'z'.repeat(22)})).status,503);
  assert.equal((await invoke({...env,YOUTUBE_PREVIEW_LIMITER:undefined})).status,503);
  assert.equal((await invoke({...env,YOUTUBE_PREVIEW_LIMITER:{limit:async()=>({success:false})}})).status,429);
  globalThis.fetch=async()=>({ok:false,status:403,text:async()=> 'FAKE-API-KEY'});
  const failed=await invoke(env);
  assert.equal(failed.status,503);
  assert.equal((await failed.json()).error,'YOUTUBE_VIDEO_AUDIT_UNAVAILABLE');
  assert.equal(db.writes,0);
 } finally {globalThis.fetch=prev;}
});

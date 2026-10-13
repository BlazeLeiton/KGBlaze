import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA} from '../src/core.mjs';

const CHANNEL='UCRd_uwPjrsf6Z3CRXwNehEQ';
const VIDEO='JDkg-5tZ3G0';
const LIMITER={limit:async()=>({success:true})};
const planned=new Date(Date.now()+30*60*1000);
function mexicoFields(at){
 return Object.fromEntries(new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
 }).formatToParts(at).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
}
function setup({flag='true',paused,limiter=LIMITER}={}){
 const when=mexicoFields(planned);
 const agenda={...EMPTY_AGENDA(),events:[{
  id:'tw:killer',origin:'twitch',day:when.year+'-'+when.month+'-'+when.day,
  time:when.hour+':'+when.minute,title:'Killer Chat!: Original Edition',
  category:'Killer Chat!: Original Edition',status:'A TIEMPO',platforms:['yt','tw']
 }]};
 const row={revision:2,editorial_json:JSON.stringify(agenda),sync_json:'{}'};
 const db={row,writes:0,audit:0,prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>this.row};
  if(sql.startsWith('UPDATE'))return {bind:(next,revision,oldSync)=>({
   run:async()=>{
    if(this.row.revision!==revision||this.row.sync_json!==oldSync)return {meta:{changes:0}};
    this.row.sync_json=next;this.writes++;return {meta:{changes:1}};
   }
  })};
  if(sql.startsWith('INSERT'))return {bind:()=>({run:async()=>{this.audit++;}})};
  throw Error('Unexpected DB operation');
 }};
 return {db,env:{
  DB:db,YOUTUBE_SYNC_ENABLED:flag,YOUTUBE_SYNC_PAUSED:paused,
  YOUTUBE_CHANNEL_ID:CHANNEL,YOUTUBE_API_KEY:'TEST-PROVIDER-KEY',
  YOUTUBE_PREVIEW_LIMITER:limiter
 }};
}
function scheduledSlot(){
 const slot=new Date();slot.setUTCMinutes(0,0,0);return slot.getTime();
}
function provider(){
 const called=[];
 const fake=async input=>{
  const url=new URL(input);called.push(url);
  if(url.pathname.endsWith('/search'))
   return {ok:true,json:async()=>({
    items:url.searchParams.get('eventType')==='upcoming'
     ?[{id:{kind:'youtube#video',videoId:VIDEO}}]:[]
   })};
  if(url.pathname.endsWith('/videos'))
   return {ok:true,json:async()=>({items:[{
    id:VIDEO,snippet:{channelId:CHANNEL,title:'Una historia de amor | Killer Chat!',
      liveBroadcastContent:'upcoming'},
    liveStreamingDetails:{scheduledStartTime:planned.toISOString()}
   }]})};
  throw Error('Unknown provider call');
 };
 return {fake,called};
}
test('production scheduler ignores missing opt-in and never reaches provider',async()=>{
 const {db,env}=setup({flag:undefined});const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>{throw Error('Should never query Google');};
  await worker.scheduled({cron:'*/5 * * * *',scheduledTime:scheduledSlot()},env,{});
  assert.equal(db.writes,0);
  assert.equal(db.audit,0);
 }finally{globalThis.fetch=oldFetch;}
});
test('emergency pause and an unexpected Cron expression do nothing',async()=>{
 for(const scenario of [
  {overrides:{paused:'true'},cron:'*/5 * * * *'},
  {overrides:{},cron:'* * * * *'}
 ]){
  const {db,env}=setup(scenario.overrides);
  const oldFetch=globalThis.fetch;
  try{
   globalThis.fetch=async()=>{throw Error('Should never query Google');};
   await worker.scheduled({cron:scenario.cron,scheduledTime:scheduledSlot()},env,{});
   assert.equal(db.writes,0);assert.equal(db.audit,0);
  }finally{globalThis.fetch=oldFetch;}
 }
});
test('connected hourly Cron can verify a real matching room and safely update sync only',async()=>{
 const {db,env}=setup();const initial=structuredClone(db.row);
 const p=provider(),oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=p.fake;
  await worker.scheduled({cron:'*/5 * * * *',scheduledTime:scheduledSlot()},env,{});
  assert.equal(p.called.filter(x=>x.pathname.endsWith('/search')).length,2);
  assert.equal(p.called.filter(x=>x.pathname.endsWith('/videos')).length,1);
  assert.equal(db.writes,1);
  assert.equal(db.audit,1);
  assert.equal(db.row.revision,2);
  assert.equal(db.row.editorial_json,initial.editorial_json);
  const obs=JSON.parse(db.row.sync_json)['tw:killer'].youtube;
  assert.equal(obs.videoId,VIDEO);
  assert.equal(obs.status,'upcoming');
  assert.equal(obs.verified,true);
  assert.equal(obs.matchConfirmed,true);
  assert.equal(obs.source,'youtube_data_api_v3');
  assert.equal('lifeCycleStatus' in obs,false);
 }finally{globalThis.fetch=oldFetch;}
});
test('Cron rejects bad channel or unavailable limiter without provider calls',async()=>{
 for(const changes of [
  {YOUTUBE_CHANNEL_ID:'UC'+'Z'.repeat(22)},
  {YOUTUBE_API_KEY:undefined},
  {YOUTUBE_PREVIEW_LIMITER:undefined}
 ]){
  const {db,env}=setup();Object.assign(env,changes);
  const oldFetch=globalThis.fetch;
  try{
   globalThis.fetch=async()=>{throw Error('Should never query Google');};
   await worker.scheduled({cron:'*/5 * * * *',scheduledTime:scheduledSlot()},env,{});
   assert.equal(db.writes,0);
  }finally{globalThis.fetch=oldFetch;}
 }
});
test('Cloudflare delayed execution still searches in the scheduled hour slot',async()=>{
 const {db,env}=setup();const p=provider(),oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=p.fake;
  const slot=new Date();slot.setUTCMinutes(0,0,0);
  await worker.scheduled({cron:'*/5 * * * *',scheduledTime:slot.getTime()},env,{});
  assert.equal(p.called.filter(x=>x.pathname.endsWith('/search')).length,2);
 }finally{globalThis.fetch=oldFetch;}
});

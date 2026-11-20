import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {readTwitchPrivateRosterSnapshot as read} from '../src/recognition-twitch-roster-snapshot.mjs';
import {getPrivateTwitchCacheMeta,commitPrivateTwitchActiveRoster as commit}
 from '../src/recognition-twitch-active-cache.mjs';

const config={accessToken:'NEVER_LOG_OWNER_ACCESS',clientId:'fixture-client',
 broadcasterId:'70386764'};
const row=(id,name='Subscriber_'+id)=>({
 broadcaster_id:'70386764',user_id:id,user_login:'subscriber_'+id,
 user_name:name,tier:'1000',is_gift:false
});
function provider(pages){
 let calls=0;
 const requests=[];
 const fetchImpl=async(url,init)=>{
  calls++;
  requests.push({url:new URL(url),init});
  const p=pages[calls-1];
  if(p instanceof Error)throw p;
  if(!p)throw Error('Unexpected extra provider call');
  return {ok:p.status===undefined||p.status===200,
   status:p.status||200,json:async()=>p.body};
 };
 return {fetchImpl,requests,get calls(){return calls}};
}
const page=(data,total,cursor)=>({
 body:{data,total,pagination:cursor?{cursor}:{}}
});

test('CP15 a terminal cursor with ALL 2 current subs is complete in one request',async()=>{
 const mock=provider([page([row('111'),row('222')],2,'ALWAYS_RETURNS_CURSOR')]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.equal(out.ok,true);
 assert.equal(out.complete,true);
 assert.equal(out.providerTotal,2);
 assert.equal(out.pages,1);
 assert.deepEqual(out.subscribers,[{userId:'111',displayName:'Subscriber_111'},
  {userId:'222',displayName:'Subscriber_222'}]);
 assert.equal(mock.calls,1);
 assert.equal(mock.requests[0].url.searchParams.get('first'),'100');
 assert.equal(mock.requests[0].init.redirect,'manual');
 assert.equal(mock.requests[0].init.headers.Authorization,'Bearer NEVER_LOG_OWNER_ACCESS');
});
test('CP15 additional pages are required ONLY if total is not fully represented',async()=>{
 const mock=provider([
  page([row('111'),row('222')],3,'cursor-next'),
  page([row('333')],3,'cursor-next') // repeated terminal cursor: safe after all 3 found
 ]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.equal(out.ok,true);
 assert.equal(out.providerTotal,3);
 assert.equal(out.pages,2);
 assert.equal(mock.calls,2);
 assert.equal(mock.requests[1].url.searchParams.get('after'),'cursor-next');
});
test('CP15 repeated cursor before full coverage must not update any cache',async()=>{
 const mock=provider([
  page([row('111')],3,'same'),
  page([],3,'same')
 ]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.equal(out.ok,false);
 assert.equal(out.reason,'cursor_repeated_before_complete');
 assert.equal('subscribers' in out,false);
});
test('CP15 inconsistent/failed/partial provider data is never treated as expired',async()=>{
 for(const [pages,reason] of [
  [[page([row('111')],2)],'incomplete_roster'],
  [[page([row('111')],2,'X'),page([row('222')],3)],'snapshot_changed_during_scan'],
  [[page([row('111',{user_id:'not-an-id'})],1)],'invalid_response_identity'],
  [[{status:429}],'rate_limited'],
  [[{status:401}],'token_unauthorized'],
  [[new Error('ACCESS_SENSITIVE')],'provider_unavailable'],
  [[page([row('111')],501,'X')],'roster_above_safe_cap']
 ]){
  const mock=provider(pages);
  const out=await read({...config,fetchImpl:mock.fetchImpl});
  assert.equal(out.ok,false,reason);
  assert.equal(out.reason,reason);
  assert.equal('subscribers' in out,false);
  assert.equal(JSON.stringify(out).includes('ACCESS_SENSITIVE'),false);
 }
});
test('CP15 zero members is valid only after a complete successful response',async()=>{
 const out=await read({...config,fetchImpl:provider([page([],0,'TERMINAL_CURSOR')]).fetchImpl});
 assert.deepEqual(out,{ok:true,complete:true,providerTotal:0,pages:1,subscribers:[]});
});
test('CP17 essential ID and channel mismatch fail closed without leaking raw identities',async()=>{
 for(const [data,reason] of [
  [[{...row('111'),user_id:'not-numeric'}],'invalid_response_identity'],
  [[{...row('111'),broadcaster_id:'999'}],'invalid_response_identity'],
  [[row('111'),row('111','DifferentName')],'snapshot_changed_during_scan'],
  [[row('111'),row('222')],'invalid_response_total']
 ]){
  const out=await read({...config,fetchImpl:provider([page(data,1,'X')]).fetchImpl});
  assert.equal(out.ok,false);
  assert.equal(out.reason,reason);
  assert.equal(JSON.stringify(out).includes('DifferentName'),false);
 }
});

test('CP17 optional Twitch presentation fields never invalidate active subscriber IDs',async()=>{
 const malformed=[
  {...row('111'),user_login:undefined,user_name:'ValidUnicode_海'},
  {...row('222'),user_login:undefined,user_name:'<unsafe>',tier:undefined,is_gift:null}
 ];
 const mock=provider([page(malformed,2,'terminal-cursor')]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.equal(out.ok,true);
 assert.equal(out.providerTotal,2);
 assert.deepEqual(out.subscribers,[
  {userId:'111',displayName:'ValidUnicode_海'},
  {userId:'222',displayName:'Suscriptor de Twitch'}
 ]);
 assert.equal(mock.calls,1);
 assert.equal(JSON.stringify(out).includes('<unsafe>'),false);
});

test('CP17 optional unsafe alias chooses safe login as private label',async()=>{
 const item={...row('111'),user_name:'<unsafe>',user_login:'valid_login',tier:'unexpected'};
 const result=await read({...config,fetchImpl:provider([page([item],1)]).fetchImpl});
 assert.equal(result.ok,true);
 assert.equal(result.subscribers[0].displayName,'valid_login');
});

function fakeD1(){
 const state={rows:new Map(),meta:null,calls:[],failed:false};
 const DB={
  prepare(sql){
   const query={sql,args:[],bind(...args){this.args=args;return this;},
    async first(){
     if(sql.includes('FROM recognition_twitch_active_status_meta'))
      return state.meta?{
       last_completed_at_ms:state.meta.lastCompletedAtMs,
       active_total:state.meta.activeTotal,
       snapshot_version:state.meta.snapshotVersion
      }:null;
     throw Error('Unexpected SQL in mock');
    }};
   return query;
  },
  async batch(queries){
   state.calls.push(queries.map(q=>({sql:q.sql,args:q.args})));
   if(state.failed)throw Error('Transaction failed before commit');
   const rows=new Map(state.rows);
   let meta=state.meta;
   for(const q of queries){
    if(q.sql.startsWith('DELETE FROM recognition_twitch_active_subscribers'))rows.clear();
    else if(q.sql.startsWith('INSERT INTO recognition_twitch_active_subscribers'))
     rows.set(q.args[0],{id:q.args[0],name:q.args[1],observedAt:q.args[2]});
    else if(q.sql.startsWith('INSERT INTO recognition_twitch_active_status_meta')){
     // SQLite CHECK(last_completed_at_ms > 0) must abort the ENTIRE batch
     // if a stale second Worker commits after a newer snapshot.
     if(meta && q.args[0]<=meta.lastCompletedAtMs)
      throw Error('CHECK constraint failed');
     meta={lastCompletedAtMs:q.args[0],activeTotal:q.args[1],
      snapshotVersion:meta?meta.snapshotVersion+1:1};
    }
    else throw Error('Unapproved D1 statement');
   }
   state.rows=rows;state.meta=meta;
   return queries.map(()=>({success:true}));
  }
 };
 return {DB,state,env:{DB,RECOGNITION_TWITCH_CACHE_ENABLED:'true'}};
}
const snapshot=(arr)=>({ok:true,complete:true,providerTotal:arr.length,
 subscribers:arr.map(([userId,displayName])=>({userId,displayName}))});

test('CP15 cache replaces active IDs atomically and removes ended subscribers',async()=>{
 const {env,state}=fakeD1();
 const first=await commit(env,snapshot([['111','FirstUser'],['222','SecondUser']]),{
  nowMs:1000
 });
 assert.deepEqual(first,{ok:true,activeTotal:2,snapshotVersion:1,lastCompletedAtMs:1000});
 assert.equal(state.rows.size,2);
 const sql=state.calls[0].map(q=>q.sql);
 assert.match(sql[0],/^INSERT INTO recognition_twitch_active_status_meta/);
 assert.match(sql[0],/ELSE -1 END/);
 assert.match(sql[0],/snapshot_version=recognition_twitch_active_status_meta.snapshot_version\+1/);
 assert.match(sql[1],/^DELETE FROM recognition_twitch_active_subscribers/);
 assert.match(sql[2],/^INSERT INTO recognition_twitch_active_subscribers/);
 assert.equal(state.rows.get('111').name,'FirstUser');
 assert.equal(JSON.stringify(first).includes('FirstUser'),false);
 const meta=await getPrivateTwitchCacheMeta(env);
 assert.equal(meta.ok,true);
 assert.equal(meta.activeTotal,2);
 const second=await commit(env,snapshot([['222','SecondUser']]),{
  nowMs:2000
 });
 assert.equal(second.ok,true);
 assert.equal(second.activeTotal,1);
 assert.equal(state.rows.has('111'),false);
 assert.equal(state.rows.has('222'),true);
 assert.equal(state.meta.snapshotVersion,2);
 const zero=await commit(env,snapshot([]),{nowMs:3000});
 assert.equal(zero.ok,true);
 assert.equal(state.rows.size,0);
 assert.equal(state.meta.activeTotal,0);
});
test('CP15 provider errors or disabled flag NEVER delete existing subscriber cache',async()=>{
 const {env,state}=fakeD1();
 await commit(env,snapshot([['111','FirstUser']]),{nowMs:1000});
 const previous=state.rows.size,queries=state.calls.length;
 const denied=await commit({...env,RECOGNITION_TWITCH_CACHE_ENABLED:'false'},
  snapshot([]),{nowMs:2000});
 assert.equal(denied.reason,'cache_feature_disabled');
 const bad=await commit(env,{ok:false,providerTotal:0,subscribers:[]},{nowMs:2000});
 assert.equal(bad.reason,'incomplete_or_invalid_roster');
 const half=await commit(env,{ok:true,complete:false,providerTotal:0,subscribers:[]},{nowMs:2000});
 assert.equal(half.reason,'incomplete_or_invalid_roster');
 assert.equal(state.rows.size,previous);
 assert.equal(state.calls.length,queries);
 state.failed=true;
 assert.equal((await commit(env,snapshot([]),{nowMs:2000})).reason,
  'private_cache_write_unavailable');
 assert.equal(state.rows.size,previous);
});
test('CP15 cache rejects impossible records and nonmonotonic snapshots before writes',async()=>{
 const {env,state}=fakeD1();
 await commit(env,snapshot([['111','FirstUser']]),{nowMs:1000});
 for(const s of [
  snapshot([['not-id','User']]),
  snapshot([['111','<script>']]),
  snapshot([['111','User'],['111','User']])
 ]){
  assert.equal((await commit(env,s,{nowMs:2000})).ok,false);
 }
 assert.equal((await commit(env,snapshot([]),{nowMs:1000})).reason,'snapshot_not_newer');
 assert.equal(state.rows.size,1);
});
test('CP15 staged manual sync route requires admin credentials and explicit sync header',async()=>{
 const origin='https://kgblaze.dpdns.org';
 const path=origin+'/departures/api/admin/recognition/twitch/sync-status-cache';
 const env={ADMIN_TOKEN:'fixture-admin-secret',RECOGNITION_TWITCH_CACHE_ENABLED:'false',
  DB:{prepare(){throw Error('Disabled route must not read D1')}},
  ASSETS:{fetch:async()=>new Response('ok')}};
 const hdr={Authorization:'Bearer fixture-admin-secret'};
 const anonymous=await worker.fetch(new Request(path,{method:'POST'}),env);
 assert.equal(anonymous.status,401);
 assert.equal((await worker.fetch(new Request(path,{method:'GET',headers:hdr}),env)).status,405);
 const noConfirm=await worker.fetch(new Request(path,{method:'POST',headers:hdr}),env);
 assert.equal(noConfirm.status,400);
 const blocked=await worker.fetch(new Request(path,{method:'POST',headers:{
  ...hdr,'X-Relight-Recognition-Confirm':'sync-private-subscriber-cache'
 }}),env);
 assert.equal(blocked.status,503);
 assert.equal((await blocked.json()).reason,'cache_feature_disabled');
 const root=await worker.fetch(new Request(origin+'/api/admin/recognition/twitch/sync-status-cache',{
  method:'POST',headers:hdr
 }),env);
 assert.equal(root.status,405);
});


test('CP15 migration schema links active rows to owner OAuth with delete cascades',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../migrations/recognition_twitch_active_status.sql',import.meta.url),'utf8');
 assert.equal((sql.match(/ON DELETE CASCADE/g)||[]).length,2);
 assert.match(sql,/REFERENCES recognition_twitch_oauth_credentials\(slot\) ON DELETE CASCADE/);
 assert.match(sql,/REFERENCES recognition_twitch_active_status_meta\(slot\) ON DELETE CASCADE/);
 assert.ok(sql.indexOf('CREATE TABLE IF NOT EXISTS recognition_twitch_active_status_meta')<
  sql.indexOf('CREATE TABLE IF NOT EXISTS recognition_twitch_active_subscribers'));
});


test('CP16 competing stale snapshot fails D1 CHECK-CAS and leaves newer identities untouched',async()=>{
 const {env,DB,state}=fakeD1();
 await commit(env,snapshot([['111','OlderUser']]),{nowMs:1000});
 const initialBatch=DB.batch.bind(DB);
 DB.batch=async statements=>{
  // Simulate a different Worker winning AFTER the first pre-read.
  state.rows=new Map([['222',{id:'222',name:'LatestUser',observedAt:3000}]]);
  state.meta={lastCompletedAtMs:3000,activeTotal:1,snapshotVersion:2};
  return initialBatch(statements);
 };
 const result=await commit(env,snapshot([]),{nowMs:2000});
 assert.equal(result.ok,false);
 assert.equal(result.reason,'private_cache_write_unavailable');
 assert.equal(state.rows.get('222').name,'LatestUser');
 assert.equal(state.rows.size,1);
 assert.equal(state.meta.lastCompletedAtMs,3000);
 assert.equal(state.meta.snapshotVersion,2);
});

test('CP16 no sync can move timestamp backwards even if a caller provides stale metadata',async()=>{
 const {env,state}=fakeD1();
 await commit(env,snapshot([['111','FirstUser']]),{nowMs:4000});
 const forgedMeta={ok:true,initialized:true,lastCompletedAtMs:1000,
  activeTotal:0,snapshotVersion:1};
 const result=await commit(env,snapshot([]),{nowMs:3000,previousMeta:forgedMeta});
 assert.equal(result.ok,false);
 assert.equal(result.reason,'private_cache_write_unavailable');
 assert.equal(state.rows.has('111'),true);
 assert.equal(state.meta.lastCompletedAtMs,4000);
});


test('CP16 owner-confirmed migration enables admin-only manual sync, not public/Cron',async()=>{
 const {readFileSync}=await import('node:fs');
 const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
 const vars=wrangler.split(/^\s*\[vars\]\s*$/m)[1]?.split(/^\s*\[/m)[0]||'';
 assert.match(vars,/^\s*RECOGNITION_TWITCH_CACHE_ENABLED\s*=\s*"true"\s*$/m);
 assert.match(vars,/^\s*RECOGNITION_TWITCH_STATUS_ENABLED\s*=\s*"true"\s*$/m);
 assert.doesNotMatch(vars,/^\s*(ADMIN_TOKEN|TWITCH_CLIENT_SECRET|RECOGNITION_TWITCH_TOKEN_KEY_B64)\s*=/m);
 // Only the original Terminal schedules run; CP16 has not attached subscriber Cron.
 assert.match(wrangler,/crons\s*=\s*\["\*\/5 \* \* \* \*", "0 9 \* \* \*"\]/);
});

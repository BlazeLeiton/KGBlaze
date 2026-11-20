import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.mjs';
import {readTwitchPilotPublic,readTwitchPilotPrivate,
 enrollTwitchPilot,clearTwitchPilot,refreshTwitchPilot}
 from '../src/recognition-twitch-two-pilot.mjs';

const ROOT='https://kgblaze.dpdns.org';
const NOW=1795090000000;
const OWNER='70386764';
const KEY=Buffer.alloc(32,0x51);
const migrations=[
 '../migrations/recognition_twitch_oauth.sql',
 '../migrations/recognition_twitch_two_consent_pilot.sql'
].map(p=>readFileSync(new URL(p,import.meta.url),'utf8'));
class D1{
 constructor(){
  this.db=new DatabaseSync(':memory:');
  this.db.exec('PRAGMA foreign_keys=ON');
  for(const migration of migrations)this.db.exec(migration);
 }
 prepare(sql){
  const stmt=this.db.prepare(sql);
  const runWith=args=>({
   async run(){const r=stmt.run(...args);return {meta:{changes:r.changes}};},
   async first(){return stmt.get(...args)||null;},
   async all(){return {results:stmt.all(...args)};}
  });
  return {...runWith([]),bind:(...args)=>runWith(args)};
 }
 async batch(stmts){
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const out=[];
   for(const stmt of stmts)out.push(await stmt.run());
   this.db.exec('COMMIT');return out;
  }catch(err){this.db.exec('ROLLBACK');throw err;}
 }
 close(){this.db.close();}
}
async function cipher(value,kind){
 const key=await crypto.subtle.importKey('raw',KEY,'AES-GCM',false,['encrypt']);
 const iv=Buffer.alloc(12,kind==='access'?0x33:0x44);
 const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv,
  additionalData:new TextEncoder().encode(
   'KGBlaze:recognition:twitch:'+OWNER+':'+kind+':v1')
 },key,new TextEncoder().encode(value));
 return [Buffer.from(bytes).toString('base64'),iv.toString('base64')];
}
async function setup({pilot='true',publicPilot='false'}={}){
 const DB=new D1();
 const access=await cipher('PRIVATE_CREATOR_TOKEN','access');
 const refresh=await cipher('PRIVATE_REFRESH_TOKEN','refresh');
 DB.db.prepare('INSERT INTO recognition_twitch_oauth_credentials '+
  '(slot,owner_id,access_ciphertext,access_nonce,refresh_ciphertext,'+
  'refresh_nonce,expires_at_ms,updated_at_ms) VALUES (1,?,?,?,?,?,?,?)')
  .run(OWNER,...access,...refresh,NOW+86400000,NOW);
 return {DB,env:{
  DB,
  RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
  RECOGNITION_TWITCH_STATUS_ENABLED:'true',
  RECOGNITION_TWITCH_PILOT_ENABLED:pilot,
  RECOGNITION_TWITCH_PILOT_PUBLIC_ENABLED:publicPilot,
  RECOGNITION_TWITCH_TOKEN_KEY_B64:KEY.toString('base64'),
  TWITCH_CLIENT_ID:'fixture-app',TWITCH_CLIENT_SECRET:'fixture-secret',
  TWITCH_RECOGNITION_BROADCASTER_ID:OWNER,
  ADMIN_TOKEN:'private-admin-secret',
  ASSETS:{fetch:async()=>new Response('STATIC')}
 }};
}
function provider({active=[true,true],wrongUsers=false,rateLimited=false}={}){
 const calls=[];
 const fetchImpl=async(url,init)=>{
  const u=new URL(url);calls.push({url:u,init});
  if(rateLimited)return {ok:false,status:429};
  if(u.pathname==='/helix/users')return{
   ok:true,status:200,json:async()=>({data:wrongUsers?[]:[
    {id:'111',login:'pilot_alpha',display_name:'PilotAlpha'},
    {id:'222',login:'pilot_beta',display_name:'PilotBeta'}
   ]})
  };
  if(u.pathname==='/helix/subscriptions'){
   const wanted=u.searchParams.getAll('user_id');
   assert.ok(wanted.every(x=>['111','222'].includes(x)));
   assert.equal(u.searchParams.has('first'),false);
   assert.equal(u.searchParams.has('after'),false);
   return {ok:true,status:200,json:async()=>({data:wanted
    .filter(id=>active[id==='111'?0:1]).map(user_id=>({
     user_id,broadcaster_id:OWNER,user_name:'NOT_PUBLIC_PROVIDER_NAME',
     is_gift:false,tier:'1000'
    }))})};
  }
  throw Error('Unexpected provider URL');
 };
 return {calls,fetchImpl};
}
const logins=['pilot_alpha','pilot_beta'];
async function enrolled(env,opts={}){
 return enrollTwitchPilot(env,{logins,consentConfirmed:true,now:()=>NOW,
  fetchImpl:provider(opts).fetchImpl});
}

test('CP25 fail-closed: no public pilot before both independent flags',async()=>{
 const {env,DB}=await setup({pilot:'false',publicPilot:'false'});
 try{
  assert.deepEqual(await readTwitchPilotPublic(env,{nowMs:NOW}),{
   ok:true,twitch:[]});
  assert.equal((await enrolled(env)).reason,'pilot_disabled');
  const admin=new Request(ROOT+'/departures/api/admin/recognition/twitch/pilot/status');
  assert.equal((await worker.fetch(admin,env)).status,401);
  const path=ROOT+'/departures/api/public/recognition';
  assert.deepEqual(await (await worker.fetch(new Request(path),env)).json(),{
   ok:true,twitch:[]});
  assert.equal((await worker.fetch(
   new Request(ROOT+'/api/public/recognition'),env)).status,404);
 }finally{DB.close();}
});

test('CP25 owner proof checks both logins with Twitch, not broadcaster total',async()=>{
 const {env,DB}=await setup();
 try{
  const p=provider();
  const result=await enrollTwitchPilot(env,{
   logins,consentConfirmed:true,now:()=>NOW,fetchImpl:p.fetchImpl
  });
  assert.deepEqual(result,{ok:true,enrolled:2,publicEnabled:false});
  assert.equal(p.calls.length,2);
  assert.equal(p.calls[0].url.pathname,'/helix/users');
  assert.deepEqual(p.calls[0].url.searchParams.getAll('login'),logins);
  assert.equal(p.calls[0].init.headers.Authorization,
   'Bearer PRIVATE_CREATOR_TOKEN');
  assert.deepEqual(p.calls[1].url.searchParams.getAll('user_id'),['111','222']);
  const rows=DB.db.prepare('SELECT twitch_user_id,login,active '+
   'FROM recognition_twitch_pilot_members ORDER BY twitch_user_id').all();
  assert.deepEqual(rows.map(r=>r.twitch_user_id),['111','222']);
  assert.ok(rows.every(r=>r.active===1));
  assert.deepEqual(await readTwitchPilotPublic(env,{nowMs:NOW+1000}),{
   ok:true,twitch:[]});
  const privateStatus=await readTwitchPilotPrivate(env,{nowMs:NOW+1000});
  assert.equal(privateStatus.ok,true);
  assert.equal(privateStatus.members.length,2);
  assert.equal(JSON.stringify(privateStatus).includes('PRIVATE_CREATOR_TOKEN'),false);
 }finally{DB.close();}
});

test('CP25 public banner shows only two owner-attested, recently active names',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.deepEqual((await readTwitchPilotPublic(env,{nowMs:NOW})).twitch,[]);
  assert.equal((await enrolled(env)).ok,true);
  const a=await readTwitchPilotPublic(env,{nowMs:NOW+1});
  assert.deepEqual(a,{ok:true,twitch:[
   {displayName:'PilotAlpha'},{displayName:'PilotBeta'}]});
  for(const x of ['111','222','PRIVATE_CREATOR_TOKEN','NOT_PUBLIC_PROVIDER_NAME',
   'tier','gifter','userId','login'])
   assert.equal(JSON.stringify(a).includes(x),false);
  assert.deepEqual((await readTwitchPilotPublic(env,{
   nowMs:NOW+30*60*1000+1
  })).twitch,[]);
  const r=await worker.fetch(new Request(
   ROOT+'/departures/api/public/recognition'),env);
  assert.equal(r.status,200);
  assert.equal(r.headers.get('Cache-Control'),'no-store');
  assert.equal((await r.json()).twitch.length,0,
   'Testing default current clock should never invent fresh enrollment');
 }finally{DB.close();}
});

test('CP25 one verified expired subscriber disappears; other remains',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.equal((await enrolled(env)).ok,true);
  const p=provider({active:[true,false]});
  const next=await refreshTwitchPilot(env,{
   force:true,now:()=>NOW+5*60*1000,fetchImpl:p.fetchImpl
  });
  assert.equal(next.ok,true);
  assert.equal(next.checked,2);
  assert.deepEqual((await readTwitchPilotPublic(env,{
   nowMs:NOW+5*60*1000+1000
  })).twitch,[{displayName:'PilotAlpha'}]);
  const row=DB.db.prepare('SELECT active FROM recognition_twitch_pilot_members '+
   "WHERE twitch_user_id='222'").get();
  assert.equal(row.active,0);
 }finally{DB.close();}
});

test('CP25 Twitch 429 does not count as a cancellation; stale public proof expires',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.equal((await enrolled(env)).ok,true);
  const before=DB.db.prepare(
   'SELECT active,last_verified_at_ms FROM recognition_twitch_pilot_members'
  ).all();
  const result=await refreshTwitchPilot(env,{now:()=>NOW+20*60*1000,
   fetchImpl:provider({rateLimited:true}).fetchImpl});
  assert.equal(result.ok,false);
  assert.equal(result.reason,'rate_limited');
  assert.deepEqual(DB.db.prepare(
   'SELECT active,last_verified_at_ms FROM recognition_twitch_pilot_members'
  ).all(),before);
  assert.equal((await readTwitchPilotPublic(env,{
   nowMs:NOW+31*60*1000
  })).twitch.length,0);
  assert.equal(DB.db.prepare(
   'SELECT refresh_lock_until_ms FROM recognition_twitch_pilot_meta'
  ).get().refresh_lock_until_ms,null);
 }finally{DB.close();}
});

test('CP25 rejected identity or missing consent leaves existing approved names intact',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.equal((await enrolled(env)).ok,true);
  const before=JSON.stringify(DB.db.prepare(
   'SELECT * FROM recognition_twitch_pilot_members ORDER BY login').all());
  for(const opts of [
   {logins,consentConfirmed:false,now:()=>NOW+1000,
    fetchImpl:provider().fetchImpl},
   {logins:['pilot_alpha','pilot_alpha'],consentConfirmed:true,
    now:()=>NOW+1000,fetchImpl:provider().fetchImpl},
   {logins,consentConfirmed:true,now:()=>NOW+1000,
    fetchImpl:provider({wrongUsers:true}).fetchImpl},
   {logins,consentConfirmed:true,now:()=>NOW+1000,
    fetchImpl:provider({active:[true,false]}).fetchImpl}
  ]){
   assert.equal((await enrollTwitchPilot(env,opts)).ok,false);
   assert.equal(JSON.stringify(DB.db.prepare(
    'SELECT * FROM recognition_twitch_pilot_members ORDER BY login').all()),
    before);
  }
 }finally{DB.close();}
});

test('CP25 admin-only emergency clear stops public names without contacting Twitch',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.equal((await enrolled(env)).ok,true);
  assert.equal((await clearTwitchPilot(env)).cleared,true);
  assert.deepEqual((await readTwitchPilotPublic(env,{nowMs:NOW+1})).twitch,[]);
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS c FROM recognition_twitch_pilot_members').get().c,0);
 }finally{DB.close();}
});

test('CP25 owner OAuth disconnect cascades both pilot tables',async()=>{
 const {env,DB}=await setup({publicPilot:'true'});
 try{
  assert.equal((await enrolled(env)).ok,true);
  DB.db.prepare('DELETE FROM recognition_twitch_oauth_credentials WHERE slot=1').run();
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS c FROM recognition_twitch_pilot_members').get().c,0);
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS c FROM recognition_twitch_pilot_meta').get().c,0);
  assert.deepEqual((await readTwitchPilotPublic(env,{nowMs:NOW+1})).twitch,[]);
 }finally{DB.close();}
});

test('CP25 canonical admin enroll requires token, explicit header, JSON and two consents',async()=>{
 const {env,DB}=await setup();
 const url=ROOT+'/departures/api/admin/recognition/twitch/pilot/enroll';
 try{
  const base={method:'POST',
   headers:{Authorization:'Bearer private-admin-secret'}};
  assert.equal((await worker.fetch(new Request(url,{method:'POST'}),env)).status,401);
  assert.equal((await worker.fetch(new Request(url,base),env)).status,400);
  assert.equal((await worker.fetch(new Request(url,{...base,headers:{
   ...base.headers,'X-Relight-Recognition-Confirm':
    'enroll-two-consented-twitch-members', 'Content-Type':'application/json'
  },body:JSON.stringify({logins,consentConfirmed:false})}),env)).status,400);
  assert.equal((await worker.fetch(new Request(url,{
   ...base,headers:{...base.headers,Origin:'https://attacker.invalid'}
  }),env)).status,403);
  assert.equal((await worker.fetch(new Request(
   ROOT+'/api/admin/recognition/twitch/pilot/enroll',base),env)).status,405);
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS c FROM recognition_twitch_pilot_members').get().c,0);
 }finally{DB.close();}
});

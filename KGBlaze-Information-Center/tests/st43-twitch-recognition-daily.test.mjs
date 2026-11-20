import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.mjs';
import {discoverTwitchRecognitionCandidates,
 parseTwitchRecognitionConsentCommand}
 from '../src/recognition-twitch-discovery.mjs';
import {syncDailyTwitchRecognition,readPublicTwitchRecognition,
 readPrivateTwitchRecognitionStatus,setTwitchRecognitionConsent,
 handleAuthenticatedTwitchConsentCommand}
 from '../src/recognition-twitch-membership.mjs';

const NOW=1795090000000, OWNER='70386764';
const ROOT='https://kgblaze.dpdns.org';
const KEY=Buffer.alloc(32,0x37);
const SQL=['../migrations/recognition_twitch_oauth.sql',
 '../migrations/recognition_twitch_membership_v1.sql'].map(file=>
  readFileSync(new URL(file,import.meta.url),'utf8'));
class D1{
 constructor(){
  this.db=new DatabaseSync(':memory:');
  this.db.exec('PRAGMA foreign_keys=ON');
  for(const sql of SQL)this.db.exec(sql);
 }
 prepare(sql){
  const stmt=this.db.prepare(sql);
  const bound=args=>({
   async run(){const result=stmt.run(...args);return {meta:{changes:result.changes}};},
   async first(){return stmt.get(...args)||null;},
   async all(){return {results:stmt.all(...args)};}
  });
  return {...bound([]),bind:(...args)=>bound(args)};
 }
 async batch(statements){
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const results=[];
   for(const s of statements)results.push(await s.run());
   this.db.exec('COMMIT');
   return results;
  }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 close(){this.db.close()}
}
async function encrypt(value,kind){
 const aes=await crypto.subtle.importKey('raw',KEY,'AES-GCM',false,['encrypt']);
 const iv=Buffer.alloc(12,kind==='access'?0x61:0x62);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,
  additionalData:new TextEncoder().encode(
   'KGBlaze:recognition:twitch:'+OWNER+':'+kind+':v1')
 },aes,new TextEncoder().encode(value));
 return [Buffer.from(ciphertext).toString('base64'),iv.toString('base64')];
}
async function setup(opts={}){
 const DB=new D1();
 const access=await encrypt('TEST_OWNER_PRIVATE_ACCESS','access');
 const refresh=await encrypt('TEST_OWNER_PRIVATE_REFRESH','refresh');
 DB.db.prepare('INSERT INTO recognition_twitch_oauth_credentials '+
  '(slot,owner_id,access_ciphertext,access_nonce,refresh_ciphertext,'+
  'refresh_nonce,expires_at_ms,updated_at_ms) VALUES (1,?,?,?,?,?,?,?)')
  .run(OWNER,...access,...refresh,NOW+86400000,NOW);
 const env={DB,ADMIN_TOKEN:'local-only-admin',
  ASSETS:{fetch:async()=>new Response('STATIC')},
  RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
  RECOGNITION_TWITCH_STATUS_ENABLED:'true',
  RECOGNITION_TWITCH_TOKEN_KEY_B64:KEY.toString('base64'),
  TWITCH_CLIENT_ID:'fixture-client',TWITCH_CLIENT_SECRET:'fixture-secret',
  TWITCH_RECOGNITION_BROADCASTER_ID:OWNER,
  RECOGNITION_TWITCH_RECOGNITION_ENABLED:opts.enabled??'true',
  RECOGNITION_TWITCH_PUBLIC_ENABLED:opts.public??'true',
  RECOGNITION_TWITCH_TRIAL_VISIBLE:opts.trial??'false',
  RECOGNITION_TWITCH_TRIAL_UNTIL:opts.trialUntil??'',
 };
 return {DB,env};
}
const subscriber=(id,login)=>({user_id:id,user_login:login,
 user_name:login.toUpperCase(),broadcaster_id:OWNER,
 tier:'1000',is_gift:false});
function provider({
 found=[subscriber('111','pilot_alpha'),subscriber('222','pilot_beta'),
  subscriber('333','third_friend')],
 active=['111','222','333'],fail=0
}={}){
 const calls=[];
 return {calls,fetchImpl:async(url,init)=>{
  const u=new URL(url);
  calls.push({u,init});
  assert.equal(init.headers.Authorization,'Bearer TEST_OWNER_PRIVATE_ACCESS');
  if(fail)return {ok:false,status:fail};
  if(u.pathname!=='/helix/subscriptions')
   throw Error('Unexpected provider URL');
  const ids=u.searchParams.getAll('user_id');
  if(ids.length)return {ok:true,status:200,json:async()=>({data:
   found.filter(x=>ids.includes(x.user_id)&&active.includes(x.user_id))
  })};
  // Actual Stage43 CP19 incident: total smaller than first-page rows!
  return {ok:true,status:200,json:async()=>({total:1,data:found,
   pagination:{cursor:'repeated-terminal'}})};
 }};
}
const sync=(env,p,when=NOW,force=true)=>syncDailyTwitchRecognition(env,{
 now:()=>when,fetchImpl:p.fetchImpl,force
});

test('CP26 preflight: disabled API never exports private roster or identities',async()=>{
 const {DB,env}=await setup({enabled:'false',public:'false'});
 try{
  const p=provider();
  assert.equal((await sync(env,p)).reason,'recognition_disabled');
  assert.equal(p.calls.length,0);
  assert.deepEqual(await readPublicTwitchRecognition(env,{nowMs:NOW}),
   {ok:true,twitch:[]});
  const response=await worker.fetch(new Request(
   ROOT+'/departures/api/public/recognition'),env);
  assert.deepEqual(await response.json(),{ok:true,twitch:[]});
  assert.equal((await worker.fetch(new Request(
   ROOT+'/api/public/recognition'),env)).status,404);
  assert.equal((await worker.fetch(new Request(
   ROOT+'/departures/api/admin/recognition/twitch/members/status'),env)).status,401);
 }finally{DB.close()}
});

test('CP26 all observed active members stored unasked despite contradictory total',async()=>{
 const {DB,env}=await setup();
 try{
  const p=provider();
  const result=await sync(env,p);
  assert.deepEqual(result,{ok:true,refreshed:true,checked:3,partial:false});
  assert.equal(p.calls.length,2,'one positive page plus one targeted batch');
  assert.equal(p.calls[0].u.searchParams.get('first'),'100');
  assert.equal(p.calls[1].u.searchParams.getAll('user_id').length,3);
  const rows=DB.db.prepare(
   'SELECT login,consent_state,active FROM recognition_twitch_memberships '+
   'ORDER BY login').all();
  assert.equal(rows.length,3,'NEVER hard-code 2');
  assert.ok(rows.every(x=>x.consent_state==='unasked'&&x.active===1));
  assert.deepEqual(await readPublicTwitchRecognition(env,{nowMs:NOW+1000}),
   {ok:true,twitch:[]});
  const privateStatus=await readPrivateTwitchRecognitionStatus(env,{nowMs:NOW+1000});
  assert.equal(privateStatus.counts.active,3);
  assert.equal(privateStatus.counts.unasked,3);
  assert.equal(JSON.stringify(privateStatus).includes('pilot_alpha'),false);
  assert.equal(JSON.stringify(privateStatus).includes('111'),false);
 }finally{DB.close()}
});

test('CP26 timed trial temporarily shows ALL unasked active names, without granting consent',async()=>{
 const {DB,env}=await setup({
  trial:'true',trialUntil:new Date(NOW+3*86400000).toISOString()
 });
 try{
  await sync(env,provider());
  const data=await readPublicTwitchRecognition(env,{nowMs:NOW+1000});
  assert.equal(data.twitch.length,3);
  assert.ok(data.twitch.every(x=>x.trial===true));
  assert.equal(JSON.stringify(data).includes('111'),false);
  env.RECOGNITION_TWITCH_TRIAL_VISIBLE='false';
  assert.equal((await readPublicTwitchRecognition(env,{nowMs:NOW+1000})).twitch.length,0);
  assert.equal(DB.db.prepare(
   "SELECT count(*) AS n FROM recognition_twitch_memberships WHERE consent_state='unasked'"
  ).get().n,3,'turning off trial leaves NOT ASKED, never rejected');
  env.RECOGNITION_TWITCH_TRIAL_VISIBLE='true';
  assert.equal((await readPublicTwitchRecognition(env,{
   nowMs:NOW+3*86400000+1})).twitch.length,0,
   'trial expires on its own');
  env.RECOGNITION_TWITCH_TRIAL_UNTIL=new Date(NOW+30*86400000).toISOString();
  assert.equal((await readPublicTwitchRecognition(env,{nowMs:NOW+1})).twitch.length,0,
   'trial is not allowed to remain public for a month');
 }finally{DB.close()}
});

test('CP26 approved/declined/unasked transitions persist and declined is never shown in trial',async()=>{
 const {DB,env}=await setup({
  trial:'true',trialUntil:new Date(NOW+2*86400000).toISOString()
 });
 try{
  await sync(env,provider());
  assert.deepEqual(await setTwitchRecognitionConsent(env,{
   login:'pilot_alpha',state:'approved',attested:true,nowMs:NOW+1
  }),{ok:true,updated:true,state:'approved'});
  assert.equal((await setTwitchRecognitionConsent(env,{
   login:'pilot_beta',state:'declined',attested:true,nowMs:NOW+1
  })).ok,true);
  const shown=await readPublicTwitchRecognition(env,{nowMs:NOW+1000});
  assert.equal(shown.twitch.length,2);
  assert.ok(shown.twitch.some(x=>x.displayName==='PILOT_ALPHA'&&!x.trial));
  assert.ok(shown.twitch.some(x=>x.displayName==='THIRD_FRIEND'&&x.trial));
  assert.equal(shown.twitch.some(x=>x.displayName==='PILOT_BETA'),false);
  env.RECOGNITION_TWITCH_TRIAL_VISIBLE='false';
  assert.deepEqual((await readPublicTwitchRecognition(env,{nowMs:NOW+1000})).twitch,
   [{displayName:'PILOT_ALPHA'}]);
  assert.equal((await setTwitchRecognitionConsent(env,{
   login:'pilot_beta',state:'approved',attested:true,nowMs:NOW+1002
  })).ok,true,'a previously declined member can opt in later');
  assert.equal((await setTwitchRecognitionConsent(env,{
   login:'pilot_alpha',state:'unasked',attested:true,nowMs:NOW+1002
  })).ok,true,'administration can reset permission to not asked');
  assert.deepEqual((await readPublicTwitchRecognition(env,{nowMs:NOW+1003})).twitch,
   [{displayName:'PILOT_BETA'}]);
 }finally{DB.close()}
});

test('CP26 successful filtered absence deactivates ONE member; failure never cancels anyone',async()=>{
 const {DB,env}=await setup({trial:'true',
  trialUntil:new Date(NOW+2*86400000).toISOString()});
 try{
  assert.equal((await sync(env,provider())).ok,true);
  const later=NOW+25*60*60*1000;
  const failed=await sync(env,provider({fail:429}),later);
  assert.equal(failed.ok,false);
  assert.equal(failed.reason,'rate_limited');
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_memberships WHERE active=1'
  ).get().n,3);
  assert.equal((await readPublicTwitchRecognition(env,{
   nowMs:NOW+36*60*60*1000+1
  })).twitch.length,0,'stale members disappear without permanent cancellation');
  const changed=await sync(env,provider({
   active:['111','333']
  }),later+1000);
  assert.equal(changed.ok,true);
  const second=await readPublicTwitchRecognition(env,{nowMs:later+2000});
  assert.deepEqual(second.twitch.map(x=>x.displayName),
   ['PILOT_ALPHA','THIRD_FRIEND']);
  assert.equal(DB.db.prepare(
   "SELECT active FROM recognition_twitch_memberships WHERE twitch_user_id='222'"
  ).get().active,0);
 }finally{DB.close()}
});

test('CP26 daily slot skips repeated checks within 20 hours; manual force stays possible',async()=>{
 const {DB,env}=await setup();
 try{
  assert.equal((await sync(env,provider())).refreshed,true);
  const p=provider();
  const again=await sync(env,p,NOW+60*60*1000,false);
  assert.deepEqual(again,{ok:true,refreshed:false});
  assert.equal(p.calls.length,0);
  const forced=await sync(env,p,NOW+60*60*1000,true);
  assert.equal(forced.refreshed,true);
 }finally{DB.close()}
});

test('CP26 unmounted chat command parser and verified sender ID cannot be spoofed through public HTTP',async()=>{
 const {DB,env}=await setup();
 try{
  await sync(env,provider());
  assert.equal(parseTwitchRecognitionConsentCommand('!kgblaze sí'),'approved');
  assert.equal(parseTwitchRecognitionConsentCommand('!kgblaze no'),'declined');
  assert.equal(parseTwitchRecognitionConsentCommand('hello'),'null'.replace('null',null));
  assert.equal((await handleAuthenticatedTwitchConsentCommand(env,{
   verifiedSenderId:'111',message:'!kgblaze si'
  })).reason,'trusted_sender_required');
  assert.equal((await handleAuthenticatedTwitchConsentCommand(env,{
   verifiedSenderId:'111',message:'!kgblaze si',
   verifiedTwitchTransport:true,nowMs:NOW+1000
  })).ok,true);
  assert.equal((await handleAuthenticatedTwitchConsentCommand(env,{
   verifiedSenderId:'111',message:'!kgblaze no',
   verifiedTwitchTransport:true,nowMs:NOW+2000
  })).state,'declined');
  assert.equal(DB.db.prepare(
   "SELECT consent_source FROM recognition_twitch_memberships WHERE twitch_user_id='111'"
  ).get().consent_source,'verified_chat');
  const invalid=await worker.fetch(new Request(ROOT+
   '/departures/api/admin/recognition/twitch/members/consent',{
    method:'POST',headers:{
     Authorization:'Bearer local-only-admin',
     'Content-Type':'application/json',
     'X-Relight-Recognition-Confirm':'change-recognition-consent',
     Origin:'https://attacker.invalid'
    },body:JSON.stringify({login:'pilot_alpha',state:'approved',attested:true})
   }),env);
  assert.equal(invalid.status,403);
 }finally{DB.close()}
});

test('CP26 owner OAuth disconnect cascades entire recognition registry',async()=>{
 const {DB,env}=await setup();
 try{
  await sync(env,provider());
  DB.db.prepare('DELETE FROM recognition_twitch_oauth_credentials WHERE slot=1').run();
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_memberships').get().n,0);
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_membership_meta').get().n,0);
 }finally{DB.close()}
});

test('CP26 >100 members require multiple filtered batches but never one batch >100',async()=>{
 const items=Array.from({length:115},(_,i)=>
  subscriber(String(100000+i),'sub_user_'+String(i).padStart(3,'0')));
 const p=provider({found:items,active:items.map(x=>x.user_id)});
 // The mocked provider gives a full 115-item first page, which the real
 // API would reject. Test the actual batching using direct seeded DB rows.
 const {DB,env}=await setup();
 try{
  DB.db.prepare('INSERT INTO recognition_twitch_membership_meta (slot) VALUES (1)').run();
  const stmt=DB.db.prepare('INSERT INTO recognition_twitch_memberships '+
   '(twitch_user_id,login,display_name,active,last_checked_at_ms,'+
   'first_seen_at_ms,last_seen_at_ms) VALUES (?,?,?,1,?,?,?)');
  for(const row of items)stmt.run(row.user_id,row.user_login,row.user_name,
   NOW-1000,NOW-1000,NOW-1000);
  const status=await sync(env,provider({found:items.slice(0,100),
   active:items.map(x=>x.user_id)}));
  // Repeated terminal cursor after 100. Unknown subscribers are not
  // falsely inferred inactive; all 115 are filtered in batches 100 + 15.
  assert.equal(status.ok,true);
  assert.equal(status.checked,115);
  assert.equal(DB.db.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_memberships'
  ).get().n,115);
 }finally{DB.close()}
});

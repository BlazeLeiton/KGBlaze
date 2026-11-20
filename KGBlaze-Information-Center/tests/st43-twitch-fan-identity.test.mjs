import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';
import {handleTwitchFanRoute,FAN_REDIRECT_URI} from '../src/recognition-twitch-fan.mjs';

const ROOT='https://kgblaze.dpdns.org';
const NOW=1795090000000;
const FRESH_TEST_MS=15*60*1000;
const KEY=Buffer.alloc(32,0x58);
const B64=KEY.toString('base64');
const ownerMigration=readFileSync(
 new URL('../migrations/recognition_twitch_oauth.sql',import.meta.url),'utf8');
const fanMigration=readFileSync(
 new URL('../migrations/recognition_twitch_fan_optins.sql',import.meta.url),'utf8');

class SQLiteD1{
 constructor(){
  this.sqlite=new DatabaseSync(':memory:');
  this.sqlite.exec('PRAGMA foreign_keys=ON;');
  this.sqlite.exec(ownerMigration);
  this.sqlite.exec(fanMigration);
 }
 prepare(sql){
  const stmt=this.sqlite.prepare(sql);
  const withArgs=args=>({
   async run(){const result=stmt.run(...args);
    return {meta:{changes:result.changes}};},
   async first(){return stmt.get(...args)??null;}
  });
  return {...withArgs([]),bind:(...args)=>withArgs(args)};
 }
 close(){this.sqlite.close();}
}
const sha256=async value=>Buffer.from(await crypto.subtle.digest(
 'SHA-256',new TextEncoder().encode(value))).toString('hex');
async function encryptedOwnerToken(token,kind){
 const key=await crypto.subtle.importKey('raw',KEY,'AES-GCM',false,['encrypt']);
 const iv=Buffer.alloc(12,kind==='access'?0x22:0x44);
 const cipher=await crypto.subtle.encrypt({
  name:'AES-GCM',iv,additionalData:new TextEncoder().encode(
   'KGBlaze:recognition:twitch:70386764:'+kind+':v1')
 },key,new TextEncoder().encode(token));
 return [Buffer.from(cipher).toString('base64'),iv.toString('base64')];
}
async function setup({fanEnabled=true,ownerConnected=true}={}){
 const DB=new SQLiteD1();
 if(ownerConnected){
  const [ac,rf]=await Promise.all([
   encryptedOwnerToken('OWNER_PRIVATE_ACCESS','access'),
   encryptedOwnerToken('OWNER_PRIVATE_REFRESH','refresh')
  ]);
  DB.sqlite.prepare(
   'INSERT INTO recognition_twitch_oauth_credentials '+
   '(slot,owner_id,access_ciphertext,access_nonce,refresh_ciphertext,'+
   'refresh_nonce,expires_at_ms,updated_at_ms) VALUES (1,?,?,?,?,?,?,?)'
  ).run('70386764',ac[0],ac[1],rf[0],rf[1],NOW+3600000,NOW);
 }
 return {DB,env:{
  DB,ASSETS:{fetch:async()=>new Response('SAFE_STATIC')},
  RECOGNITION_TWITCH_FAN_ENABLED:fanEnabled?'true':'false',
  RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
  RECOGNITION_TWITCH_STATUS_ENABLED:'true',
  RECOGNITION_TWITCH_TOKEN_KEY_B64:B64,
  TWITCH_CLIENT_ID:'registered-client',TWITCH_CLIENT_SECRET:'private-app-secret',
  TWITCH_RECOGNITION_BROADCASTER_ID:'70386764',
  TWITCH_FAN_REDIRECT_URI:FAN_REDIRECT_URI
 }};
}
function provider({id='111',active=true}={}){
 const calls=[];
 const fetchImpl=async(uri,init)=>{
  const url=new URL(uri);
  calls.push({url,init});
  if(url.pathname==='/oauth2/token')return{
   ok:true,status:200,json:async()=>({access_token:'FAN_PRIVATE_ACCESS',
    refresh_token:'FAN_DISCARDED_REFRESH',scope:['openid'],expires_in:3600})};
  if(url.pathname==='/oauth2/validate')return{
   ok:true,status:200,json:async()=>({user_id:id,
    client_id:'registered-client',scopes:['openid'],expires_in:3600})};
  if(url.pathname==='/helix/subscriptions')return{
   ok:true,status:200,json:async()=>({data:active?[{
    user_id:id,broadcaster_id:'70386764',
    user_name:'PRIVATE_SUBSCRIBER',tier:'1000',is_gift:false
   }]:[]})};
  throw Error('Unexpected outbound URL');
 };
 return {fetchImpl,calls};
}
const req=(path,init={})=>new Request(ROOT+path,init);
const xhdr=(origin=ROOT)=>({'Origin':origin,'Content-Type':'application/json'});
const findCookie=(response,name)=>{
 const values=response.headers.getSetCookie?.()||
  [response.headers.get('Set-Cookie')||''];
 const joined=values.join('; ');
 const match=joined.match(new RegExp(name+'=([a-f0-9]{64})'));
 return match?.[1]??null;
};
const fan=async(path,env,init={},options={})=>
 handleTwitchFanRoute(req(path,init),env,{now:()=>NOW+2000,...options});
async function login(env,{providerMock=provider()}={}){
 const started=await fan('/api/recognition/twitch/start',env,{
  method:'POST',headers:{Origin:ROOT}
 },{now:()=>NOW});
 assert.equal(started.status,303);
 const twitch=new URL(started.headers.get('Location'));
 assert.equal(twitch.origin,'https://id.twitch.tv');
 assert.equal(twitch.searchParams.get('redirect_uri'),FAN_REDIRECT_URI);
 assert.equal(twitch.searchParams.get('scope'),'openid');
 assert.equal(twitch.searchParams.has('channel:read:subscriptions'),false);
 const state=twitch.searchParams.get('state');
 assert.match(state,/^[a-f0-9]{64}$/);
 assert.equal(findCookie(started,'__Host-kgblaze_twitch_member_state'),state);
 const callback=await fan(
  '/twitch/member/callback?state='+state+'&code=abcdEF012345',env,{
   headers:{Cookie:'__Host-kgblaze_twitch_member_state='+state}
  },{fetchImpl:providerMock.fetchImpl});
 assert.equal(callback.status,200);
 const body=await callback.text();
 assert.equal(body.includes('PRIVATE'),false);
 const session=findCookie(callback,'__Host-kgblaze_twitch_member_session');
 assert.match(session,/^[a-f0-9]{64}$/);
 assert.equal(JSON.stringify(providerMock.calls).includes('FAN_PRIVATE_ACCESS'),true);
 return {state,session,providerMock};
}
const myCookie=session=>({Cookie:'__Host-kgblaze_twitch_member_session='+session});
async function myStatus(env,session){
 const r=await fan('/api/recognition/twitch/me',env,{headers:myCookie(session)});
 assert.equal(r.status,200);
 const b=await r.json();
 assert.equal(JSON.stringify(b).includes('111'),false);
 return b;
}
const requestConsent=async(env,session,csrf,verify)=>{
 const r=await fan('/api/recognition/twitch/consent',env,{
  method:'POST',headers:{...xhdr(),'X-Relight-Fan-Csrf':csrf,
   ...myCookie(session)},
  body:JSON.stringify({verify})
 });
 return {status:r.status,body:await r.json()};
};
const verify=async(env,session,csrf,fetchImpl,at=NOW+2000)=>{
 const r=await fan('/api/recognition/twitch/verify',env,{
  method:'POST',headers:{Origin:ROOT,'X-Relight-Fan-Csrf':csrf,...myCookie(session)}
 },{fetchImpl,now:()=>at});
 return {status:r.status,body:await r.json()};
};

test('CP22 disabled in production: root aliases and canonical paths cannot touch D1',async()=>{
 const {env,DB}=await setup({fanEnabled:false});
 try{
  const paths=['/departures/api/recognition/twitch/start',
   '/departures/api/recognition/twitch/me',
   '/departures/api/recognition/twitch/verify',
   '/twitch/member/callback?code=secret&state=00'];
  for(const path of paths){
   const method=path.includes('/start')||path.includes('/verify')?'POST':'GET';
   const r=await worker.fetch(req(path,{method}),env);
   assert.equal(r.status,404,path);
   const content=await r.text();
   assert.equal(content.includes('secret'),false);
  }
  for(const path of ['/api/recognition/twitch/me',
   '/api/recognition/twitch/consent',
   '/api/recognition/twitch/verify']){
   const x=routePortalRequest(req(path));
   assert.equal(x.response.status,404,path);
  }
  assert.equal(DB.sqlite.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_fan_sessions').get().n,0);
  assert.equal(DB.sqlite.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_fan_consents').get().n,0);
 }finally{DB.close();}
});

test('CP22 OAuth state is browser-bound, single-use and stores no visitor token',async()=>{
 const {env,DB}=await setup();
 try{
  const p=provider();
  const {state,session}=await login(env,{providerMock:p});
  const auth=DB.sqlite.prepare(
   'SELECT state_hash,consumed_at_ms FROM recognition_twitch_fan_oauth_states').get();
  assert.equal(auth.state_hash,await sha256(state));
  assert.ok(auth.consumed_at_ms>0);
  assert.notEqual(auth.state_hash,state);
  const rows=DB.sqlite.prepare('SELECT * FROM recognition_twitch_fan_sessions').all();
  assert.equal(rows.length,1);
  assert.equal(rows[0].session_hash.length,64);
  assert.notEqual(rows[0].session_hash,session);
  assert.equal(rows[0].twitch_user_id,'111');
  for(const raw of Object.values(rows[0]))
   assert.equal(String(raw).includes('FAN_PRIVATE_ACCESS'),false);
  const me=await myStatus(env,session);
  assert.equal(me.authenticated,true);
  assert.equal(me.verificationConsent,false);
  assert.equal(me.subscriptionStatus,'not_enabled');
  assert.match(me.csrfToken,/^[a-f0-9]{64}$/);
  const calls=p.calls.length;
  const replay=await fan('/twitch/member/callback?state='+state+
   '&code=abcdEF012345',env,{
   headers:{Cookie:'__Host-kgblaze_twitch_member_state='+state}
  },{fetchImpl:p.fetchImpl});
  assert.equal(replay.status,400);
  assert.equal(p.calls.length,calls);
 }finally{DB.close();}
});

test('CP22 login has no verification consent; CSRF and forged origin are rejected',async()=>{
 const {env,DB}=await setup();
 try{
  const {session,providerMock:p}=await login(env);
  const me=await myStatus(env,session);
  const before=p.calls.length;
  const blocked=await verify(env,session,me.csrfToken,p.fetchImpl);
  assert.equal(blocked.status,403);
  assert.equal(blocked.body.error,'CONSENT_REQUIRED');
  assert.equal(p.calls.length,before);
  const wrong=await fan('/api/recognition/twitch/consent',env,{
   method:'POST',headers:{...xhdr('https://other.example'),
    'X-Relight-Fan-Csrf':me.csrfToken,...myCookie(session)},
   body:'{"verify":true}'
  });
  assert.equal(wrong.status,403);
  const noCsrf=await fan('/api/recognition/twitch/consent',env,{
   method:'POST',headers:{...xhdr(),...myCookie(session)},
   body:'{"verify":true}'
  });
  assert.equal(noCsrf.status,403);
  assert.equal(DB.sqlite.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_fan_consents').get().n,0);
 }finally{DB.close();}
});

test('CP22 explicit opt-in + targeted owner verification gives active status without user ID',async()=>{
 const {env,DB}=await setup();
 try{
  const {session,providerMock:p}=await login(env);
  const me=await myStatus(env,session);
  const granted=await requestConsent(env,session,me.csrfToken,true);
  assert.deepEqual(granted,{status:200,body:{
   ok:true,verificationConsent:true,subscriptionStatus:'unknown'
  }});
  const checked=await verify(env,session,me.csrfToken,p.fetchImpl);
  assert.equal(checked.status,200);
  assert.equal(checked.body.subscriptionStatus,'active');
  assert.equal(checked.body.ok,true);
  assert.equal(JSON.stringify(checked).includes('111'),false);
  assert.equal(JSON.stringify(checked).includes('PRIVATE_SUBSCRIBER'),false);
  const helix=p.calls.filter(c=>c.url.pathname==='/helix/subscriptions');
  assert.equal(helix.length,1);
  assert.deepEqual(helix[0].url.searchParams.getAll('user_id'),['111']);
  assert.equal(helix[0].url.searchParams.has('first'),false);
  assert.equal(helix[0].init.headers.Authorization,'Bearer OWNER_PRIVATE_ACCESS');
  assert.equal((await myStatus(env,session)).subscriptionStatus,'active');
  const consent=DB.sqlite.prepare(
   'SELECT last_status,last_checked_at_ms FROM recognition_twitch_fan_consents').get();
  assert.equal(consent.last_status,'active');
  assert.ok(consent.last_checked_at_ms>NOW);
 }finally{DB.close();}
});

test('CP22 explicit filtered absence means inactive; 429 means unknown without destructive writes',async()=>{
 const {env,DB}=await setup();
 try{
  const {session}=await login(env);
  const me=await myStatus(env,session);
  await requestConsent(env,session,me.csrfToken,true);
  const absent=await verify(env,session,me.csrfToken,provider({active:false}).fetchImpl);
  assert.equal(absent.body.subscriptionStatus,'inactive');
  const old=DB.sqlite.prepare(
   'SELECT last_status,last_checked_at_ms FROM recognition_twitch_fan_consents').get();
  const failed=await verify(env,session,me.csrfToken,async()=>
   ({ok:false,status:429}),NOW+FRESH_TEST_MS+3000);
  assert.equal(failed.status,503);
  assert.equal(failed.body.subscriptionStatus,'unknown');
  const current=DB.sqlite.prepare(
   'SELECT last_status,last_checked_at_ms FROM recognition_twitch_fan_consents').get();
  assert.deepEqual(current,old);
 }finally{DB.close();}
});

test('CP22 parallel verification is serialized and its fresh result is cached',async()=>{
 const {env,DB}=await setup();
 try{
  const {session}=await login(env);
  const me=await myStatus(env,session);
  await requestConsent(env,session,me.csrfToken,true);
  let release;
  let started=false;
  const gate=new Promise(resolve=>{release=resolve;});
  const slow=verify(env,session,me.csrfToken,async()=>{
   started=true;
   await gate;
   return {ok:true,status:200,json:async()=>({data:[{
    broadcaster_id:'70386764',user_id:'111',is_gift:false,tier:'1000'
   }]})};
  });
  for(let i=0;i<100&&!started;i++)
   await new Promise(resolve=>setTimeout(resolve,1));
  assert.equal(started,true);
  const concurrent=await verify(env,session,me.csrfToken,async()=>{
   throw Error('Rate limit bypass');
  });
  assert.equal(concurrent.status,429);
  assert.equal(concurrent.body.error,'VERIFICATION_BUSY_OR_CHANGED');
  release();
  const first=await slow;
  assert.equal(first.status,200);
  assert.equal(first.body.subscriptionStatus,'active');
  const repeated=await verify(env,session,me.csrfToken,async()=>{
   throw Error('Recent cached result must not call Twitch');
  });
  assert.equal(repeated.status,200);
  assert.equal(repeated.body.cached,true);
  assert.equal(repeated.body.subscriptionStatus,'active');
  assert.equal(DB.sqlite.prepare(
   'SELECT check_lock_until_ms FROM recognition_twitch_fan_consents').get()
    .check_lock_until_ms,null);
 }finally{DB.close();}
});

test('CP22 withdrawing consent removes status; late in-flight verification cannot revive it',async()=>{
 const {env,DB}=await setup();
 try{
  const {session}=await login(env);
  const me=await myStatus(env,session);
  await requestConsent(env,session,me.csrfToken,true);
  let unlock;
  let observed=false;
  const pending=new Promise(resolve=>{unlock=resolve});
  const delayed=verify(env,session,me.csrfToken,async(url)=>{
   observed=true;
   await pending;
   return {ok:true,status:200,json:async()=>({data:[{
    user_id:'111',broadcaster_id:'70386764',is_gift:false,tier:'1000'
   }]})};
  });
  for(let i=0;i<100&&!observed;i++)
   await new Promise(resolve=>setTimeout(resolve,1));
  assert.equal(observed,true);
  const revoke=await requestConsent(env,session,me.csrfToken,false);
  assert.equal(revoke.status,200);
  assert.equal(revoke.body.subscriptionStatus,'not_enabled');
  unlock();
  const result=await delayed;
  assert.equal(result.status,409);
  assert.equal(DB.sqlite.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_fan_consents').get().n,0);
  assert.equal((await myStatus(env,session)).subscriptionStatus,'not_enabled');
 }finally{DB.close();}
});

test('CP22 logout invalidates only session; owner disconnect cascades private fan records',async()=>{
 const {env,DB}=await setup();
 try{
  const {session}=await login(env);
  const me=await myStatus(env,session);
  await requestConsent(env,session,me.csrfToken,true);
  const r=await fan('/api/recognition/twitch/logout',env,{
   method:'POST',headers:{Origin:ROOT,'X-Relight-Fan-Csrf':me.csrfToken,
    ...myCookie(session)}
  });
  assert.equal(r.status,200);
  assert.equal((await myStatus(env,session)).authenticated,false);
  assert.equal(DB.sqlite.prepare(
   'SELECT count(*) AS n FROM recognition_twitch_fan_consents').get().n,1);
  DB.sqlite.prepare('DELETE FROM recognition_twitch_oauth_credentials WHERE slot=1').run();
  for(const table of [
   'recognition_twitch_fan_oauth_states','recognition_twitch_fan_sessions',
   'recognition_twitch_fan_consents']){
   assert.equal(DB.sqlite.prepare('SELECT count(*) AS n FROM '+table).get().n,0);
  }
 }finally{DB.close();}
});

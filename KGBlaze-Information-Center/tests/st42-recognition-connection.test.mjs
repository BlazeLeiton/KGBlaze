import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {startTwitchOwnerConnection,finishTwitchOwnerConnection,
 statusTwitchOwnerConnection,refreshStoredTwitchOwnerConnection,
 disconnectStoredTwitchOwnerConnection} from '../src/recognition-twitch-connection.mjs';

const NOW=1795090000000;
const REDIRECT='https://kgblaze.dpdns.org/twitch/oauth/callback';
const startPath='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/start';
const statusPath='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/status';
const KEY=Buffer.alloc(32,0x24).toString('base64');
const random=()=>new Uint8Array(32).fill(0x2a);
const STATE='2a'.repeat(32);

class FakeOAuthD1{
 constructor(){this.state=null;this.tokens=null;this.writes=0;this.consumptions=0;this.batchFail=false;}
 prepare(sql){
  const db=this;
  const make=(args)=>({
   run:async()=>db.run(sql,args),
   first:async()=>db.first(sql,args)
  });
  return {bind:(...args)=>make(args),...make([])};
 }
 async batch(statements){
  if(this.batchFail)throw Error('simulated D1 batch unavailable');
  const before={state:this.state,tokens:this.tokens,writes:this.writes};
  try{return await Promise.all(statements.map(stmt=>stmt.run()));}
  catch(e){Object.assign(this,before);throw e}
 }
 async run(sql,args){
  if(sql.startsWith('DELETE FROM recognition_twitch_oauth_states')){
   const found=!!this.state;this.state=null;this.writes++;
   return {meta:{changes:Number(found)}};
  }
  if(sql.startsWith('DELETE FROM recognition_twitch_oauth_credentials')){
   const found=!!this.tokens;this.tokens=null;this.writes++;
   return {meta:{changes:Number(found)}};
  }
  if(sql.startsWith('INSERT INTO recognition_twitch_oauth_states')){
   this.state={hash:args[0],issued:args[1],expiry:args[2],used:null};
   this.writes++;
   return {meta:{changes:1}};
  }
  if(sql.startsWith('INSERT INTO recognition_twitch_oauth_credentials')){
   const [,,,,,,,stateHash,consumed,checkedAt]=args;
   if(!this.state||this.state.hash!==stateHash||
      this.state.used!==consumed||this.state.expiry<checkedAt)
    return {meta:{changes:0}};
   this.tokens={owner_id:args[0],access_ciphertext:args[1],
    access_nonce:args[2],refresh_ciphertext:args[3],refresh_nonce:args[4],
    expires_at_ms:args[5],updated_at_ms:args[6],
    refresh_lock_until_ms:null};
   this.writes++;
   return {meta:{changes:1}};
  }
  if(sql.startsWith('UPDATE recognition_twitch_oauth_credentials SET access_ciphertext=')){
   const [access,nonce,refresh,refreshNonce,expiry,updated,owner,lock]=args;
   if(!this.tokens||this.tokens.owner_id!==owner||
      this.tokens.refresh_lock_until_ms!==lock)return {meta:{changes:0}};
   Object.assign(this.tokens,{access_ciphertext:access,access_nonce:nonce,
    refresh_ciphertext:refresh,refresh_nonce:refreshNonce,
    expires_at_ms:expiry,updated_at_ms:updated,refresh_lock_until_ms:null});
   this.writes++;
   return {meta:{changes:1}};
  }
  if(sql.startsWith('UPDATE recognition_twitch_oauth_credentials SET refresh_lock_until_ms=NULL')){
   const [owner,lock]=args;
   if(this.tokens?.owner_id!==owner||this.tokens.refresh_lock_until_ms!==lock)
    return {meta:{changes:0}};
   this.tokens.refresh_lock_until_ms=null;
   return {meta:{changes:1}};
  }
  throw Error('Unexpected statement: '+sql);
 }
 async first(sql,args){
  if(sql.startsWith('UPDATE recognition_twitch_oauth_states')){
   const [consumed,hash,now1,now2]=args;
   const r=this.state;
   if(!r||r.hash!==hash||r.used!==null||r.issued>now1||r.expiry<now2)return null;
   r.used=consumed;this.consumptions++;
   return {issued_at_ms:r.issued};
  }
  if(sql.startsWith('UPDATE recognition_twitch_oauth_credentials SET refresh_lock_until_ms=?')){
   const [until,owner,now]=args;
   if(!this.tokens||this.tokens.owner_id!==owner||
    (this.tokens.refresh_lock_until_ms!==null&&this.tokens.refresh_lock_until_ms>=now))
    return null;
   this.tokens.refresh_lock_until_ms=until;
   return {owner_id:owner,refresh_ciphertext:this.tokens.refresh_ciphertext,
    refresh_nonce:this.tokens.refresh_nonce};
  }
  if(sql.startsWith('SELECT owner_id,access_ciphertext,access_nonce FROM recognition_twitch_oauth_credentials')){
   return this.tokens?{owner_id:this.tokens.owner_id,
    access_ciphertext:this.tokens.access_ciphertext,
    access_nonce:this.tokens.access_nonce}:null;
  }
  if(sql.startsWith('SELECT owner_id,expires_at_ms,updated_at_ms FROM recognition_twitch_oauth_credentials')){
   return this.tokens?{owner_id:this.tokens.owner_id,
    expires_at_ms:this.tokens.expires_at_ms,
    updated_at_ms:this.tokens.updated_at_ms}:null;
  }
  throw Error('Unexpected statement: '+sql);
 }
}
const setup=()=>{
 const DB=new FakeOAuthD1();
 const env={DB,ADMIN_TOKEN:'admin-secret-for-tests',
  RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
  RECOGNITION_TWITCH_TOKEN_KEY_B64:KEY,
  TWITCH_CLIENT_ID:'registered-client',
  TWITCH_CLIENT_SECRET:'registered-secret',
  TWITCH_RECOGNITION_BROADCASTER_ID:'123',
  TWITCH_RECOGNITION_REDIRECT_URI:REDIRECT,
  ASSETS:{fetch:async()=>new Response('STATIC')}
 };
 return {DB,env};
};
function provider({owner='123',scope='channel:read:subscriptions'}={}){
 const calls=[];
 const fetchImpl=async (url,init)=>{
  calls.push({url,init});
  if(url==='https://id.twitch.tv/oauth2/token')return {
   ok:true,json:async()=>({access_token:'ACCESS_SENSITIVE',
    refresh_token:'REFRESH_SENSITIVE',expires_in:3600,scope:[scope]})
  };
  if(url==='https://id.twitch.tv/oauth2/validate')return {
   ok:true,json:async()=>({client_id:'registered-client',
    user_id:owner,expires_in:3600,scopes:[scope]})
  };
  throw Error('Unapproved outbound request');
 };
 return {calls,fetchImpl};
}
async function decryptTest(ciphertext,nonce,kind){
 const key=await crypto.subtle.importKey('raw',Buffer.alloc(32,0x24),
  'AES-GCM',false,['decrypt']);
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',
  iv:Buffer.from(nonce,'base64'),
  additionalData:new TextEncoder().encode('KGBlaze:recognition:twitch:123:'+kind+':v1')
 },key,Buffer.from(ciphertext,'base64'));
 return new TextDecoder().decode(bytes);
}

test('OAuth is off by default; no D1 writes or provider requests without flag and encryption key',async()=>{
 const {env,DB}=setup();
 let called=0;
 const fetchImpl=async()=>{called++;throw Error('should not call')};
 const disabled={...env,RECOGNITION_TWITCH_OAUTH_ENABLED:'false'};
 assert.equal((await startTwitchOwnerConnection(disabled,{now:()=>NOW,randomBytes:random})).ok,false);
 assert.equal((await finishTwitchOwnerConnection(disabled,{state:STATE,code:'abcDEF123'},{
  now:()=>NOW,fetchImpl})).ok,false);
 assert.equal((await startTwitchOwnerConnection({...env,RECOGNITION_TWITCH_TOKEN_KEY_B64:''},
  {now:()=>NOW,randomBytes:random})).reason,'missing_encryption_key');
 assert.equal(DB.writes,0);
 assert.equal(called,0);
});
test('A single live hashed state is saved; a new start supersedes the previous state',async()=>{
 const {env,DB}=setup();
 const b=await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 assert.equal(b.ok,true);
 assert.equal(new URL(b.authorizeUrl).searchParams.get('redirect_uri'),REDIRECT);
 assert.equal(new URL(b.authorizeUrl).searchParams.get('state'),STATE);
 assert.equal(DB.state.hash.length,64);
 assert.ok(!DB.state.hash.includes(STATE));
 assert.equal(DB.state.issued,NOW);
 assert.equal(DB.state.expiry,NOW+600000);
 assert.equal(DB.tokens,null);
 const newer=await startTwitchOwnerConnection(env,{now:()=>NOW+100,randomBytes:()=>{
  return new Uint8Array(32).fill(0x3b);
 }});
 assert.equal(newer.ok,true);
 assert.notEqual(DB.state.hash,await (async()=>{
  const original=new TextEncoder().encode(STATE);
  const digest=await crypto.subtle.digest('SHA-256',original);
  return Buffer.from(digest).toString('hex');
 })());
});
test('Callback consumes state atomically; saves ONLY AES-GCM encrypted tokens',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 const p=provider();
 const result=await finishTwitchOwnerConnection(env,{
  state:STATE,code:'abcDEF123'
 },{now:()=>NOW+5000,fetchImpl:p.fetchImpl});
 assert.deepEqual(result,{ok:true});
 assert.equal(DB.consumptions,1);
 assert.equal(p.calls.length,2);
 assert.equal(DB.tokens.owner_id,'123');
 assert.notEqual(DB.tokens.access_ciphertext,'ACCESS_SENSITIVE');
 assert.notEqual(DB.tokens.refresh_ciphertext,'REFRESH_SENSITIVE');
 assert.equal(DB.tokens.access_nonce.length,16);
 assert.equal(await decryptTest(DB.tokens.access_ciphertext,DB.tokens.access_nonce,'access'),'ACCESS_SENSITIVE');
 assert.equal(await decryptTest(DB.tokens.refresh_ciphertext,DB.tokens.refresh_nonce,'refresh'),'REFRESH_SENSITIVE');
 const status=await statusTwitchOwnerConnection(env,{now:()=>NOW+5001});
 assert.equal(status.ok,true);
 assert.equal(status.connected,true);
 assert.equal(status.tokenCurrent,true);
 assert.equal(JSON.stringify(status).includes('ACCESS_SENSITIVE'),false);
 const replay=await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+5002,fetchImpl:p.fetchImpl});
 assert.equal(replay.ok,false);
 assert.equal(p.calls.length,2);
});
test('Denial consumes state, and invalid/expired state cannot reach Twitch',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 const p=provider();
 const denial=await finishTwitchOwnerConnection(env,{
  state:STATE,error:'access_denied'
 },{now:()=>NOW+100,fetchImpl:p.fetchImpl});
 assert.equal(denial.reason,'authorization_not_granted');
 assert.equal(DB.consumptions,1);
 assert.equal(p.calls.length,0);
 const after=await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+200,fetchImpl:p.fetchImpl});
 assert.equal(after.ok,false);
 assert.equal(p.calls.length,0);
 const {env:laterEnv}=setup();
 await startTwitchOwnerConnection(laterEnv,{now:()=>NOW,randomBytes:random});
 const expired=await finishTwitchOwnerConnection(laterEnv,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+601000,fetchImpl:p.fetchImpl});
 assert.equal(expired.ok,false);
 assert.equal(p.calls.length,0);
});
test('Wrong authorized Twitch account or scope never persists credentials',async()=>{
 for(const options of [{owner:'789'},{scope:'user:read:email'}]){
  const {env,DB}=setup();
  await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
  const p=provider(options);
  const res=await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
   {now:()=>NOW+1,fetchImpl:p.fetchImpl});
  assert.equal(res.ok,false);
  assert.equal(DB.tokens,null);
 }
});
test('Existing Worker blocks unauthorized start, other methods, cross-origin and root admin aliases',async()=>{
 const {env,DB}=setup();
 const header={Authorization:'Bearer admin-secret-for-tests'};
 assert.equal((await worker.fetch(new Request(startPath,{method:'POST'}),env)).status,401);
 assert.equal((await worker.fetch(new Request(startPath,{method:'GET',headers:header}),env)).status,405);
 assert.equal((await worker.fetch(new Request('https://kgblaze.dpdns.org/api/admin/recognition/twitch/start',{
  method:'POST',headers:header}),env)).status,405); // root admin write stays blocked
 assert.equal((await worker.fetch(new Request(startPath,{
  method:'POST',headers:{...header,Origin:'null'}}),env)).status,403);
 assert.equal((await worker.fetch(new Request(startPath,{
  method:'POST',headers:{...header,Origin:'https://attacker.invalid'}}),env)).status,403);
 assert.equal((await worker.fetch(new Request(REDIRECT,{method:'POST'}),env)).status,405);
 assert.equal((await worker.fetch(new Request(REDIRECT.replace('kgblaze.dpdns.org','other.example')),env)).status,404);
 assert.equal(DB.writes,0);
});
test('Worker start/callback/status integrate on historical hostname without leaking secrets',async()=>{
 const {env,DB}=setup();
 const headers={Authorization:'Bearer admin-secret-for-tests'};
 const start=await worker.fetch(new Request(startPath,{method:'POST',headers}),env);
 assert.equal(start.status,200,await start.clone().text());
 const body=await start.json();
 assert.equal(body.ok,true);
 const issuedState=new URL(body.authorizeUrl).searchParams.get('state');
 assert.equal(issuedState?.length,64);
 assert.equal(start.headers.get('Cache-Control'),'no-store');
 assert.equal(start.headers.get('Referrer-Policy'),'no-referrer');
 const oldFetch=globalThis.fetch;
 const p=provider();
 try{
  globalThis.fetch=p.fetchImpl;
  const callback=await worker.fetch(new Request(REDIRECT+'?state='+issuedState+'&code=abcDEF123'),env);
  assert.equal(callback.status,200);
  assert.equal(callback.headers.get('Referrer-Policy'),'no-referrer');
  const text=await callback.text();
  assert.ok(!text.includes('ACCESS_SENSITIVE'));
  assert.ok(!text.includes(issuedState));
  assert.equal(DB.tokens?.owner_id,'123');
  const status=await worker.fetch(new Request(statusPath,{headers}),env);
  assert.equal(status.status,200);
  const data=await status.json();
  assert.equal(data.connected,true);
  assert.ok(!JSON.stringify(data).includes('ciphertext'));
  const replay=await worker.fetch(new Request(REDIRECT+'?state='+issuedState+'&code=abcDEF123'),env);
  assert.equal(replay.status,400);
  assert.equal(p.calls.length,2);
 }finally{globalThis.fetch=oldFetch;}
});


test('Private manual refresh decrypts token server-side and atomically rotates ciphertext',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+1000,fetchImpl:provider().fetchImpl});
 const firstCipher=DB.tokens.refresh_ciphertext;
 const p=provider();
 const done=await refreshStoredTwitchOwnerConnection(env,{
  now:()=>NOW+3000,fetchImpl:p.fetchImpl});
 assert.deepEqual(done,{ok:true,tokenCurrent:true});
 assert.equal(DB.tokens.refresh_lock_until_ms,null);
 assert.notEqual(DB.tokens.refresh_ciphertext,firstCipher);
 assert.equal(await decryptTest(DB.tokens.refresh_ciphertext,DB.tokens.refresh_nonce,'refresh'),'REFRESH_SENSITIVE');
 const form=new URLSearchParams(p.calls[0].init.body);
 assert.equal(form.get('grant_type'),'refresh_token');
 assert.equal(form.get('refresh_token'),'REFRESH_SENSITIVE');
 const status=await statusTwitchOwnerConnection(env,{now:()=>NOW+3001});
 assert.equal(status.tokenCurrent,true);
 assert.ok(!JSON.stringify(done).includes('REFRESH_SENSITIVE'));
});
test('Refresh owner mismatch fails closed, releases lock and keeps original encrypted credentials',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+1000,fetchImpl:provider().fetchImpl});
 const old=DB.tokens.refresh_ciphertext;
 const result=await refreshStoredTwitchOwnerConnection(env,{
  now:()=>NOW+5000,fetchImpl:provider({owner:'999'}).fetchImpl});
 assert.equal(result.ok,false);
 assert.equal(DB.tokens.refresh_lock_until_ms,null);
 assert.equal(DB.tokens.refresh_ciphertext,old);
});
test('A live refresh lock prevents simultaneous token rotation',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+1000,fetchImpl:provider().fetchImpl});
 let release;
 const held=new Promise(resolve=>{release=resolve});
 const p=provider();
 let calls=0;
 const slowFetch=async(url,init)=>{
  calls++;
  if(url.endsWith('/oauth2/token'))await held;
  return p.fetchImpl(url,init);
 };
 const first=refreshStoredTwitchOwnerConnection(env,{now:()=>NOW+5000,fetchImpl:slowFetch});
 // Wait for the D1 lock claim to occur before starting second request.
 for(let i=0;i<60&&!DB.tokens.refresh_lock_until_ms;i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.ok(DB.tokens.refresh_lock_until_ms);
 // WebCrypto decrypt may resolve after lock acquisition: wait for the
 // mocked provider call before asserting request counts.
 for(let i=0;i<60&&calls===0;i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(calls,1);
 const second=await refreshStoredTwitchOwnerConnection(env,{
  now:()=>NOW+5001,fetchImpl:slowFetch});
 assert.equal(second.reason,'connection_missing_or_busy');
 assert.equal(calls,1);
 release();
 assert.equal((await first).ok,true);
 assert.equal(DB.tokens.refresh_lock_until_ms,null);
});


test('CP03 disconnect deletes pending state and encrypted credentials, revokes access token only',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 const remote=[];
 const fetchImpl=async(url,init)=>{
  remote.push({url,init});
  return {ok:true,status:200};
 };
 const result=await disconnectStoredTwitchOwnerConnection(env,{fetchImpl});
 assert.deepEqual(result,{ok:true,locallyDisconnected:true,
  providerRevocation:'access_token_revoked'});
 assert.equal(DB.tokens,null);
 assert.equal(DB.state,null);
 assert.equal(remote.length,1);
 assert.equal(remote[0].url,'https://id.twitch.tv/oauth2/revoke');
 assert.equal(remote[0].init.method,'POST');
 const form=new URLSearchParams(remote[0].init.body);
 assert.equal(form.get('token'),'ACCESS_SENSITIVE');
 assert.equal(form.get('client_id'),'registered-client');
 assert.equal(form.get('client_secret'),null);
 const status=await statusTwitchOwnerConnection(env);
 assert.deepEqual(status,{ok:true,connected:false,tokenCurrent:false});
 const second=await disconnectStoredTwitchOwnerConnection(env,{fetchImpl});
 assert.equal(second.providerRevocation,'not_applicable');
 assert.equal(remote.length,1);
});
test('CP03 emergency local deletion works with OAuth flag disabled and no encryption key',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 let called=0;
 const result=await disconnectStoredTwitchOwnerConnection({
  ...env,RECOGNITION_TWITCH_OAUTH_ENABLED:'false',
  RECOGNITION_TWITCH_TOKEN_KEY_B64:''
 },{fetchImpl:async()=>{called++;throw Error('must not call')}});
 assert.equal(result.ok,true);
 assert.equal(result.locallyDisconnected,true);
 assert.equal(result.providerRevocation,'unconfirmed');
 assert.equal(DB.state,null);
 assert.equal(DB.tokens,null);
 assert.equal(called,0);
});
test('CP03 provider failure never restores local tokens or claims remote revocation',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 const result=await disconnectStoredTwitchOwnerConnection(env,{
  fetchImpl:async()=>{throw Error('outage')}});
 assert.equal(result.ok,true);
 assert.equal(result.providerRevocation,'unconfirmed');
 assert.equal(DB.tokens,null);
 assert.equal(DB.state,null);
});
test('CP03 D1 failure never attempts revocation or asserts local deletion',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 DB.batchFail=true;
 let called=0;
 const r=await disconnectStoredTwitchOwnerConnection(env,{
  fetchImpl:async()=>{called++;return {status:200}}});
 assert.equal(r.ok,false);
 assert.equal(r.reason,'private_storage_unavailable');
 assert.equal(DB.tokens?.owner_id,'123');
 assert.ok(DB.state);
 assert.equal(called,0);
});
test('CP03 in-flight OAuth callback can never resurrect credentials after disconnect',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 let released;
 const blocked=new Promise(resolve=>{released=resolve});
 let entered=0;
 const p=provider();
 const delayed=async(url,init)=>{
  if(url.endsWith('/oauth2/token')){
   entered++;
   await blocked;
  }
  return p.fetchImpl(url,init);
 };
 const callback=finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:delayed});
 for(let i=0;i<60&&entered===0;i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(entered,1);
 const disconnect=await disconnectStoredTwitchOwnerConnection(env,{
  fetchImpl:async()=>{throw Error('no credentials to revoke')}});
 assert.equal(disconnect.ok,true);
 assert.equal(DB.tokens,null);
 released();
 const late=await callback;
 assert.equal(late.ok,false);
 assert.equal(DB.tokens,null);
 assert.equal(DB.state,null);
});
test('CP03 disconnect racing with refresh keeps credentials absent',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 let released,entered=0;
 const blocked=new Promise(resolve=>{released=resolve});
 const p=provider();
 const delayed=async(url,init)=>{
  if(url.endsWith('/oauth2/token')){entered++;await blocked;}
  return p.fetchImpl(url,init);
 };
 const refresh=refreshStoredTwitchOwnerConnection(env,{now:()=>NOW+200,fetchImpl:delayed});
 for(let i=0;i<60&&entered===0;i++)
  await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(entered,1);
 const disconnect=await disconnectStoredTwitchOwnerConnection(env,{
  fetchImpl:async()=>({status:200})});
 assert.equal(disconnect.locallyDisconnected,true);
 released();
 assert.equal((await refresh).ok,false);
 assert.equal(DB.tokens,null);
});
test('CP03 Worker blocks unconfirmed, wrong-method and unauthenticated disconnect',async()=>{
 const {env,DB}=setup();
 const u='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/disconnect';
 const h={Authorization:'Bearer admin-secret-for-tests'};
 assert.equal((await worker.fetch(new Request(u,{method:'POST'}),env)).status,401);
 assert.equal((await worker.fetch(new Request(u,{method:'GET',headers:h}),env)).status,405);
 assert.equal((await worker.fetch(new Request(u,{method:'POST',headers:h}),env)).status,400);
 assert.equal((await worker.fetch(new Request(u,{method:'POST',headers:{
  ...h,'X-Relight-Recognition-Confirm':'disconnect-twitch-owner',
  Origin:'https://attacker.invalid'
 }}),env)).status,403);
 assert.equal(DB.writes,0);
});
test('CP03 Worker confirmed disconnect never exposes tokens, refresh or private member data',async()=>{
 const {env,DB}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
  {now:()=>NOW+100,fetchImpl:provider().fetchImpl});
 const u='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/disconnect';
 const headers={Authorization:'Bearer admin-secret-for-tests',
  'X-Relight-Recognition-Confirm':'disconnect-twitch-owner'};
 const originalFetch=globalThis.fetch;
 let remote=0;
 try{
  globalThis.fetch=async()=>{remote++;return {status:200}};
  const res=await worker.fetch(new Request(u,{method:'POST',headers}),env);
  assert.equal(res.status,200);
  const body=await res.text();
  assert.equal(JSON.parse(body).providerRevocation,'access_token_revoked');
  for(const sensitive of ['ACCESS_SENSITIVE','REFRESH_SENSITIVE','ciphertext','123']){
   assert.equal(body.includes(sensitive),false);
  }
  assert.equal(DB.tokens,null);
  assert.equal(DB.state,null);
  assert.equal(remote,1);
 }finally{globalThis.fetch=originalFetch;}
});


test('CP06 OAuth callback shows safe one-time-state diagnostic without reflecting secrets',async()=>{
 const {env}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 const response=await worker.fetch(new Request(
  REDIRECT+'?state='+('44'.repeat(32))+'&code=abcDEF123'),env);
 assert.equal(response.status,400);
 const text=await response.text();
 assert.match(text,/TW-01/);
 assert.ok(!text.includes('abcDEF123'));
 assert.ok(!text.includes('44'.repeat(32)));
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
});

test('CP06 OAuth callback distinguishes denial and owner mismatch without exposing provider identity',async()=>{
 const scenarios=[
  {expected:'TW-02',error:'access_denied'},
  {expected:'TW-07',fetchImpl:provider({owner:'WRONG_PRIVATE_OWNER'}).fetchImpl}
 ];
 for(const scenario of scenarios){
  const {env}=setup();
  await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
  const oldFetch=globalThis.fetch;
  try{
   if(scenario.fetchImpl)globalThis.fetch=scenario.fetchImpl;
   const request=REDIRECT+'?state='+STATE+(scenario.error?'&error='+scenario.error:'&code=abcDEF123');
   const response=await worker.fetch(new Request(request),env);
   assert.equal(response.status,400);
   const body=await response.text();
   assert.match(body,new RegExp(scenario.expected));
   for(const sensitive of ['WRONG_PRIVATE_OWNER','ACCESS_SENSITIVE','REFRESH_SENSITIVE',
       STATE,'abcDEF123'])
    assert.equal(body.includes(sensitive),false);
  }finally{globalThis.fetch=oldFetch;}
 }
});

test('CP06 OAuth callback distinguishes rejected provider token exchange without echoing Twitch response',async()=>{
 const {env}=setup();
 await startTwitchOwnerConnection(env,{now:()=>NOW,randomBytes:random});
 const previous=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:false,status:400,
   json:async()=>({message:'PRIVATE_CLIENT_SECRET_IS_BAD'})});
  const response=await worker.fetch(new Request(REDIRECT+'?state='+STATE+'&code=abcDEF123'),env);
  assert.equal(response.status,400);
  const text=await response.text();
  assert.match(text,/TW-03/);
  assert.equal(text.includes('PRIVATE_CLIENT_SECRET_IS_BAD'),false);
 }finally{globalThis.fetch=previous;}
});

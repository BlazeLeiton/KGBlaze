import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {startTwitchOwnerConnection,finishTwitchOwnerConnection,
 statusTwitchOwnerConnection} from '../src/recognition-twitch-connection.mjs';

const NOW=1795090000000;
const REDIRECT='https://kgblaze.dpdns.org/twitch/oauth/callback';
const startPath='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/start';
const statusPath='https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/status';
const KEY=Buffer.alloc(32,0x24).toString('base64');
const random=()=>new Uint8Array(32).fill(0x2a);
const STATE='2a'.repeat(32);

class FakeOAuthD1{
 constructor(){this.state=null;this.tokens=null;this.writes=0;this.consumptions=0;}
 prepare(sql){
  const db=this;
  const make=(args)=>({
   run:async()=>db.run(sql,args),
   first:async()=>db.first(sql,args)
  });
  return {bind:(...args)=>make(args),...make([])};
 }
 async run(sql,args){
  if(sql.startsWith('INSERT INTO recognition_twitch_oauth_states')){
   this.state={hash:args[0],issued:args[1],expiry:args[2],used:null};
   this.writes++;
   return {meta:{changes:1}};
  }
  if(sql.startsWith('INSERT INTO recognition_twitch_oauth_credentials')){
   this.tokens={owner_id:args[0],access_ciphertext:args[1],
    access_nonce:args[2],refresh_ciphertext:args[3],refresh_nonce:args[4],
    expires_at_ms:args[5],updated_at_ms:args[6]};
   this.writes++;
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
 assert.equal((await worker.fetch(new Request(REDIRECT.replace('kgblaze.dpdns.org','other.example'),env),env)).status,404);
 assert.equal(DB.writes,0);
});
test('Worker start/callback/status integrate on historical hostname without leaking secrets',async()=>{
 const {env,DB}=setup();
 const headers={Authorization:'Bearer admin-secret-for-tests'};
 const start=await worker.fetch(new Request(startPath,{method:'POST',headers}),env);
 assert.equal(start.status,200,await start.clone().text());
 const body=await start.json();
 assert.equal(body.ok,true);
 assert.equal(new URL(body.authorizeUrl).searchParams.get('state')?.length,64);
 assert.equal(start.headers.get('Cache-Control'),'no-store');
 assert.equal(start.headers.get('Referrer-Policy'),'no-referrer');
 const oldFetch=globalThis.fetch;
 const p=provider();
 try{
  globalThis.fetch=p.fetchImpl;
  const callback=await worker.fetch(new Request(REDIRECT+'?state='+STATE+'&code=abcDEF123'),env);
  assert.equal(callback.status,200);
  assert.equal(callback.headers.get('Referrer-Policy'),'no-referrer');
  const text=await callback.text();
  assert.ok(!text.includes('ACCESS_SENSITIVE'));
  assert.ok(!text.includes(STATE));
  assert.equal(DB.tokens?.owner_id,'123');
  const status=await worker.fetch(new Request(statusPath,{headers}),env);
  assert.equal(status.status,200);
  const data=await status.json();
  assert.equal(data.connected,true);
  assert.ok(!JSON.stringify(data).includes('ciphertext'));
  const replay=await worker.fetch(new Request(REDIRECT+'?state='+STATE+'&code=abcDEF123'),env);
  assert.equal(replay.status,400);
  assert.equal(p.calls.length,2);
 }finally{globalThis.fetch=oldFetch;}
});

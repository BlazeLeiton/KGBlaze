/**
 * CP03 D1 SQL integration test: execute the REAL migration on SQLite 3.
 * This is an in-memory analog of D1 prepared statements and atomic batch,
 * not a remote migration or a production Cloudflare D1 connection.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {startTwitchOwnerConnection,finishTwitchOwnerConnection,
 disconnectStoredTwitchOwnerConnection,refreshStoredTwitchOwnerConnection,
 statusTwitchOwnerConnection} from '../src/recognition-twitch-connection.mjs';

const NOW=1795090000000;
const TOKEN_KEY=Buffer.alloc(32,77).toString('base64');
const STATE='ee'.repeat(32);
const MIGRATION=readFileSync(new URL('../migrations/recognition_twitch_oauth.sql',import.meta.url),'utf8');

class SQLiteD1{
 constructor(){
  this.sqlite=new DatabaseSync(':memory:');
  this.sqlite.exec(MIGRATION);
 }
 prepare(sql){
  const stmt=this.sqlite.prepare(sql);
  const statement=(args)=>({
   async run(){const r=stmt.run(...args);return {meta:{changes:r.changes}};},
   async first(){return stmt.get(...args)??null;}
  });
  return {...statement([]),bind:(...args)=>statement(args)};
 }
 async batch(statements){
  this.sqlite.exec('BEGIN IMMEDIATE');
  try{
   const out=[];
   for(const statement of statements)out.push(await statement.run());
   this.sqlite.exec('COMMIT');
   return out;
  }catch(e){
   this.sqlite.exec('ROLLBACK');
   throw e;
  }
 }
 close(){this.sqlite.close()}
}
const setup=()=>{
 const DB=new SQLiteD1();
 return {DB,env:{
  DB,TWITCH_CLIENT_ID:'registered-client',TWITCH_CLIENT_SECRET:'registered-secret',
  TWITCH_RECOGNITION_BROADCASTER_ID:'123',
  RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
  TWITCH_RECOGNITION_REDIRECT_URI:'https://kgblaze.dpdns.org/twitch/oauth/callback',
  RECOGNITION_TWITCH_TOKEN_KEY_B64:TOKEN_KEY
 }};
};
function provider(){
 let calls=0;
 return {get calls(){return calls},fetchImpl:async(url)=>{
  calls++;
  if(url.endsWith('/oauth2/token'))return {ok:true,json:async()=>({
   access_token:'SQLITE_ACCESS_SECRET',refresh_token:'SQLITE_REFRESH_SECRET',
   expires_in:3600,scope:['channel:read:subscriptions']})};
  if(url.endsWith('/oauth2/validate'))return {ok:true,json:async()=>({
   client_id:'registered-client',user_id:'123',expires_in:3600,
   scopes:['channel:read:subscriptions']})};
  throw Error('unexpected request');
 }};
}
test('Actual D1 draft migration accepts encrypted oauth and disconnect leaves zero rows',async()=>{
 const {DB,env}=setup();
 try{
  const began=await startTwitchOwnerConnection(env,{now:()=>NOW,
   randomBytes:()=>new Uint8Array(32).fill(0xee)});
  assert.equal(began.ok,true);
  const pending=DB.sqlite.prepare('SELECT state_hash,consumed_at_ms FROM recognition_twitch_oauth_states').get();
  assert.equal(pending.state_hash.length,64);
  assert.equal(pending.consumed_at_ms,null);
  const external=provider();
  const success=await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
   {now:()=>NOW+1000,fetchImpl:external.fetchImpl});
  assert.deepEqual(success,{ok:true});
  assert.equal(external.calls,2);
  const row=DB.sqlite.prepare('SELECT * FROM recognition_twitch_oauth_credentials').get();
  assert.equal(row.owner_id,'123');
  assert.notEqual(row.access_ciphertext,'SQLITE_ACCESS_SECRET');
  assert.notEqual(row.refresh_ciphertext,'SQLITE_REFRESH_SECRET');
  assert.equal(row.access_nonce.length,16);
  assert.equal((await statusTwitchOwnerConnection(env,{now:()=>NOW+2000})).connected,true);
  const result=await disconnectStoredTwitchOwnerConnection(env,{
   fetchImpl:async()=>({status:200})});
  assert.equal(result.providerRevocation,'access_token_revoked');
  assert.equal(DB.sqlite.prepare('SELECT count(*) as n FROM recognition_twitch_oauth_states').get().n,0);
  assert.equal(DB.sqlite.prepare('SELECT count(*) as n FROM recognition_twitch_oauth_credentials').get().n,0);
  assert.equal((await statusTwitchOwnerConnection(env)).connected,false);
 }finally{DB.close()}
});
test('Actual SQLite rejects late OAuth token insert following atomic disconnect',async()=>{
 const {DB,env}=setup();
 try{
  await startTwitchOwnerConnection(env,{now:()=>NOW,
   randomBytes:()=>new Uint8Array(32).fill(0xee)});
  let release;
  const waiting=new Promise(resolve=>{release=resolve});
  let waitingAtTwitch=false;
  const p=provider();
  const delayed=async(url,init)=>{
   if(url.endsWith('/oauth2/token')){waitingAtTwitch=true;await waiting}
   return p.fetchImpl(url,init)
  };
  const inFlight=finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
   {now:()=>NOW+1000,fetchImpl:delayed});
  for(let i=0;i<80&&!waitingAtTwitch;i++)
   await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(waitingAtTwitch,true);
  const result=await disconnectStoredTwitchOwnerConnection(env);
  assert.equal(result.ok,true);
  release();
  assert.equal((await inFlight).ok,false);
  assert.equal(DB.sqlite.prepare('SELECT count(*) as n FROM recognition_twitch_oauth_credentials').get().n,0);
 }finally{DB.close()}
});
test('SQLite batch rollback leaves both rows when a statement fails',async()=>{
 const {DB,env}=setup();
 try{
  await startTwitchOwnerConnection(env,{now:()=>NOW,
   randomBytes:()=>new Uint8Array(32).fill(0xee)});
  await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
   {now:()=>NOW+1000,fetchImpl:provider().fetchImpl});
  const original=DB.batch.bind(DB);
  DB.batch=statements=>original([...statements,
   DB.prepare('INSERT INTO recognition_twitch_oauth_credentials (slot) VALUES (1)')]);
  const result=await disconnectStoredTwitchOwnerConnection(env);
  assert.equal(result.ok,false);
  assert.equal(DB.sqlite.prepare('SELECT count(*) as n FROM recognition_twitch_oauth_credentials').get().n,1);
  assert.equal(DB.sqlite.prepare('SELECT count(*) as n FROM recognition_twitch_oauth_states').get().n,1);
 }finally{DB.close()}
});
test('Real SQLite refresh lock and encrypted rotation are compatible with migration',async()=>{
 const {DB,env}=setup();
 try{
  await startTwitchOwnerConnection(env,{now:()=>NOW,
   randomBytes:()=>new Uint8Array(32).fill(0xee)});
  await finishTwitchOwnerConnection(env,{state:STATE,code:'abcDEF123'},
   {now:()=>NOW+1000,fetchImpl:provider().fetchImpl});
  const before=DB.sqlite.prepare('SELECT refresh_ciphertext FROM recognition_twitch_oauth_credentials').get();
  const result=await refreshStoredTwitchOwnerConnection(env,{
   now:()=>NOW+2000,fetchImpl:provider().fetchImpl});
  assert.equal(result.ok,true);
  const after=DB.sqlite.prepare('SELECT refresh_ciphertext,refresh_lock_until_ms FROM recognition_twitch_oauth_credentials').get();
  assert.notEqual(after.refresh_ciphertext,before.refresh_ciphertext);
  assert.equal(after.refresh_lock_until_ms,null);
 }finally{DB.close()}
});

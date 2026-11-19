/**
 * Project Relight Stage 42 CP02 — Twitch broadcaster OAuth controller.
 * PRIVATE ONLY. No subscription enumeration, viewer registration or public
 * recognition. Inert until an independent feature flag + encryption secret
 * + reviewed D1 migration are configured.
 *
 * The historical redirect is /twitch/oauth/callback at kgblaze.dpdns.org.
 * A privileged start request writes only a SHA-256 state digest to D1.
 * A public callback atomically consumes that digest BEFORE token exchange.
 * Tokens are AES-256-GCM encrypted for D1; never returned in HTTP responses.
 */
import {beginTwitchOwnerOAuth,completeTwitchOwnerOAuth,
 hashTwitchOwnerOAuthState,refreshTwitchOwnerOAuth} from './recognition-twitch-oauth.mjs';

const fail=reason=>({ok:false,reason});
const ENC_SECRET='RECOGNITION_TWITCH_TOKEN_KEY_B64';
const encoder=new TextEncoder();
const STATE_MAX_AGE_MS=10*60*1000;
const BASE64_32=/^[A-Za-z0-9+/]{43}=$/;

async function encryptionKey(env){
 const b64=env?.[ENC_SECRET];
 if(typeof b64!=='string'||!BASE64_32.test(b64))return null;
 try{
  const raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  if(raw.length!==32)return null;
  return await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
 }catch{return null;}
}
const toB64=data=>btoa(String.fromCharCode(...new Uint8Array(data)));
async function encryptToken(key,token,ownerId,kind){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const aad=encoder.encode('KGBlaze:recognition:twitch:'+ownerId+':'+kind+':v1');
 const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},
  key,encoder.encode(token));
 return {ciphertext:toB64(data),nonce:toB64(iv)};
}
async function decryptToken(key,ciphertext,nonce,ownerId,kind){
 if(typeof ciphertext!=='string'||typeof nonce!=='string'||nonce.length!==16)
  throw Error('corrupt encrypted token');
 const iv=Uint8Array.from(atob(nonce),c=>c.charCodeAt(0));
 const bytes=Uint8Array.from(atob(ciphertext),c=>c.charCodeAt(0));
 if(iv.length!==12||bytes.length<17||bytes.length>8192)
  throw Error('invalid encrypted token');
 const aad=encoder.encode('KGBlaze:recognition:twitch:'+ownerId+':'+kind+':v1');
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},key,bytes);
 const token=new TextDecoder().decode(plain);
 if(!token||token.length>4096)throw Error('invalid token');
 return token;
}
function ready(env){
 return !!env?.DB&&env.RECOGNITION_TWITCH_OAUTH_ENABLED==='true'&&
  typeof env.TWITCH_CLIENT_ID==='string'&&!!env.TWITCH_CLIENT_ID&&
  typeof env.TWITCH_CLIENT_SECRET==='string'&&!!env.TWITCH_CLIENT_SECRET;
}

/** Called exclusively from bearer-protected POST /departures/api/admin/recognition/twitch/start */
export async function startTwitchOwnerConnection(env,{now=Date.now,randomBytes}={}){
 if(!ready(env))return fail('disabled_or_not_configured');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const initiated=await beginTwitchOwnerOAuth(env,{now,randomBytes});
 if(!initiated.ok)return fail(initiated.reason);
 try{
  // ONE outstanding request per owner. A new start invalidates any prior one.
  const write=await env.DB.prepare(
   'INSERT INTO recognition_twitch_oauth_states '+
   '(slot,state_hash,issued_at_ms,expires_at_ms,consumed_at_ms) '+
   'VALUES (1,?,?,?,NULL) ON CONFLICT(slot) DO UPDATE SET '+
   'state_hash=excluded.state_hash,issued_at_ms=excluded.issued_at_ms,'+
   'expires_at_ms=excluded.expires_at_ms,consumed_at_ms=NULL'
  ).bind(initiated.stateHash,initiated.issuedAt,initiated.expiresAt).run();
  if(write?.meta?.changes!==1)return fail('state_not_saved');
  // The raw state appears only in the private authorize URL returned to admin.
  return {ok:true,authorizeUrl:initiated.authorizeUrl,
   expiresAt:new Date(initiated.expiresAt).toISOString()};
 }catch{return fail('private_storage_unavailable');}
}

/** Called only for GET /twitch/oauth/callback on the historical portal host. */
export async function finishTwitchOwnerConnection(env,
 {state,code,error:providerError},{now=Date.now,fetchImpl=fetch}={}){
 if(!ready(env))return fail('disabled_or_not_configured');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const stateHash=await hashTwitchOwnerOAuthState(state);
 if(!stateHash)return fail('invalid_or_expired_state');
 const current=now();
 if(!Number.isSafeInteger(current)||current<0)return fail('invalid_time');
 try{
  // SQLite UPDATE RETURNING is atomic: two callbacks cannot redeem one state.
  const row=await env.DB.prepare(
   'UPDATE recognition_twitch_oauth_states SET consumed_at_ms=? '+
   'WHERE slot=1 AND state_hash=? AND consumed_at_ms IS NULL '+
   'AND issued_at_ms<=? AND expires_at_ms>=? RETURNING issued_at_ms'
  ).bind(current,stateHash,current,current).first();
  if(!row||!Number.isFinite(row.issued_at_ms)||
     current-row.issued_at_ms>STATE_MAX_AGE_MS)
   return fail('invalid_or_expired_state');
  // Denial also consumes state. Never redeem another code using it.
  if(providerError)return fail('authorization_not_granted');
  const completed=await completeTwitchOwnerOAuth(env,{
   state,code,expectedStateHash:stateHash,issuedAt:row.issued_at_ms
  },{now:()=>current,fetchImpl});
  if(!completed.ok)return fail('provider_or_owner_validation_failed');
  const owner=completed.broadcasterId;
  const credentials=completed.credentials;
  const [access,refresh]=await Promise.all([
   encryptToken(key,credentials.accessToken,owner,'access'),
   encryptToken(key,credentials.refreshToken,owner,'refresh')
  ]);
  const expiresAt=current+credentials.expiresIn*1000;
  if(!Number.isSafeInteger(expiresAt)||expiresAt<=current)
   return fail('invalid_provider_expiry');
  const write=await env.DB.prepare(
   'INSERT INTO recognition_twitch_oauth_credentials '+
   '(slot,owner_id,access_ciphertext,access_nonce,refresh_ciphertext,'+
   'refresh_nonce,expires_at_ms,updated_at_ms) VALUES (1,?,?,?,?,?,?,?) '+
   'ON CONFLICT(slot) DO UPDATE SET owner_id=excluded.owner_id,'+
   'access_ciphertext=excluded.access_ciphertext,access_nonce=excluded.access_nonce,'+
   'refresh_ciphertext=excluded.refresh_ciphertext,refresh_nonce=excluded.refresh_nonce,'+
   'expires_at_ms=excluded.expires_at_ms,updated_at_ms=excluded.updated_at_ms,'+
   'refresh_lock_until_ms=NULL'
  ).bind(owner,access.ciphertext,access.nonce,refresh.ciphertext,
   refresh.nonce,expiresAt,current).run();
  if(write?.meta?.changes!==1)return fail('private_storage_unavailable');
  return {ok:true};
 }catch{return fail('authorization_unavailable');}
}

/** Private admin-only metadata. NEVER project this into /api/public. */
export async function statusTwitchOwnerConnection(env,{now=Date.now}={}){
 if(!ready(env))return fail('disabled_or_not_configured');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 try{
  const row=await env.DB.prepare(
   'SELECT owner_id,expires_at_ms,updated_at_ms '+
   'FROM recognition_twitch_oauth_credentials WHERE slot=1'
  ).first();
  if(!row)return {ok:true,connected:false,tokenCurrent:false};
  if(row.owner_id!==env.TWITCH_RECOGNITION_BROADCASTER_ID)
   return fail('owner_mismatch');
  const current=now();
  if(!Number.isSafeInteger(current))return fail('invalid_time');
  return {ok:true,connected:true,tokenCurrent:
   Number.isFinite(row.expires_at_ms)&&row.expires_at_ms>current+60_000,
   updatedAt:new Date(row.updated_at_ms).toISOString()};
 }catch{return fail('private_storage_unavailable');}
}

/**
 * Admin-only, explicit refresh. No scheduled or public subscription requests.
 * D1 CAS lock prevents simultaneous refresh token rotation. Failed provider
 * calls release the lock; unexpected failures expire the lock after 2 minutes.
 */
export async function refreshStoredTwitchOwnerConnection(env,{
 now=Date.now,fetchImpl=fetch}={}){
 if(!ready(env))return fail('disabled_or_not_configured');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const current=now(),owner=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(!Number.isSafeInteger(current)||current<0||
    typeof owner!=='string'||!/^[0-9]{1,24}$/.test(owner))return fail('not_configured');
 const lockUntil=current+120_000;
 if(!Number.isSafeInteger(lockUntil))return fail('invalid_time');
 let claimed=false;
 try{
  const row=await env.DB.prepare(
   'UPDATE recognition_twitch_oauth_credentials SET refresh_lock_until_ms=? '+
   'WHERE slot=1 AND owner_id=? AND '+
   '(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms<?) '+
   'RETURNING owner_id,refresh_ciphertext,refresh_nonce'
  ).bind(lockUntil,owner,current).first();
  if(!row)return fail('connection_missing_or_busy');
  claimed=true;
  const previous=await decryptToken(key,row.refresh_ciphertext,row.refresh_nonce,owner,'refresh');
  const result=await refreshTwitchOwnerOAuth(env,previous,{fetchImpl});
  if(!result.ok)return fail('provider_or_owner_validation_failed');
  const creds=result.credentials;
  const [access,refresh]=await Promise.all([
   encryptToken(key,creds.accessToken,owner,'access'),
   encryptToken(key,creds.refreshToken,owner,'refresh')
  ]);
  const expires=current+creds.expiresIn*1000;
  if(!Number.isSafeInteger(expires)||expires<=current)return fail('invalid_provider_expiry');
  const written=await env.DB.prepare(
   'UPDATE recognition_twitch_oauth_credentials SET '+
   'access_ciphertext=?,access_nonce=?,refresh_ciphertext=?,refresh_nonce=?,'+
   'expires_at_ms=?,updated_at_ms=?,refresh_lock_until_ms=NULL '+
   'WHERE slot=1 AND owner_id=? AND refresh_lock_until_ms=?'
  ).bind(access.ciphertext,access.nonce,refresh.ciphertext,refresh.nonce,
   expires,current,owner,lockUntil).run();
  if(written?.meta?.changes!==1)return fail('private_storage_unavailable');
  claimed=false;
  return {ok:true,tokenCurrent:true};
 }catch{return fail('authorization_unavailable');}
 finally{
  if(claimed){
   try{
    await env.DB.prepare(
     'UPDATE recognition_twitch_oauth_credentials SET refresh_lock_until_ms=NULL '+
     'WHERE slot=1 AND owner_id=? AND refresh_lock_until_ms=?'
    ).bind(owner,lockUntil).run();
   }catch{/* Time-bounded lock fails closed until expiry. */}
  }
 }
}

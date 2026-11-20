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
import {readTwitchActiveSubscriptionStatus} from './recognition-twitch-active-status.mjs';
import {readTwitchPrivateRosterSnapshot} from './recognition-twitch-roster-snapshot.mjs';
import {getPrivateTwitchCacheMeta,commitPrivateTwitchActiveRoster} from './recognition-twitch-active-cache.mjs';

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
  if(!completed.ok)return fail(completed.reason);
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
   // A concurrent disconnect removes the state. This conditional INSERT
   // prevents an in-flight callback from recreating credentials afterward.
   'INSERT INTO recognition_twitch_oauth_credentials '+
   '(slot,owner_id,access_ciphertext,access_nonce,refresh_ciphertext,'+
   'refresh_nonce,expires_at_ms,updated_at_ms) '+
   'SELECT 1,?,?,?,?,?,?,? FROM recognition_twitch_oauth_states '+
   'WHERE slot=1 AND state_hash=? AND consumed_at_ms=? '+
   'AND expires_at_ms>=? '+
   'ON CONFLICT(slot) DO UPDATE SET owner_id=excluded.owner_id,'+
   'access_ciphertext=excluded.access_ciphertext,access_nonce=excluded.access_nonce,'+
   'refresh_ciphertext=excluded.refresh_ciphertext,refresh_nonce=excluded.refresh_nonce,'+
   'expires_at_ms=excluded.expires_at_ms,updated_at_ms=excluded.updated_at_ms,'+
   'refresh_lock_until_ms=NULL'
  ).bind(owner,access.ciphertext,access.nonce,refresh.ciphertext,
   refresh.nonce,expiresAt,current,stateHash,current,current).run();
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


/**
 * CP03: emergency local disconnect works even with OAuth feature OFF.
 * Must only be called from an authenticated, explicitly confirmed admin POST.
 *
 * D1 batch is a single atomic transaction. Invalidate pending callback state
 * FIRST, then delete the encrypted tokens. The callback's INSERT is gated
 * on that state still existing, so a delayed Twitch response cannot reconnect.
 *
 * Remote revocation is best-effort and explicitly NOT equivalent to local
 * deletion. Twitch documents /oauth2/revoke for ACCESS tokens; we never claim
 * that it definitively revokes every related refresh grant.
 */
export async function disconnectStoredTwitchOwnerConnection(env,{
 fetchImpl=fetch}={}){
 if(!env?.DB||typeof env.DB.batch!=='function')return fail('private_storage_unavailable');
 let token=null,hadCredentials=false;
 const key=await encryptionKey(env); // Optional: local deletion MUST work without it.
 try{
  const row=await env.DB.prepare(
   'SELECT owner_id,access_ciphertext,access_nonce '+
   'FROM recognition_twitch_oauth_credentials WHERE slot=1'
  ).first();
  if(row){
   hadCredentials=true;
   if(key&&row.owner_id===env.TWITCH_RECOGNITION_BROADCASTER_ID){
    try{token=await decryptToken(key,row.access_ciphertext,row.access_nonce,
     row.owner_id,'access');}
    catch{/* Keep ability to delete corrupted/undecryptable credentials. */}
   }
  }
 }catch{return fail('private_storage_unavailable');}

 try{
  // Atomic: invalidate outstanding state and remove the credentials together.
  await env.DB.batch([
   env.DB.prepare('DELETE FROM recognition_twitch_oauth_states WHERE slot=1'),
   env.DB.prepare('DELETE FROM recognition_twitch_oauth_credentials WHERE slot=1')
  ]);
 }catch{return fail('private_storage_unavailable');}

 // Never send credentials to Twitch if local storage deletion failed.
 // No raw tokens or remote error bodies are returned or logged.
 if(!hadCredentials)return {ok:true,locallyDisconnected:true,
  providerRevocation:'not_applicable'};
 if(!token||typeof env.TWITCH_CLIENT_ID!=='string'||!env.TWITCH_CLIENT_ID)
  return {ok:true,locallyDisconnected:true,providerRevocation:'unconfirmed'};
 try{
  const response=await fetchImpl('https://id.twitch.tv/oauth2/revoke',{
   method:'POST',redirect:'manual',
   headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({
    client_id:env.TWITCH_CLIENT_ID,token
   }).toString()
  });
  return {ok:true,locallyDisconnected:true,
   providerRevocation:response?.status===200?'access_token_revoked':'unconfirmed'};
 }catch{
  return {ok:true,locallyDisconnected:true,providerRevocation:'unconfirmed'};
 }
}


/**
 * CP13: PRIVATE admin-only access to active subscription status using only
 * existing encrypted owner OAuth. No D1 writes other than encrypted token
 * rotation on provider 401/known expiration. Does NOT persist any subscriber.
 *
 * CALLER MUST authenticate ADMIN_TOKEN, same-origin if Origin is supplied,
 * and explicit X-Relight-Recognition-Confirm header before this is invoked.
 */
export async function readStoredTwitchSubscriptionStatus(env,{
 mode='summary',userIds,fetchImpl=fetch,now=Date.now
}={}){
 if(!ready(env)||env.RECOGNITION_TWITCH_STATUS_ENABLED!=='true')
  return fail('status_feature_disabled');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const owner=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(typeof owner!=='string'||!/^[0-9]{1,24}$/.test(owner))
  return fail('not_configured');
 const current=now();
 if(!Number.isSafeInteger(current)||current<0)return fail('invalid_time');
 // This limited admin-only endpoint does not return any full subscriber roster.
 if(mode!=='summary'&&mode!=='targeted')return fail('invalid_mode');
 if(mode==='summary'&&userIds!==undefined)return fail('invalid_user_ids');

 const readRow=async()=>env.DB.prepare(
  'SELECT owner_id,access_ciphertext,access_nonce,expires_at_ms '+
  'FROM recognition_twitch_oauth_credentials WHERE slot=1'
 ).first();

 try{
  let row=await readRow();
  if(!row)return fail('connection_missing');
  if(row.owner_id!==owner)return fail('owner_mismatch');
  // Refresh only as needed: known expiry or HTTP 401 from Twitch.
  // In a concurrent refresh, the existing D1 CAS lock safely rejects one caller.
  if(!Number.isFinite(row.expires_at_ms)||row.expires_at_ms<=current+60_000){
   const refresh=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
   if(!refresh.ok)return fail('token_refresh_unavailable');
   row=await readRow();
   if(!row||row.owner_id!==owner)return fail('connection_missing');
  }
  for(let attempt=0;attempt<2;attempt++){
   const access=await decryptToken(key,row.access_ciphertext,row.access_nonce,owner,'access');
   const result=await readTwitchActiveSubscriptionStatus({
    accessToken:access,clientId:env.TWITCH_CLIENT_ID,broadcasterId:owner,
    mode,userIds,fetchImpl
   });
   // Never leak tokens, PII or raw Twitch response on any failure.
   if(result.reason==='token_unauthorized'&&attempt===0){
    const refresh=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
    if(!refresh.ok)return fail('token_refresh_unavailable');
    row=await readRow();
    if(!row||row.owner_id!==owner)return fail('connection_missing');
    continue;
   }
   if(!result.ok)return fail(result.reason);
   return {ok:true,readOnly:true,source:'twitch_helix',
    checkedAt:new Date(current).toISOString(),...result};
  }
  return fail('token_unauthorized');
 }catch{return fail('status_unavailable');}
}


/**
 * Stage43 CP25 — owner-only resolution of two already-consenting Twitch
 * accounts. The caller must be a private ADMIN_TOKEN-protected endpoint.
 * Never project this returned private identity map directly to a public API.
 *
 * Twitch /helix/users?login returns canonical names+IDs; the broadcaster
 * subscriptions endpoint validates EACH ID as currently active independently
 * of the inconsistent global "total". No viewer login/token is involved.
 */
export async function resolveStoredTwitchPilotMembers(env,{
 logins,now=Date.now,fetchImpl=fetch
}={}){
 if(!ready(env)||env.RECOGNITION_TWITCH_STATUS_ENABLED!=='true')
  return fail('status_feature_disabled');
 if(!Array.isArray(logins)||logins.length!==2||
    logins.some(v=>typeof v!=='string'||!/^[a-zA-Z0-9_]{2,25}$/.test(v))||
    new Set(logins.map(v=>v.toLowerCase())).size!==2)
  return fail('invalid_pilot_logins');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const current=now(),owner=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(!Number.isSafeInteger(current)||current<1||
    typeof owner!=='string'||!/^[0-9]{1,24}$/.test(owner))
  return fail('not_configured');
 const expected=logins.map(v=>v.toLowerCase());
 const readRow=()=>env.DB.prepare(
  'SELECT owner_id,access_ciphertext,access_nonce,expires_at_ms '+
  'FROM recognition_twitch_oauth_credentials WHERE slot=1'
 ).first();
 try{
  let row=await readRow();
  if(!row||row.owner_id!==owner)return fail('connection_missing');
  if(!Number.isFinite(row.expires_at_ms)||row.expires_at_ms<=current+60000){
   const refresh=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
   if(!refresh.ok)return fail('token_refresh_unavailable');
   row=await readRow();
   if(!row||row.owner_id!==owner)return fail('connection_missing');
  }
  for(let attempt=0;attempt<2;attempt++){
   const token=await decryptToken(key,row.access_ciphertext,row.access_nonce,owner,'access');
   const usersUrl=new URL('https://api.twitch.tv/helix/users');
   for(const login of expected)usersUrl.searchParams.append('login',login);
   let response,body;
   try{
    response=await fetchImpl(usersUrl.toString(),{
     method:'GET',redirect:'manual',headers:{
      Authorization:'Bearer '+token,'Client-Id':env.TWITCH_CLIENT_ID,
      Accept:'application/json'
     }
    });
    if(response?.status!==401&&response?.ok)body=await response.json();
   }catch{return fail('provider_unavailable');}
   if(response?.status===401&&attempt===0){
    const refreshed=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
    if(!refreshed.ok)return fail('token_refresh_unavailable');
    row=await readRow();
    if(!row||row.owner_id!==owner)return fail('connection_missing');
    continue;
   }
   if(response?.status===429)return fail('rate_limited');
   if(!response?.ok)return fail('provider_unavailable');
   if(!body||!Array.isArray(body.data)||body.data.length!==2)
    return fail('pilot_user_not_found');
   const found=new Map();
   const badName=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
   for(const v of body.data){
    if(!v||typeof v.id!=='string'||!/^[0-9]{1,24}$/.test(v.id)||
       typeof v.login!=='string'||!expected.includes(v.login.toLowerCase())||
       found.has(v.login.toLowerCase()))return fail('invalid_identity_response');
    const label=typeof v.display_name==='string'&&
      v.display_name.trim().length>0&&v.display_name.trim().length<=48&&
      !badName.test(v.display_name)?v.display_name.trim():v.login;
    if(label.length>48||badName.test(label))
     return fail('invalid_identity_response');
    found.set(v.login.toLowerCase(),{userId:v.id,login:v.login.toLowerCase(),
     displayName:label});
   }
   if(found.size!==2||new Set([...found.values()].map(v=>v.userId)).size!==2)
    return fail('invalid_identity_response');
   const members=expected.map(login=>found.get(login));
   const check=await readTwitchActiveSubscriptionStatus({
    accessToken:token,clientId:env.TWITCH_CLIENT_ID,
    broadcasterId:owner,mode:'targeted',
    userIds:members.map(v=>v.userId),fetchImpl
   });
   if(check.reason==='token_unauthorized'&&attempt===0){
    const refreshed=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
    if(!refreshed.ok)return fail('token_refresh_unavailable');
    row=await readRow();
    if(!row||row.owner_id!==owner)return fail('connection_missing');
    continue;
   }
   if(!check.ok)return fail(check.reason);
   if(check.checks.length!==2||check.checks.some(v=>v.active!==true))
    return fail('pilot_not_all_subscribed');
   return {ok:true,members};
  }
  return fail('token_unauthorized');
 }catch{return fail('pilot_lookup_unavailable')}
}

/**
 * CP15: INACTIVE private on-demand active roster sync. Requires D1 migration,
 * independent feature flag and a confirmed owner admin request.
 * Does not return subscriber names/IDs, and never wipes cache when Twitch
 * cannot supply a COMPLETE snapshot.
 *
 * Scheduled Cron is NOT attached here. 30-minute gate controls manual retries
 * until a reviewed CAS sync lock is implemented for distributed scheduling.
 */
export async function syncStoredTwitchActiveSubscribers(env,{
 now=Date.now,fetchImpl=fetch
}={}){
 if(!ready(env)||env.RECOGNITION_TWITCH_CACHE_ENABLED!=='true')
  return fail('cache_feature_disabled');
 const key=await encryptionKey(env);
 if(!key)return fail('missing_encryption_key');
 const current=now();
 const owner=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(!Number.isSafeInteger(current)||current<1||
    typeof owner!=='string'||!/^[0-9]{1,24}$/.test(owner))
  return fail('not_configured');
 const meta=await getPrivateTwitchCacheMeta(env);
 if(!meta.ok)return fail(meta.reason);
 if(meta.initialized&&current-meta.lastCompletedAtMs<30*60*1000){
  if(current<=meta.lastCompletedAtMs)return fail('invalid_time');
  return {ok:true,refreshed:false,activeTotal:meta.activeTotal,
   lastCompletedAt:new Date(meta.lastCompletedAtMs).toISOString()};
 }
 const readRow=async()=>env.DB.prepare(
  'SELECT owner_id,access_ciphertext,access_nonce,expires_at_ms '+
  'FROM recognition_twitch_oauth_credentials WHERE slot=1'
 ).first();
 try{
  let row=await readRow();
  if(!row)return fail('connection_missing');
  if(row.owner_id!==owner)return fail('owner_mismatch');
  if(!Number.isFinite(row.expires_at_ms)||row.expires_at_ms<=current+60_000){
   const refreshed=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
   if(!refreshed.ok)return fail('token_refresh_unavailable');
   row=await readRow();
   if(!row||row.owner_id!==owner)return fail('connection_missing');
  }
  for(let attempt=0;attempt<2;attempt++){
   const access=await decryptToken(key,row.access_ciphertext,row.access_nonce,owner,'access');
   const snapshot=await readTwitchPrivateRosterSnapshot({
    accessToken:access,clientId:env.TWITCH_CLIENT_ID,
    broadcasterId:owner,fetchImpl
   });
   if(snapshot.reason==='token_unauthorized'&&attempt===0){
    const refreshed=await refreshStoredTwitchOwnerConnection(env,{now,fetchImpl});
    if(!refreshed.ok)return fail('token_refresh_unavailable');
    row=await readRow();
    if(!row||row.owner_id!==owner)return fail('connection_missing');
    continue;
   }
   if(!snapshot.ok){
    if(snapshot.reason==='provider_total_below_observed'){
     // Static private-only diagnostic: no identity or provider count escapes.
     return {ok:false,reason:snapshot.reason,
      phase:snapshot.phase,totalRecheck:snapshot.totalRecheck,
      ...(snapshot.targetedCheck?{targetedCheck:snapshot.targetedCheck}:{})};
    }
    return fail(snapshot.reason);
   }
   const saved=await commitPrivateTwitchActiveRoster(env,snapshot,{
    nowMs:current,previousMeta:meta
   });
   if(!saved.ok)return fail(saved.reason);
   return {ok:true,refreshed:true,activeTotal:saved.activeTotal,
    snapshotVersion:saved.snapshotVersion,
    lastCompletedAt:new Date(current).toISOString()};
  }
  return fail('token_unauthorized');
 }catch{return fail('private_sync_unavailable');}
}

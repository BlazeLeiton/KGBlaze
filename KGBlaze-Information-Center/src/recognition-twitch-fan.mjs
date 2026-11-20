/**
 * Project Relight · Stage 43 CP22 — VOLUNTARY Twitch member verification.
 *
 * Unlike owner OAuth, this browser OAuth only proves which Twitch account a
 * visitor controls. It NEVER acquires channel:read:subscriptions, never stores
 * visitor OAuth tokens, and never displays subscriber names publicly.
 *
 * Route activation requires explicit owner review of separate callback,
 * migration, consent copy and RECOGNITION_TWITCH_FAN_ENABLED=true.
 * Without that flag every route returns 404 before touching D1/providers.
 */
import {readStoredTwitchSubscriptionStatus} from './recognition-twitch-connection.mjs';

export const FAN_CALLBACK_PATH='/twitch/member/callback';
export const FAN_REDIRECT_URI='https://kgblaze.dpdns.org'+FAN_CALLBACK_PATH;
export const FAN_ROUTES=new Set([
 '/api/recognition/twitch/start','/api/recognition/twitch/me',
 '/api/recognition/twitch/consent','/api/recognition/twitch/verify',
 '/api/recognition/twitch/logout',FAN_CALLBACK_PATH
]);
const START='/api/recognition/twitch/start';
const ME='/api/recognition/twitch/me';
const CONSENT='/api/recognition/twitch/consent';
const VERIFY='/api/recognition/twitch/verify';
const LOGOUT='/api/recognition/twitch/logout';
const STATE_COOKIE='__Host-kgblaze_twitch_member_state';
const SESSION_COOKIE='__Host-kgblaze_twitch_member_session';
const HEX=/^[a-f0-9]{64}$/;
const ID=/^[0-9]{1,24}$/;
const CODE=/^[A-Za-z0-9._~-]{6,512}$/;
const STATE_MS=10*60*1000;
const SESSION_MS=24*60*60*1000;
const FRESH_MS=15*60*1000;
const BASE_HEADERS={
 'Cache-Control':'no-store, no-cache, must-revalidate',
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
 'X-Robots-Tag':'noindex, nofollow, noarchive',
 'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
 'X-Frame-Options':'DENY'
};
const safeJson=(body,status=200,extra={})=>new Response(JSON.stringify(body),{
 status,headers:{...BASE_HEADERS,'Content-Type':'application/json; charset=utf-8',...extra}
});
const denied=(status,reason)=>safeJson({ok:false,error:reason},status);
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const randomHex=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const digest=async value=>hex(new Uint8Array(await crypto.subtle.digest(
 'SHA-256',new TextEncoder().encode(value))));
function equal(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let result=0;
 for(let i=0;i<a.length;i++)result|=a.charCodeAt(i)^b.charCodeAt(i);
 return result===0;
}
function cookie(req,name){
 const matches=(req.headers.get('Cookie')||'').split(';')
  .map(x=>x.trim()).filter(x=>x.startsWith(name+'='));
 if(matches.length!==1)return null;
 const value=matches[0].slice(name.length+1);
 return HEX.test(value)?value:null;
}
const setCookie=(name,value,age)=>name+'='+value+
 '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+age;
const clearCookie=name=>setCookie(name,'',0);
const validTime=ms=>Number.isSafeInteger(ms)&&ms>0;
const cfg=env=>env?.RECOGNITION_TWITCH_FAN_ENABLED==='true'&&
 !!env.DB?.prepare&&typeof env.TWITCH_CLIENT_ID==='string'&&
 env.TWITCH_CLIENT_ID.length>0&&typeof env.TWITCH_CLIENT_SECRET==='string'&&
 env.TWITCH_CLIENT_SECRET.length>0&&
 env.TWITCH_FAN_REDIRECT_URI===FAN_REDIRECT_URI;
const originOK=req=>req.headers.get('Origin')==='https://kgblaze.dpdns.org'&&
 !['cross-site','none'].includes(req.headers.get('Sec-Fetch-Site'));
const methodFor={ [START]:'POST',[ME]:'GET',[CONSENT]:'POST',
 [VERIFY]:'POST',[LOGOUT]:'POST',[FAN_CALLBACK_PATH]:'GET'};

async function session(req,env,nowMs){
 const token=cookie(req,SESSION_COOKIE);
 if(!token)return null;
 const hash=await digest('fan-session-v1:'+token);
 const row=await env.DB.prepare(
  'SELECT twitch_user_id,csrf_salt,expires_at_ms FROM recognition_twitch_fan_sessions '+
  'WHERE session_hash=?'
 ).bind(hash).first();
 if(!row||!ID.test(row.twitch_user_id)||!HEX.test(row.csrf_salt)||
    !validTime(row.expires_at_ms)||nowMs>=row.expires_at_ms)return null;
 return {id:row.twitch_user_id,hash,
  csrf:await digest('fan-csrf-v1:'+token+':'+row.csrf_salt)};
}
async function consentRow(env,id){
 return env.DB.prepare(
  'SELECT consent_nonce,consented_at_ms,last_status,last_checked_at_ms '+
  'FROM recognition_twitch_fan_consents WHERE twitch_user_id=?'
 ).bind(id).first();
}
function publicState(row,nowMs){
 if(!row)return {verificationConsent:false,subscriptionStatus:'not_enabled'};
 const timestamp=row.last_checked_at_ms;
 if(!['active','inactive','unknown'].includes(row.last_status))
  return {verificationConsent:true,subscriptionStatus:'unknown'};
 if(!validTime(timestamp))
  return {verificationConsent:true,subscriptionStatus:'unknown'};
 return {verificationConsent:true,
  subscriptionStatus:nowMs-timestamp<=FRESH_MS&&nowMs>=timestamp?
   row.last_status:'stale',
  lastCheckedAt:new Date(timestamp).toISOString()};
}
async function handleStart(env,nowMs){
 // Prune expired login challenges and sessions only on voluntary sign-in;
 // no Cron and no unrelated subscriber data touched.
 await env.DB.prepare(
  'DELETE FROM recognition_twitch_fan_oauth_states WHERE expires_at_ms<?'
 ).bind(nowMs).run();
 await env.DB.prepare(
  'DELETE FROM recognition_twitch_fan_sessions WHERE expires_at_ms<?'
 ).bind(nowMs).run();
 const state=randomHex(),stateHash=await digest(state);
 const expiresAt=nowMs+STATE_MS;
 const result=await env.DB.prepare(
  'INSERT INTO recognition_twitch_fan_oauth_states '+
  '(state_hash,issued_at_ms,expires_at_ms,consumed_at_ms) VALUES (?,?,?,NULL)'
 ).bind(stateHash,nowMs,expiresAt).run();
 if(result?.meta?.changes!==1)return denied(503,'AUTH_UNAVAILABLE');
 const url=new URL('https://id.twitch.tv/oauth2/authorize');
 url.searchParams.set('client_id',env.TWITCH_CLIENT_ID);
 url.searchParams.set('redirect_uri',FAN_REDIRECT_URI);
 url.searchParams.set('response_type','code');
 // OIDC identity only; never request email, channel privileges, chat or subs.
 url.searchParams.set('scope','openid');
 url.searchParams.set('state',state);
 return new Response(null,{status:303,headers:{
  ...BASE_HEADERS,'Location':url.toString(),
  'Set-Cookie':setCookie(STATE_COOKIE,state,600)
 }});
}
async function handleCallback(req,env,nowMs,fetchImpl){
 const u=new URL(req.url);
 const state=u.searchParams.get('state');
 const browserState=cookie(req,STATE_COOKIE);
 if(u.searchParams.getAll('state').length!==1||
    u.searchParams.getAll('code').length>1||
    u.searchParams.getAll('error').length>1||
    !HEX.test(state||'')||!browserState||!equal(state,browserState))
  return denied(400,'INVALID_OR_EXPIRED_STATE');
 const stateHash=await digest(state);
 const claimed=await env.DB.prepare(
  'UPDATE recognition_twitch_fan_oauth_states SET consumed_at_ms=? '+
  'WHERE state_hash=? AND consumed_at_ms IS NULL AND issued_at_ms<=? '+
  'AND expires_at_ms>=? RETURNING issued_at_ms'
 ).bind(nowMs,stateHash,nowMs,nowMs).first();
 if(!claimed||!validTime(claimed.issued_at_ms)||
    nowMs-claimed.issued_at_ms>STATE_MS)
  return denied(400,'INVALID_OR_EXPIRED_STATE');
 const headerCookie=clearCookie(STATE_COOKIE);
 if(u.searchParams.has('error'))
  return denied(400,'TWITCH_AUTHORIZATION_DECLINED');
 const code=u.searchParams.get('code');
 if(!CODE.test(code||''))return denied(400,'INVALID_OAUTH_CODE');
 let identity;
 try{
  const response=await fetchImpl('https://id.twitch.tv/oauth2/token',{
   method:'POST',redirect:'manual',
   headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({
    client_id:env.TWITCH_CLIENT_ID,
    client_secret:env.TWITCH_CLIENT_SECRET,
    grant_type:'authorization_code',
    code,redirect_uri:FAN_REDIRECT_URI
   }).toString()
  });
  if(!response?.ok)return denied(503,'TWITCH_AUTH_UNAVAILABLE');
  const tokens=await response.json();
  if(typeof tokens?.access_token!=='string'||!tokens.access_token||
     tokens.access_token.length>4096||!Number.isFinite(tokens.expires_in)||
     tokens.expires_in<=60||!Array.isArray(tokens.scope)||
     !tokens.scope.includes('openid'))
   return denied(503,'TWITCH_AUTH_UNAVAILABLE');
  const checked=await fetchImpl('https://id.twitch.tv/oauth2/validate',{
   redirect:'manual',headers:{Authorization:'OAuth '+tokens.access_token}
  });
  if(!checked?.ok)return denied(503,'TWITCH_AUTH_UNAVAILABLE');
  identity=await checked.json();
  if(identity?.client_id!==env.TWITCH_CLIENT_ID||
     typeof identity.user_id!=='string'||!ID.test(identity.user_id)||
     !Array.isArray(identity.scopes)||!identity.scopes.includes('openid')||
     !Number.isFinite(identity.expires_in)||identity.expires_in<=60)
   return denied(503,'TWITCH_AUTH_UNAVAILABLE');
 }catch{return denied(503,'TWITCH_AUTH_UNAVAILABLE');}
 // Visitor tokens are deliberately not stored: only validated Twitch user ID.
 const sessionToken=randomHex(),sessionHash=await digest('fan-session-v1:'+sessionToken);
 const csrfSalt=randomHex();
 const written=await env.DB.prepare(
  'INSERT INTO recognition_twitch_fan_sessions '+
  '(session_hash,twitch_user_id,csrf_salt,issued_at_ms,expires_at_ms) '+
  'VALUES (?,?,?,?,?)'
 ).bind(sessionHash,identity.user_id,csrfSalt,nowMs,nowMs+SESSION_MS).run();
 if(written?.meta?.changes!==1)return denied(503,'SESSION_UNAVAILABLE');
 const headers=new Headers({...BASE_HEADERS,'Content-Type':'text/plain; charset=utf-8'});
 headers.append('Set-Cookie',headerCookie);
 headers.append('Set-Cookie',setCookie(SESSION_COOKIE,sessionToken,86400));
 return new Response(
  'Identidad de Twitch autenticada. Verificar la suscripción requiere consentimiento adicional.',{
  status:200,headers
 });
}
async function handleMe(req,env,nowMs){
 const current=await session(req,env,nowMs);
 if(!current)return safeJson({ok:true,authenticated:false});
 const consent=await consentRow(env,current.id);
 return safeJson({ok:true,authenticated:true,csrfToken:current.csrf,
  ...publicState(consent,nowMs)});
}
async function handleMutation(req,env,nowMs,kind){
 if(!originOK(req))return denied(403,'ORIGIN_NOT_ALLOWED');
 const current=await session(req,env,nowMs);
 if(!current)return denied(401,'SESSION_REQUIRED');
 if(!equal(req.headers.get('X-Relight-Fan-Csrf'),current.csrf))
  return denied(403,'CSRF_REQUIRED');
 if(kind===LOGOUT){
  await env.DB.prepare(
   'DELETE FROM recognition_twitch_fan_sessions WHERE session_hash=?'
  ).bind(current.hash).run();
  return safeJson({ok:true,authenticated:false},200,{
   'Set-Cookie':clearCookie(SESSION_COOKIE)
  });
 }
 if(kind===CONSENT){
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('Content-Type')||''))
   return denied(415,'JSON_REQUIRED');
  const raw=await req.text();
  if(raw.length>256)return denied(413,'BODY_TOO_LARGE');
  let body;
  try{body=JSON.parse(raw)}catch{return denied(400,'INVALID_JSON')}
  if(typeof body?.verify!=='boolean'||Object.keys(body).length!==1)
   return denied(400,'INVALID_CONSENT');
  if(body.verify){
   const nonce=randomHex();
   await env.DB.prepare(
    'INSERT INTO recognition_twitch_fan_consents '+
    '(twitch_user_id,consent_nonce,consented_at_ms,last_status,last_checked_at_ms) '+
    "VALUES (?,?,?,'unknown',NULL) ON CONFLICT(twitch_user_id) DO UPDATE SET "+
    'consent_nonce=excluded.consent_nonce,consented_at_ms=excluded.consented_at_ms,'+
    "last_status='unknown',last_checked_at_ms=NULL,check_lock_until_ms=NULL"
   ).bind(current.id,nonce,nowMs).run();
  }else{
   // Withdrawal deletes all verification results; an in-flight check cannot
   // resurrect them because its UPDATE also checks the consent_nonce.
   await env.DB.prepare(
    'DELETE FROM recognition_twitch_fan_consents WHERE twitch_user_id=?'
   ).bind(current.id).run();
  }
  return safeJson({ok:true,verificationConsent:body.verify,
   subscriptionStatus:body.verify?'unknown':'not_enabled'});
 }
 const consent=await consentRow(env,current.id);
 if(!consent||!HEX.test(consent.consent_nonce))
  return denied(403,'CONSENT_REQUIRED');
 return {current,consent};
}
async function handleVerify(req,env,nowMs,fetchImpl){
 const mutation=await handleMutation(req,env,nowMs,VERIFY);
 if(mutation instanceof Response)return mutation;
 const {current,consent}=mutation;
 // A recent successful targeted check can serve this private account until
 // its TTL expires. This prevents repeated requests from exhausting Twitch.
 const prev=consent.last_checked_at_ms;
 if(validTime(prev)&&nowMs>=prev&&nowMs-prev<FRESH_MS&&
    ['active','inactive'].includes(consent.last_status))
  return safeJson({ok:true,subscriptionStatus:consent.last_status,
   cached:true,lastCheckedAt:new Date(prev).toISOString()});
 // Global CAS lock: concurrent browsers cannot multiply Helix calls for the
 // same consenting member. It expires in 2 min if a Worker crashes.
 const lockUntil=nowMs+120000;
 const claimed=await env.DB.prepare(
  'UPDATE recognition_twitch_fan_consents SET check_lock_until_ms=? '+
  'WHERE twitch_user_id=? AND consent_nonce=? '+
  'AND (check_lock_until_ms IS NULL OR check_lock_until_ms<?) '+
  'AND (last_checked_at_ms IS NULL OR last_checked_at_ms<=?) '+
  'RETURNING consent_nonce'
 ).bind(lockUntil,current.id,consent.consent_nonce,nowMs,nowMs-FRESH_MS).first();
 if(!claimed)return denied(429,'VERIFICATION_BUSY_OR_CHANGED');
 try{
  // Existing owner OAuth never leaves Worker. Only this authenticated,
  // explicitly consenting Twitch ID is sent to the filtered endpoint.
  const checked=await readStoredTwitchSubscriptionStatus(env,{
   mode:'targeted',userIds:[current.id],fetchImpl,now:()=>nowMs
  });
  if(!checked?.ok)return safeJson({
   ok:false,subscriptionStatus:'unknown',error:'VERIFICATION_UNAVAILABLE'
  },503);
  const row=checked.checks;
  if(!Array.isArray(row)||row.length!==1||row[0]?.userId!==current.id||
     typeof row[0].active!=='boolean')
   return denied(503,'VERIFICATION_UNAVAILABLE');
  const status=row[0].active?'active':'inactive';
  // The one-time consent nonce AND exact lock deadline both must still
  // match: withdrawal/regrant/competing checks cannot reintroduce status.
  const updated=await env.DB.prepare(
   'UPDATE recognition_twitch_fan_consents SET last_status=?,'+
   'last_checked_at_ms=?,check_lock_until_ms=NULL '+
   'WHERE twitch_user_id=? AND consent_nonce=? AND check_lock_until_ms=? '+
   'AND (last_checked_at_ms IS NULL OR last_checked_at_ms<?)'
  ).bind(status,nowMs,current.id,consent.consent_nonce,lockUntil,nowMs).run();
  if(updated?.meta?.changes!==1)return denied(409,'CONSENT_CHANGED');
  return safeJson({ok:true,subscriptionStatus:status,
   cached:false,lastCheckedAt:new Date(nowMs).toISOString()});
 }finally{
  // If provider fails, leave last verified record intact. Conditional
  // release avoids clearing a newer lock; fallback expiry is bounded.
  try{
   await env.DB.prepare(
    'UPDATE recognition_twitch_fan_consents SET check_lock_until_ms=NULL '+
    'WHERE twitch_user_id=? AND consent_nonce=? AND check_lock_until_ms=?'
   ).bind(current.id,consent.consent_nonce,lockUntil).run();
  }catch{/* Guard automatically expires at lockUntil. */}
 }
}

/** Public only after both flag + owner-applied D1 migration; no public roster. */
export async function handleTwitchFanRoute(req,env,{
 now=Date.now,fetchImpl=fetch
}={}){
 const u=new URL(req.url),path=u.pathname;
 if(!FAN_ROUTES.has(path))return null;
 if(u.origin!=='https://kgblaze.dpdns.org'||!cfg(env))
  return denied(404,'NOT_FOUND');
 if(req.method!==methodFor[path])return denied(405,'METHOD_NOT_ALLOWED');
 const nowMs=now();
 if(!validTime(nowMs))return denied(503,'UNAVAILABLE');
 try{
  if(path===START){
   if(!originOK(req))return denied(403,'ORIGIN_NOT_ALLOWED');
   return await handleStart(env,nowMs);
  }
  if(path===FAN_CALLBACK_PATH)
   return await handleCallback(req,env,nowMs,fetchImpl);
  if(path===ME)return await handleMe(req,env,nowMs);
  if(path===VERIFY)return await handleVerify(req,env,nowMs,fetchImpl);
  return await handleMutation(req,env,nowMs,path);
 }catch{return denied(503,'UNAVAILABLE')}
}

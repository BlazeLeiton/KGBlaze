/**
 * Stage 42 CP01: broadcaster-only Twitch OAuth helpers, NOT connected to Worker.
 * No endpoints, persistence, deployments, publication or background requests.
 * A future controller must authenticate start requests and atomically consume
 * the hashed single-use state before invoking completeTwitchOwnerOAuth.
 * NEVER serialize credentials to an HTTP response, log, or browser storage.
 */
import {TWITCH_RECOGNITION_SCOPE} from './recognition-private.mjs';

export const TWITCH_OWNER_OAUTH_FLAG='RECOGNITION_TWITCH_OAUTH_ENABLED';
// Original KGBlaze Integrated Services redirect registered 2026-10-14.
// This is NOT an active Worker route yet; the portal router currently returns 404.
export const TWITCH_OWNER_CALLBACK_PATH='/twitch/oauth/callback';
export const TWITCH_OWNER_REDIRECT_URI='https://kgblaze.dpdns.org'+TWITCH_OWNER_CALLBACK_PATH;
const HEX=/^[a-f0-9]{64}$/;
const NUMERIC_ID=/^[0-9]{1,24}$/;
const STATE_TTL_MS=10*60*1000;

const failed=reason=>({ok:false,reason});
const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
export async function hashTwitchOwnerOAuthState(state){
 if(typeof state!=='string'||!HEX.test(state))return null;
 return digestState(state);
}
async function digestState(state){
 const bytes=new TextEncoder().encode(state);
 return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
}
function constantEqual(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let diff=0;
 for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
}
function config(env){
 if(env?.RECOGNITION_TWITCH_OAUTH_ENABLED!=='true')return null;
 const clientId=env.TWITCH_CLIENT_ID,secret=env.TWITCH_CLIENT_SECRET;
 const owner=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(typeof clientId!=='string'||!clientId||
    typeof secret!=='string'||!secret||
    typeof owner!=='string'||!NUMERIC_ID.test(owner))return null;
 // The historically registered URL is not a new secret. Reject any
 // accidental replacement rather than registering a second callback.
 const callback=env.TWITCH_RECOGNITION_REDIRECT_URI||TWITCH_OWNER_REDIRECT_URI;
 if(callback!==TWITCH_OWNER_REDIRECT_URI)return null;
 return {clientId,secret,owner,redirectUri:TWITCH_OWNER_REDIRECT_URI};
}
/**
 * Call only from an authenticated admin POST. Persist stateHash and issuedAt
 * in a PRIVATE one-use store; never persist raw state.
 */
export async function beginTwitchOwnerOAuth(env,{now=Date.now,randomBytes}={}){
 const c=config(env);
 if(!c)return failed('disabled_or_not_configured');
 const issuedAt=now();
 if(!Number.isFinite(issuedAt))return failed('invalid_time');
 const bytes=typeof randomBytes==='function'?randomBytes():crypto.getRandomValues(new Uint8Array(32));
 if(!(bytes instanceof Uint8Array)||bytes.length!==32)return failed('invalid_random');
 const state=hex(bytes);
 const stateHash=await digestState(state);
 const url=new URL('https://id.twitch.tv/oauth2/authorize');
 url.searchParams.set('response_type','code');
 url.searchParams.set('client_id',c.clientId);
 url.searchParams.set('redirect_uri',c.redirectUri);
 url.searchParams.set('scope',TWITCH_RECOGNITION_SCOPE);
 url.searchParams.set('state',state);
 return {ok:true,authorizeUrl:url.toString(),stateHash,issuedAt,
  expiresAt:issuedAt+STATE_TTL_MS};
}

async function validateOwnerToken(c,accessToken,fetchImpl){
 const response=await fetchImpl('https://id.twitch.tv/oauth2/validate',{
  headers:{Authorization:'OAuth '+accessToken},redirect:'error'
 });
 if(!response?.ok)return failed('provider_token_validation_failed');
 const identity=await response.json();
 // Never report the returned user ID, client ID or scopes to a browser/log.
 if(identity?.client_id!==c.clientId)return failed('provider_client_mismatch');
 if(identity?.user_id!==c.owner)return failed('provider_owner_mismatch');
 if(!Array.isArray(identity?.scopes)||
    !identity.scopes.includes(TWITCH_RECOGNITION_SCOPE))
  return failed('provider_scope_missing');
 if(!Number.isFinite(identity.expires_in)||identity.expires_in<=60)
  return failed('provider_token_expired');
 return {ok:true};
}
async function exchange(c,fields,fetchImpl){
 const response=await fetchImpl('https://id.twitch.tv/oauth2/token',{
  method:'POST',redirect:'error',headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({...fields,client_id:c.clientId,client_secret:c.secret}).toString()
 });
 // Do not return or log raw provider error messages, token or account details.
 if(!response?.ok)return failed('provider_token_exchange_rejected');
 const data=await response.json();
 if(typeof data?.access_token!=='string'||!data.access_token||
    typeof data?.refresh_token!=='string'||!data.refresh_token||
    !Number.isFinite(data.expires_in)||data.expires_in<=60||
    !Array.isArray(data.scope)||!data.scope.includes(TWITCH_RECOGNITION_SCOPE))
  return failed('provider_token_response_invalid');
 const validation=await validateOwnerToken(c,data.access_token,fetchImpl);
 if(!validation.ok)return validation;
 return {ok:true,credentials:{accessToken:data.access_token,
  refreshToken:data.refresh_token,expiresIn:data.expires_in}};
}
/**
 * Requires the DB controller to have atomically consumed an unexpired
 * hashed state. We also verify state, TTL and exact broadcaster identity here.
 * Credentials returned only for server-side encrypted storage.
 */
export async function completeTwitchOwnerOAuth(env,{code,state,expectedStateHash,issuedAt},
 {now=Date.now,fetchImpl=fetch}={}){
 const c=config(env);
 if(!c)return failed('disabled_or_not_configured');
 const t=now();
 if(typeof code!=='string'||! /^[A-Za-z0-9._~-]{6,512}$/.test(code)||
    typeof state!=='string'||!HEX.test(state)||
    typeof expectedStateHash!=='string'||!HEX.test(expectedStateHash)||
    !Number.isFinite(issuedAt)||!Number.isFinite(t)||
    t<issuedAt||t-issuedAt>STATE_TTL_MS)return failed('invalid_or_expired_state');
 const hash=await digestState(state);
 if(!constantEqual(hash,expectedStateHash))return failed('invalid_or_expired_state');
 try{
  const result=await exchange(c,{grant_type:'authorization_code',code,
   redirect_uri:c.redirectUri},fetchImpl);
  return result.ok?{ok:true,credentials:result.credentials,broadcasterId:c.owner}:result;
 }catch{return failed('provider_request_unavailable');}
}
/** Refresh tokens may rotate; replace both values atomically in secure storage. */
export async function refreshTwitchOwnerOAuth(env,refreshToken,{fetchImpl=fetch}={}){
 const c=config(env);
 if(!c)return failed('disabled_or_not_configured');
 if(typeof refreshToken!=='string'||!refreshToken||refreshToken.length>4096)
  return failed('invalid_refresh_token');
 try{
  const result=await exchange(c,{grant_type:'refresh_token',refresh_token:refreshToken},fetchImpl);
  return result.ok?{ok:true,credentials:result.credentials,broadcasterId:c.owner}:result;
 }catch{return failed('provider_request_unavailable');}
}

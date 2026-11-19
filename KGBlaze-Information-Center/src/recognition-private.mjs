/**
 * Stage 41 CP07. PRIVATE, UNMOUNTED verification adapter.
 * Never use Twitch app/client_credentials access tokens for subscriptions.
 * This file has no Worker route, cron handler, export to the browser or D1 writes.
 * Only explicitly consenting account IDs may be queried. No public names.
 */
export const TWITCH_RECOGNITION_SCOPE='channel:read:subscriptions';
export const TWITCH_RECOGNITION_FLAG='RECOGNITION_TWITCH_ENABLED';
const ID=/^[0-9]{1,24}$/;
const MAX_CHECK=100;
const ALIAS_MAX=48;
const FRESH_MS=24*60*60*1000;

const failed=reason=>({ok:false,reason,checks:[],queried:0});
const normalizedDate=value=>{
 if(typeof value!=='string')return null;
 const ms=Date.parse(value);
 return Number.isFinite(ms)?ms:null;
};
export function validRecognitionConsent(record){
 if(!record||record.platform!=='twitch'||!ID.test(record.platformUserId||''))return false;
 if(typeof record.alias!=='string'||!record.alias.trim()||record.alias.length>ALIAS_MAX)return false;
 if(/[\u0000-\u001f\u007f<>]/.test(record.alias))return false;
 if(record.verifyOptIn!==true||normalizedDate(record.verifyConsentAt)===null)return false;
 if(record.revokedAt||record.withdrawn===true)return false;
 return true;
}
export function recognitionCandidateIds(consents){
 if(!Array.isArray(consents)||consents.length>MAX_CHECK)return null;
 const ids=new Set();
 for(const row of consents){
  if(!validRecognitionConsent(row))return null;
  if(ids.has(row.platformUserId))return null;
  ids.add(row.platformUserId);
 }
 return [...ids];
}
/** Fails closed when disabled, missing scope, wrong account, stale token or network error. */
export async function checkOptedInTwitchSubscriptions(env,consents,{fetchImpl=fetch}={}){
 if(env?.RECOGNITION_TWITCH_ENABLED!=='true')return failed('disabled');
 const ids=recognitionCandidateIds(consents);
 if(!ids)return failed('invalid_consent_set');
 if(ids.length===0)return {ok:true,reason:'empty_opt_in',checks:[],queried:0};
 const token=env.TWITCH_RECOGNITION_USER_TOKEN,clientId=env.TWITCH_CLIENT_ID;
 const broadcasterId=env.TWITCH_RECOGNITION_BROADCASTER_ID;
 if(typeof token!=='string'||!token||typeof clientId!=='string'||!clientId||
    typeof broadcasterId!=='string'||!ID.test(broadcasterId))
  return failed('not_configured');
 if(typeof fetchImpl!=='function')return failed('fetch_unavailable');
 try{
  const validation=await fetchImpl('https://id.twitch.tv/oauth2/validate',{
   headers:{Authorization:'OAuth '+token},redirect:'error'
  });
  if(!validation.ok)return failed('token_invalid');
  const user=await validation.json();
  if(user?.user_id!==broadcasterId||user?.client_id!==clientId||
     !Array.isArray(user.scopes)||!user.scopes.includes(TWITCH_RECOGNITION_SCOPE)||
     !(Number.isFinite(user.expires_in)&&user.expires_in>60))
   return failed('token_scope_or_owner_mismatch');
  const url=new URL('https://api.twitch.tv/helix/subscriptions');
  url.searchParams.set('broadcaster_id',broadcasterId);
  for(const id of ids)url.searchParams.append('user_id',id);
  const response=await fetchImpl(url.toString(),{
   headers:{Authorization:'Bearer '+token,'Client-Id':clientId},redirect:'error'
  });
  if(!response.ok)return failed(response.status===401?'token_invalid':'provider_unavailable');
  const parsed=await response.json();
  if(!Array.isArray(parsed?.data))return failed('invalid_response');
  const requested=new Set(ids),seen=new Set(),active=new Map();
  for(const row of parsed.data){
   if(!row||typeof row.user_id!=='string'||!requested.has(row.user_id)||
      !ID.test(row.broadcaster_id||'')||row.broadcaster_id!==broadcasterId||
      typeof row.is_gift!=='boolean'||!['1000','2000','3000'].includes(row.tier)||
      seen.has(row.user_id))return failed('invalid_response');
   seen.add(row.user_id);
   active.set(row.user_id,{active:true,gifted:row.is_gift,tier:row.tier});
  }
  return {ok:true,reason:'verified',
   checks:ids.map(userId=>({platform:'twitch',platformUserId:userId,
    active:active.has(userId),gifted:active.get(userId)?.gifted??null,
    tier:active.get(userId)?.tier??null})),queried:ids.length};
 }catch{return failed('provider_unavailable')}
}
/**
 * Public projection has TWO independent gates: explicit name-publication opt-in,
 * and successful RECENT eligibility evidence. External API data never sets
 * display consent. Nothing is published by default.
 */
export function approvedRecognitionAliases(consents,verification,{
 publicationEnabled=false,now=new Date()
}={}){
 if(!publicationEnabled||verification?.ok!==true||verification.reason!=='verified'||
    !Array.isArray(consents)||!Array.isArray(verification.checks)||
    !(now instanceof Date)||!Number.isFinite(now.getTime()))return [];
 const byId=new Map(verification.checks.filter(c=>c.platform==='twitch'&&c.active===true)
  .map(c=>[c.platformUserId,c]));
 return consents.filter(row=>{
  if(!validRecognitionConsent(row)||row.publishOptIn!==true||row.publishApproved!==true)return false;
  const allowedAt=normalizedDate(row.publicConsentAt);
  if(allowedAt===null||allowedAt>now.getTime()||row.visibility!==true)return false;
  const checkedAt=normalizedDate(row.lastVerifiedAt);
  if(checkedAt===null||now.getTime()-checkedAt>FRESH_MS||checkedAt>now.getTime())return false;
  return byId.has(row.platformUserId);
 }).map(row=>({
  alias:row.alias.trim(),platform:'twitch',
  subscriptionKind:byId.get(row.platformUserId).gifted?'gifted':'direct'
 }));
}
export const YOUTUBE_MEMBERSHIP_INTEGRATION={
 provider:'youtube',
 state:'blocked_until_creator_allowlist_and_oauth',
 scope:'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
 readEndpoint:'https://www.googleapis.com/youtube/v3/members',
 automaticPublication:false
};

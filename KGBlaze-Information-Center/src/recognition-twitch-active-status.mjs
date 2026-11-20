/**
 * Stage 42 CP14 — PRIVATE ONLY, no D1 subscriber cache or public names.
 * Twitch Helix Get Broadcaster Subscriptions gives the total in the FIRST
 * response, and documents a cursor EVEN on the last page. Do not scan the
 * subscriber roster merely for the provider count: chasing terminal cursors
 * caused the production invalid_or_repeated_cursor incident.
 *
 * Owner OAuth is decrypted only inside Worker. Never return raw user records.
 */
const ID=/^[0-9]{1,24}$/;
const TIER=new Set(['1000','2000','3000']);
const HELIX='https://api.twitch.tv/helix/subscriptions';
const MAX_IDS=100;
const failed=reason=>({ok:false,reason});

export function validTwitchStatusIds(userIds){
 if(!Array.isArray(userIds)||userIds.length<1||userIds.length>MAX_IDS)return null;
 const ids=new Set();
 for(const id of userIds){
  if(typeof id!=='string'||!ID.test(id)||ids.has(id))return null;
  ids.add(id);
 }
 return [...ids];
}

/**
 * mode summary: exactly ONE Twitch request with first=1. Complete means
 * the provider count was obtained, NOT the roster was enumerated.
 * mode targeted: verify up to 100 explicitly provided IDs, no full scan.
 *
 * Network failures are unknown, never evidence that subscriptions expired.
 */
export async function readTwitchActiveSubscriptionStatus({
 accessToken,clientId,broadcasterId,mode='summary',userIds,fetchImpl=fetch
}={}){
 if(typeof accessToken!=='string'||!accessToken||accessToken.length>4096||
    typeof clientId!=='string'||!clientId||clientId.length>256||
    typeof broadcasterId!=='string'||!ID.test(broadcasterId)||
    typeof fetchImpl!=='function')return failed('not_configured');
 if(mode!=='summary'&&mode!=='targeted')return failed('invalid_mode');
 const requested=mode==='targeted'?validTwitchStatusIds(userIds):null;
 if(mode==='targeted'&&!requested)return failed('invalid_user_ids');
 if(mode==='summary'&&userIds!==undefined)return failed('invalid_user_ids');

 const url=new URL(HELIX);
 url.searchParams.set('broadcaster_id',broadcasterId);
 if(requested){
  for(const userId of requested)url.searchParams.append('user_id',userId);
 }else{
  // Minimum allowed page size. Read only total; discard the first row.
  url.searchParams.set('first','1');
 }
 let response,body;
 try{
  response=await fetchImpl(url.toString(),{
   method:'GET',redirect:'manual',
   headers:{Authorization:'Bearer '+accessToken,'Client-Id':clientId,
    Accept:'application/json'}
  });
  if(response?.status===401)return failed('token_unauthorized');
  if(response?.status===429)return failed('rate_limited');
  if(!response?.ok)return failed('provider_unavailable');
  body=await response.json();
 }catch{return failed('provider_unavailable');}
 if(!body||!Array.isArray(body.data)||
    body.data.length>(requested?MAX_IDS:1))
  return failed('invalid_response');
 if(!requested&&(!Number.isSafeInteger(body.total)||body.total<0||
    body.data.length>body.total))
  return failed('invalid_response');
 if(requested&&body.pagination?.cursor)return failed('unexpected_pagination');

 const seenIds=new Set();
 for(const row of body.data){
  if(!row||row.broadcaster_id!==broadcasterId||
     typeof row.user_id!=='string'||!ID.test(row.user_id)||
     (!requested&&(!TIER.has(row.tier)||typeof row.is_gift!=='boolean'))||
     seenIds.has(row.user_id)||
     (requested&&!requested.includes(row.user_id)))
   return failed('invalid_response');
  seenIds.add(row.user_id);
 }
 if(requested){
  return {ok:true,kind:'targeted',checked:requested.length,
   checks:requested.map(userId=>({userId,active:seenIds.has(userId)}))};
 }
 // A returned cursor is irrelevant for provider total. This is NOT an
 // enumerated roster and cannot be reused to infer per-user inactivity.
 return {ok:true,kind:'summary',complete:true,pages:1,
  observedActiveRows:body.data.length,providerTotal:body.total,
  countSource:'twitch_total',rosterComplete:false};
}

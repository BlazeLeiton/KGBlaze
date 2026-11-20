/**
 * Stage 42 CP13 — PRIVATE ONLY, no D1 writes, no public aliases.
 * Twitch Get Broadcaster Subscriptions is the current eligibility authority:
 * https://dev.twitch.tv/docs/api/reference/subscriptions
 *
 * An owner user token scoped channel:read:subscriptions is supplied only
 * by the encrypted, server-side OAuth controller. No app-token fallback.
 * The result must never be projected as a public subscriber directory.
 */
const ID=/^[0-9]{1,24}$/;
const TIER=new Set(['1000','2000','3000']);
const HELIX='https://api.twitch.tv/helix/subscriptions';
const MAX_PAGES=30;
const MAX_IDS=100;
const failed=(reason,details={})=>({ok:false,reason,...details});

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
 * mode='summary': visit all pages (including an empty final page with a cursor)
 * and return COUNTS ONLY. Missing/failed pages must not imply expiry.
 * mode='targeted': check up to 100 explicitly supplied user IDs, no full scan.
 * No Twitch ID/name/record from a full roster is returned in summary mode.
 */
export async function readTwitchActiveSubscriptionStatus({
 accessToken,clientId,broadcasterId,mode='summary',userIds,
 fetchImpl=fetch,maxPages=MAX_PAGES
}={}){
 if(typeof accessToken!=='string'||!accessToken||accessToken.length>4096||
    typeof clientId!=='string'||!clientId||clientId.length>256||
    typeof broadcasterId!=='string'||!ID.test(broadcasterId)||
    typeof fetchImpl!=='function')return failed('not_configured');
 if(mode!=='summary'&&mode!=='targeted')return failed('invalid_mode');
 if(!Number.isSafeInteger(maxPages)||maxPages<1||maxPages>MAX_PAGES)
  return failed('invalid_limit');
 const requested=mode==='targeted'?validTwitchStatusIds(userIds):null;
 if(mode==='targeted'&&!requested)return failed('invalid_user_ids');
 if(mode==='summary'&&userIds!==undefined)return failed('invalid_user_ids');
 const asked=requested?new Set(requested):null;
 const seenIds=new Set(),seenCursors=new Set();
 let after=null,providerTotal=null,pages=0,activeRows=0;
 while(pages<maxPages){
  const url=new URL(HELIX);
  url.searchParams.set('broadcaster_id',broadcasterId);
  if(asked){
   for(const userId of requested)url.searchParams.append('user_id',userId);
  }else{
   url.searchParams.set('first','100');
   if(after!==null)url.searchParams.set('after',after);
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
  if(!body||!Array.isArray(body.data)||body.data.length>MAX_IDS)
   return failed('invalid_response');
  if(!asked&&(!Number.isSafeInteger(body.total)||body.total<0))
   return failed('invalid_response');
  if(!asked){
   if(providerTotal===null)providerTotal=body.total;
   if(body.total!==providerTotal)return failed('snapshot_changed_during_scan');
  }
  if(asked&&body.pagination?.cursor)return failed('unexpected_pagination');
  for(const row of body.data){
   if(!row||row.broadcaster_id!==broadcasterId||
      typeof row.user_id!=='string'||!ID.test(row.user_id)||
      !TIER.has(row.tier)||typeof row.is_gift!=='boolean'||
      seenIds.has(row.user_id)||(asked&&!asked.has(row.user_id)))
    return failed('invalid_response');
   seenIds.add(row.user_id);
   activeRows++;
  }
  pages++;
  if(asked)return {ok:true,kind:'targeted',checked:requested.length,
   checks:requested.map(userId=>({
    userId,active:seenIds.has(userId)
   }))};
  const cursor=body.pagination?.cursor;
  if(cursor===undefined||cursor===null||cursor===''){
   return {ok:true,kind:'summary',complete:true,pages,
    observedActiveRows:activeRows,providerTotal};
  }
  if(typeof cursor!=='string'||cursor.length>2048||seenCursors.has(cursor))
   return failed('invalid_or_repeated_cursor');
  seenCursors.add(cursor);
  after=cursor;
 }
 // Crucial: a partial paginated scan is NOT evidence of inactivity.
 return failed('incomplete_snapshot',{complete:false,pages});
}

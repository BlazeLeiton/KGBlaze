/**
 * Stage42 CP15: PRIVATE server-side Twitch subscriber roster snapshot.
 * WARNING: returns private account IDs and display names. Never serialize
 * to public HTTP, log, or project into a public directory.
 *
 * Twitch can return a cursor on the LAST page. Completion is when the
 * distinct subscribed IDs count equals the official provider total.
 * Repeated cursor before complete coverage must FAIL CLOSED.
 */
const ID=/^[0-9]{1,24}$/;
const LOGIN=/^[a-zA-Z0-9_]{1,25}$/;
const INVALID_NAME=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const TIER=new Set(['1000','2000','3000']);
const HELIX='https://api.twitch.tv/helix/subscriptions';
const CAP=500;
const MAX_PAGES=10;
const fail=reason=>({ok:false,reason});

export async function readTwitchPrivateRosterSnapshot({
 accessToken,clientId,broadcasterId,fetchImpl=fetch,maxMembers=CAP
}={}){
 if(typeof accessToken!=='string'||accessToken.length<1||accessToken.length>4096||
    typeof clientId!=='string'||!clientId||clientId.length>256||
    typeof broadcasterId!=='string'||!ID.test(broadcasterId)||
    typeof fetchImpl!=='function'||!Number.isSafeInteger(maxMembers)||
    maxMembers<1||maxMembers>CAP)return fail('not_configured');

 const records=new Map(),visited=new Set();
 let expectedTotal=null,after=null;
 for(let page=1;page<=MAX_PAGES;page++){
  const url=new URL(HELIX);
  url.searchParams.set('broadcaster_id',broadcasterId);
  url.searchParams.set('first','100');
  if(after!==null)url.searchParams.set('after',after);
  let response,body;
  try{
   response=await fetchImpl(url.toString(),{
    method:'GET',redirect:'manual',
    headers:{Authorization:'Bearer '+accessToken,'Client-Id':clientId,
     Accept:'application/json'}
   });
   if(response?.status===401)return fail('token_unauthorized');
   if(response?.status===429)return fail('rate_limited');
   if(!response?.ok)return fail('provider_unavailable');
   body=await response.json();
  }catch{return fail('provider_unavailable');}
  if(!body||!Array.isArray(body.data)||body.data.length>100||
     !Number.isSafeInteger(body.total)||body.total<0)
   return fail('invalid_response');
  if(expectedTotal===null){
   expectedTotal=body.total;
   if(expectedTotal>maxMembers)return fail('roster_above_safe_cap');
  }else if(body.total!==expectedTotal){
   return fail('snapshot_changed_during_scan');
  }
  for(const row of body.data){
   if(!row||row.broadcaster_id!==broadcasterId||
      typeof row.user_id!=='string'||!ID.test(row.user_id)||
      !TIER.has(row.tier)||typeof row.is_gift!=='boolean'||
      typeof row.user_login!=='string'||!LOGIN.test(row.user_login)||
      typeof row.user_name!=='string'||!row.user_name||
      row.user_name.length>48||INVALID_NAME.test(row.user_name))
    return fail('invalid_response');
   const existing=records.get(row.user_id);
   if(existing&&existing.displayName!==row.user_name)
    return fail('snapshot_changed_during_scan');
   if(!existing)records.set(row.user_id,{
    userId:row.user_id,displayName:row.user_name
   });
   if(records.size>expectedTotal)return fail('invalid_response');
  }
  // Twitch can still return a cursor on this last, complete page.
  if(records.size===expectedTotal){
   return {ok:true,complete:true,providerTotal:expectedTotal,pages:page,
    subscribers:[...records.values()].sort((a,b)=>a.userId.localeCompare(b.userId))}
  }
  const cursor=body.pagination?.cursor;
  if(typeof cursor!=='string'||!cursor||cursor.length>2048)
   return fail('incomplete_roster');
  if(visited.has(cursor))return fail('cursor_repeated_before_complete');
  visited.add(cursor);
  after=cursor;
 }
 return fail('page_budget_exhausted');
}

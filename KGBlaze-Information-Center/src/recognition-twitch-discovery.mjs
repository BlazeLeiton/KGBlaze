/**
 * Stage43 CP26 — bounded owner-only positive Twitch subscriber discovery.
 * Twitch's observed provider total is inconsistent on this owner's channel.
 * Do not use total to certify completeness or infer inactivity.
 * Only owner-authenticated filtered user_id checks may assert inactive.
 * Never return this object in any HTTP response or log its contents.
 */
const HELIX='https://api.twitch.tv/helix/subscriptions';
const ID=/^[0-9]{1,24}$/;
const LOGIN=/^[a-zA-Z0-9_]{2,25}$/;
const NAME_BAD=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
export const MAX_TWITCH_TRACKED_MEMBERS=3000;
const MAX_PAGES=30;
const err=reason=>({ok:false,reason});
export function validateTwitchRecognitionLabel(row){
 if(!row||typeof row.user_id!=='string'||!ID.test(row.user_id))
  return null;
 const login=typeof row.user_login==='string'?row.user_login.trim():'';
 if(!LOGIN.test(login))return null;
 const display=typeof row.user_name==='string'?row.user_name.trim():'';
 const name=display&&!NAME_BAD.test(display)&&display.length<=48?display:login;
 return {userId:row.user_id,login:login.toLowerCase(),displayName:name};
}
/** Return observed rows (positive evidence), NOT a guaranteed complete roster. */
export async function discoverTwitchRecognitionCandidates({
 accessToken,clientId,broadcasterId,fetchImpl=fetch
}={}){
 if(typeof accessToken!=='string'||!accessToken||
    typeof clientId!=='string'||!clientId||
    typeof broadcasterId!=='string'||!ID.test(broadcasterId)||
    typeof fetchImpl!=='function')return err('not_configured');
 const seen=new Map(),cursors=new Set();
 let cursor=null,partial=true;
 for(let page=1;page<=MAX_PAGES;page++){
  const url=new URL(HELIX);
  url.searchParams.set('broadcaster_id',broadcasterId);
  url.searchParams.set('first','100');
  if(cursor)url.searchParams.set('after',cursor);
  let response,data;
  try{
   response=await fetchImpl(url.toString(),{
    method:'GET',redirect:'manual',
    headers:{Authorization:'Bearer '+accessToken,'Client-Id':clientId,
     Accept:'application/json'}
   });
   if(response?.status===401)return err('token_unauthorized');
   if(response?.status===429)return err('rate_limited');
   if(!response?.ok)return err('provider_unavailable');
   data=await response.json();
  }catch{return err('provider_unavailable');}
  if(!data||!Array.isArray(data.data)||data.data.length>100)
   return err('invalid_response_shape');
  let newRows=0;
  for(const row of data.data){
   if(!row||row.broadcaster_id!==broadcasterId)
    return err('invalid_response_identity');
   const identity=validateTwitchRecognitionLabel(row);
   if(!identity)return err('invalid_response_identity');
   const prior=seen.get(identity.userId);
   if(prior&&(prior.login!==identity.login||
      prior.displayName!==identity.displayName))
    return err('snapshot_changed_during_scan');
   if(!prior){seen.set(identity.userId,identity);newRows++;}
  }
  if(seen.size>MAX_TWITCH_TRACKED_MEMBERS)
   return err('capacity_requires_pagination_upgrade');
  const next=data.pagination?.cursor;
  // Empty, short, absent or repeated cursor ends THIS observation only.
  // It is not proof of a complete roster or another member's cancellation.
  if(data.data.length<100||typeof next!=='string'||!next||
     cursors.has(next)||newRows===0){
   partial=!(data.data.length<100);
   break;
  }
  cursors.add(next);cursor=next;
 }
 return {ok:true,partial,candidates:[...seen.values()]};
}
export function parseTwitchRecognitionConsentCommand(message){
 if(typeof message!=='string'||message.length>128)return null;
 const normalized=message.trim().toLocaleLowerCase('es');
 if(/^!kgblaze\s+(?:si|sí|autorizar)$/.test(normalized))
  return 'approved';
 if(/^!kgblaze\s+(?:no|retirar|baja)$/.test(normalized))
  return 'declined';
 return null;
}

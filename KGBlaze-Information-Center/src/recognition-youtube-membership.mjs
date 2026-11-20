/**
 * Stage 43 CP31 — creator-owned AUTOMATIC YouTube membership preparation.
 * This module has NO scheduled job, credentials, token storage, upload route,
 * visitor login, or public-name publication. It must remain fail-closed until
 * the owner has Members API channel-level allowlisting and secure OAuth vault.
 * Twitch's recognition is a separate source and must never be overwritten.
 */
export const YOUTUBE_CREATOR_CHANNEL='UCRd_uwPjrsf6Z3CRXwNehEQ';
export const YOUTUBE_MEMBERS_SCOPE='https://www.googleapis.com/auth/youtube.channel-memberships.creator';
const API='https://www.googleapis.com/youtube/v3/members';
const ID=/^UC[A-Za-z0-9_-]{22}$/u;
const LEVEL=/^[A-Za-z0-9_-]{4,128}$/u;
const BAD=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const PAGE_SIZE=100,MAX_PAGES=30,MAX_MEMBERS=3000;
const FRESH_MS=36*60*60*1000,LOCK_MS=10*60*1000;
const fail=reason=>({ok:false,reason});
const enabled=env=>env?.RECOGNITION_YOUTUBE_ENABLED==='true'&&
 env?.YOUTUBE_MEMBERS_API_ACCESS_VERIFIED==='true'&&
 env?.YOUTUBE_CHANNEL_ID===YOUTUBE_CREATOR_CHANNEL;
const validMs=v=>Number.isSafeInteger(v)&&v>0;

/** Only a server-side caller may supply a Google OAuth USER access token.
 * List all_current, not the 'updates' feed: the latter omits expirations.
 * A failed/incomplete snapshot MUST NOT deactivate any previously known user.
 */
export async function fetchYouTubeCurrentMembers(env,{accessToken,fetchImpl=fetch}={}){
 if(!enabled(env))return fail('disabled_or_not_allowlisted');
 if(typeof accessToken!=='string'||!accessToken||
    accessToken.length>8192||typeof fetchImpl!=='function')
  return fail('owner_token_unavailable');
 const seen=new Map(),pages=new Set();
 let pageToken=null;
 for(let page=0;page<MAX_PAGES;page++){
  const url=new URL(API);
  url.searchParams.set('part','snippet');
  url.searchParams.set('mode','all_current');
  url.searchParams.set('maxResults',String(PAGE_SIZE));
  if(pageToken)url.searchParams.set('pageToken',pageToken);
  let response,body;
  try{
   response=await fetchImpl(url.toString(),{
    method:'GET',redirect:'manual',headers:{
     Authorization:'Bearer '+accessToken,Accept:'application/json'
    }
   });
   if(response?.status===401)return fail('owner_token_invalid');
   if(response?.status===403)return fail('channel_access_forbidden');
   if(response?.status===429)return fail('provider_rate_limited');
   if(!response?.ok)return fail('provider_unavailable');
   body=await response.json();
  }catch{return fail('provider_unavailable');}
  if(body?.kind!=='youtube#memberListResponse'||!Array.isArray(body.items)||
     body.items.length>PAGE_SIZE)return fail('invalid_provider_response');
  for(const item of body.items){
   const s=item?.snippet,m=s?.memberDetails,d=s?.membershipsDetails;
   if(s?.creatorChannelId!==YOUTUBE_CREATOR_CHANNEL||
      !LEVEL.test(d?.highestAccessibleLevel||''))
    return fail('invalid_provider_identity');
   // YouTube documents members with deleted/unavailable profile details:
   // retain for provider counts but NEVER assign them a fake identity.
   if(m?.channelId===undefined||m?.channelId===null)continue;
   if(typeof m.channelId!=='string'||!ID.test(m.channelId)||
      seen.has(m.channelId))return fail('invalid_provider_identity');
   const name=typeof m.displayName==='string'&&
     m.displayName.length>0&&m.displayName.length<=48&&
     !BAD.test(m.displayName)?m.displayName:null;
   seen.set(m.channelId,{channelId:m.channelId,displayName:name,
    levelId:d.highestAccessibleLevel});
   if(seen.size>MAX_MEMBERS)return fail('snapshot_capacity_reached');
  }
  const next=body.nextPageToken;
  if(next===undefined||next===null||next===''){
   return {ok:true,complete:true,source:'youtube_members_all_current',
    members:[...seen.values()],checkedPages:page+1};
  }
  if(typeof next!=='string'||next.length>1024||pages.has(next)||
     body.items.length===0)return fail('invalid_or_repeated_cursor');
  pages.add(next);pageToken=next;
 }
 return fail('snapshot_page_limit_reached');
}

/** Refresh helper only; does not store token material or issue an OAuth grant.
 * A future encrypted server-side vault and owner callback require separate
 * review. Testing-mode Google refresh tokens are NOT durable by assumption.
 */
export async function refreshYouTubeCreatorAccessToken(env,{
 refreshToken,fetchImpl=fetch
}={}){
 if(!enabled(env))return fail('disabled_or_not_allowlisted');
 if(typeof refreshToken!=='string'||!refreshToken||
    refreshToken.length>8192||
    typeof env.YOUTUBE_RECOGNITION_CLIENT_ID!=='string'||
    !env.YOUTUBE_RECOGNITION_CLIENT_ID||
    typeof env.YOUTUBE_RECOGNITION_CLIENT_SECRET!=='string'||
    !env.YOUTUBE_RECOGNITION_CLIENT_SECRET||
    typeof fetchImpl!=='function')return fail('owner_oauth_not_configured');
 try{
  const request=new URLSearchParams({
   grant_type:'refresh_token',refresh_token:refreshToken,
   client_id:env.YOUTUBE_RECOGNITION_CLIENT_ID,
   client_secret:env.YOUTUBE_RECOGNITION_CLIENT_SECRET
  });
  const res=await fetchImpl('https://oauth2.googleapis.com/token',{
   method:'POST',redirect:'manual',headers:{
    'Content-Type':'application/x-www-form-urlencoded'
   },body:request.toString()
  });
  if(!res?.ok)return fail('owner_oauth_refresh_unavailable');
  const data=await res.json();
  if(typeof data?.access_token!=='string'||!data.access_token||
     data.access_token.length>8192||
     !Number.isSafeInteger(data.expires_in)||data.expires_in<=60||
     (data.refresh_token!==undefined&&(
      typeof data.refresh_token!=='string'||!data.refresh_token||
      data.refresh_token.length>8192)))
   return fail('invalid_refresh_response');
  // Secret values must never be logged, sent to browsers or copied into docs.
  return {ok:true,accessToken:data.access_token,expiresIn:data.expires_in,
   refreshToken:data.refresh_token||refreshToken};
 }catch{return fail('owner_oauth_refresh_unavailable');}
}

/** The D1 migration is separate and NOT applied by deployment.
 * Consumer MUST pass only a fully verified, complete owner snapshot.
 * D1.batch transaction invalidates old active statuses before upserting the
 * new complete list; consent fields are preserved across every upsert.
 */
export async function commitYouTubeCurrentMembers(env,snapshot,{
 nowMs=Date.now()
}={}){
 if(!enabled(env)||env?.RECOGNITION_YOUTUBE_STORE_ENABLED!=='true')
  return fail('disabled_or_not_allowlisted');
 if(typeof env.DB?.prepare!=='function'||typeof env.DB?.batch!=='function')
  return fail('private_storage_unavailable');
 if(snapshot?.ok!==true||snapshot.complete!==true||
    snapshot.source!=='youtube_members_all_current'||
    !Array.isArray(snapshot.members)||snapshot.members.length>MAX_MEMBERS||
    !validMs(nowMs))return fail('unverified_or_incomplete_snapshot');
 const unique=new Set();
 for(const m of snapshot.members){
  if(!m||!ID.test(m.channelId||'')||
     (m.displayName!==null&&(typeof m.displayName!=='string'||
       !m.displayName||m.displayName.length>48||BAD.test(m.displayName)))||
     !LEVEL.test(m.levelId||'')||unique.has(m.channelId))
   return fail('invalid_snapshot_member');
  unique.add(m.channelId);
 }
 let claimed=false,lockUntil=0;
 try{
  await env.DB.prepare(
   'INSERT OR IGNORE INTO recognition_youtube_membership_meta (slot) VALUES (1)'
  ).run();
  const meta=await env.DB.prepare(
   'SELECT version FROM recognition_youtube_membership_meta WHERE slot=1'
  ).first();
  if(!Number.isSafeInteger(meta?.version)||meta.version<0)
   return fail('youtube_schema_unavailable');
  lockUntil=nowMs+LOCK_MS;
  const lock=await env.DB.prepare(
   'UPDATE recognition_youtube_membership_meta SET refresh_lock_until_ms=? '+
   'WHERE slot=1 AND version=? AND '+
   '(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms<?) '+
   'RETURNING version'
  ).bind(lockUntil,meta.version,nowMs).first();
  if(!lock)return fail('youtube_snapshot_busy_or_changed');
  claimed=true;
  const q=[
   env.DB.prepare(
    'UPDATE recognition_youtube_membership_meta SET '+
    'last_success_at_ms=CASE WHEN version=? AND refresh_lock_until_ms=? '+
    'THEN ? ELSE -1 END,version=version+1,refresh_lock_until_ms=NULL '+
    'WHERE slot=1'
   ).bind(meta.version,lockUntil,nowMs),
   env.DB.prepare(
    'UPDATE recognition_youtube_memberships SET active=0,last_checked_at_ms=?'
   ).bind(nowMs)
  ];
  for(const m of snapshot.members){
   q.push(env.DB.prepare(
    'INSERT INTO recognition_youtube_memberships '+
    '(youtube_channel_id,display_name,level_id,active,last_checked_at_ms,first_seen_at_ms) '+
    'VALUES (?,?,?,1,?,?) ON CONFLICT(youtube_channel_id) DO UPDATE SET '+
    'display_name=excluded.display_name,level_id=excluded.level_id,'+
    'active=1,last_checked_at_ms=excluded.last_checked_at_ms'
   ).bind(m.channelId,m.displayName,m.levelId,nowMs,nowMs));
  }
  await env.DB.batch(q);
  const confirmed=await env.DB.prepare(
   'SELECT version,last_success_at_ms FROM recognition_youtube_membership_meta WHERE slot=1'
  ).first();
  if(confirmed?.version!==meta.version+1||
     confirmed?.last_success_at_ms!==nowMs)
   return fail('postcommit_version_mismatch');
  claimed=false;
  return {ok:true,refreshed:true,checked:snapshot.members.length};
 }catch{return fail('youtube_snapshot_storage_unavailable')}
 finally{
  if(claimed)try{await env.DB.prepare(
   'UPDATE recognition_youtube_membership_meta SET refresh_lock_until_ms=NULL '+
   'WHERE slot=1 AND refresh_lock_until_ms=?'
  ).bind(lockUntil).run();}catch{/* Lock expires by design. */}
 }
}

/** Backward-compatible public projection. No viewer authentication or PII.
 * YouTube has NO public trial/unasked shortcut: consent must be approved.
 * Missing schema, no allowlist, stale cache, or any query error => [].
 */
export async function readPublicYouTubeRecognition(env,{nowMs=Date.now()}={}){
 if(!enabled(env)||env.RECOGNITION_YOUTUBE_PUBLIC_ENABLED!=='true'||
    !validMs(nowMs)||typeof env.DB?.prepare!=='function')
  return [];
 try{
  const rows=await env.DB.prepare(
   'SELECT display_name FROM recognition_youtube_memberships '+
   "WHERE active=1 AND consent_state='approved' "+
   'AND last_checked_at_ms>? AND last_checked_at_ms<=? '+
   'ORDER BY display_name COLLATE NOCASE LIMIT ?'
  ).bind(nowMs-FRESH_MS,nowMs,MAX_MEMBERS).all();
  const names=[];
  for(const r of rows?.results||[]){
   if(typeof r.display_name==='string'&&r.display_name.length>0&&
      r.display_name.length<=48&&!BAD.test(r.display_name))
    names.push({displayName:r.display_name});
  }
  return names;
 }catch{return []}
}

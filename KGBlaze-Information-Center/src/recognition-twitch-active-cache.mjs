/**
 * Stage42 CP15 — private D1 snapshot cache, NO public route.
 * D1.batch() is transactional: delete previous active rows, insert new
 * provider-verified full set, then advance meta atomically.
 * Never treat a failed/incomplete Twitch snapshot as revocation.
 *
 * Requires an explicitly deployed private migration and feature flag.
 * The caller MUST obtain the snapshot via trusted owner OAuth, NEVER from
 * client-provided JSON. This module is deliberately not a public API.
 */
const ID=/^[0-9]{1,24}$/;
const BAD_NAME=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const fail=reason=>({ok:false,reason});

export async function getPrivateTwitchCacheMeta(env){
 if(!env?.DB?.prepare)return fail('database_unavailable');
 try{
  const row=await env.DB.prepare(
   'SELECT last_completed_at_ms,active_total,snapshot_version '+
   'FROM recognition_twitch_active_status_meta WHERE slot=1').first();
  if(!row)return {ok:true,initialized:false};
  if(!Number.isSafeInteger(row.last_completed_at_ms)||row.last_completed_at_ms<1||
     !Number.isSafeInteger(row.active_total)||row.active_total<0||
     !Number.isSafeInteger(row.snapshot_version)||row.snapshot_version<1)
   return fail('invalid_cache_meta');
  return {ok:true,initialized:true,lastCompletedAtMs:row.last_completed_at_ms,
   activeTotal:row.active_total,snapshotVersion:row.snapshot_version};
 }catch{return fail('schema_missing_or_unavailable');}
}

export async function commitPrivateTwitchActiveRoster(env,snapshot,{
 nowMs=Date.now(),previousMeta
}={}){
 if(env?.RECOGNITION_TWITCH_CACHE_ENABLED!=='true')
  return fail('cache_feature_disabled');
 if(!env?.DB?.batch||!env?.DB?.prepare)
  return fail('database_unavailable');
 if(!Number.isSafeInteger(nowMs)||nowMs<1||
    snapshot?.ok!==true||snapshot?.complete!==true||
    !Number.isSafeInteger(snapshot.providerTotal)||
    snapshot.providerTotal<0||snapshot.providerTotal>500||
    !Array.isArray(snapshot.subscribers)||
    snapshot.subscribers.length!==snapshot.providerTotal)
  return fail('incomplete_or_invalid_roster');

 const seen=new Set();
 for(const r of snapshot.subscribers){
  if(!r||typeof r.userId!=='string'||!ID.test(r.userId)||
     seen.has(r.userId)||typeof r.displayName!=='string'||
     r.displayName.length<1||r.displayName.length>48||
     BAD_NAME.test(r.displayName))
   return fail('invalid_roster_entry');
  seen.add(r.userId);
 }
 const meta=previousMeta||await getPrivateTwitchCacheMeta(env);
 if(!meta.ok)return fail(meta.reason);
 if(meta.initialized&&nowMs<=meta.lastCompletedAtMs)
  return fail('snapshot_not_newer');
 const version=meta.initialized?meta.snapshotVersion+1:1;
 if(!Number.isSafeInteger(version))return fail('invalid_cache_version');
 try{
  // Meta must exist first because the active rows FK points to it.
  // A single D1 transaction rolls back meta AND rows on any failure.
  const statements=[
   env.DB.prepare(
    'INSERT INTO recognition_twitch_active_status_meta '+
    '(slot,last_completed_at_ms,active_total,snapshot_version) VALUES (1,?,?,?) '+
    'ON CONFLICT(slot) DO UPDATE SET last_completed_at_ms=excluded.last_completed_at_ms,'+
    'active_total=excluded.active_total,snapshot_version=excluded.snapshot_version'
   ).bind(nowMs,snapshot.providerTotal,version),
   env.DB.prepare('DELETE FROM recognition_twitch_active_subscribers'),
   ...snapshot.subscribers.map(r=>env.DB.prepare(
    'INSERT INTO recognition_twitch_active_subscribers '+
    '(twitch_user_id,display_name,observed_at_ms) VALUES (?,?,?)'
   ).bind(r.userId,r.displayName,nowMs))
  ];
  await env.DB.batch(statements);
  // Return counts only, NEVER names or user IDs.
  return {ok:true,activeTotal:snapshot.providerTotal,
   snapshotVersion:version,lastCompletedAtMs:nowMs};
 }catch{return fail('private_cache_write_unavailable');}
}

/**
 * Stage 43 CP25: EXACTLY TWO owner-attested consenting Twitch subscribers.
 * A private opt-in pilot; NOT the private broadcaster roster, EventSub, a
 * general supporter directory, or an authentication provider for visitors.
 *
 * Production pilot requires owner-applied isolated D1 migration and flags.
 * Public display requires a second independent explicitly enabled flag.
 */
import {resolveStoredTwitchPilotMembers,
 readStoredTwitchSubscriptionStatus} from './recognition-twitch-connection.mjs';

export const PILOT_PUBLIC_PATH='/api/public/recognition';
const MAX=2;
const FRESH_MS=30*60*1000;
const MIN_REFRESH_MS=5*60*1000;
const LOCK_MS=120000;
const ID=/^[0-9]{1,24}$/;
const BAD=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const failed=reason=>({ok:false,reason});
const ready=env=>env?.RECOGNITION_TWITCH_PILOT_ENABLED==='true'&&
 env.DB?.prepare&&typeof env.DB.batch==='function'&&
 env.RECOGNITION_TWITCH_STATUS_ENABLED==='true';
const publicEnabled=env=>ready(env)&&env.RECOGNITION_TWITCH_PILOT_PUBLIC_ENABLED==='true';
const timeOK=nowMs=>Number.isSafeInteger(nowMs)&&nowMs>0;
const loginOK=x=>typeof x==='string'&&/^[a-zA-Z0-9_]{2,25}$/.test(x);

/** No roster reads, no provider queries, no logged/member IDs in public API. */
export async function readTwitchPilotPublic(env,{nowMs=Date.now()}={}){
 if(!publicEnabled(env)||!timeOK(nowMs))return {ok:true,twitch:[]};
 try{
  const rows=await env.DB.prepare(
   'SELECT display_name FROM recognition_twitch_pilot_members '+
   'WHERE active=1 AND last_verified_at_ms>? '+
   'ORDER BY login COLLATE NOCASE ASC LIMIT 2'
  ).bind(nowMs-FRESH_MS).all();
  const names=[];
  for(const r of rows?.results||[]){
   if(typeof r.display_name==='string'&&r.display_name.length>0&&
      r.display_name.length<=48&&!BAD.test(r.display_name))
    names.push({displayName:r.display_name});
  }
  return {ok:true,twitch:names.slice(0,MAX)};
 }catch{return {ok:true,twitch:[]}}
}
/** Admin-only; includes only two owner-approved names, never global roster. */
export async function readTwitchPilotPrivate(env,{nowMs=Date.now()}={}){
 if(!ready(env))return failed('pilot_disabled');
 if(!timeOK(nowMs))return failed('invalid_time');
 try{
  const meta=await env.DB.prepare(
   'SELECT last_verified_at_ms,version FROM recognition_twitch_pilot_meta WHERE slot=1'
  ).first();
  const rows=await env.DB.prepare(
   'SELECT login,display_name,active,last_verified_at_ms FROM '+
   'recognition_twitch_pilot_members ORDER BY login ASC LIMIT 3'
  ).all();
  const members=rows?.results||[];
  if(members.length>MAX)return failed('pilot_size_invariant');
  return {ok:true,configured:members.length===2,publicEnabled:publicEnabled(env),
   lastVerifiedAt:timeOK(meta?.last_verified_at_ms)?
    new Date(meta.last_verified_at_ms).toISOString():null,
   members:members.map(row=>({login:row.login,displayName:row.display_name,
    subscriptionStatus:row.active===1&&timeOK(row.last_verified_at_ms)&&
      nowMs-row.last_verified_at_ms<FRESH_MS&&
      nowMs>=row.last_verified_at_ms?'active':
      row.active===0&&timeOK(row.last_verified_at_ms)&&
      nowMs-row.last_verified_at_ms<FRESH_MS&&
      nowMs>=row.last_verified_at_ms?'inactive':'stale'}))};
 }catch{return failed('pilot_schema_unavailable')}
}

/**
 * Only the OWNER can attest that these EXACT TWO logins consented. First
 * verify both canonical Twitch account identities and filtered active
 * subscriptions. Any provider failure means NO D1 write and NO public name.
 * Atomic batch replaces the prior two; no changes to the global D1 cache.
 */
export async function enrollTwitchPilot(env,{
 logins,consentConfirmed,now=Date.now,fetchImpl=fetch
}={}){
 if(!ready(env))return failed('pilot_disabled');
 if(!Array.isArray(logins)||logins.length!==MAX||
    logins.some(x=>!loginOK(x))||
    new Set(logins.map(x=>x.toLowerCase())).size!==MAX)
  return failed('invalid_pilot_logins');
 if(consentConfirmed!==true)return failed('explicit_consent_attestation_required');
 const nowMs=now();
 if(!timeOK(nowMs))return failed('invalid_time');
 const result=await resolveStoredTwitchPilotMembers(env,{logins,now,fetchImpl});
 if(!result.ok)return failed(result.reason);
 const members=result.members;
 if(!Array.isArray(members)||members.length!==MAX||
    new Set(members.map(x=>x.userId)).size!==MAX||
    members.some(x=>!ID.test(x.userId)||!loginOK(x.login)||
     typeof x.displayName!=='string'||!x.displayName.trim()||
     x.displayName.length>48||BAD.test(x.displayName)))
  return failed('invalid_verified_members');
 try{
  const statements=[
   env.DB.prepare(
    'INSERT INTO recognition_twitch_pilot_meta '+
    '(slot,last_verified_at_ms,refresh_lock_until_ms,version) '+
    'VALUES (1,?,NULL,1) ON CONFLICT(slot) DO UPDATE SET '+
    'last_verified_at_ms=CASE WHEN '+
    '(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms<?) AND '+
    '(last_verified_at_ms IS NULL OR last_verified_at_ms<?) '+
    'THEN excluded.last_verified_at_ms ELSE -1 END, '+
    'version=recognition_twitch_pilot_meta.version+1,refresh_lock_until_ms=NULL'
   ).bind(nowMs,nowMs,nowMs),
   env.DB.prepare('DELETE FROM recognition_twitch_pilot_members'),
   ...members.map(m=>env.DB.prepare(
    'INSERT INTO recognition_twitch_pilot_members '+
    '(twitch_user_id,login,display_name,owner_consent_attested_at_ms,'+
    'active,last_verified_at_ms) VALUES (?,?,?,?,1,?)'
   ).bind(m.userId,m.login,m.displayName,nowMs,nowMs))
  ];
  await env.DB.batch(statements);
  return {ok:true,enrolled:MAX,publicEnabled:publicEnabled(env)};
 }catch{return failed('pilot_save_unavailable')}
}

/** Private admin-only emergency withdrawal: no provider access necessary. */
export async function clearTwitchPilot(env){
 if(!env?.DB?.prepare)return failed('pilot_database_unavailable');
 try{
  await env.DB.prepare(
   'DELETE FROM recognition_twitch_pilot_meta WHERE slot=1'
  ).run();
  return {ok:true,cleared:true};
 }catch{return failed('pilot_clear_unavailable')}
}

/** Reverify only the two attested IDs using creator's stored Twitch OAuth. */
export async function refreshTwitchPilot(env,{
 now=Date.now,fetchImpl=fetch,force=false
}={}){
 if(!ready(env))return failed('pilot_disabled');
 const nowMs=now();
 if(!timeOK(nowMs))return failed('invalid_time');
 let meta;
 try{
  meta=await env.DB.prepare(
   'SELECT last_verified_at_ms,version FROM recognition_twitch_pilot_meta WHERE slot=1'
  ).first();
 }catch{return failed('pilot_schema_unavailable')}
 if(!meta)return failed('pilot_not_configured');
 if(!Number.isSafeInteger(meta.version)||meta.version<1)
  return failed('invalid_pilot_meta');
 if(!force&&timeOK(meta.last_verified_at_ms)&&
    nowMs>=meta.last_verified_at_ms&&
    nowMs-meta.last_verified_at_ms<MIN_REFRESH_MS)
  return {ok:true,refreshed:false};
 const lockUntil=nowMs+LOCK_MS;
 let claimed=false;
 try{
  const lock=await env.DB.prepare(
   'UPDATE recognition_twitch_pilot_meta SET refresh_lock_until_ms=? '+
   'WHERE slot=1 AND version=? AND '+
   '(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms<?) '+
   'RETURNING version'
  ).bind(lockUntil,meta.version,nowMs).first();
  if(!lock)return failed('pilot_refresh_busy_or_changed');
  claimed=true;
  const found=await env.DB.prepare(
   'SELECT twitch_user_id FROM recognition_twitch_pilot_members '+
   'ORDER BY twitch_user_id ASC LIMIT 3'
  ).all();
  const ids=(found?.results||[]).map(x=>x.twitch_user_id);
  if(ids.length!==MAX||ids.some(id=>!ID.test(id)))
   return failed('pilot_not_configured');
  const status=await readStoredTwitchSubscriptionStatus(env,{
   mode:'targeted',userIds:ids,fetchImpl,now
  });
  if(!status.ok)return failed(status.reason);
  if(!Array.isArray(status.checks)||status.checks.length!==MAX||
     status.checks.some(c=>!ids.includes(c.userId)||typeof c.active!=='boolean'))
   return failed('pilot_verification_inconsistent');
  // A concurrent enrollment, withdrawal or refresh must not be overwritten.
  const stmts=[
   env.DB.prepare(
    'UPDATE recognition_twitch_pilot_meta SET '+
    'last_verified_at_ms=CASE WHEN version=? AND refresh_lock_until_ms=? '+
    'AND last_verified_at_ms<? THEN ? ELSE -1 END,'+
    'version=version+1,refresh_lock_until_ms=NULL WHERE slot=1'
   ).bind(meta.version,lockUntil,nowMs,nowMs),
   ...status.checks.map(c=>env.DB.prepare(
    'UPDATE recognition_twitch_pilot_members SET active=?,last_verified_at_ms=? '+
    'WHERE twitch_user_id=?'
   ).bind(c.active?1:0,nowMs,c.userId))
  ];
  await env.DB.batch(stmts);
  claimed=false;
  return {ok:true,refreshed:true,checked:MAX};
 }catch{return failed('pilot_refresh_unavailable')}
 finally{
  if(claimed)try{
   await env.DB.prepare(
    'UPDATE recognition_twitch_pilot_meta SET refresh_lock_until_ms=NULL '+
    'WHERE slot=1 AND refresh_lock_until_ms=?'
   ).bind(lockUntil).run();
  }catch{/* Bounded lock expires. */}
 }
}

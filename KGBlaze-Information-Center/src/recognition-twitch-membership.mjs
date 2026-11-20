/**
 * Stage43 CP26 — scalable creator-owned Twitch subscription recognition.
 * Never conflate a temporary pilot simulation with recorded user consent.
 * No visitor login or Twitch bot is mounted. No public raw roster.
 */
import {readStoredTwitchRecognitionEvidence} from './recognition-twitch-connection.mjs';
import {MAX_TWITCH_TRACKED_MEMBERS,parseTwitchRecognitionConsentCommand}
 from './recognition-twitch-discovery.mjs';

export const RECOGNITION_PUBLIC_PATH='/api/public/recognition';
const TTL_MS=36*60*60*1000; // One daily run + reasonable retry grace.
const DAILY_MIN_MS=20*60*60*1000;
const LOCK_MS=10*60*1000;
const MAX_TRIAL_MS=7*24*60*60*1000;
const BAD=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const ID=/^[0-9]{1,24}$/;
const LOGIN=/^[a-zA-Z0-9_]{2,25}$/;
const fail=reason=>({ok:false,reason});
const validNow=n=>Number.isSafeInteger(n)&&n>0;
const ready=env=>env?.RECOGNITION_TWITCH_RECOGNITION_ENABLED==='true'&&
 typeof env.DB?.prepare==='function'&&typeof env.DB?.batch==='function'&&
 env.RECOGNITION_TWITCH_STATUS_ENABLED==='true';
const displayEnabled=env=>ready(env)&&env.RECOGNITION_TWITCH_PUBLIC_ENABLED==='true';
function isTrial(env,nowMs){
 if(!displayEnabled(env)||env.RECOGNITION_TWITCH_TRIAL_VISIBLE!=='true')
  return false;
 const until=Date.parse(env.RECOGNITION_TWITCH_TRIAL_UNTIL||'');
 return validNow(until)&&until>nowMs&&until-nowMs<=MAX_TRIAL_MS;
}
/** Public projection with no IDs, no login, no consent metadata, no counts. */
export async function readPublicTwitchRecognition(env,{nowMs=Date.now()}={}){
 if(!displayEnabled(env)||!validNow(nowMs))
  return {ok:true,twitch:[]};
 try{
  const trial=isTrial(env,nowMs);
  const result=await env.DB.prepare(
   'SELECT display_name,consent_state FROM recognition_twitch_memberships '+
   'WHERE active=1 AND last_checked_at_ms>? AND last_checked_at_ms<=? '+
   "AND (consent_state='approved'"+(trial?
    " OR consent_state='unasked'":'')+") "+
   'ORDER BY login COLLATE NOCASE LIMIT ?'
  ).bind(nowMs-TTL_MS,nowMs,MAX_TWITCH_TRACKED_MEMBERS).all();
  const entries=[];
  for(const row of result?.results||[]){
   if(typeof row.display_name!=='string'||!row.display_name||
      row.display_name.length>48||BAD.test(row.display_name)||
      !['unasked','approved'].includes(row.consent_state))continue;
   entries.push({displayName:row.display_name,
    ...(row.consent_state==='unasked'?{trial:true}:{})});
  }
  return {ok:true,twitch:entries};
 }catch{return {ok:true,twitch:[]}}
}
export async function readPrivateTwitchRecognitionStatus(env,{nowMs=Date.now()}={}){
 if(!ready(env))return fail('recognition_disabled');
 try{
  const meta=await env.DB.prepare(
   'SELECT last_success_at_ms,last_scan_partial,version '+
   'FROM recognition_twitch_membership_meta WHERE slot=1'
  ).first();
  const result=await env.DB.prepare(
   'SELECT consent_state,active,last_checked_at_ms FROM '+
   'recognition_twitch_memberships'
  ).all();
  const counts={tracked:0,active:0,approved:0,declined:0,unasked:0,
   publicEligible:0};
  const trial=isTrial(env,nowMs);
  for(const row of result?.results||[]){
   if(!['approved','declined','unasked'].includes(row.consent_state))
    return fail('invalid_consent_record');
   counts.tracked++;
   counts[row.consent_state]++;
   if(row.active===1){
    counts.active++;
    if(validNow(row.last_checked_at_ms)&&row.last_checked_at_ms<=nowMs&&
       nowMs-row.last_checked_at_ms<TTL_MS&&
       (row.consent_state==='approved'||
        trial&&row.consent_state==='unasked'))
     counts.publicEligible++;
   }
  }
  return {ok:true,initialized:!!meta,
   lastSuccessAt:validNow(meta?.last_success_at_ms)?
    new Date(meta.last_success_at_ms).toISOString():null,
   partial:!!meta?.last_scan_partial,
   publicEnabled:displayEnabled(env),trialEnabled:trial,counts};
 }catch{return fail('recognition_schema_unavailable')}
}
/**
 * Reuse the existing 03:00 local daily Cron or explicit owner POST.
 * Candidate enumeration may be partial; all known+observed IDs are checked
 * by filtered Helix. Negative results are accepted only from successful
 * filtered reads. Provider failure rolls back before ANY active change.
 */
export async function syncDailyTwitchRecognition(env,{
 now=Date.now,fetchImpl=fetch,force=false
}={}){
 if(!ready(env))return fail('recognition_disabled');
 const nowMs=now();
 if(!validNow(nowMs))return fail('invalid_time');
 let claimed=false,lockUntil=0;
 try{
  await env.DB.prepare(
   'INSERT OR IGNORE INTO recognition_twitch_membership_meta (slot) VALUES (1)'
  ).run();
  const meta=await env.DB.prepare(
   'SELECT version,last_success_at_ms FROM recognition_twitch_membership_meta '+
   'WHERE slot=1'
  ).first();
  if(!meta||!Number.isSafeInteger(meta.version)||meta.version<0)
   return fail('recognition_schema_unavailable');
  if(!force&&validNow(meta.last_success_at_ms)&&
     nowMs>=meta.last_success_at_ms&&
     nowMs-meta.last_success_at_ms<DAILY_MIN_MS)
   return {ok:true,refreshed:false};
  lockUntil=nowMs+LOCK_MS;
  const lock=await env.DB.prepare(
   'UPDATE recognition_twitch_membership_meta SET refresh_lock_until_ms=? '+
   'WHERE slot=1 AND version=? AND '+
   '(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms<?) '+
   'RETURNING version'
  ).bind(lockUntil,meta.version,nowMs).first();
  if(!lock)return fail('recognition_busy_or_changed');
  claimed=true;
  const old=await env.DB.prepare(
   'SELECT twitch_user_id FROM recognition_twitch_memberships '+ 
   'ORDER BY twitch_user_id LIMIT ?'
  ).bind(MAX_TWITCH_TRACKED_MEMBERS+1).all();
  const ids=(old?.results||[]).map(row=>row.twitch_user_id);
  if(ids.length>MAX_TWITCH_TRACKED_MEMBERS||
     ids.some(id=>typeof id!=='string'||!ID.test(id)))
   return fail('recognition_capacity_reached');
  const evidence=await readStoredTwitchRecognitionEvidence(env,{
   knownIds:ids,now,fetchImpl
  });
  if(!evidence.ok)return fail(evidence.reason);
  if(!Array.isArray(evidence.observations)||
     evidence.observations.length>MAX_TWITCH_TRACKED_MEMBERS)
   return fail('invalid_recognition_evidence');
  const known=new Set(ids),checked=new Set();
  const statements=[
   // Failing a version/lock check violates CHECK(last_success_at_ms>0),
   // atomically rolling back all membership updates in D1.batch().
   env.DB.prepare(
    'UPDATE recognition_twitch_membership_meta SET '+
    'last_success_at_ms=CASE WHEN version=? AND refresh_lock_until_ms=? '+
    'AND (last_success_at_ms IS NULL OR last_success_at_ms<?) '+
    'THEN ? ELSE -1 END,version=version+1,'+
    'last_scan_partial=?,refresh_lock_until_ms=NULL WHERE slot=1'
   ).bind(meta.version,lockUntil,nowMs,nowMs,evidence.partial?1:0)
  ];
  for(const entry of evidence.observations){
   if(!entry||!ID.test(entry.userId)||checked.has(entry.userId)||
      typeof entry.active!=='boolean')
    return fail('invalid_recognition_evidence');
   checked.add(entry.userId);
   if(known.has(entry.userId)){
    if(entry.login!==undefined){
     if(!LOGIN.test(entry.login)||typeof entry.displayName!=='string'||
        entry.displayName.length<1||entry.displayName.length>48||
        BAD.test(entry.displayName))
      return fail('invalid_recognition_evidence');
     statements.push(env.DB.prepare(
      'UPDATE recognition_twitch_memberships SET login=?,display_name=?,'+
      'active=?,last_checked_at_ms=?,last_seen_at_ms=CASE WHEN ?=1 '+
      'THEN ? ELSE last_seen_at_ms END WHERE twitch_user_id=?'
     ).bind(entry.login.toLowerCase(),entry.displayName,
      entry.active?1:0,nowMs,entry.active?1:0,nowMs,entry.userId));
    }else{
     statements.push(env.DB.prepare(
      'UPDATE recognition_twitch_memberships SET active=?,'+
      'last_checked_at_ms=?,last_seen_at_ms=CASE WHEN ?=1 '+
      'THEN ? ELSE last_seen_at_ms END WHERE twitch_user_id=?'
     ).bind(entry.active?1:0,nowMs,entry.active?1:0,nowMs,entry.userId));
    }
   }else{
    if(!entry.active||!LOGIN.test(entry.login||'')||
       typeof entry.displayName!=='string'||!entry.displayName||
       entry.displayName.length>48||BAD.test(entry.displayName))
     return fail('invalid_recognition_evidence');
    statements.push(env.DB.prepare(
     'INSERT INTO recognition_twitch_memberships '+
     '(twitch_user_id,login,display_name,consent_state,consent_source,'+
     'consent_at_ms,active,last_checked_at_ms,first_seen_at_ms,last_seen_at_ms) '+
     "VALUES (?,?,?,'unasked','none',NULL,1,?,?,?)"
    ).bind(entry.userId,entry.login.toLowerCase(),entry.displayName,
     nowMs,nowMs,nowMs));
   }
  }
  if(checked.size!==ids.length+
      evidence.observations.filter(e=>!known.has(e.userId)).length)
   return fail('incomplete_filtered_verification');
  await env.DB.batch(statements);
  const confirmed=await env.DB.prepare(
   'SELECT version,last_success_at_ms FROM recognition_twitch_membership_meta '+
   'WHERE slot=1'
  ).first();
  if(!confirmed||confirmed.last_success_at_ms!==nowMs||
     confirmed.version!==meta.version+1)
   return fail('postcommit_version_mismatch');
  claimed=false;
  return {ok:true,refreshed:true,checked:checked.size,
   partial:!!evidence.partial};
 }catch{return fail('recognition_sync_unavailable')}
 finally{
  if(claimed)try{
   await env.DB.prepare(
    'UPDATE recognition_twitch_membership_meta SET refresh_lock_until_ms=NULL '+
    'WHERE slot=1 AND refresh_lock_until_ms=?'
   ).bind(lockUntil).run();
  }catch{/* Fixed-expiry lock; cannot imply cancellation. */}
 }
}
/**
 * Owner-only manual preference; future chat adapter will use the verified
 * Twitch sender ID (NOT a client-provided login). No bot currently connected.
 */
export async function setTwitchRecognitionConsent(env,{
 login,state,source='owner_attested',attested=false,nowMs=Date.now()
}={}){
 if(!ready(env))return fail('recognition_disabled');
 if(typeof login!=='string'||!LOGIN.test(login)|| 
    !['unasked','approved','declined'].includes(state)||
    source!=='owner_attested'||attested!==true||!validNow(nowMs))
  return fail('invalid_consent_update');
 try{
  const result=await env.DB.prepare(
   'UPDATE recognition_twitch_memberships SET consent_state=?,'+
   "consent_source=CASE WHEN ?='unasked' THEN 'none' "+
   "ELSE 'owner_attested' END,"+
   "consent_at_ms=CASE WHEN ?='unasked' THEN NULL ELSE ? END "+
   'WHERE login=? COLLATE NOCASE'
  ).bind(state,state,state,nowMs,login).run();
  return result?.meta?.changes===1?
   {ok:true,updated:true,state}:
   fail('recognition_member_not_found');
 }catch{return fail('consent_store_unavailable')}
}
export async function handleAuthenticatedTwitchConsentCommand(env,{
 verifiedSenderId,message,verifiedTwitchTransport=false,nowMs=Date.now()
}={}){
 // NOT MOUNTED. A future bot/EventSub adapter MUST verify authenticity first.
 if(verifiedTwitchTransport!==true||typeof verifiedSenderId!=='string'||
    !ID.test(verifiedSenderId)||!validNow(nowMs))
  return fail('trusted_sender_required');
 const state=parseTwitchRecognitionConsentCommand(message);
 if(!state)return fail('not_a_recognition_command');
 if(!ready(env))return fail('recognition_disabled');
 try{
  const changed=await env.DB.prepare(
   'UPDATE recognition_twitch_memberships SET consent_state=?,'+
   "consent_source='verified_chat',consent_at_ms=? "+
   'WHERE twitch_user_id=?'
  ).bind(state,nowMs,verifiedSenderId).run();
  return changed?.meta?.changes===1?
   {ok:true,state}:fail('recognition_member_not_found');
 }catch{return fail('consent_store_unavailable')}
}

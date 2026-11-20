/**
 * Project Relight Stage 42 CP04 — OFFLINE deployment readiness checks.
 *
 * Inspects source, migration and Wrangler config ONLY; does not contact
 * Cloudflare, Twitch or YouTube, read secrets, or mutate local/remote D1.
 * Not a substitute for remote D1 schema, deployed Worker and admin review.
 *
 * Usage: node scripts/recognition-deploy-preflight.mjs
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>readFileSync(resolve(ROOT,name),'utf8');
const fail=[];
let checkCount=0;
function verify(ok,message){
 checkCount++;
 if(!ok)fail.push(message);
}
const wrangler=read('wrangler.toml');
const sql=read('migrations/recognition_twitch_oauth.sql');
const router=read('src/portal-route.mjs');
const oauth=read('src/recognition-twitch-oauth.mjs');
const worker=read('src/worker.mjs');
const controller=read('src/recognition-twitch-connection.mjs');
const activeStatus=read('src/recognition-twitch-active-status.mjs');
const twitchVerifier=read('src/recognition-private.mjs');
const youtubeVerifier=read('src/recognition-youtube-private.mjs');
const roster=read('src/recognition-twitch-roster-snapshot.mjs');
const cache=read('src/recognition-twitch-active-cache.mjs');
const cacheMigration=read('migrations/recognition_twitch_active_status.sql');
const currentVars=wrangler.split(/^\s*\[vars\]\s*$/m)[1]?.split(/^\s*\[/m)[0]||'';

verify(/^\s*name\s*=\s*"kgblaze-terminal"\s*$/m.test(wrangler),
 'unexpected Worker name');
verify(/^\s*binding\s*=\s*"DB"\s*$/m.test(wrangler),
 'D1 DB binding missing');
verify(/^\s*database_name\s*=\s*"kgblaze-terminal"\s*$/m.test(wrangler),
 'unexpected D1 database name');
verify(/^\s*database_id\s*=\s*"d48b2cf2-cb29-48f1-bb50-1d0a4f66ba37"\s*$/m.test(wrangler),
 'D1 database UUID was changed');
verify(/^\s*crons\s*=\s*\["\*\/5 \* \* \* \*", "0 9 \* \* \*"\]\s*$/m.test(wrangler),
 'original Terminal Cron triggers altered');
verify(/^\s*keep_vars\s*=\s*true\s*$/m.test(wrangler),
 'keep_vars lost — dashboard variables may be overwritten');


verify(/^\s*RECOGNITION_TWITCH_CACHE_ENABLED\s*=\s*"true"\s*$/m.test(currentVars),
 'CP16 manual private status cache is enabled after confirmed owner migration');
verify(!roster.includes("redirect:'error'")&&roster.includes("redirect:'manual'"),
 'private Twitch roster must never follow OAuth-bearing redirects');
verify(cache.includes("RECOGNITION_TWITCH_CACHE_ENABLED!=='true'"),
 'cache writer lost explicit OFF-by-default server gate');
verify(cache.includes("await env.DB.batch(statements)"),
 'private snapshot replacement must be atomic D1 batch');
verify(cache.includes("THEN excluded.last_completed_at_ms ELSE -1 END")&&
 cache.includes("snapshot_version=recognition_twitch_active_status_meta.snapshot_version+1"),
 'private cache must use DB-enforced monotonic CAS to reject competing stale syncs');
verify(cacheMigration.includes("CHECK(last_completed_at_ms > 0)"),
 'monotonic D1 write guard requires the existing positive-timestamp CHECK constraint');
verify(!worker.includes("scheduledTwitchRecognitionSync")&&
 !worker.includes("publicTwitchSubscriberRoster"),
 'automatic or public subscriber status must not be activated with manual cache');
verify(worker.includes("sync-private-subscriber-cache")&&
 worker.includes("syncStoredTwitchActiveSubscribers"),
 'private cache sync endpoint missing admin confirmation');
verify(router.includes("'/departures/api/admin/recognition/twitch/sync-status-cache':['POST']")&&
 router.includes("'/api/admin/recognition/twitch/sync-status-cache'"),
 'private cache sync is not explicitly routed');
verify(!router.includes("'/api/admin/recognition/twitch/sync-status-cache':['POST']"),
 'root cache sync alias MUST remain blocked');
verify(!/^\s*(INSERT|UPDATE|DELETE|DROP|ALTER)\s+(?:INTO|FROM|TABLE)?\s*(?:terminal_|recognition_twitch_oauth)/im.test(cacheMigration),
 'cache migration attempts to modify editorial or OAuth records');
verify((cacheMigration.match(/CREATE TABLE IF NOT EXISTS/g)||[]).length===2,
 'cache migration must create exactly two isolated tables');
verify((cacheMigration.match(/ON DELETE CASCADE/g)||[]).length===2&&
 cacheMigration.includes('REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE')&&
 cacheMigration.includes('REFERENCES recognition_twitch_active_status_meta(slot) ON DELETE CASCADE'),
 'private subscriber cache must be cascade-deleted when owner OAuth disconnects');
verify(cacheMigration.includes('recognition_twitch_active_subscribers')&&
 cacheMigration.includes('recognition_twitch_active_status_meta'),
 'cache migration missing private tables');
verify(oauth.includes("export const TWITCH_OWNER_CALLBACK_PATH='/twitch/oauth/callback'"),
 'historical callback path changed');
verify(oauth.includes("https://kgblaze.dpdns.org'+TWITCH_OWNER_CALLBACK_PATH"),
 'historical callback host changed');
verify(wrangler.includes('"/twitch/oauth/callback"'),
 'callback missing from run_worker_first');
verify(router.includes("'/twitch/oauth/callback':['GET']"),
 'router callback changed or missing');
for(const action of ['start','status','refresh','subscription-summary','check-subscribers','disconnect']){
 const route='/departures/api/admin/recognition/twitch/'+action;
 verify(router.includes("'"+route+"':["),'protected '+action+' route missing');
 verify(router.includes("'/api/admin/recognition/twitch/"+action+"'"),
  'internal '+action+' route missing from allowlist');
}
verify(!router.includes("'/api/admin/recognition/twitch/disconnect':['POST']"),
 'root admin alias accidentally exposed on custom domain');
verify(!router.includes("'/api/admin/recognition/twitch/subscription-summary':['GET']")&&
 !router.includes("'/api/admin/recognition/twitch/check-subscribers':['POST']"),
 'root subscriber status admin aliases accidentally exposed');
verify(activeStatus.includes("redirect:'manual'")&&
 activeStatus.includes("https://api.twitch.tv/helix/subscriptions"),
 'Twitch active status verifier changed or can follow redirects');
verify(worker.includes("read-subscription-status")&&
 worker.includes("readStoredTwitchSubscriptionStatus"),
 'private active subscriptions handler missing explicit read gate');
verify(!worker.includes("RECOGNITION_TWITCH_STATUS_ENABLED==='true'")&&
 controller.includes("env.RECOGNITION_TWITCH_STATUS_ENABLED!=='true'"),
 'subscriber status flag must gate private server-side controller');
verify(worker.includes("if(!await authorized(req,env))"),
 'Worker lost bearer authorization');
verify(worker.includes("X-Relight-Recognition-Confirm"),
 'disconnect lost explicit confirmation gate');
verify(worker.includes("env.RECOGNITION_TWITCH_OAUTH_ENABLED!=='true'"),
 'callback fail-closed gate missing');
verify(!/redirect\s*:\s*['"]error['"]/.test(oauth+'\n'+controller),
 'unsupported redirect:error breaks Cloudflare Workers Twitch outbound fetch');
verify((oauth.match(/redirect\s*:\s*['"]manual['"]/g)||[]).length===2,
 'Twitch token exchange and token validation must use manual redirect');
verify((controller.match(/redirect\s*:\s*['"]manual['"]/g)||[]).length===1,
 'Twitch owner token revocation must reject redirects');
verify(controller.includes('readStoredTwitchRecognitionEvidence')&&
 controller.includes('discoverTwitchRecognitionCandidates'),
 'Twitch recognition must use owner-only positive discovery and filtered verification');
verify(!/redirect\s*:\s*['"]error['"]/.test(twitchVerifier+'\n'+youtubeVerifier),
 'unmounted membership verifier still contains Cloudflare unsupported redirect:error');
verify((twitchVerifier.match(/redirect\s*:\s*['"]manual['"]/g)||[]).length===2,
 'private Twitch subscription verifier must reject redirects in both fetch calls');
verify((youtubeVerifier.match(/redirect\s*:\s*['"]manual['"]/g)||[]).length===1,
 'private YouTube member verifier must reject redirects');
verify(controller.includes("RECOGNITION_TWITCH_TOKEN_KEY_B64"),
 'recognition encryption secret lookup missing');
verify(controller.includes("'AES-GCM'"),
 'token encryption unexpectedly removed');
verify(controller.includes('DELETE FROM recognition_twitch_oauth_states'),
 'disconnect no longer invalidates outstanding states');
verify(controller.includes('DELETE FROM recognition_twitch_oauth_credentials'),
 'disconnect no longer removes encrypted credentials');
verify(/^\s*TWITCH_RECOGNITION_BROADCASTER_ID\s*=\s*"70386764"\s*$/m.test(currentVars),
 'expected public Twitch broadcaster ID missing or changed in [vars]');
verify(/^\s*RECOGNITION_TWITCH_OAUTH_ENABLED\s*=\s*"true"\s*$/m.test(currentVars),
 'CP05 must explicitly enable owner-only OAuth after verified D1/secret gates');
verify(/^\s*RECOGNITION_TWITCH_STATUS_ENABLED\s*=\s*"true"\s*$/m.test(currentVars),
 'CP13 explicit admin-only read status flag missing in [vars]');
verify(/^\s*RECOGNITION_TWITCH_RECOGNITION_ENABLED\s*=\s*"true"\s*$/m.test(currentVars)&&
 /^\s*RECOGNITION_TWITCH_PUBLIC_ENABLED\s*=\s*"true"\s*$/m.test(currentVars)&&
 /^\s*RECOGNITION_TWITCH_TRIAL_VISIBLE\s*=\s*"true"\s*$/m.test(currentVars)&&
 /^\s*RECOGNITION_TWITCH_TRIAL_UNTIL\s*=\s*"2026-11-22T09:00:00.000Z"\s*$/m.test(currentVars),
 'CP28 may enable public recognition only during the exact owner-authorized time-boxed trial');
const trialUntil=Date.parse('2026-11-22T09:00:00.000Z');
verify(trialUntil>Date.now()&&trialUntil-Date.now()<=7*24*60*60*1000,
 'public test consent simulation has expired or exceeds the seven-day guard; disable trial/publication');
verify(worker.includes("sync-daily-recognition")&&
 worker.includes("change-recognition-consent")&&
 worker.includes("SOCIAL_PREVIEW_CRON"),
 'scalable private recognition, consent update and the 03:00 slot missing');
verify(!worker.includes("if(env.RECOGNITION_TWITCH_PILOT_ENABLED==="),
 'every-five-minute Twitch pilot polling must remain removed');
verify(!worker.includes("scheduledTwitchRecognitionSync")&&
 !worker.includes("publicTwitchSubscriberRoster"),
 'global subscriber roster or uncapped public enumeration must remain unmounted');
verify(!/^\s*(TWITCH_CLIENT_SECRET|RECOGNITION_TWITCH_TOKEN_KEY_B64|ADMIN_TOKEN)\s*=/m.test(wrangler),
 'a secret variable was committed to wrangler.toml');

const tables=[...sql.matchAll(/\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi)].map(x=>x[1]);
verify(tables.length===2 && tables.includes('recognition_twitch_oauth_states') &&
 tables.includes('recognition_twitch_oauth_credentials'),
 'migration must contain exactly the two dedicated OAuth tables');
verify(!/\b(ALTER|DROP)\s+TABLE\b/i.test(sql),
 'migration attempts to alter/drop existing tables');
verify(!/\b(INSERT|UPDATE|DELETE)\s+(?:INTO|FROM)?\s*(terminal_state|terminal_audit|recognition_optins)\b/i.test(sql),
 'migration references production editorial/consent rows');
verify(/consumed_at_ms/.test(sql) && /refresh_lock_until_ms/.test(sql),
 'missing single-use-state or refresh lock columns');

const result={
 step:'Stage42 CP05 explicit owner-OAuth activation preflight',
 passed:fail.length===0,
 checked:'source, router, wrangler and scoped migration ONLY',
 remoteCloudflareChecked:false,
 ownerOAuthFlagConfigured:true,
 ownerOnlyStatusFlagConfigured:true,
 publicSubscriberEnumerationEnabled:false,
 subscriberEnumerationEnabled:false,
 privateSubscriberCacheEnabled:true,
 privateSubscriberSyncMode:'admin-confirmed-manual-only',
 remoteSchemaModified:false,
 deployed:false,
 credentialsUsed:false,
 items:checkCount,
 failures:fail
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if(fail.length)process.exitCode=1;

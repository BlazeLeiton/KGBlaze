/**
 * Stage 7: internally scheduled YouTube synchronization.
 * Entirely inert unless YOUTUBE_SYNC_ENABLED is true, independently of
 * YOUTUBE_PREVIEW_ENABLED. No public HTTP endpoint can invoke this writer.
 */
import {readYouTubePreviewEvidence,readYouTubeKnownVideos} from '../experiments/youtube-matching/read-only-source.mjs';
import {activeYouTubeEvents,editorialIdentity,buildTrustedYouTubeObservations,
 applyTrustedYouTubeObservations} from '../experiments/youtube-matching/trusted-sync.mjs';

const OWN_CHANNEL='UCRd_uwPjrsf6Z3CRXwNehEQ';
const ID=/^[A-Za-z0-9_-]{11}$/;
const SOURCE='youtube_data_api_v3';

export async function runScheduledYouTubeSync(env,{now=new Date(),slot=now,fetchImpl=fetch}={}){
 if(env?.YOUTUBE_SYNC_ENABLED!=='true')return {ok:false,reason:'disabled'};
 if(!env.DB||!env.YOUTUBE_API_KEY||env.YOUTUBE_CHANNEL_ID!==OWN_CHANNEL||
    typeof env.YOUTUBE_PREVIEW_LIMITER?.limit!=='function'||
    !(now instanceof Date)||!Number.isFinite(now.getTime())||
    !(slot instanceof Date)||!Number.isFinite(slot.getTime()))
  return {ok:false,reason:'not_configured'};
 // Cloudflare binding guards bursts; upstream credential stays secret.
 let limiter;
 try {limiter=await env.YOUTUBE_PREVIEW_LIMITER.limit({key:'terminal-youtube-auto-sync'});}
 catch{return {ok:false,reason:'limiter_unavailable'};}
 if(limiter?.success!==true)return {ok:false,reason:'limited'};
 const row=await env.DB.prepare('SELECT revision,editorial_json,sync_json FROM terminal_state WHERE id=1').first();
 if(!row)return {ok:false,reason:'unpublished'};
 const agenda=JSON.parse(row.editorial_json);
 const oldSync=JSON.parse(row.sync_json||'{}');
 const relevant=activeYouTubeEvents(agenda,now);
 if(!relevant.length)return {ok:true,reason:'no_nearby_youtube_events',writes:0};
 // Trust no arbitrary IDs from sync JSON: they must be from this writer,
 // bound to the current editorial identity, verified and same source.
 const knownIds=[...new Set(relevant.flatMap(e=>{
  const remembered=oldSync?.[e.id]?.youtube;
  if(ID.test(e.videoId||''))return [e.videoId];
  if(remembered?.source===SOURCE&&remembered.verified===true&&
     remembered.matchConfirmed===true&&remembered.editorialIdentity===editorialIdentity(e)&&
     ID.test(remembered.videoId||''))return [remembered.videoId];
  return [];
 }))];
 // Search at most once each UTC hour: 24 x 2 search.list calls/day.
 // Intermediate 5-minute slots refresh known IDs via videos.list only.
 // Cron may execute late: use the Cloudflare scheduledTime, not wall-clock
 // invocation minute, to preserve precisely one hourly discovery slot.
 const discover=slot.getUTCMinutes()===0;
 if(!discover&&!knownIds.length)return {ok:true,reason:'await_discovery_slot',writes:0};
 const options={ownedChannelId:OWN_CHANNEL,apiKey:env.YOUTUBE_API_KEY,fetchImpl,now:()=>now};
 const evidence=discover
  ?await readYouTubePreviewEvidence({...options,explicitVideoIds:knownIds})
  :await readYouTubeKnownVideos({...options,videoIds:knownIds});
 const focused={...agenda,events:relevant};
 const plan=buildTrustedYouTubeObservations(focused,evidence,{
  ownedChannelId:OWN_CHANNEL,existingSync:oldSync,now
 });
 const {next,changed}=applyTrustedYouTubeObservations(oldSync,plan.observations);
 if(!changed)return {ok:true,reason:'no_confirmed_observations',writes:0,blocked:plan.blocked};
 // Compare-and-swap avoids writing stale status over a concurrent publication
 // or a different scheduled writer's update. Never touch editorial revision.
 const written=await env.DB.prepare(
  'UPDATE terminal_state SET sync_json=? WHERE id=1 AND revision=? AND sync_json=?'
 ).bind(JSON.stringify(next),row.revision,row.sync_json).run();
 if(written?.meta?.changes!==1)return {ok:false,reason:'concurrent_update',writes:0};
 await env.DB.prepare(
  "INSERT INTO terminal_audit (revision,source,happened_at,note) VALUES (?,'platform',?,?)"
 ).bind(row.revision,now.toISOString(),'YouTube provider observation: '+changed+' events').run();
 return {ok:true,reason:'verified_observations_written',writes:changed};
}

/**
 * Preview-only composition: source evidence -> candidate proposals.
 * Not imported by Terminal Worker or visor, and cannot produce trusted sync.
 */
import {matchYouTubeAgenda} from './matcher.mjs';
import {readYouTubePreviewEvidence} from './read-only-source.mjs';

const STOP=new Set(['CANCELADO','DESCANSO','ESCALA','HIATUS']);
const VIDEO_ID=/^[A-Za-z0-9_-]{11}$/;
const timestamp=v=>{
 if(typeof v!=='string'||!/(?:Z|[+-]\d\d:\d\d)$/.test(v))return NaN;
 return Date.parse(v);
};
function signal(video) {
 const label=video?.snippet?.liveBroadcastContent;
 const details=video?.liveStreamingDetails||{};
 const start=timestamp(details.actualStartTime),end=timestamp(details.actualEndTime);
 const scheduled=timestamp(details.scheduledStartTime);
 if(label==='live'&&Number.isFinite(start)&&!Number.isFinite(end))return 'live_unverified';
 if(label==='upcoming'&&Number.isFinite(scheduled)&&!Number.isFinite(start)&&!Number.isFinite(end))return 'upcoming_unverified';
 if(label==='none'&&Number.isFinite(start)&&Number.isFinite(end)&&end>=start)return 'ended_unverified';
 return 'inconsistent_unverified';
}
/** Candidate ≠ matchConfirmed and ≠ verified. Never return a sync object. */
export function buildYouTubePreflight(agenda,evidence,{ownedChannelId,now=new Date()}={}) {
 if(agenda?.schema!=='relight-public-v1'||!Array.isArray(agenda.events))throw Error('INVALID_EDITORIAL_INPUT');
 if(agenda.events.length>200||!evidence||!Array.isArray(evidence.resources)||evidence.resources.length>150)throw Error('INVALID_PREVIEW_INPUT');
 const time=now instanceof Date?now.getTime():NaN,age=time-timestamp(evidence.fetchedAt);
 if(!Number.isFinite(time))throw Error('INVALID_PREVIEW_TIME');
 const fresh=Number.isFinite(age)&&age>=-30000&&age<=300000;
 const trusted=typeof ownedChannelId==='string'&&ownedChannelId.length>0&&evidence.ownedChannelId===ownedChannelId;
 const matches=matchYouTubeAgenda(agenda.events,evidence.resources,{ownedChannelId:trusted?ownedChannelId:undefined});
 const data=new Map(evidence.resources.filter(r=>typeof r?.id==='string'&&VIDEO_ID.test(r.id)).map(r=>[r.id,r]));
 // Separate IDs actually found by search.list from IDs read only because the
 // editor already knew them. Otherwise a "no-ID discovery" probe is misleading.
 const discoveredOk=Array.isArray(evidence.discoveredVideoIds)&&evidence.discoveredVideoIds.length<=150&&
   evidence.discoveredVideoIds.every(id=>typeof id==='string'&&VIDEO_ID.test(id));
 const discovered=new Set(discoveredOk?evidence.discoveredVideoIds:[]);
 const discoverableResources=evidence.resources.filter(r=>discovered.has(r?.id));
 const withoutManualIds=agenda.events.map(e=>({...e,videoId:undefined}));
 const autonomous=discoveredOk?matchYouTubeAgenda(withoutManualIds,discoverableResources,{ownedChannelId:trusted?ownedChannelId:undefined}):null;
 const items=matches.map((m,i)=>{
  const ev=agenda.events[i],applicable=ev?.platforms?.includes('yt')&&!STOP.has(ev.status);
  let item;
  if(!applicable)item={...m,evidenceSignal:'not_applicable'};
  else if(!trusted)item={...m,decision:'review',reason:'untrusted_channel_configuration',evidenceSignal:'blocked'};
  else if(!fresh)item={...m,decision:'review',reason:'stale_or_missing_evidence_timestamp',evidenceSignal:'blocked'};
  else if(m.decision!=='candidate')item={...m,evidenceSignal:'blocked'};
  else if(evidence.discoveryComplete!==true)item={...m,decision:'review',reason:'source_discovery_incomplete',evidenceSignal:'blocked'};
  else {
   const state=signal(data.get(m.videoId));
   item=state==='inconsistent_unverified'
    ?{...m,decision:'review',reason:'inconsistent_platform_metadata',evidenceSignal:state}
    :{...m,evidenceSignal:state};
  }
  // Diagnostic-only probe for already-linked streams; never change item.
  // A clean result must come from search-discovered IDs, not videos.list by ID.
  if(!applicable||!VIDEO_ID.test(ev?.videoId||''))return item;
  let probe;
  if(!trusted)probe={decision:'review',reason:'untrusted_channel_configuration'};
  else if(!fresh)probe={decision:'review',reason:'stale_or_missing_evidence_timestamp'};
  else if(evidence.discoveryComplete!==true)probe={decision:'review',reason:'source_discovery_incomplete'};
  else if(!autonomous)probe={decision:'not_evaluated',reason:'search_origin_ids_unavailable'};
  else {
   const candidate=autonomous[i];
   probe=candidate.decision==='candidate'&&candidate.videoId!==ev.videoId
    ?{decision:'review',reason:'autonomous_editorial_id_conflict'}
    :{decision:candidate.decision,reason:candidate.reason,...(candidate.videoId?{videoId:candidate.videoId}:{})};
   if(probe.decision==='candidate'&&signal(data.get(probe.videoId))==='inconsistent_unverified')
    probe={decision:'review',reason:'inconsistent_platform_metadata'};
  }
  return {...item,autonomousProbe:probe};
 });
 const count=n=>Number.isSafeInteger(n)&&n>=0?n:null;
 const discovery=evidence.discovery||{};
 const validOwnedBroadcasts=evidence.resources.filter(v=>
   v?.snippet?.channelId===ownedChannelId&&v?.liveStreamingDetails&&
   typeof v.liveStreamingDetails==='object'&&!Array.isArray(v.liveStreamingDetails)
 ).length;
 return {
  schema:'relight-youtube-preflight-v1',revision:Number.isInteger(agenda.revision)?agenda.revision:null,
  safeToApply:false,directSyncWrites:0,
  // Distinguishes no discovered upcoming/live rooms from rooms rejected by strict matching.
  // No titles, video IDs, raw provider payloads, or secrets are added to this summary.
  evidenceSummary:{
    searchedEventTypes:['upcoming','live'],
    searchResults:{upcoming:count(discovery.searchResults?.upcoming),live:count(discovery.searchResults?.live)},
    uniqueDiscoveredVideoIds:count(discovery.uniqueDiscoveredVideoIds),
    explicitEditorialVideoIds:count(discovery.explicitEditorialVideoIds),
    videoResources:evidence.resources.length,ownedBroadcastResources:validOwnedBroadcasts,
    discoveryComplete:evidence.discoveryComplete===true
  },items
 };
}
/**
 * Explicit manual use only. No credentials in source, no API route, no Cron.
 */
export async function runManualYouTubePreflight(agenda,{ownedChannelId,apiKey,fetchImpl,now=()=>new Date(),maxResults=20}={}) {
 if(agenda?.schema!=='relight-public-v1'||!Array.isArray(agenda.events))throw Error('INVALID_EDITORIAL_INPUT');
 const ids=[...new Set(agenda.events.filter(e=>e?.platforms?.includes('yt')&&!STOP.has(e.status)&&VIDEO_ID.test(e.videoId||'')).map(e=>e.videoId))];
 const evidence=await readYouTubePreviewEvidence({ownedChannelId,apiKey,fetchImpl,explicitVideoIds:ids,maxResults,now});
 return buildYouTubePreflight(agenda,evidence,{ownedChannelId,now:now()});
}

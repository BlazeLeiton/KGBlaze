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
 const items=matches.map((m,i)=>{
  const ev=agenda.events[i],applicable=ev?.platforms?.includes('yt')&&!STOP.has(ev.status);
  if(!applicable)return {...m,evidenceSignal:'not_applicable'};
  if(!trusted)return {...m,decision:'review',reason:'untrusted_channel_configuration',evidenceSignal:'blocked'};
  if(!fresh)return {...m,decision:'review',reason:'stale_or_missing_evidence_timestamp',evidenceSignal:'blocked'};
  if(m.decision!=='candidate')return {...m,evidenceSignal:'blocked'};
  if(evidence.discoveryComplete!==true)return {...m,decision:'review',reason:'source_discovery_incomplete',evidenceSignal:'blocked'};
  const state=signal(data.get(m.videoId));
  if(state==='inconsistent_unverified')return {...m,decision:'review',reason:'inconsistent_platform_metadata',evidenceSignal:state};
  return {...m,evidenceSignal:state};
 });
 return {
  schema:'relight-youtube-preflight-v1',revision:Number.isInteger(agenda.revision)?agenda.revision:null,
  safeToApply:false,directSyncWrites:0,items
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

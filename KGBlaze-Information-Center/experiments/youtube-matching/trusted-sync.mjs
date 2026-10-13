/**
 * Promote server-fetched YouTube Data API evidence to *fresh* observations
 * compatible with the public viewer. This is not the preflight response.
 *
 * The server alone may invoke this function. Client-provided "verified"
 * objects are never accepted as evidence. No completion without OAuth
 * liveBroadcasts.status.lifeCycleStatus === "complete".
 */
import {buildYouTubePreflight} from './preflight.mjs';
import {cdmxInstant} from './matcher.mjs';

const VIDEO_ID=/^[A-Za-z0-9_-]{11}$/;
const STOP=new Set(['CANCELADO','DESCANSO','ESCALA','HIATUS']);
const TRUSTED_SOURCE='youtube_data_api_v3';
const checked=at=>typeof at==='string'&&/Z$/.test(at)&&Number.isFinite(Date.parse(at));
export const editorialIdentity=e=>JSON.stringify([
 e?.day||'',e?.time||'',e?.title||'',e?.category||'',
 Array.isArray(e?.platforms)?[...e.platforms].sort():[],
 e?.videoId||''
]);
const sourceValid=(sample,at,now)=>{
 if(!sample||typeof sample!=='object'||!checked(at))return false;
 const age=now.getTime()-Date.parse(at);
 return age>=-30000&&age<=300000;
};
function trustedCachedId(event,existingSync){
 const known=existingSync?.[event.id]?.youtube;
 if(event.videoId&&VIDEO_ID.test(event.videoId))return event.videoId;
 return known?.source===TRUSTED_SOURCE&&known.matchConfirmed===true&&
  known.verified===true&&known.editorialIdentity===editorialIdentity(event)&&
  VIDEO_ID.test(known.videoId||'')?known.videoId:null;
}
export function buildTrustedYouTubeObservations(agenda,evidence,{
 ownedChannelId,existingSync={},now=new Date()
}={}) {
 if(agenda?.schema!=='relight-public-v1'||!Array.isArray(agenda.events)||agenda.events.length>200||
    !evidence||!Array.isArray(evidence.resources)||!(now instanceof Date)||
    !Number.isFinite(now.getTime()))throw Error('INVALID_TRUSTED_SYNC_INPUT');
 const out={observations:{},considered:0,blocked:0};
 if(evidence.discoveryComplete!==true||evidence.ownedChannelId!==ownedChannelId||
    typeof ownedChannelId!=='string'||!/^UC[A-Za-z0-9_-]{22}$/.test(ownedChannelId)||
    !sourceValid(evidence,evidence.fetchedAt,now)){
  out.blocked=agenda.events.length;return out;
 }
 const annotated=agenda.events.map(ev=>{
  const known=trustedCachedId(ev,existingSync);
  return known&&!ev.videoId?{...ev,videoId:known}:ev;
 });
 const report=buildYouTubePreflight({...agenda,events:annotated},evidence,{ownedChannelId,now});
 const byId=new Map(evidence.resources.map(x=>[x?.id,x]));
 for(let i=0;i<agenda.events.length;i++){
  const event=agenda.events[i],match=report.items[i];
  if(!event?.platforms?.includes('yt')||STOP.has(event.status))continue;
  out.considered++;
  if(match?.decision!=='candidate'||!VIDEO_ID.test(match.videoId||'')){
   out.blocked++;continue;
  }
  const resource=byId.get(match.videoId),s=resource?.snippet,d=resource?.liveStreamingDetails;
  if(s?.channelId!==ownedChannelId||!d||typeof d!=='object'){
   out.blocked++;continue;
  }
  let status=null;
  const scheduledAt=d.scheduledStartTime,actualStart=d.actualStartTime;
  if(match.evidenceSignal==='upcoming_unverified'&&
    checked(scheduledAt)&&!actualStart&&!d.actualEndTime&&s.liveBroadcastContent==='upcoming'){
   status='upcoming';
  }
  if(match.evidenceSignal==='live_unverified'&&
    checked(actualStart)&&!d.actualEndTime&&s.liveBroadcastContent==='live'&&
    Date.parse(actualStart)<=now.getTime()+30000&&
    now.getTime()-Date.parse(actualStart)<=48*3600*1000){
   status='live';
  }
  if(!status){out.blocked++;continue;}
  const observation={
   source:TRUSTED_SOURCE,verified:true,matchConfirmed:true,
   checkedAt:evidence.fetchedAt,status,videoId:match.videoId,
   videoUrl:'https://youtu.be/'+match.videoId,
   editorialIdentity:editorialIdentity(event)
  };
  if(checked(scheduledAt))observation.scheduledAt=scheduledAt;
  // Never add 'completed', 'endedAt', 'actualEndTime' or lifeCycleStatus.
  // YouTube Data videos.list does not provide authenticated broadcast lifecycle.
  out.observations[event.id]=observation;
 }
 return out;
}

/** Only trusted, fresh observations are merged, leaving other platforms alone. */
export function applyTrustedYouTubeObservations(sync={},observations={}){
 const next={...sync};
 let changed=0;
 for(const [id,youtube] of Object.entries(observations)){
  if(typeof id!=='string'||!id||!youtube||youtube.source!==TRUSTED_SOURCE||
     youtube.verified!==true||youtube.matchConfirmed!==true||
     !['live','upcoming'].includes(youtube.status)||!VIDEO_ID.test(youtube.videoId||''))continue;
  next[id]={...(next[id]||{}),youtube};
  changed++;
 }
 return {next,changed};
}

/** Prevent pointless polling far outside the nearby broadcast window. */
export function activeYouTubeEvents(agenda,now=new Date()){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))return [];
 return (agenda?.events||[]).filter(e=>{
  if(!e?.platforms?.includes('yt')||STOP.has(e.status))return false;
  const start=cdmxInstant(e.day,e.time);
  return start!==null&&start-now.getTime()<=24*3600*1000&&
    now.getTime()-start<=8*3600*1000;
 });
}

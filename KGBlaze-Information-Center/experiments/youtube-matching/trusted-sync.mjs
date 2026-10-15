/**
 * Promote server-fetched YouTube Data API evidence to *fresh* observations
 * compatible with the public viewer. This is not the preflight response.
 *
 * The server alone may invoke this function. Client-provided "verified"
 * objects are never accepted as evidence. Completion requires authoritative
 * videos.list actualStartTime + actualEndTime, liveBroadcastContent === 'none',
 * trusted event identity and a fresh response; never infer an OAuth lifecycle.
 */
import {buildYouTubePreflight} from './preflight.mjs';
import {cdmxInstant} from './matcher.mjs';

const VIDEO_ID=/^[A-Za-z0-9_-]{11}$/;
const STOP=new Set(['CANCELADO','DESCANSO','ESCALA','HIATUS']);
const TRUSTED_SOURCE='youtube_data_api_v3';
// YouTube actualEndTime + 'none' confirms finality: no Twitch-style grace.
// Twitch-only retains its separate 15-minute reconnection guard in src/core.mjs.
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
 ownedChannelId,existingSync={},now=new Date(),allowCompletion=false
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
  const completedAt=d.actualEndTime;
  let completion=null;
  // Video Data API exposes actualEndTime only after the broadcast ends.
  // 'none' + real start/end timestamps + owned channel + known video ID
  // must agree. A missing LIVE sample or vanished search result NEVER
  // proves a completed broadcast. Once YouTube explicitly confirms its end,
  // publish on this sync cycle without a Twitch-style restart delay.
  if(allowCompletion===true&&match.evidenceSignal==='ended_unverified'){
   const startMs=Date.parse(actualStart||''),endMs=Date.parse(completedAt||'');
   const identity=trustedCachedId(event,existingSync);
   if(identity===match.videoId&&checked(actualStart)&&checked(completedAt)&&
      Number.isFinite(startMs)&&Number.isFinite(endMs)&&
      startMs<=endMs&&endMs<=now.getTime()&&
      now.getTime()-endMs<=48*3600*1000&&
      s.liveBroadcastContent==='none'){
    status='completed';
    completion={lifeCycleStatus:'complete',actualEndTime:completedAt,
     endedAt:completedAt,completionEvidence:'videos_list_actual_end_time'};
   }
  }
  if(!status&&match.evidenceSignal==='upcoming_unverified'&&
    checked(scheduledAt)&&!actualStart&&!completedAt&&s.liveBroadcastContent==='upcoming'){
   status='upcoming';
  }
  if(!status&&match.evidenceSignal==='live_unverified'&&
    checked(actualStart)&&!completedAt&&s.liveBroadcastContent==='live'&&
    Date.parse(actualStart)<=now.getTime()+30000&&
    now.getTime()-Date.parse(actualStart)<=48*3600*1000){
   status='live';
  }
  if(!status){out.blocked++;continue;}
  const observation={
   source:TRUSTED_SOURCE,verified:true,matchConfirmed:true,
   checkedAt:evidence.fetchedAt,status,videoId:match.videoId,
   videoUrl:'https://youtu.be/'+match.videoId,
   editorialIdentity:editorialIdentity(event),
   ...(completion||{})
  };
  if(checked(scheduledAt))observation.scheduledAt=scheduledAt;
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
     !['live','upcoming','completed'].includes(youtube.status)||!VIDEO_ID.test(youtube.videoId||''))continue;
  if(youtube.status==='completed'&&!(
    youtube.lifeCycleStatus==='complete'&&
    youtube.completionEvidence==='videos_list_actual_end_time'&&
    checked(youtube.actualEndTime)&&youtube.endedAt===youtube.actualEndTime
  ))continue;
  // A verified terminal observation is immutable for that editorial identity.
  // A stale subsequent 'upcoming/live' request can never resurrect the room.
  const prior=next[id]?.youtube;
  if(prior?.status==='completed'&&prior?.source===TRUSTED_SOURCE&&
     prior.verified===true&&prior.matchConfirmed===true&&
     prior.editorialIdentity===youtube.editorialIdentity)continue;
  if(prior&&prior.source===TRUSTED_SOURCE&&prior.verified===true&&
     prior.matchConfirmed===true&&prior.editorialIdentity===youtube.editorialIdentity&&
     Number.isFinite(Date.parse(prior.checkedAt||''))&&
     Date.parse(prior.checkedAt)>Date.parse(youtube.checkedAt||''))continue;
  next[id]={...(next[id]||{}),youtube};
  changed++;
 }
 return {next,changed};
}

/** Allow early room matching up to 72 hours ahead, while retaining the 8-hour post-start bound. */
export function activeYouTubeEvents(agenda,now=new Date()){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))return [];
 return (agenda?.events||[]).filter(e=>{
  if(!e?.platforms?.includes('yt')||STOP.has(e.status))return false;
  const start=cdmxInstant(e.day,e.time);
  return start!==null&&start-now.getTime()<=72*3600*1000&&
    now.getTime()-start<=8*3600*1000;
 });
}

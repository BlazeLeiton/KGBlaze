/**
 * Project Relight / Stage 44: independent, owner-channel live discovery.
 * Uses only public broadcasts, existing server credentials and terminal_state
 * sync_json. Never writes editorial_json, revision, or membership data.
 */
import {editorialIdentity} from '../experiments/youtube-matching/trusted-sync.mjs';
export const ACTIVE_BROADCASTS_KEY='__kgblaze_active_broadcasts_v1';
export const ACTIVE_BROADCAST_ID_PREFIX='auto-live:';
const YT_CHANNEL='UCRd_uwPjrsf6Z3CRXwNehEQ';
const TW_USER='70386764';
const VIDEO=/^[A-Za-z0-9_-]{11}$/;
const STREAM=/^[0-9]{1,32}$/;
const FRESH_MS=15*60*1000;
const MAX_LIVE_MS=48*3600*1000;
const STOP=new Set(['CANCELADO','DESCANSO','ESCALA','HIATUS','DESPEGÓ']);
const finite=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const clean=(v,max=150)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/gu,' ').trim().slice(0,max):'';
const norm=v=>clean(v,300).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const okStart=(v,now)=>finite(v)&&Date.parse(v)<=now+30000&&now-Date.parse(v)<=MAX_LIVE_MS;
const fresh=(v,now)=>finite(v)&&Date.parse(v)<=now+30000&&now-Date.parse(v)<FRESH_MS;
const validSlot=d=>d instanceof Date&&Number.isFinite(d.getTime());
const validYt=(x,now)=>x&&VIDEO.test(x.id||'')&&x.channelId===YT_CHANNEL&&
  typeof x.title==='string'&&clean(x.title)===x.title&&x.title&&
  okStart(x.startedAt,now)&&fresh(x.checkedAt,now);
const validTw=(x,now)=>x&&STREAM.test(x.id||'')&&x.userId===TW_USER&&
  typeof x.title==='string'&&clean(x.title)===x.title&&x.title&&
  okStart(x.startedAt,now)&&fresh(x.checkedAt,now);
const stateFrom=(state,now)=>({
 youtube:(Array.isArray(state?.youtube)?state.youtube:[]).filter(x=>validYt(x,now)).slice(0,10),
 twitch:validTw(state?.twitch,now)?state.twitch:null
});
async function read(url,init,fetchImpl){
 const r=await fetchImpl(url,{...init,redirect:'manual'});
 if(!r?.ok)throw Error('provider_unavailable');
 return r.json();
}
async function readYoutube(endpoint,params,apiKey,fetchImpl){
 const u=new URL('https://www.googleapis.com/youtube/v3/'+endpoint);
 for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);
 u.searchParams.set('key',apiKey);
 const b=await read(u.toString(),{headers:{Accept:'application/json'}},fetchImpl);
 if(!Array.isArray(b?.items))throw Error('invalid_provider_response');
 return b;
}
/** 30-min discovery: reuse the existing hourly LIVE search when available.
 * Undefined sharedIds: no editorial discovery ran; use independent live search.
 * Null sharedIds: existing discovery failed; do not retry that hourly search.
 * Between discovery slots: cheap videos.list for already known and bootstrap IDs.
 */
export async function refreshActiveYouTube(env,prior,{now,slot,sharedIds,fetchImpl=fetch}={}){
 if(env.YOUTUBE_SYNC_PAUSED==='true'||env.YOUTUBE_CHANNEL_ID!==YT_CHANNEL||
    !env.YOUTUBE_API_KEY||!validSlot(now)||!validSlot(slot))return prior;
 const t=now.getTime(),old=stateFrom({youtube:prior},t).youtube;
 const ids=new Set(old.map(x=>x.id));
 const bootstrap=env.YOUTUBE_ACTIVE_BOOTSTRAP_VIDEO_ID;
 const until=Date.parse(env.YOUTUBE_ACTIVE_BOOTSTRAP_UNTIL||'');
 if(VIDEO.test(bootstrap||'')&&Number.isFinite(until)&&t<until&&until-t<=24*3600000)
  ids.add(bootstrap);
 const minute=slot.getUTCMinutes();
 if(minute===0||minute===30){
  if(minute===0&&Array.isArray(sharedIds)){
   for(const id of sharedIds)if(VIDEO.test(id))ids.add(id);
  }else if(minute===30||sharedIds===undefined){
   try{
    const result=await readYoutube('search',{
     part:'id',type:'video',eventType:'live',channelId:YT_CHANNEL,maxResults:'10'
    },env.YOUTUBE_API_KEY,fetchImpl);
    for(const i of result.items)
     if(i?.id?.kind==='youtube#video'&&VIDEO.test(i.id.videoId||''))ids.add(i.id.videoId);
   }catch{/* Keep refreshing previously confirmed IDs, never infer completion. */}
  }
 }
 if(!ids.size)return old;
 if(ids.size>50)return old;
 try{
  const result=await readYoutube('videos',{
   part:'snippet,liveStreamingDetails,status',id:[...ids].join(',')
  },env.YOUTUBE_API_KEY,fetchImpl);
  const next=new Map(old.map(x=>[x.id,x])),seen=new Set();
  for(const i of result.items){
   if(!ids.has(i?.id)||seen.has(i.id))throw Error('invalid_provider_identity');
   seen.add(i.id);
   const s=i.snippet,d=i.liveStreamingDetails;
   // Explicitly non-public/foreign items must never be exposed, even if
   // they used to be public. Missing or malformed evidence expires normally.
   if(s?.channelId!==YT_CHANNEL||i.status?.privacyStatus!=='public'){
    next.delete(i.id);continue;
   }
   if(finite(d?.actualEndTime)||s.liveBroadcastContent!=='live'){
    next.delete(i.id);continue;
   }
   const title=clean(s.title);
   if(!title||!okStart(d?.actualStartTime,t))continue;
   next.set(i.id,{id:i.id,channelId:YT_CHANNEL,title,
    startedAt:d.actualStartTime,checkedAt:now.toISOString()});
  }
  return [...next.values()].filter(x=>validYt(x,t)).slice(0,10);
 }catch{return old}
}

let appCache=null;
async function twitchToken(env,fetchImpl,now){
 if(appCache?.client===env.TWITCH_CLIENT_ID&&appCache.until>now+60000)
  return appCache.token;
 const r=await read('https://id.twitch.tv/oauth2/token',{
  method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body:new URLSearchParams({client_id:env.TWITCH_CLIENT_ID,
   client_secret:env.TWITCH_CLIENT_SECRET,grant_type:'client_credentials'}).toString()
 },fetchImpl);
 if(typeof r?.access_token!=='string'||!r.access_token||
    !Number.isFinite(+r.expires_in)||+r.expires_in<=60)throw Error('token_unavailable');
 appCache={client:env.TWITCH_CLIENT_ID,token:r.access_token,
  until:now+Math.min(+r.expires_in,86400)*1000};
 return appCache.token;
}
/** Twitch app-token Get Streams, not the membership OAuth connection.
 * An empty successful result or provider failure does NOT publish a false
 * completion; previous live proof has at most the existing 15-min grace.
 */
export async function refreshActiveTwitch(env,prior,{now,fetchImpl=fetch}={}){
 if(!validSlot(now))return null;
 const t=now.getTime(),old=validTw(prior,t)?prior:null;
 if(env.TWITCH_RECOGNITION_BROADCASTER_ID!==TW_USER||
    !env.TWITCH_CLIENT_ID||!env.TWITCH_CLIENT_SECRET)return old;
 try{
  const token=await twitchToken(env,fetchImpl,t);
  const u=new URL('https://api.twitch.tv/helix/streams');
  u.searchParams.set('user_id',TW_USER);
  const r=await read(u.toString(),{headers:{
   'Client-Id':env.TWITCH_CLIENT_ID,Authorization:'Bearer '+token
  }},fetchImpl);
  if(!Array.isArray(r?.data)||r.data.length>1)return old;
  if(r.data.length===0)return old;
  const s=r.data[0];
  if(s?.user_id!==TW_USER||s.type!=='live'||!STREAM.test(s.id||'')||
     !okStart(s.started_at,t)||!clean(s.title))return old;
  return {id:s.id,userId:TW_USER,title:clean(s.title),
   category:clean(s.game_name,100),startedAt:s.started_at,checkedAt:now.toISOString()};
 }catch{return old}
}

/** The existing terminal_state row is sufficient. No D1 migration or new
 * schema. CAS keeps concurrent agenda publication and normal sync safe.
 */
export async function syncActiveBroadcasts(env,{now=new Date(),slot=now,
 sharedIds,fetchImpl=fetch}={}){
 if(env.ACTIVE_BROADCASTS_ENABLED!=='true'||!validSlot(now)||!validSlot(slot)||
    !env.DB?.prepare)return {ok:false,reason:'disabled'};
 let row;
 try{row=await env.DB.prepare(
  'SELECT revision,editorial_json,sync_json FROM terminal_state WHERE id=1'
 ).first()}catch{return {ok:false,reason:'storage_unavailable'}}
 if(!row)return {ok:false,reason:'unpublished'};
 try{
  const sync=JSON.parse(row.sync_json||'{}');
  const prior=stateFrom(sync[ACTIVE_BROADCASTS_KEY],now.getTime());
  const [youtube,twitch]=await Promise.all([
   refreshActiveYouTube(env,prior.youtube,{now,slot,sharedIds,fetchImpl}),
   refreshActiveTwitch(env,prior.twitch,{now,fetchImpl})
  ]);
  const next={youtube,twitch};
  if(!youtube.length&&!twitch)delete sync[ACTIVE_BROADCASTS_KEY];
  else sync[ACTIVE_BROADCASTS_KEY]=next;
  const encoded=JSON.stringify(sync);
  if(encoded===row.sync_json)return {ok:true,changed:false};
  const result=await env.DB.prepare(
   'UPDATE terminal_state SET sync_json=? WHERE id=1 AND revision=? AND sync_json=?'
  ).bind(encoded,row.revision,row.sync_json).run();
  return result?.meta?.changes===1?{ok:true,changed:true}:
   {ok:false,reason:'concurrent_update'};
 }catch{return {ok:false,reason:'active_broadcast_sync_unavailable'}}
}

function sameTitle(a,b){
 const x=norm(a),y=norm(b);
 if(!x||!y)return false;
 if(x===y)return true;
 let n=0;while(n<Math.min(x.length,y.length)&&x[n]===y[n])n++;
 return n>=26&&x.slice(0,n).split(' ').filter(w=>w.length>=3).length>=4;
}
function closeTime(a,b,minutes){
 return finite(a)&&finite(b)&&Math.abs(Date.parse(a)-Date.parse(b))<=minutes*60000;
}
function cdmxFields(value){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{
  timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',hourCycle:'h23'
 }).formatToParts(new Date(value)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return {day:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute};
}
function scheduledInstant(e){return /^\d{4}-\d{2}-\d{2}$/.test(e.day||'')&&
 /^\d{2}:\d{2}$/.test(e.time||'')?e.day+'T'+e.time+':00-06:00':''}
function matchScheduled(e,group,obs,now){
 if(!e||STOP.has(e.status)||!Array.isArray(e.platforms))return false;
 if(group.yt&&!e.platforms.includes('yt')||group.tw&&!e.platforms.includes('tw'))return false;
 if(group.yt){
  if(e.videoId===group.yt.id)return true;
  if(obs?.youtube?.verified===true&&obs.youtube.matchConfirmed===true&&
     obs.youtube.source==='youtube_data_api_v3'&&
     obs.youtube.editorialIdentity===editorialIdentity(e)&&
     obs.youtube.videoId===group.yt.id)return true;
  // Explicit different video ID must never be overwritten by title.
  if(e.videoId||obs?.youtube?.matchConfirmed===true&&obs.youtube.videoId)return false;
 }
 if(group.tw&&obs?.twitch?.verified===true&&obs.twitch.matchConfirmed===true&&
    String(obs.twitch.streamId||'')===group.tw.id)return true;
 const primary=group.yt||group.tw;
 return closeTime(scheduledInstant(e),primary.startedAt,90)&&
  (sameTitle(e.title,primary.title)||group.tw&&sameTitle(e.title,group.tw.title));
}
function observations(e,group){
 const out={};
 if(group.yt)out.youtube={
  source:'youtube_data_api_v3',verified:true,matchConfirmed:true,status:'live',
  videoId:group.yt.id,videoUrl:'https://youtu.be/'+group.yt.id,
  checkedAt:group.yt.checkedAt,videoTitle:group.yt.title,
  editorialIdentity:editorialIdentity(e),actualStartTime:group.yt.startedAt
 };
 if(group.tw)out.twitch={
  source:'twitch_helix_streams',verified:true,matchConfirmed:true,status:'live',
  streamId:group.tw.id,checkedAt:group.tw.checkedAt,
  actualStartTime:group.tw.startedAt,streamTitle:group.tw.title
 };
 return out;
}
/** Pure public-only projection. Synthetic rows are not editorial reservations.
 * Match an existing scheduled event only with exact identity or very strong
 * title/time evidence. Join YT/Twitch only with strong evidence of simulcast.
 * Each provider's last positive evidence expires independently.
 */
export function projectActiveBroadcasts(publicData,stored,now=new Date()){
 if(!validSlot(now)||!publicData||!Array.isArray(publicData.events))return publicData;
 const t=now.getTime(),{youtube,twitch}=stateFrom(stored,t);
 if(!youtube.length&&!twitch)return publicData;
 const groups=youtube.map(yt=>({yt,tw:null}));
 if(twitch){
  const matches=groups.filter(g=>closeTime(g.yt.startedAt,twitch.startedAt,30)&&
   sameTitle(g.yt.title,twitch.title));
  if(matches.length===1)matches[0].tw=twitch;
  else groups.push({yt:null,tw:twitch});
 }
 const events=[...publicData.events],sync={...(publicData.sync||{})};
 for(const group of groups){
  const matched=events.filter(e=>!e.spontaneous&&matchScheduled(e,group,sync[e.id],t));
  if(matched.length===1){
   const e=matched[0];
   sync[e.id]={...(sync[e.id]||{}),...observations(e,group)};
   continue;
  }
  const primary=group.yt||group.tw;
  // An ongoing stream that crosses midnight/week rollover remains visible
  // on the current day, with its actual local start time when same-day.
  const start=cdmxFields(primary.startedAt),today=cdmxFields(now.toISOString());
  const id=ACTIVE_BROADCAST_ID_PREFIX+(group.yt?'yt:'+group.yt.id:'tw:'+group.tw.id);
  if(events.some(e=>e.id===id))continue;
  const platforms=[...(group.yt?['yt']:[]),...(group.tw?['tw']:[])];
  const e={id,origin:'manual',spontaneous:true,day:start.day===today.day?start.day:today.day,
   time:start.day===today.day?start.time:'00:00',title:primary.title,
   category:group.tw?.category||primary.title,extra:'Emisión no programada',
   platforms,status:'EN VIVO',logoChoice:'auto',logoData:'',
   ...(group.yt?{videoId:group.yt.id}:{})};
  events.push(e);sync[id]=observations(e,group);
 }
 return {...publicData,events,sync};
}

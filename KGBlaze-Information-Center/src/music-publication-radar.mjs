// Rebel Mix: official YouTube uploads, independent of live detection and memberships.
// No search.list, vidIQ, public writes, or catalogue changes.
import {songs} from './music-catalog.mjs';
export const MUSIC_RADAR_KEY='__kgblaze_music_radar_v1';
const OWNER='UCRd_uwPjrsf6Z3CRXwNehEQ';
const ID=/^[A-Za-z0-9_-]{11}$/;
const PLAYLIST=/^UU[A-Za-z0-9_-]{22}$/;
const LIMIT=100;
const iso=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const norm=v=>String(v||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const clean=(v,n)=>String(v||'').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/gu,' ').trim().slice(0,n);
function catalogIds(nodes=songs){
 const ids=new Set();
 function visit(x,key=''){
  if(typeof x==='string'&&/^(videoId|currentVideoId|historicalUploads|historicalVideoIds)$/i.test(key)&&ID.test(x))ids.add(x);
  else if(Array.isArray(x))for(const a of x)visit(a,key);
  else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x))visit(v,k);
 }
 visit(nodes);return ids;
}
export const knownMusicIds=()=>catalogIds();
const CREDIT_FIELDS=[
 ['song',/^(?:cancion|song|tema)\s*:/],
 ['artist',/^(?:artista(?: original)?|original artist|interprete original)\s*:/],
 ['work',/^(?:serie(?: obra)?|obra|anime|original|source|franquicia)\s*:/],
 ['voice',/^(?:voz(?: es)?|voces|vocal(?:s)?|interpretacion|cantante)\s*:/],
 ['adaptation',/^(?:letra(?: adaptacion al espanol)?|adaptacion(?: al espanol)?|letra y adaptacion|spanish lyrics|lyrics|adecuaciones|subtitulos)\s*:/],
 ['instrumental',/^(?:instrumental|off vocal|karaoke|acompanamiento)\s*:/],
 ['mix',/^(?:mix(?: master)?|mixing|mezcla(?: masterizacion)?|master(?:ing)?)\s*:/],
 ['visual',/^(?:ilustracion|arte|video(?: mv)?|mv|video musical|edicion(?: de video)?|art)\s*:/]
];
function creditLine(v){
 // Keep the colon as a field delimiter while ignoring decorative emoji and accents.
 const ix=v.indexOf(':');return ix<0?norm(v):norm(v.slice(0,ix))+':'+norm(v.slice(ix+1));
}
export function classifyMusicVideo(video,{since,now=new Date(),knownIds=catalogIds()}={}){
 const s=video?.snippet||{},id=video?.id;
 if(!ID.test(id||'')||s.channelId!==OWNER||video?.status?.privacyStatus!=='public'||knownIds.has(id)||
  !iso(s.publishedAt)||!iso(since)||Date.parse(s.publishedAt)<Date.parse(since)||Date.parse(s.publishedAt)>now.getTime()||
  s.liveBroadcastContent!=='none'||!['10','24'].includes(String(s.categoryId)))return null;
 const title=clean(s.title,150),t=norm(title),description=String(s.description||'').slice(0,20000),d=norm(description);
 // Explicit teasers and promotional excerpts are not finished musical works.
 // Shorts cannot be reliably identified merely from duration; do not reject short covers.
 if(/\b(teaser|trailer|preview|adelanto|detras de camaras|behind the scenes|reaccion|reaction|watchalong|fragmento|snippet|shorts)\b/.test(t))return null;
 const spanish=/\bcover (?:en )?(?:espanol|spanish|castellano|latino)\b|\bspanish cover\b/.test(t);
 const cover=/\bcover\b/.test(t);
 const lines=description.split(/\r?\n/).map(creditLine);
 const fields=CREDIT_FIELDS.filter(([,pattern])=>lines.some(x=>pattern.test(x)&&x.split(':')[1]?.trim())).map(([name])=>name);
 const creditHeader=lines.some(x=>/^(?:creditos|credits)(?: musicales)?$/.test(x));
 const template=Math.min(40,fields.length*5+(creditHeader?5:0));
 const tags=Array.isArray(s.tags)?s.tags.map(norm):[];
 const coverTags=tags.some(x=>/\bcover\b/.test(x))&&tags.some(x=>/\b(espanol|spanish|vsinger|song cover|vocal cover)\b/.test(x));
 const identity=/\bblaze leiton\b|\bblazeleiton\b/.test(d)||/https?:\/\/(?:www\.)?(?:twitch\.tv\/blazeleiton|ko-fi\.com\/blazeleiton)\b/i.test(description);
 const points={template,title:spanish?30:cover?15:0,category:String(s.categoryId)==='10'?15:10,tags:coverTags?10:0,identity:identity?5:0};
 const score=Object.values(points).reduce((a,b)=>a+b,0);
 // A cover marker or strong cover-specific metadata is essential; generic channel boilerplate is not.
 if(score<60||(!cover&&template<35))return null;
 return {id,title,publishedAt:s.publishedAt,categoryId:String(s.categoryId),score,confidence:score>=85?'high':'review',
  points,fields,creditHeader,spanish,descriptionExcerpt:clean(description.slice(0,600),600)};
}
async function read(endpoint,params,env,fetchImpl){
 const u=new URL('https://www.googleapis.com/youtube/v3/'+endpoint);
 for(const [k,v] of Object.entries(params))u.searchParams.set(k,String(v));
 u.searchParams.set('key',env.YOUTUBE_API_KEY);
 const r=await fetchImpl(u.toString(),{method:'GET',redirect:'manual',headers:{Accept:'application/json'}});
 if(!r?.ok)throw Error('provider_unavailable');
 const b=await r.json();if(!Array.isArray(b?.items))throw Error('invalid_provider_response');
 return b;
}
function config(env){
 return env?.MUSIC_RADAR_ENABLED==='true'&&env.YOUTUBE_SYNC_PAUSED!=='true'&&
  env.YOUTUBE_CHANNEL_ID===OWNER&&typeof env.YOUTUBE_API_KEY==='string'&&!!env.YOUTUBE_API_KEY&&
  iso(env.MUSIC_RADAR_SINCE);
}
export function musicRadarView(env,sync={}){
 const state=sync[MUSIC_RADAR_KEY]||{},known=catalogIds();
 return {ok:true,enabled:env.MUSIC_RADAR_ENABLED==='true',configured:config(env),since:env.MUSIC_RADAR_SINCE||null,
  lastScan:state.lastScan||null,coverage:state.coverage||null,
  candidates:(Array.isArray(state.candidates)?state.candidates:[]).filter(x=>ID.test(x?.id||'')&&!known.has(x.id)).sort((a,b)=>b.score-a.score||b.publishedAt.localeCompare(a.publishedAt))};
}
/** Reuse terminal_state sync_json; CAS only. No editorial revisions or schema changes.
 * Each hourly scan: 1 uploads-list call + 1 batched videos call in normal use.
 * First scan resolves official uploads playlist; up to 3 list pages only for catch-up.
 * Refresh pending candidates even if they move off the first page; never evict silently.
 */
export async function syncMusicRadar(env,{now=new Date(),slot=now,fetchImpl=fetch}={}){
 if(!config(env)||!env.DB?.prepare||!(now instanceof Date)||!Number.isFinite(now.getTime())||
  !(slot instanceof Date)||!Number.isFinite(slot.getTime())||slot.getUTCMinutes()!==0)return {ok:false,reason:'disabled_or_not_due'};
 try{
  const row=await env.DB.prepare('SELECT revision,sync_json FROM terminal_state WHERE id=1').first();
  if(!row)return {ok:false,reason:'unpublished'};
  const sync=JSON.parse(row.sync_json||'{}'),prior=sync[MUSIC_RADAR_KEY]||{},known=catalogIds();
  const hour=slot.toISOString().slice(0,13);
  if(prior.slot===hour)return {ok:true,reason:'already_scanned'};
  let playlist=prior.playlist;
  if(!PLAYLIST.test(playlist||'')){
   const channels=await read('channels',{part:'contentDetails',id:OWNER},env,fetchImpl);
   const channel=channels.items.find(x=>x?.id===OWNER);
   playlist=channel?.contentDetails?.relatedPlaylists?.uploads;
   if(!PLAYLIST.test(playlist||''))throw Error('uploads_unverified');
  }
  let token='',pages=0,coverage='recent_uploads',ids=new Set();
  const previous=Array.isArray(prior.candidates)?prior.candidates.filter(x=>ID.test(x?.id||'')&&!known.has(x.id)).slice(0,LIMIT):[];
  const boundary=Math.max(Date.parse(env.MUSIC_RADAR_SINCE),iso(prior.lastScan)?Date.parse(prior.lastScan):0);
  do{
   const b=await read('playlistItems',{part:'contentDetails,snippet',playlistId:playlist,maxResults:50,...(token?{pageToken:token}:{})},env,fetchImpl);
   pages++;
   for(const i of b.items){
    const id=i?.contentDetails?.videoId;
    if(ID.test(id||'')&&!known.has(id))ids.add(id);
   }
   // Use playlist dates only to bound catch-up; actual eligibility uses videos.list publication time.
   const oldest=b.items.at(-1)?.snippet?.publishedAt;
   token=b.nextPageToken&&(!iso(oldest)||Date.parse(oldest)>=boundary)?String(b.nextPageToken):'';
  }while(token&&pages<3);
  if(token)coverage='catchup_limit';
  for(const p of previous)ids.add(p.id);
  const candidates=[],wanted=[...ids];
  for(let i=0;i<wanted.length;i+=50){
   const batch=wanted.slice(i,i+50),b=await read('videos',{part:'snippet,status,liveStreamingDetails',id:batch.join(',')},env,fetchImpl),seen=new Set();
   for(const v of b.items){
    if(!batch.includes(v?.id)||seen.has(v.id))throw Error('invalid_video_identity');
    seen.add(v.id);
    const candidate=classifyMusicVideo(v,{since:env.MUSIC_RADAR_SINCE,now,knownIds:known});
    if(candidate)candidates.push(candidate);
   }
  }
  // Do not silently drop any previously pending candidate because of capacity.
  if(candidates.length>LIMIT)return {ok:false,reason:'candidate_capacity_reached'};
  sync[MUSIC_RADAR_KEY]={playlist,slot:hour,lastScan:now.toISOString(),coverage,candidates};
  const r=await env.DB.prepare('UPDATE terminal_state SET sync_json=? WHERE id=1 AND revision=? AND sync_json=?')
   .bind(JSON.stringify(sync),row.revision,row.sync_json).run();
  return r?.meta?.changes===1?{ok:true,candidates:candidates.length,coverage}:{ok:false,reason:'concurrent_update'};
 }catch{return {ok:false,reason:'music_radar_unavailable'};}
}

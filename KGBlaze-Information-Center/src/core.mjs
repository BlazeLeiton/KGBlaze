// Terminal: deterministic, platform-agnostic logic. No secrets or credentials here.
export const TZ='America/Mexico_City';
export const ALLOWED_STATUSES=new Set(['A TIEMPO','POR CONFIRMAR','REPROGRAMADO','CANCELADO','EN VIVO','DESPEGÓ','DESCANSO','ESCALA','HIATUS']);
export const PLATFORMS=new Set(['yt','tw','ig','dc']);
const GRACE_MS=15*60*1000;
export const EMPTY_AGENDA=()=>({schema:'relight-public-v1',publishedAt:null,sourceNote:'Calendario pendiente de publicación',timezone:TZ,events:[],libraryChanges:{},libraryCustom:[],hiatusWeeks:{},clearedWeeks:{}});
export const nowISO=()=>new Date().toISOString();
// Public origin is `twitch`; the private ICS editor historically emitted `tw`.
// Revision 1 also stored imported tw: IDs incorrectly as `manual`. Adapt both without rewriting D1.
export function normalizeEventOrigin(e){
 if(e?.origin==='tw'||e?.origin==='twitch')return 'twitch';
 if(e?.origin==='manual'&&typeof e.id==='string'&&e.id.startsWith('tw:'))return 'twitch';
 return 'manual';
}
export function currentMonday(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 const day=new Date(Date.UTC(+parts.year,+parts.month-1,+parts.day,12));day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);return day.toISOString().slice(0,10);
}
export function addDays(day,offset){const x=new Date(day+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+offset);return x.toISOString().slice(0,10);}
function plainObject(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
export function normalizeEditorial(raw, now=new Date()){
 if(!plainObject(raw)||raw.schema!=='relight-public-v1'||!Array.isArray(raw.events))throw new Error('Formato de agenda incorrecto');
 if(JSON.stringify(raw).length>5_000_000||raw.events.length>200)throw new Error('Agenda demasiado grande');
 const first=currentMonday(now),last=addDays(first,35),seen=new Set();
 const events=raw.events.filter(e=>e&&e.day>=first&&e.day<last).map(e=>{
  if(typeof e.id!=='string'||e.id.length<1||e.id.length>180||seen.has(e.id))throw Error('ID de evento inválido o duplicado');seen.add(e.id);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e.day)||typeof e.title!=='string'||e.title.length>150||!ALLOWED_STATUSES.has(e.status))throw Error('Datos inválidos en '+e.id);
  if(e.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time))throw Error('Hora inválida en '+e.id);
  const platforms=Array.isArray(e.platforms)?[...new Set(e.platforms)].filter(p=>PLATFORMS.has(p)).slice(0,4):[];
  return {id:e.id,origin:normalizeEventOrigin(e),day:e.day,time:e.time||'',title:e.title,extra:String(e.extra||'').slice(0,300),category:String(e.category||e.title).slice(0,200),platforms,status:e.status,logoChoice:String(e.logoChoice||'auto').slice(0,100),logoData:typeof e.logoData==='string'&&e.logoData.startsWith('data:image/')?e.logoData:'' ,videoId:typeof e.videoId==='string'&&/^[A-Za-z0-9_-]{11}$/.test(e.videoId)?e.videoId:undefined};
 });
 const weeks=o=>plainObject(o)?Object.fromEntries(Object.entries(o).filter(([d])=>/^\d{4}-\d\d-\d\d$/.test(d)&&d>=first&&d<last)):{};
 return {schema:'relight-public-v1',publishedAt:nowISO(),sourceNote:'Agenda editorial publicada desde Terminal privado',timezone:TZ,events,libraryChanges:plainObject(raw.libraryChanges)?raw.libraryChanges:{},libraryCustom:Array.isArray(raw.libraryCustom)?raw.libraryCustom.slice(0,80):[],hiatusWeeks:weeks(raw.hiatusWeeks),clearedWeeks:weeks(raw.clearedWeeks)};
}
export const isoTime=s=>Number.isFinite(Date.parse(s||''))?Date.parse(s):NaN;
export function ytHasRoom(o){return !!(o&&o.matchConfirmed===true&&o.status!=='missing'&&(/^[A-Za-z0-9_-]{11}$/.test(o.videoId||'')||o.videoUrl));}
export function youtubeFinal(o){return !!(ytHasRoom(o)&&o.status==='completed'&&o.lifeCycleStatus==='complete');}
export function twitchFinal(o, now=Date.now()){return !!(o&&o.matchConfirmed===true&&o.status==='completed'&&Number.isFinite(isoTime(o.endedAt))&&now-isoTime(o.endedAt)>=GRACE_MS);}
export function finalization(event,obs,now=Date.now()){
 const p=event.platforms||[],yt=obs?.youtube,tw=obs?.twitch;
 if(p.includes('yt')&&youtubeFinal(yt))return {reason:'youtube_complete',endedAt:yt.actualEndTime||yt.endedAt};
 if(p.includes('tw')&&(!p.includes('yt')||!ytHasRoom(yt))&&twitchFinal(tw,now))return {reason:'twitch_grace_elapsed',endedAt:tw.endedAt};
 return null;
}
export function lockedChanges(oldAgenda,newAgenda,sync,now=Date.now()){
 const first=currentMonday(new Date(now)),last=addDays(first,35);
 const old=new Map((oldAgenda.events||[]).map(e=>[e.id,e]));const newer=new Map((newAgenda.events||[]).map(e=>[e.id,e]));const conflicts=[];
 for(const [id,oldEvent] of old){
  if(oldEvent.day<first||oldEvent.day>=last||!finalization(oldEvent,sync[id],now))continue;
  const fresh=newer.get(id);
  if(!fresh||JSON.stringify({...fresh,origin:normalizeEventOrigin(fresh)})!==JSON.stringify({...oldEvent,origin:normalizeEventOrigin(oldEvent)}))conflicts.push(id);
 }
 return conflicts;
}
export function publicAgenda(editorial,sync,revision,now=new Date()){
 const first=currentMonday(now),last=addDays(first,35),events=(editorial.events||[]).filter(e=>e.day>=first&&e.day<last).map(e=>{const origin=normalizeEventOrigin(e);return origin===e.origin?e:{...e,origin};});
 const ids=new Set(events.map(e=>e.id));const sanitized=Object.fromEntries(Object.entries(sync||{}).filter(([id])=>ids.has(id)));
 return {...editorial,events,sync:sanitized,revision,responseGeneratedAt:nowISO()};
}
export function toSyncEnvelope(sync,revision){return {schema:'relight-sync-v1',revision,events:Object.entries(sync||{}).map(([eventId,x])=>({eventId,...x}))};}
// Never accept a 'verified' observation from the browser/editor as platform proof.
export function publishReconcile(oldAgenda,newAgenda,sync,baseRev,currentRev,now=new Date()){
 if(!Number.isInteger(baseRev)||baseRev!==currentRev)return {ok:false,code:409,error:'CONFLICT_REVISION',revision:currentRev};
 const agenda=normalizeEditorial(newAgenda,now);
 const locked=lockedChanges(oldAgenda,agenda,sync,now.getTime());
 if(locked.length)return {ok:false,code:423,error:'FINALIZED_EVENTS_LOCKED',eventIds:locked};
 return {ok:true,agenda};
}

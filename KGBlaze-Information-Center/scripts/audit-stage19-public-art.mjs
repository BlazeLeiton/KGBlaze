// Stage 19 only: read-only production evidence, with zero secrets or image bytes in logs.
// Any network restriction reports UNKNOWN; it never blocks the test suite or edits state.
const endpoints=[
 'https://kgblaze.dpdns.org/departures/api/public',
 'https://kgblaze-terminal.drago68575.workers.dev/api/public'
];
const request=async url=>{
 try{
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)return null;
  const body=await response.json();
  return body&&typeof body==='object'?body:null;
 }catch{return null;}
};
let data=null,source=null;
for(const endpoint of endpoints){
 const result=await request(endpoint);
 if(Array.isArray(result?.events)){data=result;source=endpoint;break;}
}
if(!data){
 console.log('STAGE19 LIVE AUDIT: UNKNOWN — public API unreachable from GitHub runner; no conclusion about published logoChoice.');
 process.exit(0);
}
const e=data.events.find(x=>/killer chat/i.test(x?.title||''));
if(!e){
 console.log('STAGE19 LIVE AUDIT: UNKNOWN — Killer Chat! not found among published events; revision='+String(data.revision));
 process.exit(0);
}
console.log('STAGE19 LIVE EVENT',JSON.stringify({
 revision:data.revision,id:e.id,title:e.title,category:e.category,
 logoChoice:e.logoChoice||'auto',hasLogoData:Boolean(e.logoData),
 platforms:e.platforms
}));
const coverEndpoint=source.replace(/\/api\/public$/,'/api/public/twitch-box-art');
const art=await request(coverEndpoint+'?eventId='+encodeURIComponent(e.id));
const raw=typeof art?.artUrl==='string'?art.artUrl:null;
const artPath=raw&&raw.startsWith('https://static-cdn.jtvnw.net/ttv-boxart/')?new URL(raw).pathname:null;
console.log('STAGE19 LIVE CATEGORY LOOKUP',JSON.stringify({
 available:Boolean(art),source:art?.source??null,officialBoxArtPath:artPath
}));
console.log('STAGE19 LIVE AUDIT: public metadata only; no logo bytes, tokens or D1 writes.');


// Stage 20: confirm the most recent Azur Lane flight completion through
// anonymous public GET only. No edits, auth headers, sync writes or secrets.
const azur=data.events
 .filter(e=>/azur lane/i.test(String(e?.title||'')+' '+String(e?.category||'')))
 .sort((a,b)=>(b.day+' '+(b.time||'')).localeCompare(a.day+' '+(a.time||'')));
for(const flight of azur.slice(0,4)){
 const observation=data.sync?.[flight.id]||{};
 const yt=observation.youtube||{};
 const tw=observation.twitch||{};
 const hasEnded=yt.status==='completed'&&yt.lifeCycleStatus==='complete'&&
  yt.verified===true&&yt.matchConfirmed===true;
 const actualEnd=yt.actualEndTime||yt.endedAt||null;
 const graceMs=actualEnd?Date.now()-Date.parse(actualEnd):null;
 console.log('STAGE20 AZUR COMPLETION',JSON.stringify({
  revision:data.revision,eventId:flight.id,day:flight.day,time:flight.time,
  title:flight.title,editorialStatus:flight.status,platforms:flight.platforms,
  videoId:flight.videoId||null,
  youtubeStatus:yt.status||null,verified:yt.verified===true,
  matchConfirmed:yt.matchConfirmed===true,lifeCycleStatus:yt.lifeCycleStatus||null,
  completionEvidence:yt.completionEvidence||null,actualEndTime:actualEnd,
  checkedAt:yt.checkedAt||null,reason:observation.finalization?.reason||null,
  minutesSinceActualEnd:Number.isFinite(graceMs)?Math.round(graceMs/60000):null,
  confirmedCompleted:hasEnded,twitchStatus:tw.status||null
 }));
}
if(!azur.length)console.log('STAGE20 AZUR COMPLETION: UNKNOWN — no matching published Azur Lane activity.');

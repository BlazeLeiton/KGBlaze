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

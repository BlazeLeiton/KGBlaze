import {EMPTY_AGENDA,normalizeEditorial,publishReconcile,publicAgenda,toSyncEnvelope,nowISO} from './core.mjs';
import {runManualYouTubePreflight} from '../experiments/youtube-matching/preflight.mjs';
import {readYouTubeKnownVideos} from '../experiments/youtube-matching/read-only-source.mjs';
import {runScheduledYouTubeSync} from './youtube-sync.mjs';
import {routePortalRequest} from './portal-route.mjs';
import {VIEWER_CSS,VIEWER_JS} from './viewer-enhancements.mjs';
import {DASHBOARD_HTML} from './dashboard-page.mjs';
import {validTwitchCategoryName,getTwitchBoxArt,getEventTwitchArt} from './twitch-box-art.mjs';
import {SOCIAL_PREVIEW_CRON,socialPreviewMonday,generateDailySocialPreview} from './social-preview.mjs';
const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
// Canal verificado en Stage 1; su ID público no es una credencial.
const VERIFIED_YOUTUBE_CHANNEL_ID='UCRd_uwPjrsf6Z3CRXwNehEQ';
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...HEADERS,...extra}});
const err=(status,code,detail)=>json({ok:false,error:code,detail},status);
function localCors(req,env){
 const origin=req.headers.get('Origin');
 if(!origin)return {};
 const allowed=origin==='null'||origin==='http://localhost'||/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)||origin===env.ADMIN_ALLOWED_ORIGIN||origin===new URL(req.url).origin;
 return allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type, X-Relight-Preview-Only','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Max-Age':'300'}:{};
}
async function authorized(req,env){
 const v=req.headers.get('Authorization')||'',secret=env.ADMIN_TOKEN||'';
 if(!secret||!v.startsWith('Bearer '))return false;
 const enc=new TextEncoder(),a=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(v.slice(7)))),b=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(secret)));
 let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
async function getState(env){
 const row=await env.DB.prepare('SELECT revision,editorial_json,sync_json,updated_at FROM terminal_state WHERE id=1').first();
 return row?{revision:row.revision,editorial:JSON.parse(row.editorial_json),sync:JSON.parse(row.sync_json),updatedAt:row.updated_at}:
 {revision:0,editorial:EMPTY_AGENDA(),sync:{},updatedAt:null};
}
async function storeEditorial(env,old,next){
 const t=nowISO();
 if(old.revision===0&&old.updatedAt===null){
  const r=await env.DB.prepare('INSERT OR IGNORE INTO terminal_state (id,revision,editorial_json,sync_json,updated_at) VALUES (1,1,?,?,?)').bind(JSON.stringify(next),JSON.stringify(old.sync),t).run();
  if(r.meta.changes!==1)return false;
 }else{
  const r=await env.DB.prepare('UPDATE terminal_state SET revision=revision+1, editorial_json=?,updated_at=? WHERE id=1 AND revision=?').bind(JSON.stringify(next),t,old.revision).run();
  if(r.meta.changes!==1)return false;
 }
 await env.DB.prepare("INSERT INTO terminal_audit (revision,source,happened_at,note) VALUES (?,'editor',?,'Actualización editorial desde operativo local')").bind(old.revision+1,t).run();
 return true;
}
async function savePreview(req,env,revision){
 const type=req.headers.get('Content-Type')||'';
 if(!type.startsWith('image/png'))return err(415,'PNG_REQUIRED');
 if(Number(req.headers.get('Content-Length')||0)>2_500_000)return err(413,'PREVIEW_TOO_LARGE');
 const buf=await req.arrayBuffer();if(buf.byteLength>2_500_000)return err(413,'PREVIEW_TOO_LARGE');
 const b=new Uint8Array(buf);if(b.length<24||[137,80,78,71,13,10,26,10].some((x,i)=>x!==b[i]))return err(400,'BAD_PNG');
 const w=(b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19],h=(b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23];
 if(w!==1080||h!==1080)return err(400,'PNG_MUST_BE_1080_SQUARE');
 const week=req.headers.get('X-Terminal-Week')||'';if(!/^\d{4}-\d\d-\d\d$/.test(week))return err(400,'WEEK_REQUIRED');
 await env.DB.prepare("INSERT INTO terminal_preview (id,week,mime,payload,updated_at) VALUES (1,?,'image/png',?,?) ON CONFLICT(id) DO UPDATE SET week=excluded.week,payload=excluded.payload,updated_at=excluded.updated_at").bind(week,new Uint8Array(buf),nowISO()).run();
 return json({ok:true,week,revision});
}
async function handler(req,env){
 const url=new URL(req.url),path=url.pathname,method=req.method;
 if(path==='/api/health'&&method==='GET')return json({ok:true,service:'kgblaze-terminal',database:!!env.DB,version:'preview-0.1'});
 if(!env.DB&&['/api/public','/agenda_publica.json'].includes(path))return err(503,'DATABASE_NOT_CONFIGURED');
 if(!env.DB&&(path.startsWith('/api/')||path==='/og-semana.png'))return err(503,'DATABASE_NOT_CONFIGURED');
 if((path==='/api/public'||path==='/agenda_publica.json')&&method==='GET'){
  const d=await getState(env);return json(publicAgenda(d.editorial,d.sync,d.revision));
 }
 // Public read-only image URL, restricted to categories in the published agenda.
 // No arbitrary API proxy, editorial writes, stream status changes or secrets exposed.
 if(path==='/api/public/twitch-box-art'&&method==='GET'){
  const d=await getState(env);
  const eventId=url.searchParams.get('eventId');
  // The eventId form supports both YouTube-only and Twitch entries, without
  // exposing arbitrary search queries or accepting a caller-controlled title.
  if(eventId!==null){
   if(!eventId||eventId.length>180)return err(400,'INVALID_EVENT_ID');
   const event=d.editorial.events.find(e=>e.id===eventId&&
    Array.isArray(e.platforms)&&e.platforms.some(p=>p==='yt'||p==='tw'));
   if(!event)return err(404,'EVENT_NOT_PUBLISHED');
   let found={artUrl:null,source:null};
   try{found=await getEventTwitchArt(event,env);}
   catch{ /* Fail closed. The viewer uses category/title art or its general default. */ }
   return json({ok:true,...found},200,{'Cache-Control':'public,max-age=900'});
  }
  // Preserve the Stage 12 read-only diagnostic endpoint for published categories.
  const name=url.searchParams.get('name')||'';
  if(!validTwitchCategoryName(name))return err(400,'INVALID_TWITCH_CATEGORY');
  const normalized=name.trim();
  const published=d.editorial.events.some(e=>
   Array.isArray(e.platforms)&&e.platforms.some(p=>p==='yt'||p==='tw')&&
   typeof e.category==='string'&&e.category.trim().toLocaleLowerCase()===normalized.toLocaleLowerCase());
  if(!published)return err(404,'CATEGORY_NOT_PUBLISHED');
  let artUrl=null;
  try{artUrl=await getTwitchBoxArt(normalized,env);}
  catch{ /* Fail closed: the viewer uses its editorial artwork. */ }
  return json({ok:true,artUrl},200,{'Cache-Control':'public,max-age=900'});
 }
 if(path==='/og-semana.png'&&method==='GET'){
  const r=await env.DB.prepare('SELECT week,payload FROM terminal_preview WHERE id=1').first();
  if(!r||r.week!==socialPreviewMonday())return new Response('No hay vista previa publicada',{status:404,headers:{'Cache-Control':'no-store'}});
  return new Response(r.payload instanceof Uint8Array||r.payload instanceof ArrayBuffer?r.payload:new Uint8Array(r.payload),{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=60','X-Terminal-Week':r.week}});
 }
 if(!path.startsWith('/api/admin/'))return null;
 const cors=localCors(req,env);
 if(method==='OPTIONS')return Object.keys(cors).length?new Response(null,{status:204,headers:cors}):err(403,'ORIGIN_NOT_ALLOWED');
 if(req.headers.has('Origin')&&!Object.keys(cors).length)return err(403,'ORIGIN_NOT_ALLOWED');
 if(!await authorized(req,env))return json({ok:false,error:'UNAUTHORIZED'},401,cors);
 const d=await getState(env);
 if(path==='/api/admin/snapshot'&&method==='GET')return json({schema:'terminal-admin-v1',revision:d.revision,editorial:d.editorial,sync:toSyncEnvelope(d.sync,d.revision),updatedAt:d.updatedAt},200,cors);
 if(path==='/api/admin/sync'&&method==='GET')return json(toSyncEnvelope(d.sync,d.revision),200,cors);
 // Inspect the ACTUAL published YouTube title/description/tags by public video ID.
 // Private, explicitly read-only, uses one videos.list (no search.list) and no D1 writes.
 if(path==='/api/admin/youtube-video-audit'&&method==='GET'){
  if(env.YOUTUBE_PREVIEW_ENABLED!=='true')return json({ok:false,error:'YOUTUBE_PREFLIGHT_DISABLED'},503,cors);
  if(req.headers.get('X-Relight-Preview-Only')!=='ack-read-only')return json({ok:false,error:'PREVIEW_ACK_REQUIRED'},400,cors);
  const videoId=url.searchParams.get('videoId');
  if(!/^[A-Za-z0-9_-]{11}$/.test(videoId||''))return json({ok:false,error:'INVALID_VIDEO_ID'},400,cors);
  if(!env.YOUTUBE_API_KEY||env.YOUTUBE_CHANNEL_ID!==VERIFIED_YOUTUBE_CHANNEL_ID)
   return json({ok:false,error:'YOUTUBE_PREFLIGHT_NOT_CONFIGURED'},503,cors);
  if(typeof env.YOUTUBE_PREVIEW_LIMITER?.limit!=='function')
   return json({ok:false,error:'YOUTUBE_RATE_LIMIT_NOT_CONFIGURED'},503,cors);
  let allowed;
  try{allowed=(await env.YOUTUBE_PREVIEW_LIMITER.limit({key:'terminal-youtube-metadata-audit'}))?.success===true;}
  catch{return json({ok:false,error:'YOUTUBE_RATE_LIMIT_UNAVAILABLE'},503,cors);}
  if(!allowed)return json({ok:false,error:'YOUTUBE_RATE_LIMITED'},429,cors);
  try{
   const evidence=await readYouTubeKnownVideos({
    ownedChannelId:VERIFIED_YOUTUBE_CHANNEL_ID,apiKey:env.YOUTUBE_API_KEY,
    fetchImpl:fetch,videoIds:[videoId],now:()=>new Date()
   });
   const v=evidence.resources[0];
   if(evidence.discoveryComplete!==true||v?.id!==videoId||v?.snippet?.channelId!==VERIFIED_YOUTUBE_CHANNEL_ID)
    return json({ok:false,error:'YOUTUBE_VIDEO_NOT_OWNED_OR_UNAVAILABLE'},404,cors);
   const sn=v.snippet,live=v.liveStreamingDetails||{};
   return json({ok:true,readOnly:true,videoId,
    channelId:sn.channelId,title:sn.title||'',description:sn.description||'',
    tags:Array.isArray(sn.tags)?sn.tags:[],publishedAt:sn.publishedAt||null,
    liveBroadcastContent:sn.liveBroadcastContent||null,
    scheduledStartTime:live.scheduledStartTime||null,
    actualStartTime:live.actualStartTime||null,
    actualEndTime:live.actualEndTime||null
   },200,cors);
  }catch{return json({ok:false,error:'YOUTUBE_VIDEO_AUDIT_UNAVAILABLE'},503,cors);}
 }

 // Manual preflight, DISABLED until feature flag + private credentials are explicitly configured.
 // No DB writes; never creates verified or matchConfirmed platform observations.
 if(path==='/api/admin/youtube-preflight'&&method==='POST'){
  if(env.YOUTUBE_PREVIEW_ENABLED!=='true')return json({ok:false,error:'YOUTUBE_PREFLIGHT_DISABLED'},503,cors);
  if(req.headers.get('X-Relight-Preview-Only')!=='ack-read-only')return json({ok:false,error:'PREVIEW_ACK_REQUIRED'},400,cors);
  if(!env.YOUTUBE_API_KEY||!env.YOUTUBE_CHANNEL_ID)return json({ok:false,error:'YOUTUBE_PREFLIGHT_NOT_CONFIGURED'},503,cors);
  if(env.YOUTUBE_CHANNEL_ID!==VERIFIED_YOUTUBE_CHANNEL_ID)return json({ok:false,error:'YOUTUBE_CHANNEL_MISMATCH'},503,cors);
  // Fail closed without a platform-provided limiter. Not a global daily quota.
  if(typeof env.YOUTUBE_PREVIEW_LIMITER?.limit!=='function')return json({ok:false,error:'YOUTUBE_RATE_LIMIT_NOT_CONFIGURED'},503,cors);
  let allowed;
  try{
   const decision=await env.YOUTUBE_PREVIEW_LIMITER.limit({key:'terminal-youtube-manual-preview'});
   allowed=decision?.success===true;
  }catch{return json({ok:false,error:'YOUTUBE_RATE_LIMIT_UNAVAILABLE'},503,cors);}
  if(!allowed)return json({ok:false,error:'YOUTUBE_RATE_LIMITED'},429,cors);
  try{
   const report=await runManualYouTubePreflight({...d.editorial,revision:d.revision},{
    ownedChannelId:env.YOUTUBE_CHANNEL_ID,apiKey:env.YOUTUBE_API_KEY,fetchImpl:fetch,
    now:()=>new Date()
   });
   return json(report,200,cors);
  }catch{
   // Do not log egress URLs, API response data or tokens.
   return json({ok:false,error:'YOUTUBE_PREFLIGHT_UNAVAILABLE'},503,cors);
  }
 }

 if(path==='/api/admin/publish'&&method==='POST'){
  if(Number(req.headers.get('Content-Length')||0)>5_200_000)return json({error:'TOO_LARGE'},413,cors);
  let body;try{const raw=await req.text();if(raw.length>5_200_000)return json({error:'TOO_LARGE'},413,cors);body=JSON.parse(raw);}catch{return json({error:'INVALID_JSON'},400,cors);}
  let check;try{check=publishReconcile(d.editorial,body.agenda,d.sync,body.baseRevision,d.revision);}catch(e){return json({ok:false,error:'INVALID_AGENDA',detail:e.message},400,cors);}
  if(!check.ok)return json(check,check.code,cors);
  if(!await storeEditorial(env,d,check.agenda))return json({ok:false,error:'CONFLICT_REVISION',detail:'El servidor cambió durante la publicación'},409,cors);
  return json({ok:true,revision:d.revision+1,publishedAt:nowISO(),events:check.agenda.events.length},200,cors);
 }
 if(path==='/api/admin/social-preview-refresh'&&method==='POST'){
  try{
   const result=await generateDailySocialPreview(env);
   return json(result,result.ok?200:503,cors);
  }catch{
   return json({ok:false,reason:'SOCIAL_PREVIEW_UNAVAILABLE'},503,cors);
  }
 }
 if(path==='/api/admin/preview'&&method==='POST'){
  const result=await savePreview(req,env,d.revision);const h=new Headers(result.headers);for(const [k,v] of Object.entries(cors))h.set(k,v);return new Response(result.body,{status:result.status,headers:h});
 }
 return json({error:'NOT_FOUND'},404,cors);
}
export default {
 async fetch(req,env){
  try{
   const routed=routePortalRequest(req);
   if(routed.response)return routed.response;
   const dashboardPath=new URL(routed.request.url).pathname;
   if(['/dashboard/','/dashboard','/dashboard/library/'].includes(dashboardPath)){
    if(req.method!=='GET'&&req.method!=='HEAD')return err(405,'METHOD_NOT_ALLOWED');
    // Stage 22: use the reviewed V.25 adaptation as an immutable
    // Cloudflare static asset. Until it has been supplied, retain the
    // fully functional Stage 21 dashboard; never serve a partial V.25.
    let hostedHtml=null;
    if(env.ASSETS){
     const assetUrl=new URL('/v25-web.html',routed.request.url);
     try{
      const candidate=await env.ASSETS.fetch(new Request(assetUrl,{
       method:'GET'
      }));
      if(candidate.status===200 &&
       (candidate.headers.get('Content-Type')||'').includes('text/html')){
       const html=await candidate.text();
       if(html.includes('Centro de Control Editorial')&&
          html.includes('hostedInitialize')&&
          html.includes('libraryCustom')&&
          html.includes('downloadGif')&&!html.includes('data:font/'))
         hostedHtml=html;
      }
     }catch{/* keep stable Stage 21 fallback */}
    }
    return new Response(req.method==='HEAD'?null:hostedHtml||DASHBOARD_HTML,{
     status:200,headers:{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'no-store, no-cache, must-revalidate',
      'X-Robots-Tag':'noindex, nofollow, noarchive',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'X-Frame-Options':'DENY',
      'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'"
     }
    });
   }
   const r=await handler(routed.request,env);if(r)return r;
   if(!env.ASSETS)return err(503,'ASSETS_NOT_CONFIGURED');
   const asset=await env.ASSETS.fetch(routed.request);
   const pageURL=new URL(routed.request.url);
   const path=pageURL.pathname;
   const socialCapture=pageURL.searchParams.has('relight-og-week');
   if((path==='/'||path==='/index.html')&&typeof HTMLRewriter!=='undefined'&&asset.ok){
    // Share cards are server-rendered: social crawlers do not execute canvas JS.
    // No image is claimed until the current week's 1080px PNG has been uploaded.
    let image='';
    if(env.DB){
     const preview=await env.DB.prepare('SELECT week FROM terminal_preview WHERE id=1').first();
     if(preview?.week===socialPreviewMonday()){
      const u=new URL('/departures/og-semana.png','https://kgblaze.dpdns.org');
      u.searchParams.set('week',preview.week); // changes weekly for scraper image caches
      image=u.href;
     }
    }
    const url='https://kgblaze.dpdns.org/departures/';
    return new HTMLRewriter()
     .on('title',{element(el){el.setInnerContent('Salidas | KGBlaze');}})
     .on('meta[property="og:title"],meta[name="twitter:title"]',{element(el){el.setAttribute('content','Salidas | KGBlaze');}})
     .on('meta[property="og:description"]',{element(el){el.setAttribute('content','Calendario semanal de salidas del Aeropuerto Internacional de la KGBlaze.');}})
     .on('meta[property="og:image"],meta[property="og:image:secure_url"],meta[name="twitter:image"]',{element(el){el.setAttribute('content',image);}})
     .on('meta[property="og:url"]',{element(el){el.setAttribute('content',url);}})
     .on('head',{element(el){
      el.append('<meta property="og:site_name" content="KGBlaze"><meta property="og:url" content="'+url+'"><link rel="canonical" href="'+url+'"><style>'+VIEWER_CSS+'</style>',{html:true});
     }})
     .on('body',{element(el){if(!socialCapture)el.append('<script>'+VIEWER_JS+'</script>',{html:true});}})
     .transform(asset);
   }
   return asset;
  }catch(e){console.error('Terminal Worker error:',e);return err(500,'SERVER_ERROR');}
 },
 // Cron is isolated from Preview. No writes or provider requests without
 // the independent opt-in, and no HTTP endpoint can trigger this handler.
 async scheduled(controller,env,_ctx){
  if(controller?.cron===SOCIAL_PREVIEW_CRON){
   try{
    const result=await generateDailySocialPreview(env,new Date(controller.scheduledTime));
    if(result?.ok===false&&result.reason!=='PAUSED')console.warn('Social preview:',result.reason);
   }catch{console.error('Social preview unavailable');}
   return;
  }
  if(controller?.cron!=='*/5 * * * *')return;
  if(env.YOUTUBE_SYNC_ENABLED!=='true'||env.YOUTUBE_SYNC_PAUSED==='true')return;
  const slot=new Date(controller.scheduledTime);
  if(!Number.isFinite(slot.getTime()))return;
  try{
   const result=await runScheduledYouTubeSync(env,{now:new Date(),slot});
   // Only sanitized outcome codes; never log raw provider data or secrets.
   if(result?.ok===false&&result.reason!=='disabled')
    console.warn('YouTube sync:',result.reason);
  }catch{
   console.error('YouTube sync unavailable');
  }
 }
};

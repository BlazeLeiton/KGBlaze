/**
 * One automatic, editorial social card per day at 03:00 America/Mexico_City.
 * Uses Browser Run Quick Actions to capture the REAL 1080x1080 board in the
 * public viewer. Never launches the private editor or modifies agenda/sync.
 *
 * Cloudflare cron is UTC: Mexico City (UTC-6) 03:00 == 09:00 UTC.
 */
import {currentMonday} from './core.mjs';

export const SOCIAL_PREVIEW_CRON='0 9 * * *';
export const SOCIAL_PREVIEW_ORIGIN='https://kgblaze.dpdns.org';
const MAX_PNG_BYTES=2_500_000;
const THREE_HOURS=3*60*60*1000;

// Keep Sunday card visible until Monday at 02:59:59 local; switch Monday 03:00.
// This is only for the social image, NOT the public schedule or D1 event dates.
export function socialPreviewMonday(now=new Date()){
 return currentMonday(new Date(now.getTime()-THREE_HOURS));
}

export const SOCIAL_CAPTURE_JS = `(function(){
 'use strict';
 (async function(){
  const week=new URL(location.href).searchParams.get('relight-og-week')||'';
  if(!/^\\d{4}-\\d\\d-\\d\\d$/.test(week))throw Error('Missing editorial week');
  if(typeof state==='undefined'||typeof inWeek!=='function'||typeof renderBoardOnly!=='function')
   throw Error('Viewer renderer not ready');
  // Await the published read-only data, independently of boot()'s timing.
  await document.fonts.ready;
  await refreshPublishedAgenda();
  state.week=week;state.page=0;state.lang='es';
  const events=inWeek().slice(0,7);
  const pictures=events.map(e=>imageFromSrc(effectiveEventLogo(e))).filter(Boolean);
  await Promise.all(pictures.map(pic=>pic.complete?Promise.resolve():new Promise(resolve=>{
   const done=()=>{pic.removeEventListener('load',done);pic.removeEventListener('error',done);clearTimeout(timeout);resolve();};
   const timeout=setTimeout(done,7000);
   pic.addEventListener('load',done,{once:true});
   pic.addEventListener('error',done,{once:true});
   if(pic.complete)done();
  })));
  state.week=week;state.page=0;state.lang='es';
  // Isolate canvas from responsive CSS/parent scale for a full 1080px capture.
  const board=document.getElementById('board');
  if(!board||board.width!==1080||board.height!==1080)throw Error('Canvas mismatch');
  render=renderBoardOnly;
  document.body.replaceChildren(board);
  document.documentElement.style.cssText='width:1080px;height:1080px;margin:0;padding:0;overflow:hidden;';
  document.body.style.cssText='width:1080px;height:1080px;margin:0;padding:0;overflow:hidden;background:#050E32;';
  board.style.cssText='position:fixed;top:0;left:0;display:block;width:1080px;height:1080px;max-width:none;max-height:none;transform:none;margin:0;padding:0;border:0;';
  renderBoardOnly();
  board.dataset.relightOgReady='1';
 })().catch(function(err){
  document.documentElement.dataset.relightOgError=String(err&&err.message||err).slice(0,120);
 });
})();`;

export function isValidSocialPNG(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<24||bytes.byteLength>MAX_PNG_BYTES)return false;
 const sig=[137,80,78,71,13,10,26,10];
 if(sig.some((v,i)=>bytes[i]!==v))return false;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 return view.getUint32(16)===1080&&view.getUint32(20)===1080;
}

export async function generateDailySocialPreview(env,now=new Date()){
 if(!env.DB)return {ok:false,reason:'DATABASE_NOT_CONFIGURED'};
 if(typeof env.BROWSER?.quickAction!=='function')return {ok:false,reason:'BROWSER_RUN_NOT_CONFIGURED'};
 if(env.SOCIAL_PREVIEW_PAUSED==='true')return {ok:false,reason:'PAUSED'};
 const week=socialPreviewMonday(now);
 const initial=await env.DB.prepare('SELECT revision FROM terminal_state WHERE id=1').first();
 if(!initial||initial.revision<1)return {ok:false,reason:'NO_PUBLISHED_AGENDA'};
 const url=SOCIAL_PREVIEW_ORIGIN+'/departures/?relight-og-week='+encodeURIComponent(week);
 const capture=await env.BROWSER.quickAction('screenshot',{
  url,
  viewport:{width:1080,height:1080,deviceScaleFactor:1},
  gotoOptions:{waitUntil:'networkidle2',timeout:45000},
  actionTimeout:60000,
  addScriptTag:[{content:SOCIAL_CAPTURE_JS}],
  waitForSelector:{selector:'#board[data-relight-og-ready="1"]',visible:true,timeout:45000},
  screenshotOptions:{type:'png',encoding:'binary',fullPage:false},
  selector:'#board'
 });
 if(!capture?.ok)return {ok:false,reason:'BROWSER_CAPTURE_FAILED',status:capture?.status||0};
 const png=new Uint8Array(await capture.arrayBuffer());
 if(!isValidSocialPNG(png))return {ok:false,reason:'INVALID_1080_PNG',size:png.length};
 // If the owner published a new revision during capture, never overwrite it
 // with a screenshot based on the older public agenda.
 const latest=await env.DB.prepare('SELECT revision FROM terminal_state WHERE id=1').first();
 if(latest?.revision!==initial.revision)return {ok:false,reason:'AGENDA_CHANGED_DURING_CAPTURE'};
 if(socialPreviewMonday(new Date())!==week)return {ok:false,reason:'WEEK_ROLLED_DURING_CAPTURE'};
 await env.DB.prepare(
  "INSERT INTO terminal_preview (id,week,mime,payload,updated_at) VALUES (1,?,'image/png',?,?) "+
  "ON CONFLICT(id) DO UPDATE SET week=excluded.week,mime=excluded.mime,payload=excluded.payload,updated_at=excluded.updated_at"
 ).bind(week,png,new Date().toISOString()).run();
 return {ok:true,week,revision:initial.revision,bytes:png.length};
}

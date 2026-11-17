import {artworkCandidates} from './activity-art-match.mjs';
/**
 * Public-only visual layer for the self-contained 4.5 MB Terminal viewer.
 * This is injected at the Worker HTML response; never publishes the private editor.
 * The agenda, D1 schema, API and YouTube synchronization remain untouched.
 */
export const VIEWER_CSS = `
.flight-row-top{grid-template-columns:5px minmax(0,1fr) 100px;align-items:stretch}
/* Restore the legacy status LED: align-items:start collapsed its auto-height to zero. */
.flight-row-top>.flight-light{align-self:stretch;min-height:36px}
.flight-row-top .flight-dateblock{min-width:0}
.flight-category-box{width:100px;min-height:116px;border-radius:9px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#09173e;border:1px solid #33558d}
.flight-category-box.is-fallback{background:linear-gradient(145deg,#4c265e 0%,#172f69 55%,#071532 100%);border-color:#9065a6}
.flight-row-top>.flight-category-box{grid-column:3;grid-row:1;justify-self:stretch;align-self:start;min-width:0}
.flight-category-box img{display:block;width:100%;height:116px;object-fit:contain}
.flight-category-box img.padoru-cover{object-fit:cover;object-position:center}
.flight-category-box .category-placeholder{font-size:11px;line-height:1.3;padding:10px;color:#d6c8ec;text-align:center;overflow-wrap:anywhere}
@media(max-width:390px){.flight-row-top{grid-template-columns:5px minmax(0,1fr) 76px}.flight-category-box{width:76px;min-height:98px}.flight-category-box img{height:98px}.flight-name{font-size:18px}}

/* Relight public identity v1: exterior only. Never style #board, hit layer,
   row selectors, compact controls, canvas, status LEDs or status pills. */
body:not(.embedded){background:#020C41;color:#fff;font-family:Garnett,Arial,"Noto Sans JP Project",sans-serif}
body:not(.embedded) .viewer-header{border-bottom:2px solid #FA0073;padding:0 0 4px;height:55px}
body:not(.embedded) .title-line{color:#fff;font-weight:600;letter-spacing:.045em}
body:not(.embedded) .subline,body:not(.embedded) .week-label{color:#A5EBFF}
body:not(.embedded) .panel-side{background:#0B1761;border:1px solid #276EF1;border-radius:8px;box-shadow:none;padding:clamp(14px,1.45vw,23px)}
body:not(.embedded) .panel-mode>.card-label,body:not(.embedded) .panel-intro .card-label{color:#A5EBFF}
body:not(.embedded) .panel-intro,body:not(.embedded) #flightTitle{border-bottom:2px solid #FA0073;padding-bottom:10px}
body:not(.embedded) .side-title{font-weight:600;color:#fff;letter-spacing:-.02em}
body:not(.embedded) .top-langs button,body:not(.embedded) .bottom-controls button,body:not(.embedded) .embed-code-row button,body:not(.embedded) .close-flight{background:#0B1761;border:1px solid #276EF1;border-radius:6px;color:#fff}
body:not(.embedded) .top-langs button.active,body:not(.embedded) .top-langs button:hover,body:not(.embedded) .bottom-controls button:hover:not(:disabled),body:not(.embedded) .embed-code-row button:hover,body:not(.embedded) .close-flight:hover{background:#276EF1;color:#fff}
body:not(.embedded) .discord-btn{background:#536ee5;border-radius:6px;color:white}
body:not(.embedded) .discord-btn:hover{background:#708afa;outline:1px solid #A5EBFF}
body:not(.embedded) .embed-code-row textarea{background:#020C41;border:1px solid #276EF1;border-radius:6px;color:#A5EBFF}
body:not(.embedded) .embed-tools label{color:#A5EBFF}
body:not(.embedded) .top-langs button:focus-visible,body:not(.embedded) .bottom-controls button:focus-visible,body:not(.embedded) .discord-btn:focus-visible,body:not(.embedded) .embed-code-row button:focus-visible{outline:2px solid #A5EBFF;outline-offset:2px}
@media(max-width:1120px){body:not(.embedded) .viewer-header{height:auto;min-height:55px}}
@media(max-width:590px){body:not(.embedded) .viewer-header{padding:8px 9px}body:not(.embedded) .panel-side{padding:16px}}

/* Stage 12: hide only the obsolete non-iframe sharing fields. Keep nodes alive: old JS translates and binds them. */
#plainLabel,.embed-code-row:has(#plainCode){display:none!important}
/* Stage 12 follow-up: the public viewer is already HTTPS. Remove only its obsolete publishing reminder in ES/EN/JA; keep iframe controls. */
#embedHint{display:none!important}

/* Stage 38: portal chrome around the existing 1080-square public board.
   The canvas, board hit targets, state LEDs and publishing engine are untouched. */
body:not(.embedded) .kg-site-header{background:#020C41;color:#fff;min-height:64px;padding:12px clamp(14px,3vw,40px);display:flex;gap:26px;align-items:center;justify-content:space-between;border-bottom:1px solid #276EF1}
body:not(.embedded) .kg-site-header .kg-brand{font-size:24px;font-weight:750;letter-spacing:-.03em;text-decoration:none;color:#fff}
body:not(.embedded) .kg-site-links{display:flex;gap:24px;align-items:center;flex-wrap:wrap;font-size:14px;font-weight:650}
body:not(.embedded) .kg-site-links a{color:#D7D2FF;text-decoration:none}
body:not(.embedded) .kg-site-links a[aria-current="page"]{color:#A5EBFF;border-bottom:2px solid #276EF1;padding-bottom:5px}
body:not(.embedded) .kg-site-header a:focus-visible,body:not(.embedded) .kg-terminal-footer a:focus-visible{outline:2px solid #A5EBFF;outline-offset:3px}
body:not(.embedded) .viewer-shell{max-width:1510px;grid-template-columns:minmax(0,1fr) minmax(270px,320px);gap:clamp(12px,1.6vw,24px);align-items:start}
body:not(.embedded) .kg-terminal-intro{grid-column:1/-1;min-width:0;padding:14px 0 2px}
body:not(.embedded) .kg-terminal-intro .kg-kicker{font-size:12px;letter-spacing:.11em;font-weight:700;color:#A5EBFF;margin:0 0 5px}
body:not(.embedded) .kg-terminal-intro h1{font-size:clamp(32px,4vw,56px);line-height:1.1;margin:0;font-weight:700}
body:not(.embedded) .kg-terminal-intro p:last-child{font-size:13px;color:#D7D2FF;margin:8px 0 0}
body:not(.embedded) .stage{grid-column:1;min-width:0}
body:not(.embedded) .panel-side{grid-column:2;min-width:0}
body:not(.embedded) .kg-board-label{box-sizing:border-box;width:100%;background:#276EF1;color:#fff;font-size:clamp(13px,1.3vw,17px);font-weight:700;padding:12px 16px;border-radius:7px 7px 0 0;letter-spacing:.01em}
body:not(.embedded) .kg-waiting-copy{color:#D7D2FF;font-size:14px;line-height:1.55;margin:0 0 3px}
body:not(.embedded) .kg-share-link{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
body:not(.embedded) .kg-share-link button{color:#fff;background:#276EF1;border:1px solid #A5EBFF;border-radius:6px;padding:9px 12px;cursor:pointer}
body:not(.embedded) .kg-share-result{color:#A5EBFF;font-size:12px}
body:not(.embedded) .kg-status-legend{border-top:1px solid #276EF1;padding-top:12px;display:flex;flex-wrap:wrap;gap:7px 12px;font-size:11px;color:#D7D2FF}
body:not(.embedded) .kg-status-legend span::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;background:#A5EBFF}
body:not(.embedded) .kg-status-legend span:nth-child(1)::before{background:#5AD28C}
body:not(.embedded) .kg-status-legend span:nth-child(2)::before{background:#FFDC8C}
body:not(.embedded) .kg-status-legend span:nth-child(3)::before{background:#A5EBFF}
body:not(.embedded) .kg-status-legend span:nth-child(4)::before{background:#D7D2FF}
body:not(.embedded) .kg-terminal-footer{max-width:1510px;margin:0 auto;padding:22px clamp(12px,2vw,28px) 36px;border-top:1px solid #276EF1;color:#D7D2FF}
body:not(.embedded) .kg-terminal-footer nav{display:flex;align-items:center;flex-wrap:wrap;gap:16px}
body:not(.embedded) .kg-terminal-footer nav>a{color:#A5EBFF;font-size:13px;text-decoration:none}
body:not(.embedded) .kg-terminal-footer .discord-btn{width:auto;margin-left:auto;text-decoration:none;font-size:12px;padding:9px 12px}
@media(max-width:860px){
 body:not(.embedded) .viewer-shell{display:flex;flex-direction:column;gap:14px;padding:12px}
 body:not(.embedded) .viewer-shell>.stage,body:not(.embedded) .viewer-shell>.panel-side{width:100%;max-width:none}
 body:not(.embedded) .panel-side{position:static;top:auto}
 body:not(.embedded) .kg-terminal-intro{padding:10px 2px 0;width:100%}
 body:not(.embedded) .kg-site-header{padding:12px 14px;flex-wrap:wrap;gap:8px 18px}
 body:not(.embedded) .kg-site-links{gap:15px;font-size:12px}
 body:not(.embedded) .kg-board-label{padding:9px 12px}
}
@media(max-width:650px){
 body:not(.embedded) .panel-side{border-radius:8px;margin:0;padding:14px}
 body:not(.embedded) #informationPanel .embed-tools,body:not(.embedded) #informationPanel .kg-status-legend{display:none!important}
 body:not(.embedded) .kg-terminal-footer{padding:15px 12px 30px}
 body:not(.embedded) .kg-terminal-footer nav{gap:12px}
 body:not(.embedded) .kg-terminal-footer .discord-btn{margin-left:0}
}
`;

// Classic script runs after the viewer's original inline script, preserving its
// existing state, translations, interactions and embedded board behavior.
export const VIEWER_JS = `(function(){
 'use strict';
 if(typeof draw!=='function'||typeof text!=='function'||typeof showSelectedFlight!=='function'||typeof syncChrome!=='function')return;
 const baseDraw=draw,baseText=text,baseFlight=showSelectedFlight,baseChrome=syncChrome;
 // Wrangler/esbuild may inject __name() into nested functions before this
 // matcher is serialized. Function.toString() loses the original bundler scope,
 // so provide the same name helper in the browser closure (never globally).
 const __name=(target,name)=>Object.defineProperty(target,'name',{value:name,configurable:true});
 const editorialMatches=${artworkCandidates.toString()};
 let drawnEvents=[];
 function clock(e){
  if(!e||!/^\\d\\d:\\d\\d$/.test(e.time||''))return null;
  const millis=scheduledAtMs(e);
  if(!Number.isFinite(millis))return null;
  const d=new Date(millis),local=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  const [y,m,day]=(e.day||'').split('-').map(Number);
  const shifted=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(y,m-1,day))/86400000);
  return {local,reference:e.time,shifted,different:d.getTimezoneOffset()!==360};
 }
 draw=function(list,total,pages){
  drawnEvents=list||[];
  try{return baseDraw(list,total,pages);}finally{drawnEvents=[];}
 };
 text=function(value,x,y,size,color,weight,limit,track){
  // The original 1080-square canvas renders TIME at x=643, y=301+88*n.
  // Intercept that single cell, leaving all other board visuals unchanged.
  if(x===643&&y===248){
   return baseText(({es:'HORA LOCAL',en:'LOCAL TIME',ja:'現地時間'})[state.lang]||'LOCAL TIME',x,y,10,color,weight,limit,track);
  }
  const i=Math.round((y-301)/88);
  if(x===643&&i>=0&&i<drawnEvents.length&&y===301+i*88){
   const info=clock(drawnEvents[i]);
   if(info){
    const label=info.local+(info.shifted?(info.shifted>0?' +':' ')+info.shifted:'');
    baseText(label,x,y,info.shifted?16:21,color,weight,limit,info.shifted?0:track);
    if(info.different)baseText(info.reference+' UTC−6',x,y+27,9,'#9DB9E8',400,undefined,0);
    return;
   }
  }
  return baseText(value,x,y,size,color,weight,limit,track);
 };
 function coverFor(e,tr){
  const box=document.createElement('div');box.className='flight-category-box';
  const pic=document.createElement('img');pic.loading='eager';pic.decoding='async';pic.width=100;pic.height=116;pic.alt=tr.category||'Activity artwork';
  const editorial=editorialMatches(e,libraryEntries());
  // Stage 19: an uploaded calendar logo is NOT the category cover.
  // The official category comes first; only then choose matching library art.
  // Just Chatting / Entertainment may yield ONLY to library Karaoke or Padoru.
  const hasPlatform=(e.platforms||[]).some(p=>p==='yt'||p==='tw');
  const placeholder=()=>{
   pic.remove();
   if(!box.querySelector('.category-placeholder')){
    const txt=document.createElement('span');txt.className='category-placeholder';
    txt.textContent=e.category||e.title||'';box.append(txt);
   }
  };
  const tried=new Set();
  let pending=[];
  const next=()=>{
   const src=pending.shift();
   if(!src){placeholder();return;}
   if(tried.has(src)){next();return;}
   tried.add(src);
   const label=box.querySelector('.category-placeholder');
   if(label)label.remove();
   if(!box.contains(pic))box.prepend(pic);
   box.classList.add('is-fallback');
   // Cover the entire portrait category cell only when this is Padoru art.
   const padoruArt=libraryEntries().find(item=>item.id==='collab-padoru')?.img;
   pic.className=padoruArt&&src===padoruArt?'padoru-cover':'';
   pic.src=src;
  };
  pic.onerror=next;
  const choose=(v)=>{
   // The Worker confirms authentic Twitch art and rejects the grey gamepad.
   const official=typeof v?.artUrl==='string'&&v.artUrl.startsWith('https://static-cdn.jtvnw.net/ttv-boxart/')?v.artUrl:null;
   const categoryArt=v?.source==='category'?official:null;
   const titleArt=v?.source==='title'?official:null;
   // Only the two user-approved exceptions can supersede generic chat art.
   // For generic YouTube Gaming/unknown labels, a title-inferred real game
   // cover precedes a generic library icon, but never a specific category.
   const sources=editorial.isGenericChat?
    [editorial.specialTitle,categoryArt,editorial.category,editorial.general]:
    editorial.isBroadCategory?
    [categoryArt,titleArt,editorial.category,editorial.title,editorial.general]:
    [categoryArt,editorial.category,titleArt,editorial.title,editorial.general];
   pending=[...new Set(sources.filter(x=>typeof x==='string'&&x))];
   next();
  };
  // Resolve official cover BEFORE accepting a library fallback. This remains
  // a read-only public lookup by published event ID (including YouTube-only).
  if(hasPlatform){
   const api=location.pathname.startsWith('/departures/')?'/departures/api/public/twitch-box-art':'/api/public/twitch-box-art';
   fetch(api+'?eventId='+encodeURIComponent(e.id),{credentials:'omit'})
    .then(r=>r.ok?r.json():null).then(choose).catch(()=>choose(null));
  }else choose(null);
  return box;
 }
 // The legacy renderer replaces #flightContent on every refresh, and can be
 // invoked through paths that bypass a function wrapper. Hydrate the REAL panel
 // idempotently, independently of which rendering path was taken.
 function hydrateFlightArtwork(visible){
  const host=document.querySelector('#flightContent');
  const top=host?.querySelector('.flight-row-top')||document.querySelector('#flightContent .flight-row-top');
  if(!host||!top||top.querySelector('.flight-category-box')||!selectedFlightId)return;
  const rows=Array.isArray(visible)?visible:(typeof getVisible==='function'?getVisible().visible:[]);
  const e=rows.find(v=>v.id===selectedFlightId&&flightSelectable(v));
  if(!e)return;
  const tr=FLIGHT_TRANSLATIONS[state.lang];
  top.append(coverFor(e,tr));
  const c=clock(e);
  if(c&&c.different){
   const times=top.querySelectorAll('.flight-meta');
   const line=times[times.length-1];
   if(line)line.textContent=c.local+' · '+({es:'HORA LOCAL',en:'LOCAL TIME',ja:'現地時間'})[state.lang]+' · '+c.reference+' UTC−6';
  }
 }
 showSelectedFlight=function(visible){
  const result=baseFlight(visible);
  hydrateFlightArtwork(visible);
  return result;
 };
 // Observe only direct content replacement. Appending the image inside
 // .flight-row-top cannot retrigger this observer or cause a render loop.
 if(typeof MutationObserver==='function'){
  const host=document.querySelector('#flightContent');
  if(host)new MutationObserver(()=>hydrateFlightArtwork()).observe(host,{childList:true});
 }
 syncChrome=function(){
  const ret=baseChrome();
  if(document.documentElement)document.documentElement.lang=state.lang;
  document.title=({es:'Salidas | KGBlaze',en:'Departures | KGBlaze',ja:'出発 | KGBlaze'})[state.lang]||'Salidas | KGBlaze';
  portalChromeSync();
  return ret;
 };
 // Share the chosen locale with Rebel Mix, without changing the viewer URL.
 const localeKey='kgblaze.locale.v1';
 const validLocale=l=>['es','en','ja'].includes(l);
 if(typeof setLang==='function'){
 const originalSetLang=setLang;
 const persistLocale=l=>{try{localStorage.setItem(localeKey,l)}catch{}try{document.cookie='kgblaze_lang='+l+'; Path=/; Max-Age=31536000; SameSite=Lax'}catch{}};
 setLang=function(l){if(!validLocale(l))return;persistLocale(l);return originalSetLang(l)};
 let preferred=null;try{preferred=localStorage.getItem(localeKey)}catch{}
 if(validLocale(preferred)&&preferred!==state.lang)originalSetLang(preferred);
 window.addEventListener('storage',e=>{if(e.key===localeKey&&validLocale(e.newValue)&&e.newValue!==state.lang)originalSetLang(e.newValue)});
 }

 // Stage 38: build a separate, public-only portal shell around the real board.
 // No mock schedule, no iframe replacement and no changes to viewer state.
 function mountPortalChrome(){
  if(typeof location==='undefined'||location.hostname!=='kgblaze.dpdns.org'||!document.body?.classList||document.body.classList.contains('embedded'))return;
  const main=document.querySelector('#viewerShell'),stage=main?.querySelector('.stage');
  const waiting=document.querySelector('#waitingPanel'),board=document.querySelector('#boardWrap');
  if(!main||!stage||!waiting||!board||document.querySelector('.kg-site-header'))return;
  const nav=document.createElement('nav');nav.className='kg-site-header';nav.setAttribute('aria-label','Navegación KGBlaze');
  nav.innerHTML='<a class="kg-brand" href="/">KGBlaze</a><div class="kg-site-links"><a href="/" id="kg-nav-home">Inicio</a><a href="/music/">Rebel Mix</a><a href="/departures/" id="kg-nav-departures" aria-current="page">Salidas</a></div>';
  document.body.insertBefore(nav,main);
  const intro=document.createElement('section');intro.className='kg-terminal-intro';
  intro.innerHTML='<p class="kg-kicker" id="kg-terminal-kicker">KGBlaze · Centro de información</p><h1 id="kg-terminal-title">Salidas</h1><p id="kg-terminal-subtitle">Terminales A y B</p>';
  main.insertBefore(intro,main.firstChild);
  const cap=document.createElement('div');cap.className='kg-board-label';cap.id='kg-board-label';cap.textContent='Información de vuelo · Flight status';
  stage.insertBefore(cap,board);
  const description=document.createElement('p');description.className='kg-waiting-copy';description.id='kg-waiting-copy';description.textContent='Selecciona una salida para consultar sus detalles.';
  waiting.querySelector('.panel-intro')?.insertAdjacentElement('afterend',description);
  const row=document.createElement('div');row.className='kg-share-link';
  row.innerHTML='<button type="button" id="kg-copy-link">Copiar enlace</button><span class="kg-share-result" id="kg-copy-result" role="status" aria-live="polite"></span>';
  waiting.querySelector('.embed-tools')?.insertAdjacentElement('beforebegin',row);
  const legend=document.createElement('div');legend.className='kg-status-legend';legend.id='kg-status-legend';legend.setAttribute('aria-label','Leyenda de estados');
  legend.innerHTML='<span>A tiempo</span><span>Por confirmar</span><span>En vivo</span><span>Despegó</span>';
  waiting.append(legend);
  const footer=document.createElement('footer');footer.className='kg-terminal-footer';
  footer.innerHTML='<nav aria-label="Enlaces institucionales"><a href="/">KGBlaze</a><a href="/music/">Rebel Mix</a></nav>';
  const discord=document.querySelector('#discordLink');if(discord)footer.querySelector('nav').append(discord);
  document.body.append(footer);
  const copy=document.querySelector('#kg-copy-link');
  copy?.addEventListener('click',async()=>{
   const feedback=document.querySelector('#kg-copy-result');
   try{await navigator.clipboard.writeText('https://kgblaze.dpdns.org/departures/');if(feedback)feedback.textContent=({es:'Enlace copiado',en:'Link copied',ja:'リンクをコピーしました'})[state.lang];}
   catch{if(feedback)feedback.textContent=({es:'No se pudo copiar',en:'Unable to copy',ja:'コピーできませんでした'})[state.lang];}
  });
 }
 function portalChromeSync(){
  if(!document.querySelector('.kg-site-header'))return;
  const loc=state.lang;
  const copy={
   es:{home:'Inicio',departures:'Salidas',sub:'Terminales A y B',kicker:'KGBlaze · Centro de información',flight:'Información de vuelo · Flight status',waiting:'Selecciona una salida para consultar sus detalles.',copy:'Copiar enlace',legend:['A tiempo','Por confirmar','En vivo','Despegó']},
   en:{home:'Home',departures:'Departures',sub:'Terminals A and B',kicker:'KGBlaze · Information Center',flight:'Flight information · Flight status',waiting:'Select a departure to see its details.',copy:'Copy link',legend:['On time','To be confirmed','Live','Departed']},
   ja:{home:'ホーム',departures:'出発',sub:'ターミナルA・B',kicker:'KGBlaze · インフォメーションセンター',flight:'フライト情報 · Flight status',waiting:'出発便を選択すると詳細を確認できます。',copy:'リンクをコピー',legend:['定刻','確認待ち','配信中','出発済み']}
  }[loc]||null;if(!copy)return;
  const set=(sel,txt)=>{const el=document.querySelector(sel);if(el)el.textContent=txt};
  set('#kg-nav-home',copy.home);set('#kg-nav-departures',copy.departures);
  set('#kg-terminal-title',copy.departures);set('#kg-terminal-subtitle',copy.sub);
  set('#kg-terminal-kicker',copy.kicker);set('#kg-board-label',copy.flight);
  set('#kg-waiting-copy',copy.waiting);set('#kg-copy-link',copy.copy);
  set('#sideKicker',copy.kicker);set('#flightKicker',copy.kicker);
  document.querySelectorAll('#kg-status-legend span').forEach((el,i)=>{if(copy.legend[i])el.textContent=copy.legend[i]});
 }
 mountPortalChrome();

 if(document.documentElement)document.documentElement.lang=state.lang;
 syncChrome();
})();`;

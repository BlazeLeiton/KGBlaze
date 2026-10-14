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
.flight-category-box .category-placeholder{font-size:11px;line-height:1.3;padding:10px;color:#d6c8ec;text-align:center;overflow-wrap:anywhere}
@media(max-width:390px){.flight-row-top{grid-template-columns:5px minmax(0,1fr) 76px}.flight-category-box{width:76px;min-height:98px}.flight-category-box img{height:98px}.flight-name{font-size:18px}}
/* Stage 12: hide only the obsolete non-iframe sharing fields. Keep nodes alive: old JS translates and binds them. */
#plainLabel,.embed-code-row:has(#plainCode){display:none!important}
/* Stage 12 follow-up: the public viewer is already HTTPS. Remove only its obsolete publishing reminder in ES/EN/JA; keep iframe controls. */
#embedHint{display:none!important}
`;

// Classic script runs after the viewer's original inline script, preserving its
// existing state, translations, interactions and embedded board behavior.
export const VIEWER_JS = `(function(){
 'use strict';
 if(typeof draw!=='function'||typeof text!=='function'||typeof showSelectedFlight!=='function'||typeof syncChrome!=='function')return;
 const baseDraw=draw,baseText=text,baseFlight=showSelectedFlight,baseChrome=syncChrome;
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
  // An image explicitly selected for this event remains authoritative.
  const choice=e.logoChoice||'auto';
  const explicit=choice==='upload'||choice.startsWith('lib:')?effectiveEventLogo(e):null;
  const categoryArt=explicit||editorial.category;
  const titleArt=editorial.title||(choice==='auto'?effectiveEventLogo(e):null);
  const general=editorial.general;
  const placeholder=()=>{
   pic.remove();
   if(!box.querySelector('.category-placeholder')){
    const txt=document.createElement('span');txt.className='category-placeholder';
    txt.textContent=e.category||e.title||'';box.append(txt);
   }
  };
  const showSources=(sources)=>{
   // A previously exhausted candidate list may have detached the <img>.
   // Reattach it before a later successful asynchronous category lookup.
   const pending=[...new Set(sources.filter(src=>typeof src==='string'&&src))];
   const placeholderNode=box.querySelector('.category-placeholder');
   if(placeholderNode)placeholderNode.remove();
   if(!box.contains(pic))box.prepend(pic);
   const next=()=>{
    const src=pending.shift();
    if(!src){placeholder();return;}
    box.classList.add('is-fallback');
    pic.src=src;
   };
   pic.onerror=next;
   next();
  };
  box.append(pic);
  // A valid library title alias outranks only Just Chatting / Entertainment.
  // Explicit per-event artwork stays first, with the same fallback policy.
  if(editorial.titleBeforeGenericCategory){
   showSources(explicit?[explicit,titleArt,editorial.category,general]:[editorial.title,editorial.category,general]);
   return box;
  }
  if(categoryArt){showSources([categoryArt,titleArt,general]);return box;}
  if(!(e.platforms||[]).some(p=>p==='yt'||p==='tw')){
   showSources([titleArt,general]);return box;
  }
  // Only published event IDs are accepted by the Worker, including YouTube-only entries.
  const api=location.pathname.startsWith('/departures/')?'/departures/api/public/twitch-box-art':'/api/public/twitch-box-art';
  fetch(api+'?eventId='+encodeURIComponent(e.id),{credentials:'omit'})
   .then(r=>r.ok?r.json():null)
   .then(v=>{
    const official=typeof v?.artUrl==='string'&&v.artUrl.startsWith('https://static-cdn.jtvnw.net/ttv-boxart/')?v.artUrl:null;
    const byCategory=v?.source==='category'?official:null;
    const byTitle=v?.source==='title'?official:null;
    // Category always wins over the title: official category art precedes title aliases.
    showSources([byCategory,titleArt,byTitle,general]);
   }).catch(()=>showSources([titleArt,general]));
  return box;
 }
 showSelectedFlight=function(visible){
  baseFlight(visible);
  if(!selectedFlightId)return;
  const e=visible.find(v=>v.id===selectedFlightId&&flightSelectable(v));
  const top=document.querySelector('#flightContent .flight-row-top');
  if(!e||!top)return;
  const tr=FLIGHT_TRANSLATIONS[state.lang];
  top.append(coverFor(e,tr));
  const c=clock(e);
  if(c&&c.different){
   const times=top.querySelectorAll('.flight-meta');
   const line=times[times.length-1];
   if(line)line.textContent=c.local+' · '+({es:'HORA LOCAL',en:'LOCAL TIME',ja:'現地時間'})[state.lang]+' · '+c.reference+' UTC−6';
  }
 };
 syncChrome=function(){
  const ret=baseChrome();
  document.title=({es:'Salidas | KGBlaze',en:'Departures | KGBlaze',ja:'出発 | KGBlaze'})[state.lang]||'Salidas | KGBlaze';
  return ret;
 };
 syncChrome();
})();`;

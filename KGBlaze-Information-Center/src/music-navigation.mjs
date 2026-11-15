export const musicNavigationScript=String.raw`(function(){
'use strict';
const main=document.querySelector('main.shell'), initial=main.querySelector('#music-content');
if(!initial)return;
const cache=new Map(), inflight=new Map(), maxCache=32;
const normalize=value=>{const u=new URL(value,location.href);u.searchParams.delete('fragment');if(!u.searchParams.has('lang'))u.searchParams.set('lang',document.documentElement.lang||'es');return u.pathname+'?'+u.searchParams.toString()};
const isMusic=u=>u.origin===location.origin&&/^\/music\/(?:[a-z0-9-]+\/?)?$/.test(u.pathname);
const isDetail=u=>u.pathname.split('/').filter(Boolean).length===2;
let catalog=initial.dataset.view==='catalog'?initial:null, active=null, overlay=null, closeTimer=0, request=0, priorFocus=null, catalogURL=catalog?normalize(location.href):'/music/?lang='+initial.dataset.locale;
let currentURL=normalize(location.href), busy=false, openedFromCatalog=false;
const remember=(k,v)=>{cache.delete(k);cache.set(k,v);if(cache.size>maxCache)cache.delete(cache.keys().next().value)};
remember(currentURL,initial.outerHTML);
function fetchFragment(value){
 const k=normalize(value);if(cache.has(k))return Promise.resolve(cache.get(k));if(inflight.has(k))return inflight.get(k);
 const u=new URL(k,location.origin);u.searchParams.set('fragment','1');
 const p=fetch(u,{headers:{Accept:'text/html'},credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()}).then(h=>{if(!h.includes('id="music-content"'))throw Error('Invalid fragment');remember(k,h);return h}).finally(()=>inflight.delete(k));inflight.set(k,p);return p;
}
function parse(h){const t=document.createElement('template');t.innerHTML=h.trim();return t.content.querySelector('#music-content')}
function updateLocale(node,u){
 document.documentElement.lang=node.dataset.locale;document.title=node.dataset.title;
 const hero=main.querySelector('.hero p:last-child');if(hero)hero.textContent=node.dataset.descriptor;
 const footer=document.querySelector('.footer .preview');if(footer)footer.textContent=node.dataset.preview;
 document.querySelectorAll('.langs a').forEach((a,i)=>{const lang=['es','en','ja'][i],url=new URL(u,location.origin);url.searchParams.set('lang',lang);a.href=url.pathname+'?'+url.searchParams.toString();if(lang===node.dataset.locale)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
}
function shell(){
 if(overlay)return overlay;
 overlay=document.createElement('div');overlay.className='music-overlay';overlay.innerHTML='<div class="music-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="music-detail-title" tabindex="-1"></div>';overlay.addEventListener('click',e=>{if(e.target===overlay)closeDetail()});document.body.append(overlay);return overlay;
}
function openNode(node, u, opts={}){
 const wrap=shell(), panel=wrap.firstElementChild, wasOpen=wrap.classList.contains('is-open');
 clearTimeout(closeTimer);const previous=active, oldTop=panel.scrollTop;
 if(previous&&previous.dataset.slug===node.dataset.slug&&previous.dataset.version===node.dataset.version&&previous.dataset.locale===node.dataset.locale){const oldLyrics=previous.querySelector('.lyrics'),newLyrics=node.querySelector('.lyrics');if(oldLyrics&&newLyrics){oldLyrics.replaceWith(newLyrics);previous.querySelector('.detail-grid').className=node.querySelector('.detail-grid').className;previous.querySelectorAll('.music-detail-langs a').forEach((a,i)=>{const url=new URL(u,location.origin);url.searchParams.set('lang',['es','en','ja'][i]);a.href=url.pathname+'?'+url.searchParams.toString()});updateLocale(previous,u);panel.scrollTop=oldTop;prefetchChoices(previous);return;}}
 node.id='music-detail-content';
 if(previous&&previous.dataset.slug===node.dataset.slug&&previous.dataset.version===node.dataset.version){
   const oldStage=previous.querySelector('.video-stage'), newStage=node.querySelector('.video-stage');
   if(oldStage&&newStage&&oldStage.dataset.videoId===newStage.dataset.videoId&&oldStage.classList.contains('is-playing'))newStage.replaceWith(oldStage);
 }
 const heading=node.querySelector('.detail-title h1');if(heading)heading.id='music-detail-title';
 const back=node.querySelector('.back');if(back)back.setAttribute('data-close-detail','true');
 panel.replaceChildren(node);active=node;wrap.hidden=false;document.body.classList.add('music-modal-open');main.inert=true;document.querySelector('.footer').inert=true;document.querySelector('.header').inert=true;
 // Site locale links remain reachable inside the overlay without touching the background.
 const nav=document.createElement('nav');nav.className='music-detail-langs';nav.setAttribute('aria-label','Language');for(const lang of ['es','en','ja']){const a=document.createElement('a'),url=new URL(u,location.origin);url.searchParams.set('lang',lang);a.href=url.pathname+'?'+url.searchParams.toString();a.textContent=lang==='ja'?'JP':lang.toUpperCase();if(lang===node.dataset.locale)a.setAttribute('aria-current','true');nav.append(a)}node.prepend(nav);
 if(!wasOpen){panel.scrollTop=0;requestAnimationFrame(()=>wrap.classList.add('is-open'));panel.focus({preventScroll:true})}
 else{wrap.classList.add('is-open');panel.scrollTop=opts.preserve?oldTop:0;}
 updateLocale(node,u);
 // Related artwork is just three local images; load them now rather than blank screenshots.
 for(const img of node.querySelectorAll('.related img'))img.loading='eager';
 prefetchChoices(node);
}
function prefetchChoices(node){const links=[...node.querySelectorAll('.version-options a,.lyric-options a')].filter(a=>!a.hasAttribute('aria-current'));
 const prefetch=()=>{if(active===node)for(const a of links.slice(0,6))fetchFragment(a.href).catch(()=>{})};
 if('requestIdleCallback'in window)requestIdleCallback(prefetch,{timeout:700});else setTimeout(prefetch,80);
}
function readFilters(){const values={};for(const id of ['search','language','year','series','block','affiliation']){const el=document.getElementById(id);if(el)values[id]=el.value}values.list=!!document.getElementById('songs')?.classList.contains('list');return values}
function installCatalog(node,u,restore){
 if(catalog)catalog.replaceWith(node);else main.append(node);catalog=node;catalogURL=normalize(u);
 if(window.initMusicCatalog)window.initMusicCatalog(new URL(u,location.origin).searchParams,restore);
}
function ensureCatalog(u, restore){
 const url=new URL(u,location.origin);if(isDetail(url)){url.pathname='/music/';url.search='?lang='+url.searchParams.get('lang')}
 if(catalog&&catalog.dataset.locale===(url.searchParams.get('lang')||'es')&&normalize(url)===catalogURL)return Promise.resolve();
 return fetchFragment(url).then(h=>installCatalog(parse(h),url,restore));
}
function status(on){busy=on;document.body.classList.toggle('music-navigation-busy',on);if(overlay)overlay.firstElementChild.setAttribute('aria-busy',String(on))}
function commitURL(u,mode){if(mode==='push')history.pushState({music:true},'',u);else if(mode==='replace')history.replaceState({music:true},'',u);currentURL=normalize(u)}
async function navigate(value,mode='push'){
 const u=new URL(value,location.href), target=normalize(u), seq=++request;
 const previous=new URL(currentURL,location.origin), detail=isDetail(u);const same=detail&&active&&active.dataset.slug===u.pathname.split('/')[2];
 status(true);
 try{
  if(detail){
   const h=await fetchFragment(u);if(seq!==request)return;const node=parse(h);if(!node)throw Error('Invalid detail');
   if(!active){priorFocus=document.activeElement;openedFromCatalog=mode==='push'&&!!catalog;}
   commitURL(target,mode);openNode(node,u,{preserve:same});
   if(!catalog||catalog.dataset.locale!==node.dataset.locale)ensureCatalog('/music/?lang='+node.dataset.locale,readFilters()).catch(()=>{});
  }else{
   const restore=catalog&&catalog.dataset.locale!==u.searchParams.get('lang')?readFilters():null;
   await ensureCatalog(u,restore);if(seq!==request)return;
   commitURL(target,mode);hideOverlay();updateLocale(catalog,u);
  }
 }catch(err){if(seq===request){console.error(err);location.assign(target)}}
 finally{if(seq===request)status(false)}
}
function hideOverlay(){
 if(!overlay)return;overlay.classList.remove('is-open');document.body.classList.remove('music-modal-open');main.inert=false;document.querySelector('.footer').inert=false;document.querySelector('.header').inert=false;active=null;openedFromCatalog=false;
 clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!active){overlay.hidden=true;overlay.firstElementChild.replaceChildren()}},220);
 if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});priorFocus=null;
}
function closeDetail(){if(!active)return;const u=new URL(catalogURL,location.origin);u.searchParams.set('lang',active.dataset.locale);if(openedFromCatalog&&catalog?.dataset.locale===active.dataset.locale){openedFromCatalog=false;history.back();return}navigate(u,'replace')}
document.addEventListener('click',e=>{
 const play=e.target.closest('.video-play');if(play){const stage=play.closest('.video-stage[data-video-id]');if(stage){const id=stage.dataset.videoId;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;const f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1&rel=0&hl='+encodeURIComponent(document.documentElement.lang);f.title=play.dataset.title;f.referrerPolicy='strict-origin-when-cross-origin';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;stage.classList.add('is-playing');stage.replaceChildren(f);f.focus();return}}
 const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;const u=new URL(a.href,location.href);if(!isMusic(u))return;e.preventDefault();
 if(a.dataset.closeDetail){closeDetail();return}
 const mode=active&&isDetail(u)?'replace':'push';navigate(u,mode);
});
document.addEventListener('pointerover',e=>{const a=e.target.closest('.song>a:first-child,.version-options a,.lyric-options a');if(a&&isMusic(new URL(a.href,location.href)))fetchFragment(a.href).catch(()=>{})},{passive:true});
document.addEventListener('focusin',e=>{const a=e.target.closest('.song>a:first-child,.version-options a,.lyric-options a');if(a&&isMusic(new URL(a.href,location.href)))fetchFragment(a.href).catch(()=>{})});
document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();closeDetail()}if(e.key==='Tab'){const panel=overlay.firstElementChild, nodes=[...panel.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex="0"]')].filter(x=>x.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
window.addEventListener('popstate',()=>navigate(location.href,'none'));
if(initial.dataset.view==='detail'){initial.remove();openNode(initial,new URL(location.href));ensureCatalog(catalogURL).catch(()=>{});}
})();`;

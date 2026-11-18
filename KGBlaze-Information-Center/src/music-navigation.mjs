export const musicNavigationScript=String.raw`(function(){
'use strict';
const main=document.querySelector('main.shell'),initial=main.querySelector('#music-content');
if(!initial)return;
const locales=['es','en','ja'], key='kgblaze.locale.v1';
const valid=l=>locales.includes(l);
function saved(){try{return localStorage.getItem(key)}catch{return null}}
function save(l){try{localStorage.setItem(key,l)}catch{}try{document.cookie='kgblaze_lang='+l+'; Path=/; Max-Age=31536000; SameSite=Lax'}catch{}}
const slugOf=u=>{const p=new URL(u,location.href).pathname.split('/').filter(Boolean);return p[0]==='music'&&p[1]==='songs'&&p.length===3?p[2]:''};
const pathOf=slug=>slug?'/music/songs/'+slug+'/':'/music/songs/';
const isMusic=u=>u.origin===location.origin&&/^\/music\/songs(?:\/[a-z0-9-]+)?\/?$/.test(u.pathname);
const initialURL=new URL(location.href),legacy=initialURL.searchParams;
let locale=valid(legacy.get('lang'))?legacy.get('lang'):valid(saved())?saved():initial.dataset.locale;
save(locale);
let state={slug:initial.dataset.slug||'',version:legacy.get('version')||initial.dataset.version||'',lyric:legacy.get('lyric')||'',compare:legacy.get('compare')||''};
let catalog=initial.dataset.view==='catalog'?initial:null,active=null,overlay=null,closeTimer=0,seq=0,priorFocus=null,catalogScroll=0,fromCatalog=false;
const cache=new Map(),inflight=new Map(), selections=new Map();
if('scrollRestoration'in history)history.scrollRestoration='manual';
const dataPath=slug=>slug?'/music/data/song/'+slug+'.json':'/music/data/catalog.json';
function data(slug){
 const k=slug||'';if(cache.has(k))return Promise.resolve(cache.get(k));if(inflight.has(k))return inflight.get(k);
 const p=fetch(dataPath(k),{headers:{Accept:'application/json'},credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(v=>{if(v.kind!==(k?'song':'catalog'))throw Error('Invalid music data');cache.set(k,v);return v}).finally(()=>inflight.delete(k));inflight.set(k,p);return p;
}
function parse(h){const t=document.createElement('template');t.innerHTML=h.trim();return t.content.querySelector('#music-content')}
function readFilters(){const out={};for(const id of ['search','language','year','series','block','affiliation']){const el=document.getElementById(id);if(el)out[id]=el.value}out.list=!!document.getElementById('songs')?.classList.contains('list');return out}
function rewriteLinks(root){
 for(const a of root.querySelectorAll('a[href]')){if(a.dataset.musicIntent)continue;const u=new URL(a.href,location.href);if(!isMusic(u))continue;
  const p=u.searchParams, intent={slug:slugOf(u)};
  for(const k of ['version','lyric','compare','series','block','affiliation','search'])if(p.has(k))intent[k]=p.get(k);
  if(a.closest('.langs,.music-detail-langs')&&valid(p.get('lang')))intent.locale=p.get('lang');
  a.dataset.musicIntent=JSON.stringify(intent);a.href=pathOf(intent.slug);
 }
}
function chrome(node){
 const navText={
  es:{home:'Inicio',about:'Sobre Blaze',music:'Música ▾',musicPlain:'Música',community:'Comunidad ▾',communityPlain:'Comunidad',departures:'Salidas',close:'Cerrar menú',open:'Abrir menú lateral'},
  en:{home:'Home',about:'About Blaze',music:'Music ▾',musicPlain:'Music',community:'Community ▾',communityPlain:'Community',departures:'Departures',close:'Close menu',open:'Open side menu'},
  ja:{home:'ホーム',about:'Blazeについて',music:'音楽 ▾',musicPlain:'音楽',community:'コミュニティ ▾',communityPlain:'コミュニティ',departures:'出発',close:'メニューを閉じる',open:'メニューを開く'}
 }[locale];
 for(const node of document.querySelectorAll('[data-global-label]')){const value=navText[node.dataset.globalLabel];if(value)node.textContent=value}
 const menu=document.querySelector('.site-menu-trigger');if(menu)menu.setAttribute('aria-label',navText.open);
 document.documentElement.lang=locale;document.title=node.dataset.title;const hero=main.querySelector('.hero p:last-child');if(hero)hero.textContent=node.dataset.descriptor;
 const footer=document.querySelector('.footer .preview');if(footer)footer.textContent=node.dataset.preview;
 for(const [i,a] of [...document.querySelectorAll('.langs a')].entries()){const l=locales[i];a.href=pathOf(state.slug);a.dataset.musicIntent=JSON.stringify({locale:l});a.textContent=l==='ja'?'JP':l.toUpperCase();if(l===locale)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')}
}
function lyricView(node,v,st){
 const id=v.choices.includes(st.lyric)?st.lyric:v.defaultLyric,a=v.lyrics[id],other=v.allowCompare!==false&&v.choices.includes(st.compare)&&st.compare!==id?st.compare:'',b=v.lyrics[other];
 st.lyric=id;st.compare=a?.hasText&&b?.hasText?other:'';
 const section=node.querySelector('.lyrics'),heading=section.querySelector('h2');section.replaceChildren(heading);
 const el=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt)x.textContent=txt;return x};
 const markup=(parent,html)=>{const t=document.createElement('template');t.innerHTML=html;parent.append(t.content)};
 if(v.choices.length>1){const ctrl=el('div','lyric-controls'),opts=el('div','lyric-options');ctrl.append(el('span','eyebrow',v.chooseLabel),opts);const link=(l,c,label,selected)=>{const x=el('a','lyric-choice'+(selected?' selected':''),label);x.href=pathOf(st.slug);x.dataset.musicIntent=JSON.stringify({slug:st.slug,lyric:l,compare:c});if(selected)x.setAttribute('aria-current','true');opts.append(x)};
 for(const l of v.choices)link(l,'',v.lyrics[l].label,!st.compare&&l===id);
 if(v.allowCompare!==false)for(const l of v.choices.filter(l=>l!==id))link(id,l,v.compareLabel+(v.choices.length>2?' · '+v.lyrics[l].label:''),st.compare===l);
 section.append(ctrl);}
 node.querySelector('.detail-grid').classList.toggle('compare-view',!!st.compare);
 if(!st.compare){markup(section,a?.full||'');return}
 section.append(el('p','lyric-note',v.parallelNote));
 if(a.pairable&&b.pairable&&a.cells.length===b.cells.length){
  const pairs=el('div','parallel-pairs');for(let i=0;i<a.cells.length;i++){const row=el('div','parallel-pair');for(const l of [a,b]){const cell=el('div','parallel-stanza');cell.lang=l.lang;cell.append(el('span','parallel-lang',l.heading));markup(cell,l.cells[i]);row.append(cell)}pairs.append(row)}section.append(pairs);
 }else{const cols=el('div','parallel-columns');for(const l of [a,b]){const cell=el('div');markup(cell,l.full);cols.append(cell)}section.append(cols)}
}
function build(d,st){
 const all=d.locales[locale],v=all[st.version]||all[d.defaultVersion];st.version=all[st.version]?st.version:d.defaultVersion;
 const n=parse(v.html);rewriteLinks(n);lyricView(n,v,st);return n;
}
function shell(){if(overlay)return overlay;overlay=document.createElement('div');overlay.className='music-overlay';overlay.innerHTML='<div class="music-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="music-detail-title" tabindex="-1"></div>';overlay.hidden=true;document.body.append(overlay);return overlay}
function inert(on){main.inert=on;document.querySelector('.header').inert=on;document.querySelector('.footer').inert=on;document.body.classList.toggle('music-modal-open',on)}
function openNode(n,preserve=false){
 const wrap=shell(),panel=wrap.firstElementChild,wasOpen=wrap.classList.contains('is-open'),oldTop=panel.scrollTop;clearTimeout(closeTimer);const prev=active;
 if(prev&&prev.dataset.slug===n.dataset.slug&&prev.dataset.version===n.dataset.version&&prev.dataset.locale===n.dataset.locale){
  prev.querySelector('.lyrics').replaceWith(n.querySelector('.lyrics'));prev.querySelector('.detail-grid').className=n.querySelector('.detail-grid').className;panel.scrollTop=oldTop;chrome(prev);return;
 }
 n.id='music-detail-content';rewriteLinks(n);
 if(prev&&prev.dataset.slug===n.dataset.slug&&prev.dataset.version===n.dataset.version){const old=prev.querySelector('.video-stage'),fresh=n.querySelector('.video-stage');if(old&&fresh&&old.dataset.videoId===fresh.dataset.videoId&&old.classList.contains('is-playing'))fresh.replaceWith(old)}
 const h=n.querySelector('.detail-title h1');if(h)h.id='music-detail-title';
 const back=n.querySelector('.back');if(back)back.dataset.closeDetail='true';
 const nav=document.createElement('nav');nav.className='music-detail-langs';nav.setAttribute('aria-label','Language');for(const l of locales){const a=document.createElement('a');a.href=pathOf(state.slug);a.dataset.musicIntent=JSON.stringify({locale:l});a.textContent=l==='ja'?'JP':l.toUpperCase();if(l===locale)a.setAttribute('aria-current','true');nav.append(a)}n.prepend(nav);
 panel.replaceChildren(n);active=n;wrap.hidden=false;inert(true);
 if(!wasOpen){panel.scrollTop=0;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(active===n){wrap.classList.add('is-open');panel.focus({preventScroll:true})}}))}
 else{panel.scrollTop=preserve?oldTop:0;panel.focus({preventScroll:true})}
 for(const img of n.querySelectorAll('.related img'))img.loading='eager';chrome(n);
}
function installCatalog(d,filters){
 const n=parse(d.locales[locale]);rewriteLinks(n);if(catalog)catalog.replaceWith(n);else main.append(n);catalog=n;
 window.initMusicCatalog(new URLSearchParams(),filters);if(!active)chrome(n);
}
async function ensureCatalog(filters){if(catalog?.dataset.locale===locale)return;const d=await data('');installCatalog(d,filters)}
function historyState(mode){const value={music:true,selection:{...state},fromCatalog,filters:readFilters(),scroll:catalogScroll};const url=pathOf(state.slug);if(mode==='push')history.pushState(value,'',url);else history.replaceState(value,'',url)}
function hide(){if(!overlay)return;overlay.classList.remove('is-open');inert(false);active=null;clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!active){overlay.hidden=true;overlay.firstElementChild.replaceChildren()}},320);window.scrollTo(0,catalogScroll);if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});priorFocus=null}
async function showSong(next,mode='push'){
 const request=++seq,was=active,old=state;
 document.body.classList.add('music-navigation-busy');
 try{const d=await data(next.slug);if(request!==seq)return;
  if(!was){priorFocus=document.activeElement;catalogScroll=mode==='push'?window.scrollY:(history.state?.scroll||window.scrollY);if(mode==='push'){fromCatalog=!!catalog;if(fromCatalog)historyState('replace')}}
  state={...next};const n=build(d,state);selections.set(state.slug,{...state});historyState(mode);openNode(n,old.slug===state.slug);
 }catch(e){console.error(e);if(request===seq)location.assign(pathOf(next.slug))}
 finally{if(request===seq)document.body.classList.remove('music-navigation-busy')}
}
async function showCatalog(intent={},mode='replace'){
 const request=++seq;const old=readFilters();const filters={...old,...intent};delete filters.slug;
 if(intent.series||intent.block||intent.affiliation||intent.search){filters.search=intent.search||'';filters.language='';filters.year='';filters.series=intent.series||'';filters.block=intent.block||'';filters.affiliation=intent.affiliation||'';}
 await ensureCatalog(filters);if(request!==seq)return;state={slug:'',version:'',lyric:'',compare:''};fromCatalog=false;
 if(catalog&&(intent.series||intent.block||intent.affiliation||intent.search||mode==='pop'))window.initMusicCatalog(new URLSearchParams(),filters);
 hide();chrome(catalog);historyState(mode==='push'?'push':'replace');
}
function close(){if(!active)return;if(fromCatalog){history.back();return}showCatalog().catch(console.error)}
async function changeLocale(l){if(!valid(l)||l===locale)return;locale=l;save(l);const filters=readFilters();if(state.slug){await showSong(state,'replace');await ensureCatalog(filters)}else{await ensureCatalog(filters);chrome(catalog);historyState('replace')}}
document.addEventListener('click',e=>{
 const play=e.target.closest('.video-play');if(play){const stage=play.closest('.video-stage[data-video-id]');if(stage){const id=stage.dataset.videoId;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;const f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1&rel=0&hl='+locale;f.title=play.dataset.title;f.referrerPolicy='strict-origin-when-cross-origin';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;stage.classList.add('is-playing');stage.replaceChildren(f);f.focus();return}}
 const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;const u=new URL(a.href,location.href);if(!isMusic(u))return;e.preventDefault();
 if(a.dataset.closeDetail){close();return}
 const i=a.dataset.musicIntent?JSON.parse(a.dataset.musicIntent):{slug:slugOf(u)};if(i.locale){changeLocale(i.locale).catch(console.error);return}
 if(!i.slug){showCatalog(i,active?'replace':'push').catch(console.error);return}
 const same=i.slug===state.slug, prev=same?state:selections.get(i.slug)||{slug:i.slug,version:'',lyric:'',compare:''};const next={...prev,...i};if(i.version&&i.version!==prev.version&&!i.lyric){next.lyric='';next.compare=''}showSong(next,same||active?'replace':'push');
});
function preload(e){const a=e.target.closest('.song>a:first-child');if(a){const slug=slugOf(a.href);if(slug)data(slug).catch(()=>{})}}
document.addEventListener('pointerover',preload,{passive:true});document.addEventListener('focusin',preload);
document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const panel=overlay.firstElementChild,nodes=[...panel.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex="0"]')].filter(x=>x.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
window.addEventListener('popstate',e=>{const slug=slugOf(location.href),s=e.state?.selection;fromCatalog=!!e.state?.fromCatalog;if(slug)showSong(s?.slug===slug?s:{slug,version:'',lyric:'',compare:''},'replace');else showCatalog(e.state?.filters||{},'pop').catch(console.error)});
window.addEventListener('storage',e=>{if(e.key===key&&valid(e.newValue)&&e.newValue!==locale)changeLocale(e.newValue).catch(console.error)});
rewriteLinks(document);historyState('replace');
if(state.slug){initial.remove();openNode(initial);data(state.slug).then(d=>{if(state.slug===d.slug){const n=build(d,state);openNode(n,true);historyState('replace')}}).catch(console.error);ensureCatalog().catch(console.error)}
else{if(initial.dataset.locale!==locale)ensureCatalog(readFilters()).catch(console.error);else chrome(initial);data('').catch(()=>{});}
})();`;

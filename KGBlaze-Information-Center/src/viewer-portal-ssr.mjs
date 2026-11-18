import {KG_SOCIAL_ORIGINALS,KG_SOCIAL_URLS} from './music-social-icons.mjs';

/** Stage 38 V6: public-only, HTMLRewriter-rendered shell for the *existing* viewer.
 * Unlike the old JS-only wrapper, the approved layout exists before JS executes.
 * Never inject this markup into ?embed=1 or the original workers.dev host.
 */
const takeoff='<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2 2 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/></svg>';
const lines='<svg viewBox="0 0 64 50" fill="none" aria-hidden="true"><path d="M2 5H32 M2 13H32 M2 21H32 M2 29H32 M2 37H32 M2 45H32" stroke="#FA0073" stroke-width="1"/><path d="M32 5H62 M32 13H62 M32 21H62 M32 29H62 M32 37H62 M32 45H62" stroke="#FA0073" stroke-width="2"/></svg>';
const labels={yt:'YouTube',tw:'Twitch',ig:'Instagram',x:'X',dc:'Discord'};
const socials=Object.keys(labels).map(k=>'<a href="'+KG_SOCIAL_URLS[k]+'" target="_blank" rel="noopener noreferrer" aria-label="'+labels[k]+'"><img src="'+KG_SOCIAL_ORIGINALS[k]+'" width="26" height="26" alt=""></a>').join('');
export const VIEWER_PORTAL_PREFIX='<header class="kg-site-header"><a class="kg-site-logo" href="/">KGBlaze</a><nav class="kg-site-nav" aria-label="KGBlaze"><a data-global="about" href="/#travel">Sobre Blaze</a><a data-global="music" href="/music/songs/">Música ▾</a><a data-global="community" href="/#community">Comunidad ▾</a><a class="kg-go-departures" href="/departures/">'+takeoff+'<span data-global="departures">Salidas</span></a></nav><nav class="kg-site-langs" aria-label="Idioma"><button type="button" class="active" data-lang="es">ES</button><button type="button" data-lang="en">EN</button><button type="button" data-lang="ja">JP</button></nav></header><section class="kg-exterior-hero"><div class="kg-titles"><div class="kg-kicker" data-global="kicker">KGBlaze · Centro de información</div><h1 data-global="airport">Aeropuerto Internacional de la KGBlaze</h1><p class="kg-hero-sub" data-global="sub">Tablero de salidas · Calendario semanal</p></div><button class="kg-menu-lines" type="button" aria-label="Abrir menú lateral" aria-expanded="false" aria-controls="kg-site-drawer">'+lines+'</button></section>';
export const VIEWER_PORTAL_SUFFIX='<footer class="kg-site-footer">KGBlaze · Project Relight</footer><nav class="kg-site-social-desktop" aria-label="Redes sociales">'+socials+'</nav><nav class="kg-site-social-mobile" aria-label="Redes sociales">'+socials+'</nav><div class="kg-site-drawer" id="kg-site-drawer" hidden><div class="kg-site-drawer-panel"><button type="button" class="kg-site-drawer-close" data-global="close">Cerrar menú</button><nav aria-label="KGBlaze"><a href="/" data-global="home">Inicio</a><a href="/#travel" data-global="about">Sobre Blaze</a><a href="/music/songs/" data-global="music">Música ▾</a><a href="/#community" data-global="community">Comunidad ▾</a><a href="/departures/" data-global="departures">Salidas</a></nav></div></div>';
export const VIEWER_PORTAL_DESC='<p class="kg-wait-description" data-global="select">Selecciona una salida para consultar sus detalles.</p>';
/** Canonical board light signals from statusColor()/leftSignal in public/index.html.
 * The PALETTE badge borders are intentionally different from these lights. */
export const VIEWER_STATUS_LIGHT_GROUPS=Object.freeze([
 {key:'on',color:'#67D9F7',statuses:['A TIEMPO'],es:'A tiempo'},
 {key:'pending',color:'#F5BF47',statuses:['POR CONFIRMAR','REPROGRAMADO'],es:'Por confirmar · Reprogramado'},
 {key:'live',color:'#36D978',statuses:['EN VIVO'],es:'En vivo'},
 {key:'cancelled',color:'#ED006F',statuses:['CANCELADO'],es:'Cancelado'},
 {key:'inactive',color:'#62739D',statuses:['DESPEGÓ','DESCANSO','ESCALA','HIATUS'],es:'Despegó · Descanso · En tránsito · Hiatus'}
]);
export const VIEWER_PORTAL_LEGEND='<hr class="kg-panel-divider"><section class="kg-legend" aria-label="Leyenda de luces"><h3 data-global="legend">Leyenda</h3><div class="kg-legend-items">'+VIEWER_STATUS_LIGHT_GROUPS.map(g=>'<div class="kg-legend-row" data-statuses="'+g.statuses.join('|')+'"><i class="kg-legend-light" style="background:'+g.color+'"></i><span data-global="'+g.key+'">'+g.es+'</span></div>').join('')+'</div></section><hr class="kg-panel-divider"><h3 class="kg-share-heading" data-global="share">Compartir el visor</h3>'

function initializeViewerPortal(){
 // Preserve compatibility with Wrangler/esbuild naming emitted inside serialized callbacks.
 const __name=(fn,name)=>Object.defineProperty(fn,'name',{value:name,configurable:true});
 try{
  if(document.body?.classList.contains('embedded')||!document.body?.classList.contains('kg-portal-viewer'))return;
  const header=document.querySelector('.kg-site-header');
  const hero=document.querySelector('.kg-exterior-hero');
  const drawer=document.querySelector('#kg-site-drawer');
  if(!header||!hero||!drawer)return;
  const locales={
    es:{kicker:'KGBlaze · Centro de información',airport:'Aeropuerto Internacional de la KGBlaze',sub:'Tablero de salidas · Calendario semanal',about:'Sobre Blaze',music:'Música ▾',community:'Comunidad ▾',departures:'Salidas',info:'Información de vuelo',select:'Selecciona una salida para consultar sus detalles.',legend:'Leyenda',share:'Compartir el visor',on:'A tiempo',pending:'Por confirmar · Reprogramado',live:'En vivo',cancelled:'Cancelado',inactive:'Despegó · Descanso · En tránsito · Hiatus',home:'Inicio',close:'Cerrar menú',open:'Abrir menú lateral'},
    en:{kicker:'KGBlaze · Information Center',airport:'KGBlaze International Airport',sub:'Departures board · Weekly schedule',about:'About Blaze',music:'Music ▾',community:'Community ▾',departures:'Departures',info:'Flight Information',select:'Select a departure to see its details.',legend:'Legend',share:'Share the viewer',on:'On time',pending:'Unconfirmed · Rescheduled',live:'Live',cancelled:'Cancelled',inactive:'Departed · On break · Layover · Hiatus',home:'Home',close:'Close menu',open:'Open side menu'},
    ja:{kicker:'KGBlaze · インフォメーションセンター',airport:'KGBlaze国際空港',sub:'出発案内板 · 週間予定',about:'Blazeについて',music:'音楽 ▾',community:'コミュニティ ▾',departures:'出発',info:'配信情報',select:'出発便を選択すると詳細を確認できます。',legend:'凡例',share:'ビューアーを共有',on:'定刻',pending:'未確定 · 日時変更',live:'配信中',cancelled:'中止',inactive:'出発済 · 休み · 旅行中 · 休止中',home:'ホーム',close:'メニューを閉じる',open:'メニューを開く'}
  };
  let active='es',painting=false;
  // Restore the original, already-bound language controls to the global header.
  // Moving a node retains its original listeners, unlike cloning or new proxy buttons.
  const targetLangs=header.querySelector('.kg-site-langs');
  const oldLangNav=document.querySelector('.viewer-header .top-langs');
  const originalButtons=oldLangNav?Array.from(oldLangNav.querySelectorAll('button[data-lang]')):[];
  if(targetLangs&&originalButtons.length===3){
    targetLangs.replaceChildren(...originalButtons);
    // Keep the shared 3-site visual language labels while preserving native events.
    for(const b of originalButtons)b.textContent=({es:'ES',en:'EN',ja:'JP'})[b.dataset.lang]||b.textContent;
    targetLangs.dataset.source='original-terminal-buttons';
  }else if(targetLangs){
    // Header buttons already carry data-lang and were bound by original boot().
    // Do not add duplicate listeners or require this extra initializer to run.
    targetLangs.dataset.source='original-viewer-bind';
  }
  const getLanguage=()=>{
    try{
      if(typeof state!=='undefined'&&locales[state?.lang])return state.lang;
      const selected=targetLangs?.querySelector('[data-lang].active')?.dataset.lang;
      if(locales[selected])return selected;
      if(locales[document.documentElement.lang])return document.documentElement.lang;
    }catch{}
    return active;
  };
  const paint=()=>{
    if(painting)return;
    painting=true;
    try{
      active=getLanguage();const t=locales[active];
      for(const element of document.querySelectorAll('[data-global]')){
       const value=t[element.dataset.global];
       if(value!==undefined&&element.textContent!==value)element.textContent=value;
      }
      // The exact original buttons are reused; syncChrome() still controls the board.
      for(const b of header.querySelectorAll('.kg-site-langs button[data-lang]')){
       const current=b.dataset.lang===active;
       b.classList.toggle('active',current);
       b.setAttribute('aria-pressed',String(current));
      }
      // Original syncChrome resets sideKicker; keep the exterior interpretation consistent.
      for(const id of ['sideKicker','flightKicker']){
       const element=document.getElementById(id);
       if(element&&element.textContent!==t.info)element.textContent=t.info;
      }
      hero.querySelector('.kg-menu-lines')?.setAttribute('aria-label',t.open);
    }finally{painting=false}
  };
  if(originalButtons.length===3){
    for(const button of originalButtons)button.addEventListener('click',()=>{
      active=button.dataset.lang;
      queueMicrotask(paint);
    });
  }
  const trigger=hero.querySelector('.kg-menu-lines'),close=drawer.querySelector('.kg-site-drawer-close');
  const toggle=(open,refocus=true)=>{
    drawer.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('kg-site-menu-open',open);
    if(open)close.focus();else if(refocus)trigger.focus();
  };
  trigger.addEventListener('click',()=>toggle(drawer.hidden));
  close.addEventListener('click',()=>toggle(false));
  drawer.addEventListener('click',event=>{if(event.target===drawer)toggle(false)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawer.hidden)toggle(false)});
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggle(false,false)));
  // The original viewer redraws its side kicker during language/status updates.
  // Observe only that small element and repaint idempotently; never touch the canvas.
  const kicker=document.getElementById('sideKicker'),flight=document.getElementById('flightKicker');
  if(typeof MutationObserver!=='undefined'){
   const observer=new MutationObserver(()=>queueMicrotask(paint));
   if(kicker)observer.observe(kicker,{childList:true,characterData:true,subtree:true});
   if(flight)observer.observe(flight,{childList:true,characterData:true,subtree:true});
  }
  paint();
 }catch(err){console.error('KGBlaze V6 public chrome init failed',err)}
}
export const VIEWER_PORTAL_SSR_JS='('+initializeViewerPortal.toString()+')();';

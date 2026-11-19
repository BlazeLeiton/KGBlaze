/* Project Relight — Stage 41 CP06
   READY BUT INACTIVE: do not import in home.html until the creator approves
   the actual images, exact ES/EN/JA copy and destinations.
   This module never replaces YouTube/Twitch players or adds promo cards. */
export const HERO_CAROUSEL_SCHEMA='kgblaze-home-hero-v1';
const LANGS=['es','en','ja'];
const ASSET=/^\/assets\/[A-Za-z0-9_./-]+\.(?:avif|webp|png|jpe?g)$/i;
const HREF=/^\/(?!\/)[A-Za-z0-9_/-]*$/;
const TEXT_LIMIT=160;
function translations(record,{required=false}={}){
 if(record===undefined||record===null)return required?null:undefined;
 if(!record||typeof record!=='object'||Array.isArray(record))return null;
 const out={};
 for(const lang of LANGS){
  const val=record[lang];
  if(typeof val!=='string'||!val.trim()||val.length>TEXT_LIMIT)return null;
  out[lang]=val.trim();
 }
 return out;
}
export function validateHeroCarousel(config){
 if(config?.schema!==HERO_CAROUSEL_SCHEMA||!Array.isArray(config.slides))
  return {enabled:false,reason:'invalid_schema',slides:[]};
 if(config.slides.length===0)return {enabled:false,reason:'content_pending',slides:[]};
 if(config.slides.length<2||config.slides.length>6)
  return {enabled:false,reason:'slide_count',slides:[]};
 const slides=[],seen=new Set();
 for(const raw of config.slides){
  if(!raw||typeof raw.id!=='string'||!/^[a-z0-9-]{2,40}$/.test(raw.id)||seen.has(raw.id))
   return {enabled:false,reason:'invalid_slide_id',slides:[]};
  const title=translations(raw.title,{required:true});
  const eyebrow=translations(raw.eyebrow);
  const subtitle=translations(raw.subtitle);
  if(!title||eyebrow===null||subtitle===null)return {enabled:false,reason:'incomplete_locales',slides:[]};
  const desktop=raw.images?.desktop,mobile=raw.images?.mobile;
  if(typeof desktop!=='string'||!ASSET.test(desktop)||typeof mobile!=='string'||!ASSET.test(mobile))
   return {enabled:false,reason:'missing_local_art',slides:[]};
  const href=raw.href;
  if(href!==undefined&&(typeof href!=='string'||!HREF.test(href)||!subtitle))
   return {enabled:false,reason:'invalid_destination',slides:[]};
  seen.add(raw.id);
  slides.push(Object.freeze({id:raw.id,title,eyebrow,subtitle,images:{desktop,mobile},href}));
 }
 return {enabled:true,reason:'ready',slides};
}
export const HERO_CAROUSEL_CSS=`
/* Activated only with 2+ fully approved localized slides. */
.hero.kg-hero-carousel-enabled{position:relative;isolation:isolate}
.hero.kg-hero-carousel-enabled .kg-hero-backdrop{position:absolute;inset:0;z-index:0;pointer-events:none;background-size:cover;background-position:center;opacity:0;transition:opacity 900ms ease}
.hero.kg-hero-carousel-enabled .kg-hero-backdrop::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,#020C41EF,#020C41CE 42%,#020C4177)}
.hero.kg-hero-carousel-enabled .hero-inner{position:relative;z-index:1}
.hero.kg-hero-carousel-enabled .intro>div:first-child{position:relative}
.hero.kg-hero-carousel-enabled .intro h1,.hero.kg-hero-carousel-enabled .intro .identity,.hero.kg-hero-carousel-enabled .intro .sub{transition:opacity 250ms ease}
.hero.kg-hero-carousel-enabled .intro .kg-hero-copy-fading{opacity:0}
.hero.kg-hero-carousel-enabled .intro .sub a{color:inherit;text-decoration:underline;text-underline-offset:4px}
.hero.kg-hero-carousel-enabled .kg-hero-selectors{position:absolute;top:50%;left:-18px;transform:translateY(-50%);display:flex;flex-direction:column;gap:7px;align-items:center;z-index:2}
.hero.kg-hero-carousel-enabled .kg-hero-selectors button{padding:0;border:0;border-radius:30px;background:#B0C2E7B8;width:6px;height:8px;cursor:pointer;transition:height 220ms ease,width 220ms ease,background 220ms ease}
.hero.kg-hero-carousel-enabled .kg-hero-selectors button[aria-current="true"]{width:6px;height:24px;background:#FFFFFF}
.hero.kg-hero-carousel-enabled .kg-hero-selectors button:focus-visible{outline:2px solid #FFFFFF;outline-offset:4px}
@media(max-width:760px){
 .hero.kg-hero-carousel-enabled .kg-hero-selectors{position:relative;left:auto;top:auto;transform:none;flex-direction:row;justify-content:center;gap:7px;margin:14px 0 0;padding:5px 0}
 .hero.kg-hero-carousel-enabled .kg-hero-selectors button{width:8px;height:5px}
 .hero.kg-hero-carousel-enabled .kg-hero-selectors button[aria-current="true"]{width:25px;height:5px}
 .hero.kg-hero-carousel-enabled .kg-hero-backdrop{bottom:auto;height:48%;background-position:center top}
 .hero.kg-hero-carousel-enabled .kg-hero-backdrop::after{background:linear-gradient(180deg,#020C4180,#020C41F0)}
}
@media(prefers-reduced-motion:reduce){
 .hero.kg-hero-carousel-enabled .kg-hero-backdrop,.hero.kg-hero-carousel-enabled .intro h1,.hero.kg-hero-carousel-enabled .intro .identity,.hero.kg-hero-carousel-enabled .intro .sub,.hero.kg-hero-carousel-enabled .kg-hero-selectors button{transition:none!important}
}
`;
const ARIA={es:{group:'Destinos destacados',slide:'Destino'},en:{group:'Featured destinations',slide:'Slide'},ja:{group:'注目の目的地',slide:'スライド'}};
export async function mountHeroCarousel(hero,configuration,{autoMs=13000}={}){
 const checked=validateHeroCarousel(configuration);
 if(!checked.enabled)return {enabled:false,reason:checked.reason};
 if(!hero||hero.classList.contains('kg-hero-carousel-enabled'))return {enabled:false,reason:'host_unavailable'};
 const intro=hero.querySelector('.intro>div:first-child');
 const headline=intro?.querySelector('h1'),eyebrow=intro?.querySelector('.identity'),subtitle=intro?.querySelector('.sub');
 const playerA=hero.querySelector('#youtube-screen'),playerB=hero.querySelector('#twitch-screen');
 if(!intro||!headline||!eyebrow||!subtitle||!playerA||!playerB)
  return {enabled:false,reason:'incomplete_hero'};
 const {slides}=checked;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const mobile=()=>window.matchMedia?.('(max-width:760px)').matches??false;
 const urlFor=s=>mobile()?s.images.mobile:s.images.desktop;
 const load=url=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=url;
 });
 if(!await load(urlFor(slides[0])))return {enabled:false,reason:'background_unavailable'};
 const css=document.createElement('style');css.textContent=HERO_CAROUSEL_CSS;css.dataset.kgHeroCarousel='true';document.head.appendChild(css);
 const layers=[document.createElement('div'),document.createElement('div')];
 for(const layer of layers){layer.className='kg-hero-backdrop';layer.setAttribute('aria-hidden','true');hero.insertBefore(layer,hero.firstChild)}
 const selectors=document.createElement('div');selectors.className='kg-hero-selectors';selectors.setAttribute('role','group');intro.appendChild(selectors);
 const buttons=slides.map((_,i)=>{const b=document.createElement('button');b.type='button';b.dataset.slideIndex=String(i);selectors.appendChild(b);return b});
 const original={eyebrow:eyebrow.textContent,headline:headline.textContent,subtitle:subtitle.textContent};
 let selected=0,visible=0,destroyed=false,revision=0,paused=false,timer=null,fadeTimer=null;
 const lang=()=>LANGS.includes(document.documentElement.lang)?document.documentElement.lang:'es';
 const assign=()=>{const slide=slides[selected],l=lang();
  headline.textContent=slide.title[l];
  eyebrow.hidden=!slide.eyebrow;eyebrow.textContent=slide.eyebrow?.[l]||'';
  subtitle.hidden=!slide.subtitle;subtitle.replaceChildren();
  if(slide.subtitle){
   if(slide.href){const a=document.createElement('a');a.textContent=slide.subtitle[l];a.href=slide.href;subtitle.appendChild(a)}
   else subtitle.textContent=slide.subtitle[l];
  }
  selectors.setAttribute('aria-label',ARIA[l].group);
  buttons.forEach((b,i)=>{b.setAttribute('aria-label',ARIA[l].slide+' '+(i+1)+': '+slides[i].title[l]);b.setAttribute('aria-current',String(i===selected))});
 };
 layers[0].style.backgroundImage='url("'+urlFor(slides[0])+'")';layers[0].style.opacity='1';
 hero.classList.add('kg-hero-carousel-enabled');hero.dataset.kgHeroSlide=slides[0].id;assign();
 async function goTo(index){
  if(destroyed||!Number.isInteger(index)||index<0||index>=slides.length)return false;
  const token=++revision,asset=urlFor(slides[index]);
  if(!await load(asset)||destroyed||revision!==token)return false;
  const next=1-visible;
  layers[next].style.backgroundImage='url("'+asset+'")';
  layers[next].style.opacity='1';
  layers[visible].style.opacity='0';visible=next;
  if(fadeTimer!==null)clearTimeout(fadeTimer);
  if(!reduced?.matches)[headline,eyebrow,subtitle].forEach(node=>node.classList.add('kg-hero-copy-fading'));
  selected=index;hero.dataset.kgHeroSlide=slides[index].id;
  fadeTimer=setTimeout(()=>{if(destroyed||token!==revision)return;assign();[headline,eyebrow,subtitle].forEach(node=>node.classList.remove('kg-hero-copy-fading'));fadeTimer=null},reduced?.matches?0:200);
  return true;
 }
 const move=()=>{if(!paused&&!document.hidden&&!reduced?.matches)void goTo((selected+1)%slides.length)};
 if(autoMs>0)timer=setInterval(move,Math.max(8000,autoMs));
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{void goTo(i)}));
 const onEnter=()=>{paused=true},onLeave=()=>{paused=false},onFocus=()=>{paused=true},
  onBlur=e=>{if(!intro.contains(e.relatedTarget))paused=false};
 const onLang=()=>assign();
 const onResize=()=>{void goTo(selected)};
 hero.addEventListener('mouseenter',onEnter);hero.addEventListener('mouseleave',onLeave);
 selectors.addEventListener('focusin',onFocus);selectors.addEventListener('focusout',onBlur);
 document.addEventListener('kgblaze:localechange',onLang);
 window.addEventListener('resize',onResize);
 return {enabled:true,get selectedId(){return slides[selected].id},goTo,destroy(){
  destroyed=true;++revision;if(timer!==null)clearInterval(timer);if(fadeTimer!==null)clearTimeout(fadeTimer);
  document.removeEventListener('kgblaze:localechange',onLang);window.removeEventListener('resize',onResize);
  hero.removeEventListener('mouseenter',onEnter);hero.removeEventListener('mouseleave',onLeave);
  selectors.removeEventListener('focusin',onFocus);selectors.removeEventListener('focusout',onBlur);
  selectors.remove();layers.forEach(layer=>layer.remove());css.remove();
  hero.classList.remove('kg-hero-carousel-enabled');delete hero.dataset.kgHeroSlide;
  eyebrow.hidden=false;subtitle.hidden=false;eyebrow.textContent=original.eyebrow;headline.textContent=original.headline;subtitle.textContent=original.subtitle;
 }};
}

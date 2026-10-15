import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {VIEWER_JS,VIEWER_CSS} from '../src/viewer-enhancements.mjs';

// Exercise the injected script against a small DOM surface, not only its regex.
function element(tag){
 const node={
  tagName:tag.toUpperCase(),children:[],className:'',parentNode:null,
  classList:{add(){}},
  append(...items){for(const item of items){item.remove?.();item.parentNode=this;this.children.push(item);}},
  prepend(item){item.remove?.();item.parentNode=this;this.children.unshift(item);},
  contains(item){return this.children.includes(item)||this.children.some(child=>child.contains?.(item));},
  remove(){if(!this.parentNode)return;const ix=this.parentNode.children.indexOf(this);if(ix>=0)this.parentNode.children.splice(ix,1);this.parentNode=null;},
  replaceChildren(...items){for(const child of this.children)child.parentNode=null;this.children=[];this.append(...items);},
  querySelector(sel){return this.children.find(c=>c.className===sel.slice(1))||null;},
  querySelectorAll(){return [];}
 };
 if(tag==='img')Object.defineProperty(node,'src',{get(){return this._src||'';},set(value){this._src=value;}});
 return node;
}
function mount(event,library,{remote=null,viewerSource=VIEWER_JS}={}){
 const host=element('div'),top=element('div'),requests=[];
 top.className='flight-row-top';host.append(top);
 let watcher=null;
 class MutationObserver{
  constructor(callback){this.callback=callback;}
  observe(node,config){assert.equal(node,host);assert.equal(config.childList,true);assert.equal(Object.keys(config).length,1);watcher=this;}
 }
 const document={
  title:'',createElement:element,
  querySelector(sel){
   if(sel==='#flightContent')return host;
   if(sel==='#flightContent .flight-row-top')return host.querySelector('.flight-row-top');
   return null;
  }
 };
 const globals={
  draw(){},text(){},showSelectedFlight(){},syncChrome(){},
  document,MutationObserver,getVisible:()=>({visible:[event]}),location:{pathname:'/departures/'},state:{lang:'es'},
  selectedFlightId:event.id,FLIGHT_TRANSLATIONS:{es:{}},
  flightSelectable(){return true;},libraryEntries(){return library;},
  effectiveEventLogo(e){
   if(e.logoChoice==='upload')return e.logoData||null;
   if(e.logoChoice?.startsWith('lib:'))return library.find(x=>x.id===e.logoChoice.slice(4))?.img||null;
   return null;
  },
  fetch:async(url)=>{requests.push(url);return {ok:true,json:async()=>remote||{artUrl:null,source:null}};},
 };
 vm.runInNewContext(viewerSource,globals);
 globals.showSelectedFlight([event]);
 const box=()=>host.querySelector('.flight-row-top')?.querySelector('.flight-category-box');
 const picture=()=>box()?.children.find(c=>c.tagName==='IMG');
 const replaceRow=()=>{
  const replacement=element('div');replacement.className='flight-row-top';
  const statusLight=element('div');statusLight.className='flight-light';replacement.append(statusLight);
  host.replaceChildren(replacement);watcher?.callback();return replacement;
 };
 const notify=()=>watcher?.callback();
 return {top,host,box,picture,requests,replaceRow,notify};
}
const library=[
 {id:'f1',name:'Formula 1 / F1',aliases:['Formula One','Mexico GP'],img:'data:image/png;base64,FORMULA'},
 {id:'padoru',name:'Collab Padoru',aliases:['Padoru'],img:'data:image/png;base64,PADORU'},
 {id:'chat',name:'Just Chatting',img:'data:image/png;base64,CHATTING'},
 {id:'karaoke',name:'Karaoke',aliases:['Cantando'],img:'data:image/png;base64,KARAOKE'},
 {id:'general',name:'KGBlaze General',img:'data:image/png;base64,GENERAL'}
];
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const official='https://static-cdn.jtvnw.net/ttv-boxart/123-285x380.jpg';

test('Killer Chat!: authentic Twitch category is shown instead of uploaded calendar logo',async()=>{
 const ui=mount({id:'killer',category:'Killer Chat!: Original Edition',title:'Encuentra el amor',
  logoChoice:'upload',logoData:'data:image/png;base64,CALENDAR',platforms:['yt','tw']},library,{
  remote:{artUrl:official,source:'category'}
 });
 await flush();
 assert.equal(ui.picture()?.src,official);
 assert.notEqual(ui.picture()?.src,'data:image/png;base64,CALENDAR');
 assert.equal(ui.requests.length,1);
 assert.equal(ui.picture()?.loading,'eager');
});

test('Unavailable official game category falls back to CATEGORY library before any title',async()=>{
 const ui=mount({id:'f1',category:'Mexico GP',title:'Collab Padoru',
  logoChoice:'upload',logoData:'data:image/png;base64,CALENDAR',platforms:['yt']},library);
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
 assert.equal(ui.requests.length,1);
 ui.picture().onerror();
 assert.equal(ui.picture()?.src,library[4].img,'a specific game must not be replaced by Padoru');
});

test('Broken official category image advances to the matching library image',async()=>{
 const ui=mount({id:'broken-official',category:'Mexico GP',title:'Karaoke',
  platforms:['tw']},library,{remote:{artUrl:official,source:'category'}});
 await flush();
 assert.equal(ui.picture()?.src,official);
 ui.picture().onerror();
 assert.equal(ui.picture()?.src,library[0].img);
 ui.picture().onerror();
 assert.equal(ui.picture()?.src,library[4].img);
});

test('Only Just Chatting / Entertainment title Karaoke can supersede official generic category art',async()=>{
 for(const category of ['Just Chatting','Entertainment','Entretenimiento']){
  const ui=mount({id:'special-'+category,category,title:'Noche de karaoke',
   logoChoice:'upload',logoData:'data:image/png;base64,CALENDAR',platforms:['yt']},library,{
   remote:{artUrl:official,source:'category'}
  });
  await flush();
  assert.equal(ui.picture()?.src,library[3].img,category);
  ui.picture().onerror();
  assert.equal(ui.picture()?.src,official,'generic official art remains the backup');
 }
});

test('Only generic chat can allow Padoru; specific games always retain category priority',async()=>{
 const chat=mount({id:'chat-padoru',category:'Just Chatting',title:'COLLAB PADORU con amigos',
  platforms:['tw']},library,{remote:{artUrl:official,source:'category'}});
 const azur=mount({id:'azur-padoru',category:'Azur Lane',title:'Collab Padoru',
  platforms:['tw']},library,{remote:{artUrl:official,source:'category'}});
 await flush();
 assert.equal(chat.picture()?.src,library[1].img);
 assert.equal(azur.picture()?.src,official);
});

test('Entertainment with no exceptions chooses official Just Chatting, then matching library',async()=>{
 const ui=mount({id:'general-chat',category:'Entertainment',title:'Charlando de videojuegos',
  platforms:['yt']},library,{remote:{artUrl:official,source:'category'}});
 await flush();
 assert.equal(ui.picture()?.src,official);
 ui.picture().onerror();
 assert.equal(ui.picture()?.src,library[2].img);
 const fallback=mount({id:'general-chat-2',category:'Entertainment',title:'Charlando',
  platforms:['yt']},library);
 await flush();
 assert.equal(fallback.picture()?.src,library[2].img);
});

test('Unrelated library activity cannot take precedence over Just Chatting',async()=>{
 const ui=mount({id:'minecraft-chat',category:'Just Chatting',title:'Minecraft con amigos',
  platforms:['tw']},[...library,{id:'minecraft',name:'Minecraft',img:'data:image/png;base64,MINECRAFT'}],
  {remote:{artUrl:official,source:'category'}});
 await flush();
 assert.equal(ui.picture()?.src,official);
});

test('YouTube-only generic Gaming accepts a title-inferred Twitch category before library',async()=>{
 const ui=mount({id:'youtube-only',category:'Gaming',title:'Jugando Azur Lane',
  platforms:['yt']},[...library,{id:'azur',name:'Azur Lane',img:'data:image/png;base64,AZUR'}],
  {remote:{artUrl:official,source:'title'}});
 await flush();
 assert.equal(ui.picture()?.src,official);
 assert.match(ui.requests[0],/eventId=youtube-only/);
});

test('YouTube category library is preferred over unrelated title artwork',async()=>{
 const ui=mount({id:'youtube-specific',category:'Mexico GP',title:'Karaoke',
  platforms:['yt']},library,{remote:{artUrl:official,source:'title'}});
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
});

test('Unknown category uses GENERAL artwork, never calendar upload',async()=>{
 const ui=mount({id:'unknown',category:'Actividad desconocida',title:'Algo nuevo',
  logoChoice:'upload',logoData:'data:image/png;base64,UPLOAD',platforms:['yt']},library);
 await flush();
 assert.equal(ui.picture()?.src,library[4].img);
 const withoutGeneral=mount({id:'unknown-no-general',category:'Desconocida',title:'Sin asociacion',
  logoChoice:'upload',logoData:'data:image/png;base64,UPLOAD',platforms:['yt']},[]);
 await flush();
 assert.equal(withoutGeneral.picture(),undefined);
 assert.equal(withoutGeneral.box()?.querySelector('.category-placeholder')?.textContent,'Desconocida');
});

test('Disallowed remote image URL cannot replace editorial category fallback',async()=>{
 const ui=mount({id:'unsafe',category:'Mexico GP',title:'Padoru',
  platforms:['yt']},library,{remote:{artUrl:'https://example.com/cat.jpg',source:'category'}});
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
});

test('Legacy renderer rebuild rehydrates one image and keeps the original LED',async()=>{
 const ui=mount({id:'restore',category:'Mexico GP',title:'Collab Padoru',
  platforms:['yt']},library);
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
 const row=ui.replaceRow();
 assert.equal(row.children[0].className,'flight-light');
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
 ui.notify();ui.notify();
 assert.equal(row.children.filter(c=>c.className==='flight-category-box').length,1);
 assert.equal(row.children[0].className,'flight-light');
});

test('Wrangler-serialized __name helper remains valid in the browser script',async()=>{
 const needle='const norm=s=>';
 assert.ok(VIEWER_JS.includes(needle));
 const compiled=VIEWER_JS.replace(needle,
  "const probe=__name(value=>value,'probe');if(probe('ok')!=='ok')throw Error('Bundler helper failed');const norm=s=>");
 const ui=mount({id:'bundle',category:'Mexico GP',title:'Collab Padoru',
  platforms:['yt']},library,{viewerSource:compiled});
 await flush();
 assert.equal(ui.picture()?.src,library[0].img);
});

test('Collab Padoru covers the entire Twitch category cell, but other artwork remains contained',async()=>{
 const padoru='/departures/assets/relight/art/Kirameki Riders.png';
 const catalogue=[...library.filter(item=>item.id!=='padoru'),{id:'collab-padoru',name:'Collab Padoru',aliases:['Padoru','Collab Padoru'],img:padoru}];
 assert.match(VIEWER_CSS,/\.flight-category-box img\{[^}]*object-fit:contain/);
 assert.match(VIEWER_CSS,/\.flight-category-box img\.padoru-cover\{object-fit:cover;object-position:center\}/);
 const special=mount({id:'padoru-fill',category:'Just Chatting',title:'Collab Padoru',
  platforms:['yt','tw']},catalogue);
 await flush();
 assert.equal(special.picture()?.src,padoru);
 assert.equal(special.picture()?.className,'padoru-cover');
 const generic=mount({id:'generic-collab',category:'Just Chatting',title:'Collab con amigos',
  platforms:['yt','tw']},catalogue);
 await flush();
 assert.equal(generic.picture()?.className,'');
 assert.notEqual(generic.picture()?.src,padoru);
 const game=mount({id:'game-padoru',category:'Mexico GP',title:'Collab Padoru',
  platforms:['yt','tw']},catalogue);
 await flush();
 assert.equal(game.picture()?.src,library[0].img);
 assert.equal(game.picture()?.className,'');
});

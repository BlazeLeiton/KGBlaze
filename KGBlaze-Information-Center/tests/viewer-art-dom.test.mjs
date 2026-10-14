import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {VIEWER_JS} from '../src/viewer-enhancements.mjs';

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
function mount(event,library,{remote=null}={}){
 const host=element('div'),top=element('div'),requests=[];
 top.className='flight-row-top';host.append(top);
 let watcher=null;
 class MutationObserver{
  constructor(callback){this.callback=callback;}
  observe(node,config){assert.equal(node,host);assert.deepEqual(config,{childList:true});watcher=this;}
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
 vm.runInNewContext(VIEWER_JS,globals);
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
test('Opening an activity displays the existing category artwork without a Twitch request',()=>{
 const ui=mount({id:'f1-id',category:'Mexico GP',title:'Collab Padoru en la F1',platforms:['yt']},library);
 assert.equal(ui.picture()?.src,library[0].img);
 assert.equal(ui.picture()?.loading,'eager');
 assert.equal(ui.requests.length,0);
});
test('Just Chatting title alias wins for karaoke in the actual expanded panel',()=>{
 const ui=mount({id:'chat-id',category:'Just Chatting',title:'Cantando karaoke hoy',platforms:['tw']},library);
 assert.equal(ui.picture()?.src,library[3].img);
 assert.equal(ui.requests.length,0);
});
test('Explicit library selection wins despite title aliases and a specific category',()=>{
 const ui=mount({id:'manual-id',category:'Mexico GP',title:'Karaoke',logoChoice:'lib:padoru',platforms:['yt']},library);
 assert.equal(ui.picture()?.src,library[1].img);
});
test('When no editorial art exists, official category image becomes visible after fetch',async()=>{
 const url='https://static-cdn.jtvnw.net/ttv-boxart/123-285x380.jpg';
 const ui=mount({id:'dbd-id',category:'Dead by Daylight',title:'Jugando Dead by Daylight',platforms:['tw']},[],{
  remote:{artUrl:url,source:'category'}
 });
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(ui.picture()?.src,url);
 assert.equal(ui.requests.length,1);
 assert.match(ui.requests[0],/eventId=dbd-id/);
});
test('Unresolved artwork still leaves a visible descriptive placeholder',async()=>{
 const ui=mount({id:'unknown',category:'Categoría desconocida',title:'Stream',platforms:['yt']},[]);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(ui.picture(),undefined);
 assert.equal(ui.box()?.querySelector('.category-placeholder')?.textContent,'Categoría desconocida');
});

test('Actual content replacement restores category artwork without destroying LED or creating duplicates',()=>{
 const ui=mount({id:'restore-id',category:'Mexico GP',title:'Collab Padoru',platforms:['yt']},library);
 assert.equal(ui.picture()?.src,library[0].img);
 const row=ui.replaceRow();
 assert.equal(row.children[0].className,'flight-light');
 assert.equal(ui.picture()?.src,library[0].img);
 ui.notify();ui.notify();
 assert.equal(row.children.filter(c=>c.className==='flight-category-box').length,1);
 assert.equal(row.children[0].className,'flight-light');
});

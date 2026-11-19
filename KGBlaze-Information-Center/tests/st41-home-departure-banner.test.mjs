import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {fileURLToPath} from 'node:url';

const read=p=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),'utf8');
const home=read('../public/home.html');
const terminal=read('../public/index.html');
const ctx={window:{}};
runInNewContext(read('../public/assets/home-departure-state.js'),ctx);
const banner=ctx.window.KGHomeDeparture;
const now=Date.parse('2026-11-25T18:00:00-06:00');
const event=(updates={})=>({id:'tw:azur',origin:'twitch',day:'2026-11-26',time:'18:00',
 title:'Tempesta and the Corridor of Fog — Historia',category:'Azur Lane',
 extra:'Azur Lane',platforms:['yt','tw'],status:'A TIEMPO',videoId:'Abcdef12345',...updates});
const agenda=(events=[],sync={})=>({schema:'relight-public-v1',events,sync});
const yt=e=>({source:'youtube_data_api_v3',verified:true,matchConfirmed:true,status:'live',
 videoId:'Abcdef12345',videoTitle:'¡Azur Lane! — Historia de Tempesta',
 editorialIdentity:JSON.stringify([e.day,e.time,e.title,e.category,[...e.platforms].sort(),e.videoId||''])});

test('Stage 41 Home LED meanings intentionally differ from native Terminal, except yellow',()=>{
 assert.equal(banner.COLORS['A TIEMPO'],'#36D978');
 assert.equal(banner.COLORS['EN VIVO'],'#ED006F');
 assert.equal(banner.COLORS['POR CONFIRMAR'],'#F5BF47');
 assert.equal(banner.COLORS['REPROGRAMADO'],'#F5BF47');
 assert.equal(banner.COLORS['SIN PROGRAMACIÓN'],undefined);
 for(const pair of ["status==='A TIEMPO'?'#67D9F7'","status==='EN VIVO'?'#36D978'","status==='CANCELADO'?'#ED006F'"])
  assert.ok(terminal.includes(pair),'Terminal native light '+pair);
});
test('native Japanese status labels preserved and home content localized',()=>{
 for(const [key,text] of Object.entries({'A TIEMPO':'定刻','EN VIVO':'配信中',
   'POR CONFIRMAR':'未確定','REPROGRAMADO':'日時変更'})){
  assert.equal(banner.COPY.ja.states[key],text);
  assert.ok(terminal.includes("'"+key+"':'"+text+"'"),'existing viewer '+key);
 }
 assert.equal(banner.COPY.ja.header,'出発予定');
 assert.equal(banner.COPY.ja.action,'配信予定をすべて見る');
 assert.equal(banner.COPY.en.emptyState,'Nothing scheduled yet');
 assert.equal(banner.COPY.en.emptyBody,'No departures scheduled at this time.');
 assert.equal(banner.COPY.es.action,'Revisa el programa completo');
});
test('future green/yellow departures display activity category and CDMX time',()=>{
 for(const status of ['A TIEMPO','POR CONFIRMAR','REPROGRAMADO']){
  const e=event({status}),r=banner.select(agenda([e]),now);
  assert.equal(r.kind,'scheduled');assert.equal(r.status,status);
  assert.equal(banner.category(e),'Azur Lane');
  assert.match(banner.formatDate(e,'es'),/18:00.*CDMX/);
  assert.match(banner.formatDate(e,'ja'),/2026.*11.*26.*18:00/);
 }
});
test('verified YouTube title only appears as live subtitle, never overwrites category',()=>{
 const e=event(),o=yt(e),r=banner.select(agenda([e],{[e.id]:{youtube:o}}),now);
 assert.equal(r.kind,'live');assert.equal(r.status,'EN VIVO');
 assert.equal(banner.category(e),'Azur Lane');
 assert.equal(banner.subtitle(e,r.sync,'EN VIVO','es'),o.videoTitle);
 assert.equal(banner.subtitle(e,r.sync,'EN VIVO','ja'),o.videoTitle);
});
test('editorial fallback avoids extra/category overlap and repeated headline',()=>{
 const e=event();
 assert.equal(banner.subtitle(e,{},'EN VIVO','es'),e.title);
 const duplicate=event({title:'Azur Lane',extra:'Azur Lane'});
 assert.equal(banner.subtitle(duplicate,{},'EN VIVO','es'),'Transmisión en curso');
 assert.equal(banner.subtitle(duplicate,{},'EN VIVO','ja'),'配信中');
 assert.equal(banner.category(event({category:''})),e.title);
 assert.equal(banner.category(event({category:'A'.repeat(150)})),e.title);
});
test('spoofed or mismatched YouTube rooms do not update Home',()=>{
 const e=event(),good=yt(e);
 for(const bad of [{...good,verified:false},{...good,matchConfirmed:false},
   {...good,editorialIdentity:'old'}, {...good,videoId:'invalid'},
   {...good,source:'not_youtube_data_api_v3'}]){
  assert.equal(banner.select(agenda([e],{[e.id]:{youtube:bad}}),now).kind,'scheduled');
  assert.notEqual(banner.subtitle(e,{youtube:bad},'EN VIVO','es'),good.videoTitle);
 }
});
test('known YouTube upcoming room has priority over verified Twitch live on dual-platform event',()=>{
 const e=event(),o={...yt(e),status:'upcoming'};
 const result=banner.select(agenda([e],{[e.id]:{youtube:o,twitch:{verified:true,matchConfirmed:true,status:'live'}}}),now);
 assert.equal(result.kind,'scheduled');assert.equal(result.status,'A TIEMPO');
});
test('Twitch-only live uses editorial caption, not imaginary YouTube metadata',()=>{
 const e=event({platforms:['tw'],videoId:undefined}),d=agenda([e],{[e.id]:{twitch:{verified:true,matchConfirmed:true,status:'live'}}});
 const r=banner.select(d,now);
 assert.equal(r.kind,'live');assert.equal(banner.subtitle(e,r.sync,'EN VIVO','es'),e.title);
});
test('live outranks future schedules; cancelled, rest and past events cannot appear next',()=>{
 const e=event({id:'active',day:'2026-11-25',time:'17:00',platforms:['tw']});
 const r=banner.select(agenda([event(),e],{active:{twitch:{verified:true,matchConfirmed:true,status:'live'}}}),now);
 assert.equal(r.kind,'live');assert.equal(r.e.id,'active');
 for(const s of ['CANCELADO','DESCANSO','HIATUS','ESCALA','DESPEGÓ'])
  assert.equal(banner.select(agenda([event({status:s})]),now).kind,'empty');
 assert.equal(banner.select(agenda([event({day:'2026-11-24'})]),now).kind,'empty');
 assert.equal(banner.select(agenda([]),now).kind,'empty');
 assert.equal(banner.select({},now).kind,'unavailable');
});
test('existing home video/player chrome is retained, and multilingual banner hooks parse',()=>{
 for(const m of home.matchAll(/<script>([\s\S]*?)<\/script>/g))new Script(m[1]);
 for(const marker of ['src="/assets/home-departure-state.js"','id="kg-departure-banner"',
  'id="kg-departure-light"','kgblaze:localechange','lastDepartureAgenda=d',
  'synchronizeTwitchPlayer()','kg-support-info-panel','/departures/'])assert.ok(home.includes(marker),marker);
 assert.match(home,/\.twotiles\{grid-template-columns:minmax\(0,2fr\) minmax\(0,1fr\);align-items:stretch\}/);
 assert.match(home,/\.twotiles\{grid-template-columns:minmax\(0,1fr\);gap:10px\}/);
});

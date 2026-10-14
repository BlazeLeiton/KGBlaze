import test from 'node:test';
import assert from 'node:assert/strict';
import {artworkCandidates} from '../src/activity-art-match.mjs';
import {VIEWER_CSS,VIEWER_JS} from '../src/viewer-enhancements.mjs';

const entries=[
 {id:'azur',name:'Azur Lane',aliases:['AL'],img:'data:image/png;base64,AZUR'},
 {id:'padoru',name:'Collab Padoru',aliases:['Padoru'],img:'data:image/png;base64,PADORU'},
 {id:'karaoke',name:'Karaoke',aliases:['Cantar'],img:'data:image/png;base64,KARAOKE'},
 {id:'kgblaze-default',name:'KGBlaze General',img:'data:image/png;base64,GENERAL'}
];

test('A published category wins over a conflicting title alias',()=>{
 const r=artworkCandidates({category:'Azur Lane',title:'Collab Padoru con amigos'},entries);
 assert.equal(r.category,entries[0].img);
 assert.equal(r.title,entries[1].img);
 assert.equal(r.general,entries[3].img);
});
test('Every specific game category wins over an unrelated Collab Padoru title',()=>{
 for(const game of ['Azur Lane','Fortnite','Dead by Daylight']){
  const original=[...entries.filter(item=>item.name!==game),{id:'game',name:game,img:'data:image/png;base64,GAME'}];
  const r=artworkCandidates({category:game,title:'Collab Padoru con amigos',platforms:['tw','yt']},original);
  assert.equal(r.category,'data:image/png;base64,GAME');
  assert.equal(r.title,entries[1].img);
  assert.equal(r.titleBeforeGenericCategory,false);
 }
});
test('Specific library activities take precedence only over Just Chatting / Entertainment',()=>{
 const catalog=[...entries,{name:'Just Chatting',img:'data:image/png;base64,CHATTING'},
  {name:'Entertainment',img:'data:image/png;base64,ENTERTAINMENT'},
  {name:'Entretenimiento',img:'data:image/png;base64,ENTRETENIMIENTO'},
  {name:'Gaming',img:'data:image/png;base64,GAMING'}];
 for(const category of ['Just Chatting','just chatting','Entertainment','ENTERTAINMENT','Entretenimiento']){
  const r=artworkCandidates({category,title:'Noche de karaoke en vivo',platforms:['yt']},catalog);
  assert.ok(r.category);
  assert.equal(r.title,entries[2].img);
  assert.equal(r.titleBeforeGenericCategory,true);
 }
 const generic=artworkCandidates({category:'Just Chatting',title:'Charlando',platforms:['tw']},catalog);
 assert.equal(generic.titleBeforeGenericCategory,false);
 assert.ok(generic.category);
 const gaming=artworkCandidates({category:'Gaming',title:'Collab Padoru'},catalog);
 assert.equal(gaming.titleBeforeGenericCategory,false);
 assert.ok(gaming.category);
});
test('Library aliases resolve the specific activity while no game is declared',()=>{
 for(const title of ['Collab Padoru con amigos','Una noche de Padoru']){
  const r=artworkCandidates({category:'Just Chatting',title},entries);
  assert.equal(r.title,entries[1].img);
  assert.equal(r.titleBeforeGenericCategory,true);
 }
 const r=artworkCandidates({category:'',title:'Padoru con amigos'},entries);
 assert.equal(r.category,null);
 assert.equal(r.title,entries[1].img);
 assert.equal(r.titleBeforeGenericCategory,false);
});
test('YouTube-only streams can resolve title artwork when category is generic',()=>{
 const r=artworkCandidates({category:'Gaming',title:'Noche de karaoke en vivo',platforms:['yt']},entries);
 assert.equal(r.category,null);
 assert.equal(r.title,entries[2].img);
});
test('Unknown activity receives registered general artwork, not false matches',()=>{
 const r=artworkCandidates({category:'Algo nuevo',title:'Charlando de cualquier cosa'},entries);
 assert.equal(r.category,null);
 assert.equal(r.title,null);
 assert.equal(r.general,entries[3].img);
});
test('Specific manual logos, LED and published-event lookup remain in public viewer',()=>{
 assert.match(VIEWER_CSS,/\.flight-row-top\{grid-template-columns:5px minmax\(0,1fr\) 100px;align-items:stretch\}/);
 assert.match(VIEWER_CSS,/\.flight-row-top>\.flight-light\{align-self:stretch;min-height:36px\}/);
 assert.match(VIEWER_JS,/const editorialMatches=\s*function artworkCandidates/);
 assert.ok(VIEWER_JS.includes("[explicit,editorial.category,categoryLookup,titleArt,titleLookup,general]"));
 assert.ok(VIEWER_JS.includes("[explicit,titleArt,editorial.category,categoryLookup,titleLookup,general]"));
 assert.match(VIEWER_JS,/const baseDraw=draw,baseText=text/); // 1080 calendar pathway untouched
 assert.match(VIEWER_JS,/some\(p=>p==='yt'\|\|p==='tw'\)/);
 assert.match(VIEWER_JS,/eventId=/);
 assert.ok(VIEWER_JS.includes("if(v?.source===entry.source&&official&&!tried.has(official))"));
});

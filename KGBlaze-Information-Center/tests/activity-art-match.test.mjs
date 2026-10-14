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

test('A published game category always defeats a title Padoru or Karaoke alias',()=>{
 for(const name of ['Azur Lane','Fortnite','Dead by Daylight']){
  const catalog=[...entries.filter(x=>x.name!==name),{name,img:'data:image/png;base64,GAME'}];
  const r=artworkCandidates({category:name,title:'Collab Padoru y Karaoke',platforms:['yt','tw']},catalog);
  assert.equal(r.category,'data:image/png;base64,GAME');
  assert.equal(r.title,null);
  assert.equal(r.specialTitle,null);
  assert.equal(r.titleBeforeGenericCategory,false);
 }
});
test('Only Just Chatting and Entertainment can be overridden by library Karaoke or Padoru',()=>{
 const catalog=[...entries,{name:'Just Chatting',img:'data:image/png;base64,CHATTING'},
  {name:'Entertainment',img:'data:image/png;base64,ENTERTAINMENT'}];
 for(const category of ['Just Chatting','just chatting','Entertainment','ENTERTAINMENT','Entretenimiento']){
  const r=artworkCandidates({category,title:'Noche de karaoke en vivo'},catalog);
  assert.equal(r.category,'data:image/png;base64,CHATTING');
  assert.equal(r.specialTitle,entries[2].img);
  assert.equal(r.title,entries[2].img);
  assert.equal(r.titleBeforeGenericCategory,true);
  assert.equal(r.isGenericChat,true);
 }
 for(const category of ['Just Chatting','Entertainment']){
  const r=artworkCandidates({category,title:'Una Collab Padoru especial'},catalog);
  assert.equal(r.specialTitle,entries[1].img);
 }
 const generic=artworkCandidates({category:'Entertainment',title:'Minecraft en vivo'},catalog);
 assert.equal(generic.category,'data:image/png;base64,CHATTING');
 assert.equal(generic.specialTitle,null);
 assert.equal(generic.title,null);
});
test('Gaming is broad, but does not give Padoru or Karaoke the chat-only privilege',()=>{
 const catalog=[...entries,{name:'Gaming',img:'data:image/png;base64,GAMING'}];
 const r=artworkCandidates({category:'Gaming',title:'Collab Padoru'},catalog);
 assert.equal(r.category,'data:image/png;base64,GAMING');
 assert.equal(r.title,null);
 assert.equal(r.isGenericChat,false);
 assert.equal(r.isBroadCategory,true);
});
test('A YouTube generic Gaming title can match a specific real game in the library',()=>{
 const r=artworkCandidates({category:'Gaming',title:'Jugando Azur Lane',platforms:['yt']},entries);
 assert.equal(r.category,null);
 assert.equal(r.title,entries[0].img);
});
test('No category allows title activity artwork but unknown activity prefers general',()=>{
 const r=artworkCandidates({category:'',title:'Collab Padoru con amigos'},entries);
 assert.equal(r.title,entries[1].img);
 const unknown=artworkCandidates({category:'Algo nuevo',title:'Charlando de cualquier cosa'},entries);
 assert.equal(unknown.category,null);
 assert.equal(unknown.title,null);
 assert.equal(unknown.general,entries[3].img);
});
test('The panel uses official-first selection without modifying status LED or canvas',()=>{
 assert.match(VIEWER_CSS,/\.flight-row-top\{grid-template-columns:5px minmax\(0,1fr\) 100px;align-items:stretch\}/);
 assert.match(VIEWER_CSS,/\.flight-row-top>\.flight-light\{align-self:stretch;min-height:36px\}/);
 assert.match(VIEWER_JS,/const editorialMatches=\s*function artworkCandidates/);
 assert.match(VIEWER_JS,/const categoryArt=v\?\.source==='category'\?official:null/);
 assert.ok(VIEWER_JS.includes('[categoryArt,editorial.category,titleArt,editorial.title,editorial.general]'));
 assert.ok(VIEWER_JS.includes('[editorial.specialTitle,categoryArt,editorial.category,editorial.general]'));
 assert.match(VIEWER_JS,/const baseDraw=draw,baseText=text/);
 assert.match(VIEWER_JS,/some\(p=>p==='yt'\|\|p==='tw'\)/);
 assert.match(VIEWER_JS,/eventId=/);
 assert.doesNotMatch(VIEWER_JS,/effectiveEventLogo\(e\)/);
});

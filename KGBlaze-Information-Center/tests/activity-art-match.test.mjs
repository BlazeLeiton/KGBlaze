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
 assert.match(VIEWER_JS,/const categoryArt=explicit\|\|editorial.category/);
 assert.match(VIEWER_JS,/some\(p=>p==='yt'\|\|p==='tw'\)/);
 assert.match(VIEWER_JS,/eventId=/);
 assert.match(VIEWER_JS,/showSources\(\[byCategory,titleArt,byTitle,general\]\)/);
});

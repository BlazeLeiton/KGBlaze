import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
test('Stage 41 CP05 recognition is inside Hero after both fixed player cards, not a new promo or link',()=>{
 const start=home.indexOf('<section class="hero">'),end=home.indexOf('</section>',start);
 const hero=home.slice(start,end);
 assert.ok(hero.indexOf('Terminal A — YouTube')>=0);
 assert.ok(hero.indexOf('Terminal B — Twitch')>hero.indexOf('Terminal A — YouTube'));
 assert.ok(hero.indexOf('id="kg-recognition-strip"')>hero.indexOf('Terminal B — Twitch'));
 assert.match(hero,/id="kg-recognition-strip" class="kg-recognition-strip"/);
 assert.doesNotMatch(hero.slice(hero.indexOf('id="kg-recognition-strip"')),/<a\b|<button\b|<iframe\b/);
 assert.equal((hero.match(/class="media (?:youtube|twitch)"/g)||[]).length,2);
 assert.equal((home.match(/id="kg-recognition-strip"/g)||[]).length,1);
});
test('no unconsented supporter names, counts, payments or fake membership API',()=>{
 const start=home.indexOf('id="kg-recognition-strip"'),end=home.indexOf('</section>',start);
 const content=home.slice(start,end);
 assert.ok(content.includes('Miembros de YouTube'));
 assert.ok(content.includes('Suscriptores de Twitch'));
 assert.ok(content.includes('Apoyos recurrentes'));
 assert.doesNotMatch(content,/data-supporter-name|data-billing|data-payment|data-count|<img/);
 assert.doesNotMatch(home,/fetch\(['"]\/api\/members/);
});
test('ES/EN/JA recognition content uses existing Home locale mechanism',()=>{
 for(const key of ['recognitionTitle','recognitionSources']){
  assert.match(home,new RegExp('data-i18n="'+key+'"'));
  assert.equal((home.match(new RegExp(key+':','g'))||[]).length,3);
 }
 assert.match(home,/recognitionTitle:"Gracias a quienes hacen posible este viaje"/);
 assert.match(home,/recognitionTitle:"Thank you for being part of the journey"/);
 assert.match(home,/recognitionTitle:"一緒に旅してくれてありがとう"/);
 const inline=[...home.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.ok(inline.length);
 for(const match of inline)new Script(match[1]);
});
test('recognition strip stays below players on mobile and wide desktop without a separate tile',()=>{
 assert.match(home,/\.kg-recognition-strip\{position:relative;z-index:2;box-sizing:border-box/);
 assert.match(home,/@media\(max-width:760px\)\{\.kg-recognition-strip\{margin-top:12px;padding:9px 11px/);
 assert.match(home,/\.hero-inner\{max-width:1660px;grid-template-columns:/);
 assert.match(home,/\.media-grid\{display:flex;flex-direction:column;gap:15px;margin-top:27px/);
});

test('Stage 43 CP29 subscriber recognition uses Twitch logo with no per-member frame',()=>{
 assert.match(home,/\.kg-recognition-member\{display:inline-flex;align-items:center;gap:5px;padding:0;border:0;background:none;border-radius:0;/);
 assert.match(home,/\.kg-recognition-member svg\{display:block;width:14px;height:14px;flex:none;fill:#A970FF\}/);
 const start=home.indexOf('function renderRecognitionMembers()');
 const end=home.indexOf('async function updateRecognitionMembers()',start);
 const render=home.slice(start,end);
 assert.match(render,/createElementNS\('http:\/\/www\.w3\.org\/2000\/svg','svg'\)/);
 assert.match(render,/setAttribute\('viewBox','0 0 24 24'\)/);
 assert.match(render,/setAttribute\('aria-hidden','true'\)/);
 assert.match(render,/pill\.append\(twitchIcon,subscriberName\)/);
 assert.doesNotMatch(render,/'Twitch · '\+entry\.displayName/);
 assert.match(render,/entry\.trial===true\?' · '/);
 assert.match(render,/recognizedMembers\.hidden=!recognizedMembers\.children\.length/);
});

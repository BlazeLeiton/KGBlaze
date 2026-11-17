import test from 'node:test';
import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';
import {musicPage,musicStateData} from '../src/music-page.mjs';

const langs=['es','en','ja'];
const get=(slug,lang)=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
const creditSection=page=>page.match(/<section class="credits">([\s\S]*?)<\/section>/)?.[1]||'';

test("Only eight reviewed event fields remain, with Let's be ONE event removed",()=>{
 const actual=songs.filter(s=>s.event).map(s=>s.slug).sort();
 const expected=['under-the-party-lights','ougon-kouro','blue-spirit','feelin-it-all','signal','aint-backing-down','tempestas-claim','what-youre-made-of'].sort();
 assert.deepEqual(actual,expected);
 const song=songs.find(s=>s.slug==='lets-be-one');
 assert.equal(song.event,undefined);
 for(const lang of langs){
  const html=get('lets-be-one',lang);
  const c=creditSection(html);
  assert.doesNotMatch(c,/<dt>(?:Evento|Event|イベント)<\/dt>/);
  assert.doesNotMatch(html,/Especial 1,000 suscriptores|1,000 subscribers special|登録者1,000人記念/);
  const state=musicStateData('/music/data/song/lets-be-one.json');
  assert.doesNotMatch(state.locales[lang].es.html,/Especial 1,000 suscriptores|1,000 subscribers special|登録者1,000人記念/);
 }
 assert.equal(songs.find(s=>s.slug==='planetarium').affiliation.event,'holo*27 Originals Vol.1','separate album/affiliation provenance is unchanged');
 assert.equal(songs.find(s=>s.slug==='suki-yuki-maji-magic').sourceDetail,'SNOW MIKU 2014','source provenance stays internal');
});

test('Every Blaze adjustment credit is concise and never mentions extensions in public credits',()=>{
 const adjusted=songs.filter(s=>s.adjustmentCredit==='Blaze Leiton');
 assert.equal(adjusted.length,6);
 for(const song of adjusted){
  for(const lang of langs){
   const credit=creditSection(get(song.slug,lang));
   const label=({es:'Adecuaciones',en:'Adjustments',ja:'歌詞の調整'})[lang];
   assert.ok(credit.includes(label+': Blaze Leiton'),song.slug+' '+lang+' inline adjustment');
   assert.doesNotMatch(credit,/(?:Adecuaciones y extensión|versión completa|Adjustments and expansion|full-length expansion|フルバージョンへの拡張|歌詞の調整・拡張)/,song.slug+' '+lang);
   assert.ok(credit.includes(song.adaptationCredit),song.slug+' retained actual adapter');
  }
 }
 const ryu=songs.find(s=>s.slug==='ryuusei'),xy=songs.find(s=>s.slug==='xy-and-z');
 for(const song of [ryu,xy])assert.deepEqual(song.adjustmentCreditLabel,{es:'Adecuaciones',en:'Adjustments',ja:'歌詞の調整'});
 assert.match(creditSection(get('pokemon-theme','es')), /Adolfo Aguirre Gamboa · Adecuaciones: Blaze Leiton/);
});

test('Ruteshi credits Blaze Leiton feat. V.A.F.M.O. as one interpretation, with no invented participant list',()=>{
 const song=songs.find(s=>s.slug==='ruteshi-kisuki-shiteru');
 assert.deepEqual(song.performance,['Blaze Leiton']);
 assert.deepEqual(song.participation,['V.A.F.M.O.']);
 assert.equal(song.featuredArtist,'V.A.F.M.O.');
 for(const lang of langs){
  const html=get(song.slug,lang),credits=creditSection(html);
  const header=({es:'Interpretación',en:'Performance',ja:'歌唱'})[lang];
  assert.ok(credits.includes('<dt>'+header+'</dt><dd>Blaze Leiton feat. V.A.F.M.O.</dd>'),lang+' featured interpretation');
  assert.doesNotMatch(credits,/<dt>(?:Con participación de|With participation by|参加)<\/dt>/,lang+' no duplicate participation');
  assert.doesNotMatch(credits,/Dedicatoria|Dedication|HBD Misao/,lang+' no private dedications');
  assert.ok(musicStateData('/music/data/song/'+song.slug+'.json').locales[lang].es.html.includes('Blaze Leiton feat. V.A.F.M.O.'),lang+' dynamic overlay');
 }
});

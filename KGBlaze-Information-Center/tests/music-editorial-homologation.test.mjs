import test from 'node:test';
import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {musicPage,musicStateData} from '../src/music-page.mjs';
import {originalArtist,originalPerformances,originalCreditRows} from '../src/music-performers.mjs';
import {ensembleVoiceIds} from '../src/music-vocal-display.mjs';

const page=(slug,lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
const credits=h=>h.match(/<section class="credits">([\s\S]*?)<\/section>/)?.[1]||'';
const available=['es','en','ja'];

test('Suki group role labels and trio headings are absent from pages and dynamic lyrics',()=>{
 const l=lyricsBySong['suki-yuki-maji-magic'].es;
 assert.equal(l.colorStanzas.length,20);
 assert.deepEqual(l.hiddenVoiceIds,['muerdago','galletita','caramelo']);
 assert.equal(l.sectionStarts,undefined);
 assert.ok(l.colorLegend.some(x=>x.id==='misaoalternate'));
 assert.equal(ensembleVoiceIds('shared',l).length,9,'dots must exclude editorial trio placeholders');
 for(const lang of available){
  const p=page('suki-yuki-maji-magic',lang);
  const state=musicStateData('/music/data/song/suki-yuki-maji-magic.json').locales[lang].es;
  const full=state.lyrics.es.full;
  for(const h of [p,full]){
   assert.doesNotMatch(h,/Trío Muérdago|Trío Caramelo|Trío Galletita|Muérdago|Caramelo|Galletita/);
   assert.match(h,/Misao Chan/);
   assert.match(h,/class="color-group"/);
   assert.match(h,/un pastel con crema/);
  }
 }
});

test('Spanish Pokémon themes are no longer falsely marked as multilingual',()=>{
 const slugs=['pokemon-theme','pokemon-world','pokemon-johto','born-to-be-a-winner','believe-in-me','i-wanna-be-a-hero','this-dream','unbeatable','battle-frontier'];
 for(const slug of slugs){
  const l=lyricsBySong[slug].es;
  assert.equal(l.language,'ES',slug);
  assert.equal(l.kind,'adaptation',slug);
  for(const lang of available){
   const markup=page(slug,lang);
   assert.doesNotMatch(markup,/<div class="lyric-heading"><span>(?:Multilingüe|Multilingual|多言語)<\/span>/);
  }
 }
 assert.equal(lyricsBySong['butter-fly'].multi.kind,'mixed','genuinely multilingual work remains unchanged');
});

test('Source anniversaries, context cleanup and Pokémon arc suppression',()=>{
 const under=songs.find(s=>s.slug==='under-the-party-lights');
 assert.equal(under.event.es,'6.º aniversario global');
 for(const lang of available){
  const html=page('under-the-party-lights',lang);
  assert.match(credits(html),/6\.º aniversario global|6th global anniversary|グローバル版6周年/);
  for(const slug of ['brave-shine','halloween-night','kirameki-rider','suki-yuki-maji-magic','leon-no-sabe-que-existo']){
   assert.doesNotMatch(credits(page(slug,lang)),/<dt>(?:Contexto|Context|関連作品)<\/dt>/,slug+' '+lang);
  }
 }
 assert.doesNotMatch(credits(page('dokimeki-diary')) , /<dt>Arco<\/dt>/);
 assert.doesNotMatch(credits(page('dokimeki-diary','en')) , /<dt>Story arc<\/dt>/);
 const leon=credits(page('leon-no-sabe-que-existo'));
 assert.match(leon,/<dt>Obra original<\/dt>/);
 assert.match(leon,/Kristina She Don&#39;t Know I Exist/);
 assert.match(leon,/Gura Doesn&#39;t Know I Exist/);
});

test('Bury, SINAY PAOHLA, Itani and other original adapters have consolidated credit lines',()=>{
 const slugs=['brave-shine','ryuusei','xy-and-z','connect','harumodoki','starlog'];
 for(const slug of slugs){
  const song=songs.find(s=>s.slug===slug);
  assert.ok(song.adaptationCredit&&song.adjustmentCredit,slug+' source credit');
  for(const lang of available){
   const detail=credits(page(slug,lang));
   assert.ok(detail.includes(song.adaptationCredit),slug+' original adapter');
   assert.match(detail,new RegExp(song.adjustmentCredit));
   assert.ok(detail.includes(' · '),slug+' shared inline format');
   assert.equal((detail.match(/<dd>Blaze Leiton<\/dd>/g)||[]).length,1,'solo performance credit, no duplicate adjustments rows');
  }
 }
 assert.equal(songs.find(s=>s.slug==='xy-and-z').adaptationCredit,'Itani');
 assert.equal(songs.find(s=>s.slug==='brave-shine').adaptationCreditLabel.es,'Adaptación al español');
 assert.doesNotMatch(credits(page('brave-shine')), /atribuida|Contexto/);
 assert.match(credits(page('ryuusei')), /SINAY PAOHLA · Adecuaciones y extensión a versión completa: Blaze Leiton/);
 assert.match(credits(page('xy-and-z')), /Itani · Adecuaciones y extensión: Blaze Leiton/);
});

test('Solo original cast duplicated from artist is hidden across all applicable works; Yakusoku remains a verified two-voice song',()=>{
 let removed=0;
 for(const song of songs){
  const p=originalPerformances[song.slug];
  if(p?.kind!=='character'||p.cast.length!==1)continue;
  removed++;
  for(const lang of available){
   assert.equal(originalCreditRows(song,lang,song.versions[0].id).length,0,song.slug+' '+lang);
   assert.doesNotMatch(credits(page(song.slug,lang)),/<dt>(?:Voces originales|Original voices|原曲の声優)<\/dt>/);
  }
 }
 assert.ok(removed>=6,'editorial audit covers multiple catalog solos');
 const yak=songs.find(s=>s.slug==='yakusoku');
 assert.equal(originalPerformances[yak.slug].cast.length,2);
 for(const lang of available){
  assert.equal(originalCreditRows(yak,lang,'es').length,1);
  assert.match(credits(page('yakusoku',lang)),lang==='ja'?/相羽あいな/:/Aina Aiba/);
  assert.match(credits(page('yakusoku',lang)),lang==='ja'?/中島由貴/:/Yuki Nakashima/);
 }
});

test('Ruteshi remains frozen until approval of the complete participant list',()=>{
 const r=songs.find(s=>s.slug==='ruteshi-kisuki-shiteru');
 assert.deepEqual(r.performance,['Blaze Leiton']);
 assert.deepEqual(r.participation,['V.A.F.M.O.']);
 assert.match(page(r.slug),/Con participación de<\/dt><dd>V\.A\.F\.M\.O\./);
});

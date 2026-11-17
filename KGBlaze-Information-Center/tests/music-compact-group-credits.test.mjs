import test from 'node:test';
import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';
import {musicPage,musicStateData} from '../src/music-page.mjs';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {ensembleVoiceIds,isEnsembleLyric,normalizeEnsembleLine} from '../src/music-vocal-display.mjs';

const enc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const page=(slug,lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
const credits=html=>html.match(/<section class="credits">([\s\S]*?)<\/section>/)?.[1]||'';

test('Paper Bouquet uses original English lyrics without a redundant lyrics/composition row',()=>{
 const source=songs.find(s=>s.slug==='paper-bouquet');
 assert.equal(source.originalComposer,'Cassie Wei · Yamato Kasai','provenance remains in registry');
 assert.equal(lyricsBySong['paper-bouquet'].en.kind,'original');
 for(const lang of ['es','en','ja']){
  const html=page('paper-bouquet',lang),detail=credits(html);
  assert.ok(html.includes('Laykarf dunon a hethkka ja'),'original sung text preserved');
  assert.doesNotMatch(html,/Letra y composición original|Original lyrics and composition|原曲作詞・作曲/);
  assert.ok(detail.includes('Mili'),'original artist preserved');
 }
});

test('Padoru collaboration pages keep accurate credits without redundant context',()=>{
 for(const slug of ['kirameki-rider','halloween-night','suki-yuki-maji-magic']){
  const source=songs.find(s=>s.slug===slug);
  assert.equal(source.padoruCover,true);
  assert.ok(source.sourceDetail,'source provenance remains intact');
  for(const lang of ['es','en','ja']){
   const h=page(slug,lang);
   const detail=credits(h);
   assert.doesNotMatch(detail,/<dt>(?:Contexto|Context|関連作品)<\/dt>/);
   assert.ok(detail.includes('Leon Live☆Heart'),'Spanish adaptation credit remains');
   assert.match(h,/<div class="color-legend"/);
  }
 }
});

test('Nine Pokémon fiches fold the Latin voice into original artist and consolidate adaptation',()=>{
 const pk=songs.filter(s=>s.localizationCredits?.latinArtist);
 assert.equal(pk.length,9);
 for(const song of pk){
  const original=song.artist,latin=song.localizationCredits.latinArtist;
  for(const lang of ['es','en','ja']){
   const detail=credits(page(song.slug,lang));
   const prefix=({es:'español',en:'Spanish',ja:'スペイン語'})[lang];
   const adaptation=({es:'Adaptación',en:'Adaptation',ja:'翻案'})[lang];
   const adjustments=({es:'Adecuaciones',en:'Adjustments',ja:'調整'})[lang];
   assert.ok(detail.includes(enc(original)+' ('+prefix+': '+enc(latin)+')'),song.slug+' '+lang+' combined original performers');
   assert.doesNotMatch(detail,/Intérpretes del doblaje latino|Latin American dub performers|中南米スペイン語版歌唱/);
   assert.doesNotMatch(detail,/Adaptación del doblaje latino|Latin American dub adaptation|中南米スペイン語版歌詞/);
   assert.doesNotMatch(detail,/<dt>(?:Localización|Localization|ローカライズ)<\/dt>/);
   assert.doesNotMatch(detail,/<dt>(?:Versión de referencia|Reference arrangement|参考アレンジ)<\/dt>/);
   assert.doesNotMatch(detail,/<dt>(?:Doblaje español europeo|European Spanish dub|欧州スペイン語版)<\/dt>/);
   if(song.localizationCredits.latinAdapter){
    assert.ok(detail.includes('<dt>'+adaptation+'</dt><dd>'+enc(song.localizationCredits.latinAdapter)+' · '+adjustments+': Blaze Leiton</dd>'),song.slug+' '+lang+' combine adapter & adjustments');
   }else{
    assert.ok(detail.includes('<dt>'+adjustments+'</dt><dd>Blaze Leiton</dd>'),song.slug+' '+lang+' do not invent adapter');
   }
  }
 }
 const theme=credits(page('pokemon-theme'));
 assert.ok(theme.includes('Jason Paige (español: Óscar Roa)'));
 assert.ok(theme.includes('<dt>Adaptación</dt><dd>Adolfo Aguirre Gamboa · Adecuaciones: Blaze Leiton</dd>'));
});

test('All source-documented group line divisions use the same dots; duets unchanged',()=>{
 const groups=['kirameki-rider','halloween-night','suki-yuki-maji-magic','beginners-rock'];
 for(const slug of groups){
  const l=lyricsBySong[slug].es;
  assert.ok(isEnsembleLyric(l),slug+' should render as group');
  assert.ok(l.colorLegend.length>=3);
  for(const stanza of l.colorStanzas)for(const line of stanza){
   const original=line.map(p=>p.text).join('');
   const normalized=normalizeEnsembleLine(line,l);
   assert.equal(normalized.map(p=>p.text).join(''),original,slug+' must preserve lyrics verbatim');
   for(const part of normalized){
    const ids=part.voice==='shared'?[]:part.voice.split('+');
    assert.ok(ids.every(id=>l.colorLegend.some(v=>v.id===id))||part.voice==='shared',slug+' voice identification');
   }
  }
  assert.equal(ensembleVoiceIds('shared',l).length,l.colorLegend.filter(p=>!l.hiddenVoiceIds?.includes(p.id)).length,slug+' only documented performer voices represented by dots');
  for(const lang of ['es','en','ja']){
   const doc=page(slug,lang),data=musicStateData('/music/data/song/'+slug+'.json');
   assert.ok(doc.includes('class="color-group"'),slug+' '+lang+' multi-color group dots');
   assert.ok(data.locales[lang].es.lyrics.es.full.includes('class="color-group"'),slug+' '+lang+' asynchronous lyric display');
  }
 }
 const suki=lyricsBySong['suki-yuki-maji-magic'].es;
 const originalLine=suki.colorStanzas[1][1];
 assert.ok(originalLine.map(x=>x.text).join('').includes('(ya to-dos)'));
 const normalized=normalizeEnsembleLine(originalLine,suki);
 assert.ok(normalized.some(x=>x.voice.includes('+')&&x.text.includes('(ya to-dos)')),'multi-voice parenthetical uses grouped dots');
 assert.equal(suki.colorStanzas.length,20,'original 20 stanzas unaffected');
 for(const slug of ['the-secret-night','pokemon-johto']){
  const duet=lyricsBySong[slug].es;
  assert.equal(isEnsembleLyric(duet),false);
  assert.deepEqual(normalizeEnsembleLine(duet.colorStanzas[0][0],duet),duet.colorStanzas[0][0]);
  assert.equal(ensembleVoiceIds('shared',duet).length,0);
 }
});

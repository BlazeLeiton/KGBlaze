import {test} from 'node:test';
import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';
import {musicPage,musicStateData} from '../src/music-page.mjs';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {releaseArtwork} from '../src/music-artwork.mjs';

const one=slug=>{const s=songs.find(x=>x.slug===slug);assert.ok(s,'missing '+slug);return s;};
const html=(slug,lang='es')=>musicPage('/music/song/'+slug+'/',new URLSearchParams({lang}));

test('ReSpark Stages 26–35: full inventory, one fiche per work, preserved approved artwork and tri-locale routes',()=>{
 assert.equal(songs.length,115);
 assert.equal(new Set(songs.map(x=>x.slug)).size,songs.length);
 for(const s of songs){
  assert.ok(releaseArtwork[s.slug],s.slug+' has no sourced cover artwork');
  assert.ok(lyricsBySong[s.slug],s.slug+' has no lyric record');
  assert.ok(s.versions.some(v=>v.public!==false),s.slug+' no public recorded version');
  for(const lang of ['es','en','ja']){
   const d=html(s.slug,lang);
   assert.match(d,/class="credits"/,s.slug+' '+lang+' missing credits');
   assert.doesNotMatch(d,/Álbum planeado \(no publicado\)|Planned unreleased album/,s.slug+' leaked private planned album');
  }
  assert.ok(musicStateData('/music/data/song/'+s.slug+'.json'),'state missing '+s.slug);
 }
});

test('ReSpark final credits: origin, third-party adaptations, adjustments, and thematic contexts never collapse',()=>{
 const ry=one('ryuusei');
 assert.equal(ry.adaptationCredit,'SINAY PAOHLA');
 assert.equal(ry.adjustmentCredit,'Blaze Leiton');
 assert.equal(ry.lyricInspiration,undefined);
 const ot=one('otome-domo-yo');
 assert.equal(ot.adaptationCredit,'Marutah');
 assert.equal(ot.adjustmentCredit,undefined);
 const br=one('brave-shine');
 assert.equal(br.adaptationCredit,'Call Me Bury (Bury Singer)');
 assert.equal(br.adjustmentCredit,'Blaze Leiton');
 assert.equal(releaseArtwork['brave-shine'].image,'/music-artwork/brave-shine-v1.webp');
 assert.match(br.adaptationAttributionStatus,/not-independently-verified/);
 const c=one('connect');
 assert.equal(c.adaptationCredit,'Sekai025');
 assert.equal(c.modificationCredit,'Glorylé Solis');
 assert.equal(c.adjustmentCredit,'Blaze Leiton');
 assert.equal(one('harumodoki').adjustmentCredit,'Blaze Leiton');
 assert.equal(one('starlog').adjustmentCredit,'Blaze Leiton');
 for(const lang of ['es','en','ja']){
  const h=html('ryuusei',lang);
  assert.ok(h.includes('SINAY PAOHLA'));
  assert.ok(h.includes(ry.adjustmentCreditLabel[lang]+'</dt><dd>Blaze Leiton</dd>'));
  assert.ok(html('otome-domo-yo',lang).includes('Marutah'));
 }
 assert.equal(one('el-nano').context.catalog.es,'Fórmula 1');
 assert.equal(one('el-nano').context.detail.es,'Fórmula 1 · Fernando Alonso');
 assert.equal(one('el-mismo-sol').context.detail.es,'Juegos Panamericanos Guadalajara 2011');
 assert.equal(one('signal').event.es,'Operation Siren — Tema de lanzamiento');
});

test('ReSpark exact approved lines and safe orthography do not drift from assigned voice/color rows',()=>{
 const k=lyricsBySong['kirameki-rider'].es;
 const line='Muy feliz terminé, tanto que no puedo hablar ya más';
 assert.ok(k.text.includes(line));
 assert.ok(k.colorStanzas.some(stanza=>stanza.some(parts=>parts.map(p=>p.text).join('')===line)));
 assert.equal(k.colorStanzas.map(st=>st.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),k.text);
 assert.ok(k.text.includes('¿Puedes tú escuchar el sonido de mi voz?'));
 const snow=lyricsBySong['suki-yuki-maji-magic'].es;
 assert.ok(snow.text.includes('un pastel con crema'));
 assert.equal(snow.colorStanzas.map(st=>st.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),snow.text);
 const ry=lyricsBySong['ryuusei'].es.text;
 assert.ok(ry.includes('Y al lo que carezco recontar'),'creator-approved wording must not be rewritten');
 assert.ok(ry.includes('Su luz iluminará todas las tinieblas'));
 assert.ok(ry.includes('¿Cuándo fue la última vez que logré sonreír?'));
 assert.ok(ry.includes('Fue así que pensé, en mí no tener'));
 for(const [slug,variants] of Object.entries(lyricsBySong))for(const v of Object.values(variants)){
  if(!v?.text)continue;
  assert.ok(!v.text.includes('Aún así'),slug+' concessive aun without accent');
 }
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {colorDivisionFromReference} from '../src/music-line-attributions.mjs';

test('Relight Stage 37: Gimi Gimi approved voice segments preserve both releases',()=>{
 const cases={"1:1":[["El ruido, más menos cero en la ciudad ","fu"],["sonó","tokage"]],"2:1":[["Me siento más que viva","tokage"]],"2:3":[["¿Por cuánto más será?","fu"]],"3:1":[["Déjate llevar y tus dudas ya suelta","shared"]],"3:2":[["Jugarás en libertad ","live"],["sólo en este lugar","ichiko"]],"3:6":[["Hasta amanecer no acaba ","ichiko"],["¿Qué es lo que tú vas a hacer?","tokage"]],"3:7":[["Bien, lo que tu tengas","live"],[" en tu mente dámelo a mi","shared"]],"5:1":[["Me divierte el momento","fu+tokage"]],"5:3":[["Pues tan distinto es","live+ichiko"]],"6:3":[["¿Será el estar tanto en este lugar?","shared"]],"9:0":[["¡Despiértame! ","live"],["¡Y síguenos!","shared"]],"10:6":[["Esta diver","tokage"],["sión no acaba","fu"],[" ¿Qué es lo que tú vas a hacer?","ichiko"]],"11:6":[["¡Vamos, ven aquí!","live"],[" Y dime ¿Qué es lo que tu quieres? Ven","unattributed"]]};
 for(const version of ['full','tv']){
  const source=lyricsBySong['gimi-gimi'][version], rendered=colorDivisionFromReference(source,'gimi-gimi');
  assert.equal(rendered.colorStanzas.map(s=>s.map(row=>row.map(p=>p.text).join('')).join('\n')).join('\n\n'),source.text);
  for(const [key,expected] of Object.entries(cases)){
   const [stanza,row]=key.split(':').map(Number);
   assert.deepEqual(rendered.colorStanzas[stanza][row].map(p=>[p.text,p.voice]),expected,key);
  }
  for(const row of [1,3])assert.equal(rendered.colorStanzas[11][row][0].voice,'shared');
 }
});
test('Halloween Padoru collective ending has eight voices, with original separate',()=>{
 const source=lyricsBySong['halloween-night'].es;
 assert.equal(source.colorLegend.length,8); assert.equal(source.sharedLabel.es,'Todas');
 assert.equal(source.colorStanzas.map(s=>s.map(row=>row.map(p=>p.text).join('')).join('\n')).join('\n\n'),source.text);
 for(const row of [6,7,8])assert.deepEqual(source.colorStanzas[4][row].map(p=>p.voice),['shared']);
 assert.equal(colorDivisionFromReference(source,'halloween-night').colorLegend.length,4);
});

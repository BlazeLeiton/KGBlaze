import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {colorDivisionFromReference, lineAttributions, originalColorPalettes} from '../src/music-line-attributions.mjs';

const slug='lets-be-one';
const lyric=lyricsBySong[slug].es;
const colored=colorDivisionFromReference(lyric,slug);
const cuts=(stanza,line)=>colored.colorStanzas[stanza][line];
const expect=(stanza,line,segments)=>{
 assert.deepEqual(cuts(stanza,line).map(({text,voice})=>[text,voice]),segments, 'Voice cut '+stanza+':'+line);
};

test('Relight Stage 37: approved Liella vocal overlay keeps canonical site palette, original 41 lines and all original text fragments',()=>{
 assert.equal(colored.colorRole,'voice');
 assert.equal(colored.colorLegend.length,11);
 assert.deepEqual(colored.colorLegend,originalColorPalettes[slug]);
 assert.deepEqual(lyric.text.trim().split(/\n\s*\n/).map(s=>s.split('\n').length),[3,3,2,2,6,4,4,3,5,3,6]);
 assert.match(lineAttributions[slug].status,/fan-transcription/);
 assert.match(lineAttributions[slug].status,/creator-approved/);
 const stanzas=lyric.text.trim().split(/\n\s*\n/).map(s=>s.split('\n'));
 for(let s=0;s<stanzas.length;s++)for(let l=0;l<stanzas[s].length;l++){
  const rendered=cuts(s,l);
  assert.equal(rendered.map(p=>p.text).join(''),stanzas[s][l],s+':'+l+' text preservation');
  assert.ok(rendered.every(p=>p.voice&&p.text),s+':'+l+' no empty fragments/voices');
 }
 assert.equal(colored.sharedColor,'#F0F3FF');
 assert.deepEqual(colored.hiddenVoiceIds,['unattributed']);
});

test('Relight Stage 37: creator-approved precise Spanish cuts',()=>{
 expect(1,2,[['Es sólo este amor por ','tomari'],['alcanzar nuestros sueños','sumire+kinako+margarete+tomari']]);
 expect(2,1,[['Es por eso que ','keke'],['algo inquebrantable en mi ','shiki'],['encuentro esta vez','keke+shiki']]);
 expect(4,4,[['Esta promesa entre tú y yo','chisato+natsumi']]);
 expect(4,5,[['Será por siempre, ','kanon'],['pues somos un sólo mismo sueño','shared']]);
 expect(9,1,[['Y fue al conocerte, ','kanon+margarete'],['cuenta pude darme','kanon+kinako']]);
 expect(9,2,[['La palabra “unidad” ','kanon+kinako+margarete'],['que significa en verdad','shared']]);
 expect(10,1,[['Pues seguramente, ','margarete+tomari'],['ya te he conocido, ','kinako+mei+shiki+natsumi'],['y unidos vamos a estar','kanon+keke+chisato+sumire+ren']]);
});

test('Relight Stage 37: all other approved voice changes and simultaneous parts are retained',()=>{
 const expected={
  '1:0':['kinako','sumire'],
  '3:0':['mei','natsumi'],
  '4:1':['keke+shiki','sumire+kinako','keke+shiki+sumire+kinako'],
  '4:2':['shared','ren+mei'],
  '7:1':['mei+tomari','ren+natsumi','mei+tomari+ren+natsumi'],
  '7:2':['shared','kanon+chisato'],
  '10:0':['kanon'],
 };
 for(const [key,roles] of Object.entries(expected)){const [s,l]=key.split(':').map(Number);assert.deepEqual(cuts(s,l).map(p=>p.voice),roles,key);}
});

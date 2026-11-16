import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';

const base=(process.env.RELIGHT_MUSIC_ORIGIN||'https://kgblaze.dpdns.org').replace(/\/$/,'');
async function load(path){
 const url=base+path+(path.includes('?')?'&':'?')+'relight-audit='+Date.now();
 const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200,url+' HTTP status');
 return response.text();
}
const catalog=await load('/music/?lang=es');
assert.equal((catalog.match(/<article class="song"/g)||[]).length,songs.length,'deployed music cards vs current registry');
const checks=[
 ['kirameki-rider',['Muy feliz terminé, tanto que no puedo hablar ya más']],
 ['ryuusei',['SINAY PAOHLA','Adecuaciones y extensión a versión completa','Blaze Leiton']],
 ['otome-domo-yo',['Marutah','Adaptación al español']],
 ['brave-shine',['Call Me Bury','Adecuaciones','Blaze Leiton']],
 ['signal',['Operation Siren — Tema de lanzamiento']],
 ['el-nano',['Fórmula 1 · Fernando Alonso']],
 ['el-mismo-sol',['Juegos Panamericanos Guadalajara 2011']]
];
for(const [slug,terms] of checks){
 const h=await load('/music/song/'+slug+'/?lang=es');
 for(const term of terms)assert.ok(h.includes(term),slug+' lacks '+term+' in deployed page');
}
console.log('Production confirmed:',songs.length,'cards and',checks.length,'approved metadata/lyric samples on',base);

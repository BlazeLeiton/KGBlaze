import assert from 'node:assert/strict';
import {songs} from '../src/music-catalog.mjs';

const base=(process.env.RELIGHT_MUSIC_ORIGIN||'https://kgblaze.dpdns.org').replace(/\/$/,'');
async function load(path){
 const url=base+path+(path.includes('?')?'&':'?')+'relight-audit='+Date.now();
 const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,200,url+' HTTP status');
 return response.text();
}
const landing=await load('/music/?lang=es');
assert.match(landing,/data-view="home"/);
assert.match(landing,/href="\/music\/songs\/\?lang=es"/);
assert.doesNotMatch(landing,/<article class="song"/);
const catalog=await load('/music/songs/?lang=es');
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
 const h=await load('/music/songs/song/'+slug+'/?lang=es');
 for(const term of terms)assert.ok(h.includes(term),slug+' lacks '+term+' in deployed page');
}
for(const oldPath of ['/music/song/blue-spirit/?lang=en&version=en','/music/blue-spirit/?lang=ja']){
 const r=await fetch(base+oldPath,{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});
 assert.equal(r.status,308,'legacy 308 redirect');
 assert.equal(new URL(r.headers.get('location')).pathname,'/music/songs/blue-spirit/');
}
for(const reserved of ['/music/albums/','/music/albums/album01/']){
 const response=await fetch(base+reserved,{cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(15000)});
 assert.equal(response.status,404,'planned album routes remain inaccessible');
}
console.log('Production confirmed: music landing,',songs.length,'catalog entries,',checks.length,'metadata/lyric samples, legacy redirects and reserved albums at',base);

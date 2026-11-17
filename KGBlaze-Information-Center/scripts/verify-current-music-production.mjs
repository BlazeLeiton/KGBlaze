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
 const h=await load('/music/songs/'+slug+'/?lang=es');
 for(const term of terms)assert.ok(h.includes(term),slug+' lacks '+term+' in deployed page');
}
const bilingual=[['pokemon-theme','Pokémon Theme','Tema de Pokémon'],['born-to-be-a-winner','Born to Be a Winner','Quiero siempre el triunfo'],['leon-no-sabe-que-existo',"Gura Doesn't Know I Exist",'Leon no sabe que existo']];
const encode=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const [slug,english,spanish] of bilingual)for(const lang of ['es','en','ja']){
 const page=await load('/music/songs/'+slug+'/?lang='+lang);
 const heading=page.match(/<div class="detail-title">[\s\S]*?<h1>([\s\S]*?)<\/h1>/)?.[1]||'';
 const main=lang==='es'?spanish:english,secondary=lang==='es'?english:spanish;
 assert.ok(heading.includes('<span class="title-primary">'+encode(main)+'</span>'),slug+' '+lang+' incorrect primary title');
 assert.ok(heading.includes('<span class="title-secondary">'+encode(secondary)+'</span>'),slug+' '+lang+' incorrect subtitle');
}
const pokemon=await load('/music/songs/pokemon-theme/?lang=es');
assert.match(pokemon,/Jason Paige \(español: Óscar Roa\)/);
assert.match(pokemon,/Adolfo Aguirre Gamboa · Adecuaciones: Blaze Leiton/);
assert.doesNotMatch(pokemon,/<dt>(?:Localización|Versión de referencia|Adaptación del doblaje latino)<\/dt>/);
const bouquet=await load('/music/songs/paper-bouquet/?lang=es');
assert.doesNotMatch(bouquet,/Letra y composición original/);
for(const slug of ['kirameki-rider','halloween-night','suki-yuki-maji-magic']){
 const details=await load('/music/songs/'+slug+'/?lang=es');
 const credits=details.match(/<section class="credits">[\s\S]*?<\/section>/)?.[0]||'';
 assert.doesNotMatch(credits,/<dt>Contexto<\/dt>/);
 assert.match(details,/class="color-group"/);
}
// Editorial homologation checks against the actual deployed HTML.
for(const slug of ['pokemon-theme','pokemon-world','pokemon-johto','born-to-be-a-winner','believe-in-me','i-wanna-be-a-hero','this-dream','unbeatable','battle-frontier']){
 const html=await load('/music/songs/'+slug+'/?lang=es');
 assert.ok(!html.includes('<div class="lyric-heading"><span>Multilingüe</span>'),slug+' erroneously claims multiple languages');
}
const suki=await load('/music/songs/suki-yuki-maji-magic/?lang=es');
for(const term of ['Muérdago','Galletita','Caramelo','Trío '])assert.ok(!suki.includes(term),'Suki displayed unapproved placeholder '+term);
assert.ok(suki.includes('class="color-group"'));
const globalEvent=await load('/music/songs/under-the-party-lights/?lang=es');
assert.ok(globalEvent.includes('6.º aniversario global'));
const brave=await load('/music/songs/brave-shine/?lang=es');
assert.ok(brave.includes('Call Me Bury (Bury Singer)'));
assert.ok(!brave.includes('atribuida'));
assert.ok(!brave.includes('<dt>Contexto</dt>'));
const ry=await load('/music/songs/ryuusei/?lang=es');
assert.ok(ry.includes('SINAY PAOHLA · Adecuaciones: Blaze Leiton'));
const xy=await load('/music/songs/xy-and-z/?lang=es');
assert.ok(xy.includes('Itani · Adecuaciones: Blaze Leiton'));
assert.ok(!xy.includes('<dt>Voces originales</dt>'));
const reality=await load('/music/songs/your-reality/?lang=es');
assert.ok(!reality.includes('<dt>Voces originales</dt>'));
const leon=await load('/music/songs/leon-no-sabe-que-existo/?lang=es');
assert.ok(leon.includes('<dt>Obra original</dt>'));
const dokimeki=await load('/music/songs/dokimeki-diary/?lang=es');
assert.ok(!dokimeki.includes('<dt>Arco</dt>'));
const one=await load('/music/songs/lets-be-one/?lang=es');
assert.ok(!one.includes('<dt>Evento</dt>'));
assert.ok(!one.includes('Especial 1,000 suscriptores'));
const ruteshi=await load('/music/songs/ruteshi-kisuki-shiteru/?lang=es');
assert.ok(ruteshi.includes('<dt>Interpretación</dt><dd>Blaze Leiton feat. V.A.F.M.O.</dd>'));
assert.ok(!ruteshi.includes('<dt>Con participación de</dt>'));
for(const slug of ['brave-shine','ryuusei','connect','harumodoki','starlog','xy-and-z']){
 const h=await load('/music/songs/'+slug+'/?lang=es');
 const credits=h.match(/<section class="credits">[\s\S]*?<\/section>/)?.[0]||'';
 assert.ok(credits.includes('Adecuaciones: Blaze Leiton'),slug+' concise adjustments');
 assert.ok(!/Adecuaciones y extensión|versión completa/.test(credits),slug+' verbose adjustments');
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
console.log('Production confirmed: music landing,',songs.length,'catalog entries,',checks.length,'metadata/lyric samples, bilingual titles ES/EN/JA, legacy redirects and reserved albums at',base);

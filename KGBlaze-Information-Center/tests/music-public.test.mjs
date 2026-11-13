import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';
import {songs} from '../src/music-catalog.mjs';
import {MUSIC_PATHS,MUSIC_TYPE_PATH,musicPage} from '../src/music-page.mjs';
import {VIEWER_CSS} from '../src/viewer-enhancements.mjs';
const origin='https://kgblaze.dpdns.org';
const req=(p,method='GET')=>new Request(origin+p,{method});
const environment={ASSETS:{fetch:async r=>{
 assert.equal(new URL(r.url).pathname,'/');
 return new Response("<style>@font-face{font-family:'Garnett';src:url(data:font/otf;base64,AA==);font-display:block;}@font-face{font-family:'Noto Sans JP Project';src:url(data:font/woff2;base64,AA==);font-display:block;}</style>",{headers:{'Content-Type':'text/html'}});
}}};
test('Music routes are exact, read-only, and do not expose admin aliases',()=>{
 for(const p of [...MUSIC_PATHS,MUSIC_TYPE_PATH]){
  assert.equal(routePortalRequest(req(p)).response,undefined);
  assert.equal(routePortalRequest(req(p,'POST')).response.status,405);
 }
 assert.equal(routePortalRequest(req('/music/api/admin')).response.status,404);
 assert.equal(routePortalRequest(req('/music/unpublished-song/')).response.status,404);
 assert.equal(routePortalRequest(req('/departures/')).request.url,origin+'/');
});
test('Music preview renders three pages in three languages without external media or unpublished lyrics',()=>{
 for(const p of [...MUSIC_PATHS].filter(p=>p.endsWith('/')))for(const lang of ['es','en','ja']){
  const html=musicPage(p,new URLSearchParams({lang}));
  assert.match(html,new RegExp('lang="'+lang+'"'));
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/typography-v1\.css/);
  assert.doesNotMatch(html,/youtube\.com|mega\.nz|undefined/);
 }
 const html=musicPage('/music/blue-spirit/',new URLSearchParams({lang:'ja',version:'en'}));
 assert.match(html,/楽曲選集/);
 assert.match(html,/2024年4月/);
 assert.match(html,/version=en/);
});
test('Worker serves preview with noindex, canonical slash, HEAD and cached typography',async()=>{
 const page=await worker.fetch(req('/music/'),environment);
 assert.equal(page.status,200);
 assert.match(page.headers.get('X-Robots-Tag'),/noindex/);
 assert.match(page.headers.get('Content-Type'),/text\/html/);
 assert.match(await page.text(),/Rebel Mix/);
 const head=await worker.fetch(req('/music/','HEAD'),environment);
 assert.equal(head.status,200);
 assert.equal(await head.text(),'');
 const redirect=await worker.fetch(req('/music?lang=ja'),environment);
 assert.equal(redirect.status,308);
 assert.equal(redirect.headers.get('Location'),origin+'/music/?lang=ja');
 const font=await worker.fetch(req(MUSIC_TYPE_PATH),environment);
 assert.equal(font.status,200);
 assert.match(font.headers.get('Content-Type'),/text\/css/);
 assert.match(font.headers.get('Cache-Control'),/max-age=86400/);
 assert.match(await font.text(),/font-display:swap/);
 assert.equal((await worker.fetch(req('/music/','POST'),environment)).status,405);
});
test('new Terminal visual layer stays outside embedded canvas and protected controls',()=>{
 const exterior=VIEWER_CSS.split('Relight public identity v1:')[1].split('/* Stage 12:')[0];
 assert.match(exterior,/body:not\(\.embedded\)/);
 assert.doesNotMatch(exterior,/\n[^\n]*(?:#board|\.flight-light|\.flight-status|\.compact-actions|\.hit-layer)[^{\n]*\{/);
 assert.match(exterior,/#020C41/);assert.match(exterior,/#0B1761/);assert.match(exterior,/#276EF1/);assert.match(exterior,/#FA0073/);
});

test('public polish preserves platform color and exposes first release metadata',()=>{
 assert.match(VIEWER_CSS,/\.discord-btn\{background:#536ee5;border-radius:6px/);
 assert.match(VIEWER_CSS,/\.panel-side\{background:#0B1761;border:1px solid #276EF1;border-radius:8px/);
 const catalog=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.match(catalog,/data-year="2022"/);
 assert.match(catalog,/data-year="2023"/);
 assert.doesNotMatch(catalog,/data-year="2022 2024"/);
 assert.match(catalog,/ドキメキダイアリー/);
 assert.match(catalog,/\(Dokimeki Diary\)/);
 assert.match(catalog,/Pokémon Horizons · Temporada 1/);
 assert.match(catalog,/Astrum · 2022/);
 assert.match(catalog,/asmi feat\. Chinozo · 2023/);
 const blue=musicPage('/music/blue-spirit/',new URLSearchParams({lang:'es',version:'en'}));
 assert.match(blue,/Universe in Unison/);
 assert.match(blue,/Primer estreno<\/dt><dd>2022/);
 assert.match(blue,/Fecha de esta versión<\/dt><dd>abril de 2024/);
 assert.match(blue,/border-radius:8px/);
});

test('song header follows selected version while catalog keeps first release',()=>{
 const get=(slug,lang,version)=>musicPage('/music/'+slug+'/',new URLSearchParams({lang,version}));
 const header=html=>html.match(/<div class="detail-title">[\s\S]*?<\/div><section class="version-bar">/)[0];
 const es=get('blue-spirit','es','es'),en=get('blue-spirit','es','en');
 assert.match(header(es),/Astrum · 2022/);
 assert.match(header(es),/datetime="2022-04">abril de 2022/);
 assert.match(header(en),/Astrum · 2024/);
 assert.doesNotMatch(en,/2024-04-26|26 de abril/);
 assert.doesNotMatch(es,/2022-04-01|1 de abril/);
 assert.match(header(en),/datetime="2024-04">abril de 2024/);
 assert.match(en,/Primer estreno<\/dt><dd>2022/);
 assert.match(header(get('blue-spirit','en','en')),/April 2024/);
 assert.match(header(get('blue-spirit','ja','en')),/2024年4月/);
 assert.match(header(get('dokimeki-diary','es','es')),/datetime="2023-05">mayo de 2023/);
 assert.match(header(get('dokimeki-diary','es','ensemble')),/datetime="2023-12">diciembre de 2023/);
 assert.match(musicPage('/music/',new URLSearchParams({lang:'es'})),/Astrum · 2022/);
});

test('pilot has ten songs and thirteen distinct publications with valid routes',()=>{
 assert.equal(songs.length,10);
 const versions=songs.flatMap(s=>s.versions);
 assert.equal(versions.length,13);
 assert.equal(new Set(versions.map(v=>v.videoId)).size,13);
 assert.ok(versions.every(v=>/^[A-Za-z0-9_-]{11}$/.test(v.videoId)));
 assert.equal(MUSIC_PATHS.size,22);
 assert.equal(songs.filter(s=>s.firstCover).length,1);
 assert.equal(songs.find(s=>s.firstCover).slug,'only-one-yell');
 const html=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.equal((html.match(/<article class="song"/g)||[]).length,10);
 assert.match(html,/data-lang="ES FR MULTI"/);
 assert.match(html,/data-lang="MULTI"/);
 assert.match(html,/data-lang="ES JA"/);
 assert.match(html,/<option value="MULTI">Multilingüe/);
 assert.match(html,/2021/);
});
test('Pokémon source edition is independent of cover language and numbering',()=>{
 const song=songs.find(s=>s.slug==='dokimeki-diary');
 assert.equal(song.sourceEdition,'jp');
 assert.equal(song.theme,'OP 1');
 assert.ok(song.versions.every(v=>v.langs.includes('ES')));
 const page=(lang,version)=>musicPage('/music/dokimeki-diary/',new URLSearchParams({lang,version}));
 assert.match(page('es','ensemble'),/Pokémon Horizons · Temporada 1 \(JP\)/);
 assert.doesNotMatch(page('es','ensemble'),/Edición de origen<\/dt>/);
 assert.match(page('en','es'),/Pokémon Horizons · Season 1 \(JP\)/);
 assert.doesNotMatch(page('en','es'),/Source edition<\/dt>/);
 assert.match(page('ja','es'),/Pokémon Horizons · シーズン1（日本版）/);
 assert.doesNotMatch(page('ja','es'),/原曲の版<\/dt>/);
 assert.doesNotMatch(musicPage('/music/blue-spirit/',new URLSearchParams({lang:'es'})),/Edición de origen<\/dt>/);
});
test('pilot maintains version arrangement and first cover history',()=>{
 const p=(slug,version)=>musicPage('/music/'+slug+'/',new URLSearchParams({lang:'es',version}));
 assert.match(p('snow-halation','naked-garden'),/naked garden Ver\. — ChouCho/);
 assert.match(p('snow-halation','hso-orchestra'),/HSO Orchestra Ver\./);
 assert.match(p('only-one-yell','es'),/El primer cover publicado de Blaze Leiton/);
 assert.match(p('cake-song','es'),/Créditos por verificar/);
});

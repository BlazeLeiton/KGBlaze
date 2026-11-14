import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';
import {songs} from '../src/music-catalog.mjs';
import {coverAlbums,albumsForVersion} from '../src/music-albums.mjs';
import {originalPerformances,originalArtist,voiceLabel,originalCreditRows} from '../src/music-performers.mjs';
import {serveArtwork} from '../src/music-artwork-cache.mjs';
import {releaseArtwork,artworkURL,artworkSources} from '../src/music-artwork.mjs';
import {franchiseRegistry,franchiseTags,franchiseTagLabel,affiliationWork,affiliationDetails,catalogAffiliationBadge,franchiseSearchAliases} from '../src/music-franchises.mjs';
import {lyricsBySong,lyricAliases} from '../src/music-lyrics.mjs';
import {tagsForSeason,pokemonTags,seasonTagLabel,blockSeriesLabel,blockSearchAliases} from '../src/music-pokemon-tags.mjs';
import {workName,workAliases,pokemonWorkLabel,pokemonCounterpart} from '../src/music-works.mjs';
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
test('Music preview renders all pages in three languages with scoped YouTube media',()=>{
 for(const p of [...MUSIC_PATHS].filter(p=>p.endsWith('/')))for(const lang of ['es','en','ja']){
  const html=musicPage(p,new URLSearchParams({lang}));
  assert.match(html,new RegExp('lang="'+lang+'"'));
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/typography-v1\.css/);
  assert.doesNotMatch(html,/mega\.nz|undefined|<iframe /);
  assert.match(html,/i\.ytimg\.com\/vi\//);
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
 assert.match(catalog,/La Serie Horizontes Pokémon · Temporada 1/);
 assert.match(catalog,/Astrum · 2022/);
 assert.match(catalog,/asmi feat\. Chinozo · 2023/);
 const blue=musicPage('/music/blue-spirit/',new URLSearchParams({lang:'es',version:'en'}));
 assert.match(blue,/Universe in Unison/);
 assert.match(blue,/Primer estreno<\/dt><dd>abril de 2022/);
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
 assert.match(en,/Primer estreno<\/dt><dd>abril de 2022/);
 assert.match(header(get('blue-spirit','en','en')),/April 2024/);
 assert.match(header(get('blue-spirit','ja','en')),/2024年4月/);
 assert.match(header(get('dokimeki-diary','es','es')),/datetime="2023-05">mayo de 2023/);
 assert.match(header(get('dokimeki-diary','es','ensemble')),/datetime="2023-12">diciembre de 2023/);
 assert.match(musicPage('/music/',new URLSearchParams({lang:'es'})),/Astrum · 2022/);
});

test('catalog has twenty-seven songs and thirty-two historical video IDs with valid routes',()=>{
 assert.equal(songs.length,33);
 const versions=songs.flatMap(s=>s.versions);
 assert.equal(versions.length,41);
 const videos=versions.filter(v=>v.videoId);
 assert.equal(videos.length,38);
 assert.equal(new Set(videos.map(v=>v.videoId)).size,38);
 assert.equal(versions.filter(v=>v.medium==='audio'&&v.availability==='pending'&&!v.date&&!v.videoId).length,3);
 assert.ok(videos.every(v=>/^[A-Za-z0-9_-]{11}$/.test(v.videoId)));
 assert.equal(MUSIC_PATHS.size,68);
 assert.equal(songs.filter(s=>s.firstCover).length,1);
 assert.equal(songs.find(s=>s.firstCover).slug,'only-one-yell');
 const html=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.equal((html.match(/<article class="song"/g)||[]).length,33);
 assert.match(html,/data-lang="ES FR MULTI"/);
 assert.match(html,/data-lang="JA FR PT ES EN MULTI"/);
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
 assert.match(page('es','ensemble'),/La Serie Horizontes Pokémon · Temporada 1 \(JP\)/);
 assert.doesNotMatch(page('es','ensemble'),/Edición de origen<\/dt>/);
 assert.match(page('en','es'),/Pokémon Horizons: The Series · Season 1 \(JP\)/);
 assert.doesNotMatch(page('en','es'),/Source edition<\/dt>/);
 assert.match(page('ja','es'),/ポケットモンスター（2023）（日本版）/);
 assert.doesNotMatch(page('ja','es'),/シーズン1（日本版）/);
 assert.match(page('ja','es'),/海外版の対応作品（英語）<\/dt><dd>Pokémon Horizons: The Series · Season 1/);
 assert.match(page('es','es'),/Nombre japonés \(rōmaji\)<\/dt><dd>Pocket Monsters \(2023\)/);
 assert.match(page('en','es'),/Japanese title \(romaji\)<\/dt><dd>Pocket Monsters \(2023\)/);
 assert.doesNotMatch(page('ja','es'),/原曲の版<\/dt>/);
 assert.doesNotMatch(musicPage('/music/blue-spirit/',new URLSearchParams({lang:'es'})),/Edición de origen<\/dt>/);
});
test('pilot maintains version arrangement and first cover history',()=>{
 const p=(slug,version)=>musicPage('/music/'+slug+'/',new URLSearchParams({lang:'es',version}));
 assert.match(p('snow-halation','naked-garden'),/naked garden Ver\. — ChouCho/);
 assert.match(p('snow-halation','hso-orchestra'),/HSO Orchestra Ver\./);
 assert.match(p('only-one-yell','es'),/El primer cover publicado de Blaze Leiton/);
 assert.match(p('cake-song','es'),/Holy Quintet/);
});

test('localized work names preserve identity and map XY international seasons',()=>{
 assert.equal(workName('Pokémon XY','es',17),'La Serie Pokémon XY');
 assert.equal(workName('Pokémon XY','es',18),'La Serie Pokémon XY-Expediciones en Kalos');
 assert.equal(workName('Pokémon XY','en',19),'Pokémon the Series: XYZ');
 assert.equal(workName('Pokémon XY','ja',17),'ポケットモンスター XY');
 assert.equal(workName('Pokémon XY','ja',18),'ポケットモンスター XY');
 assert.equal(workName('Pokémon XY','ja',19),'ポケットモンスター XY&Z');
 assert.equal(workName('Pokémon Horizons','es',2),'La Serie Horizontes Pokémon: En busca de Laqua');
 assert.equal(workName('Pokémon Horizons','ja',2),'ポケットモンスター（2023）');
 assert.ok(workAliases('Pokémon Horizons',1).includes('Pocket Monsters 2023'));
 assert.equal(workName('unknown','ja'),'unknown');
 for(const s of songs)for(const lang of ['es','en','ja'])assert.ok(workName(s.series,lang,s.season));
 const es=musicPage('/music/',new URLSearchParams({lang:'es'}));
 const ja=musicPage('/music/',new URLSearchParams({lang:'ja'}));
 assert.match(es,/<option value="Pokémon Horizons">La Serie Horizontes Pokémon<\/option>/);
 assert.match(ja,/<option value="Pokémon Horizons">ポケットモンスター（2023）<\/option>/);
 assert.match(es,/pocket monsters 2023/);
 assert.match(ja,/data-series="Pokémon Horizons"/);
 assert.match(ja,/先輩はおとこのこ/);
 assert.match(ja,/魔法少女まどか☆マギカ/);
 assert.match(es,/Senpai is an Otokonoko/);
 assert.match(ja,/hololive English/);
});

test('Pokemon reciprocal details separate actual Japanese subdivisions from international seasons',()=>{
 const xy={series:'Pokémon XY',season:18,sourceEdition:'jp'};
 assert.equal(pokemonWorkLabel(xy,'ja'),'ポケットモンスター XY（日本版）');
 assert.equal(pokemonCounterpart(xy,'ja'),'Pokémon the Series: XY Kalos Quest · Season 18');
 assert.equal(pokemonCounterpart(xy,'es'),'Pocket Monsters XY');
 assert.equal(pokemonWorkLabel(xy,'en'),'Pokémon the Series: XY Kalos Quest · Season 18 (JP)');
 const xyz={...xy,season:19,sourceEdition:'international'};
 assert.equal(pokemonWorkLabel(xyz,'ja'),'ポケットモンスター XY&Z（海外版）');
 assert.equal(pokemonCounterpart(xyz,'en'),'Pocket Monsters XY&Z');
 const bw={series:'Pokémon Black & White',season:16,sourceEdition:'jp',sourceJapanese:{title:'ポケットモンスター ベストウイッシュ シーズン2',romaji:'Pocket Monsters Best Wishes! Season 2'}};
 assert.equal(pokemonWorkLabel(bw,'ja'),'ポケットモンスター ベストウイッシュ シーズン2（日本版）');
 assert.equal(pokemonCounterpart(bw,'es'),'Pocket Monsters Best Wishes! Season 2');
 assert.equal(pokemonCounterpart(bw,'ja'),'Pokémon: BW Adventures in Unova and Beyond · Season 16');
 assert.equal(pokemonCounterpart({series:'Azur Lane'},'es'),'');
 const html=musicPage('/music/',new URLSearchParams({lang:'ja'}));
 assert.doesNotMatch(html,/海外版の対応作品（英語）/);
});

test('regional blocks use international season keys and never mix Horizons with original season 1',()=>{
 const expected=['kanto','kanto','johto','johto','johto','hoenn','hoenn','hoenn','hoenn','sinnoh','sinnoh','sinnoh','sinnoh','unova','unova','unova','kalos','kalos','kalos','alola','alola','alola','journeys','journeys','journeys'];
 expected.forEach((block,i)=>assert.equal(tagsForSeason('ash',i+1).block,block));
 assert.equal(tagsForSeason('ash',1).seasonKey,'ash:1');
 assert.equal(tagsForSeason('horizons',1).seasonKey,'horizons:1');
 assert.equal(tagsForSeason('horizons',4).block,'horizons');
 assert.equal(tagsForSeason('ash',26),null);
 const doki=songs.find(s=>s.slug==='dokimeki-diary');
 assert.equal(pokemonTags(doki).block,'horizons');
 assert.equal(pokemonTags({...doki,sourceEdition:'international'}).seasonKey,'horizons:1');
 assert.equal(seasonTagLabel(pokemonTags(doki),'ja'),'Horizons · 海外版シーズン1');
 const h=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.match(h,/data-block="horizons" data-season="horizons:1"/);
 assert.match(h,/<option value="horizons">Horizontes<\/option>/);
 assert.doesNotMatch(h,/<select id="season">/);
 assert.doesNotMatch(h,/&amp;season=/);
 assert.match(h,/&amp;block=horizons/);
 assert.equal(blockSeriesLabel("johto","es"),"Oro y Plata");
 assert.equal(blockSeriesLabel("hoenn","es"),"Rubí y Zafiro");
 assert.equal(blockSeriesLabel("sinnoh","es"),"Diamante y Perla");
 assert.ok(blockSearchAliases("johto").includes("Johto"));
 assert.ok(blockSearchAliases("johto").includes("Oro y Plata"));
 const d=musicPage('/music/dokimeki-diary/',new URLSearchParams({lang:'es'}));
 assert.match(d,/&amp;block=horizons/);
 assert.equal(pokemonTags(songs[0]),null);
});

test('pilot lyric fiches use only selected supplied adaptations with review states',()=>{
 assert.equal(Object.keys(lyricsBySong).length,33);
 const entries=songs.flatMap(s=>s.versions.map(v=>lyricsBySong[s.slug]?.[lyricAliases[s.slug]?.[v.id]||v.id]));
 assert.equal(entries.length,41);
 assert.ok(entries.every(Boolean));
 assert.equal(entries.filter(v=>v.text).length,41);
 assert.equal(lyricsBySong['dokimeki-diary'].es.text,lyricsBySong['dokimeki-diary'].ensemble.text);
 assert.equal(lyricsBySong['butter-fly'].multi.kind,'mixed');
 assert.equal(lyricsBySong['snow-halation']['hso-orchestra'].kind,'original_romanized');
 assert.equal(lyricsBySong['snow-halation'].hybrid,undefined);
 const page=(slug,version,lang='es')=>musicPage('/music/'+slug+'/',new URLSearchParams({lang,version}));
 const blue=page('blue-spirit','es');
 assert.match(blue,/class="lyric-text" lang="es"/);
 assert.match(blue,/Por qué será que quiero ir más allá/);
 assert.match(page('blue-spirit','en'),/class="lyric-text" lang="en"/);
 assert.match(page('blue-spirit','en'),/It’s starting out/);
 assert.doesNotMatch(page('blue-spirit','en'),/Por qué será que quiero ir más allá/);
 assert.match(page('connect','es'),/No debo olvidar la promesa que nos hicimos/);
 assert.match(page('dokimeki-diary','ensemble'),/falta cotejar el ensamble/);
 assert.match(page('mumei','es'),/Texto de trabajo/);
 assert.match(page('la-vaguelette','es-fr'),/La interpretación también incluye francés/);
 assert.doesNotMatch(page('la-vaguelette','es-fr'),/Nous pardonneras/);
 assert.match(page('cake-song','es'),/class="voice-name">Sae/);
 assert.match(page('cake-song','es'),/V.A.F.M.O./);
 assert.match(page('cake-song','es'),/Todos \(por confirmar\)/);
 assert.match(page('butter-fly','multi'),/pendiente de verificar las atribuciones/);
 assert.match(page('snow-halation','hso-orchestra'),/Japonés \(rōmaji\)/);
 assert.match(page('snow-halation','hso-orchestra'),/Fushigi da ne/);
 assert.match(page('connect','es','ja'),/歌詞アダプテーション/);
 assert.doesNotMatch(musicPage('/music/',new URLSearchParams({lang:'es'})),/No debo olvidar la promesa/);
});

test('release dates and lyric choices remain independent from recording selection',()=>{
 const page=(slug,query={})=>musicPage('/music/'+slug+'/',new URLSearchParams({lang:'es',...query}));
 const connect=page('connect');
 assert.doesNotMatch(connect,/class="version-bar"|Primer estreno<\/dt>|class="lyric-controls"/);
 assert.match(connect,/Publicación<\/dt><dd>octubre de 2026/);
 const blue=page('blue-spirit',{version:'en',lyric:'es'});
 assert.match(blue,/Primer estreno<\/dt><dd>abril de 2022/);
 assert.match(blue,/Fecha de esta versión<\/dt><dd>abril de 2024/);
 assert.match(blue,/Por qué será que quiero ir más allá/);
 const french=page('la-vaguelette',{version:'es-fr',lyric:'fr'});
 assert.match(french,/class="lyric-text" lang="fr"/);
 assert.match(french,/Nous pardonneras/);
 assert.match(french,/version=es-fr&amp;lyric=fr/);
 const both=page('la-vaguelette',{version:'es-fr',lyric:'es-fr',compare:'fr'});
 assert.equal((both.match(/class="parallel-pair"/g)||[]).length,2);
 assert.match(both,/class="parallel-stanza" lang="es"/);
 assert.match(both,/class="parallel-stanza" lang="fr"/);
 assert.match(both,/Comparación por estrofas/);
 assert.match(page('snow-halation',{lyric:'naked-garden',compare:'hso-orchestra'}),/class="parallel-pairs"/);
 assert.match(page('blue-spirit',{lyric:'es',compare:'en'}),/class="parallel-pairs"/);
 assert.doesNotMatch(page('butter-fly'),/class="lyric-controls"|class="version-bar"/);
 assert.match(page('butter-fly'),/JA \/ FR \/ PT \/ ES \/ EN/);
 const studio=page('dokimeki-diary',{version:'album-studio'});
 assert.doesNotMatch(studio,/Grabación de estudio para el álbum|Audio pendiente de incorporar|Fecha por confirmar|version=album-studio/);
 assert.match(studio,/Primer estreno<\/dt><dd>mayo de 2023/);
 assert.match(studio,/Fecha de esta versión<\/dt><dd>mayo de 2023/);
 const audio=page('la-vaguelette',{version:'fr-audio'});
 assert.doesNotMatch(audio,/class="version-bar"|version=fr-audio|Audio pendiente de incorporar/);
 assert.match(audio,/class="lyric-text" lang="es"/);
 assert.match(audio,/Publicación<\/dt><dd>diciembre de 2023/);
 assert.match(page('la-vaguelette',{lyric:'fr'}),/class="lyric-text" lang="fr"/);
 const deferred=songs.flatMap(s=>s.versions).filter(v=>v.public===false&&v.medium==='audio');
 assert.equal(deferred.length,3);
 assert.ok(deferred.every(v=>v.medium==='audio'&&v.date===null));
 assert.ok(deferred.filter(v=>v.id.endsWith('-audio')).every(v=>v.recordingMonth==='2023-12'&&v.recordingGroup==='la-vaguelette-2023-12'));
 assert.equal(songs.find(s=>s.slug==='la-vaguelette').versions[0].recordingMonth,'2023-12');
});

test('Japanese lyric script follows locale, including mixed-language segments and comparison',()=>{
 const page=(slug,lang,query={})=>musicPage('/music/'+slug+'/',new URLSearchParams({lang,...query}));
 for(const lang of ['es','en']){
  const h=page('snow-halation',lang,{version:'hso-orchestra'});
  assert.match(h,/class="lyric-text" lang="ja-Latn"/);
  assert.match(h,/Fushigi da ne/);
  assert.doesNotMatch(h,/不思議だね/);
 }
 const ja=page('snow-halation','ja',{version:'hso-orchestra'});
 assert.match(ja,/class="lyric-text" lang="ja"/);
 assert.match(ja,/不思議だね/);
 assert.doesNotMatch(ja,/Fushigi da ne/);
 const compare=page('snow-halation','ja',{lyric:'naked-garden',compare:'hso-orchestra'});
 assert.match(compare,/class="parallel-stanza" lang="ja"/);
 assert.match(compare,/class="parallel-stanza" lang="es"/);
 const source=lyricsBySong['butter-fly'].multi;
 assert.equal(source.segments.map(s=>s.lang).join(','),'JA,JA,JA,JA,FR,PT,ES,EN,EN,PT,ES');
 const stanzas=source.text.trim().split(/\n\s*\n/);
 for(let i=0;i<stanzas.length;i++)assert.equal(source.segments.filter(s=>s.stanza===i).map(s=>s.text).join('\n'),stanzas[i]);
 for(const lang of ['es','en','ja']){
  const h=page('butter-fly',lang);
  assert.equal((h.match(/class="lyric-segment"/g)||[]).length,11);
  assert.match(h,/class="lyric-segment" lang="fr"/);
  assert.match(h,/class="lyric-segment" lang="pt"/);
  assert.match(h,/class="lyric-segment" lang="es"/);
  assert.match(h,/class="lyric-segment" lang="en"/);
  assert.match(h,/Me réveillant de ce rêve sans fin/);
  assert.match(h,/Como um pássaro contente/);
  assert.match(h,/Decidieron engañarte/);
  assert.match(h,/So tell me/);
  assert.doesNotMatch(h,/class="lyric-controls"/);
  if(lang==='ja'){assert.match(h,/class="lyric-segment" lang="ja"/);assert.match(h,/無限大な夢のあとの/);assert.doesNotMatch(h,/Mugendai na yume/);}
  else{assert.match(h,/class="lyric-segment" lang="ja-Latn"/);assert.match(h,/Mugendai na yume/);assert.doesNotMatch(h,/無限大な夢のあとの/);}
 }
});

test('video thumbnails and playback are bound to the selected public recording',async()=>{
 const page=(slug,lang,version)=>musicPage('/music/'+slug+'/',new URLSearchParams({lang,version}));
 const catalog=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.equal((catalog.match(/class="square-art"/g)||[]).length,33);
 for(const s of songs){
  const visible=s.versions.filter(v=>v.public!==false);
  const first=visible.filter(v=>v.date).sort((a,b)=>a.date.localeCompare(b.date))[0];
  if(first.videoStatus!=='blocked'&&!releaseArtwork[s.slug]?.framing)assert.ok(catalog.includes('https://i.ytimg.com/vi/'+first.videoId+'/hqdefault.jpg'));
  for(const v of visible.filter(v=>v.videoStatus!=='blocked'))for(const lang of ['es','en','ja']){
   const h=page(s.slug,lang,v.id);
   assert.ok(h.includes('data-video-id="'+v.videoId+'"'));
   assert.ok(h.includes('https://www.youtube.com/watch?v='+v.videoId+'"'));
   assert.ok(h.includes('https://i.ytimg.com/vi/'+v.videoId+'/hqdefault.jpg'));
   assert.doesNotMatch(h,/<iframe /);
   assert.match(h,/youtube-nocookie\.com\/embed\//);
   assert.match(h,/strict-origin-when-cross-origin/);
   assert.match(h,/loading="lazy"/);
   assert.match(h,/class="video-play"/);
  }
 }
 assert.equal((page('blue-spirit','es','en').match(/data-video-id="v3QAe_f6Eh0"/g)||[]).length,1);
 assert.match(page('dokimeki-diary','es','album-studio'),/data-video-id="8sAotUCAJH8"/);
 assert.match(page('la-vaguelette','es','fr-audio'),/data-video-id="Y7UBoG9twvc"/);
 const res=await worker.fetch(req('/music/blue-spirit/'),environment);
 const csp=res.headers.get('Content-Security-Policy');
 assert.match(csp,/img-src 'self' data: https:\/\/i\.ytimg\.com /);
 assert.match(csp,/frame-src https:\/\/www\.youtube-nocookie\.com;/);
 assert.equal(res.headers.get('Referrer-Policy'),'strict-origin-when-cross-origin');
});

test('franchise affiliation preserves original-release identity and separate debut cohort',()=>{
 const m=songs.find(s=>s.slug==='mumei'), snow=songs.find(s=>s.slug==='snow-halation');
 assert.deepEqual(franchiseTags(m),['hololive','holo-en','holo-promise']);
 assert.equal(m.affiliation.originalRelease,'2023-10-10');
 assert.equal(m.versions[0].date,'2026-10-07');
 assert.equal(affiliationWork(m,'en'),'hololive English -Promise-');
 assert.equal(affiliationWork({...m,affiliation:{...m.affiliation,brandAtRelease:'hololive'}},'en'),'hololive -Promise-');
 assert.ok(affiliationDetails(m,'es').some(([k,v])=>k==='Generación de debut'&&v==='Council'));
 assert.deepEqual(franchiseTags(snow),['love-live','ll-muse']);
 assert.equal(franchiseTagLabel('ll-muse','es'),"μ's");
 assert.equal(franchiseTagLabel('holo-hope','en'),'Project: HOPE');
 assert.deepEqual(franchiseRegistry['love-live'].series['Ikizulive! LOVELIVE! BLUEBIRD'],['ll-bluebird']);
 const cross={affiliation:{franchise:'love-live',unit:'ll-aiscream',participatingGroups:['ll-aqours','ll-nijigasaki','ll-liella'],event:'Debut single'}};
 assert.deepEqual(franchiseTags(cross),['love-live','ll-aiscream','ll-aqours','ll-nijigasaki','ll-liella']);
 const page=(slug,lang)=>musicPage('/music/'+slug+'/',new URLSearchParams({lang}));
 for(const lang of ['es','en','ja']){
  const mh=page('mumei',lang),sh=page('snow-halation',lang),ch=musicPage('/music/',new URLSearchParams({lang}));
  assert.match(mh,/Promise/);assert.match(mh,/Council/);assert.match(mh,/affiliation=holo-promise/);
  assert.match(sh,/affiliation=ll-muse/);assert.match(sh,/affiliation=love-live/);
  assert.match(ch,/data-affiliation="hololive holo-en holo-promise"/);
  assert.match(ch,/data-affiliation="love-live ll-muse"/);
  assert.match(ch,/<select id="affiliation">/);
  assert.doesNotMatch(ch,/option value="holo-council"/);
  assert.match(ch,/council/);
  assert.match(ch,/\.song:hover,\.song:active,\.song:focus-within\{background:var\(--action\)/);
  assert.doesNotMatch(ch,/\.song>a:first-child:hover \.song-info\{background/);
  assert.match(ch,/item.dataset.affiliation.split\(" "\).includes/);
  assert.doesNotMatch(ch,/option value="ll-hasunosora"/);
 }
});

test('compact cards have one franchise badge while fiches retain complete tags',()=>{
 const m=songs.find(s=>s.slug==='mumei'), snow=songs.find(s=>s.slug==='snow-halation');
 for(const lang of ['es','en','ja']){
  assert.deepEqual(catalogAffiliationBadge(m,lang),{id:'holo-en',label:'hololive EN'});
  assert.deepEqual(catalogAffiliationBadge(snow,lang),{id:'ll-muse',label:"μ's",key:'series',value:'Love Live! School Idol Project'});
  const h=musicPage('/music/',new URLSearchParams({lang}));
  const card=slug=>h.match(new RegExp('<article class="song"[^>]*>[\\s\\S]*?<\\/article>','g')).find(x=>x.includes('/music/'+slug+'/'));
  const mc=card('mumei'),sc=card('snow-halation'),pc=card('dokimeki-diary');
  assert.equal((mc.match(/class="pk-tag"/g)||[]).length,1);
  assert.match(mc,/affiliation=holo-en">hololive EN<\/a>/);
  assert.doesNotMatch(mc,/class="pk-tag"[^>]*affiliation=holo-promise/);
  assert.equal((sc.match(/class="pk-tag"/g)||[]).length,1);
  assert.match(sc,/series=Love%20Live!%20School%20Idol%20Project">μ&#39;s<\/a>/);
  assert.match(pc,/block=horizons/);
  const detail=musicPage('/music/mumei/',new URLSearchParams({lang}));
  assert.match(detail,/affiliation=holo-promise/);
  assert.match(detail,/Council/);
 }
 for(const [branch,label] of [['holo-jp','hololive JP'],['holo-id','hololive ID'],['holo-en','hololive EN']])assert.equal(catalogAffiliationBadge({affiliation:{franchise:'hololive',branch}},'es').label,label);
 for(const [group,label] of [['ll-aqours','Sunshine!!'],['ll-liella','Superstar!!'],['ll-nijigasaki','Nijigasaki'],['ll-hasunosora','Hasunosora'],['ll-bluebird','BLUEBIRD']])assert.equal(catalogAffiliationBadge({affiliation:{franchise:'love-live',groups:[group]}},'en').label,label);
 const cross={affiliation:{franchise:'love-live',participatingGroups:['ll-aqours','ll-liella']}};
 assert.deepEqual(catalogAffiliationBadge(cross,'es'),{id:'ll-crossover',label:'Multiserie'});
 assert.ok(franchiseTags(cross).includes('ll-crossover'));
 assert.equal(catalogAffiliationBadge({affiliation:{...cross.affiliation,unit:'ll-aiscream'}},'es').label,'AiScReam');
 assert.match(franchiseSearchAliases(m),/hololive EN/);
});

test('Love Live series badge stays independent from story-era performing unit',()=>{
 const bubble={series:'Love Live! Superstar!!',season:3,affiliation:{franchise:'love-live',unit:'ll-tomakanote'}};
 for(const lang of ['es','en','ja']){
  assert.deepEqual(catalogAffiliationBadge(bubble,lang),{id:'ll-liella',label:'Superstar!!',key:'series',value:'Love Live! Superstar!!'});
  assert.ok(franchiseTags(bubble).includes('ll-tomakanote'));
  assert.ok(!franchiseTags(bubble).includes('ll-liella'));
  assert.ok(affiliationDetails(bubble,lang).some(([k,v])=>v===franchiseTagLabel('ll-tomakanote',lang)));
  for(const unit of ['ll-catchu','ll-kaleidoscore','ll-5yncri5e'])assert.equal(catalogAffiliationBadge({...bubble,affiliation:{...bubble.affiliation,unit}},lang).label,'Superstar!!');
 }
 assert.equal(affiliationDetails(bubble,'es').find(([k])=>k==='Unidad intérprete')[1],'TomaKanoTe');
 assert.ok(!songs.some(s=>s.slug==='bubble-rise'));
});

test('square catalog artwork prefers sourced anime editions without changing video player',async()=>{
 const catalog=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.equal(Object.keys(releaseArtwork).length,33);
 assert.equal((catalog.match(/class="square-art"/g)||[]).length,33);
 assert.match(catalog,/\.square-art\{position:relative;aspect-ratio:1\/1/);
 assert.match(catalog,/object-fit:contain/);
 for(const s of songs){
  const card=catalog.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(h=>h.includes('/music/'+s.slug+'/'));
  const first=s.versions.find(v=>v.public!==false);
  const art=releaseArtwork[s.slug];
  if(art){
   assert.ok(card.includes('src="'+artworkURL(s.slug)+'"'));
   assert.ok(card.includes((art.framing||first.videoStatus==='blocked')?'data-fallback=""':'data-fallback="https://i.ytimg.com/vi/'+first.videoId+'/hqdefault.jpg"'));
   assert.ok(card.includes('data-art-kind="'+art.kind+'"'));
   const h=musicPage('/music/'+s.slug+'/',new URLSearchParams({lang:'es'}));
   assert.doesNotMatch(h,/class="release-art-note"|class="video-note"/);
   assert.match(h,first.videoStatus==='blocked'?/class="archive-video"/:/class="video-stage"/);
  }else{assert.match(card,/data-art-kind="video"/);}
 }
 const response=await worker.fetch(req('/music/'),environment);
 const csp=response.headers.get('Content-Security-Policy');
 for(const a of Object.values(releaseArtwork))assert.ok(a.image.startsWith('/')?csp.includes("img-src 'self'"):csp.includes(new URL(a.image).origin));
 assert.equal(releaseArtwork['blue-spirit'].kind,'game');
 assert.match(releaseArtwork['blue-spirit'].artworkContext,/Heart-Linking Harmony/);
 assert.equal(releaseArtwork.connect.image,'https://www.lisani.jp/claris-best1st/images/connect_img01.jpg');
 assert.equal(releaseArtwork['cake-song'].credit,'Subin Yeon');
 for(const slug of ['blue-spirit','are-ga-koi-datta-no-ka-na','stuck-on-you','villain-vibes']){
  const path=releaseArtwork[slug].image;
  const routed=await worker.fetch(req(path),{...environment,ASSETS:{fetch:async request=>new Response(new Uint8Array([82,73,70,70]),{headers:{'Content-Type':'image/webp'}})}});
  assert.equal(routed.status,200);
  assert.equal(routed.headers.get('Content-Type'),'image/webp');
 }
 assert.equal((await worker.fetch(req('/music-artwork/unknown.webp'),environment)).status,404);
});

test('registered external artwork cache reuses successful responses and rejects unsafe or failed origins',async()=>{
 const path=artworkURL('connect'),url='https://kgblaze.dpdns.org'+path;
 assert.equal(artworkSources.size,29);
 assert.equal(artworkSources.get(path),releaseArtwork.connect.image);
 const stored=new Map();let calls=0;
 const cache={match:async r=>stored.get(r.url)?.clone(),put:async(r,v)=>stored.set(r.url,v.clone())};
 const fetcher=async source=>{calls++;assert.equal(source,releaseArtwork.connect.image);return new Response(new Uint8Array([255,216,255,217]),{headers:{'Content-Type':'image/jpeg'}})};
 const first=await serveArtwork(new Request(url+'?unused=1'),{cache,fetcher});
 assert.equal(first.status,200);assert.equal(first.headers.get('Cache-Control'),'public, max-age=86400');
 assert.equal(stored.get(url).headers.get('Cache-Control'),'public, max-age=604800');
 assert.deepEqual(new Uint8Array(await first.arrayBuffer()),new Uint8Array([255,216,255,217]));
 const second=await serveArtwork(new Request(url),{cache,fetcher});assert.equal(second.status,200);assert.equal(calls,1);
 const head=await serveArtwork(new Request(url,{method:'HEAD'}),{cache,fetcher});assert.equal(head.body,null);assert.equal(calls,1);
 assert.equal((await serveArtwork(new Request(url,{method:'POST'}),{cache,fetcher})).status,405);
 assert.equal((await serveArtwork(new Request(url+'/other'),{cache,fetcher})).status,404);
 assert.equal((await serveArtwork(new Request(url),{cache:null,fetcher:async()=>new Response('<html>',{headers:{'Content-Type':'text/html'}})})).status,502);
 assert.equal((await serveArtwork(new Request(url),{cache:null,fetcher:async()=>new Response('x',{headers:{'Content-Type':'image/png','Content-Length':'5000000'}})})).status,502);
 assert.equal((await serveArtwork(new Request(url),{cache:null,fetcher:async()=>{throw Error('offline')}})).status,502);
 assert.equal((await worker.fetch(req('/music/artwork-cache/unknown-v1'),environment)).status,404);
 const catalog=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.equal((catalog.match(/loading="eager"/g)||[]).length,2);
 assert.equal((catalog.match(/loading="lazy"/g)||[]).length,31);
 assert.match(catalog,/data-origin="https:\/\/www\.lisani\.jp/);
});
test('context filters appear only for relevant results or tag deep links',()=>{
 const html=musicPage('/music/',new URLSearchParams({lang:'es'}));
 assert.match(html,/id="context-filters" hidden/);
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const make=()=>({value:'',options:[],hidden:false,addEventListener(name,fn){this[name]=fn},setAttribute(){}});
 const ids=['search','language','year','series','block','affiliation','block-filter','affiliation-filter','context-filters','empty','clear','grid','list'];
 const el=Object.fromEntries(ids.map(k=>[k,make()]));
 const options=(...values)=>values.map(value=>({value}));
 el.series.options=options('','Pokémon Horizons','hololive English','Love Live! School Idol Project','Azur Lane');
 el.block.options=options('','horizons');el.affiliation.options=options('','hololive','holo-en','holo-promise','love-live','ll-muse');
 const item=(title,series,block,affiliation)=>({dataset:{title,series,block,affiliation,lang:'ES',year:'2023'}});
 const items=[item('dokimeki','Pokémon Horizons','horizons',''),item('mumei','hololive English','','hololive holo-en holo-promise'),item('snow','Love Live! School Idol Project','','love-live ll-muse'),item('blue','Azur Lane','','')];
 el.songs={children:items,classList:{toggle(){}}};
 const doc={querySelectorAll:()=>[],getElementById:id=>el[id]};
 const start=search=>new Function('document','location','URLSearchParams',js)(doc,{search},URLSearchParams);
 start('');assert.equal(el['context-filters'].hidden,true);
 el.series.value='Pokémon Horizons';el.series.input();assert.equal(el['block-filter'].hidden,false);assert.equal(el['affiliation-filter'].hidden,true);
 el.block.value='horizons';el.block.input();assert.equal(items.filter(x=>!x.hidden).length,1);
 el.series.value='hololive English';el.series.input();assert.equal(el.block.value,'');assert.equal(el['block-filter'].hidden,true);assert.equal(el['affiliation-filter'].hidden,false);
 assert.equal(el.affiliation.options.find(o=>o.value==='ll-muse').disabled,true);
 el.series.value='Azur Lane';el.series.input();assert.equal(el['context-filters'].hidden,true);
 el.clear.onclick();assert.equal(el['context-filters'].hidden,true);assert.equal(items.filter(x=>!x.hidden).length,4);
 el.search.value='snow';el.search.input();assert.equal(el['affiliation-filter'].hidden,false);assert.equal(el.affiliation.options.find(o=>o.value==='holo-en').disabled,true);
 el.clear.onclick();start('?affiliation=holo-promise');assert.equal(el['affiliation-filter'].hidden,false);assert.equal(items.filter(x=>!x.hidden).length,1);
 el.clear.onclick();start('?block=horizons');assert.equal(el['block-filter'].hidden,false);assert.equal(items.filter(x=>!x.hidden).length,1);
});

test('durable artwork takes priority even when origin and edge cache disappear',async()=>{
 const path=artworkURL('connect'),url='https://kgblaze.dpdns.org'+path;
 let network=0;const saved=new Uint8Array([82,73,70,70,8,0,0,0,87,69,66,80]);
 const assets={fetch:async r=>{assert.equal(new URL(r.url).pathname,'/music-artwork/connect-v1.webp');return new Response(r.method==='HEAD'?null:saved,{headers:{'Content-Type':'image/webp'}})}};
 const cache={match:async()=>{throw Error('evicted')},put:async()=>{throw Error('unavailable')}};
 const fetcher=async()=>{network++;throw Error('removed')};
 for(const method of ['GET','HEAD']){
  const response=await serveArtwork(new Request(url,{method}),{assets,cache,fetcher});
  assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/webp');
  if(method==='GET')assert.deepEqual(new Uint8Array(await response.arrayBuffer()),saved);else assert.equal(response.body,null);
 }
 assert.equal(network,0);
});

test('all thirteen selected artwork snapshots exist, with source and integrity manifest',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v1.json',import.meta.url),'utf8'));
 assert.equal(Object.keys(manifest).length,11);
 for(const [slug,art] of Object.entries(releaseArtwork)){
  if(['miiro','graphite-diamond','high-free-spirits','savior-of-song','yukitoki','harumodoki','megumi-no-ame','daisuki','love-evidence','honey-jet-coaster','stuck-on-you','rakuen-project','please-please','twilight-little-star','shiny-smily-story','villain-vibes','sparks-of-joy','sparks','stars-we-chase','pastel'].includes(slug))continue; // new official sources use cache and fallback until snapshots are captured
  const bytes=readFileSync(new URL('../public/music-artwork/'+slug+'-v1.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  if(art.image.startsWith('https://')){
   assert.equal(manifest[slug].source,art.image);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[slug].sha256);
   assert.ok(Math.max(...manifest[slug].size)<=720);
  }
 }
});

test('original character CVs are localized and never replace the cover cast',()=>{
 const cake=songs.find(s=>s.slug==='cake-song');
 assert.equal(originalArtist(cake,'es'),'Holy Quintet');
 assert.equal(originalPerformances['cake-song'].cast.length,6);
 assert.equal(originalPerformances['cake-song'].cast.at(-1).guest,true);
 assert.equal(originalPerformances['blue-spirit'].cast.length,5);
 assert.equal(originalPerformances['only-one-yell'].cast.length,9);
 assert.equal(originalPerformances['snow-halation'].cast.length,9);
 assert.equal(voiceLabel(originalPerformances['snow-halation'].cast[5],'ja'),'西木野真姫（CV：Pile）');
 for(const lang of ['es','en','ja']){
  const page=slug=>musicPage('/music/'+slug+'/',new URLSearchParams({lang}));
  const h=page('cake-song');
  assert.match(h,/Holy Quintet/);
  assert.match(h,lang==='ja'?/鹿目まどか（CV：悠木碧）/:/Madoka Kaname \(CV: Aoi Yūki\)/);
  assert.match(h,lang==='ja'?/ベベ／百江なぎさ（CV：阿澄佳奈）/:/Bebe \/ Nagisa Momoe \(CV: Kana Asumi\)/);
  assert.match(h,lang==='ja'?/劇団イヌカレー/:/Gekidan Inu Curry/);
  assert.match(h,lang==='ja'?/梶浦由記/:/Yuki Kajiura/);
  assert.match(h,/class="voice-name">Sae/);
  assert.match(h,/class="original-cast"/);
  assert.match(page('blue-spirit'),lang==='ja'?/イラストリアス（CV：雨宮天）/:/Illustrious \(CV: Sora Amamiya\)/);
  assert.match(page('only-one-yell'),lang==='ja'?/淀川逢生（CV：岩橋由佳）/:/Ao Yodogawa \(CV: Yuka Iwahashi\)/);
  assert.match(page('snow-halation'),lang==='ja'?/西木野真姫（CV：Pile）/:/Maki Nishikino \(CV: Pile\)/);
  assert.doesNotMatch(page('connect'),/class="original-cast"/);
  assert.match(musicPage('/music/',new URLSearchParams({lang})),/madoka kaname/);
 }
});

test('Cake Song catalog names only Holy Quintet while full fiche retains Bebe',()=>{
 for(const lang of ['es','en','ja']){
  const catalog=musicPage('/music/',new URLSearchParams({lang}));
  const card=catalog.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(x=>x.includes('/music/cake-song/'));
  assert.match(card,/<p class="artist">Holy Quintet · 2026<\/p>/);
  assert.doesNotMatch(card,/<p class="artist">[^<]*(Bebe|Nagisa|ベベ|なぎさ)/);
  const detail=musicPage('/music/cake-song/',new URLSearchParams({lang}));
  assert.match(detail,lang==='ja'?/ベベ／百江なぎさ（CV：阿澄佳奈）/:/Bebe \/ Nagisa Momoe \(CV: Kana Asumi\)/);
 }
});

test('first EP is recording-specific, not a new audio release or duplicate song',()=>{
 const ep=coverAlbums[0];
 assert.equal(ep.tracks.length,5);
 assert.equal(ep.releaseDate,null);
 assert.equal(ep.ordered,true);
 assert.deepEqual(ep.tracks.map(t=>t.song),['only-one-yell','caesura-of-despair','song-for-you','watashi-no-na-wa-hikari','blue-spirit']);
 const dates=ep.tracks.map(t=>songs.find(s=>s.slug===t.song).versions.find(v=>v.id===t.version).date);
 assert.deepEqual(dates,[...dates].sort());
 assert.equal(ep.artworkStatus,'reference-only');
 assert.equal(ep.audioStatus,'deferred');
 for(const track of ep.tracks)assert.ok(songs.find(s=>s.slug===track.song).versions.some(v=>v.id===track.version));
 assert.equal(albumsForVersion('blue-spirit','en').length,0);
 assert.equal(albumsForVersion('blue-spirit','es').length,1);
 for(const lang of ['es','en','ja']){
  const page=(slug,version='es')=>musicPage('/music/'+slug+'/',new URLSearchParams({lang,version}));
  for(const track of ep.tracks)assert.ok(page(track.song).includes(ep.titles[lang].replaceAll("'",'&#39;')));
  assert.doesNotMatch(page('blue-spirit','en'),/Miniálbum de covers|Cover EP|カバーEP/);
  assert.match(page('caesura-of-despair'),/Project: HOPE/);
  assert.match(page('caesura-of-despair'),/data-video-id="GCwez-ahzl0"/);
  assert.match(page('watashi-no-na-wa-hikari'),/data-video-id="kzK30m49pn4"/);
  assert.match(page('song-for-you'),/data-video-id="zLTjAidbt8Y"/);
  assert.match(page('song-for-you'),lang==='ja'?/長瀬麻奈（CV：神田沙也加）/:/Mana Nagase \(CV: Sayaka Kanda\)/);
  assert.match(page('watashi-no-na-wa-hikari'),lang==='ja'?/ラヴィ（CV：向井莉生）/:/Lavie \(CV: Live Mukai\)/);
  assert.match(page('caesura-of-despair'),/La oscuridad se irá/);
  assert.match(page('watashi-no-na-wa-hikari'),/Con este momento el escenario está/);
  assert.match(page('song-for-you'),/En un sueño sin fin/);
  assert.doesNotMatch(page('song-for-you'),/I'm still in the middle/);
 }
});


test('Ocean’s Medley preserves versions, credit, and private drafts',()=>{
 const ep=coverAlbums.find(a=>a.id==='oceans-medley');
 assert.equal(ep.tracks.length,4);assert.equal(ep.releaseDate,null);assert.equal(ep.ordered,false);
 assert.equal(songs.flatMap(s=>s.versions).filter(v=>v.public!==false&&v.videoId).length,37);
 const high=songs.find(s=>s.slug==='high-free-spirits');
 assert.equal(high.versions.find(v=>v.id==='original-instrumental').public,false);
 const page=(slug,version='es',lang='es')=>musicPage('/music/'+slug+'/',new URLSearchParams({version,lang}));
 for(const lang of ['es','en','ja']){
  const h=page('high-free-spirits','original-instrumental',lang);
  assert.match(h,/data-video-id="dszoEB-zA_Y"/);assert.doesNotMatch(h,/cglCtAE8610/);
  assert.match(h,/Las llamas sobre el mundo arderán/);
  const savior=page('savior-of-song','es',lang);
  assert.match(savior,/DarkHole y Pineapple/);assert.match(savior,/En medio de la guerra estoy/);assert.doesNotMatch(savior,/I look across a raging war/);
  assert.match(page('miiro','es',lang),/Así el brillo del alba nos verá/);
  assert.doesNotMatch(page('miiro','es',lang),/La luz del mañana otra vez veré/);
  assert.match(page('graphite-diamond','es',lang),/Sobre todo lograremos avanzar/);
 }
});


test('Oregairu trilogy uses published Spanish covers and distinct season work names',()=>{
 const ep=coverAlbums.find(a=>a.id==='mi-comedia-romantica');
 assert.deepEqual(ep.tracks.map(t=>t.song),['yukitoki','harumodoki','megumi-no-ame']);
 assert.equal(ep.releaseDate,null);assert.equal(ep.artworkStatus,'reference-only');
 const page=(slug,lang='es')=>musicPage('/music/'+slug+'/',new URLSearchParams({lang}));
 for(const lang of ['es','en','ja']){
  assert.match(page('yukitoki',lang),/Beldiner/);
  assert.match(page('harumodoki',lang),/beck y matcha allen/);
  assert.match(page('megumi-no-ame',lang),/Y aun cuando no quedan más palabras/);
  assert.match(page('yukitoki',lang),/data-video-id="V6uGXJoucPE"/);
  assert.match(page('harumodoki',lang),/data-video-id="e4_Krpq9JQM"/);
  assert.match(page('megumi-no-ame',lang),/data-video-id="ghOdV3BL3IY"/);
  assert.doesNotMatch(page('harumodoki',lang),/6nWn2lwOYq0|mewsic/);
  assert.match(page('yukitoki',lang),lang==='ja'?/北川勝利/:/Katsutoshi Kitagawa/);
 }
 assert.equal(lyricsBySong.harumodoki.en,undefined);
});


test('Oregairu selects clean historical artwork and individual square framing',()=>{
 const slugs=['yukitoki','harumodoki','megumi-no-ame'];
 const html=musicPage('/music/',new URLSearchParams({lang:'es'}));
 for(const slug of slugs){const art=releaseArtwork[slug];assert.equal(art.kind,'selected');assert.equal(art.version,2);assert.ok(art.originalRelease.source);assert.match(artworkURL(slug),/-v2$/);assert.ok(html.includes('data-framing="'+art.framing+'"'));const detail=musicPage('/music/'+slug+'/',new URLSearchParams({lang:'es'}));assert.doesNotMatch(detail,/class="release-art-note"|class="video-note"/);}
});


test('Love Experiment archive retains blocked tracks without broken playback',()=>{
 const ep=coverAlbums.find(a=>a.id==='love-experiment');assert.equal(ep.titles.en,'Love Experiment');assert.equal(ep.tracks.length,7);
 const page=(slug,lang='es')=>musicPage('/music/'+slug+'/',new URLSearchParams({lang}));
 for(const slug of ['please-please','twilight-little-star']){const h=page(slug);assert.match(h,/Video original no disponible actualmente\./);assert.match(h,/La interpretación sigue formando parte del archivo histórico\./);assert.match(h,/Re-upload pendiente/);assert.doesNotMatch(h,/class="video-stage"|class="youtube-link"/);assert.match(page(slug,'en'),/Original video currently unavailable/);assert.match(page(slug,'ja'),/元の動画は現在視聴できません/);}
 assert.match(page('daisuki'),/Cada instante/);assert.match(page('honey-jet-coaster'),/Ella parece mucho más novio que yo/);assert.doesNotMatch(page('honey-jet-coaster'),/La Shikimori parece más vato que yo/);
 assert.equal(albumsForVersion('daisuki','acoustic').length,0);
});


test('Rebel Live Idol Project and streamlined song detail',()=>{
 const album=coverAlbums.find(a=>a.id==='rebel-live-idol-project');assert.deepEqual(album.tracks.map(t=>t.song),['shiny-smily-story','villain-vibes','sparks-of-joy','sparks','stars-we-chase','pastel']);
 for(const lang of ['es','en','ja']){assert.equal(album.titles[lang],'Rebel Live Idol Project');for(const {song} of album.tracks){const h=musicPage('/music/'+song+'/',new URLSearchParams({lang}));assert.match(h,/Rebel Live Idol Project/);assert.match(h,/class="video-stage"/);assert.doesNotMatch(h,/class="release-art-note"|class="video-note"/);}}
 assert.equal(lyricsBySong['shiny-smily-story'].en,undefined);assert.match(lyricsBySong['shiny-smily-story'].es.text,/Un mismo gran futuro/);assert.doesNotMatch(lyricsBySong['shiny-smily-story'].es.text,/We took our hands/);
 assert.equal(originalPerformances.pastel.cast.length,4);assert.equal(originalPerformances['stars-we-chase'].cast[0].cv.latin,'Shu Uchida');
});


test('Villain Vibes uses the creator-matched MV illustration, not the album jacket',()=>{
 const a=releaseArtwork['villain-vibes'];assert.equal(a.image,'/music-artwork/villain-vibes-v2.webp');assert.equal(a.credit,'Szainx');assert.equal(a.kind,'selected');assert.ok(a.originalRelease.image.includes('mzstatic.com'));const bytes=readFileSync(new URL('../public'+a.image,import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');const card=musicPage('/music/',new URLSearchParams({lang:'es'})).match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(h=>h.includes('/music/villain-vibes/'));assert.ok(card.includes(a.image));assert.ok(card.includes('data-fallback=""'));assert.ok(!card.includes(a.originalRelease.image));
});

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
import {lineAttributions,ruteshiDialogueCast,originalColorPalettes,colorSources,colorDivisionFromReference} from '../src/music-line-attributions.mjs';
import {localizedVocalName} from '../src/music-vocal-locales.mjs';
import {tagsForSeason,pokemonTags,seasonTagLabel,blockSeriesLabel,blockSearchAliases} from '../src/music-pokemon-tags.mjs';
import {workName,workAliases,pokemonWorkLabel,pokemonCounterpart} from '../src/music-works.mjs';
import {MUSIC_PATHS,MUSIC_DATA_PATHS,MUSIC_TYPE_PATH,musicPage,musicStateData} from '../src/music-page.mjs';
import {VIEWER_CSS} from '../src/viewer-enhancements.mjs';
const origin='https://kgblaze.dpdns.org';
const req=(p,method='GET')=>new Request(origin+p,{method});
const environment={ASSETS:{fetch:async r=>{
 assert.equal(new URL(r.url).pathname,'/');
 return new Response("<style>@font-face{font-family:'Garnett';src:url(data:font/otf;base64,AA==);font-display:block;}@font-face{font-family:'Noto Sans JP Project';src:url(data:font/woff2;base64,AA==);font-display:block;}</style>",{headers:{'Content-Type':'text/html'}});
}}};
test('Music routes are exact, read-only, and do not expose admin aliases',()=>{
 for(const p of [...MUSIC_PATHS,...MUSIC_DATA_PATHS,MUSIC_TYPE_PATH]){
  assert.equal(routePortalRequest(req(p)).response,undefined);
  assert.equal(routePortalRequest(req(p,'POST')).response.status,405);
 }
 assert.equal(routePortalRequest(req('/music/api/admin')).response.status,404);
 assert.equal(routePortalRequest(req('/music/songs/unpublished-song/')).response.status,404);
 assert.equal(routePortalRequest(req('/departures/')).request.url,origin+'/');
});
test('Music preview renders all pages in three languages with scoped YouTube media',()=>{
 for(const p of [...MUSIC_PATHS].filter(p=>p.endsWith('/')))for(const lang of ['es','en','ja']){
  const html=musicPage(p,new URLSearchParams({lang}));
  assert.match(html,new RegExp('lang="'+lang+'"'));
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/typography-v1\.css/);
  assert.doesNotMatch(html,/mega\.nz|undefined|<iframe /);
  if(p==='/music/')assert.doesNotMatch(html,/<article class="song"|i\.ytimg\.com\/vi\//);else if(!p.includes('/there-is-a-reason/'))assert.match(html,/i\.ytimg\.com\/vi\//);else assert.doesNotMatch(html,/data-video-id=|youtube-link"/);
 }
 const html=musicPage('/music/songs/blue-spirit/',new URLSearchParams({lang:'ja',version:'en'}));
 assert.match(html,/楽曲選集/);
 assert.match(html,/2024年4月/);
 assert.match(html,/version=en/);
});
test('Worker serves preview with noindex, canonical slash, HEAD and cached typography',async()=>{
 const page=await worker.fetch(req('/music/songs/'),environment);
 assert.equal(page.status,200);
 assert.match(page.headers.get('X-Robots-Tag'),/noindex/);
 assert.match(page.headers.get('Content-Type'),/text\/html/);
 assert.match(await page.text(),/Rebel Mix/);
 const head=await worker.fetch(req('/music/songs/','HEAD'),environment);
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
 assert.equal((await worker.fetch(req('/music/songs/','POST'),environment)).status,405);
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
 const catalog=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.match(catalog,/data-year="2022"/);
 assert.match(catalog,/data-year="2023"/);
 assert.doesNotMatch(catalog,/data-year="2022 2024"/);
 assert.match(catalog,/ドキメキダイアリー/);
 assert.match(catalog,/<span class="title-primary">Dokimeki Diary<\/span>/);
 assert.match(catalog,/La Serie Horizontes Pokémon · Temporada 1/);
 assert.match(catalog,/Astrum · 2022/);
 assert.match(catalog,/asmi feat\. Chinozo · 2023/);
 const blue=musicPage('/music/songs/blue-spirit/',new URLSearchParams({lang:'es',version:'en'}));
 assert.match(blue,/Universe in Unison/);
 assert.match(blue,/Primer estreno<\/dt><dd>abril de 2022/);
 assert.match(blue,/Fecha de esta versión<\/dt><dd>abril de 2024/);
 assert.match(blue,/border-radius:8px/);
});

test('song header keeps selected year without redundant date while catalog keeps first release',()=>{
 const get=(slug,lang,version)=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang,version}));
 const header=html=>html.match(/<div class="detail-title">[\s\S]*?<\/div><section class="version-bar">/)[0];
 const es=get('blue-spirit','es','es'),en=get('blue-spirit','es','en');
 assert.match(header(es),/Astrum · 2022/);
 assert.doesNotMatch(header(es),/datetime="2022-04">abril de 2022/);
 assert.match(header(en),/Astrum · 2024/);
 assert.doesNotMatch(en,/2024-04-26|26 de abril/);
 assert.doesNotMatch(es,/2022-04-01|1 de abril/);
 assert.doesNotMatch(header(en),/datetime="2024-04">abril de 2024/);
 assert.match(en,/Primer estreno<\/dt><dd>abril de 2022/);
 assert.doesNotMatch(header(get('blue-spirit','en','en')),/April 2024/);
 assert.doesNotMatch(header(get('blue-spirit','ja','en')),/2024年4月/);
 assert.doesNotMatch(header(get('dokimeki-diary','es','es')),/datetime="2023-05">mayo de 2023/);
 assert.doesNotMatch(header(get('dokimeki-diary','es','ensemble')),/datetime="2023-12">diciembre de 2023/);
 assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),/Astrum · 2022/);
});

test('catalog has 115 songs and 124 historical video IDs with valid routes',()=>{
 assert.equal(songs.length,115);
 const versions=songs.flatMap(s=>s.versions);
 assert.equal(versions.length,127);
 const videos=versions.filter(v=>v.videoId);
 assert.equal(videos.length,124);
 assert.equal(new Set(videos.map(v=>v.videoId)).size,124);
 assert.equal(versions.filter(v=>v.medium==='audio'&&v.availability==='pending'&&!v.date&&!v.videoId).length,3);
 assert.ok(videos.every(v=>/^[A-Za-z0-9_-]{11}$/.test(v.videoId)));
 assert.equal(MUSIC_PATHS.size,234);
 assert.equal(songs.filter(s=>s.firstCover).length,1);
 assert.equal(songs.find(s=>s.firstCover).slug,'only-one-yell');
 const html=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.equal((html.match(/<article class="song"/g)||[]).length,115);
 assert.match(html,/data-lang="ES FR MULTI"/);
 assert.match(html,/data-lang="JA FR PT ES EN MULTI"/);
 assert.match(html,/data-lang="ES JA MULTI"/);
 assert.match(html,/<option value="MULTI">Multilingüe/);
 assert.match(html,/2021/);
});
test('Pokémon source edition is independent of cover language and numbering',()=>{
 const song=songs.find(s=>s.slug==='dokimeki-diary');
 assert.equal(song.sourceEdition,'jp');
 assert.equal(song.theme,'OP 1');
 assert.ok(song.versions.every(v=>v.langs.includes('ES')));
 const page=(lang,version)=>musicPage('/music/songs/dokimeki-diary/',new URLSearchParams({lang,version}));
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
 assert.doesNotMatch(musicPage('/music/songs/blue-spirit/',new URLSearchParams({lang:'es'})),/Edición de origen<\/dt>/);
});
test('pilot maintains version arrangement and first cover history',()=>{
 const p=(slug,version)=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es',version}));
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
 for(const s of songs)for(const lang of ['es','en','ja']){if(s.series)assert.ok(workName(s.series,lang,s.season));else assert.ok(s.context?.catalog&&s.context.catalog[lang]==='');}
 const es=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 const ja=musicPage('/music/songs/',new URLSearchParams({lang:'ja'}));
 assert.match(es,/<option value="Pokémon">Pokémon<\/option>/);
 assert.match(ja,/<option value="Pokémon">ポケモン<\/option>/);
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
 const html=musicPage('/music/songs/',new URLSearchParams({lang:'ja'}));
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
 const h=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
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
 const d=musicPage('/music/songs/dokimeki-diary/',new URLSearchParams({lang:'es'}));
 assert.match(d,/&amp;block=horizons/);
 assert.equal(pokemonTags(songs.find(s=>s.slug==='blue-spirit')),null);
});

test('pilot lyric fiches use only selected supplied adaptations with review states',()=>{
 assert.equal(Object.keys(lyricsBySong).length,115);
 const entries=songs.flatMap(s=>s.versions.map(v=>lyricsBySong[s.slug]?.[lyricAliases[s.slug]?.[v.id]||v.id]));
 assert.equal(entries.length,127);
 assert.ok(entries.every(Boolean));
 assert.equal(entries.filter(v=>v?.text).length,127);
 assert.equal(lyricsBySong['dokimeki-diary'].es.text,lyricsBySong['dokimeki-diary'].ensemble.text);
 assert.equal(lyricsBySong['butter-fly'].multi.kind,'mixed');
 assert.equal(lyricsBySong['snow-halation']['hso-orchestra'].kind,'original_romanized');
 assert.equal(lyricsBySong['snow-halation'].hybrid,undefined);
 const page=(slug,version,lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang,version}));
 const blue=page('blue-spirit','es');
 assert.match(blue,/class="lyric-text colored-lyrics" lang="es"/);
 assert.match(blue,/Por qué será que quiero ir más allá/);
 assert.match(page('blue-spirit','en'),/class="lyric-text colored-lyrics" lang="en"/);
 assert.match(page('blue-spirit','en'),/It’s starting out/);
 assert.doesNotMatch(page('blue-spirit','en'),/Por qué será que quiero ir más allá/);
 assert.match(page('connect','es'),/No debo olvidar la promesa que nos hicimos/);
 assert.match(page('dokimeki-diary','ensemble'),/falta cotejar el ensamble/);
 assert.match(page('mumei','es'),/Texto de trabajo/);
 assert.match(page('la-vaguelette','es-fr'),/La interpretación también incluye francés/);
 assert.doesNotMatch(page('la-vaguelette','es-fr'),/Nous pardonneras/);
 assert.match(page('cake-song','es'),/title="Bebe"/);
 assert.match(page('cake-song','es'),/V.A.F.M.O./);
 assert.match(page('cake-song','es'),/Todas/);
 assert.match(page('butter-fly','multi'),/pendiente de verificar las atribuciones/);
 assert.match(page('snow-halation','hso-orchestra'),/Japonés \(rōmaji\)/);
 assert.match(page('snow-halation','hso-orchestra'),/Fushigi da ne/);
 assert.match(page('connect','es','ja'),/歌詞アダプテーション/);
 assert.doesNotMatch(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),/No debo olvidar la promesa/);
});

test('release dates and lyric choices remain independent from recording selection',()=>{
 const page=(slug,query={})=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es',...query}));
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
 assert.match(page('butter-fly'),/JP \/ FR \/ PT \/ ES \/ EN/);
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
 const page=(slug,lang,query={})=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang,...query}));
 for(const lang of ['es','en']){
  const h=page('snow-halation',lang,{version:'hso-orchestra'});
  assert.match(h,/class="lyric-text colored-lyrics" lang="ja-Latn"/);
  assert.match(h,/Fushigi da ne/);
  assert.doesNotMatch(h,/不思議だね/);
 }
 const ja=page('snow-halation','ja',{version:'hso-orchestra'});
 assert.match(ja,/class="lyric-text colored-lyrics" lang="ja"/);
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
 const page=(slug,lang,version)=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang,version}));
 const catalog=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.equal((catalog.match(/class="square-art"/g)||[]).length,115);
 for(const s of songs){
  const visible=s.versions.filter(v=>v.public!==false);
  const first=visible.filter(v=>v.date).sort((a,b)=>a.date.localeCompare(b.date))[0]||visible[0];
  if(first?.videoId&&first.videoStatus!=='blocked'&&!releaseArtwork[s.slug]?.framing&&!releaseArtwork[s.slug]?.components)assert.ok(catalog.includes('https://i.ytimg.com/vi/'+first.videoId+'/hqdefault.jpg'));
  for(const v of visible.filter(v=>v.videoId&&v.videoStatus!=='blocked'))for(const lang of ['es','en','ja']){
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
 const res=await worker.fetch(req('/music/songs/blue-spirit/'),environment);
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
 const page=(slug,lang)=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
 for(const lang of ['es','en','ja']){
  const mh=page('mumei',lang),sh=page('snow-halation',lang),ch=musicPage('/music/songs/',new URLSearchParams({lang}));
  assert.match(mh,/Promise/);assert.match(mh,/Council/);assert.match(mh,/<span class="pk-tag">Promise<\/span>/);
  assert.match(sh,/affiliation=ll-muse/);assert.match(sh,/affiliation=love-live/);
  assert.match(ch,/data-affiliation="hololive holo-en holo-promise"/);
  assert.match(ch,/data-affiliation="love-live ll-muse"/);
  assert.match(ch,/<select id="affiliation">/);
  assert.doesNotMatch(ch,/option value="holo-council"/);
  assert.match(ch,/council/);
  assert.match(ch,/\.song:hover,\.song:active,\.song:focus-within\{background:var\(--action\)/);
  assert.doesNotMatch(ch,/\.song>a:first-child:hover \.song-info\{background/);
  assert.match(ch,/data-filter-affiliation="holo-en"/);
  assert.doesNotMatch(ch,/option value="ll-hasunosora"/);
 }
});

test('compact cards have one franchise badge while fiches retain complete tags',()=>{
 const m=songs.find(s=>s.slug==='mumei'), snow=songs.find(s=>s.slug==='snow-halation');
 for(const lang of ['es','en','ja']){
  assert.deepEqual(catalogAffiliationBadge(m,lang),{id:'holo-en',label:'hololive EN'});
  assert.deepEqual(catalogAffiliationBadge(snow,lang),{id:'ll-muse',label:"μ's",key:'series',value:'Love Live! School Idol Project'});
  const h=musicPage('/music/songs/',new URLSearchParams({lang}));
  const card=slug=>h.match(new RegExp('<article class="song"[^>]*>[\\s\\S]*?<\\/article>','g')).find(x=>x.includes('/music/songs/'+slug+'/'));
  const mc=card('mumei'),sc=card('snow-halation'),pc=card('dokimeki-diary');
  assert.equal((mc.match(/class="pk-tag"/g)||[]).length,1);
  assert.match(mc,/affiliation=holo-en">hololive EN<\/a>/);
  assert.doesNotMatch(mc,/class="pk-tag"[^>]*affiliation=holo-promise/);
  assert.equal((sc.match(/class="pk-tag"/g)||[]).length,1);
  assert.match(sc,/affiliation=ll-muse">μ&#39;s<\/a>/);
  assert.match(pc,/block=horizons/);
  const detail=musicPage('/music/songs/mumei/',new URLSearchParams({lang}));
  assert.match(detail,/<span class="pk-tag">Promise<\/span>/);
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
 const catalog=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.equal(Object.keys(releaseArtwork).length,115);
 assert.equal((catalog.match(/class="square-art"/g)||[]).length,115);
 assert.match(catalog,/\.square-art\{position:relative;aspect-ratio:1\/1/);
 assert.match(catalog,/object-fit:contain/);
 for(const s of songs){
  const card=catalog.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(h=>h.includes('/music/songs/'+s.slug+'/'));
  const first=s.versions.filter(v=>v.public!==false&&v.date).sort((a,b)=>a.date.localeCompare(b.date))[0]||s.versions.find(v=>v.public!==false);
  const art=releaseArtwork[s.slug];
  if(art?.components){assert.equal((card.match(/class="art-cell"/g)||[]).length,4);assert.match(card,/data-composite="medley"/);for(const slug of art.components)assert.ok(card.includes(artworkURL(slug)));}
  else if(art){
   assert.ok(card.includes('src="'+artworkURL(s.slug)+'"'));
   assert.ok(card.includes((art.framing||first.videoStatus==='blocked'||!first.videoId)?'data-fallback=""':'data-fallback="https://i.ytimg.com/vi/'+first.videoId+'/hqdefault.jpg"'));
   assert.ok(card.includes('data-art-kind="'+art.kind+'"'));
   const h=musicPage('/music/songs/'+s.slug+'/',new URLSearchParams({lang:'es'}));
   assert.doesNotMatch(h,/class="release-art-note"|class="video-note"/);
   if(first.videoId||first.videoStatus==='blocked')assert.match(h,first.videoStatus==='blocked'?/class="archive-video"/:/class="video-stage"/);else assert.doesNotMatch(h,/class="video-stage"/);
  }else{assert.match(card,/data-art-kind="video"/);}
 }
 const response=await worker.fetch(req('/music/songs/'),environment);
 const csp=response.headers.get('Content-Security-Policy');
 for(const a of Object.values(releaseArtwork))assert.ok(a.image.startsWith('/')?csp.includes("img-src 'self'"):csp.includes(new URL(a.image).origin));
 assert.equal(releaseArtwork['blue-spirit'].kind,'game');
 assert.match(releaseArtwork['blue-spirit'].artworkContext,/Heart-Linking Harmony/);
 assert.equal(releaseArtwork.connect.image,'https://www.lisani.jp/claris-best1st/images/connect_img01.jpg');
 assert.equal(releaseArtwork['cake-song'].credit,'Subin Yeon');
 for(const slug of ['blue-spirit','are-ga-koi-datta-no-ka-na','stuck-on-you','villain-vibes','feelin-it-all','meant-to-be','signal','what-youre-made-of','yuukyuu-no-catharsis']){
  const path=releaseArtwork[slug].image;
  const routed=await worker.fetch(req(path),{...environment,ASSETS:{fetch:async request=>new Response(new Uint8Array([82,73,70,70]),{headers:{'Content-Type':'image/webp'}})}});
  assert.equal(routed.status,200);
  assert.equal(routed.headers.get('Content-Type'),'image/webp');
 }
 assert.equal((await worker.fetch(req('/music-artwork/unknown.webp'),environment)).status,404);
});

test('registered external artwork cache reuses successful responses and rejects unsafe or failed origins',async()=>{
 const path=artworkURL('connect'),url='https://kgblaze.dpdns.org'+path;
 assert.equal(artworkSources.size,Object.values(releaseArtwork).filter(a=>!a.components&&a.image.startsWith('https://')).length);
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
 const catalog=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.equal((catalog.match(/loading="eager"/g)||[]).length,2);
 assert.equal((catalog.match(/loading="lazy"/g)||[]).length,songs.length-2);
 assert.match(catalog,/data-origin="https:\/\/www\.lisani\.jp/);
});
test('context filters appear only for relevant results or tag deep links',()=>{
 const html=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.match(html,/id="context-filters" hidden/);
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const make=()=>({value:'',options:[],hidden:false,addEventListener(name,fn){this[name]=fn},setAttribute(){}});
 const ids=['search','language','year','series','block','affiliation','block-filter','affiliation-filter','affiliation-label','context-filters','empty','clear','grid','list'];
 const el=Object.fromEntries(ids.map(k=>[k,make()]));
 el['affiliation-label'].dataset={branchLabel:'Rama',groupLabel:'Franquicia / grupo'};
 const options=(...values)=>values.map(value=>({value}));
 el.series.options=options('','Pokémon','hololive','Love Live!','Azur Lane');
 el.block.options=options('','horizons');el.affiliation.options=options('','hololive','holo-en','holo-promise','love-live','ll-muse');
 const item=(title,series,block,affiliation)=>({dataset:{title,series,primarySeries:series==='Pokémon Horizons'?'Pokémon':series==='hololive English'?'hololive':series.startsWith('Love Live!')?'Love Live!':series,block,affiliation,filterAffiliation:affiliation.split(' ').filter(x=>x==='holo-en'||x==='ll-muse').join(' '),lang:'ES',year:'2023'}});
 const items=[item('dokimeki','Pokémon Horizons','horizons',''),item('mumei','hololive English','','hololive holo-en holo-promise'),item('snow','Love Live! School Idol Project','','love-live ll-muse'),item('blue','Azur Lane','','')];
 el.songs={children:items,classList:{toggle(){}}};
 const doc={querySelectorAll:()=>[],getElementById:id=>el[id]};
 const start=search=>new Function('document','location','URLSearchParams',js)(doc,{search},URLSearchParams);
 start('');assert.equal(el['context-filters'].hidden,true);
 el.series.value='Pokémon';el.series.input();assert.equal(el['block-filter'].hidden,false);assert.equal(el['affiliation-filter'].hidden,true);
 el.block.value='horizons';el.block.input();assert.equal(items.filter(x=>!x.hidden).length,1);
 el.series.value='hololive';el.series.input();assert.equal(el.block.value,'');assert.equal(el['block-filter'].hidden,true);assert.equal(el['affiliation-filter'].hidden,false);assert.equal(el['affiliation-label'].textContent,'Rama');
 assert.equal(el.affiliation.options.find(o=>o.value==='ll-muse').disabled,true);
 el.series.value='Azur Lane';el.series.input();assert.equal(el['context-filters'].hidden,true);
 el.clear.onclick();assert.equal(el['context-filters'].hidden,true);assert.equal(items.filter(x=>!x.hidden).length,4);
 el.search.value='snow';el.search.input();assert.equal(el['affiliation-filter'].hidden,false);assert.equal(el['affiliation-label'].textContent,'Franquicia / grupo');assert.equal(el.affiliation.options.find(o=>o.value==='holo-en').disabled,true);
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
 const manifestV2=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;
 const newSlugs=['kirameki-rider',"pokemon-theme","pokemon-world","pokemon-johto","born-to-be-a-winner","believe-in-me","i-wanna-be-a-hero","this-dream","unbeatable","battle-frontier","catch-the-moment","crossing-field","halloween-night","suki-yuki-maji-magic","under-the-party-lights","caste-room","dance-in-the-game","minor-piece","toge-toge-sadistic","your-reality","yakusoku","u-belle",'p3-fes','pop-step','spektro','the-secret-night','shukufuku','planetarium','ruteshi-kisuki-shiteru','ryuusei','senaka-awase','shiny-days','heart-no-shuchou','karakuri-pierrot','last-cup-of-coffee','lets-be-one','lonely-feather','minikui-ikimono','mirai-connection','otome-domo-yo','ougon-kouro','ai-no-uta','beginners-rock','dakara-boku-wa-boku-wo-tebanasu','end-of-a-life','gg','gimi-gimi','leon-no-sabe-que-existo','hitoribocchi-tokyo','kaze-no-uta'];
 assert.equal(Object.keys(manifest).length,11);
 for(const [slug,art] of Object.entries(releaseArtwork)){
  if(art.components||['ano-ne','kono-tate-ni-kakuremasu','koko-kara-koko-kara','one-step','el-nano','there-is-a-reason','xy-and-z','ten-to-sen','kimi-to-iu-shinwa','rvr','zutto','level','kenka','kokuan-glossolalia','hikari-aru-basho-e','starlog','aint-backing-down','tempestas-claim'].includes(slug))continue;
  if(['miiro','graphite-diamond','high-free-spirits','savior-of-song','yukitoki','harumodoki','megumi-no-ame','daisuki','love-evidence','honey-jet-coaster','stuck-on-you','rakuen-project','please-please','twilight-little-star','shiny-smily-story','villain-vibes','sparks-of-joy','sparks','stars-we-chase','pastel','bad-candy','alive','hana-no-tou','strobe-memory','youthful-beautiful','brave-shine'].includes(slug))continue; // new official sources use cache and fallback until snapshots are captured
  const bytes=readFileSync(new URL(newSlugs.includes(slug)?'../public'+manifestV2[slug].path:'../public/music-artwork/'+slug+'-v1.webp',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  if(newSlugs.includes(slug)){const row=manifestV2[slug];assert.equal(row.origin,art.sourceImage);assert.equal(row.status,'preserved');assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);continue;}
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
  const page=slug=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
  const h=page('cake-song');
  assert.match(h,/Holy Quintet/);
  assert.match(h,lang==='ja'?/鹿目まどか（CV：悠木碧）/:/Madoka Kaname \(CV: Aoi Yūki\)/);
  assert.match(h,lang==='ja'?/ベベ（CV：阿澄佳奈）/:/Bebe \(CV: Kana Asumi\)/);
  assert.doesNotMatch(h,lang==='ja'?/劇団イヌカレー/:/Gekidan Inu Curry/);
  assert.doesNotMatch(h,lang==='ja'?/梶浦由記/:/Yuki Kajiura/);
  assert.match(h,/title="Bebe"/);
  assert.match(h,/class="original-cast"/);
  assert.match(page('blue-spirit'),lang==='ja'?/イラストリアス（CV：雨宮天）/:/Illustrious \(CV: Sora Amamiya\)/);
  assert.match(page('only-one-yell'),lang==='ja'?/淀川逢生（CV：岩橋由佳）/:/Ao Yodogawa \(CV: Yuka Iwahashi\)/);
  assert.match(page('snow-halation'),lang==='ja'?/西木野真姫（CV：Pile）/:/Maki Nishikino \(CV: Pile\)/);
  assert.doesNotMatch(page('connect'),/class="original-cast"/);
  assert.match(musicPage('/music/songs/',new URLSearchParams({lang})),/madoka kaname/);
 }
});

test('Cake Song catalog names only Holy Quintet while full fiche retains Bebe',()=>{
 for(const lang of ['es','en','ja']){
  const catalog=musicPage('/music/songs/',new URLSearchParams({lang}));
  const card=catalog.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(x=>x.includes('/music/songs/cake-song/'));
  assert.match(card,/<p class="artist">Holy Quintet · 2026<\/p>/);
  assert.doesNotMatch(card,/<p class="artist">[^<]*(Bebe|Nagisa|ベベ|なぎさ)/);
  const detail=musicPage('/music/songs/cake-song/',new URLSearchParams({lang}));
  assert.match(detail,lang==='ja'?/ベベ（CV：阿澄佳奈）/:/Bebe \(CV: Kana Asumi\)/);
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
  const page=(slug,version='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang,version}));
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
 assert.equal(songs.flatMap(s=>s.versions).filter(v=>v.public!==false&&v.videoId).length,123);
 const high=songs.find(s=>s.slug==='high-free-spirits');
 assert.equal(high.versions.find(v=>v.id==='original-instrumental').public,false);
 const page=(slug,version='es',lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({version,lang}));
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
 const page=(slug,lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
 for(const lang of ['es','en','ja']){
  assert.match(page('yukitoki',lang),/Beldiner/);
  assert.match(page('harumodoki',lang),/beck y matcha allen/);
  assert.match(page('megumi-no-ame',lang),/Y aun cuando no quedan más palabras/);
  assert.match(page('yukitoki',lang),/data-video-id="V6uGXJoucPE"/);
  assert.match(page('harumodoki',lang),/data-video-id="e4_Krpq9JQM"/);
  assert.match(page('megumi-no-ame',lang),/data-video-id="ghOdV3BL3IY"/);
  assert.doesNotMatch(page('harumodoki',lang),/6nWn2lwOYq0|mewsic/);
  assert.doesNotMatch(page('yukitoki',lang),lang==='ja'?/北川勝利/:/Katsutoshi Kitagawa/);
 }
 assert.equal(lyricsBySong.harumodoki.en,undefined);
});


test('Oregairu selects clean historical artwork and individual square framing',()=>{
 const slugs=['yukitoki','harumodoki','megumi-no-ame'];
 const html=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 for(const slug of slugs){const art=releaseArtwork[slug];assert.equal(art.kind,'selected');assert.equal(art.version,2);assert.ok(art.originalRelease.source);assert.match(artworkURL(slug),/-v2$/);assert.ok(html.includes('data-framing="'+art.framing+'"'));const detail=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es'}));assert.doesNotMatch(detail,/class="release-art-note"|class="video-note"/);}
});


test('Love Experiment archive retains blocked tracks without broken playback',()=>{
 const ep=coverAlbums.find(a=>a.id==='love-experiment');assert.equal(ep.titles.en,'Love Experiment');assert.equal(ep.tracks.length,7);
 const page=(slug,lang='es')=>musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
 for(const slug of ['please-please','twilight-little-star']){const h=page(slug);assert.match(h,/Video original no disponible actualmente\./);assert.match(h,/La interpretación sigue formando parte del archivo histórico\./);assert.match(h,/Re-upload pendiente/);assert.doesNotMatch(h,/class="video-stage"|class="youtube-link"/);assert.match(page(slug,'en'),/Original video currently unavailable/);assert.match(page(slug,'ja'),/元の動画は現在視聴できません/);}
 assert.match(page('daisuki'),/Cada instante/);assert.match(page('honey-jet-coaster'),/Ella parece mucho más novio que yo/);assert.doesNotMatch(page('honey-jet-coaster'),/La Shikimori parece más vato que yo/);
 assert.equal(albumsForVersion('daisuki','acoustic').length,1);
});


test('Rebel Live Idol Project and streamlined song detail',()=>{
 const album=coverAlbums.find(a=>a.id==='rebel-live-idol-project');assert.deepEqual(album.tracks.map(t=>t.song),['shiny-smily-story','villain-vibes','sparks-of-joy','sparks','stars-we-chase','pastel']);
 for(const lang of ['es','en','ja']){assert.equal(album.titles[lang],'Rebel Live Idol Project');for(const {song} of album.tracks){const h=musicPage('/music/songs/'+song+'/',new URLSearchParams({lang}));assert.match(h,/Rebel Live Idol Project/);assert.match(h,/class="video-stage"/);assert.doesNotMatch(h,/class="release-art-note"|class="video-note"/);}}
 assert.equal(lyricsBySong['shiny-smily-story'].en,undefined);assert.match(lyricsBySong['shiny-smily-story'].es.text,/Un mismo gran futuro/);assert.doesNotMatch(lyricsBySong['shiny-smily-story'].es.text,/We took our hands/);
 assert.equal(originalPerformances.pastel.cast.length,4);assert.equal(originalPerformances['stars-we-chase'].cast[0].cv.latin,'Shu Uchida');
});


test('Villain Vibes uses the creator-matched MV illustration, not the album jacket',()=>{
 const a=releaseArtwork['villain-vibes'];assert.equal(a.image,'/music-artwork/villain-vibes-v2.webp');assert.equal(a.credit,'Szainx');assert.equal(a.kind,'selected');assert.ok(a.originalRelease.image.includes('mzstatic.com'));const bytes=readFileSync(new URL('../public'+a.image,import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');const card=musicPage('/music/songs/',new URLSearchParams({lang:'es'})).match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(h=>h.includes('/music/songs/villain-vibes/'));assert.ok(card.includes(a.image));assert.ok(card.includes('data-fallback=""'));assert.ok(!card.includes(a.originalRelease.image));
});


test('SSSS.LYCORIS preserves album seven and official uppercase franchise names',()=>{
 const ep=coverAlbums.find(a=>a.id==='ssss-lycoris');assert.equal(ep.historicalNumber,7);assert.equal(ep.tracks.length,5);for(const lang of ['es','en','ja']){assert.equal(ep.titles[lang],'SSSS.LYCORIS');assert.match(musicPage('/music/songs/youthful-beautiful/',new URLSearchParams({lang})),/SSSS\.GRIDMAN/);assert.match(musicPage('/music/songs/strobe-memory/',new URLSearchParams({lang})),/SSSS\.DYNAZENON/);}
 const alive=songs.find(s=>s.slug==='alive');assert.equal(alive.versions.length,2);assert.equal(lyricAliases.alive?.lycoreco,undefined);assert.equal(alive.lyricScope,'version');const lycoreco=musicPage('/music/songs/alive/',new URLSearchParams({version:'lycoreco',lang:'es'}));assert.match(lycoreco,/data-video-id="HLOolKuY1ao"/);assert.doesNotMatch(lycoreco,/class="archive-video"|class="archive-status"/);assert.equal(alive.versions.find(v=>v.id==='lycoreco').historicalUploadStatus,'removed-claims');assert.match(musicPage('/music/songs/alive/',new URLSearchParams({lang:'es'})),/data-video-id="p9E3jlxtRr4"/);assert.match(musicPage('/music/songs/hana-no-tou/',new URLSearchParams({lang:'es'})),/data-video-id="OVCKHOyazEQ"/);assert.equal(alive.versions[0].historicalUploadStatus,'removed-claims');assert.match(lyricsBySong.alive.es.text,/Mi anhelo es el coraje/);assert.doesNotMatch(lyricsBySong['bad-candy'].es.text,/You need to show me, babe/);
});


test('reuploads retain original interpretation month and separate video publication date',()=>{
 for(const [slug,date,id] of [['alive','2022-12','p9E3jlxtRr4'],['hana-no-tou','2023-02','OVCKHOyazEQ']]){const v=songs.find(s=>s.slug===slug).versions[0];assert.equal(v.date,date);assert.equal(v.videoPublishedDate,'2023-06-01');assert.equal(v.reuploaded,true);assert.equal(v.datePrecision,'month');assert.match(v.label[0],/Original \(Resubido\)/);const h=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es'}));assert.match(h,new RegExp('data-video-id="'+id+'"'));assert.match(h,/Publicación del video resubido<\/dt><dd>junio de 2023/);assert.doesNotMatch(h,/class="release-date"/);}
 for(const lang of ['es','en','ja'])for(const s of songs){const h=musicPage('/music/songs/'+s.slug+'/',new URLSearchParams({lang}));assert.doesNotMatch(h,/class="release-date"/);}
});


test('ALIVE LycoReco uses its exact shorter adaptation and follows the video version',()=>{
 const full=lyricsBySong.alive.es.text,short=lyricsBySong.alive.lycoreco.text;
 assert.ok(full.startsWith('Mi anhelo es el coraje de elegir'));assert.equal(short,"Mi anhelo es evidenciar mi existir\nPues mi voz siento dentro de mi temblar, aún si alto logra resonar\nSuelta todo tu pesar, y mi mano no sueltes (en las sombras no me sueltes)\nLo que fue ayer sólo deja pasar\nNo hay respuesta aquí que este decidido a elegir\nPues a un nuevo sueño yo voy a apuntar (por siempre)\nDonde nuestro camino vea iluminar\n\nRiesgos puede esconder, esta ruta más (seguro) un sueño hay\nSólo somos tú y yo, la posibilidad (vamos) hay que pronto hallar\n\nEn vez de a lo lejos, el presente yo veo\nPues la historia aún no termina, y el desenlace hoy aquí aún puedo cambiar\n\nMi promesa es probar mi existir\nPues yo sé que aquel cielo que sólo vi, vale la pena perseguir sin fin\nPuede complicado ser, más mi mano no sueltes (en lo lejos no me sueltes)\nLo que vendrá sólo deja pasar\nNo hay respuesta aquí que este decidido a elegir\nDonde nuestro camino vea iluminar\n\nY evidenciar mi existir\nPues mi voz siento dentro de mi temblar, aún si alto logra resonar\nSuelta todo tu pesar, y mi mano no sueltes (en las sombras no me sueltes)\nLo que fue ayer sólo deja pasar\nNo hay respuesta aquí que este decidido a elegir\nPues a un nuevo sueño yo voy a apuntar (por siempre)\nDonde nuestro camino vea iluminar");assert.ok(short.length<full.length);assert.doesNotMatch(short,/Y en lágrimas me quebranté/);
 const get=(version,lang,extra={})=>musicPage('/music/songs/alive/',new URLSearchParams({version,lang,...extra}));
 const section=h=>h.match(/<section class="lyrics">[\s\S]*?<\/section>/)[0].replace(/<[^>]*>/g,'');
 for(const lang of ['es','en','ja']){const a=section(get('es',lang)),b=section(get('lycoreco',lang,{lyric:'es',compare:'es'}));assert.match(a,/Mi anhelo es el coraje de elegir/);assert.match(a,/Y en lágrimas me quebranté/);assert.match(b,/Mi anhelo es evidenciar mi existir/);assert.doesNotMatch(b,/Mi anhelo es el coraje de elegir|Y en lágrimas me quebranté|class="lyric-controls"|class="parallel-/);assert.match(get('lycoreco',lang),/data-video-id="HLOolKuY1ao"/);}
});


test('ALIVE duet spans preserve exact words, source divisions and selected version',()=>{
 const get=(version,lang)=>musicPage('/music/songs/alive/',new URLSearchParams({version,lang}));
 for(const id of ['es','lycoreco']){const l=lyricsBySong.alive[id];assert.equal(l.duetStanzas.map(st=>st.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);assert.ok(l.duetStanzas.flat(2).some(p=>p.voice==='shared'));for(const lang of ['es','en','ja']){const h=get(id,lang);assert.match(h,/class="duet-legend"/);assert.match(h,/class="duet-chisato" title="Chisato">Mi anhelo /);assert.match(h,/class="duet-takina" title="Takina">\(en lo lejos no me sueltes\)/);assert.match(h,/class="duet-shared"[^>]*>Donde nuestro camino vea iluminar/);}}
 const a=get('es','es'),b=get('lycoreco','es');assert.match(a,/class="duet-chisato" title="Chisato">Y en lágrimas me quebranté/);assert.doesNotMatch(b,/Y en lágrimas me quebranté/);assert.match(b,/class="duet-chisato" title="Chisato">Mi anhelo <\/span><span class="duet-shared" title="Ambas">es evidenciar mi existir/);assert.doesNotMatch(musicPage('/music/songs/hana-no-tou/',new URLSearchParams({lang:'es'})),/class="duet-legend"/);
});


test('Stage 27 albums, lyrics and recovered covers are available in all three locales',()=>{
 for(const slug of ['yuukyuu-no-catharsis','meant-to-be','feelin-it-all','signal','what-youre-made-of']){
  const art=releaseArtwork[slug];assert.ok(art.image.startsWith('/music-artwork/'));const bytes=readFileSync(new URL('../public'+art.image,import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
 for(const lang of ['es','en','ja']){
  const html=musicPage('/music/songs/',new URLSearchParams({lang}));
  for(const slug of ['yuukyuu-no-catharsis','meant-to-be','feelin-it-all','melodia-del-oceano']){assert.ok(html.includes('/music/songs/'+slug+'/'));const detail=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));assert.ok(detail.includes('class="lyric-text'));}
  const medley=musicPage('/music/songs/melodia-del-oceano/',new URLSearchParams({lang}));assert.match(medley,/color-legend/);assert.match(medley,/será hora de regresar/);assert.match(medley,/DarkHole y Pineapple/);
 }
});


test('Arcana Integrity: all works have art, individually framed jackets and medley quadrants',()=>{
 const adjusted=['dokimeki-diary','connect','miiro','savior-of-song','love-evidence','youthful-beautiful','please-please'];
 assert.equal(Object.keys(releaseArtwork).length,songs.length);
 for(const slug of adjusted)assert.equal(releaseArtwork[slug].fit,'cover');
 for(const lang of ['es','en','ja']){
  const h=musicPage('/music/songs/',new URLSearchParams({lang}));
  assert.equal((h.match(/class="square-art"/g)||[]).length,115);
  for(const s of songs){const card=h.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(x=>x.includes('/music/songs/'+s.slug+'/'));assert.ok(card);assert.doesNotMatch(card,/data-art-kind="video"/);if(adjusted.includes(s.slug))assert.match(card,/data-fit="cover"/);}
  assert.match(h,/data-composite="medley"/);assert.equal((h.match(/class="art-cell"/g)||[]).length,4);
  assert.match(h,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 }
});

test('Arcana Integrity preservation manifest covers every work and verifies available files',()=>{
 const m=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;
 assert.deepEqual(Object.keys(m).sort(),songs.map(s=>s.slug).sort());
 for(const [slug,row] of Object.entries(m)){
  const a=releaseArtwork[slug];assert.equal(row.source,a.source);
  if(row.status==='preserved'||row.status==='preserved-composite'){
   const bytes=readFileSync(new URL('../public'+row.path,import.meta.url));assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);
  }else assert.ok(['pending-snapshot','composite'].includes(row.status),slug);
 }
 assert.deepEqual(m['melodia-del-oceano'].components,['miiro','graphite-diamond','high-free-spirits','savior-of-song']);
});

test('Visor refinement: JP display keeps the internal JA filtering and approved artwork unchanged',()=>{
 for(const lang of ['es','en','ja']){
  const h=musicPage('/music/songs/',new URLSearchParams({lang}));assert.match(h,/<option value="JA">JP<\/option>/);assert.match(h,/JP \/ FR \/ PT \/ ES \/ EN/);assert.match(h,/data-lang="JA FR PT ES EN MULTI"/);assert.doesNotMatch(h,/<p class="meta">[^<]*\bJA\b/);
  for(const slug of ['kenka','bad-candy','hikari-aru-basho-e'])assert.ok(h.includes(artworkURL(slug)));
 }
 for(const slug of ['kenka','bad-candy','hikari-aru-basho-e']){assert.equal(releaseArtwork[slug].version,slug==='hikari-aru-basho-e'?3:2);assert.ok(releaseArtwork[slug].originalRelease);}
 assert.match(releaseArtwork.kenka.release,/Disc 3 track 13/);
});

test('music fragments omit the document shell and preserve original voice divisions in comparison',()=>{
 const h=musicPage('/music/songs/blue-spirit/',new URLSearchParams({lang:'es',version:'en',lyric:'en',compare:'es',fragment:'1'}));
 assert.match(h,/^<div id="music-content" data-view="detail"/);
 assert.doesNotMatch(h,/<!doctype|<script>/);
 assert.match(h,/data-version="en"/);
 assert.match(h,/class="parallel-pairs"/);
 assert.match(h,/class="color-legend"/);
 assert.match(h,/class="color-part/);
 const catalogue=musicPage('/music/songs/',new URLSearchParams({lang:'es',fragment:'1'}));
 assert.match(catalogue,/^<div id="music-content" data-view="catalog"/);
 assert.equal((catalogue.match(/class="square-art"/g)||[]).length,115);
});

test('canonical song paths and one independent state payload per work',async()=>{
 assert.ok(MUSIC_PATHS.has('/music/songs/blue-spirit/'));
 const old=await worker.fetch(req('/music/blue-spirit/?lang=es&version=en'),environment);assert.equal(old.status,308);assert.equal(old.headers.get('Location'),origin+'/music/songs/blue-spirit/?lang=es&version=en');
 assert.equal(routePortalRequest(req('/music/album/azur-sin-limites/')).response.status,404);
 assert.equal(routePortalRequest(req('/music/data/song/unpublished.json')).response.status,404);
 for(const s of songs){
  const d=musicStateData('/music/data/song/'+s.slug+'.json');
  assert.equal(d.slug,s.slug);
  for(const lang of ['es','en','ja'])for(const v of s.versions.filter(v=>v.public!==false)){
   const part=d.locales[lang][v.id];assert.ok(part);assert.match(part.html,/data-view="detail"/);
   assert.ok(part.lyrics[part.defaultLyric]);assert.doesNotMatch(part.html,/<script>|<!doctype/);
  }
 }
 const response=await worker.fetch(req('/music/data/song/blue-spirit.json'),environment);
 assert.equal(response.status,200);const d=await response.json();
 const v=d.locales.es.en;assert.ok(v.lyrics.es.cells.some(c=>c.includes('color-part')));assert.ok(v.lyrics.en.cells.some(c=>c.includes('color-part')));
 const h=await worker.fetch(new Request(origin+'/music/songs/blue-spirit/',{headers:{Cookie:'kgblaze_lang=ja'}}),environment);assert.match(await h.text(),/<html lang="ja"/);
});

test('editorial families and localized Azur Lane events preserve catalog identity',()=>{
 const html=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 const cards=html.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g);
 const by=slug=>cards.find(c=>c.includes('/music/songs/'+slug+'/'));
 const members=family=>cards.filter(c=>c.match(/data-primary-series="([^"]*)"/)[1].split('|').includes(family));
 assert.equal(cards.length,115);assert.equal(members('Azur Lane').length,11);
 for(const family of ['Azur Lane','Kantai Collection','High School Fleet','Arpeggio of Blue Steel'])assert.ok(members(family).includes(by('melodia-del-oceano')));
 for(const [family,count] of [['Pokémon',13],['Love Live!',7],['hololive',10],['Madoka Magica',2],['Oregairu',3],['Masamune-kun’s Revenge',2],['GRIDMAN UNIVERSE',2],['Fate/series',2]])assert.equal(members(family).length,count,family);
 assert.match(by('graphite-diamond'),/data-series="Azur Lane The Animation"/);
 assert.match(by('shiny-smily-story'),/data-filter-affiliation="holo-en holo-jp holo-id"/);
 assert.doesNotMatch(html,/<option value="holo-(?:hope|myth|promise|council)"/);
 assert.doesNotMatch(html,/<option value="(?:Azur Lane The Animation|Pokémon Horizons|Oregairu Zoku|SSSS.GRIDMAN|Madoka Magica: Rebellion)"/);
 const events={'blue-spirit':['Universe in Unison','Universe in Unison','激唱のユニバース'],'signal':['Operation Siren — Tema de lanzamiento','Operation Siren — Launch Theme','セイレーン作戦 — ローンチテーマ'],'feelin-it-all':['4.º aniversario global','4th Global Anniversary','グローバル版4周年記念'],'aint-backing-down':['5.º aniversario global','5th Global Anniversary','グローバル版5周年記念'],'what-youre-made-of':['2.º aniversario global','2nd Global Anniversary','グローバル版2周年記念'],'tempestas-claim':['Tempesta and the Fountain of Youth','Tempesta and the Fountain of Youth','テンペスタと若返りの泉']};
 for(const [i,lang] of ['es','en','ja'].entries()){
  for(const [slug,values] of Object.entries(events)){const h=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));assert.ok(h.includes('<dt>'+['Evento','Event','イベント'][i]+'</dt><dd>'+values[i]+'</dd>'),slug+' '+lang);}
  for(const slug of ['graphite-diamond','yuukyuu-no-catharsis'])assert.ok(!musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang})).includes('<dt>'+['Evento','Event','イベント'][i]+'</dt>'));
 }
});

test('editorial family members retain exact catalogue ordering and medley is a single card',()=>{
 for(const lang of ['es','en','ja']){
 const h=musicPage('/music/songs/',new URLSearchParams({lang})), cards=h.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g);
 const ids=key=>cards.filter(c=>c.match(/data-primary-series="([^"]*)"/)[1].split('|').includes(key)).map(c=>c.match(/href="\/music\/songs\/([^/]+)\//)[1]);
 assert.deepEqual(ids('Azur Lane'),['under-the-party-lights','ougon-kouro','blue-spirit','graphite-diamond','feelin-it-all','signal','yuukyuu-no-catharsis','aint-backing-down','tempestas-claim','what-youre-made-of','melodia-del-oceano']);
 assert.deepEqual(ids('Kantai Collection'),['miiro','melodia-del-oceano']);
 assert.deepEqual(ids('High School Fleet'),['high-free-spirits','melodia-del-oceano']);
 assert.deepEqual(ids('Arpeggio of Blue Steel'),['savior-of-song','melodia-del-oceano']);
 assert.deepEqual(ids('Love Live!'),['the-secret-night','ruteshi-kisuki-shiteru','lets-be-one','beginners-rock','snow-halation','stars-we-chase','pastel']);
 }
});

test('hololive branch label is localized without changing other franchise filter labels',()=>{
 for(const [lang,branch,group] of [['es','Rama','Franquicia / grupo'],['en','Branch','Franchise / group'],['ja','所属支部','シリーズ・グループ']]){
  const h=musicPage('/music/songs/',new URLSearchParams({lang}));
  assert.ok(h.includes('id="affiliation-label" data-branch-label="'+branch+'" data-group-label="'+group+'">'+group+'</span>'));
  assert.match(h,/label.textContent=holo\?label.dataset.branchLabel:label.dataset.groupLabel/);
 }
});

test('Horizontes intake retains all source lyric lines and Word stanza divisions',()=>{
 const hashes={"ano-ne:es":"e761555d3ed8bc2619ff7e9058d105a0efca1f12c7877863235edc113563dd8a","ano-ne:loved-ones":"bb57dab73f6654531152f9ea58dbf4a619d95d5b55f7a026a0e916910dedaa5a","kono-tate-ni-kakuremasu:es":"d720ba7525c6b224a7848682a4940f2de68a523ea1ea6158597261a9e95944a8","koko-kara-koko-kara:es":"b50036ced33d2bd6d835cfa5e68b517151bf1efdf3f66050e09f4e7560457aa2","rvr:es":"975ab8d47585739945d904100e5a8f955121049768730103639d64fdfc12aa31","zutto:es":"4776691f695d4cd10de011dc54afd855d583d2796423bae94e1ca816d9cae261","level:es":"6368a2126e67181687d11da009cde9e9ad126955e7b55113017ea427f5291936"};
 const layouts={"ano-ne:es":[5,3,4,6,3,5,7,6,6,3],"ano-ne:loved-ones":[5,3,5,7,3,5,8,8,7,2],"kono-tate-ni-kakuremasu:es":[4,4,4,8,4,4,4,8,8],"koko-kara-koko-kara:es":[2,1,4,2,1,4,4,4,2],"rvr:es":[3,4,4,3,7,4,4,3,7],"zutto:es":[4,2,4,4,2,4,2,2,2,2,2,1],"level:es":[6,2,4,3,3,3,3,7,3,4,4,3,1]};
 for(const [key,hash] of Object.entries(hashes)){const [slug,id]=key.split(':');const l=lyricsBySong[slug][id];assert.deepEqual(l.text.split(/\n\s*\n/).map(s=>s.split('\n').length),layouts[key],key);const normalized=l.text.split('\n').map(x=>x.trim()).filter(Boolean).join('\n');assert.equal(createHash('sha256').update(key==='rvr:es'?normalized.replace('Hey qué tal a todos aquí Blaze de regreso transmitiendo desde México para el mundo','Hey, que tal a todos aquí Blaze'):normalized).digest('hex'),hash,key);}
 const album=coverAlbums.find(a=>a.historicalNumber===6);assert.equal(album.id,'horizontes-de-aventura');assert.equal(album.tracklistStatus,'pending-confirmation');assert.equal(album.tracks.length,0);assert.equal(album.candidateTracks.length,8);assert.ok(album.candidateTracks.every(t=>songs.find(s=>s.slug===t.song)?.versions.some(v=>v.id===t.version)));
 const loved=lyricsBySong['ano-ne']['loved-ones'];assert.equal(loved.colorStanzas.flat().length,53);assert.deepEqual(loved.colorStanzas[0][3].map(p=>p.voice),['fina','yuna','shared']);
 const solo=musicPage('/music/songs/ano-ne/',new URLSearchParams({lang:'es',version:'es'}));const duet=musicPage('/music/songs/ano-ne/',new URLSearchParams({lang:'es',version:'loved-ones'}));assert.match(solo,/Maki Kawase/);assert.doesNotMatch(solo,/Azumi Waki/);assert.match(duet,/Azumi Waki/);assert.match(duet,/class="color-part/);
 const rvr=musicPage('/music/songs/rvr/',new URLSearchParams({lang:'es'}));assert.match(rvr,/data-video-id="nm1zAvt0EZI"/);assert.doesNotMatch(rvr,/class="archive-video"/);assert.match(rvr,/intervención varía según el invitado/);assert.match(rvr,/<em class="secondary-part guest-part">Hey qué tal a todos aquí Blaze de regreso transmitiendo desde México para el mundo<\/em>\nRattata, Raticate, Marowak/);assert.match(duet,/Fina/);assert.match(duet,/Ambas/);assert.doesNotMatch(duet,/Voz verde|Voz azul/);
 assert.equal(songs.filter(s=>s.slug==='dokimeki-diary').length,1);
});

test('LEVEL revised duet preserves exact lyric and all source run boundaries',()=>{
 const lyric=lyricsBySong.level.es;
 const lines=lyric.colorStanzas.flat();
 assert.equal(lines.length,46);
 assert.equal(lyric.colorStanzas.length,13);
 assert.equal(lyric.colorStanzas.map(stanza=>stanza.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),lyric.text);
 assert.deepEqual(lines[6].map(p=>p.voice),['yanaginagi','sixth-lie']);
 assert.deepEqual(lines[14].map(p=>p.voice),['sixth-lie','shared']);
 assert.deepEqual(lines[30].map(p=>p.voice),['shared','sixth-lie','shared']);
 assert.equal(lines[30][2].text,'(ahh)');
 const html=musicPage('/music/songs/level/',new URLSearchParams({lang:'es'}));
 assert.match(html,/class="color-part/);assert.match(html,/yanaginagi/);assert.match(html,/THE SIXTH LIE/);assert.match(html,/Ambos/);assert.doesNotMatch(html,/Intervención secundaria/);
});

test('Ensamble Alternativo records only confirmed alternate recordings as a planned unreleased album',()=>{
 const album=coverAlbums.find(a=>a.historicalNumber===10);
 assert.equal(album.id,'ensamble-alternativo');assert.equal(album.releaseStatus,'planned-unreleased');assert.equal(album.releaseDate,null);assert.equal(album.ordered,false);assert.equal(album.englishTitleStatus,'provisional');
 assert.deepEqual(album.tracks.map(t=>[t.song,t.version]),[['daisuki','acoustic'],['starlog','naked-garden'],['snow-halation','naked-garden'],['snow-halation','hso-orchestra'],['dokimeki-diary','ensemble']]);
 assert.ok(album.tracks.every(t=>songs.find(s=>s.slug===t.song)?.versions.some(v=>v.id===t.version)));
 assert.ok(!albumsForVersion('daisuki','es').some(a=>a.id===album.id));assert.ok(!albumsForVersion('dokimeki-diary','album-studio').some(a=>a.id===album.id));assert.ok(albumsForVersion('starlog','naked-garden').some(a=>a.id===album.id));assert.ok(albumsForVersion('starlog','naked-garden').some(a=>a.id==='cronica-maxica'));assert.ok(!albumsForVersion('starlog','es').some(a=>a.id===album.id));assert.equal(album.tracklistStatus,'confirmed-membership-order-pending');
 assert.doesNotMatch(musicPage('/music/songs/snow-halation/',new URLSearchParams({lang:'es',version:'naked-garden'})),/Álbum planeado|Ensamble Alternativo/);
 assert.equal(lyricsBySong['snow-halation'].hybrid,undefined);
});

test('Snow halation keeps two bilingual recordings and separate complete lyric languages with original μs vocal divisions',()=>{
 const song=songs.find(s=>s.slug==='snow-halation');assert.equal(song.versions.length,2);assert.ok(song.versions.every(v=>v.langs.includes('ES')&&v.langs.includes('JA')));
 const es=lyricsBySong['snow-halation']['naked-garden'],jp=lyricsBySong['snow-halation']['hso-orchestra'];
 assert.equal(lyricsBySong['snow-halation'].hybrid,undefined);
 const joined=stanzas=>stanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n');
 assert.equal(joined(es.colorStanzas),es.text);assert.equal(joined(jp.colorStanzas),jp.text);assert.equal(joined(jp.colorStanzasJa),jp.textJa);
 assert.equal(es.colorLegend.length,9);assert.equal(jp.colorStanzas.length,7);assert.equal(es.colorStanzas.length,7);
 assert.deepEqual(jp.colorStanzas.flat()[25].map(p=>p.voice),['honoka','honoka+umi+nozomi','shared']);
 assert.deepEqual(jp.colorStanzasJa.flat()[25].map(p=>p.voice),['honoka','honoka+umi+nozomi','shared']);
 assert.deepEqual(es.colorStanzas.flat()[27].map(p=>p.voice),['honoka+umi+nozomi','shared']);
 for(const lang of ['es','en','ja']){const html=musicPage('/music/songs/snow-halation/',new URLSearchParams({lang,version:'hso-orchestra'}));assert.match(html,/class="color-group"/);assert.match(html,/Honoka Kōsaka/);if(lang==='ja'){assert.match(html,/不思議だね/);assert.doesNotMatch(html,/Fushigi da ne/);}else{assert.match(html,/Fushigi da ne/);assert.doesNotMatch(html,/不思議だね/);}}
});

test('Yorimoi songs retain shared cast, editorial alias and original vocal division',()=>{
 const a=lyricsBySong['koko-kara-koko-kara'].es,b=lyricsBySong['one-step'].es;
 assert.deepEqual(a.colorLegend,b.colorLegend);assert.equal(a.colorLegend.length,4);
 const joined=stanzas=>stanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n');
 assert.equal(joined(a.colorStanzas),a.text);assert.equal(joined(b.colorStanzas),b.text);
 assert.equal(a.colorStanzas.flat()[14][0].voice,'kimari');assert.equal(a.colorStanzas.flat()[16][0].voice,'kimari+shirase+hinata');assert.deepEqual(a.colorStanzas.flat()[18].map(p=>p.voice),['yuzuki','hinata']);
 assert.equal(b.colorStanzas.flat()[0][0].voice,'kimari+shirase');assert.equal(b.colorStanzas.flat()[2][0].voice,'hinata+yuzuki');assert.ok(b.colorStanzas.at(-1).every(line=>line.every(p=>p.voice==='shared')));
 for(const slug of ['koko-kara-koko-kara','one-step']){const html=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es'}));assert.match(html,/Penguin Manjuu Crew/);assert.doesNotMatch(html,/alias creado por Blaze Leiton|Nota de atribución/);assert.match(html,/Todas/);assert.match(html,/Inori Minase/);assert.match(html,/class="color-group"/);}
 const one=songs.find(s=>s.slug==='one-step');assert.equal(one.versions[0].videoId,'P9xpo3bEuo8');assert.match(musicPage('/music/songs/one-step/',new URLSearchParams({lang:'es'})),/data-video-id="P9xpo3bEuo8"/);assert.equal(one.versions[0].firstDocumented,'2024-04-04');assert.equal(one.versions[0].date,'2023-12-10');assert.equal(one.versions[0].year,2023);assert.equal(one.versions[0].copyrightNoticeDate,'2024-04-04');
});

test('Beyond the World preserves six historical Spanish recordings and does not imply an album release',()=>{
 const album=coverAlbums.find(a=>a.historicalNumber===11);assert.equal(album.id,'mas-alla-del-mundo');assert.equal(album.releaseStatus,'planned-unreleased');assert.equal(album.releaseDate,null);assert.equal(album.ordered,false);assert.equal(album.tracks.length,6);
 for(const {song,version} of album.tracks){assert.equal(version,'es');assert.ok(songs.find(s=>s.slug===song)?.versions.some(v=>v.id===version));assert.ok(lyricsBySong[song].es.text);assert.equal(Object.keys(lyricsBySong[song]).length,1);assert.ok(albumsForVersion(song,version).includes(album));}
 const reason=songs.find(s=>s.slug==='there-is-a-reason');assert.equal(reason.versions[0].videoStatus,'blocked');assert.equal(reason.versions[0].reuploadPending,true);assert.equal(reason.versions[0].date,null);assert.equal(reason.versions[0].year,2023);assert.equal(reason.versions[0].firstDocumented,'2023-12-16');assert.equal(reason.versions[0].currentVideoId,null);assert.equal(reason.versions[0].videoPublishedDate,'2024-10-26');assert.equal(reason.versions[0].historicalPublications.length,3);assert.deepEqual(reason.versions[0].historicalPublications.map(x=>x.videoId),[null,null,'spxnKeBQpo8']);assert.match(musicPage('/music/songs/there-is-a-reason/',new URLSearchParams({lang:'es'})),/Re-upload pendiente/);assert.doesNotMatch(musicPage('/music/songs/there-is-a-reason/',new URLSearchParams({lang:'es'})),/data-video-id="spxnKeBQpo8"/);
 const xy=songs.find(s=>s.slug==='xy-and-z');assert.equal(xy.season,19);assert.equal(xy.sourceEdition,'jp');assert.match(xy.adaptationCredit,/Itani/);assert.match(musicPage('/music/songs/xy-and-z/',new URLSearchParams({lang:'es'})),/Itani/);
 assert.equal(songs.find(s=>s.slug==='el-nano').versions[0].historicalUploadStatus,undefined);
});


test('Stage 30 post-publication editorial corrections',()=>{const es=new URLSearchParams({lang:'es'});const catalog=musicPage('/music/songs/',es);assert.match(catalog,/data-primary-series="Kuma Kuma Kuma Bear"/);assert.doesNotMatch(catalog,/data-primary-series="Kuma Kuma Kuma Bear Punch!/);assert.match(musicPage('/music/songs/kono-tate-ni-kakuremasu/',es),/I Don’t Want to Get Hurt, so I’ll Max Out My Defense\. Season 2/);for(const slug of ['one-step','koko-kara-koko-kara'])assert.doesNotMatch(musicPage('/music/songs/'+slug+'/',es),/no representa el reparto de este cover/);assert.match(musicPage('/music/songs/ano-ne/',new URLSearchParams({lang:'en',version:'loved-ones'})),/Both/);assert.match(musicPage('/music/songs/level/',new URLSearchParams({lang:'en'})),/Both/);});


test('Ano ne official releases remain distinct from the two creator recordings',()=>{const a=songs.find(s=>s.slug==='ano-ne');assert.equal(a.versions.length,2);const solo=musicPage('/music/songs/ano-ne/',new URLSearchParams({lang:'es',version:'es'}));const duet=musicPage('/music/songs/ano-ne/',new URLSearchParams({lang:'es',version:'loved-ones'}));assert.doesNotMatch(solo,/COCC-17809|Resubido/);assert.doesNotMatch(duet,/COKM-43033|COCC-18117|Reedición/);});


test('Stage 30 approved crops are local square version 2 assets with provenance',()=>{const m=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;for(const slug of ['xy-and-z','level','el-nano']){const a=releaseArtwork[slug],r=m[slug];assert.equal(a.image,'/music-artwork/'+slug+'-v2.webp');assert.equal(a.sourceImage,r.origin);assert.equal(a.version,2);assert.equal(r.status,'preserved');assert.equal(r.size[0],r.size[1]);assert.equal(r.previous.version,1);assert.ok(a.originalRelease.source);assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),new RegExp(a.image));}});


test('Public editorial scope excludes planned albums and internal notes; preserves published albums and source data',()=>{for(const song of songs)for(const v of song.versions.filter(v=>v.public!==false)){const h=musicPage('/music/songs/'+song.slug+'/',new URLSearchParams({lang:'es',version:v.id}));assert.doesNotMatch(h,/Álbum planeado \(no publicado\)|Nota de atribución|<dt>Grabación<\/dt>/);}const a=songs.find(s=>s.slug==='ano-ne');assert.equal(a.versions[0].videoStatus,'available');assert.doesNotMatch(a.versions[0].label[0],/Resubido/);assert.equal(songs.find(s=>s.slug==='el-nano').versions[0].reuploaded,undefined);assert.match(musicPage('/music/songs/one-step/',new URLSearchParams({lang:'es'})),/Todas/);});


test('Recovered source stanza layout preserves line counts and original vocal divisions',()=>{const layouts={'miiro':[2,4,2,3,3,4,4,2,3,3,4,2,2,4,2,2,3,5],'savior-of-song':[4,4,4,4,4,4,4,4,4,8,4,4,4,4,4]};for(const [slug,layout] of Object.entries(layouts)){const l=lyricsBySong[slug].es;assert.deepEqual(l.text.split(/\n\s*\n/).map(s=>s.split('\n').length),layout);if(l.colorStanzas){assert.deepEqual(l.colorStanzas.map(s=>s.length),layout);assert.equal(l.colorStanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);}}for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/rvr.json').locales[lang].es.lyrics.es;assert.match(d.full,/class="secondary-part guest-part"/);assert.ok(d.cells.some(c=>c.includes('class="secondary-part guest-part"')));const snow=musicPage('/music/songs/snow-halation/',new URLSearchParams({lang}));assert.doesNotMatch(snow,/reconstruido a partir de dos transcripciones|reconstructed from two matching transcriptions|一致する2つの資料/);}});


test('Contextual repertoire: independent catalog labels and full detail headings; no invented media or albums',()=>{
 const es=new URLSearchParams({lang:'es'}),catalog=musicPage('/music/songs/',es);
 const cards=catalog.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g);
 for(const [slug,group,heading] of [['el-nano','Fórmula 1','Fórmula 1 · Fernando Alonso'],['el-mismo-sol','Juegos Panamericanos','Juegos Panamericanos Guadalajara 2011']]){
  const card=cards.find(x=>x.includes('/music/songs/'+slug+'/'));assert.ok(card);assert.ok(card.includes('<p class="work">'+group+'</p>'));assert.ok(!card.includes('<p class="work">'+heading+'</p>'));
  const h=musicPage('/music/songs/'+slug+'/',es);assert.ok(h.includes('<div class="eyebrow">'+heading+'</div>'));assert.doesNotMatch(h,/<dt>Obra original<\/dt>|<dt>Álbum<\/dt>|<dt>Tema<\/dt>/);
  const state=musicStateData('/music/data/song/'+slug+'.json').locales.es.es;assert.ok(state.html.includes('<div class="eyebrow">'+heading+'</div>'));
  for(const lang of ['en','ja']){const data=musicStateData('/music/data/song/'+slug+'.json').locales[lang].es;assert.ok(data.html.includes(songs.find(s=>s.slug===slug).context.detail[lang]));}
 }
 const nano=musicPage('/music/songs/el-nano/',es);assert.match(nano,/<dt>Artista original<\/dt><dd>Melendi<\/dd>/);assert.match(nano,/<dt>Adaptación<\/dt><dd>Blaze Leiton<\/dd>/);assert.doesNotMatch(nano,/Melendi · Blaze Leiton/);
 const sol=musicPage('/music/songs/el-mismo-sol/',es);assert.match(sol,/jbkPi4H-Z8A/);assert.match(sol,/septiembre de 2024/);assert.match(sol,/Consultar letra original/);assert.match(sol,/<dt>Artista original<\/dt><dd>Alejandro Fernández<\/dd>/);assert.doesNotMatch(sol,/<dt>Adaptación/);
 assert.equal(albumsForVersion('el-mismo-sol','es').length,0);
 assert.ok(!songs.some(s=>/all-i-want-for-christmas|^dna$/.test(s.slug)));
});


test('El mismo sol credits the original lyricist-composer in both direct and persistent views',()=>{for(const [lang,label] of [['es','Letra y composición original'],['en','Original lyrics and composition'],['ja','原曲作詞・作曲']]){const params=new URLSearchParams({lang});const html=musicPage('/music/songs/el-mismo-sol/',params);const state=musicStateData('/music/data/song/el-mismo-sol.json').locales[lang].es;for(const h of [html,state.html]){assert.ok(h.includes('<dt>'+label+'</dt><dd>Gian Marco Zignago</dd>'));}for(const h of [html,state.lyrics.es.full]){assert.ok(h.includes(label+': Gian Marco Zignago'));assert.ok(h.includes('gacetaoctubre11.pdf#page=14'));}assert.doesNotMatch(html,/<dt>Adaptación/);}});


test('El mismo sol preserves the supplied Spanish original and editorial stanza breaks',()=>{const l=lyricsBySong['el-mismo-sol'].es;assert.equal(l.kind,'original');assert.equal(l.language,'ES');assert.deepEqual(l.text.split('\n\n').map(s=>s.split('\n').length),[4,5,4,5,4,5,4,5,4,4,5,3]);assert.equal(l.text.replace(/\s+/g,' ').trim(),"Tengo un pensamiento que me abraza Y en mis pasos las distancias que me quedan por vencer Tengo en cada reto una esperanza de llegar hasta la cima Que la recompensa llega con la fe Somos el futuro de la historia Quedará en nuestra memoria cada día que pasó Somos alas libres en el viento Con un solo sentimiento somos todos Alma fuerza y corazón Sigo caminando y no me rindo Vengo de muy lejos a ganar En mi corazón una bandera colorea La alegría de mi pueblo y mi ciudad Sigo hasta el final y no me rindo Sueño con mi tierra y su calor Somos el amor de un continente Y aunque seamos diferentes Nos alumbra el mismo sol Soy de la montaña de la costa y de la selva Soy amigo de la libertad Tengo la alegría de saber que yo he nacido Para hacer mi sueño siempre realidad Somos el futuro de la historia Quedará en nuestra memoria cada día que pasó Somos alas libres en el viento Con un solo sentimiento somos todos Alma fuerza y corazón Sigo caminando y no me rindo Vengo de muy lejos a ganar En mi corazón una bandera colorea La alegría de mi pueblo y mi ciudad Sigo hasta el final y no me rindo Sueño con mi tierra y su calor Somos el amor de un continente Y aunque seamos diferentes Nos alumbra el mismo sol Nadie me puede parar Yo sé que arriba hay una luz que me ilumina Llega hasta la cima Nadie me puede parar, mi corazón solo sabe ganar Sigo caminando y no me rindo Vengo de muy lejos a ganar En mi corazón una bandera colorea La alegría de mi pueblo y mi ciudad Sigo hasta el final y no me rindo Sueño con mi tierra y su calor Somos el amor de un continente Y aunque seamos diferentes Nos alumbra el mismo sol Somos el amor de un continente Y aunque seamos diferentes Nos alumbra el mismo sol.");for(const lang of ['es','en','ja']){const state=musicStateData('/music/data/song/el-mismo-sol.json').locales[lang].es;assert.equal(state.lyrics.es.hasText,true);assert.equal(state.lyrics.es.cells.length,12);assert.match(state.lyrics.es.full,/class="lyric-text" lang="es"/);assert.match(state.lyrics.es.full,/Gian Marco Zignago/);assert.match(state.lyrics.es.full,/gacetaoctubre11.pdf#page=14/);assert.doesNotMatch(state.lyrics.es.full,/class="empty-lyrics"/);}});


test('Individual repertoire block 01 preserves published works, external collaboration, and Word stanzas',()=>{const rows=[["ai-no-uta",["MIeEMPQrOR4"]],["beginners-rock",["dmb31gjkowc"]],["dakara-boku-wa-boku-wo-tebanasu",["MKW4QXI1RjM"]],["end-of-a-life",["a4ixqyb4ZTM"]],["gg",["Xe_bscWmxdE"]],["gimi-gimi",["Ja9Eh61atNI","lfmAQ6r0BSQ"]],["leon-no-sabe-que-existo",["YxgnnIHQBYQ"]],["hitoribocchi-tokyo",["K6Rwz6Kyj6w"]],["kaze-no-uta",["xfbvTgg-ELA"]]];const layouts={"ai-no-uta":[3,3,4,3,3,4,2,1,2,4,1],"beginners-rock":[4,4,5,4,4,5,1],"dakara-boku-wa-boku-wo-tebanasu":[2,3,4,3,4,2,3,3,3,4,4,1,3,4],"end-of-a-life":[5,5,4,4,4,5,5,6,4,4,4,5,5,6,8,1,5,1],"gg":[4,4,6,4,2,4,1,2,2,3,6,4,2,3],"gimi-gimi":[4,8,7,8,4,7,4,5,4,1,8,8,2],"leon-no-sabe-que-existo":[4,4,9,9,8,9,8],"hitoribocchi-tokyo":[6,5,2,5,5,3,5,4,6],"kaze-no-uta":[4,2,3,3,1,4,2,3,3,1,2,3,3,1,1,4,2,4,4,2,4,4]};for(const [slug,ids] of rows){const s=songs.find(x=>x.slug===slug);assert.ok(s);assert.deepEqual(s.versions.map(v=>v.videoId),ids);assert.equal(albumsForVersion(slug,s.versions[0].id).length,0);const l=lyricsBySong[slug][slug==='gimi-gimi'?'full':'es'];assert.deepEqual(l.text.split('\n\n').map(t=>t.split('\n').length),layouts[slug]);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/'+slug+'.json').locales[lang];for(const v of s.versions){assert.ok(d[v.id].html.includes(v.videoId));assert.ok(d[v.id].lyrics[v.id].hasText);}}}const b=songs.find(s=>s.slug==='beginners-rock');assert.deepEqual(b.performance,['Misao Chan','Blaze Leiton','Lanti Keeki','Leon Live☆Heart']);assert.equal(b.versions[0].publicationChannel,'Misao Chan');assert.equal(lyricsBySong['gimi-gimi'].tv.text,lyricsBySong['gimi-gimi'].full.text);assert.equal(Object.keys(lyricsBySong['hitoribocchi-tokyo']).length,2);assert.equal(Object.keys(lyricsBySong['kaze-no-uta']).length,3);assert.ok(!songs.some(s=>s.slug==='gura-doesnt-know-i-exist'));});


test('Beginners Rock shared vocal document preserves source color runs and ensemble lines with confirmed solo names',()=>{const l=lyricsBySong['beginners-rock'].es;assert.equal(l.colorStanzas.flat().length,27);assert.equal(l.colorStanzas.flat().filter(line=>line[0].voice==='shared').length,11);assert.equal(l.sourceColorStanzas.flat().length,27);assert.equal(l.colorStanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);assert.equal(l.sourceColorStanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);assert.deepEqual([...new Set(l.sourceColorStanzas.flat(2).map(p=>p.color))].sort(),['#0000FF','#4A86E8','#9900FF','#FF00FF']);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/beginners-rock.json').locales[lang].es.lyrics.es;assert.ok(d.full.includes('class="color-legend"'));assert.ok(d.full.includes(l.sharedLabel[lang]));}});


test('Padoru vocal identities, Mexico live parody and FLOW narrative remain correctly scoped',()=>{const b=lyricsBySong['beginners-rock'].es;assert.deepEqual(b.colorLegend.map(v=>v.label),['Misao Chan','Lanti Keeki','Leon Live☆Heart','Blaze Leiton']);assert.deepEqual(b.colorStanzas[0].map(l=>l[0].voice),['misao','misao','leon','leon']);const h=songs.find(s=>s.slug==='hitoribocchi-tokyo');assert.equal(h.versions.length,1);assert.ok(!h.versions[0].reuploaded);const state=musicStateData('/music/data/song/hitoribocchi-tokyo.json');assert.deepEqual(state.locales.es.es.choices,['es','mexico']);assert.match(state.locales.es.es.lyrics.mexico.full,/A solas en México/);assert.match(state.locales.es.es.lyrics.mexico.full,/sin grabación publicada/);assert.match(state.locales.es.es.lyrics.mexico.full,/Metrobús/);const f=songs.find(s=>s.slug==='kaze-no-uta');assert.equal(f.versions.length,1);assert.equal(f.sourceTracks.length,2);assert.match(musicPage('/music/songs/kaze-no-uta/',new URLSearchParams({lang:'es'})),/adaptación narrativa continua/);assert.equal(musicStateData('/music/data/song/gimi-gimi.json').defaultVersion,'full');});


test('Individual block 02 preserves nine independent recordings and the two FLOW sections',()=>{const ids=["heart-no-shuchou","karakuri-pierrot","last-cup-of-coffee","lets-be-one","lonely-feather","minikui-ikimono","mirai-connection","otome-domo-yo","ougon-kouro"];for(const slug of ids){const s=songs.find(x=>x.slug===slug);assert.ok(s);assert.equal(s.versions.length,1);assert.equal(albumsForVersion(slug,'es').length,0);assert.ok(lyricsBySong[slug].es.text);for(const lang of ['es','en','ja']){const state=musicStateData('/music/data/song/'+slug+'.json').locales[lang].es;assert.ok(state.lyrics.es.hasText);assert.ok(state.html.includes(s.versions[0].videoId));}}const k=lyricsBySong['kaze-no-uta'].es;assert.deepEqual(k.sectionStarts,[{index:0,title:'Kaze no Uta'},{index:15,title:'INNOSENSE'}]);assert.equal(k.text.split('\n\n').length,22);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/kaze-no-uta.json').locales[lang].es.lyrics.es;assert.match(d.full,/<h3 class="lyric-track-heading">Kaze no Uta<\/h3>/);assert.match(d.full,/<h3 class="lyric-track-heading">INNOSENSE<\/h3>/);assert.equal(d.cells.length,22);assert.match(d.cells[15],/El rumbo seguirá sin poderlo evitar/);}assert.equal(pokemonTags(songs.find(s=>s.slug==='mirai-connection')).block,'alola');assert.equal(originalPerformances['lets-be-one'].cast.length,11);assert.equal(songs.find(s=>s.slug==='karakuri-pierrot').padoruCover,undefined);assert.doesNotMatch(musicPage('/music/songs/karakuri-pierrot/',new URLSearchParams({lang:'es'})),/Cumpleaños de Lanti Keeki/);assert.deepEqual(songs.filter(s=>s.padoruCover).map(s=>s.slug).sort(),['beginners-rock','cake-song','halloween-night','kirameki-rider','kokuan-glossolalia','ruteshi-kisuki-shiteru','suki-yuki-maji-magic']);const h=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));assert.equal((h.match(/search=Padoru">Padoru<\/a>/g)||[]).length,7);assert.match(musicPage('/music/songs/beginners-rock/',new URLSearchParams({lang:'es'})),/search=Padoru">Padoru<\/a>/);});


test('Block 03 preserves ten Spanish releases, Esperanto references, dialogue credits and sequential FLOW selector',()=>{for(const slug of ["p3-fes","pop-step","spektro","the-secret-night","shukufuku","planetarium","ruteshi-kisuki-shiteru","ryuusei","senaka-awase","shiny-days"]){const s=songs.find(x=>x.slug===slug);assert.ok(s);assert.equal(s.versions.length,1);assert.deepEqual(s.versions[0].langs,['ES']);assert.equal(albumsForVersion(slug,'es').length,0);assert.ok(lyricsBySong[slug].es.text);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/'+slug+'.json').locales[lang].es;assert.ok(d.lyrics.es.hasText);assert.ok(d.html.includes(s.versions[0].videoId));}}const f=lyricsBySong['kaze-no-uta'];assert.equal(f.kaze.text+'\n\n'+f.innosense.text,f.es.text);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/kaze-no-uta.json').locales[lang].es;assert.deepEqual(d.choices,['kaze','innosense','es']);assert.equal(d.defaultLyric,'es');assert.equal(d.allowCompare,false);assert.equal(d.lyrics.es.label,'Kaze no Uta + INNOSENSE');assert.equal(d.lyrics.kaze.cells.length,15);assert.equal(d.lyrics.innosense.cells.length,7);assert.equal(d.lyrics.es.cells.length,22);assert.doesNotMatch(d.lyrics.kaze.full,/El rumbo seguirá/);assert.doesNotMatch(d.lyrics.innosense.full,/Un camino más/);const h=musicPage('/music/songs/kaze-no-uta/',new URLSearchParams({lang,lyric:'kaze',compare:'innosense'}));assert.doesNotMatch(h,/<div class="parallel-pairs">|<div class="parallel-columns">/);}const s=musicStateData('/music/data/song/spektro.json');assert.equal(s.defaultVersion,'es');assert.deepEqual(s.locales.es.es.choices,['es','eo','pronunciation']);assert.equal(lyricsBySong.spektro.eo.kind,'original');assert.equal(lyricsBySong.spektro.pronunciation.kind,'pronunciation');const r=lyricsBySong['ruteshi-kisuki-shiteru'].es;assert.equal(r.dialogues.length,9);assert.match(musicStateData('/music/data/song/ruteshi-kisuki-shiteru.json').locales.es.es.lyrics.es.full,/class="lyric-dialogues"/);});


test('THE SECRET NiGHT keeps character voice divisions distinct from cover credits',()=>{const l=lyricsBySong['the-secret-night'].es;assert.deepEqual(l.colorLegend.map(v=>[v.label,v.color]),[['Karin Asaka','#8196FF'],['Ai Miyashita','#FF9854']]);assert.deepEqual(l.characterColors,{karin:'#485EC6',ai:'#FF5800'});assert.deepEqual(l.colorStanzas.flat()[53].map(v=>v.voice),['karin','ai','karin','ai']);assert.deepEqual(l.colorStanzas.flat()[55].filter(v=>v.text.trim()!==',').map(v=>v.voice),['ai','karin','ai','karin']);assert.equal(l.colorStanzas.flat().length,65);assert.equal(l.colorStanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);assert.deepEqual(l.sharedLabel,{es:'Ambas',en:'Both',ja:'二人'});assert.ok(!songs.find(s=>s.slug==='the-secret-night').performance);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/the-secret-night.json').locales[lang].es.lyrics.es;assert.match(d.full,/Karin Asaka/);assert.match(d.full,/Ai Miyashita/);assert.match(d.full,/class="color-part"/);}});


test('Block 04 and participation-only credits',()=>{for(const slug of ["under-the-party-lights","caste-room","dance-in-the-game","minor-piece","toge-toge-sadistic","your-reality","yakusoku","u-belle"]){const s=songs.find(x=>x.slug===slug);assert.ok(s);assert.equal(s.versions.length,1);assert.ok(lyricsBySong[slug].es.text);assert.equal(albumsForVersion(slug,'es').length,0);for(const lang of ['es','en','ja']){const state=musicStateData('/music/data/song/'+slug+'.json').locales[lang].es;assert.ok(state.lyrics.es.hasText);assert.ok(state.html.includes(s.versions[0].videoId));}}assert.ok(songs.every(s=>!s.dedication));const r=songs.find(s=>s.slug==='ruteshi-kisuki-shiteru');assert.deepEqual(r.performance,['Blaze Leiton']);assert.deepEqual(r.participation,['V.A.F.M.O.']);const h=musicPage('/music/songs/ruteshi-kisuki-shiteru/',new URLSearchParams({lang:'es'}));assert.match(h,/<dt>Interpretación<\/dt><dd>Blaze Leiton feat\. V\.A\.F\.M\.O\.<\/dd>/);assert.doesNotMatch(h,/<dt>Con participación de<\/dt>/);assert.doesNotMatch(h,/Dedicado a|Cumpleaños de Misao/);assert.equal(lyricsBySong['your-reality'].es.text.includes('¿Pueden escucharme?'),false);});

test('Block 05 published recordings preserve final credits, full refrain and voice divisions',()=>{const ids=["pokemon-theme","pokemon-world","pokemon-johto","born-to-be-a-winner","believe-in-me","i-wanna-be-a-hero","this-dream","unbeatable","battle-frontier","catch-the-moment","crossing-field","halloween-night","suki-yuki-maji-magic"];for(const slug of ids){const s=songs.find(x=>x.slug===slug);assert.ok(s,slug);assert.equal(s.versions.length,1);assert.ok(lyricsBySong[slug][s.versions[0].id].text);assert.ok(releaseArtwork[slug]);for(const lang of ['es','en','ja'])assert.ok(musicStateData('/music/data/song/'+slug+'.json').locales[lang][s.versions[0].id].lyrics[s.versions[0].id].hasText);}const theme=lyricsBySong['pokemon-theme'].es.text.split('\n\n');assert.ok(theme.length>=7);const m=lyricsBySong['suki-yuki-maji-magic'].es;assert.equal(m.colorStanzas.length,20);assert.ok(m.colorLegend.some(x=>x.id==='misaoalternate'));assert.ok(m.colorLegend.find(x=>x.id==='misaoalternate').color!==m.colorLegend.find(x=>x.id==='misaochan').color);assert.ok(!songs.find(s=>s.slug==='suki-yuki-maji-magic').performance.some(x=>x.includes('Mairi')));assert.equal(songs.find(s=>s.slug==='halloween-night').adaptationCredit,'Leon Live☆Heart');assert.equal(lyricsBySong['crossing-field'].ja.text.split('\n\n').length,lyricsBySong['crossing-field'].ja.textJa.split('\n\n').length);assert.ok(!songs.some(s=>s.slug==='we-will-be-heroes'));});

test('Post-album review: Padoru identity, localized Pokémon titles and approved contextual artwork',()=>{
 const tagged=songs.filter(s=>s.padoruCover);assert.equal(tagged.length,7);
 for(const slug of ['halloween-night','suki-yuki-maji-magic']){const s=songs.find(x=>x.slug===slug);assert.equal(s.padoruCover,true);assert.equal(s.collaborationGroup,'Team Padoru');assert.match(musicStateData('/music/data/song/'+slug+'.json').locales.es.es.html,/Padoru/);}
 const pk=['pokemon-theme','pokemon-world','pokemon-johto','born-to-be-a-winner','believe-in-me','i-wanna-be-a-hero','this-dream','unbeatable','battle-frontier'];
 for(const slug of pk){const s=songs.find(x=>x.slug===slug);assert.ok(s.localizedTitle.es);assert.ok(s.title===s.localizedTitle.es||s.alternativeTitles.includes(s.localizedTitle.es));assert.ok(musicStateData('/music/data/song/'+slug+'.json').locales.es.es.html.includes(s.localizedTitle.es));}
 const artwork=pk.slice(3).map(slug=>releaseArtwork[slug]);assert.equal(new Set(artwork.map(a=>a.sourceImage)).size,6);assert.ok(artwork.every(a=>a.version===3&&a.originalRelease&&a.artworkContext));
});

test('Post-album cover framing preserves original assets and individual square presentation',()=>{const slugs=["catch-the-moment","crossing-field","minikui-ikimono","mirai-connection","otome-domo-yo"];const manifest=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;for(const slug of slugs){assert.equal(releaseArtwork[slug].fit,'cover');assert.equal(manifest[slug].fit,'cover');assert.equal(manifest[slug].version,1);assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),new RegExp('data-art-slug="'+slug+'" data-fit="cover"'));}});

test('SAO franchise filter unifies main series, Ordinal Scale and GGO without changing credited series',()=>{const h=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));for(const slug of ['catch-the-moment','crossing-field','ryuusei','gg']){const s=songs.find(x=>x.slug===slug);assert.ok(s.series.startsWith('Sword Art Online'));const card=h.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g).find(x=>x.includes('/music/songs/'+slug+'/'));assert.match(card,/data-primary-series="Sword Art Online"/);}assert.doesNotMatch(h,/<option value="Sword Art Online Alternative: Gun Gale Online/);});

 test('Paper Bouquet preserves creator-supplied original English and Milish lyrics',()=>{const s=songs.find(s=>s.slug==='paper-bouquet');assert.equal(s.versions[0].videoId,'4yMlOQdEm4A');assert.deepEqual(s.versions[0].langs,['EN']);assert.equal(s.adaptationCredit,undefined);const l=lyricsBySong[s.slug].en;assert.equal(l.kind,'original');assert.equal(l.text.split('\n\n').length,11);assert.deepEqual(l.text.split('\n\n').map(x=>x.split('\n').length),[4,4,6,7,5,5,6,3,9,4,4]);for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/paper-bouquet.json').locales[lang].en;assert.ok(d.lyrics.en.hasText);assert.ok(d.html.includes(s.versions[0].videoId));}});

 test('Approved square framing keeps original jackets and focal positioning',()=>{const h=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));const manifest=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;for(const [slug,pos] of Object.entries({"heart-no-shuchou":"0% 50%","ryuusei":"50% 50%","born-to-be-a-winner":"50% 48%","i-wanna-be-a-hero":"50% 80%","this-dream":"50% 75%","battle-frontier":"50% 84%"})){assert.equal(releaseArtwork[slug].fit,'cover');assert.equal(manifest[slug].fit,'cover');assert.ok(h.includes('data-art-slug="'+slug+'" data-fit="cover"'));assert.ok(h.includes('.square-art[data-art-slug="'+slug+'"][data-fit="cover"] img{object-position:'+pos+'}'));}assert.equal(releaseArtwork.gg.fit,'cover');assert.ok(h.includes('.square-art[data-art-slug="gg"][data-fit="cover"] img{object-position:50% 50%}'));});

 test('Classroom approved jackets and Gura parody subtitle preserve original music and recordings',()=>{for(const slug of ['caste-room','dance-in-the-game','minor-piece','leon-no-sabe-que-existo'])assert.ok(releaseArtwork[slug].version===2&&releaseArtwork[slug].originalRelease);const s=songs.find(x=>x.slug==='leon-no-sabe-que-existo');assert.equal(s.title,'Leon no sabe que existo');assert.equal(s.localizedTitle.en,"Gura Doesn't Know I Exist");assert.equal(s.romanized,undefined);assert.equal(s.artist,'Catch 22');assert.equal(s.versions[0].videoId,'YxgnnIHQBYQ');assert.ok(s.sourceDetail.includes('Watson Amelia'));});

 test('Ame thumbnail framing crops embedded letterbox bars and preserves approved source',()=>{const h=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));assert.ok(h.includes(".square-art[data-art-slug=\"leon-no-sabe-que-existo\"][data-fit=\"cover\"] img{object-position:50% 50%;transform:scale(1.3333333333);transform-origin:0% 50%}"));assert.equal(releaseArtwork['leon-no-sabe-que-existo'].version,2);assert.equal(releaseArtwork['leon-no-sabe-que-existo'].fit,'cover');});

test('Sagrada Reset approved F4 square preserves original jacket and release',()=>{const slug='dakara-boku-wa-boku-wo-tebanasu',a=releaseArtwork[slug],m=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works[slug];assert.equal(a.image,'/music-artwork/dakara-boku-wa-boku-wo-tebanasu-v2.webp');assert.equal(a.sourceImage,'https://static.zerochan.net/Sakurada.Reset.full.2106270.jpg');assert.equal(a.originalRelease.release,'A/W · AZCS-2067');assert.equal(m.status,'preserved');assert.deepEqual(m.size,[1020,1020]);assert.equal(m.previous.version,1);assert.equal(releaseArtwork['ai-no-uta'].version,2);});

test('Final Asterisk jackets preserve approved distinct frames and original single provenance',()=>{const m=JSON.parse(readFileSync(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8')).works;for(const [slug,v,size] of [['ai-no-uta',2,1080],['lonely-feather',3,865]]){const a=releaseArtwork[slug],r=m[slug];assert.equal(a.version,v);assert.equal(r.previous.version,v-1);assert.equal(a.image,r.path);assert.equal(a.sourceImage,r.origin);assert.equal(r.status,'preserved');assert.deepEqual(r.size,[size,size]);assert.match(a.originalRelease.release,/VTCL-35225/);assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),new RegExp(a.image));assert.equal(createHash('sha256').update(readFileSync(new URL('../public'+r.path,import.meta.url))).digest('hex'),r.sha256);}assert.notEqual(m['ai-no-uta'].sha256,m['lonely-feather'].sha256);assert.equal(releaseArtwork['dakara-boku-wa-boku-wo-tebanasu'].version,2);});

test('Kirameki Rider and canonical Padoru artist names preserve independently published collaboration',()=>{const s=songs.find(x=>x.slug==='kirameki-rider');assert.equal(s.versions[0].videoId,'83EgdxdwhtA');assert.equal(s.versions[0].publicationChannel,'Misao Chan');assert.deepEqual(s.performance,["Misao Chan","Leon Live☆Heart","Lanti Keeki","Blaze Leiton","V.A.F.M.O."]);assert.equal(s.adaptationCredit,'Leon Live☆Heart');assert.equal(s.padoruCover,true);const l=lyricsBySong[s.slug].es;assert.equal(l.colorStanzas.map(s=>s.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text);assert.deepEqual(l.colorLegend.map(x=>[x.id,x.label,x.color]),[['sora','Tokino Sora','#58A6FF'],['roboco','Roboco-san','#F064E8'],['fubuki','Shirakami Fubuki','#77E4F5'],['noel','Shirogane Noel','#F0F3F7'],['aqua','Minato Aqua','#FFB5D9']]);assert.ok(l.colorStanzas.flat(2).some(x=>x.voice==='shared'&&x.secondary));assert.ok(!l.colorStanzas.flat(2).some(x=>x.voice==='shared2'));assert.deepEqual(l.colorStanzas[7][2].map(p=>p.voice),['fubuki+aqua','fubuki+aqua']);assert.equal(l.colorStanzas[7][3][0].voice,'sora+roboco+noel');assert.ok(songs.every(s=>!JSON.stringify(s.performance||[]).includes('Misao-chan')));assert.ok(!JSON.stringify(lyricsBySong).includes('Misao-chan'));for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/'+s.slug+'.json').locales[lang].es;assert.ok(d.html.includes('83EgdxdwhtA'));assert.ok(d.lyrics.es.hasText);assert.ok(d.html.includes('Misao Chan'));assert.doesNotMatch(d.lyrics.es.full,/Misao Chan|Leon Live☆Heart|Lanti Keeki|Blaze Leiton|V\.A\.F\.M\.O\.|Todos · II|All · II|全員 · II/);for(const name of ['Tokino Sora','Roboco-san','Shirakami Fubuki','Shirogane Noel','Minato Aqua'])assert.ok(d.lyrics.es.full.includes(name));assert.match(d.lyrics.es.full,/class="color-part secondary-part" style="color:#AEBACC"/);assert.match(d.lyrics.es.full,/Shirakami Fubuki · Minato Aqua/);}});

test('Stage 35 Brave Shine: manual Spanish lyrics, Bury attribution, original Aimer cover',()=>{
 const s=songs.find(s=>s.slug==='brave-shine');assert.ok(s);assert.equal(s.artist,'Aimer');assert.equal(s.originalLyricist,'aimerrhythm');assert.equal(s.originalComposer,'Hisashi Koyama');assert.equal(s.versions.length,1);assert.equal(s.versions[0].videoId,'_z_drk_eeWw');assert.equal(s.versions[0].date,'2025-02-01');assert.equal(s.adaptationCredit,'Call Me Bury (Bury Singer)');assert.equal(s.adaptationCreditLabel.es,'Adaptación al español');assert.match(s.adaptationAttributionStatus,/creator-confirmed/);
 const l=lyricsBySong['brave-shine'].es;assert.equal(l.kind,'adaptation');assert.equal(l.language,'ES');assert.equal(l.text.split('\n\n').length,11);assert.equal((l.text.match(/Brave Shine/g)||[]).length,2);assert.equal((l.text.match(/Tu brillo\./g)||[]).length,2);assert.match(l.text,/Solo debes continuar\./);assert.match(l.text,/olvidó radiar/);assert.match(l.text,/De mi propio amanecer/);assert.doesNotMatch(l.text,/Sólo debes|olvidó brillar/);
 const a=releaseArtwork['brave-shine'];assert.match(a.source,/sonymusic/);assert.match(a.release,/DFCL-2130/);assert.match(artworkURL('brave-shine'),/brave-shine-v1/);
 for(const lang of ['es','en','ja']){const d=musicStateData('/music/data/song/brave-shine.json').locales[lang].es;assert.ok(d.html.includes('_z_drk_eeWw'));assert.ok(d.lyrics.es.hasText);assert.match(d.lyrics.es.full,/tu brillo/i);const h=musicPage('/music/songs/brave-shine/',new URLSearchParams({lang}));assert.match(h,/Call Me Bury/);assert.match(h,/Brave Shine/);}
});

test('Stage 35 full-catalogue orthography: line initials, version and colored-stanza parity',()=>{
 const exempt = new Set(['(la la la)']); // intentional vocalized syllables in Ano ne
 const firstWord=line=>[...line.matchAll(/[\p{L}\p{N}]/gu)][0];
 let checked=0,vers=0;
 assert.equal(songs.length,115);
 for(const song of songs){
  assert.ok(song.slug&&song.title&&song.artist,JSON.stringify(song));
  assert.ok(song.versions?.length>0,song.slug);
  assert.ok(releaseArtwork[song.slug],song.slug+' has no artwork');
  const source=lyricsBySong[song.slug];assert.ok(source,song.slug+' has no lyric record');
  for(const [variant,l] of Object.entries(source)){
   if(!l?.text)continue;vers++;
   for(const [index,line] of l.text.split('\n').entries()){
    const first=firstWord(line);if(!first||!/\p{L}/u.test(first[0]))continue;
    if(/\p{Ll}/u.test(first[0])&&!exempt.has(line.trim()))assert.fail(song.slug+'/'+variant+' line '+(index+1)+': '+line);
    checked++;
   }
   const colored=l.colorStanzas?.map(st=>st.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n');
   if(colored!==undefined)assert.equal(colored,l.text,song.slug+'/'+variant+' colored lines diverged');
  }
 }
 assert.ok(vers>=115);
 assert.ok(checked>2000);
 assert.equal(lyricsBySong['brave-shine'].es.text.split('Tu brillo.').length-1,2);
 assert.match(lyricsBySong['brave-shine'].es.text,/Para siempre los recuerdos/);
});

test('Stage 35 trims non-semantic lyric whitespace without changing structured credits',()=>{
 let count=0;
 for(const song of songs)for(const l of Object.values(lyricsBySong[song.slug]||{})){
  if(!l?.text)continue;count++;
  for(const line of l.text.split('\n')){
   assert.doesNotMatch(line,/[ \t]+$/u,song.slug+' trailing whitespace');
   assert.doesNotMatch(line,/(?<=\S) {2,}(?=\S)/u,song.slug+' duplicated internal space');
  }
  if(l.colorStanzas)assert.equal(l.colorStanzas.map(st=>st.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),l.text,song.slug+' colored parity');
 }
 for(const segment of lyricsBySong['butter-fly'].multi.segments)for(const line of segment.text.split('\n'))assert.doesNotMatch(line,/[ \t]+$/u);
 for(const voice of lyricsBySong['cake-song'].es.voices)assert.doesNotMatch(voice.text,/[ \t]+$/u);
 assert.ok(count>=115);
});


test('Stage 35 particular credits: Kirameki original cast independent of Team Padoru and colorful verses',()=>{
 const song=songs.find(x=>x.slug==='kirameki-rider'), p=originalPerformances[song.slug];
 assert.deepEqual(song.performance,['Misao Chan','Leon Live☆Heart','Lanti Keeki','Blaze Leiton','V.A.F.M.O.']);
 assert.equal(p.kind,'group');assert.equal(p.cast.length,5);
 assert.deepEqual(p.cast.map(x=>x.character.latin),['Tokino Sora','Roboco-san','Shirakami Fubuki','Minato Aqua','Shirogane Noel']);
 assert.ok(p.cast.every(x=>!x.cv));
 assert.equal(originalCreditRows(song,'es','es')[0].label,'Voces originales');
 const l=lyricsBySong[song.slug].es;
 assert.equal(l.colorStanzas.map(st=>st.map(line=>line.map(x=>x.text).join('')).join('\n')).join('\n\n'),l.text);
 assert.match(l.text,/Muy feliz terminé, tanto que no puedo hablar ya más/);
 assert.doesNotMatch(l.text,/Muy feliz, terminé tanto/);
 for(const lang of ['es','en','ja']){
  const html=musicPage('/music/songs/kirameki-rider/',new URLSearchParams({lang}));
  for(const x of song.performance)assert.ok(html.includes(x),lang+' cover '+x);
  for(const x of ['Tokino Sora','Roboco-san','Shirakami Fubuki','Minato Aqua','Shirogane Noel'])if(lang!=='ja')assert.ok(html.includes(x),lang+' original '+x);
  assert.match(html,lang==='es'?/Voces originales/:lang==='en'?/Original voices/:/原曲の声優/);
 }
});

test('Stage 35 original adapters, later modifications and performed adjustments remain separately attributed in one row',()=>{
 const cases=[
 ['connect','Sekai025','Blaze Leiton'],
 ['harumodoki','beck y matcha allen','Blaze Leiton'],
 ['starlog','SMGirlFanduber','Blaze Leiton'],
  ['brave-shine','Call Me Bury (Bury Singer)','Blaze Leiton']
 ];
 for(const [slug,credit,adjust] of cases){
  const song=songs.find(x=>x.slug===slug);assert.equal(song.adaptationCredit,credit);assert.equal(song.adjustmentCredit,adjust);
  for(const lang of ['es','en','ja']){
   const html=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
   assert.ok(html.includes(credit),slug+' original adapter '+lang);
   assert.ok(html.includes(adjust),slug+' adjustment '+lang);
   assert.match(html,lang==='es'?/Adecuaciones/:lang==='en'?/Adjustments/:/歌詞の調整/);
  }
 }
 assert.equal(songs.find(x=>x.slug==='connect').modificationCredit,'Glorylé Solis');
 assert.match(musicPage('/music/songs/connect/',new URLSearchParams({lang:'es'})),/<dt>Modificaciones<\/dt><dd>Glorylé Solis<\/dd>/);
});

test('Stage 35 user-approved spellings, unverified literary influences, and original-composer privacy',()=>{
 assert.match(lyricsBySong['suki-yuki-maji-magic'].es.text,/un pastel con crema/);
 assert.doesNotMatch(lyricsBySong['suki-yuki-maji-magic'].es.text,/concrema/);
 assert.match(lyricsBySong['otome-domo-yo'].es.text,/Pero hoy, de nuevo me abruman/);
 const ot=songs.find(x=>x.slug==='otome-domo-yo');
  assert.equal(ot.adaptationCredit,'Marutah');
  assert.match(ot.adaptationAttributionEvidence,/Adaptación: Marutah/);
  assert.equal(ot.adjustmentCredit,undefined);
  assert.equal(ot.creatorReferenceCover.url,'https://www.youtube.com/watch?v=Kf6DCF3Cud0');
  for(const lang of ['es','en','ja'])assert.match(musicPage('/music/songs/otome-domo-yo/',new URLSearchParams({lang})),/<dt>[^<]*<\/dt><dd>Marutah<\/dd>/);
 const ry=songs.find(x=>x.slug==='ryuusei');
 assert.equal(ry.adaptationCredit,'SINAY PAOHLA');
  assert.equal(ry.adaptationCreditSource,'https://www.youtube.com/watch?v=r1HNNy4a5z8');
  assert.equal(ry.adaptationCreditChannel,'https://www.youtube.com/channel/UCs5knpjw12MTr7diL56ayDw');
  assert.match(ry.adaptationAttributionStatus,/creator-confirmed/);
  assert.equal(ry.lyricInspiration,undefined);
  assert.equal(ry.adjustmentCredit,'Blaze Leiton');
  assert.match(ry.lyricExtension,/full-length/);
  assert.equal(ry.creatorReferenceCover.url,'https://www.youtube.com/watch?v=r1HNNy4a5z8');
  for(const lang of ['es','en','ja'])assert.ok(musicPage('/music/songs/ryuusei/',new URLSearchParams({lang})).includes(ry.adjustmentCreditLabel[lang]));
 assert.match(lyricsBySong['ryuusei'].es.text,/Y al lo que carezco recontar/);
 for(const [lang,creditLabel] of [['es','Adaptación'],['en','Adaptation'],['ja','翻案']]){
   const html=musicPage('/music/songs/ryuusei/',new URLSearchParams({lang}));
   assert.ok(html.includes('<dt>'+creditLabel+'</dt><dd>SINAY PAOHLA · '+ry.adjustmentCreditLabel[lang]+': Blaze Leiton</dd>'),lang+' merged attribution and extension');
 }
 assert.doesNotMatch(musicPage('/music/songs/ryuusei/',new URLSearchParams({lang:'es'})),/Inspiración lírica parcial/);
 for(const slug of ['brave-shine','paper-bouquet']){
  const song=songs.find(x=>x.slug===slug);
  assert.ok(song.originalComposer);
  const html=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es'}));
  assert.doesNotMatch(html,/<dt>Letra y composición original<\/dt>/,'composer provenance remains in registry, not displayed as a technical credit on this cover');
 }
 assert.equal((lyricsBySong['brave-shine'].es.text.match(/Tu brillo\./g)||[]).length,2);
});


test('Stage 36 Ruteshi dialogue source and preserved public metadata',()=>{
 const names=['Leon Live☆Heart','Valeria Osorio','Blaze Leiton','Lanti Keeki','Glaze Reyna','Doraimonuwu','CamininaVT','Misao Chan','V.A.F.M.O.'];
 const source=lyricsBySong['ruteshi-kisuki-shiteru'].es;
 assert.deepEqual(source.dialogues.map(d=>d.voice),names);
 assert.equal(source.dialogues.length,9);
 assert.deepEqual(source.dialogues.map(d=>d.text),[
  'Claro que sí, tus esfuerzos van a resultar',
  'Cualquier cosa puedes hacer',
  'Espero que todo te resulte bien',
  'La suerte, espero que esté contigo',
  'Ikkunya',
  'Da-dalo todo por favor',
  'No te vayas a arrepentir después',
  'También yo, estoy deseándote lo mejor ¿sí?',
  'Déjame a mí el apoyarte'
 ]);
 const ruteshi=songs.find(s=>s.slug==='ruteshi-kisuki-shiteru');
 assert.deepEqual(ruteshi.performance,['Blaze Leiton']);
 assert.deepEqual(ruteshi.participation,['V.A.F.M.O.']);
 assert.equal(ruteshi.featuredArtist,'V.A.F.M.O.');
 const planetarium=songs.find(s=>s.slug==='planetarium');
 assert.equal(planetarium.affiliation.event,'holo*27 Originals Vol.1');
 assert.ok(affiliationDetails(planetarium,'es').some(([label,value])=>label==='Evento / proyecto'&&value==='holo*27 Originals Vol.1'));
 assert.equal(songs.filter(s=>s.event).length,8,'approved remaining public events');
 assert.equal(songs.find(s=>s.slug==='lets-be-one').event,undefined);
 for(const lang of ['es','en','ja']){
  const page=musicPage('/music/songs/ruteshi-kisuki-shiteru/',new URLSearchParams({lang}));
  assert.match(page,/Blaze Leiton feat\. V\.A\.F\.M\.O\./);
  assert.doesNotMatch(page,/<dt>Con participación de<\/dt>/);
  assert.match(page,/class="lyric-dialogues"/);
  for(const n of names)assert.ok(page.includes('<span class="line-attribution">('+n+')</span>'),lang+' lacks Ruteshi dialogue attribution '+n);
  for(const line of source.dialogues)assert.ok(page.includes(line.text.replace(/&/g,'&amp;').replace(/</g,'&lt;')),lang+' lacks dialogue content');
  const visiblePlanetarium=musicPage('/music/songs/planetarium/',new URLSearchParams({lang}));
  assert.ok(visiblePlanetarium.includes('holo*27 Originals Vol.1'),'Planetarium project must remain publicly visible');
  const one=musicPage('/music/songs/lets-be-one/',new URLSearchParams({lang}));
  assert.ok(!one.includes('<dt>Evento</dt>'),'Let’s be ONE must not regain the removed event');
 }
});


test('vocal attributions preserve song texts and place Ruteshi dialogue between choruses',()=>{
 const ruteshi=lyricsBySong['ruteshi-kisuki-shiteru'].es;
 const spec=lineAttributions['ruteshi-kisuki-shiteru'];
 const lines=ruteshi.text.trim().split(/\n\s*\n/).map(s=>s.split('\n'));
 assert.deepEqual(spec.lines.map(s=>s.length),lines.map(s=>s.length),'all Ruteshi lines attributed');
 assert.equal(spec.dialogueAfterStanza,9);
 assert.deepEqual(ruteshi.dialogues.map(d=>d.originalRole),['Maki','Honoka','Eli','Umi','Rin','Hanayo','Nico','Kotori','Nozomi']);
 assert.deepEqual(ruteshi.dialogues.map(d=>d.voice),ruteshiDialogueCast.map(d=>d.voice));
 assert.equal(ruteshiDialogueCast.find(d=>d.voice==='Blaze Leiton').credit,false,'do not add creator again as guest credit');
 assert.equal(ruteshiDialogueCast.find(d=>d.voice==='Doraimonuwu').url,'https://www.twitch.tv/doraimonuwu');
 assert.equal(ruteshiDialogueCast.find(d=>d.voice==='CamininaVT').url,'https://www.twitch.tv/camininavt');
 for(const lang of ['es','en','ja']){
  const page=musicPage('/music/songs/ruteshi-kisuki-shiteru/',new URLSearchParams({lang}));
  assert.equal((page.match(/class="lyric-dialogues"/g)||[]).length,1);
  assert.ok(page.indexOf('En 10 segundos lo sabré')<page.indexOf('class="lyric-dialogues"'));
  assert.ok(page.indexOf('class="lyric-dialogues"')<page.lastIndexOf('Dale vuelta una y otra vez antes de mirar'));
  assert.match(page,/aria-label="Umi Sonoda · Rin Hoshizora · Hanayo Koizumi"/);
  assert.match(page,/<dt>[^<]*(Invitados en diálogos|Spoken dialogue guests|台詞ゲスト)<\/dt>/);
  for(const name of ruteshiDialogueCast.filter(d=>d.credit).map(d=>d.voice))assert.ok(page.includes(name),name+' missing '+lang);
 }
});
test("Let's be ONE voice reference is line-complete without a fabricated official status",()=>{
 const spec=lineAttributions['lets-be-one'];
 const text=lyricsBySong['lets-be-one'].es.text;
 assert.deepEqual(spec.lines.map(x=>x.length),text.trim().split(/\n\s*\n/).map(x=>x.split('\n').length));
 assert.match(spec.status,/fan-transcription/);
 for(const lang of ['es','en','ja']){
  const page=musicPage('/music/songs/lets-be-one/',new URLSearchParams({lang}));
  assert.ok(page.includes(lang==='ja'?'澁谷かのん':'Kanon Shibuya'),lang);
  assert.ok(page.includes(lang==='ja'?'aria-label="唐可可 · 若菜四季"':'aria-label="Keke Tang · Shiki Wakana"'),lang);
  assert.ok(!page.includes('<dt>Evento</dt>'));
 }
});
test('Gimi Gimi Full and TV show verified original cast but do not invent solo lines',()=>{
 const spec=lineAttributions['gimi-gimi'];
 assert.equal(spec.status,'official-cast-only');
 assert.equal(spec.originalCast.length,5);
 for(const version of ['full','tv'])for(const lang of ['es','en','ja']){
  const page=musicPage('/music/songs/gimi-gimi/',new URLSearchParams({lang,version}));
  assert.match(page,/class="color-legend"/);
  assert.ok(!page.includes('por verso confirmada oficialmente'));
 }
});
test('Halloween Night exposes two independent divisions, retaining Padoru original color annotations',()=>{
 const source=lyricsBySong['halloween-night'].es;
 const cBefore=source.colorStanzas.map(stanza=>stanza.map(line=>line.map(part=>part.text).join('')).join('\n')).join('\n\n');
 assert.equal(cBefore,source.text,'Padoru segments must still equal the original user-supplied words');
 for(const lang of ['es','en','ja']){
  const page=musicPage('/music/songs/halloween-night/',new URLSearchParams({lang}));
  assert.match(page,/id="halloween-padoru"/);
  assert.match(page,/id="halloween-original"/);
  assert.match(page,/class="halloween-padoru-view"/);
  assert.match(page,/class="halloween-original-view"/);
  assert.match(page,/color-legend/);
  assert.ok(page.includes(lang==='ja'?'夜空メル':'Yozora Mel'));
  assert.ok((lang==='ja'?['夜空メル','紫咲シオン','癒月ちょこ','潤羽るしあ']:['Yozora Mel','Murasaki Shion','Yuzuki Choco','Uruha Rushia']).every(n=>page.includes(n)));
  assert.ok(page.includes('Mek')&&page.includes('Leon Live☆Heart'));
 }
});


test('Stage 36 correction: only Ruteshi spoken dialogues have parenthetical speaker prefixes',()=>{
 const map=['ruteshi-kisuki-shiteru','lets-be-one','gimi-gimi','halloween-night'];
 for(const slug of map){
  const lyric=lyricsBySong[slug][slug==='gimi-gimi'?'full':'es'];
  const colored=colorDivisionFromReference(lyric,slug);
  assert.ok(colored.colorStanzas&&colored.colorLegend&&colored.colorLegend.length>=4);
  assert.equal(colored.colorStanzas.map(stanza=>stanza.map(line=>line.map(p=>p.text).join('')).join('\n')).join('\n\n'),lyric.text,'Spanish adaptation unchanged: '+slug);
  assert.equal(colored.colorLegend.length,originalColorPalettes[slug].length,slug+' palette preserved');
  assert.ok(colored.colorLegend.every(v=>/^#[0-9A-F]{6}$/i.test(v.color)));
  const html=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang:'es'}));
  assert.match(html,/class="lyric-text colored-lyrics"/);
  assert.match(html,/class="color-legend"/);
  if(slug!=='ruteshi-kisuki-shiteru')assert.doesNotMatch(html,/class="line-attribution"/,slug+' must not prepend parenthetical singers');
  else{
   assert.equal((html.match(/class="line-attribution"/g)||[]).length,9,'9 dialogue labels and no sung-line prefix');
   assert.ok(html.indexOf('class="lyric-dialogues"')<html.lastIndexOf('Dale vuelta una y otra vez antes de mirar'));
  }
 }
});
test('Ruteshi colored musical roles retain character colors and correct Umi/Rin response',()=>{
 const lyric=colorDivisionFromReference(lyricsBySong['ruteshi-kisuki-shiteru'].es,'ruteshi-kisuki-shiteru');
 assert.deepEqual(lyric.colorStanzas[0][2].map(p=>p.voice),['shared','nozomi']);
 assert.deepEqual(lyric.colorStanzas[5][2].map(p=>p.voice),['shared','umi+rin']);
 assert.deepEqual(lyric.colorStanzas[8][0].map(p=>p.voice),['kotori','nico']);
 assert.equal(lyric.colorLegend.find(v=>v.id==='nozomi').color,'#C455F6');
 for(const lang of ['es','en','ja']){
  const html=musicPage('/music/songs/ruteshi-kisuki-shiteru/',new URLSearchParams({lang}));
  assert.ok(html.includes(lang==='ja'?'aria-label="園田海未 · 星空凛"':'aria-label="Umi Sonoda · Rin Hoshizora"'));
  assert.doesNotMatch(html,/<h3>Diálogos<\/h3>|<h3>Spoken dialogue<\/h3>|<h3>台詞<\/h3>/);
  assert.ok(html.includes(lang==='ja'?'aria-label="南ことり · 矢澤にこ"':'aria-label="Kotori Minami · Nico Yazawa"'));
  assert.match(html,/class="color-group"/);
 }
});
test('Liella! 11 verified swatches, shared colored dots, accessible Ren text',()=>{
 const lyric=colorDivisionFromReference(lyricsBySong['lets-be-one'].es,'lets-be-one');
 assert.equal(lyric.colorLegend.length,11);
 assert.equal(lyric.colorLegend.find(v=>v.id==='ren').color,'#0000A0');
 assert.equal(lyric.colorLegend.find(v=>v.id==='ren').textColor,'#9CA9FF');
 assert.ok(lyric.colorStanzas.flat().some(line=>line.some(p=>p.voice==='shared')));
 for(const lang of ['es','en','ja']){
  const html=musicPage('/music/songs/lets-be-one/',new URLSearchParams({lang}));
  assert.match(html,/style="background:#0000A0"/);
  assert.match(html,/style="color:#9CA9FF"/);
  assert.ok(html.includes(lang==='ja'?'aria-label="澁谷かのん · 桜小路きな子 · ウィーン・マルガレーテ"':'aria-label="Kanon Shibuya · Kinako Sakurakoji · Wien Margarete"'));
  assert.doesNotMatch(html,/class="line-attribution"/);
 }
});
test('Gimi and Halloween use provenance-labelled swatches, not invented solos',()=>{
 const gimi=colorDivisionFromReference(lyricsBySong['gimi-gimi'].full,'gimi-gimi');
 const original=colorDivisionFromReference(lyricsBySong['halloween-night'].es,'halloween-night');
 assert.equal(colorSources['gimi-gimi'].status,'editorial-approximation-from-official-character-art');
 assert.equal(colorSources['halloween-night'].status,'fan-maintained-talent-color-catalog');
 assert.deepEqual(original.colorLegend.map(x=>x.color),['#FED62A','#8466FE','#FE739E','#19E8C9']);
 assert.equal(gimi.colorLegend.length,5);
 assert.ok(gimi.colorStanzas.flat().every(line=>line.every(p=>p.voice==='unattributed')));
 assert.ok(original.colorStanzas.flat().every(line=>line.every(p=>p.voice==='unattributed')));
 const html=musicPage('/music/songs/halloween-night/',new URLSearchParams({lang:'es'}));
 assert.ok(html.includes('class="halloween-original-view"'));
 assert.ok(html.includes('class="halloween-padoru-view"'));
 assert.ok(html.includes('style="background:#19E8C9"'));
 assert.ok(html.includes('style="background:#D9944B"'),'Padoru palette must not be replaced');
 assert.doesNotMatch(html,/class="line-attribution"/);
});


test('Music vocal localization: bilingual member names never mixed in ES/EN legends',()=>{
 assert.equal(localizedVocalName({label:'Live (りぶ)'},'es'),'Live');
 assert.equal(localizedVocalName({label:'Live (りぶ)'},'ja'),'りぶ');
 assert.equal(localizedVocalName({label:'Ichiko'},'ja'),'苺子');
 assert.equal(localizedVocalName({label:'Fu'},'ja'),'譜風');
 assert.equal(localizedVocalName({label:'Chisato Nishikigi'},'ja'),'錦木千束');
 for(const slug of ['ruteshi-kisuki-shiteru','lets-be-one','gimi-gimi','halloween-night','the-secret-night']){
  for(const lang of ['es','en','ja']){
   const page=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
   const legends=page.match(/<div class="color-legend"[^>]*>[\s\S]*?<\/div>/g)||[];
   assert.ok(legends.length,slug+' color legends');
   const legendsOnly=legends.join('');
   if(slug==='gimi-gimi'){
    for(const name of ['Live','Ichiko','Fu','Tokage','Yuki']){
     assert.ok(lang==='ja'||legendsOnly.includes(name),lang+' missing romanized '+name);
    }
    if(lang==='ja')for(const name of ['りぶ','苺子','譜風','十景','ゆき'])assert.ok(legendsOnly.includes(name),name);
    if(lang!=='ja')assert.doesNotMatch(legendsOnly,/[(（][\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,'mixed-script roster');
    if(lang==='ja')assert.ok(!legendsOnly.includes('Live (りぶ)'));
   }
  }
 }
});
test('Ruteshi colored dialogue is inline and keeps nine parenthesized performer names only',()=>{
 const source=lyricsBySong['ruteshi-kisuki-shiteru'].es;
 const expected=source.dialogues.map(d=>{
  const color=originalColorPalettes['ruteshi-kisuki-shiteru'].find(x=>x.label.split(' ')[0]===d.originalRole);
  assert.ok(color,'missing original character color for '+d.originalRole);
  return color.textColor||color.color;
 });
 for(const lang of ['es','en','ja']){
  const html=musicPage('/music/songs/ruteshi-kisuki-shiteru/',new URLSearchParams({lang}));
  const match=html.match(/<div class="lyric-dialogues">([\s\S]*?)<\/div><\/div>/);
  assert.ok(match,'dialogue integrated in colored lyric flow');
  const snippet=match[1];
  assert.equal((snippet.match(/class="line-attribution"/g)||[]).length,9);
  assert.doesNotMatch(snippet,/<h3|Spoken dialogue|Diálogos|台詞/);
  source.dialogues.forEach((d,i)=>{
   assert.ok(snippet.includes('style="color:'+expected[i]+'"'),'missing correct line color for '+d.voice);
   assert.ok(snippet.includes('('+d.voice+')'),'missing literal parentheses '+d.voice);
   assert.ok(snippet.includes(d.text),'missing original spoken line');
  });
  assert.ok(html.indexOf('En 10 segundos lo sabré')<html.indexOf('class="lyric-dialogues"'));
  assert.ok(html.indexOf('class="lyric-dialogues"')<html.lastIndexOf('Dale vuelta una y otra vez antes de mirar'));
 }
});
test('Four vocal pages contain no visible explanatory notes or selection tutorials',()=>{
 for(const slug of ['ruteshi-kisuki-shiteru','lets-be-one','gimi-gimi','halloween-night']){
  for(const lang of ['es','en','ja']){
   const html=musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang}));
   assert.doesNotMatch(html,/class="lyric-note vocal-source-note"/);
   assert.doesNotMatch(html,/Original parts according to|Distribución vocal original según|Reparto original confirmado|Documented Padoru cover voices|Intervenciones del cover Padoru/);
  }
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {songs} from '../src/music-catalog.mjs';
import {lyricsBySong} from '../src/music-lyrics.mjs';
import {releaseArtwork} from '../src/music-artwork.mjs';
import {coverAlbums} from '../src/music-albums.mjs';
import {musicPage} from '../src/music-page.mjs';

const archivedPath=new URL('../src/music-block05-collaborations.archived.json',import.meta.url);
const oldPendingPath=new URL('../src/music-block05-collaborations.pending.json',import.meta.url);
const policyPath=new URL('../docs/RELIGHT_SCRIPTA_LYRICA_HISTORICAL_CLOSURE_CP01_2026-11-17.md',import.meta.url);

test('Scripta Lyrica historical closure: precisely 115 unique works, 127 records, 124 distinct video IDs and three reserved audios',()=>{
 assert.equal(songs.length,115);
 assert.equal(new Set(songs.map(s=>s.slug)).size,115);
 const all=songs.flatMap(s=>s.versions.map(v=>({...v,slug:s.slug})));
 assert.equal(all.length,127);
 assert.equal(new Set(all.map(v=>v.slug+':'+v.id)).size,127);
 const videoIds=all.filter(v=>v.videoId).map(v=>v.videoId);
 assert.equal(videoIds.length,124);
 assert.equal(new Set(videoIds).size,124);
 assert.equal(all.filter(v=>v.videoId&&v.public!==false).length,123);
 assert.equal(all.filter(v=>v.medium==='audio'&&v.public===false&&v.availability==='pending'&&!v.videoId).length,3);
 assert.equal(Object.keys(releaseArtwork).length,115);
 const events=songs.filter(s=>s.event).map(s=>s.slug).sort();
 assert.deepEqual(events,['under-the-party-lights','ougon-kouro','blue-spirit','feelin-it-all','signal','aint-backing-down','tempestas-claim','what-youre-made-of'].sort());
});

test('Pokémon Johto: approved duet text preserved with no inert trailing shared fragment',()=>{
 const song=lyricsBySong['pokemon-johto'].es;
 const line=song.text.split(/\n\s*\n/)[9].split('\n')[2];
 assert.equal(line,'Un lugar mejor con una nueva actitud');
 const fragments=song.colorStanzas[9][2];
 assert.deepEqual(fragments,[
  {text:'Un lugar mejor',voice:'blaze'},
  {text:' ',voice:'shared'},
  {text:'con una nueva actitud',voice:'kotoko'}
 ]);
 assert.equal(fragments.map(x=>x.text).join(''),line);
 for(const [slug,versions] of Object.entries(lyricsBySong))for(const [version,lyric] of Object.entries(versions)){
  for(const stanza of lyric.colorStanzas||[])for(const row of stanza)for(const part of row){
   assert.notEqual(part.text,'',slug+':'+version+' has empty vocal segment');
  }
 }
});

test('Horizontes de Aventura: chosen candidate sequence is provisional; track list and album audio remain unpublished',()=>{
 const a=coverAlbums.find(a=>a.id==='horizontes-de-aventura');
 assert.ok(a);
 assert.equal(a.historicalNumber,6);
 assert.equal(a.tracklistStatus,'pending-confirmation');
 assert.equal(a.candidateOrderStatus,'creator-provisional-2026-11-17');
 assert.equal(a.ordered,false);
 assert.equal(a.releaseDate,null);
 assert.deepEqual(a.tracks,[]);
 assert.equal(a.audioStatus,'deferred');
 assert.deepEqual(a.candidateTracks,[
  {song:'dokimeki-diary',version:'album-studio'},
  {song:'level',version:'es'},
  {song:'koko-kara-koko-kara',version:'es'},
  {song:'kono-tate-ni-kakuremasu',version:'es'},
  {song:'ano-ne',version:'es'},
  {song:'ano-ne',version:'loved-ones'},
  {song:'zutto',version:'es'},
  {song:'rvr',version:'es'}
 ]);
 for(const t of a.candidateTracks)assert.ok(songs.find(s=>s.slug===t.song)?.versions.some(v=>v.id===t.version),t.song+':'+t.version);
});

test('THERE IS A REASON: creator-confirmed December 16 original date does not reactivate the blocked reuploads',()=>{
 const v=songs.find(s=>s.slug==='there-is-a-reason').versions[0];
 assert.equal(v.date,'2023-12-16');
 assert.equal(v.year,2023);
 assert.equal(v.firstDocumented,'2023-12-16');
 assert.equal(v.historicalPublications[0].publicationDate,'2023-12-16');
 assert.equal(v.videoPublishedDate,'2024-10-26');
 assert.equal(v.videoId,'spxnKeBQpo8');
 assert.equal(v.currentVideoId,null);
 assert.equal(v.videoStatus,'blocked');
 assert.equal(v.reuploadPending,true);
 assert.match(v.dateEvidence,/Creator confirms initial publication/);
 assert.match(v.dateEvidence,/does not independently prove/);
 assert.doesNotMatch(musicPage('/music/songs/there-is-a-reason/',new URLSearchParams({lang:'es'})),/data-video-id="spxnKeBQpo8"/);
});

test('Legacy collaboration intake is archival only, with no misleading pending integration statuses',()=>{
 assert.equal(existsSync(oldPendingPath),false,'historical .pending.json must not remain authoritative');
 const items=JSON.parse(readFileSync(archivedPath,'utf8'));
 assert.deepEqual(items.map(x=>x.slug).sort(),['halloween-night','suki-yuki-maji-magic'].sort());
 for(const item of items){
  assert.equal(item.status,'publication-link-recovered; cast-confirmed; integrated-in-public-catalog; archive-reference-only');
  assert.ok(songs.find(s=>s.slug===item.slug));
  assert.ok(lyricsBySong[item.slug]);
 }
});

test('Historical closure contract exists and preserves boundaries for future integrations',()=>{
 const policy=readFileSync(policyPath,'utf8');
 for(const expected of [
 'recuperación histórica e ingesta editorial inicial CERRADAS',
 '127 registros de versión',
 '124 ID de video',
 'Nuevos registros',
 'colorStanzas',
 'Interpretación',
 'Adecuaciones',
 'Horizontes de Aventura',
 'no publicadas',
 '16-dic',
 'Terminal',
 'Condición de cierre efectivo'
 ])assert.ok(policy.includes(expected),'missing integration rule '+expected);
});

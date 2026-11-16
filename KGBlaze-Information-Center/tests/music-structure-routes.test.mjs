import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';
import {songs} from '../src/music-catalog.mjs';
import {MUSIC_PATHS,MUSIC_LEGACY_PATHS,MUSIC_SONGS_PATH,MUSIC_HOME_PATH,MUSIC_ALBUMS_PATH,musicPage,musicStateData} from '../src/music-page.mjs';

const base='https://kgblaze.dpdns.org';
const request=(path,method='GET')=>new Request(base+path,{method});
const env={ASSETS:{fetch:async()=>new Response("@font-face{font-family:'Garnett';src:url(data:font/otf;base64,AA==)}",{headers:{'Content-Type':'text/html'}})}};
const displayTitle=(html)=>html.match(/<div class="detail-title">[\s\S]*?<h1>([\s\S]*?)<\/h1>/)?.[1]||'';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('Music home is distinct from catalog; albums remain reserved and unpublished',async()=>{
 assert.equal(MUSIC_HOME_PATH,'/music/');
 assert.equal(MUSIC_SONGS_PATH,'/music/songs/');
 assert.equal(MUSIC_ALBUMS_PATH,'/music/albums/');
 for(const lang of ['es','en','ja']){
  const landing=await worker.fetch(request('/music/?lang='+lang),env);
  assert.equal(landing.status,200);
  const home=await landing.text();
  assert.match(home,new RegExp('<html lang="'+lang+'"'));
  assert.match(home,/data-view="home"/);
  assert.match(home,/rel="canonical" href="https:\/\/kgblaze.dpdns.org\/music\/"/);
  assert.ok(home.includes('/music/songs/?lang='+lang));
  assert.doesNotMatch(home,/<article class="song"/);
  assert.doesNotMatch(home,/\/music\/albums\/(?:album\d+)?\/?"[^>]*>/);
  const listing=await worker.fetch(request('/music/songs/?lang='+lang),env);
  assert.equal(listing.status,200);
  const catalog=await listing.text();
  assert.match(catalog,/data-view="catalog"/);
  assert.equal((catalog.match(/<article class="song"/g)||[]).length,115);
  assert.match(catalog,/rel="canonical" href="https:\/\/kgblaze.dpdns.org\/music\/songs\/"/);
 }
 for(const bad of ['/music/albums','/music/albums/','/music/albums/album01','/music/albums/album01/','/music/songs/missing-song/','/music/api/admin']){
  assert.equal(routePortalRequest(request(bad)).response?.status,404,bad);
 }
});

test('All 115 song pages use canonical /music/songs/slug; old URLs only redirect',async()=>{
 assert.equal(songs.length,115);
 assert.equal(MUSIC_PATHS.size,234);
 assert.equal(MUSIC_LEGACY_PATHS.size,460);
 for(const song of songs){
  const newPath='/music/songs/'+song.slug+'/';
  assert.ok(MUSIC_PATHS.has(newPath),song.slug);
  for(const lang of ['es','en','ja']){
   const doc=musicPage(newPath,new URLSearchParams({lang}));
   assert.match(doc,/class="detail-title"/,song.slug+' '+lang);
   assert.ok(doc.includes('rel="canonical" href="'+base+newPath+'"'),song.slug+' canonical');
   assert.ok(doc.includes('href="/music/songs/?lang='+lang+'"'),song.slug+' catalog back');
   assert.ok(!doc.includes('href="/music/song/'+song.slug+'/'),song.slug+' old links in HTML');
  }
  assert.ok(musicStateData('/music/data/song/'+song.slug+'.json'),song.slug+' state');
 }
 for(const oldPath of ['/music/blue-spirit','/music/blue-spirit/','/music/song/blue-spirit/','/music/song/blue-spirit']){
  assert.equal(routePortalRequest(request(oldPath)).response,undefined,oldPath);
  const res=await worker.fetch(request(oldPath+'?lang=en&version=en'),env);
  assert.equal(res.status,308,oldPath);
  assert.equal(res.headers.get('Location'),base+'/music/songs/blue-spirit/?lang=en&version=en');
 }
 assert.equal((await worker.fetch(request('/music/songs/blue-spirit','HEAD'),env)).status,308);
 assert.equal((await worker.fetch(request('/music/songs/blue-spirit/','HEAD'),env)).status,200);
 assert.equal((await worker.fetch(request('/music/songs/blue-spirit/','POST'),env)).status,405);
 assert.equal((await worker.fetch(request('/music/songs','GET'),env)).status,308);
});

test('Latin/romanized primary titles in ES/EN and Japanese source-first hierarchy in JA',()=>{
 for(const song of songs){
  if(!song.romanized||song.romanized===song.title)continue;
  for(const lang of ['es','en']){
   const h=displayTitle(musicPage('/music/songs/'+song.slug+'/',new URLSearchParams({lang})));
   assert.ok(h.includes('<span class="title-primary">'+escape(song.romanized)+'</span>'),song.slug+' '+lang+' primary romanization');
   assert.ok(h.includes('<span class="title-secondary">'+escape(song.title)+'</span>'),song.slug+' '+lang+' source as subtitle');
  }
  const japanese=displayTitle(musicPage('/music/songs/'+song.slug+'/',new URLSearchParams({lang:'ja'})));
  assert.ok(japanese.startsWith(escape(song.title)),song.slug+' Japanese original stays first');
  assert.ok(japanese.includes('('+escape(song.romanized)+')'),song.slug+' Japanese romanization stays below/inline');
 }
 for(const [slug,primary,secondary] of [['pokemon-theme','Pokémon Theme','Tema de Pokémon'],['pokemon-world','Pokémon World','Mundo Pokémon']]){
  for(const lang of ['es','en']){
   const h=displayTitle(musicPage('/music/songs/'+slug+'/',new URLSearchParams({lang})));
   assert.ok(h.includes('<span class="title-primary">'+primary+'</span>'),slug+' '+lang);
   assert.ok(h.includes('<span class="title-secondary">'+secondary+'</span>'),slug+' '+lang);
  }
 }
 assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'es'})),/<h3><span class="title-primary">Kirameki Rider☆<\/span><span class="title-secondary">キラメキライダー☆<\/span><\/h3>/);
 assert.match(musicPage('/music/songs/',new URLSearchParams({lang:'ja'})),/<h3>キラメキライダー☆ <span class="romanized">\(Kirameki Rider☆\)<\/span><\/h3>/);
});

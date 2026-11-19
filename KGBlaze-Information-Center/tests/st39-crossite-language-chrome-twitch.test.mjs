import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_SSR_JS} from '../src/viewer-portal-ssr.mjs';
const read=path=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),'utf8');
const home=read('../public/home.html'),music=read('../src/music-page.mjs'),musicNav=read('../src/music-navigation.mjs'),terminal=read('../public/index.html'),icon=read('../public/assets/icons/kgblaze-headphones-white.svg');

test('All three share ES/EN/JA via the Music storage and cookie without replacing the native board controller',()=>{
 for(const s of [home,musicNav,VIEWER_PORTAL_SSR_JS]){
  assert.match(s,/kgblaze\.locale\.v1/);
  assert.match(s,/kgblaze_lang/);
  assert.match(s,/addEventListener\('storage'/);
 }
 assert.match(home,/setLang\(readSharedLang\(\)\)/);
 assert.match(VIEWER_PORTAL_SSR_JS,/typeof setLang==='function'\)setLang\(l\)/);
 assert.match(VIEWER_PORTAL_SSR_JS,/querySelectorAll\('button\[data-lang\]'\)/);
 assert.match(terminal,/function setLang\(lang\)\{if\(!\['es','en','ja'\]\.includes\(lang\)\)return;state\.lang=lang;render\(\);\}/);
});
test('Language highlight and right-side header metrics match across the three sites',()=>{
 assert.match(music,/\.header \.langs a\[aria-current\]\{color:#FFFFFF!important/);
 assert.match(music,/\.header \.langs a\{color:#A5EBFF!important/);
 assert.match(home,/data-i18n="musicNav">Música ▾/);
 assert.match(home,/data-i18n="communityNav">Comunidad ▾/);
 for(const css of [home,music,VIEWER_PORTAL_CSS]){
  assert.match(css,/width:124px;flex:0 0 124px;height:35px/);
  assert.match(css,/(?:flex:0 0 76px|width:76px;min-width:76px)/);
 }
});
test('Home, Rebel Mix and Terminal share exact navigation/rail sizes while preserving their interiors',()=>{
 assert.match(home,/header nav\{gap:clamp\(11px,1\.5vw,21px\)!important/);
 assert.match(music,/\.site-global-nav\{gap:clamp\(11px,1\.5vw,21px\);font-size:12px/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-nav\{gap:clamp\(11px,1\.5vw,21px\);font-size:12px/);
 assert.match(home,/\.social \.kg-social-icon\{width:28px!important;height:28px!important/);
 assert.match(music,/\.site-social-sidebar img\{width:28px!important;height:28px!important/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-social-desktop img\{width:28px!important;height:28px!important/);
 assert.match(home,/header\{height:58px!important/);
 assert.match(music,/\.header \.shell\{height:58px;min-height:58px/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-header\{height:58px!important/);
});
test('Twitch is in its video-only card directly, at a valid size, no demand modal',()=>{
 assert.match(home,/synchronizeTwitchPlayer\(\)/);
 assert.match(home,/twitchScreen\.replaceChildren\(frame\)/);
 assert.match(home,/channel=blazeleiton&parent='/);
 assert.match(home,/encodeURIComponent\(location\.hostname\)/);
 assert.match(home,/&autoplay=false/);
 assert.match(home,/window\.matchMedia\('\(max-width:479px\)'\)/);
 assert.match(home,/id="twitch-screen"/);
 assert.match(home,/twLive\?'● LIVE':''/);
 assert.doesNotMatch(home,/twitch-player-layer|openTwitchPlayer/);
 assert.match(home,/\.media \.screen\{width:100%;height:auto;min-height:300px;aspect-ratio:16\/9\}/);
});
test('White headset stays filled, no microphone; asset cache is refreshed',()=>{
 assert.equal((icon.match(/<path fill="#FFFFFF"/g)||[]).length,1);
 assert.match(icon,/viewBox="0 0 100 100"/);
 assert.doesNotMatch(icon,/<circle|microphone|stroke=/i);
 assert.match(home,/kgblaze-headphones-white\.svg\?v=st39-reference-20261118/);
});
test('Chrome actually selects Japanese and mounts Twitch without a click',{timeout:90000},async t=>{
 const bins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const bin=bins.find(c=>spawnSync(c,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!bin){t.skip('Chrome not available');return;}
 const injected='<script>setTimeout(function(){var f=document.querySelector("#twitch-screen iframe");document.documentElement.setAttribute("data-st39-qa",JSON.stringify({lang:document.documentElement.lang,stored:localStorage.getItem("kgblaze.locale.v1"),cookie:document.cookie.includes("kgblaze_lang=ja"),twitch:!!f,src:f?f.src:"",modal:!!document.querySelector(".twitch-player-layer")}));},500)</script>';
 const srv=createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return;}
  if(u.pathname==='/assets/icons/kgblaze-headphones-white.svg'){res.writeHead(200,{'Content-Type':'image/svg+xml'});res.end(icon);return;}
  if(u.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return;}
  if(u.pathname.startsWith('/fixture-youtube/')){res.writeHead(200,{'Content-Type':'text/html'});res.end('<p>Fixture</p>');return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(home.replace('https://www.youtube-nocookie.com/embed/','/fixture-youtube/').replace('</body>',injected+'</body>'));
 });
 await new Promise(done=>srv.listen(0,'127.0.0.1',done));
 try{
  const port=srv.address().port;
  const result=await new Promise((resolve,reject)=>{
   const child=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size=1440,900','--virtual-time-budget=1700','--dump-dom','http://127.0.0.1:'+port+'/?lang=ja'],{stdio:['ignore','pipe','pipe']});
   let dump='',err='';
   child.stdout.on('data',d=>{dump+=d.toString();if(dump.length>3000000)child.kill();});
   child.stderr.on('data',d=>err=(err+d.toString()).slice(-1000));
   child.on('error',reject);
   child.on('close',code=>resolve({code,dump,err}));
  });
  assert.equal(result.code,0,result.err);
  const match=result.dump.match(/data-st39-qa="([^"]+)"/);
  assert.ok(match,'Missing DOM probe');
  const actual=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
  assert.equal(actual.lang,'ja');
  assert.equal(actual.stored,'ja');
  assert.equal(actual.cookie,true);
  assert.equal(actual.twitch,true);
  assert.match(actual.src,/player\.twitch\.tv.*channel=blazeleiton.*parent=127\.0\.0\.1/);
  assert.equal(actual.modal,false);
 }finally{await new Promise(done=>srv.close(done));}
});

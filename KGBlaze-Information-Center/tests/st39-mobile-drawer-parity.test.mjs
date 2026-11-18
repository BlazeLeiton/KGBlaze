import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {musicPage} from '../src/music-page.mjs';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_SUFFIX,VIEWER_PORTAL_MENU_JS} from '../src/viewer-portal-ssr.mjs';

test('Stage 39 CP05: Home navigation structure is now the single mobile menu pattern',()=>{
 const music=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 assert.match(music,/class="site-drawer-close"[^>]+>← Volver<\/button>/);
 assert.doesNotMatch(music,/<a href="\/" data-global-label="home">/);
 assert.match(music,/class="drawer-departures" href="\/departures\/"/);
 assert.match(music,/\.site-drawer-panel\{width:min\(85vw,355px\)/);
 assert.match(music,/\.site-drawer-panel nav a\.drawer-departures\{display:block;background:#276EF1/);
 assert.match(VIEWER_PORTAL_SUFFIX,/class="kg-drawer-departures" href="\/departures\/"/);
 assert.doesNotMatch(VIEWER_PORTAL_SUFFIX,/<a href="\/" data-global="home">/);
 assert.match(VIEWER_PORTAL_MENU_JS,/kgMenuBound/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-drawer-panel\{width:min\(85vw,355px\)/);
});

test('Chrome mobile: Rebel Mix drawer opens and closes, matching Home CTA and spacing',{timeout:120000},async t=>{
 const options=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=options.find(x=>spawnSync(x,['--version'],{timeout:2500}).status===0);
 if(!chrome){t.skip('Chromium unavailable');return}
 const music=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 const probe='<script>setTimeout(function(){var b=document.querySelector(".site-menu-trigger"),d=document.querySelector("#music-site-drawer"),c=document.querySelector(".site-drawer-close");var state={exists:!!b&&!!d&&!!c};if(state.exists){b.click();var panel=d.querySelector(".site-drawer-panel"),links=[...panel.querySelectorAll("nav a")],r=panel.getBoundingClientRect();Object.assign(state,{open:!d.hidden,aria:b.getAttribute("aria-expanded"),count:links.length,closeText:c.textContent,departuresText:links[links.length-1].textContent,departuresBg:getComputedStyle(links[links.length-1]).backgroundColor,panelWidth:r.width,viewport:document.documentElement.clientWidth,drawerTop:d.getBoundingClientRect().top});c.click();state.closed=d.hidden;state.ariaClosed=b.getAttribute("aria-expanded")}document.documentElement.setAttribute("data-music-menu-qa",JSON.stringify(state));},350)</script>';
 const server=createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/outer'){
   const html='<!doctype html><html><body><iframe id="q" src="/inner" style="border:0;width:390px;height:840px"></iframe><script>document.getElementById("q").addEventListener("load",()=>setTimeout(()=>{document.documentElement.setAttribute("data-music-menu-qa",document.getElementById("q").contentDocument.documentElement.getAttribute("data-music-menu-qa")||"{}")},1000))</script></body></html>';
   res.writeHead(200,{'Content-Type':'text/html'});res.end(html);return;
  }
  if(u.pathname==='/api/public'||u.pathname.startsWith('/music/api/')){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"items":[]}');return}
  if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(music.replace('</body>',probe+'</body>'));
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 try{
  const result=await new Promise((resolve,reject)=>{
   const child=spawn(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size=1100,1000','--virtual-time-budget=3000','--dump-dom','http://127.0.0.1:'+server.address().port+'/outer'],{stdio:['ignore','pipe','pipe']});
   let output='',error='';
   child.stdout.on('data',b=>{output+=b.toString();if(output.length>4000000)child.kill()});
   child.stderr.on('data',b=>error=(error+b.toString()).slice(-900));
   child.on('error',reject);child.on('close',code=>resolve({code,output,error}));
  });
  assert.equal(result.code,0,result.error);
  const m=result.output.match(/data-music-menu-qa="([^"]+)"/);
  assert.ok(m,'No mobile menu probe');
  const actual=JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
  assert.equal(actual.exists,true,JSON.stringify(actual));
  assert.equal(actual.open,true,JSON.stringify(actual));
  assert.equal(actual.aria,'true');
  assert.equal(actual.count,4);
  assert.equal(actual.closeText,'← Volver');
  assert.equal(actual.departuresText,'Salidas');
  assert.equal(actual.departuresBg,'rgb(39, 110, 241)');
  assert.ok(actual.panelWidth<=355&&actual.panelWidth>=300,'Home-like panel width '+JSON.stringify(actual));
  assert.equal(actual.drawerTop,56);
  assert.equal(actual.closed,true);
  assert.equal(actual.ariaClosed,'false');
 }finally{await new Promise(done=>server.close(done))}
});

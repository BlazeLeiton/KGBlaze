import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
const headphones=readFileSync(fileURLToPath(new URL('../public/assets/icons/kgblaze-headphones-white.svg',import.meta.url)),'utf8');

test('Stage 39 Home retains original content, icons and inline streaming — no on-demand modal',()=>{
 assert.match(home,/href="\/music\/assets\/typography-v1\.css"/);
 assert.match(home,/\.hero-inner\{max-width:1660px;grid-template-columns:clamp\(245px,20vw,350px\)/);
 assert.match(home,/\.media \.screen\{width:100%;height:auto;min-height:300px;aspect-ratio:16\/9\}/);
 assert.match(home,/\.media-grid\{grid-template-columns:minmax\(0,1fr\);max-width:700px\}/);
 assert.match(home,/class="nav-caret"/);
 assert.match(home,/class="media-brand-icon"[^>]*>YouTube/);
 assert.match(home,/class="media-brand-icon"[^>]*>Twitch/);
 assert.match(home,/replaceChildren\(makeEmbed\('twitch'\)\)/);
 assert.doesNotMatch(home,/twitch-player-layer|id="twitch-preview"|openTwitchPlayer/);
 assert.match(home,/Explora nuestros destinos/);
 assert.match(home,/Métodos de apoyo disponibles/);
 assert.match(home,/main,footer\{margin-left:50px!important\}/);
 assert.doesNotMatch(home.slice(home.indexOf('<style>'),home.indexOf('</style>')), /\\n/);
 assert.match(headphones,/fill="#(?:fff|FFFFFF)"/i);
 assert.doesNotMatch(headphones,/microphone|micrófono/i);
});

test('Home real Chrome geometry respects Twitch 400×300 for desktop; mobile remains naturally stacked',{timeout:180000},async t=>{
 const bins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=bins.find(bin=>spawnSync(bin,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!chrome){t.skip('Chrome not available');return;}
 const probe=`<script>
  setTimeout(()=>{
   const y=document.getElementById('youtube-screen').getBoundingClientRect();
   const tw=document.getElementById('twitch-screen').getBoundingClientRect();
   const hero=document.querySelector('.hero-inner').getBoundingClientRect();
   const root=document.documentElement;
   root.setAttribute('data-relight-geometry',[
    Math.round(window.innerWidth),Math.round(root.clientWidth),
    Math.round(y.width),Math.round(y.height),Math.round(tw.width),Math.round(tw.height),
    Math.round(y.top),Math.round(tw.top),Math.round(hero.width)
   ].join(','));
  },400);
  </script>`;
 const srv=createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/assets/icons/kgblaze-headphones-white.svg'){res.writeHead(200,{'Content-Type':'image/svg+xml'});res.end(headphones);return}
  if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('/* Font lives on the real Worker; layout sizes still tested */');return}
  if(u.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return}
  if(u.pathname.startsWith('/fixture-player/')){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><body style="margin:0;background:#071342"></body>');return}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  const fixture=home.replace('https://www.youtube-nocookie.com/embed/','/fixture-player/');
  res.end(fixture.replace('</body>',probe+'</body>'));
 });
 await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));
 try{
  const port=srv.address().port;
  for(const width of [761,800,990,999,1000,1024,1280,1366,1440,1600,1920,375]){
   const out=await new Promise((resolve,reject)=>{
    const cmd=[ '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size='+width+',900','--virtual-time-budget=1500','--dump-dom','http://127.0.0.1:'+port+'/' ];
    const child=spawn(chrome,cmd,{stdio:['ignore','pipe','pipe']});
    let result='',errors='';
    child.stdout.on('data',data=>{result+=data.toString();if(result.length>2500000)child.kill()});
    child.stderr.on('data',data=>errors=(errors+data.toString()).slice(-1200));
    child.on('error',reject);
    child.on('close',code=>resolve({code,result,errors}));
   });
   assert.equal(out.code,0,'Chrome failed width='+width+': '+out.errors);
   const m=out.result.match(/data-relight-geometry="([\d,]+)"/);
   assert.ok(m,'Missing actual layout metrics width='+width);
   const [vw,clientWidth,yw,yh,tw,th,yt,tt,hw]=m[1].split(',').map(Number);
   assert.ok(hw>0 && tw>0 && yw>0,JSON.stringify({width,vw,clientWidth,hw,yw,tw}));
   if(width>760){
    assert.ok(yw>=400 && tw>=400,'Player narrower than Twitch minimum: '+JSON.stringify({width,vw,clientWidth,yw,tw}));
    assert.ok(yh>=300 && th>=300,'Player shorter than Twitch minimum: '+JSON.stringify({width,yh,th}));
   }else{
    assert.ok(tt>yt,'Mobile Twitch card should remain below YouTube '+JSON.stringify({width,yt,tt}));
   }
  }
 }finally{await new Promise(resolve=>srv.close(resolve))}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const source=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
const departureHelper=readFileSync(fileURLToPath(new URL('../public/assets/home-departure-state.js',import.meta.url)),'utf8');
test('CP05 mobile layout, social bar and scaled Twitch preserve desktop baseline',()=>{
 assert.match(source,/\.twotiles\{grid-template-columns:minmax\(0,2fr\) minmax\(0,1fr\);align-items:stretch\}/);
 assert.match(source,/\.twotiles\{grid-template-columns:minmax\(0,1fr\);gap:10px\}/);
 assert.match(source,/\.social-bottom\{display:flex!important;position:fixed!important/);
 assert.match(source,/footer\.kg-clean-footer\{margin:0!important/);
 assert.match(source,/twitchMobileHint:"En este tamaño, mira la transmisión directamente en Twitch\."/);
 assert.match(source,/twitchScreen\.clientWidth\/400/);
 assert.doesNotMatch(source,/twitch-player-layer|openTwitchPlayer/);
});
test('Chrome reproduces mobile constraints without horizontal page scrolling',{timeout:180000},async t=>{
 const options=[process.env.CHROME_BIN,'google-chrome','chromium','chromium-browser'].filter(Boolean);
 const chrome=options.find(x=>spawnSync(x,['--version'],{timeout:2500}).status===0);
 if(!chrome){t.skip('Chrome not installed');return}
 const probe='<script>setTimeout(function(){window.scrollTo(0,document.documentElement.scrollHeight);setTimeout(function(){var nav=document.querySelector(".social-bottom"),f=document.querySelector("footer span"),tiles=document.querySelector(".twotiles"),tw=document.querySelector("#twitch-screen");var n=nav.getBoundingClientRect(),v=document.documentElement.clientWidth;var p={w:v,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,nav:n.width,navX:n.x,navY:n.y,navBottom:n.bottom,navPosition:getComputedStyle(nav).position,footerTextY:f.getBoundingClientRect().y,tilesRight:tiles.getBoundingClientRect().right,cardMax:Math.max(...Array.from(tiles.children).map(x=>x.getBoundingClientRect().right)),twitchFrame:!!tw.querySelector("iframe"),twitchInnerW:tw.querySelector("iframe")?.offsetWidth||0,twitchDrawnW:tw.querySelector("iframe")?.getBoundingClientRect().width||0,twitchCardW:tw.getBoundingClientRect().width,fallback:!!tw.querySelector(".twitch-mobile-hint")};document.documentElement.setAttribute("data-mobile-audit",JSON.stringify(p));},110);},450)</script>';
 const server=createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/outer'){const width=Number(u.searchParams.get('width'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html><body style="margin:0"><iframe id="mobile" title="Home mobile test" src="/home?lang=es" style="width:'+width+'px;height:900px;border:0;display:block"></iframe><script>document.querySelector("#mobile").addEventListener("load",function(){setTimeout(function(){var inner=document.querySelector("#mobile").contentDocument;document.documentElement.setAttribute("data-mobile-audit",inner.documentElement.getAttribute("data-mobile-audit")||"{}");},750);});</script></body></html>');return}
  if(u.pathname==='/assets/home-departure-state.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(departureHelper);return}
  if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return}
  if(u.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return}
  if(u.pathname.startsWith('/fixture-')){res.writeHead(200,{'Content-Type':'text/html'});res.end('<html><body>fixture</body></html>');return}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  const html=source.replace('https://www.youtube-nocookie.com/embed/','/fixture-youtube/')
                   .replace('https://player.twitch.tv/?channel=','/fixture-twitch/?channel=');
  res.end(html.replace('</body>',probe+'</body>'));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  for(const width of [320,360,375,390,412,430,479,480,520,760,1280]){
   const port=server.address().port;
   const result=await new Promise((resolve,reject)=>{
    const cmd=['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size=1500,1000','--virtual-time-budget=2500','--dump-dom','http://127.0.0.1:'+port+'/outer?width='+width];
    const child=spawn(chrome,cmd,{stdio:['ignore','pipe','pipe']});
    let html='',err='';
    child.stdout.on('data',buf=>{html+=buf.toString();if(html.length>4000000)child.kill()});
    child.stderr.on('data',buf=>err=(err+buf.toString()).slice(-900));
    child.on('error',reject);
    child.on('close',code=>resolve({code,html,err}));
   });
   assert.equal(result.code,0,'Chrome '+width+' '+result.err);
   const found=result.html.match(/data-mobile-audit="([^"]+)"/);
   assert.ok(found,'Missing browser measurement '+width);
   const a=JSON.parse(found[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
   assert.ok(a.w<=width&&a.w>=width-17,'iframe CSS viewport with possible desktop scrollbar '+width+' '+JSON.stringify(a));
   if(width<=760){
    assert.ok(a.scroll<=a.w+1,'page overflow '+width+' '+JSON.stringify(a));
    assert.ok(a.body<=a.w+1,'body overflow '+width+' '+JSON.stringify(a));
    assert.ok(a.tilesRight<=a.w+1&&a.cardMax<=a.w+1,'tile overflow '+width+' '+JSON.stringify(a));
    assert.equal(a.navPosition,'fixed','bottom social not fixed '+width);
    assert.ok(Math.abs(a.nav-a.w)<=2&&Math.abs(a.navX)<=2,'social bar not full width '+width+' '+JSON.stringify(a));
    assert.ok(a.footerTextY<a.navY-3,'footer text obscured '+width+' '+JSON.stringify(a));
    assert.equal(a.twitchFrame,true,'Twitch remains embedded even on narrow phones');
    if(width<480){assert.equal(a.twitchInnerW,400,'Twitch internal surface must remain 400px');assert.ok(a.twitchDrawnW<=a.twitchCardW+2,'Visually scaled Twitch must fit its card '+JSON.stringify(a));}
   }else assert.equal(a.twitchFrame,true);
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
});

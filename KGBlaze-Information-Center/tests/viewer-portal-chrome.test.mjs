import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {VIEWER_PORTAL_CSS,VIEWER_PORTAL_JS} from '../src/viewer-portal-chrome.mjs';
import {KG_SOCIAL_ORIGINALS} from '../src/music-social-icons.mjs';

test('Stage38 V6 exterior has valid browser script and original five social assets',()=>{
 assert.doesNotThrow(()=>new Function(VIEWER_PORTAL_JS));
 for(const key of ['yt','tw','ig','x','dc']){
  assert.match(KG_SOCIAL_ORIGINALS[key],/^data:image\/png;base64,/);
  assert.ok(VIEWER_PORTAL_JS.includes(KG_SOCIAL_ORIGINALS[key]),'original icon '+key+' was not injected');
 }
 assert.match(VIEWER_PORTAL_CSS,/\.viewer-header\{display:none!important\}/);
 assert.match(VIEWER_PORTAL_CSS,/\.board-wrap\{width:100%;max-width:1080px;aspect-ratio:1\}/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-social-mobile\{display:flex;position:fixed/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-legend-items/);
 assert.doesNotMatch(VIEWER_PORTAL_JS,/Controles de semana del visor original|Salida de ejemplo|Área reservada/);
});

test('Stage38 exterior never activates in embedded public viewer',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>true,add:()=>changed++}}};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/departures/',search:'?embed=1'},URLSearchParams,console});
 assert.equal(changed,0);
});
test('Stage38 exterior never activates when original viewer DOM is unavailable',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>false,add:()=>changed++}},getElementById:()=>null};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/departures/',search:''},URLSearchParams,console});
 assert.equal(changed,0);
});
test('Stage38 exterior never activates on non-Terminal routes',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>false,add:()=>changed++}}};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/music/songs/',search:''},URLSearchParams,console});
 assert.equal(changed,0);
});

// The real 961 KB legacy canvas HTML is exercised in Chrome, with the same
// injected script order as Cloudflare's HTMLRewriter. No production network.
test('Stage38 actual Terminal HTML renders the V6 wrapper; embed stays isolated', {timeout:60000}, async t=>{
 const {readFileSync}=await import('node:fs');
 const {fileURLToPath}=await import('node:url');
 const {createServer}=await import('node:http');
 const {spawn,spawnSync}=await import('node:child_process');
 const {VIEWER_CSS,VIEWER_JS}=await import('../src/viewer-enhancements.mjs');
 const {basename}=await import('node:path');
 const src=fileURLToPath(new URL('../public/index.html',import.meta.url));
 const original=readFileSync(src,'utf8');
 const bins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const binary=bins.find(bin=>spawnSync(bin,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!binary){t.skip('Chrome not installed; static regression tests remain active');return;}
 const fixture={schema:'relight-public-v1',sourceNote:'Offline Stage38 CI test',events:[],libraryChanges:{},libraryCustom:[],hiatusWeeks:{},clearedWeeks:{},sync:{}};
 const probe=`<script>setInterval(()=>{const embedded=new URLSearchParams(location.search).get('embed')==='1';const valid=embedded?!document.querySelector('.kg-site-header')&&!!document.getElementById('board'):document.body.classList.contains('kg-portal-viewer')&&!!document.querySelector('.kg-site-header')&&!!document.querySelector('.kg-site-footer')&&document.querySelectorAll('.kg-site-social-desktop img').length===5&&document.getElementById('sideKicker')?.textContent==='Información de vuelo'&&!!document.querySelector('.kg-legend')&&getComputedStyle(document.querySelector('.viewer-header')).display==='none'&&document.querySelector('.board-wrap').getBoundingClientRect().width>100;document.documentElement.setAttribute('data-kg-stage38',valid?'PASS':'FAIL');},100);<\/script>`;
 const makeHtml=embed=>original.replace('</head>',()=>'<style>'+VIEWER_CSS+'</style>'+(embed?'':'<style>'+VIEWER_PORTAL_CSS+'</style>')+'</head>').replace('</body>',()=>'<script>'+VIEWER_JS+'</script>'+(embed?'':'<script>'+VIEWER_PORTAL_JS+'</script>')+probe+'</body>');
 const normal=makeHtml(false),embedded=makeHtml(true);
 const server=createServer((req,res)=>{
  if(req.url.startsWith('/api/public')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(fixture));return;}
  if(req.url.startsWith('/departures/')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(req.url.includes('embed=1')?embedded:normal);return;}
  res.writeHead(404);res.end('Not found');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const run=path=>new Promise((resolve,reject)=>{
  const child=spawn(binary,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size=1280,800','--virtual-time-budget=3000','--dump-dom','http://127.0.0.1:'+port+path],{stdio:['ignore','pipe','pipe']});
  let html='',stderr='';
  child.stdout.on('data',d=>{html+=d.toString();if(html.length>16000000)child.kill()});
  child.stderr.on('data',d=>{stderr=(stderr+d.toString()).slice(-3000)});
  child.on('error',reject);child.on('close',code=>resolve({code,html,stderr}));
 });
 try{
  for(const path of ['/departures/','/departures/?embed=1']){
   const x=await run(path);
   assert.equal(x.code,0,'Chrome returned error for '+path+': '+x.stderr);
   assert.match(x.html,/data-kg-stage38="PASS"/,'Authentic viewer V6 smoke failed on '+path);
   if(path.includes('embed=1'))assert.doesNotMatch(x.html,/class="kg-site-header"/);
   else assert.match(x.html,/class="kg-site-header"/);
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
});

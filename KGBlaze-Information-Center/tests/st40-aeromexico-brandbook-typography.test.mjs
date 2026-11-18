import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_LEGEND} from '../src/viewer-portal-ssr.mjs';
import {musicPage} from '../src/music-page.mjs';
import {KG_CHROME_V1} from '../src/site-chrome-contract.mjs';

const read=x=>readFileSync(fileURLToPath(new URL(x,import.meta.url)),'utf8');
const home=read('../public/home.html');
const music=read('../src/music-page.mjs');
const terminal=read('../src/viewer-portal-chrome.mjs');
const native=read('../public/index.html');
const worker=read('../src/worker.mjs');

test('AM Brand Book 2024 safe typographic adaptation is applied only to intended content',()=>{
 assert.match(home,/\.card p\{color:#493D3A;font-size:13px;line-height:1\.4;margin:5px 0 0\}/);
 assert.match(music,/\.filters label\{min-width:0;font-size:11px;line-height:1\.35;letter-spacing:\.075em;font-weight:400;color:var\(--lav\);text-transform:uppercase\}/);
 assert.match(terminal,/\.kg-legend h3,body\.kg-portal-viewer \.kg-share-heading\{font-size:12px;color:#A5EBFF;margin:0 0 10px;letter-spacing:\.075em;font-weight:400;line-height:1\.35;text-transform:uppercase\}/);
 assert.match(home,/\.hero \.intro h1\{font-size:clamp\(32px,2\.75vw,46px\)/);
 assert.match(home,/kgblaze-headphones-white\.svg\?v=st39-reference-20261118/);
 assert.match(home,/function synchronizeTwitchPlayer\(\)/);
 assert.match(music,/\.songs\.list \.song/);
 assert.match(native,/function setLang\(lang\)\{if\(!\['es','en','ja'\]\.includes\(lang\)\)return;state\.lang=lang;render\(\);\}/);
 assert.equal(KG_CHROME_V1.desktop.headerHeight,58);
 assert.equal(KG_CHROME_V1.desktop.socialWidth,50);
 assert.match(VIEWER_PORTAL_LEGEND,/kg-legend/);
});

test('Font audit confirms Garnett Regular/Semibold mapping and the original Japanese/wordmark exceptions',()=>{
 const declarations=[...native.matchAll(/@font-face\\{([^}]*)\\}/g)].map(m=>m[1].replace(/src:url\\([^)]*\\)/g,'src:[embedded]'));
 assert.equal(declarations.filter(x=>x.includes("font-family:'Garnett'")).length,2);
 assert.ok(declarations.some(x=>x.includes("font-family:'Garnett'")&&x.includes('font-weight:400')));
 assert.ok(declarations.some(x=>x.includes("font-family:'Garnett'")&&x.includes('font-weight:600 900')));
 assert.ok(declarations.some(x=>x.includes("font-family:'MuseoModerno'")));
 assert.equal(declarations.filter(x=>x.includes("font-family:'Noto Sans JP Project'")).length,2);
 assert.match(native,/weight>=600\\?600:400/);
 assert.match(native,/EXCEPCIÓN INTENCIONAL: nombre de marca, MuseoModerno Medium sin cambios/);
 assert.match(worker,/font-display:swap/);
});

test('Chrome computes brand-book-derived line height and tracking without overflow in representative cards',{timeout:90000},async t=>{
 const options=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=options.find(x=>spawnSync(x,['--version'],{timeout:2500,encoding:'utf8'}).status===0);
 if(!chrome){t.skip('Chrome not installed');return;}
 const musicHtml=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 const minimalTerminal='<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*,*:before,*:after{box-sizing:border-box}html,body{margin:0}</style><style>'+VIEWER_PORTAL_CSS+'</style></head><body class="kg-portal-viewer"><div class="kg-legend" style="width:235px;padding:12px"><h3>Leyenda</h3><div class="kg-share-heading">Compartir el visor</div></div></body></html>';
 const probe='<script>setTimeout(function(){var typ=new URLSearchParams(location.search).get("site"),sel=typ==="home"?".card p":typ==="music"?".filters label":".kg-legend h3";var e=document.querySelector(sel),c=e&&getComputedStyle(e);var r=e&&e.getBoundingClientRect();document.documentElement.setAttribute("data-brand-qa",JSON.stringify({site:typ,letterSpacing:c?.letterSpacing,lineHeight:c?.lineHeight,fontSize:c?.fontSize,fontWeight:c?.fontWeight,transform:c?.textTransform,overflow:!!e&&e.scrollWidth>e.clientWidth+2,visibility:!!r&&r.width>0&&r.height>0}));},250)</script>';
 const server=createServer((req,res)=>{
   const u=new URL(req.url,'http://localhost'),site=u.searchParams.get('site');
   if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return;}
   if(u.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return;}
   const h=site==='music'?musicHtml:site==='terminal'?minimalTerminal:home;
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   res.end(h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',probe+'</body>'));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const port=server.address().port;
  for(const [site,size] of [['home',390],['home',1440],['music',390],['music',1440],['terminal',390],['terminal',1440]]){
   const result=await new Promise((resolve,reject)=>{
    const child=spawn(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size='+size+',950','--virtual-time-budget=1200','--dump-dom','http://127.0.0.1:'+port+'/?site='+site],{stdio:['ignore','pipe','pipe']});
    let html='',err='';
    child.stdout.on('data',x=>{html+=x.toString();if(html.length>4000000)child.kill()});
    child.stderr.on('data',x=>err=(err+x.toString()).slice(-600));
    child.on('error',reject);child.on('close',code=>resolve({code,html,err}));
   });
   assert.equal(result.code,0,site+' '+result.err);
   const match=result.html.match(/data-brand-qa="([^"]+)"/);
   assert.ok(match,'missing browser probe '+site+' '+size);
   const data=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
   // Terminal intentionally hides the legend/share panel on narrow mobile screens.
   // A hidden native section is not a layout defect and must stay hidden.
   if(site==='terminal'&&size<=760)assert.equal(data.visibility,false,site+' mobile legend remains hidden');
   else assert.equal(data.visibility,true,site+' '+size);
   assert.equal(data.overflow,false,site+' '+size+' overflow: '+JSON.stringify(data));
   if(site==='home')assert.equal(data.lineHeight,'18.2px');
   if(site==='music'){assert.equal(data.fontWeight,'400');assert.equal(data.transform,'uppercase');}
   if(site==='terminal'){assert.equal(data.fontWeight,'400');assert.equal(data.transform,'uppercase');assert.equal(data.lineHeight,'16.2px');}
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {KG_CHROME_V1,KG_CHROME_LABELS_V1} from '../src/site-chrome-contract.mjs';
import {KG_SOCIAL_ORIGINALS} from '../src/music-social-icons.mjs';
import {musicPage} from '../src/music-page.mjs';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_PREFIX,VIEWER_PORTAL_SUFFIX} from '../src/viewer-portal-ssr.mjs';

const read=p=>readFileSync(fileURLToPath(new URL(p,import.meta.url)),'utf8');
const home=read('../public/home.html');
const music=read('../src/music-page.mjs');
const terminalCss=read('../src/viewer-portal-chrome.mjs');
const terminalOriginal=read('../public/index.html');
const headphones=read('../public/assets/icons/kgblaze-headphones-white.svg');

test('CP03 pins the approved Stage 39 metric contract for future KGBlaze sites',()=>{
 const d=KG_CHROME_V1.desktop,m=KG_CHROME_V1.mobile,c=KG_CHROME_V1.colors;
 assert.equal(KG_CHROME_V1.sourceCommit,'56b07befd09e2cbcc91ef3ec82e80b520c8b4357');
 assert.deepEqual([d.minWidth,d.headerHeight,d.headerPaddingX,d.logoFontSize,d.departuresWidth,d.departuresHeight,d.languagesWidth,d.railWidth,d.railIconSize],[761,58,24,24,96,35,76,50,28]);
 assert.deepEqual([m.maxWidth,m.headerHeight,m.logoFontSize,m.socialHeight,m.socialIconSize],[760,56,23,60,25]);
 assert.equal(d.navGap,'clamp(11px,1.5vw,21px)');
 assert.equal(d.socialPadding,'34px 2px 16px');
 assert.equal(d.socialGap,14);
 assert.deepEqual([c.activeLanguage,c.inactiveLanguage,c.languageUnderline],['#FFFFFF','#A5EBFF','#FA0073']);
 assert.deepEqual(KG_CHROME_V1.languages.codes,['es','en','ja']);
 assert.equal(KG_CHROME_V1.languages.storage,'kgblaze.locale.v1');
 for(const locale of KG_CHROME_V1.languages.codes){
  assert.match(KG_CHROME_LABELS_V1[locale].music,/▾$/);
  assert.match(KG_CHROME_LABELS_V1[locale].community,/▾$/);
 }
});

test('All five social assets are byte-identical to the current approved source, not icon substitutes',()=>{
 const names={yt:'YouTube',tw:'Twitch',ig:'Instagram',x:'X',dc:'Discord'};
 for(const [key,name] of Object.entries(names)){
  const match=home.match(new RegExp('<a aria-label="'+name+'"[^>]*><img class="kg-social-icon" src="([^"]+)"'));
  assert.ok(match,'Home lacks '+name);
  assert.equal(match[1],KG_SOCIAL_ORIGINALS[key],name+' must retain the original Terminal asset');
 }
 assert.match(music,/musicSocialLinks\(\)/);
 assert.match(terminalCss,/KG_SOCIAL_ORIGINALS/);
});

test('User-approved single white headphone silhouette is pinned by its actual Git blob, not only by shape approximations',()=>{
 const prefix=Buffer.from('blob '+Buffer.byteLength(headphones)+'\0');
 const sha=createHash('sha1').update(prefix).update(headphones).digest('hex');
 assert.equal(sha,KG_CHROME_V1.assets.headphonesGitBlob,'Do not redraw an approved icon without a new explicit decision');
 assert.equal((headphones.match(/<path fill="#FFFFFF"/g)||[]).length,1);
 assert.doesNotMatch(headphones,/microphone|micrófono|<circle|stroke=/i);
 assert.match(home,/kgblaze-headphones-white\.svg/);
});

test('Each site preserves its own locale/controller, and Terminal embed keeps its special isolation',()=>{
 assert.match(home,/kgblaze\.locale\.v1/);
 assert.match(music,/data-global-label="music"/);
 assert.match(terminalOriginal,/function setLang\(lang\)\{if\(!\['es','en','ja'\]\.includes\(lang\)\)return;state\.lang=lang;render\(\);\}/);
 assert.match(VIEWER_PORTAL_CSS,/body\.kg-portal-viewer/);
 assert.match(terminalCss,/Non-embedded external V6 shell/);
 assert.match(home,/class="media-grid"/);
 assert.match(music,/Lista de canciones/);
});

test('Desktop browser preserves the exact computed header, language and rail dimensions on all three surfaces',{timeout:120000},async t=>{
 const bins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=bins.find(c=>spawnSync(c,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!chrome){t.skip('Chrome is unavailable');return}
 const musicHtml=musicPage('/music/songs/',new URLSearchParams({lang:'es'}));
 const terminalHtml='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+VIEWER_PORTAL_CSS+'</style></head><body class="kg-portal-viewer">'+VIEWER_PORTAL_PREFIX+VIEWER_PORTAL_SUFFIX+'</body></html>';
 const selectors={
  home:{header:'header',logo:'header .brand',nav:'header nav',departures:'header .salidas',langs:'header .langs',active:'header .langs [data-lang="es"]',inactive:'header .langs [data-lang="en"]',rail:'.social',icon:'.social .kg-social-icon'},
  music:{header:'.header .shell',logo:'.header .brand',nav:'.site-global-nav',departures:'.site-departures',langs:'.header .langs',active:'.header .langs [aria-current]',inactive:'.header .langs a:not([aria-current])',rail:'.site-social-sidebar',icon:'.site-social-sidebar img'},
  terminal:{header:'.kg-site-header',logo:'.kg-site-logo',nav:'.kg-site-nav',departures:'.kg-go-departures',langs:'.kg-site-langs',active:'.kg-site-langs .active',inactive:'.kg-site-langs button:not(.active)',rail:'.kg-site-social-desktop',icon:'.kg-site-social-desktop img'}
 };
 const probe='<script>(function(){setTimeout(function(){'+
 'var selectors='+JSON.stringify(selectors)+';'+
 'var key=new URLSearchParams(location.search).get("surface");var s=selectors[key];'+
 'var num=(q,dim)=>{var e=document.querySelector(q);return e?Math.round(e.getBoundingClientRect()[dim]):-1};'+
 'var style=(q,k)=>{var e=document.querySelector(q);return e?getComputedStyle(e)[k]:"missing"};'+
 'var m={headerHeight:num(s.header,"height"),logoLeft:num(s.logo,"left"),logoSize:style(s.logo,"fontSize"),navSize:style(s.nav,"fontSize"),navGap:style(s.nav,"columnGap"),departuresWidth:num(s.departures,"width"),departuresHeight:num(s.departures,"height"),langsWidth:num(s.langs,"width"),activeColor:style(s.active,"color"),inactiveColor:style(s.inactive,"color"),activeUnderline:style(s.active,"borderBottomColor"),railWidth:num(s.rail,"width"),railTop:num(s.rail,"top"),railGap:style(s.rail,"rowGap"),iconWidth:num(s.icon,"width"),iconHeight:num(s.icon,"height")};'+
 'document.documentElement.setAttribute("data-kg-chrome-qa",JSON.stringify(m));'+
 '},350);})();</script>';
 const srv=createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return}
  if(url.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return}
  if(url.pathname==='/assets/icons/kgblaze-headphones-white.svg'){res.writeHead(200,{'Content-Type':'image/svg+xml'});res.end(headphones);return}
  const type=url.searchParams.get('surface')||'home';
  let html=type==='music'?musicHtml:type==='terminal'?terminalHtml:home;
  // Layout-only fixture; exclude runtime navigation/media for deterministic geometry.
  html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(html.replace('</body>',probe+'</body>'));
 });
 await new Promise(done=>srv.listen(0,'127.0.0.1',done));
 try{
  const port=srv.address().port,d=KG_CHROME_V1.desktop;
  for(const site of ['home','music','terminal']){
   const out=await new Promise((resolve,reject)=>{
    const args=['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size=1920,999','--virtual-time-budget=1300','--dump-dom','http://127.0.0.1:'+port+'/?surface='+site];
    const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe']});
    let output='',error='';
    child.stdout.on('data',b=>{output+=b.toString();if(output.length>4500000)child.kill()});
    child.stderr.on('data',b=>error=(error+b.toString()).slice(-900));
    child.on('error',reject);
    child.on('close',code=>resolve({code,output,error}));
   });
   assert.equal(out.code,0,'Chrome failed '+site+': '+out.error);
   const result=out.output.match(/data-kg-chrome-qa="([^"]+)"/);
   assert.ok(result,'No computed metrics '+site);
   const data=JSON.parse(result[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
   assert.equal(data.headerHeight,d.headerHeight,site+' header');
   assert.equal(data.logoLeft,d.headerPaddingX,site+' left brand offset');
   assert.equal(data.logoSize,d.logoFontSize+'px',site+' logo size');
   assert.equal(data.navSize,d.navFontSize+'px',site+' nav size');
   assert.equal(data.departuresWidth,d.departuresWidth,site+' departures width');
   assert.equal(data.departuresHeight,d.departuresHeight,site+' departures height');
   assert.equal(data.langsWidth,d.languagesWidth,site+' languages width');
   assert.equal(data.activeColor,'rgb(255, 255, 255)',site+' selected language');
   assert.equal(data.inactiveColor,'rgb(165, 235, 255)',site+' unselected language');
   assert.equal(data.activeUnderline,'rgb(250, 0, 115)',site+' language underline');
   assert.equal(data.railWidth,d.socialWidth,site+' rail width');
   assert.equal(data.railTop,d.socialTop,site+' rail top');
   assert.equal(data.railGap,d.socialGap+'px',site+' rail gap');
   assert.equal(data.iconWidth,d.socialIconSize,site+' icon width');
   assert.equal(data.iconHeight,d.socialIconSize,site+' icon height');
  }
 }finally{await new Promise(done=>srv.close(done))}
});

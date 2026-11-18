import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import worker from '../src/worker.mjs';
import {VIEWER_PORTAL_SSR_JS,VIEWER_PORTAL_PREFIX} from '../src/viewer-portal-ssr.mjs';

class LocalRewriter{
 handlers=[];
 on(selector,handler){this.handlers.push([selector,handler]);return this}
 async transform(response){
  let html=await response.text();
  for(const [selector,handler] of this.handlers){
   const prep=[],app=[],before=[],after=[];let content,klass;
   const el={append(value){app.push(value)},prepend(value){prep.push(value)},before(value){before.push(value)},after(value){after.push(value)},setInnerContent(value){content=value},setAttribute(key,value){if(key==='class')klass=value}};
   if(selector==='head'||selector==='body'){
    handler.element(el);
    if(selector==='body'){
     if(klass)html=html.replace(/<body(?:\s[^>]*)?>/i,'<body class="'+klass+'">');
     html=html.replace(/<body(?:\s[^>]*)?>/i,m=>m+prep.join(''));
    }else html=html.replace('</head>',prep.join('')+'</head>');
    html=html.replace('</'+selector+'>',app.join('')+'</'+selector+'>');
   }else if(selector==='#waitingPanel .panel-intro'){
    handler.element(el);
    html=html.replace(/(<div class="panel-intro">[\s\S]*?<\/div>)/,m=>before.join('')+m+after.join(''));
   }else if(selector==='#waitingPanel .embed-tools'){
    handler.element(el);
    html=html.replace('<div class="embed-tools">',before.join('')+'<div class="embed-tools">');
   }else if(selector==='#sideKicker'||selector==='#flightKicker'){
    handler.element(el);
    const id=selector.slice(1),re=new RegExp('(<p class="card-label" id="'+id+'">)([^<]*)(<\\/p>)');
    if(content!==undefined)html=html.replace(re,(_m,a,_b,c)=>a+content+c);
   }
  }
  return new Response(html,{status:response.status,headers:response.headers});
 }
}
test('actual Worker to Chrome: V6 desktop/mobile and untouched embed',{timeout:120000},async t=>{
 const bins=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=bins.find(bin=>spawnSync(bin,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 if(!chrome){t.skip('Chrome not installed');return}
 const original=readFileSync(fileURLToPath(new URL('../public/index.html',import.meta.url)),'utf8');
 const old=globalThis.HTMLRewriter;
 globalThis.HTMLRewriter=LocalRewriter;
 const env={DB:{prepare(){return{first:async()=>null}}},ASSETS:{fetch:async()=>new Response(original,{headers:{'Content-Type':'text/html'}})}};
 let normal,embed;
 try{
  normal=await(await worker.fetch(new Request('https://kgblaze.dpdns.org/departures/'),env)).text();
  embed=await(await worker.fetch(new Request('https://kgblaze.dpdns.org/departures/?embed=1'),env)).text();
 }finally{if(old===undefined)delete globalThis.HTMLRewriter;else globalThis.HTMLRewriter=old}
 assert.match(normal,/<body class="kg-portal-viewer">/);
 assert.match(normal,/<header class="kg-site-header">/);
 assert.match(VIEWER_PORTAL_PREFIX,/<button type="button" class="active" data-lang="es">ES<\/button>/,'Header must use native original-language binding');
 assert.doesNotMatch(VIEWER_PORTAL_PREFIX,/data-site-lang=/,'Never use proxy-only inert selectors');
 assert.match(normal,/<section class="kg-legend"/);
 assert.match(normal,/<p class="kg-wait-description"/);
 assert.doesNotMatch(embed,/class="kg-site-header"/);
 assert.match(embed,/id="board"/);
 const probe=[
 '<script>(function(){',
 'const isEmbed=location.search.includes("embed=1"),isMobile=location.search.includes("mode=mobile"),nativeOnly=location.search.includes("nativeOnly=1");',
 'const check=async()=>{',
 ' const board=document.getElementById("board");if(!board)return;',
 ' if(isEmbed){document.documentElement.dataset.kgSsr=!document.querySelector(".kg-site-header")&&!document.querySelector(".kg-legend")?"PASS":"FAIL";return}',
 ' if(nativeOnly){',
 '  const buttons=[...document.querySelectorAll(".kg-site-langs button[data-lang]")];',
 '  let good=buttons.length===3&&!document.querySelector(".kg-site-langs [data-site-lang]");',
 '  const cycle=[["en","KGBLAZE INTERNATIONAL AIRPORT","Departure Lounge"],["ja","KGBLAZE国際空港","搭乗待合室"],["es","AEROPUERTO INTERNACIONAL DE LA KGBLAZE","Sala de espera"]];',
 '  for(const [lang,heading,title] of cycle){',
 '   const control=buttons.find(x=>x.dataset.lang===lang);if(!control){good=false;continue}',
 '   control.click();await new Promise(r=>setTimeout(r,60));',
 '   good=good&&document.documentElement.lang===lang&&document.getElementById("heading")?.textContent.includes(heading)&&document.getElementById("sideTitle")?.textContent===title&&control.classList.contains("active");',
 '   const hero=document.querySelector(".kg-exterior-hero h1 [data-kg-lang="+lang+"]"),legend=document.querySelector(".kg-legend h3 [data-kg-lang="+lang+"]");',
 '   good=good&&!!hero&&!!legend&&getComputedStyle(hero).display==="inline"&&getComputedStyle(legend).display==="inline";',
 '  }',
 '  document.documentElement.dataset.kgSsr=good?"PASS":"FAIL";if(!good)document.documentElement.dataset.kgSsrWhy=JSON.stringify({buttons:buttons.length,language:document.documentElement.lang,heading:document.getElementById("heading")?.textContent,title:document.getElementById("sideTitle")?.textContent});',
 '  return;',
 ' }',
 ' const h=document.querySelector(".kg-site-header"),legend=document.querySelector(".kg-legend"),square=document.querySelector(".board-wrap"),kicker=document.getElementById("sideKicker");',
 ' let good=!!h&&!!legend&&!!square&&!!kicker&&kicker.textContent==="Información de vuelo"&&document.querySelectorAll(".kg-site-social-desktop img").length===5&&getComputedStyle(document.querySelector(".viewer-header")).display==="none"&&square.getBoundingClientRect().width>100;',
 ' if(isMobile){good=good&&getComputedStyle(document.querySelector(".kg-site-social-mobile")).display!=="none"&&getComputedStyle(legend).display==="none"&&getComputedStyle(document.querySelector(".embed-tools")).display==="none"}',
 ' else{const box=square.getBoundingClientRect();good=good&&box.bottom<=innerHeight-15&&document.documentElement.scrollHeight<=innerHeight+12&&getComputedStyle(legend).display!=="none"}',
 ' const trigger=document.querySelector(".kg-menu-lines");if(isMobile&&trigger){trigger.click();good=good&&!document.querySelector(".kg-site-drawer").hidden;document.querySelector(".kg-site-drawer-close")?.click();good=good&&document.querySelector(".kg-site-drawer").hidden}',
 ' const originalButtons=[...document.querySelectorAll(".kg-site-langs button[data-lang]")];',
 ' good=good&&originalButtons.length===3&&document.querySelector(".kg-site-langs")?.dataset.source==="original-terminal-buttons"&&!document.querySelector(".viewer-header .top-langs button[data-lang]");',
 ' const rows=[...document.querySelectorAll(".kg-legend-row")],expected=["#67D9F7","#F5BF47","#36D978","#ED006F","#62739D"];',
 ' good=good&&rows.length===5&&rows.every((r,i)=>r.querySelector("i")?.getAttribute("style")?.includes(expected[i]))&&document.querySelectorAll(".kg-site-social-desktop small").length===0;',
 ' const cycle=[["en","Departure Lounge","Flight Information"],["ja","搭乗待合室","配信情報"],["es","Sala de espera","Información de vuelo"]];',
 ' for(const [locale,title,kickerLabel] of cycle){const b=document.querySelector(".kg-site-langs [data-lang="+locale+"]");if(!b){good=false;continue}b.click();await new Promise(r=>setTimeout(r,30));good=good&&document.documentElement.lang===locale&&document.getElementById("sideTitle")?.textContent===title&&document.getElementById("sideKicker")?.textContent===kickerLabel&&b.classList.contains("active")}',
 ' document.documentElement.dataset.kgSsr=good?"PASS":"FAIL";if(!good)document.documentElement.dataset.kgSsrWhy=JSON.stringify({head:!!h,legend:!!legend,scroll:document.documentElement.scrollHeight,height:innerHeight,bottom:square?.getBoundingClientRect().bottom,kicker:kicker?.textContent})',
 '};setTimeout(check,600)',
 '})();</script>'
 ].join('\n');
 const server=createServer((req,res)=>{
  if(req.url.startsWith('/api/public')){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({schema:'relight-public-v1',events:[],revision:0}));return}
  const markup=req.url.includes('embed=1')?embed:(req.url.includes('nativeOnly=1')?normal.replace('<script>'+VIEWER_PORTAL_SSR_JS+'</script>',''):normal);
  const html=markup.replace('</body>',probe+'</body>');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const run=(url,size)=>new Promise((resolve,reject)=>{
  const child=spawn(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size='+size,'--virtual-time-budget=2300','--dump-dom',url],{stdio:['ignore','pipe','pipe']});
  let output='',err='';
  child.stdout.on('data',d=>{output+=d.toString();if(output.length>18000000)child.kill()});
  child.stderr.on('data',d=>{err=(err+d.toString()).slice(-1500)});
  child.on('error',reject);child.on('close',code=>resolve({code,html:output,error:err}));
 });
 try{
  for(const [path,size] of [['/departures/','1440,900'],['/departures/','1024,768'],['/departures/','800,600'],['/departures/?mode=mobile','375,780'],['/departures/?nativeOnly=1','1440,900'],['/departures/?nativeOnly=1&mode=mobile','375,780'],['/departures/?embed=1','1440,900']]){
   const out=await run('http://127.0.0.1:'+port+path,size);
   assert.equal(out.code,0,'Chrome failed '+path+': '+out.error);
   assert.match(out.html,/data-kg-ssr="PASS"/,'V6 browser check failed '+path+': '+(out.html.match(/data-kg-ssr-why="[^"]*"/)||[])[0]);
  }
 }finally{await new Promise(resolve=>server.close(resolve))}
});

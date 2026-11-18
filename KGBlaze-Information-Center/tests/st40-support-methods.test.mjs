import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
const read=x=>readFileSync(fileURLToPath(new URL(x,import.meta.url)));
const home=read('../public/home.html').toString();
const languages=runInNewContext('('+home.match(/const LANG=(\{[\s\S]*?\});\s*const SHARED_LOCALE_KEY/)[1]+')');
test('Stage 40 support panel has four actual platform marks and accessible disclosure',()=>{
 assert.equal((home.match(/class="kg-support-method(?: kg-support-method-static)?"/g)||[]).length,4);
 for(const path of ['kgblaze-support-kofi.svg','kgblaze-support-youtube.png','kgblaze-support-twitch.png','kgblaze-support-throne.svg'])assert.ok(home.includes('/assets/icons/'+path));
 assert.match(home,/id="kg-support-toggle"[^>]*aria-expanded="false"/);
 assert.match(home,/id="kg-support-info-panel" hidden/);
 assert.match(home,/supportPanel.hidden=!opened/);
 assert.match(home,/scroll-snap-type:x mandatory/);
 assert.match(home,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(home,/font-size:14\.5px;line-height:1\.4/);
 assert.match(home,/supportDots\.forEach/);
 assert.doesNotMatch(home,/href="https:\/\/throne\.com\/blazeleiton"/);
 assert.doesNotMatch(home,/id="support"[^>]*>[\s\S]*?Ver todas las opciones/);
});
test('Expanded support section reuses all four platform logos, without extra labels or external requests',()=>{
 const detail=home.match(/<div class="kg-support-info" id="kg-support-info-panel" hidden>[\\s\\S]*?<\\/section>/)?.[0];
 assert.ok(detail,'detail section exists');
 assert.equal((detail.match(/class="kg-support-info-item"/g)||[]).length,4);
 assert.equal((detail.match(/class="kg-support-info-logo"/g)||[]).length,4);
 for(const name of ['kofi.svg','youtube.png','twitch.png','throne.svg']){
  assert.ok(detail.includes('kgblaze-support-'+name),'matching brand asset '+name);
 }
 assert.match(home,/\\.kg-support-info-item\\{min-width:0;display:flex;align-items:flex-start;gap:11px\\}/);
 assert.match(home,/\\.kg-support-info-logo\\{display:block;width:28px;height:28px/);
 assert.match(home,/\\.kg-support-info-copy\\{min-width:0;flex:1\\}/);
});
test('Support method descriptions are present and translated to ES EN JA',()=>{
 const keys=['support','supportShow','supportHide','supportHow','supportPlatforms','supportKofi','supportYouTube','supportTwitch','supportThrone','supportDetailKofi','supportDetailYouTube','supportDetailTwitch','supportDetailThrone'];
 for(const locale of ['es','en','ja'])for(const key of keys)assert.equal(typeof languages[locale][key],'string',locale+' '+key);
 assert.equal(languages.es.support,'Métodos de apoyo disponibles');
 assert.equal(languages.es.supportYouTube,'Membresías · Supers');
 assert.equal(languages.es.supportTwitch,'Bits · Suscripciones');
 assert.equal(languages.es.supportDetailKofi,'Donaciones únicas o periódicas y solicitudes de comisiones.');
 assert.equal(languages.es.supportDetailThrone,'Regalos mediante la lista de deseos.');
 assert.ok(!languages.es.supportDetailYouTube.includes('Premium'));
});
test('Brand assets are present without invented logos or an enclosing Ko-fi blue circle',()=>{
 const kofi=read('../public/assets/icons/kgblaze-support-kofi.svg').toString();
 const throne=read('../public/assets/icons/kgblaze-support-throne.svg').toString();
 assert.match(kofi,/<svg/);assert.match(kofi,/fill="#FF6433"/);
 assert.doesNotMatch(kofi,/<circle/);
 assert.match(throne,/<linearGradient/);
 for(const p of ['kgblaze-support-youtube.png','kgblaze-support-twitch.png'])assert.equal(read('../public/assets/icons/'+p).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
});
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';

test('Stage 40 support browser-level QA: readable mobile carousel and functional ES/EN/JA disclosure',{timeout:90000},async t=>{
 const candidates=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const chrome=candidates.find(bin=>spawnSync(bin,['--version'],{timeout:2000,encoding:'utf8'}).status===0);
 if(!chrome){t.skip('Chrome unavailable');return;}
 const iconNames=['kgblaze-support-kofi.svg','kgblaze-support-youtube.png','kgblaze-support-twitch.png','kgblaze-support-throne.svg'];
 const servedAssets=new Map(iconNames.map(name=>['/assets/icons/'+name,read('../public/assets/icons/'+name)]));
 const probe=`<script>
 setTimeout(()=>{
  const section=document.getElementById('support');
  const captions=[...section.querySelectorAll('.kg-support-caption')];
  const logos=[...section.querySelectorAll('.kg-support-logo')];
  const detailLogos=[...section.querySelectorAll('.kg-support-info-logo')];
  const detailRows=[...section.querySelectorAll('.kg-support-info-item')];
  const button=document.getElementById('kg-support-toggle');
  const panel=document.getElementById('kg-support-info-panel');
  button.click();
  const opened=button.getAttribute('aria-expanded')==='true'&&!panel.hidden;
  document.querySelector('[data-lang="en"]').click();
  const en=section.querySelector('[data-i18n="supportHow"]').textContent;
  document.querySelector('[data-lang="ja"]').click();
  const ja=section.querySelector('[data-i18n="supportHow"]').textContent;
  document.querySelector('[data-lang="es"]').click();
  const track=document.getElementById('kg-support-track');
  if(innerWidth<=760)document.querySelector('[data-support-index="2"]').click();
  setTimeout(()=>{
   const data={opened,en,ja,
    count:captions.length,
    logos:logos.every(img=>img.complete&&img.naturalWidth>0),
    detailLogoCount:detailLogos.length,
    detailLogos:detailLogos.every(img=>img.complete&&img.naturalWidth>0),
    detailLogoLeft:detailRows.every(row=>row.querySelector('.kg-support-info-logo').getBoundingClientRect().right<=row.querySelector('.kg-support-info-copy').getBoundingClientRect().left),
    sizes:captions.map(el=>parseFloat(getComputedStyle(el).fontSize)),
    lines:captions.map(el=>parseFloat(getComputedStyle(el).lineHeight)),
    captionOverflow:captions.some(el=>el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2),
    sectionOverflow:section.scrollWidth>section.clientWidth+2,
    carousel:track.scrollWidth>track.clientWidth+5,
    moved:track.scrollLeft>10
   };
   document.documentElement.setAttribute('data-support-qa',JSON.stringify(data));
  },350);
 },450);
 <\/script>`;
 const server=createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(servedAssets.has(u.pathname)){res.writeHead(200,{'Content-Type':u.pathname.endsWith('.svg')?'image/svg+xml':'image/png'});res.end(servedAssets.get(u.pathname));return;}
  if(u.pathname==='/api/public'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"events":[],"sync":{}}');return;}
  if(u.pathname==='/music/assets/typography-v1.css'){res.writeHead(200,{'Content-Type':'text/css'});res.end('');return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(home.replace('</body>',probe+'</body>'));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  for(const width of [390,760,1440]){
   const port=server.address().port;
   const result=await new Promise((resolve,reject)=>{
    const child=spawn(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--window-size='+width+',920','--virtual-time-budget=3000','--dump-dom','http://127.0.0.1:'+port+'/?support-probe=1'],{stdio:['ignore','pipe','pipe']});
    let out='',err='';
    child.stdout.on('data',b=>{out+=b.toString();if(out.length>2000000)child.kill()});
    child.stderr.on('data',b=>err=(err+b.toString()).slice(-700));
    child.on('error',reject);child.on('close',c=>resolve({c,out,err}));
   });
   assert.equal(result.c,0,'Chrome '+width+': '+result.err);
   const m=result.out.match(/data-support-qa="([^"]+)"/);
   assert.ok(m,'QA probe absent '+width);
   const q=JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
   assert.equal(q.count,4,'four support methods at '+width);
   assert.equal(q.opened,true,'details toggle '+width);
   assert.equal(q.en,'How to support Blaze');
   assert.equal(q.ja,'Blazeを応援する方法');
   assert.equal(q.logos,true,'logos loaded '+width);
   assert.equal(q.detailLogoCount,4,'four detail logos '+width);
   assert.equal(q.detailLogos,true,'detail logos loaded '+width);
   assert.equal(q.detailLogoLeft,true,'icons appear at left of descriptive copy '+width);
   assert.equal(q.captionOverflow,false,'caption overflow '+width+': '+JSON.stringify(q));
   assert.equal(q.sectionOverflow,false,'section overflow '+width);
   assert.ok(q.sizes.every(v=>v>=14),'descriptions stay legible '+width);
   if(width<=760){assert.equal(q.carousel,true);assert.equal(q.moved,true);}
   else assert.equal(q.carousel,false);
  }
 }finally{await new Promise(resolve=>server.close(resolve));}
});

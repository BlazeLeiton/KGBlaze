import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {songs} from '../src/music-catalog.mjs';
const root=resolve('public'),out=resolve(process.env.ARTWORK_AUDIT_DIR||'artwork-audit');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.webp':'image/webp','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const assets={fetch:async req=>{try{let p=new URL(req.url).pathname;if(p==='/')p='/index.html';const file=resolve(root,'.'+p);if(!file.startsWith(root+'/'))return new Response(null,{status:404});const data=await readFile(file);return new Response(req.method==='HEAD'?null:data,{headers:{'Content-Type':mime[extname(file)]||'application/octet-stream'}});}catch{return new Response(null,{status:404});}}};
const server=createServer(async(req,res)=>{try{const result=await worker.fetch(new Request('https://kgblaze.dpdns.org'+req.url,{method:req.method}),{ASSETS:assets});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const report=[];
try{
 for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  for(const lang of ['es','en','ja']){
   await page.goto(origin+'/music/?lang='+lang,{waitUntil:'domcontentloaded'});
   await page.locator('.square-art img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
   await page.waitForFunction(()=>[...document.querySelectorAll('.square-art img')].every(i=>i.complete),{},{timeout:30000});
   const rows=await page.locator('.song').evaluateAll(cards=>cards.map(c=>{const a=c.querySelector('.square-art'),r=a.getBoundingClientRect();return {href:c.querySelector('a').getAttribute('href'),square:Math.abs(r.width-r.height)<1.5,kind:a.dataset.artKind,images:[...a.querySelectorAll('img')].map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,hidden:i.hidden}))}}));
   assert.equal(rows.length,50);
   for(const r of rows){assert.ok(r.square,r.href+' is not square');assert.notEqual(r.kind,'video',r.href+' fell back to cover video');assert.ok(r.images.length&&r.images.every(i=>i.width>0&&i.height>0&&!i.hidden),r.href+' image failed');}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'catalog horizontal overflow');
   await page.screenshot({path:resolve(out,device+'-'+lang+'-catalog.png'),fullPage:true});
   // Test every detail route in all locales and both viewport sizes; external YouTube
   // thumbnails are not revalidated as release artwork.
   for(const s of songs){
    const response=await page.goto(origin+'/music/song/'+s.slug+'/?lang='+lang,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),s.slug+' horizontal overflow');
    const video=page.locator('.video-stage,.archive-video').first();
    assert.ok(await video.count(),s.slug+' has no video/archive stage');
    const box=await video.boundingBox();assert.ok(box&&box.width>0&&box.height>0,s.slug+' invisible video stage');
   }
   report.push({device,lang,cards:rows.length,details:songs.length,artwork:rows});
  }
  // Real navigation, rather than just independent document renders.
  await page.goto(origin+'/music/?lang=es',{waitUntil:'domcontentloaded'});
  const calls=[];page.on('request',r=>{if(r.url().includes('/music/data/'))calls.push(r.url())});
  const initial=await page.evaluate(()=>{window.__musicDocument=Math.random();return window.__musicDocument});
  await page.locator('#search').fill('blue spirit');
  await page.locator('#list').click();
  await page.locator('#songs .song:not([hidden]) > a').first().click();
  await page.locator('.music-overlay.is-open #music-detail-content').waitFor();
  const overlay=page.locator('.music-overlay-panel');
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial,'opening navigated document');
  assert.ok(page.url().endsWith('/music/song/blue-spirit/'));
  assert.equal(calls.filter(u=>u.includes('/song/blue-spirit.json')).length,1);
  assert.equal(await page.locator('#search').inputValue(),'blue spirit');
  assert.ok(await page.locator('#songs').evaluate(n=>n.classList.contains('list')));
  assert.ok(await overlay.evaluate(n=>Math.abs(n.getBoundingClientRect().width-innerWidth)<2));
  await overlay.locator('.version-options a').filter({hasText:'2024'}).click();
  await page.locator('#music-detail-content[data-version="en"]').waitFor();
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial,'version navigated document');
  await page.evaluate(()=>{window.__player=document.querySelector('.music-overlay .video-stage')});
  await overlay.locator('.lyric-options a').filter({hasText:'En paralelo'}).first().click();
  await overlay.locator('.parallel-pairs').waitFor();
  assert.ok(await overlay.locator('.parallel-pairs .color-part').count());
  assert.ok(await page.evaluate(()=>window.__player===document.querySelector('.music-overlay .video-stage')),'player remounted on lyric change');
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial);
  assert.ok(page.url().endsWith('/music/song/blue-spirit/'));
  assert.equal(calls.filter(u=>u.includes('/song/blue-spirit.json')).length,1);
  await page.screenshot({path:resolve(out,device+'-overlay-parallel.png'),fullPage:false});
  await overlay.locator('.music-detail-langs a').filter({hasText:'EN'}).click();
  await page.locator('#music-detail-content[data-locale="en"]').waitFor();
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial);
  await page.keyboard.press('Escape');
  await page.locator('.music-overlay.is-open').waitFor({state:'hidden'});
  assert.equal(await page.locator('#search').inputValue(),'blue spirit');
  assert.ok(await page.locator('#songs').evaluate(n=>n.classList.contains('list')));
  assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');
  assert.ok(page.url().endsWith('/music/'));
  assert.equal(calls.filter(u=>u.includes('/song/blue-spirit.json')).length,1);
  assert.equal(await page.evaluate(()=>localStorage.getItem('kgblaze.locale.v1')),'en');
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial);
  await page.goForward();
  await page.locator('.music-overlay.is-open').waitFor();
  await page.goBack();
  await page.locator('.music-overlay.is-open').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>window.__musicDocument),initial);
  console.log(device+' overlay: document, filter, layout, lyric colors, player and history preserved');
  await page.close();
 }
 await import('node:fs/promises').then(fs=>fs.writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)));
 console.log('Visual audit: 6 catalogs, 300 detail views, 300 square cards');
}finally{await browser.close();await new Promise(r=>server.close(r));}

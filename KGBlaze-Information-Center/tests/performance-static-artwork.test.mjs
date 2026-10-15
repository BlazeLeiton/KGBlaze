import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import vm from 'node:vm';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA,currentMonday} from '../src/core.mjs';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
const viewer=readFileSync(resolve(base,'index.html'),'utf8');
const dashboard=readFileSync(resolve(base,'v25-web.html'),'utf8');
const pfx='assets/relight/art/';
const getArts=html=>[...html.matchAll(/"img":BUILTIN_ART_BASE\+"([^"]+\.png)"/g)].map(x=>x[1]);
test('Both pages reuse 25 unchanged original PNGs plus one user-uploaded Collab Padoru image',()=>{
 const a=getArts(viewer),b=getArts(dashboard);
 assert.equal(a.length,26);assert.deepEqual(a,b);
 assert.equal(new Set(a).size,25);
 for(const name of a){
  const path=resolve(base,pfx,name);
  assert.ok(existsSync(path),name);
  assert.ok(statSync(path).size>1000,name);
  assert.equal(readFileSync(path).subarray(0,8).toString('hex'),'89504e470d0a1a0a',name);
 }
 for(const html of [viewer,dashboard]){
  assert.doesNotMatch(html,/"img":"data:image\/png;base64,/);
  assert.match(html,/const BUILTIN_ART_BASE=/);
  const script=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
  assert.doesNotThrow(()=>new vm.Script(script));
 }
 assert.ok(viewer.length<1200000);
 assert.ok(dashboard.length<400000);
});
test('Public agenda serves conditional 304 only for the same FULL sync payload',async()=>{
 const url='https://example.workers.dev/api/public';
 let sync={};
 const agenda={...EMPTY_AGENDA(),events:[{id:'fixture',day:currentMonday(),title:'Current week event',status:'A TIEMPO',platforms:['yt']}]};
 const env={DB:{prepare:()=>({first:async()=>({revision:2,editorial_json:JSON.stringify(agenda),sync_json:JSON.stringify(sync),updated_at:'2026-10-14T12:00:00Z'})})}};
 const first=await worker.fetch(new Request(url),env);
 assert.equal(first.status,200);
 assert.match(first.headers.get('Cache-Control'),/no-cache/);
 const etag=first.headers.get('ETag');assert.ok(etag);
 const second=await worker.fetch(new Request(url,{headers:{'If-None-Match':etag}}),env);
 assert.equal(second.status,304);assert.equal(await second.text(),'');
 sync={fixture:{youtube:{status:'completed',verified:true}}};
 const changed=await worker.fetch(new Request(url,{headers:{'If-None-Match':etag}}),env);
 assert.equal(changed.status,200);
 assert.notEqual(changed.headers.get('ETag'),etag);
});
test('Dashboard HTML revalidates as 304 while security headers are preserved',async()=>{
 const html=dashboard,baseUrl='https://kgblaze.dpdns.org/departures/dashboard/';
 const env={ASSETS:{fetch:async()=>new Response(html,{headers:{'Content-Type':'text/html','ETag':'"asset-v25-fixture"'}})}};
 const first=await worker.fetch(new Request(baseUrl),env);
 assert.equal(first.status,200);
 assert.equal(first.headers.get('ETag'),'"asset-v25-fixture"');
 assert.match(first.headers.get('Cache-Control'),/no-cache/);
 const again=await worker.fetch(new Request(baseUrl,{headers:{'If-None-Match':'"asset-v25-fixture"'}}),env);
 assert.equal(again.status,304);
 assert.match(again.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
});
test('Existing automatic D1 polling, no unauthorized writes, and lazy library entries remain',()=>{
 assert.match(dashboard,/fetch\('\/departures\/api\/public',\{cache:'no-cache'/);
 assert.match(viewer,/fetch\('\/api\/public',\{cache:'no-cache'/);
 assert.match(dashboard,/hostedInitialize/);
 assert.match(dashboard,/Authorization:'Bearer '/);
 assert.match(dashboard,/imageFromSrc/);
 assert.match(dashboard,/loading="lazy" decoding="async"/);
 assert.match(dashboard,/setInterval\(\(\)=>\{void hostedPoll\(\);\},30000\)/);
});
test('Immutable content-versioned artwork is cacheable under portal and workers.dev routes',async()=>{
 const paths=['https://kgblaze.dpdns.org/departures/assets/relight/art/among-us-18eea-9c6c445d.png',
  'https://example.workers.dev/assets/relight/art/among-us-18eea-9c6c445d.png'];
 const env={ASSETS:{fetch:async()=>new Response('PNG',{headers:{'Content-Type':'image/png'}})}};
 for(const url of paths){
  const r=await worker.fetch(new Request(url),env);
  assert.equal(r.status,200);
  assert.match(r.headers.get('Cache-Control'),/max-age=31536000, immutable/);
  assert.equal(await r.text(),'PNG');
 }
});

test('New Padoru library image is identical in editor and viewer without embedding it',()=>{
 const expression=/"img":BUILTIN_ART_BASE\+"Kirameki Riders\.png"/;
 for(const html of [viewer,dashboard]){
  assert.match(html,expression);
  assert.match(html,/"id":"collab-padoru","name":"Collab Padoru","aliases":\["padoru","collab padoru"\]/);
 }
 const image=resolve(base,pfx,'Kirameki Riders.png');
 assert.ok(existsSync(image),'The original uploaded PNG must exist as an independent file');
 assert.equal(statSync(image).size,1352199,'Keep the untouched uploaded full-resolution PNG');
 assert.equal(readFileSync(image).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
});

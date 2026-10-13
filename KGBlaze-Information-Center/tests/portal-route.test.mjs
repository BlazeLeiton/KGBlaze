import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.mjs';
import {PORTAL_HOST,routePortalRequest} from '../src/portal-route.mjs';

const base='https://kgblaze.dpdns.org';
function setup(){
 const assetPaths=[];
 const env={
  DB:{prepare(){return {first:async()=>null};}},
  ASSETS:{fetch:async req=>{
   assetPaths.push(new URL(req.url).pathname);
   return new Response('VIEWER',{headers:{'Content-Type':'text/html'}});
  }}
 };
 return {env,assetPaths};
}
test('portal host is exact and old Worker URLs remain untouched',()=>{
 assert.equal(PORTAL_HOST,'kgblaze.dpdns.org');
 const old=new Request('https://kgblaze-terminal.drago68575.workers.dev/api/public');
 assert.equal(routePortalRequest(old).request,old);
 assert.equal(routePortalRequest(old).isPortal,false);
});
test('base domain and /departures redirect to the board with query params',async()=>{
 const {env}=setup();
 const home=await worker.fetch(new Request(base+'/?flight=sample'),env);
 assert.equal(home.status,302);
 assert.equal(home.headers.get('location'),base+'/departures/?flight=sample');
 const alias=await worker.fetch(new Request(base+'/departures?embed=1'),env);
 assert.equal(alias.status,308);
 assert.equal(alias.headers.get('location'),base+'/departures/?embed=1');
});
test('new /departures and old workers.dev root both serve the existing viewer',async()=>{
 const {env,assetPaths}=setup();
 const page=await worker.fetch(new Request(base+'/departures/'),env);
 assert.equal(page.status,200);
 assert.equal(await page.text(),'VIEWER');
 const old=await worker.fetch(new Request('https://kgblaze-terminal.drago68575.workers.dev/'),env);
 assert.equal(old.status,200);
 assert.equal(await old.text(),'VIEWER');
 assert.deepEqual(assetPaths,['/','/']);
});
test('scoped public endpoints and temporary root API alias share the same state',async()=>{
 const {env}=setup();
 for(const path of ['/departures/api/public','/api/public']){
  const res=await worker.fetch(new Request(base+path),env);
  assert.equal(res.status,200,path);
  const payload=await res.json();
  assert.equal(payload.revision,0);
  assert.deepEqual(payload.events,[]);
 }
 for(const path of ['/departures/api/health','/api/health']){
  const res=await worker.fetch(new Request(base+path),env);
  assert.equal(res.status,200);
  assert.equal((await res.json()).service,'kgblaze-terminal');
 }
});
test('admin APIs, wrong paths and write methods are blocked on the vanity host',async()=>{
 const {env}=setup();
 for(const path of ['/api/admin/snapshot','/departures/api/admin/snapshot',
 '/departures/api/admin/publish','/departures/api/youtube-preflight','/not-a-service']){
  const res=await worker.fetch(new Request(base+path),env);
  assert.equal(res.status,404,path);
 }
 const write=await worker.fetch(new Request(base+'/departures/api/public',{method:'POST'}),env);
 assert.equal(write.status,405);
});
test('embedded viewer retains historical /api/public request through read-only alias',async()=>{
 const {env,assetPaths}=setup();
 const x=await worker.fetch(new Request(base+'/departures/index.html?embed=1'),env);
 assert.equal(x.status,200);
 assert.deepEqual(assetPaths,['/index.html']);
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.ok(html.includes("fetch('/api/public',{cache:'no-store'})"));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.mjs';
const html=readFileSync(new URL('../public/v25-web.html',import.meta.url),'utf8');
const host='https://kgblaze.dpdns.org';
const fakeDB={
 prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>({revision:2,editorial_json:JSON.stringify({schema:'relight-public-v1',
   events:[],libraryCustom:[],libraryChanges:{}}),sync_json:'{}',updated_at:new Date().toISOString()})};
  throw Error('No write should occur: '+sql);
 }
};
const setup=()=>({
 ADMIN_TOKEN:'synthetic-test-key-not-a-real-secret',
 DB:fakeDB,ASSETS:{
  fetch:async req=>req.url.endsWith('/v25-web.html')
   ?new Response(html,{status:200,headers:{'Content-Type':'text/html;charset=utf-8'}})
   :new Response('<!doctype html><title>viewer</title>',{status:200,headers:{'Content-Type':'text/html;charset=utf-8'}})
 }
});
test('V25 static asset really preserves original export and input engines',()=>{
 assert.ok(html.length>100_000 && html.length<400_000,'25 PNG originals are now external reusable assets');
 assert.ok(html.includes('Centro de Control Editorial'));
 assert.ok(html.includes('BASE_ACTIVITY_LOGOS'));
 assert.ok(html.includes('function parseICS('));
 assert.ok(html.includes("id=\"downloadGif\""));
 assert.ok(html.includes("id=\"download\""));
 assert.ok(html.includes('function gifLZW('));
 assert.ok(html.includes('function publicSnapshot('));
 assert.ok(html.includes('hostedInitialize'));
 assert.ok(html.includes('hostedCommit'));
 assert.ok(html.includes('syncQuickToken'));
 assert.ok(html.includes('library-mode'));
 assert.ok(html.includes('renderBoardOnly'));
 assert.doesNotMatch(html,/data:font\/|@font-face\s*\{/,'Never republish embedded private font binaries');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script&&script.length>100_000);
 assert.doesNotThrow(()=>new Function(script));
});
test('V25 fixed left rail has week settings above activities, with preview center and foldable tools at right',()=>{
 const left=html.slice(html.indexOf('<aside id="weekRail"'),html.indexOf('</aside>')+8);
 assert.match(left,/<section id="weekSettings" class="card fixed-panel">/);
 assert.match(left,/<section id="weekActivities" class="card fixed-panel">/);
 assert.ok(left.indexOf('id="weekSettings"')<left.indexOf('id="weekActivities"'));
 assert.doesNotMatch(left,/<details|<summary/,'Permanent left-rail panels must not be collapsible');
 assert.ok(html.indexOf('<section class="card preview"')<html.indexOf('<div class="controls">'),'Canvas precedes side tools in focus order');
 assert.ok(html.includes('.preview{grid-column:2;grid-row:1}'));
 assert.ok(html.includes('.controls{grid-column:3;grid-row:1}'));
 assert.match(html, /<details class="card fold-panel ics-drop-target"/,'Right-side panels remain collapsible');
 assert.ok(!html.includes("document.querySelector('#eventList').closest('details')"),'No obsolete event-list toggle listener');
});
test('Hosted canonical and library routes serve the SAME complete V25 and use secure headers',async()=>{
 const env=setup();
 for(const pathname of ['/departures/dashboard/','/departures/dashboard/library/']){
  const r=await worker.fetch(new Request(host+pathname),env);
  assert.equal(r.status,200);
  assert.match(r.headers.get('Cache-Control')||'',/no-cache/);
  assert.match(r.headers.get('Content-Security-Policy')||'',/frame-ancestors 'none'/);
  assert.match(r.headers.get('Content-Security-Policy')||'',/img-src[^;]*blob:/,'V25 input images use temporary blob: URLs');
  assert.match(await r.text(),/function hostedInitialize\(\)/);
 }
 const short=await worker.fetch(new Request(host+'/dashboard/library'),env);
 assert.equal(short.status,308);
 assert.equal(short.headers.get('location'),host+'/departures/dashboard/library/');
 const library=await worker.fetch(new Request(host+'/departures/dashboard/library'),env);
 assert.equal(library.status,308);
});
test('Dashboard asset cannot allow anonymous D1 publication',async()=>{
 const env=setup();
 const opts={method:'POST',headers:{'Content-Type':'application/json'},body:'{}'};
 const r=await worker.fetch(new Request(host+'/departures/api/admin/publish',opts),env);
 assert.equal(r.status,401);
 const old=await worker.fetch(new Request(host+'/api/admin/snapshot'),env);
 assert.equal(old.status,404);
 const postPage=await worker.fetch(new Request(host+'/departures/dashboard/',opts),env);
 assert.equal(postPage.status,405);
});
test('Stage 21 remains available if V25 asset is missing/corrupt',async()=>{
 const env=setup();
 env.ASSETS={fetch:async()=>new Response('<html>generic fallback</html>',{status:200,headers:{'Content-Type':'text/html'}})};
 const r=await worker.fetch(new Request(host+'/departures/dashboard/'),env);
 assert.equal(r.status,200);
 assert.match(await r.text(),/Centro de control editorial/);
});

test('Hosted edits distinguish local pending changes from published D1 and notify same-origin viewers',()=>{
 assert.match(html,/NO PUBLICADO · introduce la clave administrativa/);
 assert.match(html,/NO PUBLICADO · clave rechazada/);
 assert.match(html,/beforeunload/);
 assert.match(html,/hostedChannel\?\.postMessage\(\{type:'published',revision:hostedRevision\}\)/);
 assert.match(html,/hostedAuthRejected=err\.status===401/);
 const viewer=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(viewer,/BroadcastChannel\('kgblaze-editorial-v1'\)/);
 assert.match(viewer,/event\.data\?\.type==='published'/);
 assert.match(viewer,/30\*1000/);
});

test('Hosted serialization retains a published Twitch logo when no override exists',()=>{
 assert.match(html,/logoChoice:v\.logoChoice!==undefined\?v\.logoChoice:\(e\.logoChoice\|\|'auto'\)/);
 assert.match(html,/logoData:v\.logoData!==undefined\?v\.logoData:\(e\.logoData\|\|''\)/);
 assert.match(html,/eventIds:Array\.isArray\(data\.eventIds\)/);
 assert.match(html,/evento finalizado protegido/);
});

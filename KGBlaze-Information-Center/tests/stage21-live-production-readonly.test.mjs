import test from 'node:test';
import assert from 'node:assert/strict';
const ORIGIN='https://kgblaze.dpdns.org';
async function get(path,options={}){
 const res=await fetch(ORIGIN+path,{signal:AbortSignal.timeout(15000),
  headers:{'Cache-Control':'no-cache',Accept:'*/*'},...options});
 return res;
}
test('Stage21 PRODUCTION: canonical dashboard exists over real HTTPS',async()=>{
 const res=await get('/departures/dashboard/');
 assert.equal(res.status,200,'public dashboard HTTP success');
 assert.match(res.headers.get('content-type')||'',/text\/html/);
 assert.match(res.headers.get('cache-control')||'',/no-store/);
 assert.match(res.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);
 const html=await res.text();
 assert.match(html,/Centro de control editorial/);
 assert.match(html,/\/departures\/api\/admin\/publish/);
 assert.match(html,/libraryCustom/);
 assert.doesNotMatch(html,/src:url\(data:font/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script,'hosted script available');
 assert.doesNotThrow(()=>new Function(script[1]));
 console.log('STAGE21 LIVE DASHBOARD PASS: deployed dashboard, protected headers and valid browser script');
});
test('Stage21 PRODUCTION: /dashboard alias redirects to the canonical route',async()=>{
 const res=await get('/dashboard',{redirect:'manual'});
 assert.equal(res.status,308);
 assert.equal(res.headers.get('location'),ORIGIN+'/departures/dashboard/');
 console.log('STAGE21 LIVE ALIAS PASS');
});
test('Stage21 PRODUCTION: share real published D1 editorial & library, no anonymous admin GET',async()=>{
 const res=await get('/departures/api/public');
 assert.equal(res.status,200);
 const body=await res.json();
 assert.ok(Number.isInteger(body.revision));
 assert.ok(Array.isArray(body.events));
 assert.ok(Array.isArray(body.libraryCustom));
 assert.ok(body.libraryChanges&&typeof body.libraryChanges==='object');
 console.log('STAGE21 LIVE D1',JSON.stringify({revision:body.revision,
  eventCount:body.events.length,libraryCustomCount:body.libraryCustom.length,
  platformObservations:Object.keys(body.sync||{}).length}));
 const blocked=await get('/departures/api/admin/snapshot');
 assert.equal(blocked.status,401);
 const blockedRoot=await get('/api/admin/snapshot');
 assert.equal(blockedRoot.status,404);
 console.log('STAGE21 LIVE AUTH PASS: unauthenticated administrative snapshot denied');
});
test('Stage21 PRODUCTION: public Departures still serves the original viewer',async()=>{
 const res=await get('/departures/');
 assert.equal(res.status,200);
 const html=await res.text();
 assert.match(html,/Salidas \| KGBlaze/);
 assert.match(html,/flight-category-box/);
 console.log('STAGE21 LIVE PUBLIC VIEWER PASS: existing Departures intact');
});

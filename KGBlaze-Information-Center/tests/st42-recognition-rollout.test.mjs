import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';

const origin='https://kgblaze.dpdns.org';
const admin={Authorization:'Bearer private-admin-fixture'};
const setup=()=>({ADMIN_TOKEN:'private-admin-fixture',
 DB:{prepare(){throw Error('D1 should never be used in disabled OAuth tests')}},
 ASSETS:{fetch:async()=>new Response('SAFE_STATIC')}
});

test('CP04 offline preflight validates exact existing Terminal, scoped SQL and no activated flags',()=>{
 const stdout=execFileSync(process.execPath,['scripts/recognition-deploy-preflight.mjs'],{
  cwd:new URL('../',import.meta.url),encoding:'utf8'});
 const report=JSON.parse(stdout);
 assert.equal(report.passed,true);
 assert.equal(report.remoteCloudflareChecked,false);
 assert.equal(report.remoteSchemaModified,false);
 assert.equal(report.deployed,false);
 assert.equal(report.credentialsUsed,false);
 assert.deepEqual(report.failures,[]);
});
test('CP04 new OAuth callback is invisible while recognition flag is absent',async()=>{
 const env=setup();
 const req=new Request(origin+'/twitch/oauth/callback?code=SENSITIVE&state=SECRET');
 const res=await worker.fetch(req,env);
 assert.equal(res.status,404);
 assert.equal((await res.text()).includes('SENSITIVE'),false);
});
test('CP04 no D1 migration required for disabled private OAuth start',async()=>{
 const env=setup();
 const u=origin+'/departures/api/admin/recognition/twitch/start';
 const r=await worker.fetch(new Request(u,{method:'POST',headers:admin}),env);
 assert.equal(r.status,503);
 const body=await r.json();
 assert.equal(body.ok,false);
 assert.equal(body.reason,'disabled_or_not_configured');
});
test('CP04 public domain still denies root admin endpoints and disallowed verbs',()=>{
 const dangerous=[
  '/api/admin/recognition/twitch/start',
  '/api/admin/recognition/twitch/disconnect',
  '/api/admin/recognition/twitch/status',
  '/api/admin/recognition/twitch/refresh'
 ];
 for(const path of dangerous){
  const r=routePortalRequest(new Request(origin+path));
  assert.ok(r.response,'Root admin alias must not be routed: '+path);
  assert.equal(r.response.status,404);
 }
 const allowed=routePortalRequest(new Request(origin+'/departures/api/admin/recognition/twitch/disconnect',{method:'POST'}));
 assert.equal(allowed.response,undefined);
 const rejected=routePortalRequest(new Request(origin+'/departures/api/admin/recognition/twitch/disconnect'));
 assert.equal(rejected.response.status,405);
});

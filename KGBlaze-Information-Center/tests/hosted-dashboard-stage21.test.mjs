import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {DASHBOARD_HTML} from '../src/dashboard-page.mjs';
import {EMPTY_AGENDA,currentMonday} from '../src/core.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';

const ROOT='https://kgblaze.dpdns.org';
const admin='test-stg21-bearer-do-not-publish';
class D1{
 constructor(){this.row=null;this.audit=0;}
 prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>this.row};
  if(sql.startsWith('UPDATE terminal_state'))return {bind:(next,stamp,rev)=>({run:async()=>{
   if(!this.row||this.row.revision!==rev)return {meta:{changes:0}};
   this.row={...this.row,editorial_json:next,updated_at:stamp,revision:rev+1};
   return {meta:{changes:1}};
  }})};
  if(sql.startsWith('INSERT OR IGNORE INTO terminal_state'))return {bind:(data,sync,stamp)=>({run:async()=>{
   if(this.row)return {meta:{changes:0}};
   this.row={revision:1,editorial_json:data,sync_json:sync,updated_at:stamp};
   return {meta:{changes:1}};
  }})};
  if(sql.startsWith('INSERT INTO terminal_audit'))return {bind:()=>({run:async()=>{this.audit++;return {meta:{changes:1}};}})};
  throw Error('Unexpected query '+sql);
 }
}
const setup=()=>{
 const db=new D1();
 db.row={revision:2,editorial_json:JSON.stringify({...EMPTY_AGENDA(),events:[{
  id:'tw:unit',origin:'twitch',day:currentMonday(),time:'22:00',
  title:'Azur Lane',category:'Azur Lane',status:'A TIEMPO',
  platforms:['yt','tw'],logoChoice:'auto',logoData:''
 }],libraryChanges:{},libraryCustom:[{id:'karaoke',name:'Karaoke',aliases:['karaoke'],img:'data:image/png;base64,aGVsbG8='}]}),
 sync_json:'{}',updated_at:new Date().toISOString()};
 return {db,env:{DB:db,ADMIN_TOKEN:admin,ASSETS:{fetch:async()=>new Response('PUBLIC VIEWER')}}};
};
const request=(env,path,opt={})=>worker.fetch(new Request(ROOT+path,opt),env);
test('Stage 21 web page is self-contained, valid JS, and never includes the private operative',()=>{
 assert.ok(DASHBOARD_HTML.length<100_000,'must not embed private 4.5 MB editor/fonts');
 assert.match(DASHBOARD_HTML,/Centro de control editorial/);
 assert.match(DASHBOARD_HTML,/libraryCustom/);
 assert.match(DASHBOARD_HTML,/baseRevision/);
 assert.match(DASHBOARD_HTML,/\/departures\/api\/admin\/publish/);
 const script=DASHBOARD_HTML.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script,'script present');
 assert.doesNotThrow(()=>new Function(script[1]));
 assert.doesNotMatch(DASHBOARD_HTML,/src:url\(data:font/);
});
test('Dashboard route and short alias keep public viewer and old worker routes unaffected',async()=>{
 const {env}=setup();
 const short=await request(env,'/dashboard');
 assert.equal(short.status,308);
 assert.equal(short.headers.get('Location'),ROOT+'/departures/dashboard/');
 const canonical=await request(env,'/departures/dashboard');
 assert.equal(canonical.status,308);
 const page=await request(env,'/departures/dashboard/');
 assert.equal(page.status,200);
 assert.match(page.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
 assert.equal(page.headers.get('Cache-Control'),'no-store, no-cache, must-revalidate');
 assert.match(await page.text(),/Centro de control editorial/);
 const publicPage=await request(env,'/departures/');
 assert.equal(await publicPage.text(),'PUBLIC VIEWER');
 assert.equal(routePortalRequest(new Request('https://kgblaze-terminal.drago68575.workers.dev/api/admin/snapshot')).isPortal,false);
});
test('Anonymous API admin reads and writes remain blocked with 401; unprefixed and disallowed routes stay 404/405',async()=>{
 const {env}=setup();
 const agenda={...EMPTY_AGENDA(),events:[]};
 const postOpts={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({baseRevision:2,agenda})};
 const anon=await request(env,'/departures/api/admin/publish',postOpts);
 assert.equal(anon.status,401);
 const snap=await request(env,'/departures/api/admin/snapshot');
 assert.equal(snap.status,401);
 const root=await request(env,'/api/admin/snapshot');
 assert.equal(root.status,404);
 const noScope=await request(env,'/departures/api/admin/youtube-preflight');
 assert.equal(noScope.status,404);
 const wrong=await request(env,'/departures/api/public',{method:'POST'});
 assert.equal(wrong.status,405);
 const viewPost=await request(env,'/departures/dashboard/',{method:'POST'});
 assert.equal(viewPost.status,405);
 const old=await request(env,'/departures/api/admin/social-preview-refresh');
 assert.equal(old.status,404);
});
test('Authorized browser changes share the SAME D1 with public departures and custom library',async()=>{
 const {env,db}=setup();
 const headers={'Authorization':'Bearer '+admin,'Content-Type':'application/json',Origin:ROOT};
 const snapshot=await request(env,'/departures/api/admin/snapshot',{headers});
 assert.equal(snapshot.status,200);
 const initial=await snapshot.json();
 assert.equal(initial.revision,2);
 const next=structuredClone(initial.editorial);
 next.events[0].title='Azur Lane: nuevo episodio';
 next.libraryCustom.push({id:'new-graphic',name:'Collab Padoru',aliases:['Padoru'],img:'data:image/png;base64,aGVsbG8='});
 const res=await request(env,'/departures/api/admin/publish',{method:'POST',headers,body:JSON.stringify({baseRevision:2,agenda:next})});
 assert.equal(res.status,200,await res.clone().text());
 assert.equal((await res.json()).revision,3);
 const published=await (await request(env,'/departures/api/public')).json();
 assert.equal(published.revision,3);
 assert.equal(published.events[0].title,'Azur Lane: nuevo episodio');
 assert.equal(published.libraryCustom[1].name,'Collab Padoru');
 assert.equal(db.audit,1);
 const stale=await request(env,'/departures/api/admin/publish',{method:'POST',headers,body:JSON.stringify({baseRevision:2,agenda:next})});
 assert.equal(stale.status,409,'CAS must deny lost updates');
});
test('POST without token never modifies D1 even when it claims owner Origin',async()=>{
 const {env,db}=setup(),original=structuredClone(db.row);
 const response=await request(env,'/departures/api/admin/publish',{method:'POST',headers:{Origin:ROOT,'Content-Type':'application/json'},body:'{}'});
 assert.equal(response.status,401);
 assert.deepEqual(db.row,original);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA,currentMonday} from '../src/core.mjs';
class FakeDB{
 constructor(){this.row=null;this.preview=null;this.audits=[];}
 prepare(q){return {bind:(...args)=>({run:async()=>this.run(q,args)}),first:async()=>this.first(q)};}
 async first(q){if(q.includes('FROM terminal_state'))return this.row;if(q.includes('FROM terminal_preview'))return this.preview;return null;}
 async run(q,args){if(q.startsWith('INSERT OR IGNORE INTO terminal_state')){
   if(this.row)return {meta:{changes:0}};
   this.row={revision:1,editorial_json:args[0],sync_json:args[1],updated_at:args[2]};return {meta:{changes:1}};
  }
  if(q.startsWith('UPDATE terminal_state')){
   if(!this.row||this.row.revision!==args[2])return {meta:{changes:0}};
   this.row={...this.row,revision:this.row.revision+1,editorial_json:args[0],updated_at:args[1]};return {meta:{changes:1}};
  }
  if(q.startsWith('INSERT INTO terminal_audit')){this.audits.push(args);return {meta:{changes:1}};}
  if(q.startsWith('INSERT INTO terminal_preview')){this.preview={week:args[0],payload:args[1]};return {meta:{changes:1}};}
  throw Error('Unexpected query '+q);
 }
}
function setup(){const db=new FakeDB(),env={DB:db,ADMIN_TOKEN:'test-long-private-admin-key',ASSETS:{fetch:async()=>new Response('STATIC')}};return {db,env};}
const call=(env,path,opt={})=>worker.fetch(new Request('https://example.workers.dev'+path,opt),env);
test('Sin configuración D1 la API avisa y no inventa agenda',async()=>{const x=await worker.fetch(new Request('https://x.test/api/public'),{});assert.equal(x.status,503);});
test('GET pública vacía, privada sólo con token; cabeceras CORS para editor local',async()=>{
 const {env}=setup();const pub=await call(env,'/api/public');assert.equal(pub.status,200);const data=await pub.json();assert.deepEqual(data.events,[]);
 const denied=await call(env,'/api/admin/snapshot');assert.equal(denied.status,401);
 const auth=await call(env,'/api/admin/snapshot',{headers:{Authorization:'Bearer test-long-private-admin-key',Origin:'null'}});assert.equal(auth.status,200);assert.equal(auth.headers.get('Access-Control-Allow-Origin'),'null');
});
test('POST publica revisiones; datos falsos de YT no son confiables; evita borrador obsoleto',async()=>{
 const {env,db}=setup();const week=currentMonday();const agenda={...EMPTY_AGENDA(),events:[{id:'one',day:week,time:'22:00',title:'MiSide',status:'POR CONFIRMAR',platforms:['yt','tw']}],sync:{one:{youtube:{verified:true,status:'completed',lifeCycleStatus:'complete'}}}};
 const endpoint='/api/admin/publish';const headers={'Authorization':'Bearer test-long-private-admin-key','Content-Type':'application/json','Origin':'null'};
 const resp=await call(env,endpoint,{method:'POST',headers,body:JSON.stringify({baseRevision:0,agenda})});assert.equal(resp.status,200,await resp.text());assert.equal(db.row.revision,1);
 const d=await (await call(env,'/api/public')).json();assert.equal(d.sync.one,undefined);assert.equal(d.events[0].title,'MiSide');
 const stale=await call(env,endpoint,{method:'POST',headers,body:JSON.stringify({baseRevision:0,agenda})});assert.equal(stale.status,409);
});
test('OG preview acepta PNG cuadrado, rechaza fecha de semana anterior',async()=>{
 const {env,db}=setup(),buf=new Uint8Array(24);buf.set([137,80,78,71,13,10,26,10]);buf[16]=0;buf[17]=0;buf[18]=4;buf[19]=56;buf[20]=0;buf[21]=0;buf[22]=4;buf[23]=56;
 const r=await call(env,'/api/admin/preview',{method:'POST',headers:{Authorization:'Bearer test-long-private-admin-key','Content-Type':'image/png','X-Terminal-Week':currentMonday()},body:buf});assert.equal(r.status,200);assert.equal(db.preview.week,currentMonday());
 const png=await call(env,'/og-semana.png');assert.equal(png.status,200);assert.equal(png.headers.get('Content-Type'),'image/png');
 db.preview.week='2000-01-03';const stale=await call(env,'/og-semana.png');assert.equal(stale.status,404);
});

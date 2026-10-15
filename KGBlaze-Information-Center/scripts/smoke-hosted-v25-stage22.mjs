// Browser smoke: real dashboard UI, but NEVER real Cloudflare D1.
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA,currentMonday} from '../src/core.mjs';
const ORIGIN='https://kgblaze.dpdns.org',TOKEN='SYNTHETIC-STAGE22-SECRET';
const testDay=(()=>{
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',
 year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
 .filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return p.year+'-'+p.month+'-'+p.day;
})();
const v25=readFileSync(new URL('../public/v25-web.html',import.meta.url),'utf8');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const db={
 row:{revision:2,editorial_json:JSON.stringify({...EMPTY_AGENDA(),events:[
  {id:'man:stage22',origin:'manual',day:testDay,time:'23:55',title:'Killer Chat Test',category:'Killer Chat',platforms:['yt'],status:'POR CONFIRMAR',logoChoice:'auto',logoData:''}
 ],libraryCustom:[],libraryChanges:{}}),sync_json:'{}',updated_at:new Date().toISOString()},
 prepare(sql){
  if(sql.startsWith('SELECT'))return {first:async()=>this.row};
  if(sql.startsWith('UPDATE terminal_state'))return {bind:(next,stamp,rev)=>({run:async()=>{
   if(rev!==this.row.revision)return {meta:{changes:0}};
   this.row={...this.row,editorial_json:next,updated_at:stamp,revision:rev+1};return {meta:{changes:1}};
  }})};
  if(sql.startsWith('INSERT INTO terminal_audit'))return {bind:()=>({run:async()=>({meta:{changes:1}})})};
  throw Error('SQL unexpected '+sql);
 }
};
const env={DB:db,ADMIN_TOKEN:TOKEN,ASSETS:{fetch:async req=>new Response(
  req.url.endsWith('/v25-web.html')?v25:'<!doctype html><title>Public viewer mock</title>',
  {status:200,headers:{'Content-Type':'text/html; charset=utf-8'}}
)}};
let server,chrome,socket,dir;
try{
 server=createServer(async(req,res)=>{
  try{
   const buffers=[];for await(const part of req)buffers.push(part);
   const headers=new Headers(req.headers);
   if(headers.has('origin'))headers.set('Origin',ORIGIN);
   const request=new Request(ORIGIN+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(buffers)});
   const reply=await worker.fetch(request,env);
   res.writeHead(reply.status,Object.fromEntries(reply.headers));
   res.end(Buffer.from(await reply.arrayBuffer()));
  }catch(err){res.statusCode=500;res.end('FAIL '+err.message);}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 const names=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
 const bin=names.find(x=>spawnSync(x,['--version'],{encoding:'utf8',timeout:3000}).status===0);
 assert.ok(bin,'Chrome required');
 dir=mkdtempSync(join(tmpdir(),'relight22-'));
 chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{stdio:'ignore'});
 const portfile=join(dir,'DevToolsActivePort');
 for(let i=0;!existsSync(portfile)&&i<100;i++)await pause(120);
 assert.ok(existsSync(portfile),'No CDP port');
 const devPort=Number(readFileSync(portfile,'utf8').split('\n')[0]);
 let tabs;
 for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:'+devPort+'/json/list')).json();if(tabs.length)break;}catch{}await pause(120);}
 const tab=tabs.find(x=>x.type==='page');assert.ok(tab?.webSocketDebuggerUrl);
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let counter=0;const pending=new Map();
 socket.addEventListener('message',evt=>{
  const m=JSON.parse(evt.data);
  if(m.method==='Page.javascriptDialogOpening'){
   console.error('STAGE22 UNEXPECTED BROWSER DIALOG:',JSON.stringify(m.params));
   socket.send(JSON.stringify({id:++counter,method:'Page.handleJavaScriptDialog',params:{accept:false}}));
   return;
  }
  if(!m.id)return;const p=pending.get(m.id);if(!p)return;
  pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);
 });
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++counter;
  const watchdog=setTimeout(()=>{
   pending.delete(id);reject(Error('CDP timeout after 20s: '+method));
  },20000);
  pending.set(id,{resolve:value=>{clearTimeout(watchdog);resolve(value);},
   reject:error=>{clearTimeout(watchdog);reject(error);}});
  socket.send(JSON.stringify({id,method,params}));
 });
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error('Chrome Runtime error '+JSON.stringify(result.exceptionDetails));return result.result?.value;};
 const callBrowser=fn=>evaluate('('+fn.toString()+')()');
 await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 console.log('STAGE22 CDP navigate');await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/departures/dashboard/'});
 console.log('STAGE22 CDP evaluate boot');
 const boot=await callBrowser(async function(){
  for(let i=0;i<130&&!document.querySelector('#hostedSyncStatus')?.textContent.includes('sincronizado');i++)
   await new Promise(r=>setTimeout(r,50));
  const canvas=document.getElementById('board');
  const geom=id=>{const r=document.querySelector(id).getBoundingClientRect();return {x:r.x,y:r.y,h:r.height};};
  const geometry={rail:geom('#weekRail'),settings:geom('#weekSettings'),activities:geom('#weekActivities'),preview:geom('.preview'),tools:geom('.controls')};
  return {title:document.title,count:document.querySelectorAll('#weekRail .event').length,
   status:document.getElementById('hostedSyncStatus')?.textContent,
   dimension:[canvas.width,canvas.height],
   noPageScroll:document.documentElement.scrollHeight<=innerHeight+3,
   controls:!!document.getElementById('downloadGif')&&!!document.getElementById('download'),
   fixedPanels:[document.getElementById('weekSettings').tagName,document.getElementById('weekActivities').tagName],
   rightFolds:document.querySelectorAll('.controls > details').length,geometry};
 });
 assert.equal(boot.count,1,'V25 current-week event list did not hydrate from D1');
 assert.deepEqual(boot.dimension,[1080,1080]);
 assert.ok(boot.noPageScroll,'Desktop page should fit its browsing window');
 assert.ok(boot.controls,'Both original PNG and GIF controls are required');
 assert.deepEqual(boot.fixedPanels,['SECTION','SECTION'],'Permanent weekly panels cannot be details');
 assert.ok(boot.rightFolds>=4,'Side tools must remain collapsible');
 assert.ok(boot.geometry.rail.x<boot.geometry.preview.x&&boot.geometry.preview.x<boot.geometry.tools.x,'Expected left rail, centered canvas, right tools at desktop width');
 assert.ok(boot.geometry.settings.y<boot.geometry.activities.y,'Week settings must appear above the weekly activity list');
 assert.ok(boot.geometry.settings.h>100&&boot.geometry.activities.h>100,'Both fixed left-rail panels must be visible');
 console.log('STAGE22 V25 BOOT',JSON.stringify(boot));
 console.log('STAGE22 CDP evaluate edit');
 const edit=await callBrowser(async function(){
  const key=document.getElementById('syncQuickToken');
  key.value='SYNTHETIC-STAGE22-SECRET';
  key.dispatchEvent(new Event('input',{bubbles:true}));
  const select=document.querySelector('#weekRail [data-event-status]');
  if(!select)return {error:'No V25 event status select'};
  select.value='A TIEMPO';select.dispatchEvent(new Event('change',{bubbles:true}));
  for(let i=0;i<120;i++){
   await new Promise(r=>setTimeout(r,60));
   const d=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
   if(d.events?.[0]?.status==='A TIEMPO')return {revision:d.revision,status:d.events[0].status};
  }
  return {error:document.getElementById('hostedSyncStatus').textContent};
 });
 assert.equal(edit.status,'A TIEMPO');assert.equal(edit.revision,3);
 console.log('STAGE22 V25 AUTO-PUBLISH',JSON.stringify(edit));
 console.log('STAGE22 CDP evaluate library');
 const lib=await callBrowser(async function(){
  document.getElementById('libraryName').value='Collab Padoru';
  document.getElementById('libraryAliases').value='padoru, collab padoru';
  const canvas=document.createElement('canvas');canvas.width=8;canvas.height=8;
  canvas.getContext('2d').fillRect(0,0,8,8);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const file=new File([blob],'padoru.png',{type:'image/png'});
  const dt=new DataTransfer();dt.items.add(file);
  const input=document.getElementById('libraryLogoFile');input.files=dt.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
  for(let i=0;i<50&&!document.getElementById('libraryFormHint').textContent.includes('Imagen lista');i++)
   await new Promise(r=>setTimeout(r,50));
  document.getElementById('libraryForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  for(let i=0;i<120;i++){
   await new Promise(r=>setTimeout(r,60));
   const data=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
   const x=data.libraryCustom?.find(v=>v.name==='Collab Padoru');
   if(x)return {revision:data.revision,id:x.id,aliases:x.aliases,size:x.img.length};
  }
  return {error:document.getElementById('hostedSyncStatus').textContent};
 });
 assert.equal(lib.revision,4);assert.ok(lib.size>50);
 console.log('STAGE22 V25 SHARED LIBRARY',JSON.stringify(lib));
 console.log('STAGE22 CDP evaluate anonymous denial');
 const anon=await callBrowser(async function(){
  const key=document.getElementById('syncQuickToken');
  key.value='';key.dispatchEvent(new Event('input',{bubbles:true}));
  const select=document.querySelector('#weekRail [data-event-status]');
  select.value='REPROGRAMADO';select.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,1300));
  const data=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
  return {revision:data.revision,status:data.events[0].status,notice:document.getElementById('hostedSyncStatus').textContent};
 });
 assert.equal(anon.revision,4);assert.equal(anon.status,'A TIEMPO');
 console.log('STAGE22 V25 ANONYMOUS DENIAL',JSON.stringify(anon));
 await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/departures/dashboard/library/'});
 const libraryRoute=await callBrowser(async function(){
  for(let i=0;i<120&&!document.body.classList.contains('library-mode');i++)await new Promise(r=>setTimeout(r,50));
  const library=document.getElementById('libraryPanel');
  return {active:document.body.classList.contains('library-mode'),visible:!!library&&getComputedStyle(library).display!=='none',
   railHidden:getComputedStyle(document.getElementById('weekRail')).display==='none'};
 });
 assert.ok(libraryRoute.active&&libraryRoute.visible&&libraryRoute.railHidden);
 console.log('STAGE22 V25 LIBRARY ROUTE',JSON.stringify(libraryRoute));
 console.log('STAGE22 V25 BROWSER PASS: original V25 workspace, auto D1, library and auth isolated');

}finally{
 try{socket?.close();}catch{}
 try{chrome?.kill('SIGKILL');}catch{}
 if(server)await new Promise(r=>server.close(r));
 if(dir)try{rmSync(dir,{recursive:true,force:true,maxRetries:2,retryDelay:100});}catch(err){console.warn('Chrome cleanup skipped '+err.code);}
}

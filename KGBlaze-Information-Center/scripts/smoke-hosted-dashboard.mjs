// Browser smoke: real dashboard UI, but NEVER real Cloudflare D1.
import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import {EMPTY_AGENDA,currentMonday} from '../src/core.mjs';
const ORIGIN='https://kgblaze.dpdns.org',TOKEN='SYNTHETIC-STAGE21-SECRET';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const db={
 row:{revision:2,editorial_json:JSON.stringify({...EMPTY_AGENDA(),events:[
  {id:'man:stage21',origin:'manual',day:currentMonday(),time:'22:00',title:'Killer Chat Test',category:'Killer Chat',platforms:['yt'],status:'POR CONFIRMAR',logoChoice:'auto',logoData:''}
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
const env={DB:db,ADMIN_TOKEN:TOKEN,ASSETS:{fetch:async()=>new Response('<!doctype html><title>Public viewer mock</title>',{headers:{'Content-Type':'text/html'}})}};
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
 dir=mkdtempSync(join(tmpdir(),'relight21-'));
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
 socket.addEventListener('message',evt=>{const m=JSON.parse(evt.data);if(!m.id)return;const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++counter;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error('Chrome Runtime error '+JSON.stringify(result.exceptionDetails));return result.result?.value;};
 const callBrowser=fn=>evaluate('('+fn.toString()+')()');
 await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/departures/dashboard/'});
 const boot=await callBrowser(async function(){
  for(let i=0;i<80&&!document.querySelector('.event');i++)await new Promise(r=>setTimeout(r,50));
  return {title:document.title,count:document.querySelectorAll('.event').length,notice:document.getElementById('notice')?.textContent};
 });
 assert.equal(boot.count,1,'Browser did not render one event');console.log('STAGE21 BROWSER BOOT',JSON.stringify(boot));
 const edit=await callBrowser(async function(){
  document.getElementById('auth').value='SYNTHETIC-STAGE21-SECRET';
  document.querySelector('.event').click();
  const title=document.getElementById('title');title.value='Killer Chat hosted edit';title.dispatchEvent(new Event('change',{bubbles:true}));
  for(let i=0;i<100;i++){
   await new Promise(r=>setTimeout(r,60));
   const d=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
   if(d.events?.[0]?.title==='Killer Chat hosted edit')return {revision:d.revision,title:d.events[0].title};
  }
  return {failed:true,notice:document.getElementById('notice').textContent};
 });
 assert.equal(edit.title,'Killer Chat hosted edit');assert.equal(edit.revision,3);console.log('STAGE21 BROWSER EDIT',JSON.stringify(edit));
 const lib=await callBrowser(async function(){
  document.getElementById('libName').value='Collab Padoru';
  document.getElementById('libAliases').value='Padoru, karaoke collab';
  const file=new File([new Uint8Array([137,80,78,71,13,10,26,10,1])],'padoru.png',{type:'image/png'});
  const dt=new DataTransfer();dt.items.add(file);document.getElementById('libFile').files=dt.files;
  document.getElementById('libraryForm').dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  for(let i=0;i<100;i++){
   await new Promise(r=>setTimeout(r,60));
   const d=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
   if(d.libraryCustom?.some(x=>x.name==='Collab Padoru'))
    return {revision:d.revision,name:d.libraryCustom[0].name,aliases:d.libraryCustom[0].aliases,size:d.libraryCustom[0].img.length};
  }
  return {failed:true,notice:document.getElementById('notice').textContent};
 });
 assert.equal(lib.name,'Collab Padoru');assert.equal(lib.revision,4);assert.ok(lib.size>20);
 console.log('STAGE21 BROWSER LIBRARY',JSON.stringify(lib));
 const anonymous=await callBrowser(async function(){
  document.getElementById('auth').value='';
  const title=document.getElementById('title');title.value='Unauthorized title';title.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,1100));
  const d=await(await fetch('/departures/api/public',{cache:'no-store'})).json();
  return {revision:d.revision,title:d.events[0].title,notice:document.getElementById('notice').textContent};
 });
 assert.equal(anonymous.revision,4);assert.equal(anonymous.title,'Killer Chat hosted edit');
 console.log('STAGE21 BROWSER ANONYMOUS DENIAL',JSON.stringify(anonymous));
 console.log('STAGE21 BROWSER PASS: event edit, library share, and anonymous denial via real Chrome + isolated Worker');
}finally{
 try{socket?.close();}catch{}
 try{chrome?.kill('SIGKILL');}catch{}
 if(server)await new Promise(r=>server.close(r));
 if(dir)try{rmSync(dir,{recursive:true,force:true,maxRetries:2,retryDelay:100});}catch(err){console.warn('Chrome cleanup skipped '+err.code);}
}

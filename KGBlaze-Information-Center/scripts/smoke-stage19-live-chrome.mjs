import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const available=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
const bin=available.find(x=>spawnSync(x,['--version'],{encoding:'utf8',timeout:2000}).status===0);
assert.ok(bin,'Chrome is needed for production-panel verification');
const dir=mkdtempSync(join(tmpdir(),'relight-stage19-live-'));
let chrome=null,socket=null;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 chrome=spawn(bin,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
   '--no-first-run','--no-default-browser-check','--remote-debugging-port=0',
   '--user-data-dir='+dir,'about:blank'],{stdio:'ignore'});
 const portfile=join(dir,'DevToolsActivePort');
 for(let i=0;!existsSync(portfile)&&i<80;i++)await pause(150);
 assert.ok(existsSync(portfile),'Chrome DevTools did not start');
 const port=Number(readFileSync(portfile,'utf8').split('\n')[0]);
 assert.ok(port>0);
 let list;
 for(let i=0;i<30;i++){
  try{list=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(list?.length)break;}catch{}
  await pause(100);
 }
 const target=list?.find(x=>x.type==='page');
 assert.ok(target?.webSocketDebuggerUrl,'Cannot find Chrome page target');
 socket=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map();
 socket.addEventListener('message',m=>{
  const msg=JSON.parse(m.data);
  if(!msg.id)return;
  const call=pending.get(msg.id);
  if(!call)return;
  pending.delete(msg.id);
  if(msg.error)call.reject(Error(JSON.stringify(msg.error)));else call.resolve(msg.result);
 });
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const call=++id;pending.set(call,{resolve,reject});
  socket.send(JSON.stringify({id:call,method,params}));
 });
 await send('Page.enable');
 const url='https://kgblaze.dpdns.org/departures/?flight=tw%3A306ddb27-c0d3-4030-bd9f-f7689b529582';
 await send('Page.navigate',{url});
 await pause(2500);
 const expression=`(async function(){
  const wanted='tw:306ddb27-c0d3-4030-bd9f-f7689b529582';
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let found=false,exception=null;
  for(let i=0;i<50;i++){
   try {
    let candidates=typeof getVisible==='function'?getVisible().visible:[];
    let item=candidates.find(e=>e.id===wanted);
    if(!item&&typeof publicState!=='undefined'){
     item=(publicState.events||[]).find(e=>e.id===wanted);
    }
    if(item&&typeof showSelectedFlight==='function'){
     found=true;selectedFlightId=wanted;showSelectedFlight([item]);break;
    }
   }catch(e){exception=String(e);}
   await delay(200);
  }
  for(let i=0;i<45;i++){
   const p=document.querySelector('#flightContent .flight-category-box img');
   if(p?.src?.includes('/ttv-boxart/'))break;
   await delay(200);
  }
  const panel=document.querySelector('#flightContent .flight-row-top');
  const pic=panel?.querySelector('.flight-category-box img');
  const led=panel?.querySelector('.flight-light');
  const txt=panel?.querySelector('.flight-dateblock');
  return {found,exception,source:pic?.src||null,decoded:Boolean(pic&&pic.complete&&pic.naturalWidth>0),
   imageCount:panel?.querySelectorAll('.flight-category-box').length||0,
   ledPresent:Boolean(led),ledWidth:led?.getBoundingClientRect().width||0,
   textPresent:Boolean(txt),title:document.title};
 })()`;
 const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 const value=result?.result?.value;
 if(!value)throw Error('Public Chrome evaluation failed '+JSON.stringify(result?.exceptionDetails||result));
 console.log('STAGE19 LIVE CHROME',JSON.stringify(value));
 assert.equal(value.found,true,'Published Killer Chat event was not selectable');
 assert.equal(value.exception,null,'Browser error occurred during card display');
 assert.match(value.source||'',/^https:\/\/static-cdn\.jtvnw\.net\/ttv-boxart\//,
  'Expanded card must render the official Twitch category, not calendar upload');
 assert.equal(value.imageCount,1,'Category image must not duplicate');
 assert.equal(value.ledPresent,true,'Existing luminous status indicator must remain in card');
 assert.equal(value.decoded,true,'The official box-art image must decode in the actual public browser');
 console.log('STAGE19 LIVE CHROME PASS: authentic Killer Chat cover decoded beside the existing status LED.');
}finally{
 try{socket?.close();}catch{}
 try{chrome?.kill('SIGKILL');}catch{}
 // Chrome writes its profile asynchronously while shutting down. Retry
 // ENOTEMPTY instead of turning a successful browser assertion into failure.
 try{rmSync(dir,{recursive:true,force:true,maxRetries:20,retryDelay:200});}
 catch(e){console.warn('Chrome temporary profile cleanup skipped: '+e.code);}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import worker from '../src/worker.mjs';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_SSR_JS,VIEWER_PORTAL_PREFIX,VIEWER_PORTAL_SUFFIX} from '../src/viewer-portal-ssr.mjs';

test('approved Home corrections are actually in the published HTML source',()=>{
 const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
 for(const name of ['Información de viaje','Vuela con nosotros','Métodos de apoyo disponibles'])assert.ok(home.includes(name));
 assert.doesNotMatch(home,/class="symbol">♫/);
 assert.match(home,/headphones-mark/);
 assert.match(home,/\/assets\/icons\/kgblaze-headphones-white\.svg/,'Home renders SVG file via real asset URL');
 const headphones=readFileSync(fileURLToPath(new URL('../public/assets/icons/kgblaze-headphones-white.svg',import.meta.url)),'utf8');
 assert.match(headphones,/<svg/);
 assert.equal((headphones.match(/<path fill="#(?:FFFFFF|fff)"/gi)||[]).length,3,'approved headphones: solid arch and two solid earcups');
 assert.match(headphones,/M14\.5 64\.5V52\.5/,'continuous filled headband');
 assert.match(headphones,/M25\.1 59\.1/,'filled left earcup');
 assert.match(headphones,/M74\.9 59\.1/,'filled right earcup');
 assert.doesNotMatch(headphones,/microphone|mic[-_ ]|<circle/i,'approved icon has no microphone');
 assert.match(home,/background:var\(--pink\);margin-top:18px/);
 assert.doesNotMatch(home,/\.section h2:before\{/);
 assert.ok((home.match(/class="kg-social-icon"/g)||[]).length>=10);
 assert.doesNotMatch(home,/<small>(?:YouTube|Twitch|Instagram|X|Discord)<\/small>/,'icon-only social links');
 assert.match(home,/Terminals A & B/);
 assert.match(home,/class="kg-clean-footer"/);
 assert.match(home,/id="youtube-screen"/,'preserve original audiovisual module');
 assert.match(home,/class="symbol departure-mark"/,'preserve approved bimotor');
});

test('the Cloudflare Worker injects V6 only for public non-embedded Terminal',async()=>{
 const html='<!doctype html><html><head><title>Legacy Terminal</title></head><body><main id="viewerShell"><aside id="informationPanel"></aside></main></body></html>';
 const old=globalThis.HTMLRewriter;
 class Rewriter{
  handlers=[];
  on(selector,listener){this.handlers.push([selector,listener]);return this}
  async transform(response){
   let output=await response.text();
   for(const [selector,listener] of this.handlers){
    if(!['head','body'].includes(selector))continue;
    const extras=[],prefix=[],attrs={};
    listener.element({append(value){extras.push(value)},prepend(value){prefix.push(value)},setAttribute(key,value){attrs[key]=value},setInnerContent(){}});
    if(selector==='body'&&attrs.class)output=output.replace('<body>','<body class="'+attrs.class+'">');
    output=output.replace('<'+selector+(selector==='body'&&attrs.class?' class="'+attrs.class+'"':'')+'>',match=>match+prefix.join(''));
    output=output.replace('</'+selector+'>',extras.join('')+'</'+selector+'>');
   }
   return new Response(output,{status:response.status,headers:response.headers});
  }
 }
 globalThis.HTMLRewriter=Rewriter;
 const env={DB:{prepare(){return{first:async()=>null}}},ASSETS:{fetch:async()=>new Response(html,{headers:{'Content-Type':'text/html'}})}};
 try{
  const site=await worker.fetch(new Request('https://kgblaze.dpdns.org/departures/'),env);
  assert.equal(site.status,200);
  const body=await site.text();
  assert.ok(body.includes(VIEWER_PORTAL_SSR_JS),'V6 executable must be sent to the real Worker route');
  assert.ok(body.includes(VIEWER_PORTAL_PREFIX),'V6 HTML header must arrive before JS');
  assert.ok(body.includes(VIEWER_PORTAL_SUFFIX),'V6 HTML social/footer must arrive before JS');
  assert.ok(body.includes('body class="kg-portal-viewer"'),'V6 CSS must be enabled by HTML, not merely script');
  assert.ok(body.includes(VIEWER_PORTAL_CSS),'V6 styling must be sent to the real Worker route');
  const embedded=await worker.fetch(new Request('https://kgblaze.dpdns.org/departures/?embed=1'),env);
  assert.equal(embedded.status,200);
  const embed=await embedded.text();
  assert.ok(!embed.includes(VIEWER_PORTAL_SSR_JS),'Embedded viewer must remain without external chrome');
  assert.ok(!embed.includes(VIEWER_PORTAL_CSS),'Embedded viewer must remain without external chrome styles');
 }finally{
  if(old===undefined)delete globalThis.HTMLRewriter;else globalThis.HTMLRewriter=old;
 }
});

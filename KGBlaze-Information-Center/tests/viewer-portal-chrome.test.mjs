import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {VIEWER_PORTAL_CSS,VIEWER_PORTAL_JS} from '../src/viewer-portal-chrome.mjs';
import {KG_SOCIAL_ORIGINALS} from '../src/music-social-icons.mjs';

test('Stage38 V6 exterior has valid browser script and original five social assets',()=>{
 assert.doesNotThrow(()=>new Function(VIEWER_PORTAL_JS));
 for(const key of ['yt','tw','ig','x','dc']){
  assert.match(KG_SOCIAL_ORIGINALS[key],/^data:image\/png;base64,/);
  assert.ok(VIEWER_PORTAL_JS.includes(KG_SOCIAL_ORIGINALS[key]),'original icon '+key+' was not injected');
 }
 assert.match(VIEWER_PORTAL_CSS,/\.viewer-header\{display:none!important\}/);
 assert.match(VIEWER_PORTAL_CSS,/\.board-wrap\{width:100%;max-width:1080px;aspect-ratio:1\}/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-social-mobile\{display:flex;position:fixed/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-legend-items/);
 assert.doesNotMatch(VIEWER_PORTAL_JS,/Controles de semana del visor original|Salida de ejemplo|Área reservada/);
});

test('Stage38 exterior never activates in embedded public viewer',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>true,add:()=>changed++}}};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/departures/',search:'?embed=1'},URLSearchParams,console});
 assert.equal(changed,0);
});
test('Stage38 exterior never activates when original viewer DOM is unavailable',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>false,add:()=>changed++}},getElementById:()=>null};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/departures/',search:''},URLSearchParams,console});
 assert.equal(changed,0);
});
test('Stage38 exterior never activates on non-Terminal routes',()=>{
 let changed=0;
 const doc={body:{classList:{contains:()=>false,add:()=>changed++}}};
 vm.runInNewContext(VIEWER_PORTAL_JS,{document:doc,location:{pathname:'/music/songs/',search:''},URLSearchParams,console});
 assert.equal(changed,0);
});

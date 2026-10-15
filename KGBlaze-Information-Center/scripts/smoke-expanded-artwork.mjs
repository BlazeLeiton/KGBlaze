import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {VIEWER_CSS,VIEWER_JS} from '../src/viewer-enhancements.mjs';

// Render the REAL published viewer HTML in headless Chrome; DOM-mock tests alone
// cannot prove that an inserted image is decoded, visible or attached to the
// legacy panel. No production writes, secrets, network or agenda alterations.
const candidates=[process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
const chrome=candidates.find(bin=>spawnSync(bin,['--version'],{encoding:'utf8'}).status===0);
assert.ok(chrome,'Headless Chrome is required to test the actual public flight panel');

const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',
  year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
  .filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
const today=new Date(Date.UTC(parts.year,parts.month-1,parts.day));
today.setUTCDate(today.getUTCDate()-(today.getUTCDay()+6)%7);
const day=today.toISOString().slice(0,10);
const fixture={schema:'relight-public-v1',sourceNote:'Local CI fixture',events:[
 {id:'ci-category-art',title:'Collab Padoru',category:'Azur Lane',day,time:'22:00',
  status:'A TIEMPO',origin:'manual',logoChoice:'auto',platforms:['yt','tw']}
],libraryChanges:{},libraryCustom:[],hiatusWeeks:{},clearedWeeks:{},sync:{}};
let html=readFileSync(resolve('public/index.html'),'utf8');
// This smoke opens the page via file:// (no Worker). Point the new shared PNG
// assets to their ACTUAL local files; production still uses /departures/assets/.
const offlineAssetBase=new URL('../public/assets/relight/art/',import.meta.url).href;
assert.match(html,/const BUILTIN_ART_BASE=[^\\n]+;/);
html=html.replace(/const BUILTIN_ART_BASE=[^\\n]+;/,'const BUILTIN_ART_BASE='+JSON.stringify(offlineAssetBase)+';');
const boot=/const BOOT_DATA=\{[\s\S]*?\};(?=\s*async function refreshPublishedAgenda)/;
assert.match(html,boot);
html=html.replace(boot,()=>`const BOOT_DATA=${JSON.stringify(fixture)};`);
assert.ok(html.includes('</head>')&&html.includes('</body>'));
html=html.replace('</head>',()=>`<style>${VIEWER_CSS}</style></head>`);
// Save the genuine legacy renderer before injecting the enhancement. A second
// rebuild BYPASSES the wrapper: only the observer can restore artwork then.
const check=`<script>
let legacyReplaced=false;
let widthsTested=0;
const widthsToTest=[335,260];
const sidebar=document.querySelector('.panel-side');
setInterval(()=>{
 const panel=document.querySelector('#flightContent .flight-row-top');
 const box=panel?.querySelector('.flight-category-box');
 const pic=box?.querySelector('img');
 if(!legacyReplaced){
  if(pic?.complete&&pic.naturalWidth>0){
   legacyReplaced=true;
   if(sidebar){sidebar.style.boxSizing='border-box';sidebar.style.width=widthsToTest[0]+'px';sidebar.style.maxWidth=widthsToTest[0]+'px';}
   window.__legacyFlightRenderer(getVisible().visible);
  }
  return;
 }
 // The artwork being visible is not enough: the legacy LED must occupy
 // real pixels, the text must have a usable column and the three areas must
 // not overlap. PR #28 had only checked that the .flight-light node existed.
 const light=panel?.querySelector('.flight-light');
 const text=panel?.querySelector('.flight-dateblock');
 const imgRect=pic?.getBoundingClientRect();
 const ledRect=light?.getBoundingClientRect();
 const textRect=text?.getBoundingClientRect();
 const artRect=box?.getBoundingClientRect();
 const lightStyle=light?getComputedStyle(light):null;
 const imageStyle=pic?getComputedStyle(pic):null;
 const ok=Boolean(pic&&pic.complete&&pic.naturalWidth>0
   &&imgRect?.width>0&&imgRect?.height>0&&imageStyle?.display!=='none'
   &&ledRect?.width>=4&&ledRect?.height>=36
   &&lightStyle?.display!=='none'&&lightStyle?.visibility!=='hidden'
   &&lightStyle?.backgroundColor!=='rgba(0, 0, 0, 0)'
   &&textRect?.width>=45&&textRect?.height>0
   &&artRect?.width>=65&&artRect?.height>0
   &&ledRect.right<textRect.left&&textRect.right<=artRect.left+1
   &&panel.querySelectorAll('.flight-category-box').length===1
   &&(!sidebar||artRect.right<=sidebar.getBoundingClientRect().right+1));
 if(ok){
  widthsTested++;
  if(widthsTested<widthsToTest.length&&sidebar){
   sidebar.style.width=widthsToTest[widthsTested]+'px';
   sidebar.style.maxWidth=widthsToTest[widthsTested]+'px';
  }else document.documentElement.setAttribute('data-relight-artwork-test','PASS');
 }
},100);
<\/script>`;
// Reproduce the Wrangler/esbuild-produced name helper dependency in the
// actual Chrome-rendered legacy panel, not just a Node DOM mock.
const rawNeedle='const norm=s=>';
assert.ok(VIEWER_JS.includes(rawNeedle),'Expected matcher function in injected script');
const browserViewerJS=VIEWER_JS.replace(rawNeedle,
  "const bundleProbe=__name(value=>value,'bundleProbe');if(bundleProbe('ok')!=='ok')throw Error('Name helper failed');const norm=s=>");
html=html.replace('</body>',()=>`<script>window.__legacyFlightRenderer=showSelectedFlight;</script><script>${browserViewerJS}</script>${check}</body>`);
const dir=mkdtempSync(join(tmpdir(),'relight-real-viewer-'));
try{
 const page=join(dir,'index.html');writeFileSync(page,html);
 const url=pathToFileURL(page).href+'?flight=ci-category-art';
 const result=spawnSync(chrome,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
   '--no-first-run','--virtual-time-budget=6000','--dump-dom',url],{
    encoding:'utf8',timeout:30000,maxBuffer:20000000
   });
 assert.equal(result.status,0,'Chrome failed: '+(result.stderr||'').slice(-700));
 assert.match(result.stdout,/data-relight-artwork-test="PASS"/,
  'Actual legacy renderer rebuild did not restore one decoded, visible category image beside the status LED');
 console.log('PASS: real public viewer HTML renders visible category art and preserves LED.');
}finally{rmSync(dir,{recursive:true,force:true});}

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
const boot=/const BOOT_DATA=\{[\s\S]*?\};(?=\s*async function refreshPublishedAgenda)/;
assert.match(html,boot);
html=html.replace(boot,()=>`const BOOT_DATA=${JSON.stringify(fixture)};`);
assert.ok(html.includes('</head>')&&html.includes('</body>'));
html=html.replace('</head>',()=>`<style>${VIEWER_CSS}</style></head>`);
const check=`<script>
setInterval(()=>{
 const panel=document.querySelector('#flightContent .flight-row-top');
 const box=panel?.querySelector('.flight-category-box');
 const pic=box?.querySelector('img');
 const bounds=pic?.getBoundingClientRect();
 const ok=Boolean(pic&&pic.complete&&pic.naturalWidth>0&&bounds?.width>0&&bounds?.height>0
   &&getComputedStyle(pic).display!=='none'
   &&panel.querySelector('.flight-light'));
 if(ok)document.documentElement.setAttribute('data-relight-artwork-test','PASS');
},100);
<\/script>`;
html=html.replace('</body>',()=>`<script>${VIEWER_JS}</script>${check}</body>`);
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
  'Real expanded-panel artwork did not render a decoded, visible image beside the status LED');
 console.log('PASS: real public viewer HTML renders visible category art and preserves LED.');
}finally{rmSync(dir,{recursive:true,force:true});}

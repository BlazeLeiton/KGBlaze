import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='https://kgblaze.dpdns.org';
const {works}=JSON.parse(await readFile(new URL('../public/music-artwork/preserved-v2.json',import.meta.url),'utf8'));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let last;
for(let attempt=0;attempt<24;attempt++){
 try{
  const suffix='?lang=es&arcana-check='+Date.now();
  const response=await fetch(origin+'/music/'+suffix,{signal:AbortSignal.timeout(15000),cache:'no-store'});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.equal((html.match(/<article class="song"/g)||[]).length,50);
  assert.match(html,/data-composite="medley"/);
  assert.match(html,/data-art-slug="tempestas-claim"/);
  const all=Object.entries(works);
  for(let i=0;i<all.length;i+=8)await Promise.all(all.slice(i,i+8).map(async([slug,a])=>{
   const r=await fetch(origin+a.path,{signal:AbortSignal.timeout(15000),cache:'no-store'});
   assert.equal(r.status,200,slug);
   const data=Buffer.from(await r.arrayBuffer());
   assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256,slug);
  }));
  console.log('Production verified: 50 catalogue cards and all 50 artwork hashes at '+origin);
  process.exit(0);
 }catch(e){last=e;console.log('Deployment check '+(attempt+1)+': '+e.message);if(attempt<23)await delay(5000);}
}
throw last;

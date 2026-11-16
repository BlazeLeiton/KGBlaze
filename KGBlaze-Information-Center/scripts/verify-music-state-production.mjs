import assert from 'node:assert/strict';
const base='https://kgblaze.dpdns.org';
for(let i=0;i<24;i++){try{
 const r=await fetch(base+'/music/songs/song/blue-spirit/',{cache:'no-store',headers:{Cookie:'kgblaze_lang=ja'}});
 assert.equal(r.status,200);const h=await r.text();assert.match(h,/<html lang="ja"/);assert.match(h,/translateX\(100%\)/);
 const d=await (await fetch(base+'/music/data/song/blue-spirit.json',{cache:'no-store'})).json();assert.equal(d.slug,'blue-spirit');assert.ok(d.locales.es.en.lyrics.es.cells.length);
 const dep=await (await fetch(base+'/departures/',{cache:'no-store'})).text();assert.ok(dep.includes('kgblaze.locale.v1'));
 assert.equal((await fetch(base+'/music/album/test/')).status,404);
 console.log('Production verified: canonical song routes, song payload, right-slide, shared locale, reserved albums.');process.exit(0);
 }catch(e){console.log(i+1,e.message.slice(0,250));if(i===23)throw e;await new Promise(r=>setTimeout(r,5000))}}

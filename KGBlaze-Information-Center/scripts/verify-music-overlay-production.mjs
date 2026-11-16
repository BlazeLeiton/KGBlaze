import assert from 'node:assert/strict';
const base='https://kgblaze.dpdns.org';
for(let i=0;i<24;i++){
 try{
  const html=await (await fetch(base+'/music/songs/?lang=es&check='+Date.now(),{cache:'no-store'})).text();
  assert.match(html,/music-overlay-panel/);assert.match(html,/music\/songs/);
  const response=await fetch(base+'/music/songs/blue-spirit/?lang=es&version=en&lyric=en&compare=es&fragment=1',{cache:'no-store'});
  const h=await response.text();
  assert.equal(response.status,200);assert.match(h,/^<div id="music-content"/);assert.doesNotMatch(h,/<!doctype/);assert.match(h,/parallel-pairs/);assert.match(h,/color-part/);
  console.log('Production: overlay fragment and structured comparisons verified');process.exit(0);
 }catch(e){console.log('Deployment check '+(i+1)+': '+e.message.slice(0,300));if(i===23)throw e;await new Promise(r=>setTimeout(r,5000))}
}

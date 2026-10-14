import test from 'node:test';
import assert from 'node:assert/strict';

const portal='https://kgblaze.dpdns.org/departures/';
const worker='https://kgblaze-terminal.drago68575.workers.dev/';
const killer='tw:306ddb27-c0d3-4030-bd9f-f7689b529582';
async function get(url){
 const resp=await fetch(url,{headers:{'Cache-Control':'no-cache',Accept:'*/*'},signal:AbortSignal.timeout(15000)});
 assert.equal(resp.status,200,'Public GET '+url+' should succeed');
 return resp;
}
test('STAGE19 LIVE: public portal serves merged category-first JS and LED CSS',async()=>{
 const html=await (await get(portal+'?stage19-verification=31')).text();
 assert.match(html,/<!doctype html/i);
 assert.ok(html.includes('const sources=editorial.isGenericChat?'),'LIVE_WORKER_STILL_HAS_OLD_ART_PRIORITY');
 assert.ok(html.includes("const categoryArt=v?.source==='category'?official:null"),'LIVE_VIEWER_MISSING_OFFICIAL_CATEGORY_FIRST');
 assert.ok(html.includes('const __name='),'LIVE_VIEWER_MISSING_STAGE18_HELPER');
 assert.ok(html.includes('.flight-row-top>.flight-light{align-self:stretch;min-height:36px}'),'LIVE_VIEWER_MISSING_LED_CSS');
 assert.ok(!html.includes('const categoryArt=explicit||editorial.category'),'LIVE_VIEWER_HAS_OBSOLETE_UPLOAD_PRIORITY');
 console.log('STAGE19 PRODUCTION PASS: official category-first script and original LED CSS on vanity domain');
});
test('STAGE19 LIVE: direct Worker serves same category-first improvement',async()=>{
 const html=await (await get(worker+'?stage19-verification=31')).text();
 assert.ok(html.includes('const sources=editorial.isGenericChat?'),'WORKERS_DEV_STILL_HAS_OLD_ART_PRIORITY');
 console.log('STAGE19 WORKERS_DEV PASS: official category-first viewer');
});
test('STAGE19 LIVE: published Killer Chat event preserved and authentic Twitch box art resolved',async()=>{
 const data=await (await get(portal+'api/public')).json();
 const event=data.events?.find(e=>e.id===killer);
 assert.ok(event,'Killer Chat! must remain in the published agenda');
 assert.equal(event.logoChoice,'upload','Calendar logo selection is unchanged');
 assert.equal(event.category,'Killer Chat!: Original Edition');
 const v=await (await get(portal+'api/public/twitch-box-art?eventId='+encodeURIComponent(killer))).json();
 assert.equal(v.source,'category');
 assert.match(v.artUrl,/^https:\/\/static-cdn\.jtvnw\.net\/ttv-boxart\//);
 console.log('STAGE19 PRODUCTION PASS: Killer Chat calendar upload preserved; authentic category art available');
});

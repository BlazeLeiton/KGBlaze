import assert from 'node:assert/strict';
const base='https://kgblaze.dpdns.org';
for(let i=0;i<24;i++){try{
 const d=await (await fetch(base+'/music/data/catalog.json',{cache:'no-store'})).json();
 const h=d.locales.es, cards=h.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g);
 assert.equal(cards.length,50);assert.equal(cards.filter(c=>c.match(/data-families="([^"]*)"/)[1].split('|').includes('Azur Lane')).length,9);
 assert.match(h,/data-filter-affiliation="holo-en holo-jp holo-id"/);
 const s=await (await fetch(base+'/music/data/song/signal.json',{cache:'no-store'})).json();assert.match(s.locales.es.es.html,/<dt>Evento<\/dt><dd>Operation Siren<\/dd>/);
 const t=await (await fetch(base+'/music/data/song/tempestas-claim.json',{cache:'no-store'})).json();assert.match(t.locales.es.es.html,/Tempesta and the Fountain of Youth/);
 console.log('Production editorial catalogue and events verified');process.exit(0);
 }catch(e){console.log(i+1,e.message.slice(0,200));if(i===23)throw e;await new Promise(r=>setTimeout(r,5000))}}

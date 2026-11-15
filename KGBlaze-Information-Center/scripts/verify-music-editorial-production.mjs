import assert from 'node:assert/strict';
const base='https://kgblaze.dpdns.org';
for(let i=0;i<24;i++){try{
 const d=await(await fetch(base+'/music/data/catalog.json',{cache:'no-store'})).json();
 const h=d.locales.es,cards=h.match(/<article class="song"[^>]*>[\s\S]*?<\/article>/g);
 assert.equal(cards.length,50);
 const n=k=>cards.filter(c=>c.match(/data-primary-series="([^"]+)"/)?.[1].split('|').includes(k)).length;
 for(const [k,count] of [['Azur Lane',9],['Kantai Collection',2],['High School Fleet',2],['Arpeggio of Blue Steel',2],['Pokémon',1],['Love Live!',3],['hololive',5]])assert.equal(n(k),count,k);
 const signal=await(await fetch(base+'/music/data/song/signal.json',{cache:'no-store'})).json();
 assert.match(signal.locales.es.es.html,/<dt>Evento<\/dt><dd>Operation Siren<\/dd>/);
 assert.match(signal.locales.ja.es.html,/<dt>イベント<\/dt><dd>セイレーン作戦<\/dd>/);
 const temp=await(await fetch(base+'/music/data/song/tempestas-claim.json',{cache:'no-store'})).json();
 assert.match(temp.locales.en.es.html,/<dt>Event<\/dt><dd>Tempesta and the Fountain of Youth<\/dd>/);
 console.log('Production verified: seven primary filters, medley membership, localized events.');process.exit(0);
 }catch(e){console.log(i+1,e.message.slice(0,250));if(i===23)throw e;await new Promise(r=>setTimeout(r,5000))}}

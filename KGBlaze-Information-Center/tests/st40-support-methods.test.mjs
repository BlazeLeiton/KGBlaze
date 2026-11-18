import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
const read=x=>readFileSync(fileURLToPath(new URL(x,import.meta.url)));
const home=read('../public/home.html').toString();
const languages=runInNewContext('('+home.match(/const LANG=(\{[\s\S]*?\});\s*const SHARED_LOCALE_KEY/)[1]+')');
test('Stage 40 support panel has four actual platform marks and accessible disclosure',()=>{
 assert.equal((home.match(/class="kg-support-method(?: kg-support-method-static)?"/g)||[]).length,4);
 for(const path of ['kgblaze-support-kofi.svg','kgblaze-support-youtube.png','kgblaze-support-twitch.png','kgblaze-support-throne.svg'])assert.ok(home.includes('/assets/icons/'+path));
 assert.match(home,/id="kg-support-toggle"[^>]*aria-expanded="false"/);
 assert.match(home,/id="kg-support-info-panel" hidden/);
 assert.match(home,/supportPanel.hidden=!opened/);
 assert.match(home,/scroll-snap-type:x mandatory/);
 assert.match(home,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(home,/font-size:14\.5px;line-height:1\.4/);
 assert.match(home,/supportDots\.forEach/);
 assert.doesNotMatch(home,/href="https:\/\/throne\.com\/blazeleiton"/);
 assert.doesNotMatch(home,/id="support"[^>]*>[\s\S]*?Ver todas las opciones/);
});
test('Support method descriptions are present and translated to ES EN JA',()=>{
 const keys=['support','supportShow','supportHide','supportHow','supportPlatforms','supportKofi','supportYouTube','supportTwitch','supportThrone','supportDetailKofi','supportDetailYouTube','supportDetailTwitch','supportDetailThrone'];
 for(const locale of ['es','en','ja'])for(const key of keys)assert.equal(typeof languages[locale][key],'string',locale+' '+key);
 assert.equal(languages.es.support,'Métodos de apoyo disponibles');
 assert.equal(languages.es.supportYouTube,'Membresías · Supers');
 assert.equal(languages.es.supportTwitch,'Bits · Suscripciones');
 assert.equal(languages.es.supportDetailKofi,'Donaciones únicas o periódicas y solicitudes de comisiones.');
 assert.equal(languages.es.supportDetailThrone,'Regalos mediante la lista de deseos.');
 assert.ok(!languages.es.supportDetailYouTube.includes('Premium'));
});
test('Brand assets are present without invented logos or an enclosing Ko-fi blue circle',()=>{
 const kofi=read('../public/assets/icons/kgblaze-support-kofi.svg').toString();
 const throne=read('../public/assets/icons/kgblaze-support-throne.svg').toString();
 assert.match(kofi,/<svg/);assert.match(kofi,/fill="#FF6433"/);
 assert.doesNotMatch(kofi,/<circle/);
 assert.match(throne,/<linearGradient/);
 for(const p of ['kgblaze-support-youtube.png','kgblaze-support-twitch.png'])assert.equal(read('../public/assets/icons/'+p).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
});
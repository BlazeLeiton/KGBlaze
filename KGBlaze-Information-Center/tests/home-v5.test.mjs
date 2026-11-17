import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../src/worker.mjs';
import {routePortalRequest} from '../src/portal-route.mjs';

const html=readFileSync(new URL('../public/home.html',import.meta.url),'utf8');
const portal='https://kgblaze.dpdns.org';

test('V5 approved checkpoint is present and references no unreleased audio',()=>{
 const text=readFileSync(new URL('../docs/RELIGHT_HOME_V5_APPROVED_CP01_2026-11-17.md',import.meta.url),'utf8');
 assert.match(text,/APROBADO PARA IMPLEMENTACIÓN EN RAMA DE PRUEBA/);
 assert.match(text,/reproductor propio, audios y descargas \*\*EN PAUSA\*\*/i);
});
test('KGBlaze homepage follows approved design and language choices',()=>{
 for(const word of ['BLAZE LEITON — VTUBER · VSINGER','Explora nuestros destinos','Terminales A y B','Vuela con nosotros','Métodos de apoyo disponibles','Próximas salidas','Rebel Mix'])assert.ok(html.includes(word),word);
 for(const color of ['#020C41','#0B1761','#276EF1','#A5EBFF','#FA0073','#551E5F','#F2F2F0'])assert.ok(html.includes(color),color);
 assert.ok(html.includes("M2 5H32 M2 13H32"));
 assert.ok(html.includes("M32 5H62 M32 13H62"));
 assert.match(html,/stroke-width="1"/);
 assert.match(html,/stroke-width="2"/);
 assert.match(html,/\.overlay\.open\{display:block;position:fixed;z-index:80;top:60px;bottom:65px;/);
 assert.match(html,/\.social-bottom\{display:flex;position:fixed;z-index:90;/);
 assert.match(html,/\.hero:after\{[^}]*height:55%;/);
 assert.ok(html.includes("data-lang=\"es\"")&&html.includes("data-lang=\"en\"")&&html.includes("data-lang=\"ja\""));
 for(const s of ['出発','旅先を探そう','旅行情報','一緒に飛ぼう','応援方法'])assert.ok(html.includes(s),s);
 assert.ok(!html.includes('BIENVENIDO A KG BLAZE')&&!html.includes('Dreamshifter'));
});
test('socials, Terminal and Rebel Mix use verified public links; unpublished sections are not dead anchors',()=>{
 for(const url of ['/departures/','/music/','https://www.youtube.com/@BlazeLeiton','https://www.twitch.tv/blazeleiton','https://www.instagram.com/blazeleiton/','https://x.com/BlazeLeiton','https://discord.gg/n8HFKxhynt'])assert.ok(html.includes(url),url);
 assert.equal(html.includes('href="/music/albums/"'),false);
});
test('root serves V5 only on portal hostname; worker dev remains original viewer and public Terminal stays isolated',async()=>{
 const assets=[];
 const env={DB:{prepare(){return{first:async()=>null}}},ASSETS:{fetch:async req=>{const p=new URL(req.url).pathname;assets.push(p);return new Response(p==='/'?'OLD VIEWER':'KG HOME',{headers:{'Content-Type':'text/html'}})}}};
 const portalRoot=await worker.fetch(new Request(portal+'/'),env);
 assert.equal(portalRoot.status,200);assert.equal(await portalRoot.text(),'KG HOME');
 const index=await worker.fetch(new Request(portal+'/index.html'),env);
 assert.equal(index.status,200);assert.equal(await index.text(),'KG HOME');
 const terminal=await worker.fetch(new Request(portal+'/departures/'),env);
 assert.equal(terminal.status,200);assert.equal(await terminal.text(),'OLD VIEWER');
 const old=await worker.fetch(new Request('https://kgblaze-terminal.drago68575.workers.dev/'),env);
 assert.equal(old.status,200);assert.equal(await old.text(),'OLD VIEWER');
 assert.deepEqual(assets,['/home.html','/home.html','/','/']);
 assert.equal(routePortalRequest(new Request(portal+'/')).response,undefined);
});
test('no unexpected public admin alias from homepage update',()=>{
 const blocked=routePortalRequest(new Request(portal+'/api/admin/publish'));
 assert.equal(blocked.response?.status,404);
});

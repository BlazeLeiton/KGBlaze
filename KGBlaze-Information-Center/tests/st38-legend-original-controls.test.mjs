import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {VIEWER_STATUS_LIGHT_GROUPS,VIEWER_PORTAL_LEGEND,VIEWER_PORTAL_SSR_JS,VIEWER_PORTAL_SUFFIX} from '../src/viewer-portal-ssr.mjs';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {musicSocialLinks} from '../src/music-social-icons.mjs';

test('all nine original Terminal statuses belong to one correct lamp-color group',()=>{
 const html=readFileSync(fileURLToPath(new URL('../public/index.html',import.meta.url)),'utf8');
 const m=html.match(/const STATUS=\[([^\]]+)\]/);
 assert.ok(m,'original viewer should contain its canonical statuses');
 const statuses=Array.from(m[1].matchAll(/'([^']+)'/g),x=>x[1]);
 const grouped=VIEWER_STATUS_LIGHT_GROUPS.flatMap(g=>g.statuses);
 assert.equal(statuses.length,9);
 assert.equal(new Set(grouped).size,9,'no status should appear in multiple groups');
 assert.deepEqual(new Set(grouped),new Set(statuses));
 assert.deepEqual(VIEWER_STATUS_LIGHT_GROUPS.map(g=>g.color),['#67D9F7','#F5BF47','#36D978','#ED006F','#62739D']);
 assert.deepEqual(VIEWER_STATUS_LIGHT_GROUPS.map(g=>g.statuses),[
  ['A TIEMPO'],['POR CONFIRMAR','REPROGRAMADO'],['EN VIVO'],['CANCELADO'],['DESPEGÓ','DESCANSO','ESCALA','HIATUS']
 ]);
 // The grouped indicator colors are the original left-side LED lights, not PALETTE badge colors.
 for(const c of ['#67D9F7','#F5BF47','#36D978','#ED006F','#62739D'])assert.ok(html.includes(c));
 for(const g of VIEWER_STATUS_LIGHT_GROUPS)assert.ok(VIEWER_PORTAL_LEGEND.includes('data-statuses="'+g.statuses.join('|')+'"'));
 assert.match(VIEWER_PORTAL_LEGEND,/>Leyenda</);
});

test('Terminal header inherits original live language-button listeners',()=>{
 const html=readFileSync(fileURLToPath(new URL('../public/index.html',import.meta.url)),'utf8');
 assert.match(html,/class="lang-options top-langs"/);
 assert.match(html,/for\(const btn of document.querySelectorAll\('\[data-lang\]'\)\)btn.addEventListener\('click',\(\)=>setLang/);
 assert.match(VIEWER_PORTAL_SSR_JS,/targetLangs.replaceChildren\(\.\.\.originalButtons\)/);
 assert.ok(VIEWER_PORTAL_SSR_JS.includes("oldLangNav.querySelectorAll('button[data-lang]')"));
 assert.match(VIEWER_PORTAL_SSR_JS,/element.textContent!==t.info/);
 for(const language of ['es','en','ja'])assert.ok(VIEWER_PORTAL_SSR_JS.includes(language+':{'));
 assert.match(VIEWER_PORTAL_CSS,/#sideKicker::before/,'fallback heading survives asynchronous original board re-renders');
});
test('all three global social rails have icon-only links and accessible names',()=>{
 const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
 assert.doesNotMatch(home,/<small>(YouTube|Twitch|Instagram|X|Discord)<\/small>/);
 assert.doesNotMatch(musicSocialLinks(),/<small>/);
 assert.doesNotMatch(VIEWER_PORTAL_SUFFIX,/<small>/);
 for(const name of ['YouTube','Twitch','Instagram','X','Discord']){
  assert.ok(home.includes('aria-label="'+name+'"'));
  assert.ok(musicSocialLinks().includes('aria-label="'+name+'"'));
  assert.ok(VIEWER_PORTAL_SUFFIX.includes('aria-label="'+name+'"'));
 }
});

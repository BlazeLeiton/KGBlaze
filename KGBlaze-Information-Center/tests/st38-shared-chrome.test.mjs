import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {VIEWER_PORTAL_CSS} from '../src/viewer-portal-chrome.mjs';
import {VIEWER_PORTAL_PREFIX,VIEWER_PORTAL_SSR_JS} from '../src/viewer-portal-ssr.mjs';

const read=path=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),'utf8');

test('global header 58px and 50px desktop side rail align across three surfaces',()=>{
 const home=read('../public/home.html'),music=read('../src/music-page.mjs');
 assert.match(home,/header\{height:58px!important;padding:0 24px!important/);
 assert.match(home,/\.social\{top:58px!important;width:50px!important;padding:34px 2px 16px!important/);
 assert.match(music,/\.header\{width:calc\(100% \+ 50px\);margin-left:-50px\}/);
 assert.match(music,/\.header \.shell\{height:58px;min-height:58px;padding-left:24px;padding-right:24px\}/);
 assert.match(music,/\.site-social-sidebar\{top:58px;width:50px;padding:34px 2px 16px!important/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-header\{height:58px!important;padding:0 24px!important/);
 assert.match(VIEWER_PORTAL_CSS,/\.kg-site-social-desktop\{top:58px!important;width:50px!important;padding:34px 2px 16px!important/);
 for(const body of [home,music,VIEWER_PORTAL_CSS])assert.match(body,/height:60px/,'mobile social bars retain 60px height');
});

test('headphones glyph is a solid white vector with uninterrupted arch and two cups',()=>{
 const svg=read('../public/assets/icons/kgblaze-headphones-white.svg');
 assert.match(svg,/<svg[^>]+viewBox="0 0 120 120"/);
 assert.equal((svg.match(/<path fill="#(?:FFFFFF|fff)"/gi)||[]).length,3,'arc and two ear cups must be solid-filled');
 assert.doesNotMatch(svg,/stroke=|microphone|<rect[^>]+fill="none"/,'avoid thin-only headphones or microphone');
 assert.match(svg,/M26 73\.5V60/,'arch extends continuously toward both ear cups');
});

test('Terminal V6 header is natively handled by the original exported board controller',()=>{
 assert.match(VIEWER_PORTAL_PREFIX,/<nav class="kg-site-langs" aria-label="Idioma">/);
 assert.match(VIEWER_PORTAL_PREFIX,/data-lang="es">ES<\/button>/);
 assert.match(VIEWER_PORTAL_PREFIX,/data-lang="en">EN<\/button>/);
 assert.match(VIEWER_PORTAL_PREFIX,/data-lang="ja">JP<\/button>/);
 assert.doesNotMatch(VIEWER_PORTAL_PREFIX,/data-site-lang/);
 const original=read('../public/index.html');
 assert.match(original,/document.querySelectorAll\('\[data-lang\]'\)\)btn.addEventListener\('click',\(\)=>setLang\(btn.dataset.lang\)/);
 assert.match(original,/function setLang\(lang\)\{if\(!\['es','en','ja'\]/);
 assert.match(VIEWER_PORTAL_SSR_JS,/targetLangs.replaceChildren\(\.\.\.originalButtons\)/,'optional original-button relocation still supported');
});

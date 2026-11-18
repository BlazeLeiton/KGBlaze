import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const read=path=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),'utf8');
const home=read('../public/home.html');
const music=read('../src/music-page.mjs');
const terminal=read('../src/viewer-portal-chrome.mjs');
const terminalSSR=read('../src/viewer-portal-ssr.mjs');

// Desktop and mobile share the typographic identity, not the hero geometry.
// Musical "Scripta Lyrica" is the approved source, with a smaller mobile tracking.
test('Approved Rebel Mix eyebrow defines the desktop and mobile reference',()=>{
 assert.match(music,/\.eyebrow\{font-size:11px;letter-spacing:\.12em;text-transform:uppercase;color:var\(--ice\)\}/);
 assert.match(music,/\.hero \.eyebrow\{font-size:11px;letter-spacing:\.09em\}/);
 assert.match(music,/--ice:#A5EBFF/);
 assert.doesNotMatch(music,/\.eyebrow\{[^}]*font-weight:/);
});

test('Home and Terminal introductory kickers adopt Rebel Mix weight, size, color and tracking',()=>{
 assert.match(home,/\.identity\{font-size:11px;letter-spacing:\.12em;font-weight:400;text-transform:uppercase;color:var\(--ice\)\}/);
 assert.match(home,/\.identity\{font-size:11px;letter-spacing:\.09em\}/);
 assert.match(terminal,/\.kg-exterior-hero \.kg-kicker\{font-size:11px;color:#A5EBFF;font-weight:400;letter-spacing:\.12em;text-transform:uppercase\}/);
 assert.match(terminal,/\.kg-exterior-hero \.kg-kicker\{letter-spacing:\.09em\}/);
});

test('Only the labels are restyled, without changing page copy, native board or approved headphones',()=>{
 assert.match(home,/<div class="identity">BLAZE LEITON — VTUBER · VSINGER<\/div>/);
 assert.match(terminalSSR,/KGBlaze · Centro de información/);
 assert.match(music,/KGBlaze · Scripta Lyrica/);
 assert.match(home,/kgblaze-headphones-white\.svg\?v=st39-reference-20261118/);
 assert.match(home,/function synchronizeTwitchPlayer\(\)/);
 assert.match(terminalSSR,/const selectOriginal=l=>/);
});

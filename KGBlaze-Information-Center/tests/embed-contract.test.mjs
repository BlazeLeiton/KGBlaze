import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VIEWER_CSS,VIEWER_JS} from '../src/viewer-enhancements.mjs';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');

test('Mode ?embed=1 preserves the 1080 square, languages, active social hotspots and full-view button',()=>{
 assert.match(html,/const embedded=query\.get\('embed'\)==='1'/);
 assert.match(html,/<canvas id="board" width="1080" height="1080"/);
 assert.match(html,/id="hotspots" class="hit-layer"/);
 assert.match(html,/class="small-lang"/);
 assert.match(html,/id="openFull"[^>]*class="compact-full"/);
 assert.match(html,/function setLang\(lang\)/);
 assert.match(html,/window\.open\(url\.toString\(\),'_blank','noopener'\)/);
});
test('Compact mode hides extra panels and both navigation directions at CSS and handler levels',()=>{
 assert.match(html,/\.embedded \.viewer-header,\.embedded \.panel-side,\.embedded \.bottom-controls\{display:none!important\}/);
 assert.match(html,/function changeWeek\(delta\)\{if\(embedded\)return;/);
 assert.match(html,/function changePage\(delta\)\{if\(embedded\)return;/);
});
test('Public cleanup hides only legacy non-iframe sharing block; keeps DOM and true iframe input intact',()=>{
 assert.match(VIEWER_CSS,/#plainLabel,\.embed-code-row:has\(#plainCode\)\{display:none!important\}/);
 assert.match(html,/id="iframeCode"/);
 assert.match(html,/id="copyIframe"/);
 assert.match(html,/id="plainCode"/);
 assert.doesNotMatch(VIEWER_JS,/\.remove\(\).*plainLabel/);
});

test('Obsolete HTTPS publishing instruction is hidden while iframe sharing stays functional',()=>{
 assert.match(html,/<p class="embed-hint" id="embedHint">/);
 assert.match(html,/id="iframeCode" readonly/);
 assert.match(html,/id="copyIframe" type="button"/);
 assert.ok(VIEWER_CSS.includes('#embedHint{display:none!important}'));
 assert.ok(!VIEWER_CSS.includes('#iframeCode{display:none'));
 assert.ok(VIEWER_JS.includes('syncChrome=function()'));
});

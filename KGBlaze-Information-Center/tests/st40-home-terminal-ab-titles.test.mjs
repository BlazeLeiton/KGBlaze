import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');

test('Home media frame headings use Terminal A/B labels with em dash and preserve native platform icons',()=>{
 const frames=[...home.matchAll(/<article class="media (youtube|twitch)">\s*<h3 class="media-heading">([\s\S]*?)<\/h3>/g)];
 assert.equal(frames.length,2);
 for(const [index,frame] of frames.entries()){
  assert.equal(frame[1],index===0?'youtube':'twitch');
  assert.match(frame[2],/^<img class="media-brand-icon" src="data:image\/png;base64,[A-Za-z0-9+/=]+" width="(?:21|20)" height="(?:20|21)" alt="" aria-hidden="true">/);
  assert.equal(frame[2].replace(/^<img[^>]+>/,''),index===0?'Terminal A — YouTube':'Terminal B — Twitch');
 }
 assert.match(home,/id="youtube-screen"/);
 assert.match(home,/id="twitch-screen"/);
 assert.match(home,/function synchronizeTwitchPlayer\(\)/);
 assert.match(home,/kgblaze-headphones-white\.svg\?v=st39-reference-20261118/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const viewer=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const start=viewer.indexOf('function flightYouTubeVideo(e){');
const end=viewer.indexOf('function statusColor(',start);
assert.ok(start>=0&&end>start,'Patched public helper exists');
const code=viewer.slice(start,end);
function cardVideo(event,observations={}){
 const sandbox={publicState:{sync:observations},verifiedItem:s=>!!s?.verified&&s?.matchConfirmed&&s?.checkedAt,URL};
 return runInNewContext(code+'\nflightYouTubeVideo',sandbox)(event);
}
const base={id:'tw:killer',platforms:['yt','tw'],status:'A TIEMPO'};

test('Killer Chat room manually linked in editor opens directly without any sync observations',()=>{
 const v=cardVideo({...base,videoId:'JDkg-5tZ3G0'});
 assert.equal(v.id,'JDkg-5tZ3G0');
 assert.equal(v.url,'https://youtu.be/JDkg-5tZ3G0');
});

test('No editable room, no verified matching sync => use general channel fallback',()=>{
 assert.equal(cardVideo(base),null);
 assert.equal(cardVideo({...base,videoId:'invalid'}),null);
 assert.equal(cardVideo({...base,videoId:'JDkg-5tZ3G0',platforms:['tw']}),null);
 assert.equal(cardVideo(base,{[base.id]:{youtube:{videoId:'abcdefghijk',matchConfirmed:true,verified:false,checkedAt:'2026-10-13T12:00:00Z'}}}),null);
});

test('Trust editorial room ID over a different verified sync record for navigation, not live status',()=>{
 const v=cardVideo({...base,videoId:'JDkg-5tZ3G0'},{[base.id]:{youtube:{videoId:'abcdefghijk',matchConfirmed:true,verified:true,checkedAt:'2026-10-13T12:00:00Z'}}});
 assert.equal(v.url,'https://youtu.be/JDkg-5tZ3G0');
 assert.equal(viewer.includes('const hasYT=p.includes(\'yt\'),hasTW=p.includes(\'tw\')'),true,'Status logic is preserved');
});

test('An independently verified room still works if manual ID was not provided',()=>{
 const v=cardVideo(base,{[base.id]:{youtube:{videoId:'abcdefghijk',matchConfirmed:true,verified:true,checkedAt:'2026-10-13T12:00:00Z',status:'upcoming'}}});
 assert.equal(v.url,'https://youtu.be/abcdefghijk');
});

test('Recognize verified watch/live/short URL and reject malicious hosts or malformed IDs',()=>{
 const entry=url=>cardVideo(base,{[base.id]:{youtube:{url,matchConfirmed:true,verified:true,checkedAt:'2026-10-13T12:00:00Z',status:'upcoming'}}});
 assert.equal(entry('https://youtube.com/live/abcdefghijk')?.url,'https://youtu.be/abcdefghijk');
 assert.equal(entry('https://www.youtube.com/watch?v=abcdefghijk')?.id,'abcdefghijk');
 assert.equal(entry('https://youtu.be/abcdefghijk')?.id,'abcdefghijk');
 assert.equal(entry('https://youtube.com.evil.test/watch?v=abcdefghijk'),null);
 assert.equal(entry('http://youtube.com/watch?v=abcdefghijk'),null);
});

test('Public card uses preferred maxres thumbnail and a single HQ fallback',()=>{
 assert.match(viewer,/const video=flightYouTubeVideo\(e\)/);
 assert.match(viewer,/https:\/\/i\.ytimg\.com\/vi\/\$\{video\.id\}\/maxresdefault\.jpg/);
 assert.match(viewer,/https:\/\/i\.ytimg\.com\/vi\/\$\{video\.id\}\/hqdefault\.jpg/);
 assert.match(viewer,/img\.onerror=fallback/);
 assert.match(viewer,/img\.naturalWidth<640/);
 assert.match(viewer,/a\.href=p==='yt'&&video\?\.url\?video\.url:DEST\[p\]/);
});

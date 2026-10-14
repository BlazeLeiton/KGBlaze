import test from 'node:test';
import assert from 'node:assert/strict';
import {VIEWER_JS,VIEWER_CSS} from '../src/viewer-enhancements.mjs';

// These features are deliberately injected at the Worker response level because
// the existing single-file viewer embeds 4.5 MB of fonts and must remain intact.
test('Viewer injection script is syntactically valid and preserves required surfaces',()=>{
 assert.doesNotThrow(()=>new Function(VIEWER_JS));
 assert.match(VIEWER_JS,/draw=function\(list,total,pages\)/);
 assert.match(VIEWER_JS,/showSelectedFlight=function\(visible\)/);
 assert.doesNotMatch(VIEWER_JS,/effectiveEventLogo\(e\)/); // Calendar logos cannot override category art
 assert.match(VIEWER_JS,/ttv-boxart/);
 assert.match(VIEWER_JS,/document\.title=/);
 assert.match(VIEWER_JS,/UTC−6/);
 assert.match(VIEWER_CSS,/flight-category-box\.is-fallback/);
});
test('Local clocks: Mexico UTC−6 shows no secondary time; Tokyo advances one day',()=>{
 const start=VIEWER_JS.indexOf('function clock(e){');
 const end=VIEWER_JS.indexOf('\n draw=function',start);
 assert.ok(start>0&&end>start);
 const get=new Function('scheduledAtMs','return ('+VIEWER_JS.slice(start,end)+')')(
  ()=>Date.UTC(2026,9,14,4,0) // editorial Tuesday Oct 13, 22:00 CDMX
 );
 const e={day:'2026-10-13',time:'22:00'};
 const tz=process.env.TZ;
 try{
  process.env.TZ='America/Mexico_City';
  assert.deepEqual(get(e),{local:'22:00',reference:'22:00',shifted:0,different:false});
  process.env.TZ='Asia/Tokyo';
  assert.deepEqual(get(e),{local:'13:00',reference:'22:00',shifted:1,different:true});
  process.env.TZ='America/Los_Angeles';
  assert.deepEqual(get(e),{local:'21:00',reference:'22:00',shifted:0,different:true});
  assert.equal(get({day:'2026-10-13',time:''}),null);
 }finally{if(tz===undefined)delete process.env.TZ;else process.env.TZ=tz;}
});

// The public panel is populated dynamically. Lazy loading is unreliable for
// images created after opening a formerly hidden panel, especially on mobile.
test('Expanded-panel category artwork has eager loading, grid placement and recoverable fallback',()=>{
 assert.ok(VIEWER_JS.includes("pic.loading='eager'"));
 assert.ok(VIEWER_JS.includes("pic.decoding='async'"));
 assert.ok(VIEWER_JS.includes('if(!box.contains(pic))box.prepend(pic)'));
 assert.ok(VIEWER_CSS.includes('.flight-row-top>.flight-category-box{grid-column:3;grid-row:1;'));
 assert.ok(VIEWER_JS.includes('const editorial=editorialMatches(e,libraryEntries())'));
 assert.ok(VIEWER_JS.includes('[categoryArt,editorial.category,titleArt,editorial.title,editorial.general]'));
 assert.ok(VIEWER_JS.includes("const categoryArt=v?.source==='category'?official:null"));
});

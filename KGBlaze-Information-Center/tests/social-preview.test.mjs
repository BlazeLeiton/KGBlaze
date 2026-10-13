import test from 'node:test';
import assert from 'node:assert/strict';
import {SOCIAL_PREVIEW_CRON,SOCIAL_CAPTURE_JS,isValidSocialPNG,socialPreviewMonday,generateDailySocialPreview} from '../src/social-preview.mjs';

function png(){
 const b=new Uint8Array(32);
 b.set([137,80,78,71,13,10,26,10],0);
 b.set([0,0,0,13,73,72,68,82],8);
 const dv=new DataView(b.buffer);
 dv.setUint32(16,1080);dv.setUint32(20,1080);
 return b;
}
function mockDB(revisions=[4,4]){
 const calls={select:0,writes:[]};
 const DB={prepare(sql){
  return {
   async first(){return {revision:revisions[Math.min(calls.select++,revisions.length-1)]};},
   bind(...values){calls.writes.push({sql,values});return {async run(){return {meta:{changes:1}};}}}
  };
 }};
 return {DB,calls};
}

test('UTC 09:00 is Mexico 03:00; social week flips at Monday 03:00, not midnight',()=>{
 assert.equal(SOCIAL_PREVIEW_CRON,'0 9 * * *');
 assert.equal(socialPreviewMonday(new Date('2026-10-12T08:59:59Z')),'2026-10-05');
 assert.equal(socialPreviewMonday(new Date('2026-10-12T09:00:00Z')),'2026-10-12');
 assert.equal(socialPreviewMonday(new Date('2026-10-13T09:00:00Z')),'2026-10-12');
 assert.equal(socialPreviewMonday(new Date('2027-01-04T09:00:00Z')),'2027-01-04');
});
test('Capture script is classic JS; forces Spanish, page zero, and original 1080 canvas',()=>{
 assert.doesNotThrow(()=>new Function(SOCIAL_CAPTURE_JS));
 assert.match(SOCIAL_CAPTURE_JS,/state\.lang='es'/);
 assert.match(SOCIAL_CAPTURE_JS,/state\.page=0/);
 assert.match(SOCIAL_CAPTURE_JS,/renderBoardOnly\(\)/);
 assert.match(SOCIAL_CAPTURE_JS,/data/);
});
test('PNG validation rejects non-square/too-large or corrupt screenshots',()=>{
 assert.ok(isValidSocialPNG(png()));
 const invalid=png();new DataView(invalid.buffer).setUint32(20,1081);
 assert.equal(isValidSocialPNG(invalid),false);
 assert.equal(isValidSocialPNG(new Uint8Array(2_500_001)),false);
});
test('Daily capture stores one validated image and never updates agenda or sync',async()=>{
 const {DB,calls}=mockDB();
 const source=png();
 const captures=[];
 const BROWSER={async quickAction(name,opts){
  captures.push({name,opts});
  return new Response(source,{headers:{'Content-Type':'image/png'}});
 }};
 const result=await generateDailySocialPreview({DB,BROWSER},new Date());
 assert.equal(result.ok,true);
 assert.equal(result.week,socialPreviewMonday());
 assert.equal(calls.writes.length,1);
 assert.match(calls.writes[0].sql,/terminal_preview/);
 assert.equal(calls.writes[0].values[0],result.week);
 assert.equal(captures[0].name,'screenshot');
 assert.equal(captures[0].opts.selector,'#board');
 assert.equal(captures[0].opts.viewport.width,1080);
 assert.equal(captures[0].opts.viewport.height,1080);
 assert.match(captures[0].opts.url,/relight-og-week=/);
});
test('If editorial revision changes while capturing, never overwrite D1 preview',async()=>{
 const {DB,calls}=mockDB([2,3]);
 const BROWSER={async quickAction(){return new Response(png());}};
 const result=await generateDailySocialPreview({DB,BROWSER});
 assert.equal(result.reason,'AGENDA_CHANGED_DURING_CAPTURE');
 assert.equal(calls.writes.length,0);
});
test('Missing Browser Run or invalid PNG never destroys the stored preview',async()=>{
 const db1=mockDB();
 assert.equal((await generateDailySocialPreview({DB:db1.DB})).reason,'BROWSER_RUN_NOT_CONFIGURED');
 const db2=mockDB();
 const BROWSER={async quickAction(){return new Response(new Uint8Array([1,2,3]));}};
 const result=await generateDailySocialPreview({DB:db2.DB,BROWSER});
 assert.equal(result.reason,'INVALID_1080_PNG');
 assert.equal(db2.calls.writes.length,0);
});

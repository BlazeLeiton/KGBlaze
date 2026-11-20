import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseYouTubeStudioCsvRecords,
 inspectYouTubeStudioMembershipCsv}
 from '../src/recognition-youtube-studio-csv.mjs';

test('CP30: valid CSV yields only HEADER names and count, no private identities',()=>{
 const csv='\uFEFF"Channel Name","Channel URL","Notes"\r\n'+
  '"PrivateCreatorA","https://www.youtube.com/channel/UC123","Hello, world"\r\n'+
  '"PrivateCreatorB","https://www.youtube.com/channel/UC456","Line\nbreak"\r\n';
 const parsed=inspectYouTubeStudioMembershipCsv(csv);
 assert.deepEqual(parsed,{
  ok:true,
  columns:['Channel Name','Channel URL','Notes'],
  recordCount:2,
  source:'unverified_local_csv',
  needsRealSchemaReview:true,
  publicNamesEnabled:false,
  activeStatusVerified:false
 });
 assert.equal(JSON.stringify(parsed).includes('PrivateCreatorA'),false);
 assert.equal(JSON.stringify(parsed).includes('UC456'),false);
 const rows=parseYouTubeStudioCsvRecords(csv);
 assert.equal(rows.records[2][2],'Line\nbreak');
});
test('CP30: accepts semicolon-separated localized exports with UTF-8 labels',()=>{
 const csv='Canal;Nombre;Última actualización\n'+
  '"UC_123";"Usuario; de prueba";"2 días"\n';
 const result=inspectYouTubeStudioMembershipCsv(csv);
 assert.equal(result.ok,true);
 assert.equal(result.recordCount,1);
 assert.deepEqual(result.columns,['Canal','Nombre','Última actualización']);
});
test('CP30: never invents membership status or allows public identification',()=>{
 const csv='Name,Duration\nAlpha,12 months\nBravo,3 months\n';
 const result=inspectYouTubeStudioMembershipCsv(csv);
 assert.equal(result.ok,true);
 assert.equal(result.activeStatusVerified,false);
 assert.equal(result.publicNamesEnabled,false);
 assert.equal(result.needsRealSchemaReview,true);
 assert.equal(result.recordCount,2);
});
test('CP30: malformed quotes, mismatched columns and duplicate headers fail closed',()=>{
 for(const csv of [
  'Name,Name\nAlpha,Beta\n',
  'Name,Status\n"Unclosed,yes',
  'Name,Status\nAlpha\n',
  'Name,Status\nAlpha,yes,unexpected\n',
  'Name\n"foo"unexpected\n',
  '',
  'Name,Status\nfoo,"line\n'
 ]){
  assert.equal(inspectYouTubeStudioMembershipCsv(csv).ok,false);
 }
});
test('CP30: verifies this inspection is UNMOUNTED and Twitch stays unchanged',()=>{
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
 const home=readFileSync(new URL('../public/home.html',import.meta.url),'utf8');
 const inactive=readFileSync(new URL('../src/recognition-youtube-private.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(worker,/recognition-youtube-studio-csv/);
 assert.doesNotMatch(worker,/\/api\/public\/recognition\/youtube/);
 assert.doesNotMatch(wrangler,/^RECOGNITION_YOUTUBE_ENABLED\s*=\s*"true"$/m);
 assert.match(inactive,/PRIVATE, UNMOUNTED YouTube memberships verifier/);
 assert.match(home,/const recognizedMembers=document\.getElementById\('kg-recognition-members'\)/);
 assert.match(home,/pill\.append\(twitchIcon,subscriberName\)/);
 assert.match(wrangler,/^RECOGNITION_TWITCH_TRIAL_UNTIL = "2026-11-22T09:00:00\.000Z"$/m);
});

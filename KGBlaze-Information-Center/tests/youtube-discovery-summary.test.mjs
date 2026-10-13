import test from 'node:test';
import assert from 'node:assert/strict';
import {readYouTubePreviewEvidence} from '../experiments/youtube-matching/read-only-source.mjs';
import {buildYouTubePreflight} from '../experiments/youtube-matching/preflight.mjs';

const OWN='UC'+'A'.repeat(22), NOW=new Date('2026-10-14T03:59:00Z');
const ev={id:'tw:azur',day:'2026-10-13',time:'22:00',title:'Azur Lane',status:'A TIEMPO',platforms:['yt','tw']};
const agenda={schema:'relight-public-v1',revision:1,events:[ev]};
const v=(id,title='Azur Lane')=>({id,snippet:{channelId:OWN,title,liveBroadcastContent:'upcoming'},liveStreamingDetails:{scheduledStartTime:'2026-10-14T04:00:00Z'}});

test('no discovered rooms versus no strict match are distinguishable without changing decisions',async()=>{
  const empty=async()=>({ok:true,json:async()=>({items:[]})});
  const emptyEvidence=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'SECRET',fetchImpl:empty,now:()=>NOW});
  const noRooms=buildYouTubePreflight(agenda,emptyEvidence,{ownedChannelId:OWN,now:NOW});
  assert.equal(noRooms.items[0].reason,'no_safe_match');
  assert.deepEqual(noRooms.evidenceSummary.searchResults,{upcoming:0,live:0});
  assert.equal(noRooms.evidenceSummary.videoResources,0);
  assert.equal(noRooms.evidenceSummary.ownedBroadcastResources,0);
  assert.equal(noRooms.safeToApply,false);assert.equal(noRooms.directSyncWrites,0);

  const returned=async url=>({ok:true,json:async()=>new URL(url).pathname.endsWith('/search')
    ?{items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}}]}
    :{items:[v('Abcdef12345','Different Programme')]}});
  const evidence=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'SECRET',fetchImpl:returned,now:()=>NOW});
  const noMatch=buildYouTubePreflight(agenda,evidence,{ownedChannelId:OWN,now:NOW});
  assert.equal(noMatch.items[0].reason,'no_safe_match');
  assert.deepEqual(noMatch.evidenceSummary.searchResults,{upcoming:1,live:1});
  assert.equal(noMatch.evidenceSummary.uniqueDiscoveredVideoIds,1);
  assert.equal(noMatch.evidenceSummary.videoResources,1);
  assert.equal(noMatch.evidenceSummary.ownedBroadcastResources,1);
  assert.equal(noMatch.safeToApply,false);assert.equal(noMatch.directSyncWrites,0);
  assert.equal(JSON.stringify(noMatch).includes('SECRET'),false);
  assert.equal(JSON.stringify(noMatch).includes('Different Programme'),false);
});

test('search totals are kept separate; IDs are deduplicated and no additional API calls occur',async()=>{
 const urls=[];
 const fake=async url=>{
   urls.push(new URL(url));const u=new URL(url);
   if(u.pathname.endsWith('/search'))return {ok:true,json:async()=>({items:[{id:{kind:'youtube#video',videoId:'Abcdef12345'}},{id:{kind:'youtube#video',videoId:'Another1234'}}]})};
   return {ok:true,json:async()=>({items:[v('Abcdef12345'),v('Another1234')]})};
 };
 const e=await readYouTubePreviewEvidence({ownedChannelId:OWN,apiKey:'TOPSECRET',fetchImpl:fake,now:()=>NOW});
 assert.deepEqual(e.discovery.searchResults,{upcoming:2,live:2});
 assert.equal(e.discovery.uniqueDiscoveredVideoIds,2);
 assert.equal(e.discovery.explicitEditorialVideoIds,0);
 assert.equal(e.resources.length,2);
 assert.equal(urls.length,3);
 assert.equal(JSON.stringify(e).includes('TOPSECRET'),false);
});

test('legacy/synthetic evidence without discovery counts yields null rather than invented provider results',()=>{
 const evidence={schema:'relight-youtube-evidence-preview-v1',ownedChannelId:OWN,fetchedAt:NOW.toISOString(),
   discoveryComplete:true,resources:[v('Abcdef12345')]};
 const report=buildYouTubePreflight(agenda,evidence,{ownedChannelId:OWN,now:NOW});
 assert.deepEqual(report.evidenceSummary.searchResults,{upcoming:null,live:null});
 assert.equal(report.evidenceSummary.uniqueDiscoveredVideoIds,null);
 assert.equal(report.items[0].decision,'candidate');
 assert.equal(report.safeToApply,false);
});

test('a third-party broadcast never increases the owned broadcast count',()=>{
 const foreign=v('Abcdef12345');foreign.snippet.channelId='UC'+'B'.repeat(22);
 const evidence={ownedChannelId:OWN,fetchedAt:NOW.toISOString(),discoveryComplete:true,
  resources:[foreign],discovery:{searchResults:{upcoming:1,live:0},uniqueDiscoveredVideoIds:1,explicitEditorialVideoIds:0}};
 const report=buildYouTubePreflight(agenda,evidence,{ownedChannelId:OWN,now:NOW});
 assert.equal(report.evidenceSummary.videoResources,1);
 assert.equal(report.evidenceSummary.ownedBroadcastResources,0);
 assert.equal(report.items[0].decision,'none');
});

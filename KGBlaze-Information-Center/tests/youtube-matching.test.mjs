import test from 'node:test';
import assert from 'node:assert/strict';
import {matchYouTubeEvent, matchYouTubeAgenda} from '../experiments/youtube-matching/matcher.mjs';

const OWNED='UCBlazeExampleOwnChannel000';
const ALT='UCOtherCreatorChannel0000';
const now='2026-10-14T04:00:00Z'; // 13 October 2026, 22:00 in CDMX.
const event=(override={})=>({id:'tw:example',day:'2026-10-13',time:'22:00',title:'Azur Lane — Octublaze',status:'A TIEMPO',platforms:['yt','tw'],...override});
const video=(override={})=>({id:'Abcdef12345',snippet:{channelId:OWNED,title:'Azur Lane | Octublaze',liveBroadcastContent:'upcoming'},liveStreamingDetails:{scheduledStartTime:now},...override});
const fixtureOptions={ownedChannelId:OWNED};
const check=(e=event(),vs=[video()],options=fixtureOptions)=>matchYouTubeEvent(e,vs,options);

test('A: same channel, distinctive title and calendar time yields a candidate, not a verified sync',()=>{
 const r=check();assert.deepEqual(r,{decision:'candidate',reason:'unique_channel_title_time',videoId:'Abcdef12345'});
 assert.equal('matchConfirmed' in r,false);assert.equal('verified' in r,false);
});
test('B: never infer own channel identity from candidate',()=>assert.equal(check(event(),[video()],{}).reason,'trusted_channel_not_configured'));
test('C: reject another creator channel even when title and time match',()=>assert.equal(check(event(),[video({snippet:{...video().snippet,channelId:ALT}})]).reason,'no_safe_match'));
test('D: reject normal uploaded video with no liveStreamingDetails',()=>assert.equal(check(event(),[video({liveStreamingDetails:undefined})]).decision,'none'));
test('E: exact editable video ID takes precedence over title and date and preserves reschedules',()=>{
 const e=event({videoId:'Abcdef12345',title:'Different song altogether'});
 assert.equal(check(e,[video({liveStreamingDetails:{scheduledStartTime:'2026-10-15T04:00:00Z'}})]).reason,'explicit_editorial_video_id');
});
test('F: explicit ID does not silently fall back to similar video',()=>assert.equal(check(event({videoId:'Video123456'})).reason,'explicit_id_missing_or_untrusted'));
test('G: malformed editorial ID is flagged for review instead of ignored',()=>assert.equal(check(event({videoId:'not an id'})).reason,'invalid_editorial_video_id'));
test('H: exact ID of third-party channel is still not accepted',()=>assert.equal(check(event({videoId:'Abcdef12345'}),[video({snippet:{...video().snippet,channelId:ALT}})]).decision,'review'));
test('I: duplicate video resources are not silently collapsed',()=>assert.equal(check(event({videoId:'Abcdef12345'}),[video(),video()]).reason,'duplicate_video_resources'));
test('J: two rooms with the same title and hour are ambiguous',()=>assert.equal(check(event(),[video(),video({id:'Another1234'})]).reason,'ambiguous_multiple_rooms'));
test('K: same game, different numbered episodes do not match',()=>{
 const e=event({title:'Azur Lane — Octublaze #5'});
 assert.equal(check(e,[video({snippet:{...video().snippet,title:'Azur Lane — Octublaze #6'}})]).decision,'none');
});
test('L: matching episode numbers can pass',()=>{
 const e=event({title:'Azur Lane — Octublaze #5'});
 assert.equal(check(e,[video({snippet:{...video().snippet,title:'Octublaze #5 — Azur Lane'}})]).decision,'candidate');
});
test('M: a collaboration room does not match a solo stream title',()=>{
 assert.equal(check(event(),[video({snippet:{...video().snippet,title:'Azur Lane Octublaze | COLLAB ft. Guest'}})]).decision,'none');
});
test('N: both editorial and room labelled as a collaboration may match',()=>{
 assert.equal(check(event({title:'Azur Lane — Octublaze collab'}),[video({snippet:{...video().snippet,title:'Azur Lane Octublaze collab'}})]).decision,'candidate');
});
test('N2: unlabelled guest or with-host stream is not treated as a solo slot',()=>{
 assert.equal(check(event(),[video({snippet:{...video().snippet,title:'Azur Lane Octublaze with Guest'}})]).decision,'none');
});
test('O: missing time does not create a match based only on title',()=>assert.equal(check(event({time:''})).reason,'editorial_day_or_time_missing'));
test('P: a future room shifted by hours is review-only',()=>assert.equal(check(event(),[video({liveStreamingDetails:{scheduledStartTime:'2026-10-14T10:00:00Z'}})]).reason,'potential_reschedule_needs_editorial_confirmation'));
test('Q: multiple rooms including a reprogrammed copy requires review',()=>assert.equal(check(event(),[video(),video({id:'Another1234',liveStreamingDetails:{scheduledStartTime:'2026-10-14T10:00:00Z'}})]).reason,'competing_rescheduled_rooms'));
test('R: videos days away from the editorial schedule are rejected',()=>assert.equal(check(event(),[video({liveStreamingDetails:{scheduledStartTime:'2026-10-17T04:00:00Z'}})]).decision,'none'));
test('S: uploaded date never substitutes missing scheduledStartTime',()=>assert.equal(check(event(),[video({snippet:{...video().snippet,publishedAt:now},liveStreamingDetails:{actualEndTime:now}})]).decision,'none'));
test('T: events without YouTube are skipped, including manually controlled status',()=>{
 assert.equal(check(event({platforms:['tw']})).reason,'not_youtube_departure');
 assert.equal(check(event({status:'CANCELADO'})).reason,'manual_editorial_override');
 assert.equal(check(event({status:'HIATUS'})).decision,'skipped');
});
test('U: a room must have a valid YouTube 11-character video ID',()=>assert.equal(check(event(),[video({id:'short'})]).decision,'none'));
test('V: 90 minute window is inclusive; 91 minutes requires review',()=>{
 assert.equal(check(event(),[video({liveStreamingDetails:{scheduledStartTime:'2026-10-14T05:30:00Z'}})]).decision,'candidate');
 assert.equal(check(event(),[video({liveStreamingDetails:{scheduledStartTime:'2026-10-14T05:31:00Z'}})]).decision,'review');
});
test('W: all status simulation data is left unmodified',()=>{
 const e=event(), v=video(), e0=structuredClone(e), v0=structuredClone(v);
 check(e,[v]);assert.deepEqual(e,e0);assert.deepEqual(v,v0);
});
test('X: same video cannot be claimed by two calendar events',()=>{
 const result=matchYouTubeAgenda([event({id:'tw:one'}),event({id:'tw:two'})],[video()],fixtureOptions);
 assert.deepEqual(result.map(x=>x.reason),['video_claimed_by_multiple_events','video_claimed_by_multiple_events']);
});
test('Y: an agenda can recognize distinct rooms independently',()=>{
 const second='Another1234';
 const events=[event({id:'tw:one'}),event({id:'tw:two',title:'MiSide Octublaze',time:'23:00'})];
 const videos=[video(),video({id:second,snippet:{...video().snippet,title:'MiSide Octublaze'},liveStreamingDetails:{scheduledStartTime:'2026-10-14T05:00:00Z'}})];
 const r=matchYouTubeAgenda(events,videos,fixtureOptions);assert.deepEqual(r.map(x=>x.videoId),['Abcdef12345',second]);
});
test('Z: non-YouTube observations and entirely invalid dates cannot resolve',()=>{
 assert.equal(check(event({day:'2026-02-30'})).decision,'review');
 assert.deepEqual(matchYouTubeAgenda(null,[video()],fixtureOptions),[]);
});

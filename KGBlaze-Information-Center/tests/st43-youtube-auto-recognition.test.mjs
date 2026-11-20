import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 fetchYouTubeCurrentMembers,refreshYouTubeCreatorAccessToken,
 commitYouTubeCurrentMembers,readPublicYouTubeRecognition,
 YOUTUBE_CREATOR_CHANNEL
} from '../src/recognition-youtube-membership.mjs';

const approvedEnv={
 RECOGNITION_YOUTUBE_ENABLED:'true',
 YOUTUBE_MEMBERS_API_ACCESS_VERIFIED:'true',
 YOUTUBE_CHANNEL_ID:YOUTUBE_CREATOR_CHANNEL
};
const channel=n=>'UC'+String(n).padStart(22,'A');
const level='CNb4kOScvuH9bg';
const member=(n,{creator=YOUTUBE_CREATOR_CHANNEL,name='Test display'}={})=>({
 snippet:{creatorChannelId:creator,memberDetails:{
  channelId:channel(n),displayName:name
 },membershipsDetails:{highestAccessibleLevel:level}}
});
const response=(items,nextPageToken,kind='youtube#memberListResponse')=>({
 kind,items,...(nextPageToken===undefined?{}:{nextPageToken})
});
const simulatedGet=body=>async (url,init)=>{
 assert.match(url,/youtube\/v3\/members\?/);
 assert.equal(new URL(url).searchParams.get('mode'),'all_current');
 assert.equal(new URL(url).searchParams.get('maxResults'),'100');
 assert.equal(init.method,'GET');
 assert.equal(init.redirect,'manual');
 assert.equal(init.headers.Authorization,'Bearer TEST_ACCESS');
 return {ok:true,status:200,json:async()=>body};
};

test('CP31: disabled allowlist makes zero network calls and zero storage writes',async()=>{
 let called=false;
 const fetchImpl=async()=>{called=true;throw Error('should not call')};
 const check=await fetchYouTubeCurrentMembers({},{
  accessToken:'TEST_ACCESS',fetchImpl
 });
 assert.equal(check.reason,'disabled_or_not_allowlisted');
 assert.equal(called,false);
 assert.equal((await readPublicYouTubeRecognition({})).length,0);
 const save=await commitYouTubeCurrentMembers({},{
  ok:true,complete:true,source:'youtube_members_all_current',members:[]
 });
 assert.equal(save.ok,false);
});

test('CP31: all_current verifies owner, paginates and retains no anonymous identity',async()=>{
 const anonymous={snippet:{
  creatorChannelId:YOUTUBE_CREATOR_CHANNEL,memberDetails:{},
  membershipsDetails:{highestAccessibleLevel:level}
 }};
 const calls=[];
 const pages=[response([member('1')],'NEXT'),response([anonymous,member('2')])];
 const fetched=await fetchYouTubeCurrentMembers(approvedEnv,{
  accessToken:'TEST_ACCESS',
  fetchImpl:async (url,init)=>{
   calls.push(url);
   const index=calls.length-1;
   const base=await simulatedGet(pages[index])(url,init);
   return base;
  }
 });
 assert.equal(fetched.ok,true);
 assert.equal(fetched.complete,true);
 assert.equal(fetched.checkedPages,2);
 assert.equal(fetched.members.length,2);
 assert.deepEqual(fetched.members.map(m=>m.channelId),
  [channel('1'),channel('2')]);
 assert.equal(new URL(calls[1]).searchParams.get('pageToken'),'NEXT');
 assert.ok(!Object.hasOwn(fetched,'publicNames'));
});

test('CP31: 403 and other errors cannot generate false cancellations',async()=>{
 for(const [status,reason] of [
  [401,'owner_token_invalid'],[403,'channel_access_forbidden'],
  [429,'provider_rate_limited'],[500,'provider_unavailable']
 ]){
  const result=await fetchYouTubeCurrentMembers(approvedEnv,{
   accessToken:'TEST_ACCESS',
   fetchImpl:async()=>({status,ok:false})
  });
  assert.equal(result.reason,reason);
  assert.equal(result.ok,false);
  assert.equal(result.complete,undefined);
  assert.equal(result.members,undefined);
 }
});
test('CP31: wrong owner, duplicate IDs, malformed cursor and truncated pages fail closed',async()=>{
 const bad=[response([member('1',{creator:channel('X')})]),
  response([member('1'),member('1')]),
  response([member('1')],9),
  response([member('1')],'SAME')];
 for(const body of bad){
  const check=await fetchYouTubeCurrentMembers(approvedEnv,{
   accessToken:'TEST_ACCESS',fetchImpl:simulatedGet(body)
  });
  if(body.nextPageToken==='SAME'){
   // A repeated token is not a valid second page.
   assert.equal(check.ok,false);
  }else assert.equal(check.ok,false);
 }
});
test('CP31: full empty current snapshot is valid, updates feed is never called',async()=>{
 const result=await fetchYouTubeCurrentMembers(approvedEnv,{
  accessToken:'TEST_ACCESS',
  fetchImpl:simulatedGet(response([]))
 });
 assert.equal(result.ok,true);
 assert.deepEqual(result.members,[]);
 assert.equal(result.complete,true);
});

test('CP31: refresh needs allowlist and server-side credentials, never logs tokens',async()=>{
 const disabled=await refreshYouTubeCreatorAccessToken({},{
  refreshToken:'sensitive',fetchImpl:async()=>{throw Error('must not run')}
 });
 assert.equal(disabled.reason,'disabled_or_not_allowlisted');
 const configured={...approvedEnv,
  YOUTUBE_RECOGNITION_CLIENT_ID:'test-client',
  YOUTUBE_RECOGNITION_CLIENT_SECRET:'private-secret'};
 let called=false;
 const refreshed=await refreshYouTubeCreatorAccessToken(configured,{
  refreshToken:'OLD_REFRESH',
  fetchImpl:async(url,init)=>{
   called=true;
   assert.equal(url,'https://oauth2.googleapis.com/token');
   assert.equal(init.redirect,'manual');
   assert.equal(init.method,'POST');
   const form=new URLSearchParams(init.body);
   assert.equal(form.get('grant_type'),'refresh_token');
   assert.equal(form.get('refresh_token'),'OLD_REFRESH');
   return {ok:true,json:async()=>({
    access_token:'NEW_ACCESS',expires_in:3599
   })};
  }
 });
 assert.equal(called,true);
 assert.equal(refreshed.ok,true);
 assert.equal(refreshed.accessToken,'NEW_ACCESS');
 assert.equal(refreshed.refreshToken,'OLD_REFRESH');
 const denied=await refreshYouTubeCreatorAccessToken(configured,{
  refreshToken:'OLD_REFRESH',fetchImpl:async()=>({ok:false,status:403})
 });
 assert.deepEqual(denied,{
  ok:false,reason:'owner_oauth_refresh_unavailable'
 });
});

test('CP31: D1 snapshot write cannot run for incomplete provider evidence',async()=>{
 let written=false;
 const env={...approvedEnv,RECOGNITION_YOUTUBE_STORE_ENABLED:'true',DB:{
  prepare(){written=true;throw Error('unauthorized write')},
  batch(){written=true;throw Error('unauthorized batch')}
 }};
 for(const bad of [
  {ok:false,reason:'channel_access_forbidden'},
  {ok:true,complete:false,source:'youtube_members_all_current',members:[]},
  {ok:true,complete:true,source:'manual_csv',members:[]},
  {ok:true,complete:true,source:'youtube_members_all_current',
   members:[{channelId:channel('1'),displayName:'Valid',levelId:level},
    {channelId:channel('1'),displayName:'duplicate',levelId:level}]}
 ]){
  const result=await commitYouTubeCurrentMembers(env,bad);
  assert.equal(result.ok,false);
  assert.equal(written,false);
 }
});

test('CP31: public YouTube projection requires three independent gates and consent',async()=>{
 let readCount=0;
 const env={...approvedEnv,RECOGNITION_YOUTUBE_PUBLIC_ENABLED:'true',DB:{
  prepare(sql){
   readCount++;
   assert.match(sql,/consent_state='approved'/);
   assert.match(sql,/active=1/);
   return {bind(lower,now,limit){
    assert.ok(now-lower<=36*60*60*1000+1);
    assert.equal(limit,3000);
    return {all:async()=>({results:[
     {display_name:'Allowed YouTube Member'},
     {display_name:'<script>'},{display_name:null}
    ]})};
   }};
  }
 }};
 assert.deepEqual(await readPublicYouTubeRecognition({
  ...env,RECOGNITION_YOUTUBE_PUBLIC_ENABLED:'false'
 }),[]);
 assert.equal(readCount,0);
 const allowed=await readPublicYouTubeRecognition(env,{nowMs:1700000000000});
 assert.deepEqual(allowed,[{displayName:'Allowed YouTube Member'}]);
});

test('CP31: Home/API order YouTube before Twitch; no new Cron, OAuth or real data',()=>{
 const home=readFileSync(new URL('../public/home.html',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
 const sql=readFileSync(new URL('../migrations/recognition_youtube_membership_v1.sql',import.meta.url),'utf8');
 const start=home.indexOf('async function updateRecognitionMembers()');
 const slice=home.slice(start,start+850);
 assert.match(slice,/\.\.\.youtube\.map\(entry=>\(\{\.\.\.entry,platform:'youtube'\}\)\)/);
 assert.match(slice,/\.\.\.twitch\.map\(entry=>\(\{\.\.\.entry,platform:'twitch'\}\)\)/);
 assert.ok(slice.indexOf('...youtube.map')<slice.indexOf('...twitch.map'));
 assert.match(home,/svg\.youtube-icon\{fill:#FF0033\}/);
 assert.match(worker,/const youtube=await readPublicYouTubeRecognition\(env\)/);
 assert.match(worker,/\{ok:true,youtube,twitch:twitch\.twitch\|\|\[\]\}/);
 assert.match(wrangler,/^RECOGNITION_TWITCH_TRIAL_UNTIL = "2026-11-22T09:00:00\.000Z"$/m);
 assert.doesNotMatch(wrangler,/^RECOGNITION_YOUTUBE_ENABLED\s*=\s*"true"$/m);
 assert.doesNotMatch(worker,/refreshYouTubeCreatorAccessToken|fetchYouTubeCurrentMembers|commitYouTubeCurrentMembers/);
 assert.match(sql,/CREATE TABLE IF NOT EXISTS recognition_youtube_memberships/);
 assert.doesNotMatch(sql,/CREATE TABLE .*recognition_twitch/);
});

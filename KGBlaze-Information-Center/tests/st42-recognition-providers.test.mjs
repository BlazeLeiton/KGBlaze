import test from 'node:test';
import assert from 'node:assert/strict';
import {beginTwitchOwnerOAuth,completeTwitchOwnerOAuth,
 refreshTwitchOwnerOAuth,TWITCH_OWNER_CALLBACK_PATH} from '../src/recognition-twitch-oauth.mjs';
import {checkOptedInYouTubeMembers,selectedYouTubeMemberIds} from '../src/recognition-youtube-private.mjs';

const env={
 RECOGNITION_TWITCH_OAUTH_ENABLED:'true',
 TWITCH_CLIENT_ID:'twitch-app-id',TWITCH_CLIENT_SECRET:'never-expose-this',
 TWITCH_RECOGNITION_BROADCASTER_ID:'123',
 TWITCH_RECOGNITION_REDIRECT_URI:'https://kgblaze.dpdns.org'+TWITCH_OWNER_CALLBACK_PATH
};
const now=1795090000000;
const mockRandom=()=>new Uint8Array(32).fill(42);
const ytA='UC'+'A'.repeat(22),ytB='UC'+'B'.repeat(22);
const consent=id=>({platform:'youtube',platformUserId:id,
 verifyOptIn:true,verifyConsentAt:'2026-11-19T12:00:00Z'});
function twitchProvider({owner='123',scopes=['channel:read:subscriptions']}={}){
 const requests=[];
 const fetchImpl=async(url,options)=>{
  requests.push({url,options});
  if(url.endsWith('/oauth2/token')){
   assert.equal(options.method,'POST');
   assert.equal(options.redirect,'error');
   return {ok:true,json:async()=>({access_token:'private-access-token',
    refresh_token:'private-rotated-refresh',expires_in:3600,scope:scopes})};
  }
  assert.equal(url,'https://id.twitch.tv/oauth2/validate');
  assert.equal(options.headers.Authorization,'OAuth private-access-token');
  return {ok:true,json:async()=>({client_id:env.TWITCH_CLIENT_ID,
   user_id:owner,scopes,expires_in:3600})};
 };
 return {fetchImpl,requests};
}
test('Twitch begins only when enabled, owner and HTTPS callback are configured',async()=>{
 assert.equal((await beginTwitchOwnerOAuth({...env,RECOGNITION_TWITCH_OAUTH_ENABLED:'false'})).ok,false);
 assert.equal((await beginTwitchOwnerOAuth({...env,TWITCH_RECOGNITION_REDIRECT_URI:'http://kgblaze.dpdns.org'+TWITCH_OWNER_CALLBACK_PATH})).ok,false);
 assert.equal((await beginTwitchOwnerOAuth({...env,TWITCH_RECOGNITION_REDIRECT_URI:'https://kgblaze.dpdns.org/other'})).ok,false);
 const b=await beginTwitchOwnerOAuth(env,{now:()=>now,randomBytes:mockRandom});
 assert.equal(b.ok,true);
 const u=new URL(b.authorizeUrl);
 assert.equal(u.origin,'https://id.twitch.tv');
 assert.equal(u.searchParams.get('response_type'),'code');
 assert.equal(u.searchParams.get('scope'),'channel:read:subscriptions');
 assert.equal(u.searchParams.get('redirect_uri'),env.TWITCH_RECOGNITION_REDIRECT_URI);
 assert.equal(u.searchParams.get('state'),'2a'.repeat(32));
 assert.equal(b.stateHash.length,64);
 assert.equal(b.expiresAt-now,600000);
 assert.ok(!b.authorizeUrl.includes(env.TWITCH_CLIENT_SECRET));
});
test('OAuth callback refuses fake, expired or missing state without sending provider calls',async()=>{
 const b=await beginTwitchOwnerOAuth(env,{now:()=>now,randomBytes:mockRandom});
 let calls=0;
 const fetchImpl=async()=>{calls++;throw Error('not expected')};
 for(const params of [
  {state:'b0'.repeat(32),expectedStateHash:b.stateHash,issuedAt:now},
  {state:'2a'.repeat(32),expectedStateHash:b.stateHash,issuedAt:now-600001},
  {state:'2a'.repeat(32),expectedStateHash:'invalid',issuedAt:now}
 ]){
  const r=await completeTwitchOwnerOAuth(env,{code:'abcDEF123',...params},{now:()=>now,fetchImpl});
  assert.equal(r.ok,false);
 }
 assert.equal(calls,0);
});
test('Twitch verifies owner, app and scope before returning server-only tokens',async()=>{
 const b=await beginTwitchOwnerOAuth(env,{now:()=>now,randomBytes:mockRandom});
 const state='2a'.repeat(32);
 const p=twitchProvider();
 const valid=await completeTwitchOwnerOAuth(env,{code:'abcDEF123',state,
  expectedStateHash:b.stateHash,issuedAt:now},{now:()=>now,fetchImpl:p.fetchImpl});
 assert.equal(valid.ok,true);
 assert.equal(valid.broadcasterId,'123');
 assert.equal(valid.credentials.refreshToken,'private-rotated-refresh');
 assert.equal(p.requests.length,2);
 const form=new URLSearchParams(p.requests[0].options.body);
 assert.equal(form.get('grant_type'),'authorization_code');
 assert.equal(form.get('redirect_uri'),env.TWITCH_RECOGNITION_REDIRECT_URI);
 assert.equal(form.get('client_secret'),env.TWITCH_CLIENT_SECRET);
 const wrongOwner=twitchProvider({owner:'456'});
 assert.equal((await completeTwitchOwnerOAuth(env,{code:'abcDEF123',state,
  expectedStateHash:b.stateHash,issuedAt:now},{now:()=>now,fetchImpl:wrongOwner.fetchImpl})).ok,false);
 const wrongScope=twitchProvider({scopes:['user:read:email']});
 assert.equal((await completeTwitchOwnerOAuth(env,{code:'abcDEF123',state,
  expectedStateHash:b.stateHash,issuedAt:now},{now:()=>now,fetchImpl:wrongScope.fetchImpl})).ok,false);
});
test('Twitch refresh uses server-only POST and validates the rotated token',async()=>{
 const p=twitchProvider();
 const r=await refreshTwitchOwnerOAuth(env,'original-refresh',{fetchImpl:p.fetchImpl});
 assert.equal(r.ok,true);
 const form=new URLSearchParams(p.requests[0].options.body);
 assert.equal(form.get('grant_type'),'refresh_token');
 assert.equal(form.get('refresh_token'),'original-refresh');
 assert.equal(r.credentials.refreshToken,'private-rotated-refresh');
});
test('YouTube never queries absent permission, missing consent or disabled access',async()=>{
 const consented=[consent(ytA)];
 let called=0;const fetchImpl=async()=>{called++;throw Error('not expected')};
 const configured={RECOGNITION_YOUTUBE_ENABLED:'true',
 YOUTUBE_MEMBERS_API_ACCESS_VERIFIED:'true',
 YOUTUBE_CHANNEL_ID:'UCRd_uwPjrsf6Z3CRXwNehEQ',
 YOUTUBE_RECOGNITION_USER_TOKEN:'secret-user-token'};
 assert.equal((await checkOptedInYouTubeMembers({},consented,{fetchImpl})).ok,false);
 assert.equal((await checkOptedInYouTubeMembers(configured,
  [consent(ytA),consent(ytA)],{fetchImpl})).reason,'invalid_consent_set');
 assert.equal((await checkOptedInYouTubeMembers(configured,
  [{...consent(ytA),withdrawnAt:'2026-11-19'}],{fetchImpl})).ok,false);
 assert.equal((await checkOptedInYouTubeMembers(configured,[],{fetchImpl})).reason,'empty_opt_in');
 assert.equal(called,0);
});
test('YouTube requests ONLY opted-in channel IDs; never a broad member list',async()=>{
 const configured={RECOGNITION_YOUTUBE_ENABLED:'true',
 YOUTUBE_MEMBERS_API_ACCESS_VERIFIED:'true',
 YOUTUBE_CHANNEL_ID:'UCRd_uwPjrsf6Z3CRXwNehEQ',
 YOUTUBE_RECOGNITION_USER_TOKEN:'secret-user-token'};
 let seenURL=null;
 const fetchImpl=async (url,options)=>{
  seenURL=new URL(url);
  assert.equal(options.headers.Authorization,'Bearer secret-user-token');
  assert.equal(seenURL.searchParams.get('filterByMemberChannelId'),ytA+','+ytB);
  assert.equal(seenURL.searchParams.get('mode'),'all_current');
  return {ok:true,json:async()=>({items:[{snippet:{creatorChannelId:configured.YOUTUBE_CHANNEL_ID,
   memberDetails:{channelId:ytA}}}]})};
 };
 const result=await checkOptedInYouTubeMembers(configured,[consent(ytA),consent(ytB)],{fetchImpl});
 assert.equal(result.ok,true);
 assert.deepEqual(result.checks.map(x=>x.active),[true,false]);
 assert.equal(selectedYouTubeMemberIds([consent(ytA)]).length,1);
 assert.ok(!seenURL.toString().includes('secret-user-token'));
});
test('YouTube refuses unfiltered, wrong channel, or incomplete provider responses',async()=>{
 const c={RECOGNITION_YOUTUBE_ENABLED:'true',YOUTUBE_MEMBERS_API_ACCESS_VERIFIED:'true',
 YOUTUBE_CHANNEL_ID:'UCRd_uwPjrsf6Z3CRXwNehEQ',YOUTUBE_RECOGNITION_USER_TOKEN:'private'};
 const incomplete=async()=>({ok:true,json:async()=>({items:[],nextPageToken:'unexpected'})});
 const foreign=async()=>({ok:true,json:async()=>({items:[{snippet:{
  creatorChannelId:'UC'+'Z'.repeat(22),memberDetails:{channelId:ytA}}}]})});
 assert.equal((await checkOptedInYouTubeMembers({...c,YOUTUBE_CHANNEL_ID:'UC'+'Z'.repeat(22)},[consent(ytA)])).ok,false);
 assert.equal((await checkOptedInYouTubeMembers(c,[consent(ytA)],{fetchImpl:incomplete})).ok,false);
 assert.equal((await checkOptedInYouTubeMembers(c,[consent(ytA)],{fetchImpl:foreign})).ok,false);
});

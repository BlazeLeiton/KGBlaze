import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {checkOptedInTwitchSubscriptions,validRecognitionConsent,recognitionCandidateIds,
 approvedRecognitionAliases,YOUTUBE_MEMBERSHIP_INTEGRATION} from '../src/recognition-private.mjs';

const at='2026-11-18T12:00:00Z';
const consent=(id='21',extras={})=>({platform:'twitch',platformUserId:id,
 alias:'Aviador '+id,verifyOptIn:true,verifyConsentAt:at,
 publishOptIn:true,publishApproved:true,publicConsentAt:at,
 visibility:true,lastVerifiedAt:'2026-11-19T12:00:00Z',...extras});
const env={RECOGNITION_TWITCH_ENABLED:'true',TWITCH_CLIENT_ID:'cli',
 TWITCH_RECOGNITION_BROADCASTER_ID:'123',TWITCH_RECOGNITION_USER_TOKEN:'private'};
function provider(rows,options={}){
 const calls=[];
 const fetchImpl=async (url,init)=>{
  assert.equal(init.redirect,'manual','Workers does not support redirect:error');
  calls.push({url,init});
  if(url.includes('oauth2/validate'))return {
   ok:options.valid!==false,
   json:async()=>({client_id:options.clientId||'cli',
    user_id:options.owner||'123',
    expires_in:options.expiresIn??3600,
    scopes:options.scopes||['channel:read:subscriptions']})
  };
  return {ok:options.status===undefined, status:options.status||200,
   json:async()=>({data:rows})};
 };
 return {fetchImpl,calls};
}
test('all gates are closed by default; no external request without explicit consent or flag',async()=>{
 let requests=0;
 const f=async()=>{requests++;throw Error('must not call')};
 assert.equal((await checkOptedInTwitchSubscriptions({},[consent()],{fetchImpl:f})).reason,'disabled');
 assert.equal((await checkOptedInTwitchSubscriptions(env,[{...consent(),verifyOptIn:false}],{fetchImpl:f})).reason,'invalid_consent_set');
 assert.equal((await checkOptedInTwitchSubscriptions(env,[],{fetchImpl:f})).reason,'empty_opt_in');
 assert.equal(requests,0);
});
test('consent set rejects missing ID, duplicate, revoked or oversized opt-ins',()=>{
 assert.equal(validRecognitionConsent(consent()),true);
 assert.equal(validRecognitionConsent(consent('x')),false);
 assert.equal(validRecognitionConsent(consent('2',{revokedAt:'2026-11-19T00:00:00Z'})),false);
 assert.equal(validRecognitionConsent(consent('2',{withdrawnAt:'2026-11-19T00:00:00Z'})),false);
 assert.equal(recognitionCandidateIds([consent('2'),consent('2')]),null);
 assert.equal(recognitionCandidateIds(Array.from({length:101},(_,i)=>consent(String(i+1000)))),null);
});
test('Twitch broadcaster token checked before querying exact user ids; gift status retained privately',async()=>{
 const p=provider([{user_id:'21',broadcaster_id:'123',is_gift:true,tier:'1000'}]);
 const response=await checkOptedInTwitchSubscriptions(env,[consent('21'),consent('22')],p);
 assert.equal(response.ok,true);
 assert.deepEqual(response.checks,[{platform:'twitch',platformUserId:'21',active:true,gifted:true,tier:'1000'},
  {platform:'twitch',platformUserId:'22',active:false,gifted:null,tier:null}]);
 assert.equal(p.calls.length,2);
 assert.match(p.calls[0].url,/id\.twitch\.tv\/oauth2\/validate/);
 assert.match(p.calls[1].url,/user_id=21&user_id=22/);
 assert.doesNotMatch(p.calls[1].url,/first=|after=/);
 assert.equal(p.calls[1].init.headers['Client-Id'],'cli');
 assert.equal(JSON.stringify(response).includes('private'),false);
 assert.equal(JSON.stringify(response).includes('Aviador'),false);
});
test('fails closed on invalid scope, owner, client id, expired token and network errors',async()=>{
 for(const options of [{owner:'456'},{clientId:'another'},{scopes:['user:read:email']},{expiresIn:0},{valid:false}]){
  const p=provider([],options);
  const x=await checkOptedInTwitchSubscriptions(env,[consent()],p);
  assert.equal(x.ok,false);
  assert.equal(p.calls.length,1);
 }
 const p=provider([],{status:429});
 const r=await checkOptedInTwitchSubscriptions(env,[consent()],p);
 assert.equal(r.ok,false);assert.equal(r.reason,'provider_unavailable');
 assert.equal((await checkOptedInTwitchSubscriptions(env,[consent()],{fetchImpl:async()=>{throw Error('private token accidentally in error')}})).reason,'provider_unavailable');
});
test('rejects spoofed or malformed subscription response rather than trusting returned identities',async()=>{
 for(const row of [
  {user_id:'21',broadcaster_id:'999',is_gift:false,tier:'1000'},
  {user_id:'999',broadcaster_id:'123',is_gift:false,tier:'1000'},
  {user_id:'21',broadcaster_id:'123',is_gift:'false',tier:'1000'}
 ]){
  const p=provider([row]);assert.equal((await checkOptedInTwitchSubscriptions(env,[consent()],p)).reason,'invalid_response');
 }
});
test('no alias publicly projected until independent, explicit visibility and recent active proof',()=>{
 const row=consent('21');
 const result={ok:true,reason:'verified',checks:[{platform:'twitch',platformUserId:'21',active:true,gifted:true}]};
 const now=new Date('2026-11-19T15:00:00Z');
 assert.deepEqual(approvedRecognitionAliases([row],result,{now}),[]);
 assert.deepEqual(approvedRecognitionAliases([row],result,{now,publicationEnabled:true}),
  [{alias:'Aviador 21',platform:'twitch',subscriptionKind:'gifted'}]);
 for(const x of [{publishOptIn:false},{publishApproved:false},{visibility:false},
  {publicConsentAt:null},{lastVerifiedAt:'2026-11-17T00:00:00Z'},{withdrawn:true}]){
  assert.deepEqual(approvedRecognitionAliases([{...row,...x}],result,{now,publicationEnabled:true}),[]);
 }
 assert.deepEqual(approvedRecognitionAliases([row],{ok:false,reason:'provider_unavailable',checks:[]},
 {now,publicationEnabled:true}),[]);
});
test('YouTube provider awaits approval and no public API, cron, or credential changes',()=>{
 assert.match(YOUTUBE_MEMBERSHIP_INTEGRATION.state,/blocked_until/);
 assert.equal(YOUTUBE_MEMBERSHIP_INTEGRATION.automaticPublication,false);
 const home=readFileSync(fileURLToPath(new URL('../public/home.html',import.meta.url)),'utf8');
 const worker=readFileSync(fileURLToPath(new URL('../src/worker.mjs',import.meta.url)),'utf8');
 assert.match(home,/recognitionTitle:"Gracias a quienes hacen posible este viaje"/);
 assert.match(home,/recognitionTitle:"Thank you for being part of the journey"/);
 assert.match(home,/recognitionTitle:"一緒に旅してくれてありがとう"/);
 assert.doesNotMatch(home,/recognition-private\.mjs/);
 assert.doesNotMatch(worker,/recognition-private\.mjs|\/api\/recognition|\/api\/members/);
});


test('CP08 targeted subscription requests never follow Twitch HTTP redirects',async()=>{
 const requests=[];
 const fake=async(url,init)=>{
  requests.push(url);
  assert.equal(init.redirect,'manual');
  if(url.includes('/oauth2/validate'))return {ok:true,json:async()=>({
   client_id:'cli',user_id:'123',scopes:['channel:read:subscriptions'],expires_in:3600
  })};
  return {ok:false,status:302};
 };
 const result=await checkOptedInTwitchSubscriptions(env,[consent('21')],{fetchImpl:fake});
 assert.equal(result.ok,false);
 assert.equal(result.reason,'provider_unavailable');
 assert.equal(requests.length,2);
 assert.equal(requests[1].includes('user_id=21'),true);
});

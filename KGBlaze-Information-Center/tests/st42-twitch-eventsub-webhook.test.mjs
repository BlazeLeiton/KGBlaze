import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifyTwitchEventSubWebhook as verify} from '../src/recognition-twitch-eventsub-webhook.mjs';

const callbackUrl='https://kgblaze.dpdns.org/departures/api/eventsub/twitch';
const broadcasterId='70386764';
const secret='ONLY-UNIT-TEST-EVENTSUB-SECRET-DO-NOT-DEPLOY';
const now=Date.parse('2026-11-19T20:50:00Z');
const timestamp=new Date(now-1000).toISOString();
const args={secret,broadcasterId,callbackUrl,now};
const sub=(type='channel.subscribe',status='enabled')=>({
 id:'fixture-subscription-id',status,type,version:'1',
 condition:{broadcaster_user_id:broadcasterId},
 transport:{method:'webhook',callback:callbackUrl}
});
const event=()=>({
 broadcaster_user_id:broadcasterId,
 user_id:'321456',user_login:'sky_flyer',user_name:'Sky_Flyer',
 is_gift:false,tier:'1000',cumulative_months:4,
 message:{text:'This freeform message must never be returned'}
});
function request({
 kind='notification',id='event-fixture-001',ts=timestamp,
 type='channel.subscribe',status,content,raw,signAs,headers={},
 url=callbackUrl
}={}){
 const body=raw??JSON.stringify(content??{
  subscription:sub(type,status||(kind==='webhook_callback_verification'?
   'webhook_callback_verification_pending':'enabled')),
  ...(kind==='webhook_callback_verification'?{challenge:'challenge-value'}:
    kind==='notification'?{event:event()}:{})
 });
 const signature=createHmac('sha256',signAs??secret).update(id+ts+body).digest('hex');
 return new Request(url,{
  method:'POST',
  headers:{
   'Content-Type':'application/json',
   'Twitch-Eventsub-Message-Id':id,
   'Twitch-Eventsub-Message-Timestamp':ts,
   'Twitch-Eventsub-Message-Type':kind,
   'Twitch-Eventsub-Message-Signature':'sha256='+signature,
   'Twitch-Eventsub-Subscription-Type':type,
   'Twitch-Eventsub-Subscription-Version':'1',
   ...headers
  },body
 });
}
const store=()=>{const ids=new Set();let calls=0;return{
 get calls(){return calls},
 claimMessageId:async id=>{calls++;if(ids.has(id))return false;ids.add(id);return true}
}};
test('CP11 genuine signed new sub yields only safe acknowledgement, never raw message or ID',async()=>{
 const d=store();
 const result=await verify(request(),{...args,claimMessageId:d.claimMessageId});
 assert.equal(result.ok,true);
 assert.equal(result.kind,'notification');
 assert.equal(result.acknowledgement.kind,'new_subscription');
 assert.equal(result.acknowledgement.displayName,'Sky_Flyer');
 assert.equal(result.acknowledgement.twitchUserId,'321456'); // private normalized model only
 assert.equal(JSON.stringify(result).includes('This freeform message'),false);
 assert.equal(d.calls,1);
});
test('CP11 rejects unauthorized request without processing replay store',async()=>{
 const d=store();
 for(const req of [
  request({signAs:'attacker-not-our-secret'}),
  request({headers:{'Twitch-Eventsub-Message-Signature':'sha256='+('0'.repeat(64))}}),
  request({ts:new Date(now-11*60_000).toISOString()}),
  request({ts:new Date(now+11*60_000).toISOString()}),
  request({url:'https://example.invalid/departures/api/eventsub/twitch'}),
  request({headers:{'Twitch-Eventsub-Message-Type':'unknown'}})
 ]){
  const result=await verify(req,{...args,claimMessageId:d.claimMessageId});
  assert.equal(result.ok,false);
 }
 assert.equal(d.calls,0);
});
test('CP11 signature must cover exact raw body bytes, no JSON reserialization',async()=>{
 const payload={subscription:sub(),event:event()};
 const custom=JSON.stringify(payload,null,2)+'\n';
 const d=store();
 const pass=await verify(request({raw:custom,id:'whitespace001'}),{...args,claimMessageId:d.claimMessageId});
 assert.equal(pass.ok,true);
 const modified=request({raw:custom+' ',id:'whitespace002',
  headers:{'Twitch-Eventsub-Message-Signature':'sha256='+
   createHmac('sha256',secret).update('whitespace002'+timestamp+custom).digest('hex')}
 });
 const fail=await verify(modified,{...args,claimMessageId:d.claimMessageId});
 assert.equal(fail.reason,'invalid_signature');
 assert.equal(d.calls,1);
});
test('CP11 identical delivery is blocked by injected atomic claim',async()=>{
 const d=store();
 assert.equal((await verify(request({id:'duplicate001'}),{...args,claimMessageId:d.claimMessageId})).ok,true);
 const second=await verify(request({id:'duplicate001'}),{...args,claimMessageId:d.claimMessageId});
 assert.equal(second.ok,false);
 assert.equal(second.reason,'replayed_or_unclaimed_message');
 assert.equal(d.calls,2);
});
test('CP11 missing or failed durable replay claim fails closed',async()=>{
 assert.equal((await verify(request(),args)).reason,'not_configured');
 const failure=await verify(request(),{...args,claimMessageId:async()=>{throw Error('D1 down')}});
 assert.equal(failure.reason,'replay_store_unavailable');
 assert.equal((await verify(request(),{...args,claimMessageId:async()=>1})).ok,false);
});
test('CP11 signed challenge only accepted with enabled owner and returns raw challenge',async()=>{
 const d=store();
 const result=await verify(request({kind:'webhook_callback_verification',id:'challenge001'}),{
  ...args,claimMessageId:d.claimMessageId
 });
 assert.deepEqual(result,{ok:true,kind:'challenge',challenge:'challenge-value'});
 const invalid=await verify(request({kind:'webhook_callback_verification',
  id:'challenge002',status:'enabled'}),{...args,claimMessageId:d.claimMessageId});
 assert.equal(invalid.reason,'invalid_challenge');
});
test('CP11 signed revocation cannot create new supporter notice',async()=>{
 const d=store();
 const result=await verify(request({kind:'revocation',id:'revoked001',
   status:'authorization_revoked'}),{...args,claimMessageId:d.claimMessageId});
 assert.deepEqual(result,{ok:true,kind:'revocation'});
});
test('CP11 wrong broadcaster, callback and subscription version rejected before claim',async()=>{
 const d=store();
 const inputs=[
  {subscription:{...sub(),condition:{broadcaster_user_id:'9999'}},event:event()},
  {subscription:{...sub(),transport:{method:'webhook',
    callback:'https://other.invalid/callback'}},event:event()},
  {subscription:{...sub(),version:'2'},event:event()},
  {subscription:sub(),event:{...event(),broadcaster_user_id:'9999'}}
 ];
 for(let i=0;i<inputs.length;i++){
  const result=await verify(request({content:inputs[i],id:'wrong'+i}),{
   ...args,claimMessageId:d.claimMessageId
  });
  assert.equal(result.ok,false);
 }
 assert.equal(d.calls,0);
});
test('CP11 signed gift notification is acknowledged, not publicly projected',async()=>{
 const d=store();
 const result=await verify(request({content:{subscription:sub(),
  event:{...event(),is_gift:true}},id:'gift001'}),{...args,claimMessageId:d.claimMessageId});
 assert.deepEqual(result,{ok:true,kind:'notification',acknowledgement:null});
});
test('CP11 resub only produces announcement for a shared subscription message',async()=>{
 const d=store();
 const result=await verify(request({id:'resub001',type:'channel.subscription.message'}),
  {...args,claimMessageId:d.claimMessageId});
 assert.equal(result.ok,true);
 assert.equal(result.acknowledgement.kind,'shared_resubscription');
 assert.equal(result.acknowledgement.months,4);
 assert.equal(JSON.stringify(result).includes('freeform message'),false);
});
test('CP11 body limits and malformed authenticated payload fail without claiming',async()=>{
 const d=store();
 const broken=await verify(request({raw:'{not-json',id:'badjson001'}),{
  ...args,claimMessageId:d.claimMessageId
 });
 assert.equal(broken.reason,'invalid_payload');
 const big=await verify(request({raw:' '.repeat(65537),id:'big001'}),{
  ...args,claimMessageId:d.claimMessageId
 });
 assert.equal(big.reason,'invalid_body_size');
 assert.equal(d.calls,0);
});

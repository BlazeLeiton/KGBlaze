import test from 'node:test';
import assert from 'node:assert/strict';
import {readTwitchActiveSubscriptionStatus as read,validTwitchStatusIds}
 from '../src/recognition-twitch-active-status.mjs';

const config={accessToken:'SENSITIVE_OWNER_TOKEN',clientId:'client-fixture',
 broadcasterId:'70386764'};
const item=(user_id='123',extra={})=>({user_id,broadcaster_id:'70386764',
 is_gift:false,tier:'1000',user_name:'Private name',gifter_id:'PRIVATE_GIFTER',...extra});
function serve(pages){
 const requests=[];
 const fetchImpl=async(uri,init)=>{
  requests.push({url:new URL(uri),init});
  const next=pages[requests.length-1];
  if(next instanceof Error)throw next;
  if(!next)throw Error('unexpected Twitch API request');
  return {ok:next.status===undefined||next.status===200,status:next.status||200,
   json:async()=>next.body};
 };
 return {requests,fetchImpl};
}
test('CP13 paginates full snapshot including empty final page with cursor',async()=>{
 const mock=serve([
  {body:{data:[item('111')],pagination:{cursor:'A'},total:1}},
  {body:{data:[],pagination:{cursor:'B'},total:1}},
  {body:{data:[],pagination:{},total:1}}
 ]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'summary',complete:true,pages:3,
  observedActiveRows:1,providerTotal:1});
 assert.equal(mock.requests.length,3);
 assert.equal(mock.requests[0].url.searchParams.get('broadcaster_id'),'70386764');
 assert.equal(mock.requests[0].url.searchParams.get('first'),'100');
 assert.equal(mock.requests[0].url.searchParams.get('after'),null);
 assert.equal(mock.requests[1].url.searchParams.get('after'),'A');
 assert.equal(mock.requests[2].url.searchParams.get('after'),'B');
 for(const r of mock.requests){
  assert.equal(r.init.redirect,'manual');
  assert.equal(r.init.headers.Authorization,'Bearer SENSITIVE_OWNER_TOKEN');
  assert.equal(r.init.headers['Client-Id'],'client-fixture');
  assert.equal(r.url.searchParams.has('user_id'),false);
 }
 assert.equal(JSON.stringify(out).includes('Private name'),false);
 assert.equal(JSON.stringify(out).includes('PRIVATE_GIFTER'),false);
 assert.equal(JSON.stringify(out).includes('SENSITIVE_OWNER_TOKEN'),false);
});
test('CP13 targeted filters IDs and returns only active status without profile, tier or gift',async()=>{
 const mock=serve([{body:{data:[item('444',{is_gift:true,tier:'3000'})]}}]);
 const out=await read({...config,mode:'targeted',userIds:['444','555'],
  fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'targeted',checked:2,
  checks:[{userId:'444',active:true},{userId:'555',active:false}]});
 const q=mock.requests[0].url;
 assert.deepEqual(q.searchParams.getAll('user_id'),['444','555']);
 assert.equal(q.searchParams.has('after'),false);
 assert.equal(q.searchParams.has('first'),false);
 assert.equal(JSON.stringify(out).includes('PRIVATE_GIFTER'),false);
 assert.equal(JSON.stringify(out).includes('Private name'),false);
});
test('CP13 full snapshot rejects changed total, loop, duplicate row and page cap',async()=>{
 const cases=[
  [ [{body:{data:[],total:3,pagination:{cursor:'X'}}},
     {body:{data:[],total:2,pagination:{}}}], 'snapshot_changed_during_scan'],
  [ [{body:{data:[],total:0,pagination:{cursor:'X'}}},
     {body:{data:[],total:0,pagination:{cursor:'X'}}}], 'invalid_or_repeated_cursor'],
  [ [{body:{data:[item('111')],total:2,pagination:{cursor:'X'}}},
     {body:{data:[item('111')],total:2,pagination:{}}}], 'invalid_response'],
  [ [{body:{data:[],total:0,pagination:{cursor:'X'}}}], 'incomplete_snapshot']
 ];
 for(const [pages,reason] of cases){
  const mock=serve(pages);
  const out=await read({...config,fetchImpl:mock.fetchImpl,
   ...(reason==='incomplete_snapshot'?{maxPages:1}:{})});
  assert.equal(out.ok,false);
  assert.equal(out.reason,reason);
 }
});
test('CP13 provider failure and rate limit are unknown, not inactive',async()=>{
 for(const [response,reason] of [
  [{status:401},'token_unauthorized'],
  [{status:429},'rate_limited'],
  [{status:503},'provider_unavailable'],
  [new Error('Sensitive token in thrown error'),'provider_unavailable']
 ]){
  const mock=serve([response]);
  const out=await read({...config,fetchImpl:mock.fetchImpl});
  assert.equal(out.ok,false);
  assert.equal(out.reason,reason);
  assert.equal(JSON.stringify(out).includes('Sensitive token'),false);
 }
 const bad=serve([{body:{data:[item('111')],total:0,pagination:{cursor:3}}}]);
 assert.equal((await read({...config,fetchImpl:bad.fetchImpl})).reason,
  'invalid_or_repeated_cursor');
});
test('CP13 strict validation prevents cross-channel and unfiltered requests',async()=>{
 const noFetch=async()=>{throw Error('MUST NOT FETCH')};
 for(const opts of [
  {...config,mode:'targeted',userIds:[]},
  {...config,mode:'targeted',userIds:['111','111']},
  {...config,mode:'targeted',userIds:['user_name']},
  {...config,mode:'summary',userIds:['111']},
  {...config,mode:'anything'},
  {...config,maxPages:31},
  {...config,broadcasterId:'bad'}
 ]){
  const result=await read({...opts,fetchImpl:noFetch});
  assert.equal(result.ok,false);
 }
 assert.equal(validTwitchStatusIds(['1','2']).length,2);
 assert.equal(validTwitchStatusIds(Array(101).fill('123')),null);
 const wrongOwner=serve([{body:{data:[item('111',{broadcaster_id:'OTHER'})],total:1}}]);
 assert.equal((await read({...config,fetchImpl:wrongOwner.fetchImpl})).reason,'invalid_response');
 const unexpected=serve([{body:{data:[item('222')]}}]);
 assert.equal((await read({...config,mode:'targeted',userIds:['111'],
  fetchImpl:unexpected.fetchImpl})).reason,'invalid_response');
});
test('CP13 a valid zero subscribers snapshot is complete and never invents members',async()=>{
 const mock=serve([{body:{data:[],total:0,pagination:{}}}]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'summary',complete:true,pages:1,
  observedActiveRows:0,providerTotal:0});
});

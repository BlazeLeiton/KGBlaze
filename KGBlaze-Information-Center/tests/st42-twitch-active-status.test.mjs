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
  if(!next)throw Error('unexpected extra Twitch API request');
  return {ok:next.status===undefined||next.status===200,status:next.status||200,
   json:async()=>next.body};
 };
 return {requests,fetchImpl};
}

test('CP14 summary uses Twitch first-page total exactly once even with terminal cursor',async()=>{
 const mock=serve([
  {body:{data:[item('111')],pagination:{cursor:'identical-terminal-cursor'},total:207}},
  {body:{data:[],pagination:{cursor:'identical-terminal-cursor'},total:207}}
 ]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'summary',complete:true,pages:1,
  observedActiveRows:1,providerTotal:207,countSource:'twitch_total',
  rosterComplete:false});
 assert.equal(mock.requests.length,1);
 const q=mock.requests[0];
 assert.equal(q.url.searchParams.get('broadcaster_id'),'70386764');
 assert.equal(q.url.searchParams.get('first'),'1');
 assert.equal(q.url.searchParams.has('after'),false);
 assert.equal(q.url.searchParams.has('user_id'),false);
 assert.equal(q.init.redirect,'manual');
 assert.equal(q.init.headers.Authorization,'Bearer SENSITIVE_OWNER_TOKEN');
 assert.equal(q.init.headers['Client-Id'],'client-fixture');
 for(const sensitive of ['Private name','PRIVATE_GIFTER','SENSITIVE_OWNER_TOKEN','111']){
  assert.equal(JSON.stringify(out).includes(sensitive),false);
 }
});
test('CP14 a missing page row and terminal cursor do not invalidate a valid provider count',async()=>{
 const mock=serve([{body:{data:[],pagination:{cursor:'repeated-at-end'},total:2}}]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.equal(out.ok,true);
 assert.equal(out.providerTotal,2);
 assert.equal(out.observedActiveRows,0);
 assert.equal(out.rosterComplete,false);
 assert.equal(mock.requests.length,1);
});
test('CP14 targeted checks only requested IDs, including gift subscription, no PII',async()=>{
 const mock=serve([{body:{data:[item('444',{is_gift:true,tier:'3000'})]}}]);
 const out=await read({...config,mode:'targeted',userIds:['444','555'],
  fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'targeted',checked:2,
  checks:[{userId:'444',active:true},{userId:'555',active:false}]});
 const q=mock.requests[0].url;
 assert.deepEqual(q.searchParams.getAll('user_id'),['444','555']);
 assert.equal(q.searchParams.has('after'),false);
 assert.equal(q.searchParams.has('first'),false);
 assert.equal(mock.requests.length,1);
 assert.equal(JSON.stringify(out).includes('PRIVATE_GIFTER'),false);
 assert.equal(JSON.stringify(out).includes('Private name'),false);
});
test('CP14 missing/invalid total or malformed first row fails closed',async()=>{
 const invalid=[
  {data:[item('111')],pagination:{cursor:'unused'}},
  {data:[],total:-1,pagination:{}},
  {data:[],total:'123',pagination:{}},
  {data:[],total:1.4,pagination:{}},
  {data:[item('111')],total:0,pagination:{}},
  {data:[item('111',{broadcaster_id:'WRONG'})],total:1},
  {data:[item('111',{tier:'9999'})],total:1},
  {data:[item('111'),item('222')],total:2}
 ];
 for(const body of invalid){
  const mock=serve([{body}]);
  const out=await read({...config,fetchImpl:mock.fetchImpl});
  assert.equal(out.reason,'invalid_response',JSON.stringify(body));
  assert.equal(mock.requests.length,1);
 }
});
test('CP14 provider/token/rate-limit failures remain unknown and never imply zero subs',async()=>{
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
  assert.equal('providerTotal' in out,false);
 }
});
test('CP14 strict validation prevents cross-channel and unfiltered requests',async()=>{
 const noFetch=async()=>{throw Error('MUST NOT FETCH')};
 for(const opts of [
  {...config,mode:'targeted',userIds:[]},
  {...config,mode:'targeted',userIds:['111','111']},
  {...config,mode:'targeted',userIds:['user_name']},
  {...config,mode:'summary',userIds:['111']},
  {...config,mode:'anything'},
  {...config,broadcasterId:'bad'}
 ]){
  const result=await read({...opts,fetchImpl:noFetch});
  assert.equal(result.ok,false);
 }
 assert.equal(validTwitchStatusIds(['1','2']).length,2);
 assert.equal(validTwitchStatusIds(Array(101).fill('123')),null);
 const unexpected=serve([{body:{data:[item('222')]}}]);
 assert.equal((await read({...config,mode:'targeted',userIds:['111'],
  fetchImpl:unexpected.fetchImpl})).reason,'invalid_response');
 const paginated=serve([{body:{data:[item('111')],pagination:{cursor:'X'}}}]);
 assert.equal((await read({...config,mode:'targeted',userIds:['111'],
  fetchImpl:paginated.fetchImpl})).reason,'unexpected_pagination');
});
test('CP14 zero total represents an explicit, valid provider response',async()=>{
 const mock=serve([{body:{data:[],total:0,pagination:{cursor:'last-page-cursor'}}}]);
 const out=await read({...config,fetchImpl:mock.fetchImpl});
 assert.deepEqual(out,{ok:true,kind:'summary',complete:true,pages:1,
  observedActiveRows:0,providerTotal:0,countSource:'twitch_total',
  rosterComplete:false});
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePublicTwitchSubscriberAnnouncement as normalize,
 publicTwitchSubscriberAcknowledgement as project,
 TWITCH_PUBLIC_ACK_WINDOW_MS} from '../src/recognition-twitch-public-announcements.mjs';

const NOW=Date.parse('2026-11-20T02:00:00Z'),owner='70386764';
const sent=new Date(NOW-1000).toISOString();
function sample(type='channel.subscribe',extras={}){
 const event={broadcaster_user_id:owner,user_id:'45123',user_login:'public_flyer',
  user_name:'Public_Flyer',tier:'1000',is_gift:false,
  message:{text:'MY PRIVATE MESSAGE MUST NOT BE REPEATED'},
  cumulative_months:4,streak_months:2,...extras};
 return {subscription:{type,version:'1',status:'enabled',
  condition:{broadcaster_user_id:owner},created_at:'2025-01-01T00:00:00Z'},event};
}
const normalizeEvent=(data,overrides={})=>normalize(data,{broadcasterId:owner,
 verifiedEvent:true,messageTimestamp:sent,now:NOW,...overrides});

test('CP09 no EventSub authenticity assertion means no visible subscriber',()=>{
 assert.equal(normalize(sample('channel.subscribe'),{broadcasterId:owner,
  messageTimestamp:sent,now:NOW}),null);
 assert.equal(normalizeEvent(sample(),{verifiedEvent:false}),null);
 assert.equal(normalizeEvent(sample(),{broadcasterId:'12345'}),null);
 assert.equal(normalizeEvent(sample(),{messageTimestamp:'invalid'}),null);
 assert.equal(normalizeEvent(sample(),{messageTimestamp:new Date(NOW+200000).toISOString()}),null);
 assert.equal(normalizeEvent(sample(),{messageTimestamp:new Date(NOW-3600000).toISOString()}),null);
});
test('CP09 accept non-gift initial subscription visible via Twitch chat',()=>{
 const result=normalizeEvent(sample());
 assert.equal(result.kind,'new_subscription');
 assert.equal(result.displayName,'Public_Flyer');
 assert.equal(result.twitchUserId,'45123');
 assert.equal(result.months,undefined);
 assert.equal(Date.parse(result.expiresAt)-Date.parse(result.occurredAt),TWITCH_PUBLIC_ACK_WINDOW_MS);
 const projected=project(result,{now:NOW});
 assert.deepEqual(projected,{platform:'twitch',kind:'new_subscription',displayName:'Public_Flyer'});
 assert.doesNotMatch(JSON.stringify(projected),/45123|MY PRIVATE MESSAGE|tier|streak|oauth/);
});
test('CP09 shared renewal can show Twitch-confirmed months, not text or streak',()=>{
 const item=normalizeEvent(sample('channel.subscription.message'));
 assert.equal(item.kind,'shared_resubscription');
 assert.equal(item.months,4);
 assert.deepEqual(project(item,{now:NOW}),{platform:'twitch',
  kind:'shared_resubscription',displayName:'Public_Flyer',months:4});
 assert.equal(JSON.stringify(item).includes('MY PRIVATE MESSAGE'),false);
 assert.equal(JSON.stringify(item).includes('streak_months'),false);
});
test('CP09 gift recipients, silent renewal and unrelated event types are excluded',()=>{
 assert.equal(normalizeEvent(sample('channel.subscribe',{is_gift:true})),null);
 assert.equal(normalizeEvent(sample('channel.subscribe',{is_gift:undefined})),null);
 assert.equal(normalizeEvent(sample('channel.subscription.message',{message:null})),null);
 assert.equal(normalizeEvent(sample('channel.subscription.gift')),null);
 assert.equal(normalizeEvent(sample('channel.subscription.end')),null);
 assert.equal(normalizeEvent(sample('channel.chat.message')),null);
});
test('CP09 rejects wrong channel, mismatched event metadata and unsafe identities',()=>{
 const b=sample();b.subscription.condition.broadcaster_user_id='999';assert.equal(normalizeEvent(b),null);
 const c=sample();c.event.broadcaster_user_id='999';assert.equal(normalizeEvent(c),null);
 const d=sample();d.subscription.status='authorization_revoked';assert.equal(normalizeEvent(d),null);
 const e=sample();e.event.user_name='<script>';assert.equal(normalizeEvent(e),null);
 const f=sample();f.event.user_name='Text\u202Eattack';assert.equal(normalizeEvent(f),null);
 const g=sample();g.event.user_id='somebody';assert.equal(normalizeEvent(g),null);
});
test('CP09 expiry prevents a public permanent subscription directory',()=>{
 const item=normalizeEvent(sample());
 assert.equal(project(item,{now:Date.parse(item.expiresAt)}),null);
 assert.equal(project({...item,expiresAt:'bad'}, {now:NOW}),null);
 assert.equal(project({...item,kind:'unshared_renewal'}, {now:NOW}),null);
 assert.equal(project({...item,displayName:'  '},{now:NOW}),null);
});

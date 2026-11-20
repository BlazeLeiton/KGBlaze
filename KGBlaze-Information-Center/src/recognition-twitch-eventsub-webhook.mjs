/**
 * Project Relight Stage 42 CP11 — inactive Twitch EventSub webhook verifier.
 * NO Worker import, route, subscription registration or DB access.
 *
 * Production integration MUST supply:
 *  - a private 10–100 ASCII EventSub secret (distinct from OAuth secrets)
 *  - the exact HTTPS callback URL and owner ID
 *  - claimMessageId() backed by atomic UNIQUE INSERT in D1.
 *
 * The HMAC is over ID + timestamp + RAW BODY, not reserialized JSON.
 * The verified notification may be transformed into an ephemeral public
 * acknowledgement, but never a full subscriber directory.
 */
import {normalizePublicTwitchSubscriberAnnouncement} from './recognition-twitch-public-announcements.mjs';

const encoder=new TextEncoder();
const MAX_BODY=65536;
const MAX_AGE_MS=10*60*1000;
const ID=/^[\x21-\x7e]{1,128}$/;
const SIGNATURE=/^sha256=([a-f0-9]{64})$/;
const TYPES=new Set(['webhook_callback_verification','notification','revocation']);
const EVENTS=new Set(['channel.subscribe','channel.subscription.message']);
const OWNER=/^[0-9]{1,24}$/;
const failed=reason=>({ok:false,reason});
const bytesFromHex=hex=>Uint8Array.from(hex.match(/../g),part=>Number.parseInt(part,16));
function equalsBytesConstantTime(a,b){
 if(!(a instanceof Uint8Array)||!(b instanceof Uint8Array)||a.length!==b.length)return false;
 let mismatch=0;
 for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];
 return mismatch===0;
}
function isValidSecret(value){
 return typeof value==='string'&&value.length>=10&&value.length<=100&&
  /^[\x20-\x7e]+$/.test(value);
}
function validCallback(value){
 try{
  const u=new URL(value);
  return u.protocol==='https:'&&u.port===''&&u.search===''&&u.hash===''&&
   u.pathname!=='/'&&u.username===''&&u.password==='';
 }catch{return false;}
}
/**
 * @param {Request} request - the ORIGINAL POST; must not have had its body read.
 * @param {object} options - injection of secret, D1 atomic claim, owner, URL.
 * @returns {object} minimal verified event; never returns original payload or tokens.
 */
export async function verifyTwitchEventSubWebhook(request,{
 secret,broadcasterId,callbackUrl,claimMessageId,now=Date.now()
}={}){
 if(!isValidSecret(secret)||!OWNER.test(broadcasterId||'')||
    !validCallback(callbackUrl)||typeof claimMessageId!=='function'||
    !Number.isSafeInteger(now))return failed('not_configured');
 if(!(request instanceof Request)||request.method!=='POST'||
    request.url!==callbackUrl)return failed('unapproved_request');
 const h=request.headers;
 const messageId=h.get('Twitch-Eventsub-Message-Id');
 const timestamp=h.get('Twitch-Eventsub-Message-Timestamp');
 const signature=h.get('Twitch-Eventsub-Message-Signature');
 const type=h.get('Twitch-Eventsub-Message-Type');
 const matched=SIGNATURE.exec(signature||'');
 if(!ID.test(messageId||'')||!matched||!TYPES.has(type))return failed('invalid_headers');
 const stamp=typeof timestamp==='string'?Date.parse(timestamp):NaN;
 if(!Number.isFinite(stamp)||Math.abs(now-stamp)>MAX_AGE_MS)
  return failed('expired_or_future_message');

 // Body is read exactly once, capped, and authenticated BEFORE JSON parsing.
 let raw;
 try{raw=new Uint8Array(await request.arrayBuffer());}
 catch{return failed('unreadable_body');}
 if(raw.length===0||raw.length>MAX_BODY)return failed('invalid_body_size');
 try{
  const secretKey=await crypto.subtle.importKey('raw',encoder.encode(secret),
   {name:'HMAC',hash:'SHA-256'},false,['sign']);
  const prefix=encoder.encode(messageId+timestamp);
  const signed=new Uint8Array(prefix.length+raw.length);
  signed.set(prefix);signed.set(raw,prefix.length);
  const mac=new Uint8Array(await crypto.subtle.sign('HMAC',secretKey,signed));
  if(!equalsBytesConstantTime(mac,bytesFromHex(matched[1])))
   return failed('invalid_signature');
 }catch{return failed('signature_verification_unavailable');}
 let data;
 try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));}
 catch{return failed('invalid_payload');}
 const subscription=data?.subscription;
 if(!EVENTS.has(subscription?.type)||subscription?.version!=='1'||
    subscription?.condition?.broadcaster_user_id!==broadcasterId||
    subscription?.transport?.method!=='webhook'||
    subscription?.transport?.callback!==callbackUrl||
    h.get('Twitch-Eventsub-Subscription-Type')!==subscription.type||
    h.get('Twitch-Eventsub-Subscription-Version')!=='1')
  return failed('wrong_subscription');
 if(type==='webhook_callback_verification'&&
   (subscription.status!=='webhook_callback_verification_pending'||
    typeof data.challenge!=='string'||data.challenge.length===0||
    data.challenge.length>1024))
  return failed('invalid_challenge');
 if(type==='notification'&&subscription.status!=='enabled')
  return failed('invalid_subscription_state');
 if(type==='notification'&&data?.event?.broadcaster_user_id!==broadcasterId)
  return failed('wrong_broadcaster');
 if(type==='revocation'&&subscription.status==='enabled')
  return failed('invalid_revocation');

 // Must be a UNIQUE, durable, atomic claim. No in-memory Set in production.
 // A failed or unavailable claim never emits an acknowledgement/challenge.
 let claimed;
 try{claimed=await claimMessageId(messageId,stamp);}
 catch{return failed('replay_store_unavailable');}
 if(claimed!==true)return failed('replayed_or_unclaimed_message');

 if(type==='webhook_callback_verification')
  return {ok:true,kind:'challenge',challenge:data.challenge};
 if(type==='revocation')return {ok:true,kind:'revocation'};
 const ack=normalizePublicTwitchSubscriberAnnouncement(data,{
  broadcasterId,verifiedEvent:true,messageTimestamp:timestamp,now
 });
 return {ok:true,kind:'notification',acknowledgement:ack};
}

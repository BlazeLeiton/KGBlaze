/**
 * Stage 42 CP09: PRIVATE, UNMOUNTED adapter for Twitch announcements
 * that were already shared in public chat. No EventSub transport, API,
 * cron, D1 writes, or Home integration is enabled here.
 *
 * SECURITY CONTRACT: Caller MUST authenticate the EventSub webhook signature
 * and reject replayed message IDs BEFORE setting verifiedEvent=true. Never
 * accept a browser-provided "verifiedEvent" flag. The timestamp is the
 * authenticated EventSub message timestamp, NOT subscription.created_at
 * (which dates the EventSub registration rather than the user action).
 *
 * This is intentionally NOT a list of all active channel subscribers.
 * - Initial subscription: only non-gift channel.subscribe notices.
 * - Resubscription: only channel.subscription.message (user shared in chat).
 * - Gift recipients, anonymous gifting, unshared renewals and messages
 *   from other sources are not listed.
 */
export const TWITCH_PUBLIC_ACK_WINDOW_MS=72*60*60*1000;
const TWITCH_EVENT_MAX_SKEW_MS=15*60*1000;
const TWITCH_OWNER_ID=/^[0-9]{1,24}$/;
const TWITCH_LOGIN=/^[a-zA-Z0-9_]{1,25}$/;
const INVISIBLE=/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069<>]/u;
const EVENTS=new Map([
 ['channel.subscribe','new_subscription'],
 ['channel.subscription.message','shared_resubscription']
]);
const validName=value=>typeof value==='string'&&
 value.trim().length>0&&value.trim().length<=48&&!INVISIBLE.test(value);

export function normalizePublicTwitchSubscriberAnnouncement(notification,{
 broadcasterId,verifiedEvent=false,messageTimestamp,now=Date.now()
}={}){
 // EventSub webhook signature / replay checks MUST occur outside this module.
 if(verifiedEvent!==true||!TWITCH_OWNER_ID.test(broadcasterId||'')||
    !Number.isSafeInteger(now))return null;
 const sub=notification?.subscription,event=notification?.event;
 const type=EVENTS.get(sub?.type);
 if(!type||sub?.version!=='1'||sub?.status!=='enabled'||
    sub?.condition?.broadcaster_user_id!==broadcasterId||
    event?.broadcaster_user_id!==broadcasterId)return null;
 const timestamp=typeof messageTimestamp==='string'?Date.parse(messageTimestamp):NaN;
 if(!Number.isFinite(timestamp)||timestamp>now+60_000||
    now-timestamp>TWITCH_EVENT_MAX_SKEW_MS)return null;
 if(!TWITCH_OWNER_ID.test(event?.user_id||'')||
    !TWITCH_LOGIN.test(event?.user_login||'')||
    !validName(event?.user_name))return null;
 if(type==='new_subscription'){
  // Gift recipients did not necessarily elect to receive a public spotlight.
  if(event.is_gift!==false)return null;
 }else if(!event.message||typeof event.message.text!=='string'){
  // A renewal only appears here after its owner chose to share a chat alert.
  return null;
 }
 const months=type==='shared_resubscription'&&
  Number.isSafeInteger(event.cumulative_months)&&event.cumulative_months>0
   ?Math.min(event.cumulative_months,1200):null;
 // The user ID is used privately for deduping, never in public projections.
 return {platform:'twitch',kind:type,twitchUserId:event.user_id,
  displayName:event.user_name.trim(),occurredAt:new Date(timestamp).toISOString(),
  expiresAt:new Date(timestamp+TWITCH_PUBLIC_ACK_WINDOW_MS).toISOString(),
  ...(months===null?{}:{months})};
}

export function publicTwitchSubscriberAcknowledgement(item,{now=Date.now()}={}){
 if(!item||item.platform!=='twitch'||
    !['new_subscription','shared_resubscription'].includes(item.kind)||
    !validName(item.displayName)||!Number.isFinite(Date.parse(item.expiresAt))||
    !Number.isSafeInteger(now)||Date.parse(item.expiresAt)<=now)return null;
 const months=item.kind==='shared_resubscription'&&
  Number.isSafeInteger(item.months)&&item.months>0
   ?Math.min(item.months,1200):null;
 // Whitelist only fields the website may render; no numeric Twitch ID,
 // custom chat message, OAuth data, tier, streak, or private subscription list.
 return {platform:'twitch',kind:item.kind,displayName:item.displayName.trim(),
  ...(months===null?{}:{months})};
}

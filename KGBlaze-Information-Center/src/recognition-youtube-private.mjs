/**
 * Stage 42 CP01: PRIVATE, UNMOUNTED YouTube memberships verifier.
 * Consults ONLY consented channel IDs (max 100) through members.list filter.
 * No Worker import, public endpoint, credentials, D1 changes, or name display.
 * Do not use unless the creator has channel-level Members API allowlisting.
 */
import {YOUTUBE_MEMBERSHIP_INTEGRATION} from './recognition-private.mjs';

export const YOUTUBE_RECOGNITION_SCOPE=YOUTUBE_MEMBERSHIP_INTEGRATION.scope;
export const YOUTUBE_RECOGNITION_FLAG='RECOGNITION_YOUTUBE_ENABLED';
const OWN_CHANNEL='UCRd_uwPjrsf6Z3CRXwNehEQ'; // existing Terminal channel, stage 7
const CHANNEL_ID=/^UC[A-Za-z0-9_-]{22}$/;
const MAX_IDS=100;
const failed=reason=>({ok:false,reason,checks:[],queried:0});

export function selectedYouTubeMemberIds(consents){
 if(!Array.isArray(consents)||consents.length>MAX_IDS)return null;
 const ids=new Set();
 for(const row of consents){
  if(!row||row.platform!=='youtube'||!CHANNEL_ID.test(row.platformUserId||'')||
    row.verifyOptIn!==true||typeof row.verifyConsentAt!=='string'||
    !Number.isFinite(Date.parse(row.verifyConsentAt))||
    row.withdrawn===true||row.withdrawnAt||row.revokedAt||
    ids.has(row.platformUserId))return null;
  ids.add(row.platformUserId);
 }
 return [...ids];
}

export async function checkOptedInYouTubeMembers(env,consents,{fetchImpl=fetch}={}){
 if(env?.RECOGNITION_YOUTUBE_ENABLED!=='true'||
    env?.YOUTUBE_MEMBERS_API_ACCESS_VERIFIED!=='true')return failed('disabled_or_not_allowlisted');
 const ids=selectedYouTubeMemberIds(consents);
 if(!ids)return failed('invalid_consent_set');
 if(ids.length===0)return {ok:true,reason:'empty_opt_in',checks:[],queried:0};
 if(env.YOUTUBE_CHANNEL_ID!==OWN_CHANNEL||
    typeof env.YOUTUBE_RECOGNITION_USER_TOKEN!=='string'||
    !env.YOUTUBE_RECOGNITION_USER_TOKEN||
    typeof fetchImpl!=='function')return failed('not_configured');
 const url=new URL('https://www.googleapis.com/youtube/v3/members');
 url.searchParams.set('part','snippet');
 url.searchParams.set('mode','all_current');
 url.searchParams.set('maxResults','100');
 url.searchParams.set('filterByMemberChannelId',ids.join(','));
 try{
  const response=await fetchImpl(url.toString(),{
   headers:{Authorization:'Bearer '+env.YOUTUBE_RECOGNITION_USER_TOKEN},
   redirect:'manual'
  });
  if(!response?.ok)return failed('provider_or_access_unavailable');
  const data=await response.json();
  if(!Array.isArray(data?.items)||data.nextPageToken)
   return failed('invalid_or_incomplete_response');
  const asked=new Set(ids),active=new Set();
  for(const item of data.items){
   const snippet=item?.snippet;
   const channelId=snippet?.memberDetails?.channelId;
   // Deleted-channel members cannot be linked to an opt-in ID.
   if(channelId===undefined||channelId===null)continue;
   if(snippet.creatorChannelId!==OWN_CHANNEL||!asked.has(channelId)||
      active.has(channelId))return failed('invalid_response');
   active.add(channelId);
  }
  return {ok:true,reason:'verified',queried:ids.length,
   checks:ids.map(platformUserId=>({platform:'youtube',platformUserId,
    active:active.has(platformUserId),subscriptionKind:'unspecified'}))};
 }catch{return failed('provider_or_access_unavailable');}
}

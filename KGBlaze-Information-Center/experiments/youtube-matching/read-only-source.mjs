/**
 * Manually invoked, read-only YouTube Data API v3 adapter.
 * No Worker route, automatic calls, token persistence, Cron or D1 dependency.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const ROOT = 'https://www.googleapis.com/youtube/v3/';

const configError = () => {throw Error('YOUTUBE_READ_CONFIGURATION_REQUIRED');};
const sourceError = () => {throw Error('YOUTUBE_READ_INCOMPLETE_OR_FAILED');};
async function readJSON(endpoint, params, apiKey, fetchImpl) {
  const url = new URL(endpoint, ROOT);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k,String(v));
  url.searchParams.set('key',apiKey); // Never returned or logged.
  let resp, body;
  try {
    resp = await fetchImpl(url.toString(),{method:'GET',headers:{Accept:'application/json'}});
    if (!resp?.ok) sourceError();
    body = await resp.json();
  } catch {sourceError();}
  if (!body || !Array.isArray(body.items)) sourceError();
  return body;
}

/**
 * One explicit call, potentially expensive: 2 x search.list (~100 units each)
 * plus videos.list for the details. No automatic repetition.
 * Incomplete pagination or missing detail records invalidate uniqueness.
 */
export async function readYouTubePreviewEvidence({
  ownedChannelId, apiKey, fetchImpl, explicitVideoIds=[],
  maxResults=20, now=()=>new Date()
}={}) {
  if (!CHANNEL_ID.test(ownedChannelId||'') || typeof apiKey!=='string' ||
      !apiKey.trim() || typeof fetchImpl!=='function' ||
      !Number.isInteger(maxResults) || maxResults<1 || maxResults>50 ||
      !Array.isArray(explicitVideoIds) || explicitVideoIds.length>50 ||
      explicitVideoIds.some(x=>typeof x!=='string'||!VIDEO_ID.test(x))) configError();
  const ids=new Set(explicitVideoIds);
  const discoveredIds=new Set();
  const searchResults={upcoming:0,live:0};
  let discoveryComplete=true;
  for(const eventType of ['upcoming','live']) {
    const result=await readJSON('search',{
      part:'snippet',type:'video',eventType,channelId:ownedChannelId,maxResults
    },apiKey,fetchImpl);
    if(result.nextPageToken)discoveryComplete=false;
    for(const item of result.items) if(item?.id?.kind==='youtube#video'&&VIDEO_ID.test(item.id.videoId||'')) {
      searchResults[eventType]++;
      discoveredIds.add(item.id.videoId);
      ids.add(item.id.videoId);
    }
  }
  const wanted=[...ids], resources=[];
  for(let i=0;i<wanted.length;i+=50) {
    const portion=wanted.slice(i,i+50);
    const data=await readJSON('videos',{part:'snippet,liveStreamingDetails',id:portion.join(',')},apiKey,fetchImpl);
    const seen=new Set();
    for(const item of data.items) {
      if(typeof item?.id!=='string'||!portion.includes(item.id)||seen.has(item.id)){
        discoveryComplete=false;continue;
      }
      resources.push(item);seen.add(item.id);
    }
    if(seen.size!==portion.length) discoveryComplete=false;
  }
  const fetchedAt=now();
  if(!(fetchedAt instanceof Date)||!Number.isFinite(fetchedAt.getTime()))configError();
  return {
    schema:'relight-youtube-evidence-preview-v1',ownedChannelId,
    fetchedAt:fetchedAt.toISOString(),discoveryComplete,resources,
    // Aggregate counts only: no credentials, titles, URLs, or provider response bodies.
    discovery:{searchResults,uniqueDiscoveredVideoIds:discoveredIds.size,
      explicitEditorialVideoIds:explicitVideoIds.length}
  };
}

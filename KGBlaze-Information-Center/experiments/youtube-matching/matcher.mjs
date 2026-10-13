/**
 * Project Relight / Terminal — offline experimental matcher.
 * No network access, credentials, database, scheduling or observation writes.
 * This is NOT an authorization to set sync.matchConfirmed or sync.verified.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const SAFE_WINDOW_MS = 90 * 60 * 1000;
const REVIEW_WINDOW_MS = 48 * 60 * 60 * 1000;
const MANUAL_STATES = new Set(['CANCELADO', 'DESCANSO', 'ESCALA', 'HIATUS']);
const STOP_WORDS = new Set(['a', 'al', 'and', 'con', 'de', 'del', 'el', 'en', 'es', 'espanol', 'for', 'in', 'la', 'las', 'live', 'los', 'oficial', 'official', 'on', 'para', 'por', 'stream', 'streaming', 'the', 'un', 'una', 'vivo', 'y']);

function words(title) {
  if (typeof title !== 'string') return [];
  const normalized = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return [...new Set((normalized.match(/[\p{L}\p{N}]+/gu) || []).filter(w => !STOP_WORDS.has(w)))];
}
function partMarker(title) {
  const plain = String(title || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const m = plain.match(/(?:#|\b(?:ep(?:isode|isodio)?|parte|part|cap(?:itulo)?|vol(?:umen)?)\.?\s*)(\d{1,3})\b/);
  return m ? m[1] : null;
}
function collabMarker(title) {
  return /(?:\b(?:collab|colab|colaboracion|collaboration|with|junto|ft\.?|feat\.?|featuring|invitad[oa]s?)\b|\s[x×]\s)/i.test(String(title || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, ''));
}
function validUTC(value) {
  const x = typeof value === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
  return Number.isFinite(x) ? x : null;
}
/** Convert a civil time to an instant without hardcoding the UTC offset. */
function cdmxInstant(day, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return null;
  const [y, m, d] = day.split('-').map(Number), [h, min] = time.split(':').map(Number);
  const civil = Date.UTC(y, m - 1, d, h, min);
  if (new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) !== day) return null;
  const f = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
  let guess = civil;
  for (let n = 0; n < 3; n++) {
    const parts = Object.fromEntries(f.formatToParts(new Date(guess)).filter(p => p.type !== 'literal').map(p => [p.type, +p.value]));
    guess += civil - Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  }
  const parts = Object.fromEntries(f.formatToParts(new Date(guess)).filter(p => p.type !== 'literal').map(p => [p.type, +p.value]));
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) === civil ? guess : null;
}
function unpackVideo(input) {
  const s = input?.snippet || {};
  const l = input?.liveStreamingDetails;
  return {
    videoId: typeof input?.id === 'string' ? input.id : '',
    channelId: typeof s.channelId === 'string' ? s.channelId : '',
    title: typeof s.title === 'string' ? s.title : '',
    scheduled: validUTC(l?.scheduledStartTime),
    isBroadcast: !!l && typeof l === 'object' && !Array.isArray(l),
    broadcastLabel: s.liveBroadcastContent
  };
}
function titleStrong(eventTitle, candidateTitle) {
  const a = words(eventTitle), b = words(candidateTitle);
  if (a.length < 2 || b.length < 2) return false;
  const em = partMarker(eventTitle), vm = partMarker(candidateTitle);
  if (em !== vm && (em !== null || vm !== null)) return false;
  if (collabMarker(eventTitle) !== collabMarker(candidateTitle)) return false;
  const bSet = new Set(b), aSet = new Set(a);
  const overlap = a.filter(w => bSet.has(w)).length;
  const coverage = overlap / a.length;
  const jaccard = overlap / new Set([...aSet, ...bSet]).size;
  return overlap >= 2 && coverage >= 0.80 && jaccard >= 0.60;
}
const result = (decision, reason, videoId) => ({decision, reason, ...(videoId ? {videoId} : {})});

/**
 * Matches one editorial departure to synthetic/previously fetched YouTube video resources.
 * ownedChannelId must come from trusted configuration, never from the candidates.
 * Outputs are only proposals, not confirmed observations for the live viewer.
 */
export function matchYouTubeEvent(event, candidates, {ownedChannelId} = {}) {
  if (!Array.isArray(event?.platforms) || !event.platforms.includes('yt')) return result('skipped', 'not_youtube_departure');
  if (MANUAL_STATES.has(event.status)) return result('skipped', 'manual_editorial_override');
  if (typeof ownedChannelId !== 'string' || !ownedChannelId.trim()) return result('none', 'trusted_channel_not_configured');
  if (!Array.isArray(candidates)) return result('none', 'candidates_missing');
  const hasExplicit = Object.hasOwn(event, 'videoId') && event.videoId !== null && event.videoId !== '';
  if (hasExplicit && (typeof event.videoId !== 'string' || !VIDEO_ID.test(event.videoId))) return result('review', 'invalid_editorial_video_id');
  const normalized = candidates.map(unpackVideo).filter(v => VIDEO_ID.test(v.videoId));
  const valid = normalized.filter(v => v.channelId === ownedChannelId && v.isBroadcast);
  if (hasExplicit) {
    const found = valid.filter(v => v.videoId === event.videoId);
    if (found.length > 1) return result('review', 'duplicate_video_resources', event.videoId);
    if (found.length === 1) return result('candidate', 'explicit_editorial_video_id', event.videoId);
    return result('review', 'explicit_id_missing_or_untrusted', event.videoId);
  }
  const start = cdmxInstant(event.day, event.time);
  if (start === null) return result('review', 'editorial_day_or_time_missing');
  const near = [], shifted = [];
  for (const v of valid) {
    if (v.scheduled === null || !titleStrong(event.title, v.title)) continue;
    const distance = Math.abs(start - v.scheduled);
    if (distance <= SAFE_WINDOW_MS) near.push(v);
    else if (distance <= REVIEW_WINDOW_MS) shifted.push(v);
  }
  if (near.length > 1) return result('review', 'ambiguous_multiple_rooms');
  if (near.length === 1 && shifted.length) return result('review', 'competing_rescheduled_rooms');
  if (near.length === 1) return result('candidate', 'unique_channel_title_time', near[0].videoId);
  if (shifted.length) return result('review', 'potential_reschedule_needs_editorial_confirmation');
  return result('none', 'no_safe_match');
}

/** Also refuse to allocate the same video to two different editorial departures. */
export function matchYouTubeAgenda(events, candidates, options = {}) {
  if (!Array.isArray(events)) return [];
  const decisions = events.map(event => ({eventId: event?.id, ...matchYouTubeEvent(event, candidates, options)}));
  const claims = new Map();
  for (const d of decisions) if (d.decision === 'candidate') claims.set(d.videoId, [...(claims.get(d.videoId) || []), d.eventId]);
  return decisions.map(d => d.decision === 'candidate' && claims.get(d.videoId).length > 1 ? {...d, decision: 'review', reason: 'video_claimed_by_multiple_events'} : d);
}

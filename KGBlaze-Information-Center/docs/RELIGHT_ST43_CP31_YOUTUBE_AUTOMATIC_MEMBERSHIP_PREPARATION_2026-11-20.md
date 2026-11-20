# Project Relight — Stage 43 CP31 | Memberlink: YouTube automatic preparation
**Local date:** 2026-11-20 (America/Mexico_City). **Scope:** creator-owned YouTube membership recognition in KGBlaze, ALWAYS YouTube before Twitch.

## Authoritative decision
- The owner rejected CSV/manual exports as a solution. The end state MUST periodically verify YouTube members from an official automated source, NOT inferred from YouTube live-chat events or Discord roles.
- Creator account: `UCRd_uwPjrsf6Z3CRXwNehEQ`. Google OAuth with own client and scope `youtube.channel-memberships.creator` succeeded.
- `membershipsLevels.list` returned 200 and six levels; two `members.list` requests returned 403 `youtube.common/forbidden`, including with `maxResults=0`. This does NOT establish API allowlisting.
- YouTube Creator Support referred the owner to the official YouTube API Issue Tracker. A request draft was prepared, but no ticket submission is confirmed by this checkpoint.
- Official API source: https://developers.google.com/youtube/data/reference/rest/v3/members/list (requires channel-level access and channel-owner authorization; `mode=all_current` supports pagination). Resource schema: https://developers.google.com/youtube/data/reference/rest/v3/members .

## CP31 prepared now
1. `src/recognition-youtube-membership.mjs` prepares a **server-only** all-current paginated snapshot source (100 members/page, 30 pages/3,000 member hard cap). Strict identity checks, owner channel match, duplicate and repeated-cursor rejection, finite pagination. Members whose profile details are missing are never assigned fabricated IDs or display names.
2. The same module prepares a **server-side OAuth refresh helper**, with injected private credentials and refresh token. It never stores these secrets, prints them, or exposes them to the public API. Refresh tokens in OAuth Testing mode are not assumed to live indefinitely.
3. `migrations/recognition_youtube_membership_v1.sql` prepares **separate**, unapplied D1 metadata and membership tables; consent defaults to `unasked`, with `approved/declined`. No Google token is stored in this schema. Independent secure vault and callback remain for later security review.
4. `commitYouTubeCurrentMembers` prepares a version/lock/CAS D1 transaction. A snapshot must be confirmed complete before it can mark missing members inactive. Provider 401/403/429/5xx, invalid payload, looping cursor, or partial scan **never** changes membership status. Member consent is preserved across upserts. The new private writer is not connected to production.
5. `readPublicYouTubeRecognition` is empty unless **all** private and public flags are true, the D1 schema exists, the record is active, consent is `approved`, and the last provider verification is within 36 hours. Public response exposes ONLY safe display names, never IDs, level IDs, OAuth data or billing details.
6. Public API `GET /api/public/recognition` now returns the backwards-compatible existing `twitch` array plus `youtube:[]` while disabled. The Home accepts both sources and renders **YouTube first**, **Twitch second**, with a YouTube icon; existing Twitch icon, trial label and hard cutoff are unchanged.
7. `wrangler.toml`: `RECOGNITION_YOUTUBE_ENABLED=false`, `YOUTUBE_MEMBERS_API_ACCESS_VERIFIED=false`, `RECOGNITION_YOUTUBE_STORE_ENABLED=false`, `RECOGNITION_YOUTUBE_PUBLIC_ENABLED=false`. Never enable them just to test Google API access.
8. Regression tests cover fail-closed guards, no unwanted network/writes, pagination, wrong channel, 403 and 429, Google token refresh shape, consent-only public output, correct source ordering and preservation of existing Twitch gates.

## Explicit NOT DONE (and must not be implied)
- No production Google Memberships API access: still blocked by 403 pending Google's channel allowlist. Do not confuse six levels with access to the member roster.
- No YouTube owner OAuth grant established inside Cloudflare Worker. The existing OAuth Playground tokens must NOT be copied into repository or Worker; a secure owner-only Authorization Code flow, one-time CSRF state, approved redirect URI, encryption key, encrypted D1 vault, rotation/safe disconnection, and verified refresh behavior remain for implementation/review. Do not expose these secrets.
- D1 migration deliberately **not applied**. No YouTube identity or consent has been imported. No public YouTube name is shown. No member verification Cron, provider calls, or new admin routes have been mounted.
- The existing five-minute YouTube video-sync Cron is unrelated and MUST NOT be repurposed for membership checks. A future membership Cron must have its own rate-limited schedule, default off, separated from Twitch and the departure-board pipeline.
- No automatic feature activation based solely on a response from the Issue Tracker. Perform real allowlist test, validate OAuth production lifetime, confirm owner connection, apply migration with D1 Time Travel bookmark, and activate gates separately.
- Twitch CP28/29's 22-Nov-2026 03:00 CDMX trial cutoff is preserved. Do not treat this cutoff as the membership subscription expiration.
- No manual CSV fallback, no visitor OAuth requirement, no MCN workaround, no undocumented access route.

## After Google's response (external dependency)
1. Owner verifies that `members.list` returns 200 under the **same creator OAuth client**, not merely `membershipsLevels.list`.
2. Review OAuth consent configuration for non-expiring/renewable production use; configure app HTTPS callback and private encrypted vault (no manual token copy).
3. Apply the isolated migration only after owner-approved backup and schema inspection.
4. Connect refresh, snapshot, status and a separate scheduled task under private-only gates; run mocked failures and live read-only check, then a private first sync. Unknown/stale/error must never be equated with cancellation.
5. Obtain genuine per-person publication consent before publicizing names. Enable public gate separately. Never expose the roster. Keep YouTube-first visual ordering.
6. Recheck Twitch behavior and the Home languages ES/EN/JA and mobile layout before release.

## Review/reference
- Prior checkpoint: Stage43 CP30 / PR #227; Twitch CP26–CP29 / PR #223–226.
- Official YouTube Members API: https://developers.google.com/youtube/data/reference/rest/v3/members/list
- All changes designed to remain safe if Google never approves API access.

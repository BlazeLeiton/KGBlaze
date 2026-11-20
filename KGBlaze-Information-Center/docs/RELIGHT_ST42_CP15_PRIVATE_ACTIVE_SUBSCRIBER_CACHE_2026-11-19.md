# Project Relight · Stage 42 CP15 — Private active-subscriber cache (STAGED / OFF)

Date: 2026-11-19, America/Mexico_City.

## Completed real-owner validation

Following the CP14 fix to Twitch Helix total/count pagination, the owner successfully executed the private admin read of the production subscription summary and reported:

- `Ok=True`
- `Complete=True`
- `SubscriberTotal=2`
- `Pages=1`

This confirms that the **live Twitch owner OAuth and Helix Get Broadcaster Subscriptions** returned a valid current count at the time of the test. It does **not** prove that KGBlaze currently has a list of subscriber identities, an automatically updating cache or public status badges. No OAuth credential or subscriber identity was shared.

## Purpose

Keep a subscriber recognized **while their subscription is active**, instead of displaying only 72-hour EventSub acknowledgements. Twitch remains the current technical priority; YouTube member verification requires separate creator API access and future Ko-fi recurring memberships remain a reserved category. This must not become a general viewer/follower registry.

## CP15 prepared now

1. `src/recognition-twitch-roster-snapshot.mjs`: private Helix reader, using the existing owner access token server-side. Fetches pages of 100. Unlike the original CP13 summary, which failed on a repeated terminal cursor, it considers a roster **complete as soon as the distinct subscriber ID count matches Twitch's official `total`**, even if Twitch still returns a cursor. It fails closed if the cursor repeats BEFORE complete coverage, if the provider totals change, if data are malformed, or if Twitch fails/rate limits. Maximum 500 subscriptions until write-size/rate-limit review; the currently verified total is 2.
2. `migrations/recognition_twitch_active_status.sql`: **two new private D1 tables**, for active subscribed Twitch user IDs/display names and one completion/version metadata record. Both have foreign key cascades so disconnecting owner OAuth automatically deletes cached subscriber identities. Does not alter Terminal editorial, OAuth tables, or other supporter data. **This file is NOT applied to production by the PR.**
3. `src/recognition-twitch-active-cache.mjs`: private atomic `DB.batch` swap. Only commits a FULL valid snapshot. The database transaction deletes prior rows, inserts verified active rows and advances the version together. A provider failure leaves the prior verified snapshot untouched; a fully verified empty roster is the only condition that can clear the active list.
4. `syncStoredTwitchActiveSubscribers`: server-side integration with the encrypted existing Twitch owner OAuth and serialized token refresh, private 30-minute minimum refresh interval. Returns counts and freshness metadata only; no identities in HTTP responses.
5. Admin-only POST `/departures/api/admin/recognition/twitch/sync-status-cache` (canonical prefix only), requiring existing `ADMIN_TOKEN` and `X-Relight-Recognition-Confirm: sync-private-subscriber-cache`. No public/root alias, no Cron, no public list.
6. `RECOGNITION_TWITCH_CACHE_ENABLED = "false"` in Wrangler; feature remains **disabled by default**. There is no automatic migration, provider read, D1 subscription cache write, or Home projection until migration, approval and separate production enablement.
7. New tests for terminal cursor, incomplete/429/401/total changes, transactional cache replacement, expired subscriber removal only after successful sync, and admin-route denial/confirmation gates. Existing Home/Terminal and YouTube Cron remain unchanged.

## Important boundaries

- The private tables include user IDs and public Twitch display names **only to support future status recognition**. No public names, member tiers, gifting identities, messages, tokens or account billing are exposed or persisted.
- Current cache is **not yet used** as authentication or an entitlement decision. Identifying a specific website visitor still requires verifying that they control the corresponding Twitch account.
- Public recognition may require a presentation/moderation/visibility decision; private subscription eligibility alone is not a mandate to publish a permanent roster on an external domain.
- A successful snapshot at time T is evidence of active subscriptions at T, not a guarantee indefinitely. Avoid showing a stale badge as verified if Twitch is unavailable.
- Disconnect lifecycle is now guarded at the schema level: both cache tables have D1-enforced ON DELETE CASCADE foreign keys back to the private owner OAuth credentials. Deleting owner credentials removes cache metadata and subscriber rows in the same database operation. This must be verified after owner migration in the correct production D1. Feature remains OFF until migration, concurrency controls and the public visibility policy are reviewed.

## Production release gates (OWNER INTERVENTION NEEDED, NOT DONE)

1. Back up/verify recovery point for Cloudflare D1 `kgblaze-terminal`. Review and apply the isolated migration manually using the actual production D1 administration access. Example from a checked-out repository root:
   ```bash
   cd KGBlaze-Information-Center
   npx wrangler d1 execute kgblaze-terminal --remote --file=migrations/recognition_twitch_active_status.sql
   ```
   Do not run against the wrong D1 binding or use `--local`; confirm account/database first. Avoid sending Cloudflare tokens/credentials through chat.
2. After schema verification, separately approve enabling `RECOGNITION_TWITCH_CACHE_ENABLED` and perform a **single** admin-only sync, using a local secure `ADMIN_TOKEN` and the exact confirmation header.
3. Verify only summary metadata (expected current count may change, never assume permanently 2). Check admin security, no subscribers in public agenda, D1 atomicity, lock and stale semantics.
4. Implement a reviewed lock/serialization and time-based 30-minute scheduled refresh (existing cron with throttling) before activating automatic updates.
5. Define approved public view (names vs personalized authenticated badge) and deletion/suppression path. Do not infer that Twitch provider status alone authorizes public directory of account identities.

This staged PR is a preparation; **do not request that the owner apply the migration until CI, merge and Cloudflare build/smoke are confirmed**. The user's live Twitch credentials stay encrypted and unchanged.

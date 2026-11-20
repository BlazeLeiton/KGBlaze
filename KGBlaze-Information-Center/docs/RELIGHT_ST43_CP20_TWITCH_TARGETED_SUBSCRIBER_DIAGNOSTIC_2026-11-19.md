# Project Relight — Stage 43 / CP20: independent targeted Twitch subscriber verification

**Incident:** After merged CP19 (#216) and deploy, the owner received the sanitized private result `Ok=False, Reason=provider_total_below_observed, Phase=first_page, TotalRecheck=still_below`. The first unfiltered Helix subscription page includes more distinct valid subscriber IDs than Twitch's `total`, and a second independent `first=1` count still remains below those observed IDs. This **does not indicate OAuth failure**. It is not a pagination-cursor defect; this particular error happens before requesting any later page.

## Official provider contract

See [Get Broadcaster Subscriptions](https://dev.twitch.tv/docs/api/reference/subscriptions). It supports repeating `user_id` for up to 100 identifiers; the provider **omits `total` and `pagination` on filtered responses**. The owner user token with `channel:read:subscriptions` remains suitable. These filtered read-only checks give per-ID positive membership evidence but do not define a complete roster. The other endpoint `/helix/subscriptions/user` expects member-side credentials and is **not used** for this owner-only check.

The official documentation notes that deleted accounts can produce missing rows relative to the count; that is the **opposite direction** from this observed discrepancy. Do not attribute cause to account deletion or promise Twitch is at fault.

## CP20 diagnostic (private-only, non-destructive)

After the already-verified CP19 mismatch (`first_page` + `still_below`), make at most **one additional Helix request**, repeating `user_id` for at most five validated IDs already encountered in that first page. Use owner OAuth server-side, `redirect:'manual'`, no new token, no caller-controlled IDs.

Return only the static private `targetedCheck` category:

- `all_confirmed`: all sampled IDs were returned by the filtered API (not the whole roster).
- `some_confirmed`: only some sampled IDs returned active.
- `none_confirmed`: no sampled IDs matched.
- `inconsistent`: unexpected structure, identity, channel, duplicate or unfiltered metadata.
- `unavailable`: HTTP failure, 429/401, malformed response or transport failure.

Keep `ok:false` and `reason:'provider_total_below_observed'` in all cases. A positive sample **never authorizes full-cache replacement**. No subscriber IDs, display names, tokens, totals, raw Helix data, or request URL returned or logged. A network failure never becomes evidence of an ended subscription.

## What this does not implement

No automatic 30-minute sync, Cron, EventSub registration, new schema/migration, overwrite of `recognition_twitch_active_subscribers`, public names, badge, user linkage, consent collection, YouTube or Ko-fi connection. The recognition design still needs authenticated fan identity, optional public name opt-in, and freshness/expiry semantics; do not call an owner-authorized roster a public directory.

**Next decision:** Depending on `targetedCheck`, design an opt-in, user-authenticated verification flow using filtered owner checks and a distinct, positive-only/freshness-aware store. Do not change full roster cache semantics to silently accept the contradictory `total`.

## QA and owner action

- GitHub regression checks, Cloudflare build, anonymous production security smoke must be successful.
- Owner repeats the same existing secure administrative PowerShell POST; it could write the cache only if a **separately valid full roster** is received, which is unchanged from CP19.
- Owner shares only `Ok`, `Refreshed`, `SnapshotVersion`, `Reason`, `Phase`, `TotalRecheck`, and `TargetedCheck` after deploy. Never share tokens, raw HTTP error bodies, subscriber count, IDs or names.

**Status:** This document describes a bounded, diagnostic CP20, not completion of public recognition.
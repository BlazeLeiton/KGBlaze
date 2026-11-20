# Project Relight — Stage 43 · CP19 — Non-destructive Twitch subscriber-total recheck

Date: 2026-11-19, America/Mexico_City. Continuation of exhausted Stage 42 CP18 (merged PR #215).

## Actual owner report, no credentials or identities

The secure one-shot owner POST returned only:

```text
Ok=False
Refreshed=<empty>
SnapshotVersion=<empty>
Reason=provider_total_below_observed
```

The current reader had validated **more distinct subscriber IDs in Twitch's data pages than the `total` on its initial unfiltered response**. This does *not* mean the OAuth binding failed. The owner connection and separate count summary previously worked. The first complete D1 snapshot is still unconfirmed. This error occurs **before** the D1 batch replaces any records.

Official documentation: https://dev.twitch.tv/docs/api/reference/subscriptions describes `total` as the number of subscribing users; it also warns that some subscriptions may be absent from `data` and that terminal pages may still contain cursors. Missing/deleted accounts are relevant to **total exceeding observed rows**, but do **not** by themselves explain the reverse inequality observed here. General API documentation explains that paginated lists are dynamic: https://dev.twitch.tv/docs/api/guide.

## CP19 bounded diagnostic, not a sync bypass

At the exact `provider_total_below_observed` failure branch, make **at most one independent additional read-only** request to the official Helix endpoint using `first=1`, same unfiltered `broadcaster_id`, and existing encrypted-owner OAuth credentials only inside Worker.

Return from the private admin-only endpoint **only static strings**, in addition to the unchanged `reason`:

- `phase=first_page` or `phase=later_page`: where the first contradiction occurred.
- `totalRecheck=still_below`: the separate numeric count remains lower than distinct IDs seen so far.
- `totalRecheck=caught_up_or_higher`: the separate numeric count is now at least as large as distinct IDs seen so far; this suggests time variation but is **NOT proof of a complete roster**.
- `totalRecheck=unavailable`: recheck failed or returned an unusable response.

Do not return any counts, IDs, names, raw provider JSON, OAuth credentials or internal stack traces. This probe never retries the roster, never corrects the declared `total`, and never authorizes a D1 write. Its result remains `ok:false`; the previously verified snapshot (if any) stays unchanged, even if the count recheck catches up.

The current `RECOGNITION_TWITCH_CACHE_ENABLED` flag, D1 schema, CAS transactional swap, OAuth/refresh, YouTube, EventSub, Cron, public site, and owner-only route remain unchanged.

## What this can and cannot conclude

- `first_page` with `still_below`: discrepancy occurs in one page and persists across a second independent count; do not infer how Twitch internally computes it.
- `later_page` with `caught_up_or_higher`: the count could have changed during pagination; do not call the roster complete or replace D1.
- `unavailable`: no further inference. If rate-limited, do not retry repeatedly.
- Any result: no subscription expiration, member removal or permission to publish private identities can be inferred.

A durable next design, subject to separate review, would prioritize consented, **targeted** active-status verification and additive/non-destructive cache semantics, with a freshness model, over pretending that an inconsistent global roster is authoritative. Such a change requires separate code, tests, and likely D1 review; it is not implemented in CP19.

## Safety/regression gates

1. Regression tests on first-page vs later-page contradictions, still-low vs caught-up totals, malformed/unavailable count, and no D1 deletion even when recount catches up.
2. Full GitHub CI success; Cloudflare Workers Builds success for merged main; anonymous production smoke confirms private route stays protected.
3. Only **after deployment**, owner may repeat the same private PowerShell POST, sharing `Ok`, `Refreshed`, `SnapshotVersion`, `Reason`, `Phase`, `TotalRecheck` but nothing identifying subscribers or secrets.

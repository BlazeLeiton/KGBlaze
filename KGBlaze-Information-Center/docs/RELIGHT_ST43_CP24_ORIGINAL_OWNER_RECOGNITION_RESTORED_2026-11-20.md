# Project Relight — Stage 43 CP24: ReSpark correction to Stages 38–42 (creator-owner subscription data)

**Date:** 2026-11-20, America/Mexico_City. **Source fidelity:** creator clarification in Stage 43 + exact Stage 41/42 checkpoints and merged original PRs, NOT the subsequent erroneous Stage 43 CP21/CP22 design.

## Binding original scope — no site visitor login

Stage 41 CP05/CP07/CP08: the compact Home strip is located **at the end of Hero after YouTube/Twitch terminals**, with approved Spanish title **«Gracias a quienes hacen posible este viaje»**. Reuse the existing Twitch **KGBlaze Integrated Services** app, existing Worker/D1 and YouTube infrastructure; do not create another app. Stage 42 CP10: the eligible categories are **Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes** (the last reserved for future verifiable Ko-fi/other subscription services); this is NOT a census of viewers, visitors, donations, followers, or purchases.

Stage 42 CP09: voluntary Twitch subscription announcements shown in the Twitch chat may be used for **recent public acknowledgements** (EventSub prototype, unmounted, 72-hour window), not as proof of all currently active subscriptions. Stage 42 CP12: the creator explicitly asked whether there was access to the live active list and chose **Twitch Helix Get Broadcaster Subscriptions with the already-authorized broadcaster OAuth** as the main source of subscription status. Public acknowledgment and ongoing active status are separate goals. **No member is required to open KGBlaze, create an account, authenticate or provide their personal details.**

The Stage 41 consent/alias helper was preparatory and not mounted; public display of names still requires a separate appropriate visibility/publication policy. **Having private API access does not itself authorize publishing a permanent directory of subscriber identities.** Do not misread this privacy requirement as a request to make every visitor log in.

## Verified production facts

- Stage 42 owner OAuth already connected using `channel:read:subscriptions`; no app authorization work necessary.
- Dedicated owner-only D1 tables `recognition_twitch_active_status_meta` and `recognition_twitch_active_subscribers` applied to production during CP15/CP16, as owner verified. Manual-only sync enabled; **no confirmed successful complete roster snapshot**.
- Stage 43 CP18–CP20 live, sanitized error chain:
  `provider_total_below_observed` → `phase=first_page` → `totalRecheck=still_below` → `targetedCheck=all_confirmed`.
  A small sample of valid IDs *returned by Twitch itself* also verifies as active via owner-side `user_id` filters. This is **not the complete roster**. The provider `total` remains contradictory to observed first-page distinct IDs and must not be trusted for destructive replacement.
- Under the currently implemented full-roster algorithm, failed or contradictory provider reads **must not delete/replace** previous D1 subscriber data.
- Twitch official API reference: https://dev.twitch.tv/docs/api/reference/subscriptions. Filtered owner `user_id` checks support up to 100 IDs and omit `total`; they do NOT need visitor OAuth. EventSub is complementary, not the primary active-membership source.
- YouTube Members API remains a separate conditional integration requiring creator OAuth and special access/allowlist, not a key for public videos. Ko-fi/other subscriptions remain future and not assumed active.

## How the error entered Stage 43

Stage 43 CP21, PR #218 incorrectly framed visitor identity OAuth as a mandatory architecture choice; CP22 PR #219 implemented a dormant fan login / consent / D1 migration / callback, and CP23 PR #220 added anonymous smoke assertions that it remained unavailable. **This was not a creator-approved change of scope.** The creator explicitly corrected it on 20 Nov: KGBlaze should extract the providers' own membership data for reference, with no visitor registration, new login, or action.

## CP24 corrective code scope

- Remove CP22 Twitch fan OAuth module, schema, sessions, endpoints, callback, flag and tests, **never applied to D1** and never activated. Keep root/member URLs returning 404 and maintain anonymous smoke safety.
- Preserve owner OAuth, targeted Helix verification and existing protections on D1 cache, editorial Home, Terminal and existing Cron.
- Keep CP21/CP22 historical docs with an explicit superseded notice; do not silently rewrite chronology or claim the creator approved that architecture.
- Preserve the useful CP22 strengthening: filtered membership status should rely on essential ID/channel attributes rather than optional display/tier/gift attributes; existing tests retain that regression.

## Next implementation, aligned with creator request (NOT completed in CP24)

1. **Private source discovery:** read the broadcaster's active subscriptions via existing owner OAuth from `Get Broadcaster Subscriptions`. Treat validated returned IDs as *positive evidence* even if the unfiltered `total` is lower than the observed number. Never equate partial coverage with the whole active set. Keep a bound on pages/cursors/rate limits and never log PII.
2. **Non-destructive incremental reconciliation:** consider a separately reviewed private ADD/UPDATE-only process for validated IDs, combined with targeted rechecks of previously known IDs using the same **owner** OAuth. DO NOT delete or mark inactive based only on an inconsistent count, a partial scan, rate limit, or a network error. Control freshness and busy/race locks; do not conflate state cache with entitlement decisions.
3. Only after safe read/reconciliation tests, review scheduling (existing Terminal Cron unchanged until then), D1 private schema/recovery and owner-only health/summary diagnostics.
4. Independently design Home public acknowledgments: recent Twitch public/shared events may have suitable visibility; **do not publish a permanent list of privately obtained account IDs or names solely because the creator can read them**. Existing compact strip stays intact.
5. YouTube creator OAuth/Members API capability must be confirmed separately; no automatic claim of enablement, no viewer login requirement.
6. **No request to register `/twitch/member/callback`, no fan OAuth / login links or member-initiated actions.**

## Directly inspected sources

- Original Stage 41 PRs: #193, #195, #196.
- Original Stage 42 PRs: #204 (CP09), #205 (CP10), #207 (CP12), #211 (CP15), #213 (CP16).
- Repo docs: `RELIGHT_ST42_CP09_TWITCH_PUBLIC_SUBSCRIBER_ACK_2026-11-19.md`, `RELIGHT_ST42_CP10_RECURRING_SUBSCRIPTIONS_MEMBERSHIPS_2026-11-19.md`, `RELIGHT_ST42_CP12_TWITCH_ACTIVE_SUBSCRIPTION_STATUS_2026-11-19.md`, `RELIGHT_ST42_CP15_PRIVATE_ACTIVE_SUBSCRIBER_CACHE_2026-11-19.md`, `RELIGHT_ST42_CP16_MANUAL_TWITCH_CACHE_ACTIVATION_2026-11-19.md`.
- Library historical ReSpark `RELIGHT_ST38_ST42_RESPARK_2026-11-19_CP01.md`, existing Stage 43 CP01.
- Stage 43 #216 (recheck), #217 (positive targeted cross-check). #218–#220 visitor-auth deviation corrected by CP24.

**No new OAuth token, no D1 migration, no member data writes, no new public roster and no site visitor registration in this corrective change.**

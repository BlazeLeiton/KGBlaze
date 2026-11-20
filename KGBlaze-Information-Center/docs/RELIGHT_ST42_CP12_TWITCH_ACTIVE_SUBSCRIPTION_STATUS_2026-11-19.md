# Project Relight — Stage 42 CP12: Twitch active subscription status

Decision date: 2026-11-19, America/Mexico_City. Creator clarification: the KGBlaze recognition is a **status associated with a currently valid subscriber**, not solely a 72-hour acknowledgement of a new-subscription event. Twitch events are not the only data source.

## Verified Twitch API capabilities

Official source: https://dev.twitch.tv/docs/api/reference/subscriptions
Scope: https://dev.twitch.tv/docs/authentication/scopes

- GET https://api.twitch.tv/helix/subscriptions?broadcaster_id=70386764&first=100 with the broadcaster's **user access token** carrying channel:read:subscriptions. The owner OAuth is already connected as of CP08, but no active subscriber roster has yet been requested from this chat or mounted on Worker.
- API returns currently subscribed users, with user_id, display name, user login, tier, and is_gift (including gift subscriptions).
- The entire active set can be fetched with cursor pagination; a page can contain 0 rows and still have a continuation cursor. Treat a snapshot as complete only after pagination has been exhausted successfully. Never infer inactive from a partial/failing page.
- For targeted verification, add up to 100 user_id parameters on the same broadcaster endpoint. This works with the **broadcaster's existing OAuth**; don't confuse with GET /helix/subscriptions/user, which generally requires individual viewer authorization and serves a separate use case.
- API does **not** return an exact expiration date for each subscriber or whether the next renewal will be paid; active status must be periodically reconciled. A canceled auto-renewal may remain active until the paid period ends.
- A missing row after a fully successful, current reconciliation means **not presently included as active**; transport/token/429/5xx failure means **unknown/stale**, not proof of inactivity.

## Model: subscription status vs event

1. **Source of truth:** private Helix Get Broadcaster Subscriptions snapshot or filtered verification; uses only the already encrypted owner OAuth credentials in D1 inside Worker, with refresh serialization and no plaintext browser token.
2. **Complementary events:** CP09/CP11 EventSub is optional for more timely new-sub and shared-renewal acknowledgements; never replace the live status reconciliation with a rolling 72-hour event window.
3. **Display:** show only a minimal status such as “Suscripción activa” or a subscriber badge during verified validity. Do not expose gifter identity, account ID, tier, token or a list of private API records unless a separate display policy authorizes that public presentation. An internal admin list and a public roster are not equivalent.
4. **Identity:** a public page can present acknowledged names without asking the viewer to sign in; to tell an individual visiting the website “your subscription is active” securely, their Twitch user ID must be authenticated or otherwise reliably linked to that visitor. Never accept self-declared user_id or login as identity proof.
5. **Freshness:** propose an incremental 15–60 minute refresh (subject to API rate limits, subscription count and actual UX). A failed refresh marks status as stale/unverified; do not blindly extend validity or remove real benefits on transient failures. For eligibility checks on sensitive benefits, do a timely targeted verification.
6. **Privacy and scope:** recognition belongs to Twitch subscribers, YouTube channel members and future verified recurring memberships (Ko-fi/other). It is NOT a registry of all viewers/followers/donors. Public name publication needs a distinct, proportionate visibility policy; owner OAuth allows verification but does not itself authorize creating a permanent public identity directory.

## Implementation gates

- Review read-only, authenticated **admin diagnostics** of the roster first; no public route or automatic full export.
- Connect the existing unmounted Twitch verification adapter to the already encrypted OAuth token in D1; remove any expectation of plaintext TWITCH_RECOGNITION_USER_TOKEN in Wrangler production.
- Confirm pagination, empty pages/cursors, rate limiting, token rotation, cache TTL, failures and data minimization in isolated tests.
- Decide whether Home will show a publicly acknowledged roster/badges or only anonymous aggregates and recent notices, based on the established public recognition policy.
- Maintain CP11 EventSub verifier but do not require an EventSub HMAC secret or callback registration just to implement active subscription status.
- Keep YouTube memberships as an independent provider blocked on actual channel Members API access and creator OAuth; Ko-fi and other subscriptions are future integrations.

No Worker code, live subscriber query, D1 migration, new permissions, website roster or external account data retrieval is authorized by this checkpoint alone.

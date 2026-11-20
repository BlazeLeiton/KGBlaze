# Project Relight — Stage 42 CP14: Active Twitch summary cursor hotfix

Date: 19 November 2026, Mexico City local time (22:03 approx).

## Incident

After CP13 deployment, the owner executed the admin-only read of the live Twitch subscription summary and received **`{"ok":false,"reason":"invalid_or_repeated_cursor"}`**. This indicates the Worker reached the Twitch subscription reader but its own pagination validator rejected a cursor. The exact provider response remains private and was not captured; do not infer whether the cursor was malformed or repeated.

Official Twitch documentation for `GET /helix/subscriptions` specifies:
- `total` already returns the current total number of subscribers **on the first unfiltered response**.
- `pagination.cursor` may be returned **even on the last page**; requesting it can return an empty page.
- Some pages may have no rows even though a cursor is present, due to missing accounts.

Source: https://dev.twitch.tv/docs/api/reference/subscriptions

Historically, Twitch developers also reported persistent/endless subscription pagination cursors: https://discuss.dev.twitch.com/t/helix-subscriptions-pagination-cursor-loops-endlessly/25446. This context is consistent with—but does not prove—the precise nature of the present incident.

## Fix

- The existing authenticated admin `GET /departures/api/admin/recognition/twitch/subscription-summary` uses **exactly one** Helix GET with `broadcaster_id` and `first=1`. It reads only `total`; no `after` or cursor inspection.
- Response fields remain minimal: `providerTotal`, `complete:true` for the **count**, `pages:1`, `observedActiveRows` 0–1, `countSource:"twitch_total"`, and `rosterComplete:false`. This is **not** evidence that every subscriber identity was enumerated. In particular, `observedActiveRows` must never be displayed as the total.
- The separate private `POST /departures/api/admin/recognition/twitch/check-subscribers` continues to use explicitly provided 1–100 numeric user IDs and returns only current active booleans, with no full scan.
- The existing owner token remains encrypted in D1. No public route, Cron job, EventSub registration, new OAuth scope, D1 migration, alias list, Home badge, or public member roster is introduced.
- Unavailable Twitch, 429, invalid JSON or unauthorized tokens remain **unknown** and are not interpreted as zero subscribers or expired status.

## Operational validation

1. PR CI regression must pass; deploy Worker only after tests. Run an anonymous public smoke (Home/Terminal/D1 and 401/404 for admin subscriber status).
2. Owner reruns the same previously provided secure PowerShell command with their private `ADMIN_TOKEN`, using the `X-Relight-Recognition-Confirm: read-subscription-status` header.
3. Owner may share only `Ok`, `Complete`, `SubscriberTotal`, `Pages`, or a sanitized `reason`; do **not** paste ADMIN_TOKEN, Twitch account identities, OAuth code/URL or raw responses.
4. If the count succeeds, CP14 confirms provider total. A future *per-person status badge* needs an independently authenticated association of that visitor with their Twitch ID, a safe freshness policy and access/visibility review. The provider count cannot be used as a roster.

No OAuth reauthorization or Cloudflare secret changes should be necessary for this fix.

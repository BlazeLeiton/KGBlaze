# Project Relight — Stage 42 CP17: Twitch private cache sync `invalid_response`

Date: 2026-11-19 America/Mexico_City / 2026-11-20 UTC.

## Incident, established facts and limits

The owner previously confirmed `ok=true`, `complete=true` for an **authenticated, private Twitch broadcaster subscription summary** using the broadcaster's encrypted OAuth token (CP14). The isolated production D1 schema with both cache tables was created by the owner; CP16 enabled only **manual** private cache sync.

The first CP16 owner's POST to `/departures/api/admin/recognition/twitch/sync-status-cache` returned `{"ok":false,"reason":"invalid_response"}`. No sensitive Twitch response/body, subscriber ID, nickname or OAuth material was supplied to the assistant. The old result is compatible with one of several overly strict validations; **the exact rejected field is not known**. The existing code returns before D1 writes on a failed provider snapshot, so this did not perform a successful cache replacement. It does NOT signal that owner OAuth was revoked.

## Official provider contract, reviewed

Twitch Get Broadcaster Subscriptions: https://dev.twitch.tv/docs/api/reference/subscriptions

The API returns `data` entries with subscribing `user_id`, `broadcaster_id`, subscription tier, gift details and display fields. For **active subscriber status**, the two numeric identity strings and correct authorized channel are the essential fields. Our former adapter additionally required exact `tier`, `is_gift`, `user_login` and `user_name` types, a fixed login regexp and a short display-name cap. Those **cosmetic/unused** fields must not cause an otherwise valid subscriber to lose their active status.

The Twitch documentation also states **some subscriptions may be omitted from `data`**, for example deleted user accounts, even while `pagination.cursor` remains. To prevent silently revoking an existing subscriber, we still refuse a full replacement if the validated distinct user ID count does not reconcile to the provider's official `total`.

## CP17 correction

- Require a valid, numeric `user_id` and exact broadcaster `broadcaster_id` in each row. Do not downgrade those security checks.
- `tier`, `is_gift` and `user_login` are not needed to maintain active status; their absence or unusual values must not invalidate the entire roster.
- Use a sanitized `user_name` where safe, then safe `user_login`; otherwise persist only the neutral private sentinel **`Suscriptor de Twitch`** to satisfy the existing non-empty D1 field. It is **not a public profile name**, may not be published as a real nickname, and must not be used for identity authentication. The private cache stays admin-only, with no public names, benefits or badges.
- Distinguish **static, no-PII error categories**: `invalid_response_shape`, `invalid_response_total`, `invalid_response_identity`; keep incomplete/repeated-cursor and token/provider errors separate. Raw provider data, user IDs, real aliases and tokens are NEVER echoed to HTTP or logs.
- Keep the original D1 batch CAS, owner OAuth refresh, fail-on-provider-error, and `RECOGNITION_TWITCH_CACHE_ENABLED=true` manual-only flag. No new schema/migration/secret/cron is needed.

## Validation / owner gate

Full GitHub regression and Chrome viewer tests, then Cloudflare Workers Builds and live anonymous 401/404 smoke **must** pass before retry. After confirming the new version is live, the owner can **repeat exactly the same local PowerShell command**, securely supplying their private `ADMIN_TOKEN`.

Expected first successful synchronization: `Ok=True`, `Refreshed=True`, and a positive `SnapshotVersion`. The active total can change; it is optional to disclose.

If the provider still returns an error, share **only the static `reason`**. The revised categories isolate any remaining format/identity issue without sharing subscriber information. Do not send an unredacted API response or subscriber list.

The actual live corrected API path is not considered proven until the owner confirms the private POST. The public Home and Terminal remain unchanged.

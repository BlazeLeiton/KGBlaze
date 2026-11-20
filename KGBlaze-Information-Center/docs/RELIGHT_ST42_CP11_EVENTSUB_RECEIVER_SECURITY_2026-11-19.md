# Project Relight · Stage 42 CP11 — EventSub receiver security (inactive)

Checkpoint: 19 November 2026 · America/Mexico_City

## Goal

Receive **new Twitch subscriptions** and **resubscription messages shared in chat**, for KGBlaze personalized acknowledgements. Do not create a viewer registry or bulk-read private subscribers. Keep YouTube channel memberships and future Ko-fi/other recurring memberships as separate providers.

This CP11 commit is an **offline verification core**, not a deployed webhook. Twitch is authorized as owner (CP08) but **no EventSub subscriptions have been registered**, no callback path has been mounted, and no public names or new membership statuses are served.

## Official Twitch protocol

- Callback HTTPS on port 443, challenge message requires raw challenge as text/plain with Content-Length; webhook POST receives three types: webhook_callback_verification, notification, revocation.
- Authenticate HMAC-SHA256 of **ID + timestamp + exact raw body bytes** using a dedicated EventSub secret (ASCII 10–100 characters). Verify using constant-time comparison before JSON parsing, no secret values in GitHub, browsers or logs.
- Check a recent, non-future timestamp, correct message headers, subscriber/broadcaster ID, EventSub subscription type/version and **exact configured callback URL**.
- Twitch notifications are at-least-once; **claim the message ID atomically in D1 with UNIQUE/PRIMARY KEY** before acknowledging its content. A per-isolate Set or the 10-minute timestamp alone does not prevent replay across Cloudflare instances.
- Webhook registration uses an **App Access Token for the same Client ID**, after owner has authorized channel:read:subscriptions. The owner user access token by itself must NOT be used to register a webhook.
- Revocation cannot be treated as a supporter acknowledgement; it requires administrative review of EventSub registration.

Official references:
- https://dev.twitch.tv/docs/eventsub/handling-webhook-events/
- https://dev.twitch.tv/docs/eventsub/manage-subscriptions/
- https://dev.twitch.tv/docs/eventsub/reference/channel

## Implemented now

src/recognition-twitch-eventsub-webhook.mjs exports a fail-closed function requiring a **Request object**, separate secret, expected HTTPS callback URL, broadcaster ID and an injected **durable atomic** claimMessageId callback. It validates HMAC before parsing JSON, checks timestamp and maximum body size, validates the event source and type, then calls the previously reviewed unmounted CP09 normalizer.

This module has **no runtime import**, production route, registration action, D1 connection, background cron, token refresh, additional Twitch permissions, Home UI or database migration. It does not give any untrusted browser an ability to specify verifiedEvent=true. No raw Twitch message bodies are returned.

Tests cover valid/invalid signatures, mutation of JSON raw bytes, old/future timestamps, duplicated message IDs, unavailable claims, challenges, revocations, wrong broadcaster and callback, wrong subscription types, gifts, shared renewals and malformed/oversized payloads.

## Pending gates before a live EventSub receiver

1. Design and review a narrowly scoped D1 migration for atomic replay IDs and optional **short-lived** event entries; separately obtain a current D1 recovery bookmark and apply the migration with the owner's production authorization.
2. Choose an exact HTTPS callback URL separate from historical /twitch/oauth/callback. Mount only the POST EventSub route in portal-route.mjs and worker.mjs behind a feature flag that is OFF until a production secret, D1 schema and callback are ready.
3. Generate and configure a **separate Cloudflare encrypted secret**, e.g. TWITCH_EVENTSUB_SECRET; do not reuse OAuth Client Secret, ADMIN_TOKEN, encryption key or access token.
4. Wire the signature-verified handler to a D1 transaction that claims IDs exactly once, verifies challenge, safely acknowledges notification, and allows administrative moderation/deletion of public acknowledgements. Never return a full subscriber directory. Set retention and cleanup, and verify that an interrupted write cannot lose an event silently.
5. Register precisely channel.subscribe and channel.subscription.message (v1) with Twitch EventSub using an **app token** obtained securely for the **existing app** and confirmed webhook callback. Do not register unrequested scopes/events; check registration and revocation status.
6. Connect visible Home presentation only after QA and accessibility/i18n ES/EN/JP reviews. Preserve the *Miembros de YouTube · Suscriptores de Twitch · Apoyos recurrentes* categories (CP10) and the separation between public acknowledgements and private eligibility/benefits.

This CP11 checkpoint does not grant consent to display a permanent roster: notifications publicly shared on Twitch may support **time-limited** acknowledgement, while private eligibility for other benefits remains independently verified.

# Project Relight — Stage 42, CP06 · Twitch OAuth diagnostics (safe)

**Context:** Owner attempted the first actual OAuth after CP05; browser callback showed `No se completó la autorización privada de Twitch. Vuelve al panel de administración.`. The generic message deliberately hid all reasons, so **the underlying failure is still unknown**. Do not attribute it to owner ID, secret, provider or D1 without evidence.

## Changes
- Twitch helper distinguishes **safe categorical** failures: token exchange rejected; malformed token response; token validation rejected; client mismatch; owner mismatch; missing required scope; short token lifetime; provider network/unavailable.
- The callback still requires exactly one state, prevents state replay, uses the current encrypted D1 store and never echoes OAuth code, CSRF state, Twitch provider response, token, client secret or account ID.
- Error page adds **only** a static incident code `TW-01`…`TW-15` / `TW-99`, preserves `Cache-Control: no-store`, `Referrer-Policy: no-referrer` and original security headers.
- This is NOT a new public recognition page, subscriber API, owner validation shortcut, or permission grant. Actual account authorization is still performed by the owner.

## Incident codes
| Code | Meaning (no provider data) |
|---|---|
| TW-01 | OAuth state invalid/expired/reused (10-minute limit) |
| TW-02 | Authorization denied by owner/provider |
| TW-03 | Twitch rejected the code-to-token exchange (could include app secret/expired code) |
| TW-04 | Twitch returned a token response not meeting requirements |
| TW-05 | Token validation request to Twitch rejected |
| TW-06 | Token belongs to different Twitch client ID |
| TW-07 | Token was authorized for different Twitch broadcaster ID |
| TW-08 | Required `channel:read:subscriptions` scope missing |
| TW-09 | Provider reported too-short token lifetime |
| TW-10 | Twitch request/network exception |
| TW-11 | Secure D1 token-processing failure after reaching provider |
| TW-12 | D1 storage unavailable / final write failed |
| TW-13 | Configured AES-GCM key missing or invalid |
| TW-14 | OAuth disabled or app configuration missing |
| TW-15 | Provider expiration overflow/invalid |
| TW-99 | Unknown category; do not emit raw exception |

## Verification
Unit tests: invalid/reused state code, denied access, wrong owner code, failed provider token exchange code and non-disclosure of confidential values. Existing SQLite and Terminal regressions must pass. The live anonymous smoke continues checking the unauthenticated callback and admin-route protections.

**Do not request the user to paste the callback URL.** It contains a one-time state and authorization code. Report only the short TW-XX code. If the first attempt was consumed/invalid, a fresh admin-only `POST /departures/api/admin/recognition/twitch/start` is required. No password or admin token should be sent in chat.

Operational follow-up: do not claim Twitch is connected until private `/departures/api/admin/recognition/twitch/status` reports `connected:true`. No member enumeration/recognition until separate consent work.

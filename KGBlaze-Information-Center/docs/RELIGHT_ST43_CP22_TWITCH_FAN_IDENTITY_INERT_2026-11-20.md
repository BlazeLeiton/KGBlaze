> **RECTIFICACIÓN VINCULANTE — ST43 CP24, 20-nov-2026:** La preparación de OAuth y registro de visitantes fue **un desvío no solicitado** respecto a las decisiones explícitas de Stages 41 y 42. El código, rutas, bandera y migración propuesta han sido retirados de `main` mediante CP24 (no se aplicó la migración). **NO registrar el callback de visitantes, NO activar OAuth de fans y NO pedir a usuarios ningún login.** Este documento se conserva solo como historial de auditoría.

# Project Relight — Stage 43 CP22: Twitch subscriber self-verification, staged OFF

**Local date:** 20 Nov 2026, America/Mexico_City.
**Provenance:** Stage 43 CP21/PR #218 + real owner test: `provider_total_below_observed / first_page / still_below / all_confirmed`. A small user_id-filtered sample verified active; **not** an enumerated roster. This work does not bypass the existing fail-closed global cache.

## Scope

Implement a **separate voluntary Twitch visitor login**, consent registry and per-user on-demand active-status check, but keep the feature inactive until the owner reviews its dedicated callback URL, applies the isolated D1 migration with a recovery point, and approves the consent copy and UI.

- `src/recognition-twitch-fan.mjs`: owner-independent Twitch visitor login via Authorization Code with **openid only**. The returned access token is validated against `id.twitch.tv/oauth2/validate` to obtain a server-verified numeric user ID and check same client ID. Visitor access/refresh tokens are **never stored**.
- One-time random OAuth state: server saves only SHA-256; `__Host-` secure HttpOnly SameSite=Lax browser cookie binds the callback to the initiating browser; D1 consumes state atomically **before token exchange**, limiting login injection/replay.
- A separate random 24-hour session cookie uses SHA-256 hash only in D1 and contains **no user ID**. A per-session unpredictable CSRF value is provided solely by same-origin `GET /me`. Consent/verify/logout require POST, same-origin and CSRF.
- Explicit `POST /consent {verify:true}` is necessary to start any targeted verification. Sign-in alone does **not** imply this permission. `{verify:false}` deletes opt-in and status immediately. In-flight checks must match a random consent generation nonce before committing; withdrawal cannot be undone by delayed callbacks.
- `POST /verify` uses existing encrypted broadcaster OAuth on the server and a single `user_id` filter for the account ID authenticated in the visitor session. Provider errors result in **unknown**, never zero/inactive; successful filtered positives or absences produce fresh active/inactive state. These labels are shown only in that authenticated user's response.
- No automatic global sync or Cron. No public roster, names/aliases, badges, count, subscription tiers, gifts, or supporter ranking.
- No login link on public Home yet. These routes are **404 while `RECOGNITION_TWITCH_FAN_ENABLED='false'`**.

## Exact staged endpoints (only canonical portal and callback)
- `POST https://kgblaze.dpdns.org/departures/api/recognition/twitch/start` — browser top-level form POST, 303 redirect to Twitch, requires exact same-origin `Origin`; no manual tokens.
- `GET https://kgblaze.dpdns.org/twitch/member/callback` — separate from existing **owner callback** at `/twitch/oauth/callback`. Required registration in the existing **KGBlaze Integrated Services** app, NOT a second Twitch app.
- `GET https://kgblaze.dpdns.org/departures/api/recognition/twitch/me` — authenticated status and CSRF, no user ID/alias; no-store.
- `POST https://kgblaze.dpdns.org/departures/api/recognition/twitch/consent` with body `{"verify":true|false}`.
- `POST https://kgblaze.dpdns.org/departures/api/recognition/twitch/verify` — on-demand targeted current status, no provider roster.
- `POST https://kgblaze.dpdns.org/departures/api/recognition/twitch/logout` — session deletion.
- Unprefixed root aliases `/api/recognition/...` are **404**, unsafe verbs are **405**, and no CORS is enabled.

## Owner-dependent gates — DO NOT do yet
1. Confirm the proposed public-facing login/consent wording and whether to open member verification UI. No publication opt-in has been provided, and authentication does not grant that permission.
2. Add exact redirect `https://kgblaze.dpdns.org/twitch/member/callback` alongside, **not replacing**, owner callback in the existing Twitch developer application. Verify client confidentiality and unchanged permissions.
3. Take D1 Time Travel recovery bookmark. Review/apply `migrations/recognition_twitch_fan_optins.sql` to production **manually**. The fan tables each FK to existing encrypted owner OAuth credentials and cascade on disconnect; this migration touches no Terminal state.
4. Add plain variable `TWITCH_FAN_REDIRECT_URI` with the exact callback and independently switch `RECOGNITION_TWITCH_FAN_ENABLED='true'` ONLY after tests and owner review. No new OAuth client secret; existing Twitch app credentials remain untouched.
5. Test a voluntary login with a real browser and *separate account* using minimal user ID scope, session cookie, explicit verification consent, same-origin CSRF, withdrawal, and logout. Do not share tokens, OAuth callback URLs containing `code`/`state`, private user IDs, names or raw Twitch JSON.

## Sources
- https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/
- https://dev.twitch.tv/docs/authentication/validate-tokens/
- https://dev.twitch.tv/docs/api/reference/subscriptions
- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/

## QA and exclusions
- Node SQLite tests execute actual draft migration with FK and owner credential fixture, including atomic single-use state, invalid cookie/origin/CSRF, explicit consent, targeted status, error-as-unknown, withdrawal race, logout, cascade and disabled route 404. Headless Chrome tests for existing Terminal still required.
- Existing broadcaster OAuth, D1 active-roster replacement, EventSub, scheduled YouTube sync, Home and Rebel Mix remain unchanged.
- This CP22 deployment publishes **only inert code and a false flag**. It is not permission to activate Twitch member login, enable a visitor registry or publish private supporter names.

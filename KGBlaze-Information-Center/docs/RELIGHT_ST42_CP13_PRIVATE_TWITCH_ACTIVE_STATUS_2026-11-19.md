# Project Relight — Stage 42 CP13: Private Twitch subscription status

Date: 2026-11-19, America/Mexico_City.

## Intent and completed work

The broadcaster wants **a status which remains active while a Twitch subscription is valid**, not a transient only-on-event thank-you. The existing owner OAuth in D1 was successfully authorized (CP08). Twitch Helix Get Broadcaster Subscriptions is the source of truth; EventSub remains optional for rapid announcements. No additional OAuth scopes, Twitch app registration, or EventSub secret are required for a **private status query**.

CP13 implements the first actual authenticated integration, **admin-only, read-only, on-demand**, without a new D1 table:

- `GET /departures/api/admin/recognition/twitch/subscription-summary`: reads the complete paginated broadcaster subscription snapshot using the existing encrypted owner token. Returns only `providerTotal`, `observedActiveRows`, number of pages, `complete:true` and timestamp; **no names, Twitch user IDs, tiers, gift recipients or tokens**. A cursor may exist on an empty last page; the adapter checks until the cursor disappears, with a safe page limit. A truncated/failed/inconsistent snapshot never implies an inactive member.
- `POST /departures/api/admin/recognition/twitch/check-subscribers`: privately verifies **1–100 explicitly supplied numeric user IDs** without enumerating all subscribers. The response contains only `userId` and `active` boolean (plus read-only metadata); no names or subscription billing details.
- Both routes require the existing Bearer `ADMIN_TOKEN` and an additional header `X-Relight-Recognition-Confirm: read-subscription-status`. Only the canonical `/departures/` routes exist; root `/api/admin/*` remains blocked.
- `RECOGNITION_TWITCH_STATUS_ENABLED = "true"` controls these **private manual reads**, independently of the existing owner OAuth feature flag. There is no Cron, public list, Home integration, persisted subscriber dataset, or arbitrary Twitch API proxy.
- Access tokens are decrypted **only within the Worker** from existing AES-GCM D1 fields. For an expired token or a Helix 401, the existing serialized refresh workflow rotates encrypted credentials and retries once. Rate limits or failures are reported as unknown, never zero members.
- The pure verifier requires owner/client identity, validates numeric user IDs, distinct rows, tiers and gift status, and uses Cloudflare-compatible `redirect:'manual'`; never follows a provider redirect.
- The feature is authenticated, read-only for subscriber data, and only invoked by the broadcaster using the private endpoints.

Official references:
- https://dev.twitch.tv/docs/api/reference/subscriptions
- https://dev.twitch.tv/docs/authentication/refresh-tokens

## Private production validation requiring owner

An assistant without the `ADMIN_TOKEN` cannot and must not query the private roster or obtain credentials. The owner can run this **safe, counts-only** PowerShell command locally after merge and Cloudflare Workers Builds success. Do not paste the ADMIN_TOKEN or complete response containing private data into chat; share only `ok`, `complete`, numeric counts and any sanitized reason.

```powershell
$secure = Read-Host "ADMIN_TOKEN" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $result = Invoke-RestMethod -Uri "https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/subscription-summary" -Method Get -Headers @{
    Authorization = "Bearer $token"
    "X-Relight-Recognition-Confirm" = "read-subscription-status"
  } -ErrorAction Stop
  [pscustomobject]@{Ok=$result.ok; Complete=$result.complete; SubscriberTotal=$result.providerTotal; Pages=$result.pages}
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  Remove-Variable token,secure -ErrorAction SilentlyContinue
}
```

**No data has yet been requested from Twitch in production by this checkpoint.** Successful CI and public smoke prove routing/auth isolation and simulated Helix scenarios, not a successful live private Helix read.

## Next phase

For the actual ongoing badge on the website, design a minimal persistent **status cache with TTL**, safe refresh budget, data deletion, rate-limited non-enumerable public projection, and separate identity/authentication policy. The user's current status cannot be established from a self-asserted Twitch ID in the browser. A full identity roster must not be published simply because the owner OAuth can access it. YouTube creator Members API requires separate access; Ko-fi/other recurring memberships remain future providers.

The CP13 code introduces no D1 migration, new secret, new registration, public alias, entitlement, or subscriber publication.

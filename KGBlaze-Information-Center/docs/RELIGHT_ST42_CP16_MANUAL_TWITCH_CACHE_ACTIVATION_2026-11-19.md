# Project Relight — Stage 42 CP16: manual active Twitch status synchronization

Date: 2026-11-19 America/Mexico_City (post-midnight UTC).

## Owner-verified D1 migration

The owner presented a Cloudflare D1 Console screenshot for the production database **kgblaze-terminal**, confirming the successful execution of both isolated CREATE TABLE statements from CP15 and a SELECT from sqlite_master showing exactly:
- recognition_twitch_active_status_meta
- recognition_twitch_active_subscribers

The screenshot additionally shows the intended ON DELETE CASCADE foreign-key clauses. It does **not** confirm whether a D1 Time Travel recovery bookmark was recorded, and does not report cache contents or any subscriber identity.

## CP16 change

Activate **only manual private synchronization**, under existing ADMIN_TOKEN and the exact header `X-Relight-Recognition-Confirm: sync-private-subscriber-cache`:

- `RECOGNITION_TWITCH_CACHE_ENABLED = "true"` in Wrangler [vars].
- Existing route: `POST https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/sync-status-cache`. It returns only `ok`, `refreshed`, `activeTotal`, `snapshotVersion`, `lastCompletedAt` or an innocuous failure reason.
- It reads the official private broadcaster roster using encrypted owner OAuth in D1. It never returns names/IDs in HTTP response, does not publish the roster, and does not run automatically.
- A full validated provider snapshot is required before any D1 replacement. A failed/rate-limited provider request retains the previous cache.
- **New concurrency protection:** a monotonic update guard is enforced inside the D1 batch by setting `last_completed_at_ms` to `-1` for stale or same-time concurrent writes, intentionally triggering the existing CHECK constraint. The entire transaction rolls back (including child row deletion) rather than permitting a delayed Worker to overwrite a newer snapshot. The version is incremented in SQLite, not computed from a stale pre-read; read back and verify post-commit metadata.
- Existing D1 foreign-key cascades remove member rows when the owner OAuth credentials are disconnected.
- No new D1 migration, EventSub, cron, YouTube credential, public roster, badges, per-visitor ID association or Home change.

## Verification

Offline SQLite test separately confirmed:
1. The D1-equivalent CAS update rejects a stale timestamp and preserves existing subscriber rows.
2. A newer timestamp updates the cache and increments snapshot version.
3. Deleting the owner OAuth credential cascades removal of cache metadata and subscriber rows.

Full repository CI and production smoke should pass before the owner initiates the private first sync. Test production from outside with unauthenticated POST returning HTTP 401 and root alias returning 404.

## Owner's one-time manual sync (after deploy)

Run this **locally in PowerShell**, never share the ADMIN_TOKEN:

```powershell
$secure = Read-Host "ADMIN_TOKEN" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $result = Invoke-RestMethod `
    -Uri "https://kgblaze.dpdns.org/departures/api/admin/recognition/twitch/sync-status-cache" `
    -Method Post `
    -Headers @{
      Authorization = "Bearer $token"
      "X-Relight-Recognition-Confirm" = "sync-private-subscriber-cache"
    } -ErrorAction Stop
  [pscustomobject]@{
    Ok = $result.ok
    Refreshed = $result.refreshed
    ActiveTotal = $result.activeTotal
    SnapshotVersion = $result.snapshotVersion
  }
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  Remove-Variable token,secure -ErrorAction SilentlyContinue
}
```

If it returns `ok=true`, `refreshed=true`, `snapshotVersion>=1`, the first private cache was written. If `refreshed=false`, a previous successful snapshot was within 30 minutes; it is not proof that a new provider request occurred.

No need to share subscriber names, OAuth URLs, raw tokens, or underlying SQL row data. If error, share only the static reason (not stack traces/secrets).

## Following phases (not active)

Review D1 Time Travel, cache freshness / 30-minute periodic sync and failure monitoring, private deletion/visibility moderation, and identity link or approved public acknowledgement logic before putting a persistent badge on the public site. Keep YouTube Members API separate and future Ko-fi subscriptions reserved.

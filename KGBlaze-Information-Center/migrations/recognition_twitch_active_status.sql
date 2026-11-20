-- Stage 42 CP15 — PRIVATE Twitch active subscription status cache.
-- NOT APPLIED BY THIS PR. Existing production D1 remains unchanged.
-- Two isolated tables, linked to encrypted owner OAuth for safe cleanup.
-- D1 enables/enforces foreign keys by default (Cloudflare docs).
-- OAuth disconnect DELETE cascades meta then ALL cached identities.

CREATE TABLE IF NOT EXISTS recognition_twitch_active_status_meta (
  slot INTEGER PRIMARY KEY NOT NULL CHECK(slot = 1)
    REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
  last_completed_at_ms INTEGER NOT NULL CHECK(last_completed_at_ms > 0),
  active_total INTEGER NOT NULL CHECK(active_total >= 0),
  snapshot_version INTEGER NOT NULL CHECK(snapshot_version >= 1)
);

CREATE TABLE IF NOT EXISTS recognition_twitch_active_subscribers (
  twitch_user_id TEXT PRIMARY KEY NOT NULL
    CHECK(length(twitch_user_id) BETWEEN 1 AND 24),
  cache_slot INTEGER NOT NULL DEFAULT 1 CHECK(cache_slot = 1)
    REFERENCES recognition_twitch_active_status_meta(slot) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 48),
  observed_at_ms INTEGER NOT NULL CHECK(observed_at_ms > 0)
);

-- No writes to terminal_state, terminal_audit, OAuth tokens or other data.
-- Private verified full snapshots swap atomically inside Worker D1.batch().
-- Check PR CI and production D1 backup before applying this file manually.

-- Stage 42 CP15 — private Twitch active subscription status cache.
-- NOT APPLIED BY THIS PR. Existing production D1 remains unchanged.
-- Must be reviewed, backed up, and applied by the owner first.
-- No changes to terminal_state, terminal_audit, or OAuth tables.

CREATE TABLE IF NOT EXISTS recognition_twitch_active_subscribers (
  twitch_user_id TEXT PRIMARY KEY NOT NULL
    CHECK(length(twitch_user_id) BETWEEN 1 AND 24),
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 48),
  observed_at_ms INTEGER NOT NULL CHECK(observed_at_ms > 0)
);

CREATE TABLE IF NOT EXISTS recognition_twitch_active_status_meta (
  slot INTEGER PRIMARY KEY NOT NULL CHECK(slot = 1),
  last_completed_at_ms INTEGER NOT NULL CHECK(last_completed_at_ms > 0),
  active_total INTEGER NOT NULL CHECK(active_total >= 0),
  snapshot_version INTEGER NOT NULL CHECK(snapshot_version >= 1)
);

-- No full roster, public view, public indexes, or automated cron created.
-- The server will atomically replace the current private active set ONLY
-- after a complete, provider-verified roster snapshot succeeds.

-- Project Relight · Stage 43 CP22 — NEVER auto-migrate production.
-- Separate voluntary Twitch member sign-in from owner OAuth and Terminal D1.
-- All three tables cascade on OWNER OAuth disconnect, which erases associated
-- visitor identity, login/session state and consent/verification records.
-- Apply only after a D1 recovery point and owner approval of consent copy.

CREATE TABLE IF NOT EXISTS recognition_twitch_fan_oauth_states (
 state_hash TEXT PRIMARY KEY NOT NULL CHECK(length(state_hash)=64),
 owner_slot INTEGER NOT NULL DEFAULT 1 CHECK(owner_slot=1)
  REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
 issued_at_ms INTEGER NOT NULL CHECK(issued_at_ms>0),
 expires_at_ms INTEGER NOT NULL CHECK(expires_at_ms>issued_at_ms),
 consumed_at_ms INTEGER CHECK(consumed_at_ms IS NULL OR consumed_at_ms>=issued_at_ms)
);

CREATE TABLE IF NOT EXISTS recognition_twitch_fan_sessions (
 session_hash TEXT PRIMARY KEY NOT NULL CHECK(length(session_hash)=64),
 owner_slot INTEGER NOT NULL DEFAULT 1 CHECK(owner_slot=1)
  REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
 twitch_user_id TEXT NOT NULL CHECK(length(twitch_user_id) BETWEEN 1 AND 24
  AND twitch_user_id NOT GLOB '*[^0-9]*'),
 csrf_salt TEXT NOT NULL CHECK(length(csrf_salt)=64),
 issued_at_ms INTEGER NOT NULL CHECK(issued_at_ms>0),
 expires_at_ms INTEGER NOT NULL CHECK(expires_at_ms>issued_at_ms)
);
CREATE INDEX IF NOT EXISTS idx_twitch_fan_sessions_expiry
 ON recognition_twitch_fan_sessions(expires_at_ms);

CREATE TABLE IF NOT EXISTS recognition_twitch_fan_consents (
 twitch_user_id TEXT PRIMARY KEY NOT NULL CHECK(length(twitch_user_id) BETWEEN 1 AND 24
  AND twitch_user_id NOT GLOB '*[^0-9]*'),
 owner_slot INTEGER NOT NULL DEFAULT 1 CHECK(owner_slot=1)
  REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
 consent_nonce TEXT NOT NULL CHECK(length(consent_nonce)=64),
 consented_at_ms INTEGER NOT NULL CHECK(consented_at_ms>0),
 last_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK(last_status IN ('unknown','active','inactive')),
 last_checked_at_ms INTEGER CHECK(last_checked_at_ms IS NULL OR last_checked_at_ms>0)
);

-- No subscriber names, fan OAuth tokens, tiers, gifter IDs, emails, URLs,
-- payment records, public-facing aliases, or automatically published members.
-- No changes to recognition_twitch_active_subscribers or Terminal editorial.

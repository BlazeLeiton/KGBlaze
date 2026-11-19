-- Project Relight Stage 42 CP02 — review before applying remotely.
-- Intentionally separate from terminal_state and recognition_optins.
-- Do not apply by an automatic deploy. No token or user IDs pre-populated.

CREATE TABLE IF NOT EXISTS recognition_twitch_oauth_states (
 slot INTEGER PRIMARY KEY CHECK(slot = 1),
 state_hash TEXT NOT NULL CHECK(length(state_hash)=64),
 issued_at_ms INTEGER NOT NULL CHECK(issued_at_ms >= 0),
 expires_at_ms INTEGER NOT NULL CHECK(expires_at_ms > issued_at_ms),
 consumed_at_ms INTEGER CHECK(consumed_at_ms IS NULL OR consumed_at_ms >= issued_at_ms)
);

CREATE TABLE IF NOT EXISTS recognition_twitch_oauth_credentials (
 slot INTEGER PRIMARY KEY CHECK(slot = 1),
 owner_id TEXT NOT NULL CHECK(length(owner_id) BETWEEN 1 AND 24),
 access_ciphertext TEXT NOT NULL CHECK(length(access_ciphertext) > 20),
 access_nonce TEXT NOT NULL CHECK(length(access_nonce) = 16),
 refresh_ciphertext TEXT NOT NULL CHECK(length(refresh_ciphertext) > 20),
 refresh_nonce TEXT NOT NULL CHECK(length(refresh_nonce) = 16),
 expires_at_ms INTEGER NOT NULL CHECK(expires_at_ms > 0),
 updated_at_ms INTEGER NOT NULL CHECK(updated_at_ms > 0)
);

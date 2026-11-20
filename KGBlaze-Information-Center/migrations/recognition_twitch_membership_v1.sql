-- Project Relight / Stage 43 CP26: scalable owner-read Twitch recognition.
-- DO NOT AUTO-APPLY. Use D1 Time Travel bookmark before owner-approved migration.
-- This supersedes the unapplied CP25 two-consent migration.
CREATE TABLE IF NOT EXISTS recognition_twitch_membership_meta (
 slot INTEGER PRIMARY KEY NOT NULL CHECK(slot=1)
   REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
 version INTEGER NOT NULL DEFAULT 0 CHECK(version>=0),
 last_success_at_ms INTEGER CHECK(last_success_at_ms IS NULL OR last_success_at_ms>0),
 refresh_lock_until_ms INTEGER CHECK(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms>0),
 last_scan_partial INTEGER NOT NULL DEFAULT 1 CHECK(last_scan_partial IN (0,1))
);
CREATE TABLE IF NOT EXISTS recognition_twitch_memberships (
 twitch_user_id TEXT PRIMARY KEY NOT NULL CHECK(
  length(twitch_user_id) BETWEEN 1 AND 24
  AND twitch_user_id NOT GLOB '*[^0-9]*'),
 membership_slot INTEGER NOT NULL DEFAULT 1 CHECK(membership_slot=1)
  REFERENCES recognition_twitch_membership_meta(slot) ON DELETE CASCADE,
 login TEXT NOT NULL CHECK(length(login) BETWEEN 2 AND 25),
 display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 48),
 consent_state TEXT NOT NULL DEFAULT 'unasked'
  CHECK(consent_state IN ('unasked','approved','declined')),
 consent_source TEXT NOT NULL DEFAULT 'none'
  CHECK(consent_source IN ('none','owner_attested','verified_chat')),
 consent_at_ms INTEGER CHECK(consent_at_ms IS NULL OR consent_at_ms>0),
 active INTEGER NOT NULL CHECK(active IN (0,1)),
 last_checked_at_ms INTEGER NOT NULL CHECK(last_checked_at_ms>0),
 first_seen_at_ms INTEGER NOT NULL CHECK(first_seen_at_ms>0),
 last_seen_at_ms INTEGER NOT NULL CHECK(last_seen_at_ms>0)
);
CREATE INDEX IF NOT EXISTS idx_recognition_twitch_memberships_visible
 ON recognition_twitch_memberships(active,consent_state,last_checked_at_ms);
CREATE INDEX IF NOT EXISTS idx_recognition_twitch_memberships_login
 ON recognition_twitch_memberships(login COLLATE NOCASE);
-- All identities remain private in D1. The public API may expose display_name
-- only when verified active plus consent (or an explicit short-lived owner
-- simulation flag). No raw token, gifting details, chat text, payment or tiers.
-- No changes to terminal_state, existing Twitch active-roster cache, or OAuth.

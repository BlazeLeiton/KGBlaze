-- Project Relight · Stage 43 CP31 — YouTube memberships (separate from Twitch).
-- DO NOT APPLY before channel-level API allowlisting, secure OAuth owner vault,
-- D1 backup / Time Travel bookmark, and explicit activation review.
-- No public trial for YouTube; users must consent independently.
CREATE TABLE IF NOT EXISTS recognition_youtube_membership_meta (
 slot INTEGER PRIMARY KEY NOT NULL CHECK(slot=1),
 version INTEGER NOT NULL DEFAULT 0 CHECK(version>=0),
 last_success_at_ms INTEGER CHECK(last_success_at_ms IS NULL OR last_success_at_ms>0),
 refresh_lock_until_ms INTEGER CHECK(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms>0)
);
CREATE TABLE IF NOT EXISTS recognition_youtube_memberships (
 youtube_channel_id TEXT PRIMARY KEY NOT NULL CHECK(
  length(youtube_channel_id)=24 AND youtube_channel_id LIKE 'UC%'),
 display_name TEXT CHECK(display_name IS NULL OR length(display_name) BETWEEN 1 AND 48),
 level_id TEXT NOT NULL CHECK(length(level_id) BETWEEN 4 AND 128),
 consent_state TEXT NOT NULL DEFAULT 'unasked'
  CHECK(consent_state IN ('unasked','approved','declined')),
 consent_source TEXT NOT NULL DEFAULT 'none'
  CHECK(consent_source IN ('none','owner_attested')),
 consent_at_ms INTEGER CHECK(consent_at_ms IS NULL OR consent_at_ms>0),
 active INTEGER NOT NULL CHECK(active IN (0,1)),
 last_checked_at_ms INTEGER NOT NULL CHECK(last_checked_at_ms>0),
 first_seen_at_ms INTEGER NOT NULL CHECK(first_seen_at_ms>0)
);
CREATE INDEX IF NOT EXISTS idx_recognition_youtube_memberships_visible
 ON recognition_youtube_memberships(active,consent_state,last_checked_at_ms);
-- The new schema contains NO Google OAuth tokens. A future secure, encrypted,
-- creator-owned OAuth vault must be reviewed separately. Never reuse Twitch
-- credentials or overwrite Twitch tables. No automatic migration on deploy.

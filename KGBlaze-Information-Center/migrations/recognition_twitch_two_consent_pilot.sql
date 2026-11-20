-- Project Relight Stage 43 CP25 — two-person consented Twitch pilot.
-- REVIEW + BACKUP BEFORE APPLYING. This file is not auto-run by deploy.
-- No data imported from the private full-roster cache; only two members
-- explicitly attested by the owner are eligible for public recognition.
CREATE TABLE IF NOT EXISTS recognition_twitch_pilot_meta (
 slot INTEGER PRIMARY KEY NOT NULL CHECK(slot=1)
   REFERENCES recognition_twitch_oauth_credentials(slot) ON DELETE CASCADE,
 last_verified_at_ms INTEGER,
 refresh_lock_until_ms INTEGER,
 version INTEGER NOT NULL DEFAULT 0 CHECK(version>=0),
 CHECK(last_verified_at_ms IS NULL OR last_verified_at_ms>0),
 CHECK(refresh_lock_until_ms IS NULL OR refresh_lock_until_ms>0)
);
CREATE TABLE IF NOT EXISTS recognition_twitch_pilot_members (
 twitch_user_id TEXT PRIMARY KEY NOT NULL
   CHECK(length(twitch_user_id) BETWEEN 1 AND 24
     AND twitch_user_id NOT GLOB '*[^0-9]*'),
 pilot_slot INTEGER NOT NULL DEFAULT 1 CHECK(pilot_slot=1)
   REFERENCES recognition_twitch_pilot_meta(slot) ON DELETE CASCADE,
 login TEXT NOT NULL UNIQUE CHECK(length(login) BETWEEN 1 AND 25),
 display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 1 AND 48),
 owner_consent_attested_at_ms INTEGER NOT NULL
   CHECK(owner_consent_attested_at_ms>0),
 active INTEGER NOT NULL CHECK(active IN (0,1)),
 last_verified_at_ms INTEGER NOT NULL CHECK(last_verified_at_ms>0)
);
-- No gifter IDs, tiers, payments, unapproved member IDs/names, chat text,
-- viewer OAuth, or public APIs exposing raw user IDs.

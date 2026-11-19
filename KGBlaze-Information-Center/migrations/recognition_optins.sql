-- Stage 41 CP07 — NOT AUTOMATICALLY APPLIED.
-- Consent-only storage for future recognition console. No populated rows,
-- no API routes; deploy only after explicit review and access controls.
CREATE TABLE IF NOT EXISTS recognition_optins (
 platform TEXT NOT NULL CHECK(platform IN ('twitch','youtube','other')),
 platform_user_id TEXT NOT NULL,
 alias TEXT NOT NULL CHECK(length(alias) BETWEEN 1 AND 48),
 verify_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(verify_opt_in IN (0,1)),
 verify_consent_at TEXT,
 publish_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(publish_opt_in IN (0,1)),
 public_consent_at TEXT,
 publish_approved INTEGER NOT NULL DEFAULT 0 CHECK(publish_approved IN (0,1)),
 visibility INTEGER NOT NULL DEFAULT 0 CHECK(visibility IN (0,1)),
 withdrawn_at TEXT,
 last_verified_at TEXT,
 last_verification_status TEXT NOT NULL DEFAULT 'pending'
   CHECK(last_verification_status IN ('pending','active','inactive','error')),
 last_gifted INTEGER CHECK(last_gifted IN (0,1)),
 sort_order INTEGER NOT NULL DEFAULT 100,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(platform,platform_user_id),
 CHECK(verify_opt_in=0 OR verify_consent_at IS NOT NULL),
 CHECK(publish_opt_in=0 OR public_consent_at IS NOT NULL),
 CHECK(visibility=0 OR (publish_opt_in=1 AND publish_approved=1 AND withdrawn_at IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_recognition_visible
 ON recognition_optins(platform,visibility,sort_order);

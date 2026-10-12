-- Una sola agenda pública; NO guardar respaldo administrativo ni credenciales.
CREATE TABLE IF NOT EXISTS terminal_state (
  id INTEGER PRIMARY KEY CHECK (id=1),
  revision INTEGER NOT NULL DEFAULT 0,
  editorial_json TEXT NOT NULL,
  sync_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS terminal_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  revision INTEGER NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('editor','platform','preview')),
  happened_at TEXT NOT NULL,
  note TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS terminal_preview (
  id INTEGER PRIMARY KEY CHECK(id=1),
  week TEXT NOT NULL,
  mime TEXT NOT NULL CHECK(mime='image/png'),
  payload BLOB NOT NULL,
  updated_at TEXT NOT NULL
);

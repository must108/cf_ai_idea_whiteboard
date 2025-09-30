
CREATE TABLE IF NOT EXISTS summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  text TEXT NOT NULL,
  author TEXT,
  votes INTEGER DEFAULT 0,
  ts INTEGER
);

CREATE INDEX IF NOT EXISTS idx_summaries_room ON summaries(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_room ON notes(room_id, ts DESC);

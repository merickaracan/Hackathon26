CREATE TABLE IF NOT EXISTS users (
  id                   SERIAL PRIMARY KEY,
  name                 TEXT NOT NULL,
  email                TEXT UNIQUE NOT NULL,
  password             TEXT NOT NULL,
  sports               JSONB    DEFAULT '[]',
  availability         TEXT[]   DEFAULT '{}',
  university           TEXT,
  location             TEXT,
  notif_match_request  BOOLEAN  DEFAULT true,
  notif_match_accepted BOOLEAN  DEFAULT true,
  notif_reminder_24h   BOOLEAN  DEFAULT true,
  notif_reminder_2h    BOOLEAN  DEFAULT false,
  notif_new_players    BOOLEAN  DEFAULT false,
  notif_post_expiring  BOOLEAN  DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sport       TEXT NOT NULL,
  format      TEXT NOT NULL,
  datetime    TIMESTAMPTZ NOT NULL,
  location    TEXT NOT NULL,
  description TEXT DEFAULT '',
  score       TEXT DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- If posts table already exists, run: ALTER TABLE posts ADD COLUMN IF NOT EXISTS score TEXT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS requests (
  id         SERIAL PRIMARY KEY,
  from_user  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id    INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  university TEXT,
  location   TEXT,
  sport      TEXT NOT NULL,
  skill      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_prefs (
  user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  match_request  BOOLEAN DEFAULT true,
  match_accepted BOOLEAN DEFAULT true,
  reminder_24h   BOOLEAN DEFAULT true,
  reminder_2h    BOOLEAN DEFAULT false,
  new_players    BOOLEAN DEFAULT false,
  post_expiring  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sport       TEXT NOT NULL,
  format      TEXT NOT NULL,
  datetime    TIMESTAMPTZ NOT NULL,
  location    TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requests (
  id         SERIAL PRIMARY KEY,
  from_user  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id    INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

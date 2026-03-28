const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

db.run('PRAGMA foreign_keys = ON');

// Convert PostgreSQL $1, $2... placeholders to SQLite ?,
// expanding the params array so repeated $1 references each get their own value.
function convertQuery(sql, params = []) {
  const expandedParams = [];
  const converted = sql.replace(/\$(\d+)/g, (_, num) => {
    expandedParams.push(params[parseInt(num, 10) - 1]);
    return '?';
  });
  return { sql: converted, params: expandedParams };
}

const dbRun = (sql, params = []) => {
  const { sql: converted, params: expanded } = convertQuery(sql, params);
  return new Promise((resolve, reject) => {
    db.run(converted, expanded, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql, params = []) => {
  const { sql: converted, params: expanded } = convertQuery(sql, params);
  return new Promise((resolve, reject) => {
    db.all(converted, expanded, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Return { rows: [...] } to match pg's API contract used by existing routes
const dbQuery = async (sql, params = []) => {
  const trimmed = String(sql || '').trim();
  const isReadQuery = /^(SELECT|PRAGMA|WITH)\b/i.test(trimmed);

  // RETURNING makes SQLite emit rows just like a SELECT
  if (isReadQuery || /RETURNING/i.test(trimmed)) {
    const rows = await dbAll(sql, params);
    return { rows };
  }

  await dbRun(sql, params);
  return { rows: [] };
};

async function setupDatabase() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        email      TEXT UNIQUE NOT NULL,
        password   TEXT NOT NULL,
        sports     TEXT DEFAULT '[]',
        availability TEXT DEFAULT '[]',
        university TEXT,
        location   TEXT,
        notif_match_request  INTEGER DEFAULT 1,
        notif_match_accepted INTEGER DEFAULT 1,
        notif_reminder_24h   INTEGER DEFAULT 1,
        notif_reminder_2h    INTEGER DEFAULT 0,
        notif_new_players    INTEGER DEFAULT 0,
        notif_post_expiring  INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ users table ready');

    await dbRun(`
      CREATE TABLE IF NOT EXISTS posts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sport       TEXT NOT NULL,
        format      TEXT NOT NULL,
        datetime    DATETIME NOT NULL,
        location    TEXT NOT NULL,
        description TEXT DEFAULT '',
        score       TEXT DEFAULT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ posts table ready');

    await dbRun(`
      CREATE TABLE IF NOT EXISTS requests (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user  INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id    INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        status     TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user, to_user, post_id)
      )
    `);
    console.log('✅ requests table ready');

    await dbRun(`
      CREATE TABLE IF NOT EXISTS friendships (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user  INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status     TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user, to_user)
      )
    `);
    console.log('✅ friendships table ready');

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    throw err;
  }
}

setupDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = { query: dbQuery };

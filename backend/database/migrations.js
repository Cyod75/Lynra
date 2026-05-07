function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#7c3aed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      favicon TEXT,
      collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      visits INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id INTEGER REFERENCES bookmarks(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (bookmark_id, tag_id)
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
      title, description, url,
      content=bookmarks,
      content_rowid=id
    );

    CREATE TRIGGER IF NOT EXISTS bookmarks_fts_insert AFTER INSERT ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(rowid, title, description, url)
      VALUES (new.id, new.title, new.description, new.url);
    END;

    CREATE TRIGGER IF NOT EXISTS bookmarks_fts_update AFTER UPDATE ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description, url)
      VALUES ('delete', old.id, old.title, old.description, old.url);
      INSERT INTO bookmarks_fts(rowid, title, description, url)
      VALUES (new.id, new.title, new.description, new.url);
    END;

    CREATE TRIGGER IF NOT EXISTS bookmarks_fts_delete AFTER DELETE ON bookmarks BEGIN
      INSERT INTO bookmarks_fts(bookmarks_fts, rowid, title, description, url)
      VALUES ('delete', old.id, old.title, old.description, old.url);
    END;
  `);

  // Ensure existing tables are updated with user_id
  const tablesToUpdate = ['collections', 'bookmarks', 'tags'];
  for (const table of tablesToUpdate) {
    try {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`).run();
      console.log(`[DB] Added user_id to ${table}`);
      // Assign existing records to the first user if any exists
      const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
      if (firstUser) {
        db.prepare(`UPDATE ${table} SET user_id = ? WHERE user_id IS NULL`).run(firstUser.id);
      }
    } catch (err) {
      // Column probably already exists or table is new
    }
  }

  console.log('[DB] Migrations applied successfully.');
}

module.exports = { runMigrations };

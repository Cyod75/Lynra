const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { scrapeMetadata } = require('../services/metadataScraper');

// Helper: get tags for a bookmark
function getTagsForBookmark(db, bookmarkId) {
  return db
    .prepare(
      `SELECT t.id, t.name FROM tags t
       JOIN bookmark_tags bt ON bt.tag_id = t.id
       WHERE bt.bookmark_id = ?`
    )
    .all(bookmarkId);
}

// Helper: upsert tag and return id
function upsertTag(db, name, userId) {
  const existing = db.prepare('SELECT id FROM tags WHERE name = ? AND user_id = ?').get(name, userId);
  if (existing) return existing.id;
  const result = db.prepare('INSERT INTO tags (user_id, name) VALUES (?, ?)').run(userId, name);
  return result.lastInsertRowid;
}

// Helper: set tags for a bookmark
function setTagsForBookmark(db, bookmarkId, tagNames, userId) {
  db.prepare('DELETE FROM bookmark_tags WHERE bookmark_id = ?').run(bookmarkId);
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const tagId = upsertTag(db, trimmed, userId);
    db.prepare(
      'INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)'
    ).run(bookmarkId, tagId);
  }
}

// GET /api/v1/bookmarks
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { q, collection_id, tag, favorites } = req.query;

    let bookmarks = [];

    if (q && q.trim()) {
      const ftsQuery = `${q.trim().replace(/"/g, '')}*`;
      const ftsRows = db
        .prepare(
          `SELECT b.*, c.name as collection_name, c.color as collection_color
           FROM bookmarks b
           LEFT JOIN collections c ON c.id = b.collection_id
           WHERE b.user_id = ? AND b.id IN (
             SELECT rowid FROM bookmarks_fts WHERE bookmarks_fts MATCH ?
           )
           ORDER BY b.created_at DESC`
        )
        .all(req.user.id, ftsQuery);
      bookmarks = ftsRows;
    } else {
      let query = `SELECT b.*, c.name as collection_name, c.color as collection_color
                   FROM bookmarks b
                   LEFT JOIN collections c ON c.id = b.collection_id
                   WHERE b.user_id = ?`;
      const params = [req.user.id];

      if (collection_id) {
        query += ' AND b.collection_id = ?';
        params.push(Number(collection_id));
      }
      if (favorites === '1') {
        query += ' AND b.is_favorite = 1';
      }
      query += ' ORDER BY b.created_at DESC';

      bookmarks = db.prepare(query).all(...params);
    }

    // Filter by tag if needed
    let filtered = bookmarks;
    if (tag) {
      const tagRow = db.prepare('SELECT id FROM tags WHERE name = ? AND user_id = ?').get(tag, req.user.id);
      if (tagRow) {
        const bIds = db
          .prepare(
            'SELECT bookmark_id FROM bookmark_tags WHERE tag_id = ?'
          )
          .all(tagRow.id)
          .map((r) => r.bookmark_id);
        filtered = filtered.filter((b) => bIds.includes(b.id));
      } else {
        filtered = [];
      }
    }

    const result = filtered.map((b) => ({
      ...b,
      is_favorite: b.is_favorite === 1,
      tags: getTagsForBookmark(db, b.id),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/bookmarks/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const bookmark = db
      .prepare(
        `SELECT b.*, c.name as collection_name, c.color as collection_color
         FROM bookmarks b
         LEFT JOIN collections c ON c.id = b.collection_id
         WHERE b.id = ? AND b.user_id = ?`
      )
      .get(req.params.id, req.user.id);

    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

    bookmark.tags = getTagsForBookmark(db, bookmark.id);
    bookmark.is_favorite = bookmark.is_favorite === 1;
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookmarks
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { url, collection_id, tags } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    const meta = await scrapeMetadata(url);

    const result = db
      .prepare(
        `INSERT INTO bookmarks (user_id, url, title, description, favicon, collection_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.user.id,
        url,
        meta.title || url,
        meta.description || null,
        meta.favicon || null,
        collection_id || null
      );

    const bookmarkId = result.lastInsertRowid;

    if (tags && Array.isArray(tags) && tags.length > 0) {
      setTagsForBookmark(db, bookmarkId, tags, req.user.id);
    }

    const bookmark = db
      .prepare(
        `SELECT b.*, c.name as collection_name, c.color as collection_color
         FROM bookmarks b
         LEFT JOIN collections c ON c.id = b.collection_id
         WHERE b.id = ? AND b.user_id = ?`
      )
      .get(bookmarkId, req.user.id);

    bookmark.tags = getTagsForBookmark(db, bookmarkId);
    bookmark.is_favorite = bookmark.is_favorite === 1;

    res.status(201).json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/bookmarks/:id
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { title, description, favicon, collection_id, tags, is_favorite } =
      req.body;

    const existing = db
      .prepare('SELECT id, collection_id FROM bookmarks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Bookmark not found' });

    db.prepare(
      `UPDATE bookmarks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        favicon = COALESCE(?, favicon),
        collection_id = ?,
        is_favorite = COALESCE(?, is_favorite),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    ).run(
      title ?? null,
      description ?? null,
      favicon ?? null,
      collection_id !== undefined ? collection_id : existing.collection_id,
      is_favorite !== undefined ? (is_favorite ? 1 : 0) : null,
      req.params.id,
      req.user.id
    );

    if (tags && Array.isArray(tags)) {
      setTagsForBookmark(db, req.params.id, tags, req.user.id);
    }

    const bookmark = db
      .prepare(
        `SELECT b.*, c.name as collection_name, c.color as collection_color
         FROM bookmarks b
         LEFT JOIN collections c ON c.id = b.collection_id
         WHERE b.id = ? AND b.user_id = ?`
      )
      .get(req.params.id, req.user.id);

    bookmark.tags = getTagsForBookmark(db, bookmark.id);
    bookmark.is_favorite = bookmark.is_favorite === 1;

    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/bookmarks/:id
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db
      .prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    if (result.changes === 0)
      return res.status(404).json({ error: 'Bookmark not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookmarks/:id/visit
router.post('/:id/visit', (req, res) => {
  try {
    const db = getDb();
    const result = db
      .prepare('UPDATE bookmarks SET visits = visits + 1 WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    if (result.changes === 0)
      return res.status(404).json({ error: 'Bookmark not found' });
    const bookmark = db
      .prepare('SELECT visits FROM bookmarks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    res.json({ visits: bookmark.visits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/bookmarks/scrape - preview metadata without saving
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const meta = await scrapeMetadata(url);
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

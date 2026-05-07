const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// GET /api/v1/collections
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const collections = db
      .prepare(
        `SELECT c.*, COUNT(b.id) as bookmark_count
         FROM collections c
         LEFT JOIN bookmarks b ON b.collection_id = c.id
         WHERE c.user_id = ?
         GROUP BY c.id
         ORDER BY c.created_at ASC`
      )
      .all(req.user.id);
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/collections
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const result = db
      .prepare('INSERT INTO collections (user_id, name, color) VALUES (?, ?, ?)')
      .run(req.user.id, name, color || '#6366f1');

    const collection = db
      .prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
      .get(result.lastInsertRowid, req.user.id);

    res.status(201).json({ ...collection, bookmark_count: 0 });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Collection name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/collections/:id
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { name, color } = req.body;

    const existing = db
      .prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!existing)
      return res.status(404).json({ error: 'Collection not found' });

    db.prepare(
      'UPDATE collections SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ? AND user_id = ?'
    ).run(name || null, color || null, req.params.id, req.user.id);

    const updated = db
      .prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    const count = db
      .prepare('SELECT COUNT(*) as c FROM bookmarks WHERE collection_id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    res.json({ ...updated, bookmark_count: count.c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/collections/:id
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db
      .prepare('DELETE FROM collections WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    if (result.changes === 0)
      return res.status(404).json({ error: 'Collection not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// GET /api/v1/tags
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const tags = db
      .prepare(
        `SELECT t.*, COUNT(bt.bookmark_id) as usage_count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.user_id = ?
         GROUP BY t.id
         ORDER BY usage_count DESC`
      )
      .all(req.user.id);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/tags/:id
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db
      .prepare('DELETE FROM tags WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    if (result.changes === 0)
      return res.status(404).json({ error: 'Tag not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

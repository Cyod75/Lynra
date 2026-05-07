const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// GET /api/v1/stats
router.get('/', (req, res) => {
  try {
    const db = getDb();

    const totalBookmarks = db
      .prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?')
      .get(req.user.id).count;

    const totalCollections = db
      .prepare('SELECT COUNT(*) as count FROM collections WHERE user_id = ?')
      .get(req.user.id).count;

    const totalTags = db
      .prepare('SELECT COUNT(*) as count FROM tags WHERE user_id = ?')
      .get(req.user.id).count;

    const topVisited = db
      .prepare(
        `SELECT b.id, b.title, b.url, b.favicon, b.visits
         FROM bookmarks b
         WHERE user_id = ?
         ORDER BY visits DESC
         LIMIT 5`
      )
      .all(req.user.id);

    const topTags = db
      .prepare(
        `SELECT t.id, t.name, COUNT(bt.bookmark_id) as usage_count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.user_id = ?
         GROUP BY t.id
         ORDER BY usage_count DESC
         LIMIT 5`
      )
      .all(req.user.id);

    const bookmarksByDay = db
      .prepare(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM bookmarks
         WHERE user_id = ? AND created_at >= DATE('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      )
      .all(req.user.id);

    res.json({
      totalBookmarks,
      totalCollections,
      totalTags,
      topVisited,
      topTags,
      bookmarksByDay,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

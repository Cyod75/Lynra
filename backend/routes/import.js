const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDb } = require('../database/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/v1/import/html
router.post('/html', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const html = req.file.buffer.toString('utf-8');
    const db   = getDb();

    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url   = match[1].trim();
      const title = match[2].trim();
      if (url && url.startsWith('http')) links.push({ url, title });
    }

    if (links.length === 0) return res.status(400).json({ error: 'No valid links found in the file' });

    const insertStmt = db.prepare(
      `INSERT OR IGNORE INTO bookmarks (user_id, url, title, favicon) VALUES (?, ?, ?, ?)`
    );

    let imported = 0;
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        let favicon = null;
        try {
          const domain = new URL(item.url).hostname;
          favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {}
        const r = insertStmt.run(req.user.id, item.url, item.title || item.url, favicon);
        if (r.changes > 0) imported++;
      }
    });

    insertMany(links);
    res.json({ imported, total: links.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/import/export
// Accepts token via query param for window.open compatibility
router.get('/export', (req, res) => {
  try {
    // Allow token via query param (for direct browser navigation)
    const queryToken = req.query.token;
    if (queryToken) {
      try { jwt.verify(queryToken, JWT_SECRET); }
      catch { return res.status(401).json({ error: 'Invalid token' }); }
    }

    const db = getDb();
    const bookmarks = db.prepare(
      `SELECT b.*, c.name as collection_name FROM bookmarks b
       LEFT JOIN collections c ON c.id = b.collection_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`
    ).all(req.user.id);

    const result = bookmarks.map((b) => {
      const tags = db.prepare(
        `SELECT t.name FROM tags t JOIN bookmark_tags bt ON bt.tag_id = t.id WHERE bt.bookmark_id = ?`
      ).all(b.id).map((t) => t.name);
      return { ...b, tags };
    });

    res.setHeader('Content-Disposition', 'attachment; filename="linra-export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json({ exported_at: new Date().toISOString(), count: result.length, bookmarks: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

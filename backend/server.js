require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { getDb } = require('./database/db');
const { authMiddleware } = require('./middleware/auth');

const authRouter = require('./routes/auth');
const bookmarksRouter = require('./routes/bookmarks');
const collectionsRouter = require('./routes/collections');
const tagsRouter = require('./routes/tags');
const statsRouter = require('./routes/stats');
const importRouter = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB on startup
getDb();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// ── Public routes (no auth) ──────────────────────────────
app.use('/api/v1/auth', authRouter);

// ── Protected routes (require valid JWT) ─────────────────
app.use('/api/v1/bookmarks', authMiddleware, bookmarksRouter);
app.use('/api/v1/collections', authMiddleware, collectionsRouter);
app.use('/api/v1/tags', authMiddleware, tagsRouter);
app.use('/api/v1/stats', authMiddleware, statsRouter);
app.use('/api/v1/import', authMiddleware, importRouter);

// ── Serve frontend in production ─────────────────────────
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Lynra] Server running on http://localhost:${PORT}`);
});

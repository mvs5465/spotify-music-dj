import express from 'express';
import { getDatabase } from '../db/database.js';

const router = express.Router();

// Upsert song record
router.post('/upsert', (req, res) => {
  const { spotify_id, title, artist } = req.body;

  if (!spotify_id || !title || !artist) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO song_metrics (spotify_id, title, artist)
    VALUES (?, ?, ?)
    ON CONFLICT(spotify_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(spotify_id, title, artist);
  res.json({ success: true });
});

// Record play
router.post('/play', (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE song_metrics
    SET play_count = play_count + 1, last_played_at = CURRENT_TIMESTAMP
    WHERE spotify_id = ?
  `);

  stmt.run(spotify_id);
  res.json({ success: true });
});

// Record skip
router.post('/skip', (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE song_metrics
    SET skip_count = skip_count + 1
    WHERE spotify_id = ?
  `);

  stmt.run(spotify_id);
  res.json({ success: true });
});

// Record upvote
router.post('/upvote', (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE song_metrics
    SET upvote_count = upvote_count + 1
    WHERE spotify_id = ?
  `);

  stmt.run(spotify_id);
  res.json({ success: true });
});

// Record downvote
router.post('/downvote', (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE song_metrics
    SET downvote_count = downvote_count + 1
    WHERE spotify_id = ?
  `);

  stmt.run(spotify_id);
  res.json({ success: true });
});

// Get summary
router.get('/summary', (req, res) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT spotify_id, title, artist, play_count, skip_count, upvote_count, downvote_count, last_played_at
    FROM song_metrics
    ORDER BY updated_at DESC
  `);

  const metrics = stmt.all();
  res.json(metrics);
});

export default router;

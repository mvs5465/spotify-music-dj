import express from 'express';
import { runQuery, allQuery } from '../db/database.js';

const router = express.Router();

// Upsert song record
router.post('/upsert', async (req, res) => {
  const { spotify_id, title, artist } = req.body;

  if (!spotify_id || !title || !artist) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await runQuery(`
      INSERT OR IGNORE INTO song_metrics (spotify_id, title, artist)
      VALUES (?, ?, ?)
    `, [spotify_id, title, artist]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record play
router.post('/play', async (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  try {
    await runQuery(`
      UPDATE song_metrics
      SET play_count = play_count + 1, last_played_at = CURRENT_TIMESTAMP
      WHERE spotify_id = ?
    `, [spotify_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record skip
router.post('/skip', async (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  try {
    await runQuery(`
      UPDATE song_metrics
      SET skip_count = skip_count + 1
      WHERE spotify_id = ?
    `, [spotify_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record upvote
router.post('/upvote', async (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  try {
    await runQuery(`
      UPDATE song_metrics
      SET upvote_count = upvote_count + 1
      WHERE spotify_id = ?
    `, [spotify_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record downvote
router.post('/downvote', async (req, res) => {
  const { spotify_id } = req.body;
  if (!spotify_id) return res.status(400).json({ error: 'Missing spotify_id' });

  try {
    await runQuery(`
      UPDATE song_metrics
      SET downvote_count = downvote_count + 1
      WHERE spotify_id = ?
    `, [spotify_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get summary
router.get('/summary', async (req, res) => {
  try {
    const metrics = await allQuery(`
      SELECT spotify_id, title, artist, play_count, skip_count, upvote_count, downvote_count, last_played_at
      FROM song_metrics
      ORDER BY updated_at DESC
    `);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

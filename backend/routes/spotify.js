import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Helper to validate token
function validateToken(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization' });
    return null;
  }
  return authHeader.slice(7);
}

// Search tracks
router.get('/search', async (req, res) => {
  const token = validateToken(req, res);
  if (!token) return;

  const { q, limit = 10 } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
  const token = validateToken(req, res);
  if (!token) return;

  const { seed_artists, seed_genres, seed_tracks, limit = 10 } = req.query;

  try {
    const params = new URLSearchParams({ limit });
    if (seed_artists) params.append('seed_artists', seed_artists);
    if (seed_genres) params.append('seed_genres', seed_genres);
    if (seed_tracks) params.append('seed_tracks', seed_tracks);

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?${params.toString()}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) throw new Error('Recommendations failed');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get track details
router.get('/track/:id', async (req, res) => {
  const token = validateToken(req, res);
  if (!token) return;

  const { id } = req.params;

  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Track lookup failed');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

let appAccessToken = null;
let tokenExpiresAt = 0;

// Get app-level access token via Client Credentials
async function getAppAccessToken() {
  if (appAccessToken && Date.now() < tokenExpiresAt) {
    return appAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get app access token');
  }

  const data = await response.json();
  appAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return appAccessToken;
}

// Helper to validate token (no longer needed, but keep for future)
function validateToken(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization' });
    return null;
  }
  return authHeader.slice(7);
}

// Search tracks (using app-level token)
router.get('/search', async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const token = await getAppAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      throw new Error(`Spotify API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
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

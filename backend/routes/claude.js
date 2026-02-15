import express from 'express';
import fetch from 'node-fetch';
import { getDatabase } from '../db/database.js';

const router = express.Router();

// Build preference context from database
function buildPreferenceContext() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT title, artist, play_count, skip_count, upvote_count, downvote_count
    FROM song_metrics
    ORDER BY play_count DESC, upvote_count DESC
    LIMIT 20
  `);

  const songs = stmt.all();

  if (songs.length === 0) {
    return 'No song history yet.';
  }

  let context = 'User listening history and preferences:\n';
  songs.forEach(song => {
    context += `- "${song.title}" by ${song.artist}: ${song.play_count} plays, ${song.upvote_count} upvotes, ${song.skip_count} skips, ${song.downvote_count} downvotes\n`;
  });

  return context;
}

// Chat endpoint
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const preferenceContext = buildPreferenceContext();
    const enhancedMessage = `${message}\n\n[User Context: ${preferenceContext}]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: enhancedMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Claude API request failed');
    }

    const data = await response.json();
    const reply = data.content[0].text;

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

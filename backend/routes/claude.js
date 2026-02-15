import express from 'express';
import fetch from 'node-fetch';
import { allQuery } from '../db/database.js';

const router = express.Router();

// Build preference context from database
async function buildPreferenceContext() {
  const songs = await allQuery(`
    SELECT title, artist, play_count, skip_count, upvote_count, downvote_count
    FROM song_metrics
    ORDER BY play_count DESC, upvote_count DESC
    LIMIT 20
  `);

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
    const preferenceContext = await buildPreferenceContext();
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
        system: `You are a Music DJ assistant for a Spotify music app. Your role is to:
1. Recommend songs and artists based on user requests and their listening history
2. Help users discover new music matching their taste
3. Provide song suggestions when asked
4. Acknowledge user preferences and tailor recommendations accordingly

Be conversational, enthusiastic about music, and provide specific song/artist recommendations. When users ask for recommendations, suggest real songs with artist names that can be searched on Spotify.`,
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

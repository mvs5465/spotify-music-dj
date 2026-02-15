# Spotify Music DJ

A localhost app that integrates with Claude AI and Spotify to create an intelligent DJ experience. Chat with the AI to select songs, control playback, and let it learn your music preferences over time.

## Features

- **AI-Powered DJ**: Chat with Claude to request songs, artists, or moods
- **Smart Learning**: Tracks your skips, upvotes, downvotes, and play history
- **Full Playback Control**: Play, pause, skip, rewind, adjust volume
- **Preference Tracking**: Analyzes your music habits to improve recommendations
- **Localhost App**: Private, personal music experience

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: SQLite (local preference tracking)
- **AI**: Claude API
- **Music Service**: Spotify Web API

## Project Status

### Complete
- [x] Project initialization
- [x] README & CLAUDE.md setup
- [x] Backend setup (Node.js + Express)
- [x] Database schema for preference tracking
- [x] Spotify API authentication (PKCE) & integration
- [x] Claude API integration for chat
- [x] Frontend setup (React + Vite)
- [x] Song metric tracking UI
- [x] Chat interface with recommendations
- [x] Preference learning system

### In Progress
- [ ] Testing and refinement
- [ ] Deployment setup

### Backlog
- [ ] Spotify Web Playback SDK integration (Premium feature)
- [ ] Playlist export
- [ ] Advanced preference analysis
- [ ] Mobile responsive improvements

## Metrics Tracked

All songs tracked with:
- **Play Count**: How many times selected/played
- **Skip Count**: Times user skipped
- **Upvote/Downvote**: User preference signals
- **Last Played**: Timestamp of last interaction
- **Artist/Genre**: For pattern analysis

## Setup

1. **Get API Keys**
   - [Spotify Developer Dashboard](https://developer.spotify.com/dashboard): Create app, get Client ID & Secret
   - [Anthropic Console](https://console.anthropic.com): Get API key

2. **Install Dependencies**
   ```bash
   cd ~/projects/spotify-music-dj
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

4. **Run**
   - **Development**: `npm run dev` → http://localhost:5173
   - **Build**: `npm run build`
   - **Production**: `npm start`

## Usage

1. Open http://localhost:5173 (dev) or http://localhost:8080 (prod)
2. Click "Login with Spotify" and authorize
3. Chat with the DJ: "recommend something upbeat" or "suggest a song like [artist]"
4. Use Play, Skip, 👍, 👎 buttons to track preferences
5. DJ learns your taste and improves recommendations over time

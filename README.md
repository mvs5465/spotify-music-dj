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
- [ ] Spotify Web Playback SDK integration (requires Premium)
- [ ] Testing and refinement

### Backlog
- [ ] Playlist export
- [ ] Advanced preference analysis
- [ ] Mobile responsive improvements
- [ ] Deployment setup

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

1. Open http://127.0.0.1:5173 (use IP, not localhost)
2. Click "Login with Spotify" and authorize with your account
3. Chat with the DJ: "recommend something upbeat" or "suggest jazz"
4. Click "Play" on any song to open in Spotify
5. Use Skip, 👍, 👎 buttons to track preferences
6. DJ learns your taste and improves recommendations over time

## Current Limitations

- **Playback Control**: Requires Spotify Premium for embedded playback. Free tier opens songs in Spotify web/app.
- **IP Access**: Use `http://127.0.0.1:5173` (not `localhost`) due to Spotify auth requirements
- **App Registration**: Must add your Spotify account to the app in developer dashboard for search to work

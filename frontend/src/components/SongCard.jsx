import React from 'react';

export default function SongCard({ song, onPlay, onSkip, onUpvote, onDownvote, onSelect }) {
  const handlePlay = async () => {
    // Upsert song metrics
    await fetch('/api/metrics/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotify_id: song.id,
        title: song.name,
        artist: song.artists[0].name
      })
    });

    // Record play
    await fetch('/api/metrics/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotify_id: song.id })
    });

    // Open in Spotify
    window.open(song.external_urls.spotify, '_blank');
    onSelect?.(song);
    onPlay?.();
  };

  const handleSkip = async () => {
    await fetch('/api/metrics/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotify_id: song.id })
    });
    onSkip?.();
  };

  const handleUpvote = async () => {
    await fetch('/api/metrics/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotify_id: song.id })
    });
    onUpvote?.();
  };

  const handleDownvote = async () => {
    await fetch('/api/metrics/downvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotify_id: song.id })
    });
    onDownvote?.();
  };

  return (
    <div className="song-card">
      {song.album?.images?.[0] && (
        <img src={song.album.images[0].url} alt={song.name} className="song-image" />
      )}
      <div className="song-info">
        <h3>{song.name}</h3>
        <p>{song.artists.map(a => a.name).join(', ')}</p>
        <div className="song-actions">
          <button onClick={handlePlay} className="btn-play">Play</button>
          <button onClick={handleSkip} className="btn-skip">Skip</button>
          <button onClick={handleUpvote} className="btn-upvote">👍</button>
          <button onClick={handleDownvote} className="btn-downvote">👎</button>
        </div>
      </div>
    </div>
  );
}

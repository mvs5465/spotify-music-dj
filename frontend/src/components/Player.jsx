import React, { useEffect, useState } from 'react';

export default function Player({ accessToken, currentSong }) {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!accessToken || !window.Spotify) return;

    const initPlayer = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Spotify Music DJ',
        getOAuthToken: callback => callback(accessToken),
        volume: 0.5
      });

      spotifyPlayer.addListener('player_state_changed', state => {
        if (state) {
          setIsPlaying(!state.paused);
        }
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Player ready with device ID:', device_id);
        setIsReady(true);
        localStorage.setItem('spotify_device_id', device_id);
      });

      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Player initialization error:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Player account error:', message);
      });

      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log('Player connected successfully');
        }
      });

      setPlayer(spotifyPlayer);
    };

    // If SDK is already loaded, init immediately
    if (window.Spotify && window.Spotify.Player) {
      initPlayer();
    } else {
      // Otherwise wait for SDK ready callback
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      // Cleanup
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  useEffect(() => {
    if (!player || !isReady || !currentSong) return;

    const playSong = async () => {
      const deviceId = localStorage.getItem('spotify_device_id');
      if (!deviceId) return;

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uris: [`spotify:track:${currentSong.id}`]
            })
          }
        );

        if (!response.ok) {
          console.error('Failed to play song');
        }
      } catch (error) {
        console.error('Play error:', error);
      }
    };

    playSong();
  }, [player, isReady, currentSong, accessToken]);

  const handlePlayPause = () => {
    if (!player) return;
    player.togglePlay();
  };

  const handleNext = () => {
    if (!player) return;
    player.nextTrack();
  };

  const handlePrevious = () => {
    if (!player) return;
    player.previousTrack();
  };

  return (
    <div className="player-widget">
      {!isReady && <p className="player-status">Player requires Spotify Premium...</p>}
      {isReady && currentSong && (
        <div className="now-playing">
          <img src={currentSong.album?.images?.[0]?.url} alt={currentSong.name} />
          <div className="track-info">
            <h2>{currentSong.name}</h2>
            <p>{currentSong.artists?.[0]?.name}</p>
          </div>
          <div className="player-controls">
            <button onClick={handlePrevious} className="control-btn">⏮</button>
            <button onClick={handlePlayPause} className="control-btn play-btn">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={handleNext} className="control-btn">⏭</button>
          </div>
        </div>
      )}
      {isReady && !currentSong && (
        <p className="player-status">Select a song to play</p>
      )}
    </div>
  );
}

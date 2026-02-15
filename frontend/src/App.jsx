import React, { useState, useEffect } from 'react';
import SpotifyAuth from './components/SpotifyAuth';
import Chat from './components/Chat';

// Define callback before SDK loads
window.onSpotifyWebPlaybackSDKReady = () => {
  // SDK ready, will be handled in Player component
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expires');

    if (token && expiresAt) {
      if (Date.now() < parseInt(expiresAt)) {
        setAccessToken(token);
        setIsAuthenticated(true);
      } else {
        // Token expired, refresh it
        refreshToken();
      }
    }
  }, []);

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('spotify_refresh_token');
    if (!refreshTokenValue) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTokenValue })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expires', Date.now() + data.expires_in * 1000);
        setAccessToken(data.access_token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
    }
  };

  // Auto-refresh token when about to expire
  useEffect(() => {
    if (!accessToken) return;

    const expiresAt = parseInt(localStorage.getItem('spotify_token_expires') || '0');
    const timeUntilExpiry = expiresAt - Date.now();
    const refreshIn = Math.max(timeUntilExpiry - 60000, 1000); // Refresh 1 min before expiry

    const timer = setTimeout(() => {
      refreshToken();
    }, refreshIn);

    return () => clearTimeout(timer);
  }, [accessToken]);

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires');
    setIsAuthenticated(false);
    setAccessToken(null);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <SpotifyAuth onAuthenticated={() => setIsAuthenticated(true)} />
      ) : (
        <div className="app-container">
          <header className="app-header">
            <h1>Spotify Music DJ</h1>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </header>
          <div className="main-content">
            <Chat accessToken={accessToken} />
          </div>
        </div>
      )}
    </div>
  );
}

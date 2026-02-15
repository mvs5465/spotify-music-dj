import React, { useEffect, useState } from 'react';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/callback`;
const SCOPES = ['user-read-private', 'user-read-email', 'user-library-read'];

export default function SpotifyAuth({ onAuthenticated }) {
  const [loading, setLoading] = useState(false);

  // Check for callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      const storedState = sessionStorage.getItem('spotify_auth_state');
      const codeVerifier = sessionStorage.getItem('spotify_code_verifier');

      if (state === storedState && codeVerifier) {
        exchangeCode(code, codeVerifier);
      }
    }
  }, []);

  function generateRandomString(length) {
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray
      .map(b => String.fromCharCode(b))
      .join('');
    return btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async function handleLogin() {
    setLoading(true);
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(16);

    sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    sessionStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async function exchangeCode(code, codeVerifier) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier
        })
      });

      if (!response.ok) throw new Error('Token exchange failed');

      const data = await response.json();
      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
      localStorage.setItem('spotify_token_expires', Date.now() + data.expires_in * 1000);

      sessionStorage.removeItem('spotify_code_verifier');
      sessionStorage.removeItem('spotify_auth_state');

      window.history.replaceState({}, document.title, window.location.pathname);
      onAuthenticated();
    } catch (error) {
      console.error('Auth error:', error);
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h1>Spotify Music DJ</h1>
      <p>Connect your Spotify account to get AI-powered song recommendations</p>
      <button onClick={handleLogin} disabled={loading} className="auth-button">
        {loading ? 'Connecting...' : 'Login with Spotify'}
      </button>
    </div>
  );
}

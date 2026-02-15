import React, { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';
import Player from './Player';

export default function Chat({ accessToken }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, recommendations]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Chat with Claude
      const chatResponse = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!chatResponse.ok) throw new Error('Chat request failed');
      const chatData = await chatResponse.json();

      setMessages(prev => [...prev, { role: 'assistant', content: chatData.reply }]);

      // Extract song titles from Claude's response
      // Look for patterns like **"Song Name"** by Artist or "Song Name" by Artist
      const songPattern = /\*\*"([^"]+)"\*\*\s*(?:by|-)\s*([^\n,]+)|"([^"]+)"\s*(?:by|-)\s*([^\n,]+)/g;
      const matches = [...chatData.reply.matchAll(songPattern)];

      if (matches.length > 0) {
        // Extract unique song/artist pairs
        const queries = [];
        matches.forEach(match => {
          const songName = match[1] || match[3];
          const artist = match[2] || match[4];
          if (songName) {
            queries.push(`${songName} ${artist ? artist.trim() : ''}`.trim());
          }
        });

        // Search for the first few recommendations
        if (queries.length > 0) {
          const searchQuery = queries[0];
          const searchResponse = await fetch(
            `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=8`
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.tracks?.items?.length > 0) {
              setRecommendations(searchData.tracks.items);
            }
          } else {
            console.error('Search failed:', await searchResponse.json());
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-section">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="message message-assistant">Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask the DJ for recommendations..."
            disabled={loading}
          />
          <button onClick={handleSendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>

      <div className="player-section">
        <Player accessToken={accessToken} currentSong={currentSong} />
        {recommendations.length > 0 ? (
          <div className="recommendations">
            <h3>Up Next</h3>
            <div className="song-list">
              {recommendations.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={setCurrentSong}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-player">
            <p>Ask the DJ for recommendations to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

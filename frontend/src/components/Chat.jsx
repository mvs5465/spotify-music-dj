import React, { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';

export default function Chat({ accessToken }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
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

      // Try to extract song requests from Claude's response
      // Look for patterns like "recommend", "suggest", "how about", etc.
      const shouldSearchMusic =
        userMessage.toLowerCase().includes('recommend') ||
        userMessage.toLowerCase().includes('suggest') ||
        userMessage.toLowerCase().includes('song') ||
        userMessage.toLowerCase().includes('music') ||
        userMessage.toLowerCase().includes('what');

      if (shouldSearchMusic) {
        // Extract search query from user message
        const query = userMessage
          .replace(/recommend|suggest|how about|what|song|music/gi, '')
          .trim();

        if (query && query.length > 2) {
          const searchResponse = await fetch(
            `/api/spotify/search?q=${encodeURIComponent(query)}&limit=5`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.tracks?.items?.length > 0) {
              setRecommendations(searchData.tracks.items);
            }
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
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message message-assistant">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>Recommendations</h3>
          <div className="song-list">
            {recommendations.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

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
  );
}

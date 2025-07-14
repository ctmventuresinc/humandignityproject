'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [tweet, setTweet] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleTweet() {
    if (!tweet.trim()) return;
    
    setIsPosting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweet }),
      });

      if (response.ok) {
        setMessage('Tweet posted successfully!');
        setTweet('');
      } else {
        const error = await response.text();
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      setMessage('Failed to post tweet. Please try again.');
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Dashboard</h1>
      <p>Welcome! You can now post to X from here.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="What's happening?"
          style={{
            width: '100%',
            height: '120px',
            padding: '1rem',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          maxLength={280}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1rem'
        }}>
          <span style={{ 
            color: tweet.length > 260 ? '#ff0000' : '#666',
            fontSize: '14px'
          }}>
            {tweet.length}/280
          </span>
          
          <button
            onClick={handleTweet}
            disabled={isPosting || !tweet.trim() || tweet.length > 280}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: isPosting || !tweet.trim() || tweet.length > 280 ? '#ccc' : '#1da1f2',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: isPosting || !tweet.trim() || tweet.length > 280 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
        
        {message && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6f7ff',
            color: message.includes('Error') ? '#cc0000' : '#0066cc',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

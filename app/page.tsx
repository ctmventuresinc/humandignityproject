'use client';

export default function Home() {
  async function signIn() {
    const r = await fetch('/api/auth/login');
    const { url } = await r.json();
    window.location.href = url;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '2rem'
    }}>
      <h1>Human Dignity Project</h1>
      <p>Connect with X to share your thoughts and posts</p>
      <button 
        onClick={signIn}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#1da1f2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0d8bd9'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1da1f2'}
      >
        Sign in with X
      </button>
    </div>
  );
}

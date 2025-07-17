import React from 'react';

interface ModeToggleProps {
  isDuoMode: boolean;
  onToggle: (isDuoMode: boolean) => void;
}

export default function ModeToggle({ isDuoMode, onToggle }: ModeToggleProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '0px',
      right: '0px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: '20px',
      backgroundColor: 'transparent'
    }}>
      <span style={{
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)',
        fontFamily: 'var(--font-cormorant), serif'
      }}>
        singleplayer
      </span>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isDuoMode}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ display: 'none' }}
        />
        <div style={{
          width: '50px',
          height: '24px',
          backgroundColor: isDuoMode ? '#00FFFF' : '#006666',
          borderRadius: '25px',
          position: 'relative',
          transition: 'background-color 0.3s',
          border: '2px solid #00FFFF'
        }}>
          <div style={{
            width: '18px',
            height: '18px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '1px',
            left: isDuoMode ? '28px' : '1px',
            transition: 'left 0.3s'
          }} />
        </div>
      </label>
      <span style={{
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)',
        fontFamily: 'var(--font-cormorant), serif'
      }}>
        multiplayer
      </span>
    </div>
  );
}

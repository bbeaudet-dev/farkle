import React from 'react';

interface MainMenuProps {
  onStartSinglePlayer: () => void;
  onStartMultiplayer: () => void;
  isLoading: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartSinglePlayer,
  onStartMultiplayer,
  isLoading
}) => {
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '100px auto', 
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>Rollio</h1>
      <p>The multiplayer dice-rolling roguelike</p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        marginTop: '40px'
      }}>
        <button 
          onClick={onStartSinglePlayer} 
          disabled={isLoading}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            fontWeight: 'bold'
          }}
        >
          🎲 Play Single Player
        </button>
        
        <button 
          onClick={onStartMultiplayer} 
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🌐 Play Multiplayer
        </button>
      </div>
    </div>
  );
}; 
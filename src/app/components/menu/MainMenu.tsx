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
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '80px auto',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <h1 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#2c3e50'
      }}>
        Rollio
      </h1>
      
      <p style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '40px'
      }}>
        Multiplayer dice game
      </p>
      
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
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            fontFamily: 'Arial, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          Single Player
        </button>
        
        <button 
          onClick={onStartMultiplayer} 
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            fontFamily: 'Arial, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e7e34';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28a745';
          }}
        >
          Multiplayer
        </button>
      </div>
    </div>
  );
}; 
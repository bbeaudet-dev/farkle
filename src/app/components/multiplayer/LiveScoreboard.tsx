import React from 'react';

interface Player {
  id: string;
  username: string;
  gameScore: number;
}

interface LiveScoreboardProps {
  players: Player[];
  currentPlayerId: string;
  activePlayerIds: string[];
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  players,
  currentPlayerId,
  activePlayerIds
}) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px'
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>🏆 Live Scoreboard</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {players.map((player) => {
          const isActivePlayer = activePlayerIds.includes(player.id);
          const isCurrentPlayer = player.id === currentPlayerId;
          
          return (
            <div
              key={player.id}
              style={{
                padding: '8px',
                backgroundColor: isCurrentPlayer ? '#e3f2fd' : '#fff',
                border: isCurrentPlayer ? '2px solid #2196f3' : '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isActivePlayer ? 1 : 0.6
              }}
            >
              <span style={{ fontWeight: isCurrentPlayer ? 'bold' : 'normal' }}>
                {player.username} {isCurrentPlayer ? '(You)' : ''}
                {!isActivePlayer && ' (Spectating)'}
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {player.gameScore}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
import React from 'react';

interface GameStatusProps {
  status: {
    roundNumber: number;
    rollNumber: number;
    roundPoints: number;
    gameScore: number;
    consecutiveFlops: number;
    hotDiceCount: number;
    totalRolls: number;
    money: number;
  };
}

export const GameStatus: React.FC<GameStatusProps> = ({ status }) => {
  return (
    <div>
      <div style={{ 
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <div><strong>Game score:</strong> {status.gameScore}</div>
        <div><strong>Money:</strong> ${status.money}</div>   
      </div>
    </div>
  );
}; 
import React from 'react';

interface GameStatusProps {
  roundNumber: number;
  rollNumber: number;
  roundPoints: number;
  gameScore: number;
  consecutiveFlops: number;
  hotDiceCount: number;
  totalRolls: number;
  money: number;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  roundNumber,
  rollNumber,
  roundPoints,
  gameScore,
  consecutiveFlops,
  hotDiceCount,
  totalRolls,
  money
}) => {
  return (
    <div>
      <div style={{ 
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <div><strong>Game score:</strong> {gameScore}</div>
        <div><strong>Money:</strong> ${money}</div>   
      </div>
    </div>
  );
}; 
import React from 'react';

interface GameStatusProps {
  gameScore: number;
  roundNumber: number;
  rollNumber: number;
  roundPoints: number;
  className?: string;
}

export const GameStatus: React.FC<GameStatusProps> = ({ 
  gameScore, 
  roundNumber, 
  rollNumber, 
  roundPoints,
  className = ''
}) => {
  return (
    <div className={`mb-6 p-4 border-2 border-terminal-border bg-terminal-input ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          Game Score: <span className="font-bold">{gameScore}</span>
        </div>
        <div>
          Round: <span className="font-bold">{roundNumber}</span>
        </div>
        <div>
          Roll: <span className="font-bold">{rollNumber}</span>
        </div>
        <div>
          Round Points: <span className="font-bold">{roundPoints}</span>
        </div>
      </div>
    </div>
  );
}; 
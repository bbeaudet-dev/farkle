import React from 'react';

interface RoundSummaryProps {
  roundNumber: number;
  pointsBanked: number;
  pointsForfeited: number;
  consecutiveFlops: number;
  flopPenalty: number;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({ 
  roundNumber, 
  pointsBanked, 
  pointsForfeited, 
  consecutiveFlops, 
  flopPenalty 
}) => {
  return (
    <div>
      <h3>📊 ROUND {roundNumber} SUMMARY</h3>
      <div style={{ 
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        {pointsForfeited > 0 && (
          <div>Points forfeited: -{pointsForfeited}</div>
        )}
        {flopPenalty > 0 && (
          <div>Flop penalty: -{flopPenalty}</div>
        )}
        {pointsBanked > 0 && (
          <div>Points banked: +{pointsBanked}</div>
        )}
        {consecutiveFlops > 0 && (
          <div>Consecutive flops: {consecutiveFlops}</div>
        )}
      </div>
    </div>
  );
}; 
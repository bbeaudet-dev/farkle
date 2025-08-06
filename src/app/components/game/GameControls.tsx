import React from 'react';
import { Button } from '../ui/Button';

interface GameControlsProps {
  // Regular controls
  onRoll: () => void;
  onBank: () => void;
  canRoll: boolean;
  canBank: boolean;
  canReroll: boolean;
  diceToReroll: number;
  gameState: any;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRoll,
  onBank,
  canRoll,
  canBank,
  canReroll,
  diceToReroll,
  gameState
}) => {
  // Determine roll button text based on context
  const getRollButtonText = () => {
    if (canRoll) {
      // Starting a new round (including after flop)
      return 'Start New Round';
    } else if (canReroll) {
      // For hot dice (0 dice remaining), show full dice set size
      const diceCount = diceToReroll === 0 ? gameState.diceSet.length : diceToReroll;
      return <>Reroll<br/>({diceCount} dice)</>;
    }
    // Fallback
    return 'Roll Dice';
  };

  return (
    <div style={{ marginTop: '15px' }}>
      
      {/* Regular Game Controls */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button onClick={onRoll} disabled={!canRoll && !canReroll}>
          {getRollButtonText()}
        </Button>
        
        <Button onClick={onBank} disabled={!canBank}>
          Bank Points
        </Button>
      </div>
    </div>
  );
}; 